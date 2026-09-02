import { useState, useEffect, useRef } from 'react';
import { 
  fetchTelemetrySnapshot, 
  fetchAlerts, 
  subscribeToTelemetryStream,
  triggerSyntheticAnomaly 
} from '../services/telemetryService';

// Default static fallback telemetry snapshot when backend is offline
const MOCK_FALLBACK_TELEMETRY = {
  timestamp: new Date().toISOString(),
  total_grid_import_kw: 90.0,
  total_solar_generation_kw: 380.0,
  total_campus_demand_kw: 420.0,
  battery_net_kw: -140.0,
  nodes: [
    {
      node_id: "NODE_SOLAR_01",
      node_name: "Rooftop Solar Substation",
      node_type: "SOLAR_SUBSTATION",
      voltage_v: 230.2,
      current_a: 955.4,
      power_factor: 0.98,
      active_power_kw: 380.0,
      reactive_power_kvar: 76.8,
      frequency_hz: 50.01,
      status: "NORMAL",
      soc_percentage: null
    },
    {
      node_id: "NODE_BESS_02",
      node_name: "Central BESS 500kWh Hub",
      node_type: "BESS_STORAGE",
      voltage_v: 230.1,
      current_a: 351.4,
      power_factor: 0.99,
      active_power_kw: -140.0,
      reactive_power_kvar: 7.0,
      frequency_hz: 50.00,
      status: "NORMAL",
      soc_percentage: 84.0
    },
    {
      node_id: "NODE_CAMPUS_03",
      node_name: "Campus Main Feeder & HVAC",
      node_type: "CAMPUS_MAIN_FEEDER",
      voltage_v: 229.8,
      current_a: 1096.2,
      power_factor: 0.94,
      active_power_kw: 420.0,
      reactive_power_kvar: 152.4,
      frequency_hz: 49.99,
      status: "NORMAL",
      soc_percentage: null
    }
  ],
  active_alerts: []
};

const MOCK_FALLBACK_ALERTS = [
  {
    alert_id: "ALT-MOCK-1",
    timestamp: new Date().toISOString(),
    node_id: "NODE_SOLAR_01",
    node_name: "Rooftop Solar Substation",
    severity: "WARNING",
    anomaly_type: "VOLTAGE_SAG",
    message: "Transient voltage sag detected on Feeder PV-1 (198.4V < 200.0V)",
    metric_value: 198.4,
    threshold_value: 200.0,
    unit: "V",
    mitigation_action: "BESS VAR support engaged automatically"
  },
  {
    alert_id: "ALT-MOCK-2",
    timestamp: new Date(Date.now() - 15000).toISOString(),
    node_id: "NODE_CAMPUS_03",
    node_name: "Campus Main Feeder & HVAC",
    severity: "CRITICAL",
    anomaly_type: "LINE_OVERLOAD",
    message: "Peak demand spike approaching MDC contract limit (495kW / 500kW)",
    metric_value: 495.0,
    threshold_value: 500.0,
    unit: "kW",
    mitigation_action: "Autonomous peak-shaving dispatch initiated"
  }
];

export function useLiveTelemetry() {
  const [telemetry, setTelemetry] = useState(MOCK_FALLBACK_TELEMETRY);
  const [alerts, setAlerts] = useState(MOCK_FALLBACK_ALERTS);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isBackendOnline, setIsBackendOnline] = useState(false);
  const [historyBuffer, setHistoryBuffer] = useState([]);
  const reconnectTimeoutRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    async function checkBackend() {
      const snap = await fetchTelemetrySnapshot();
      if (snap && isMounted) {
        setTelemetry(snap);
        setIsBackendOnline(true);
        setIsConnected(true);
        if (snap.active_alerts) {
          setActiveAlerts(snap.active_alerts);
        }
      } else if (isMounted) {
        setIsBackendOnline(false);
        setIsConnected(false);
        // Retain fallback mock data when offline
        setTelemetry((prev) => prev || MOCK_FALLBACK_TELEMETRY);
      }

      const alertRes = await fetchAlerts(15);
      if (alertRes && alertRes.alerts && isMounted) {
        setAlerts(alertRes.alerts);
      } else if (isMounted) {
        setAlerts(MOCK_FALLBACK_ALERTS);
      }
    }

    checkBackend();

    // Setup SSE Live Stream
    const unsubscribe = subscribeToTelemetryStream(
      (data) => {
        if (!isMounted) return;
        setTelemetry(data);
        setIsConnected(true);
        setIsBackendOnline(true);
        if (data.active_alerts) {
          setActiveAlerts(data.active_alerts);
        }

        // Add to historical buffer (keep last 30 1-sec ticks)
        setHistoryBuffer((prev) => {
          const timeLabel = new Date(data.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
          });
          const newPoint = {
            time: timeLabel,
            solar: data.total_solar_generation_kw,
            demand: data.total_campus_demand_kw,
            grid: data.total_grid_import_kw,
            battery: data.battery_net_kw,
            unoptimizedGrid: data.total_campus_demand_kw,
            optimizedGrid: data.total_grid_import_kw,
          };
          const updated = [...prev, newPoint];
          return updated.slice(-30);
        });
      },
      (error) => {
        if (!isMounted) return;
        setIsConnected(false);
        setIsBackendOnline(false);
        // Retry connection in 5 seconds
        reconnectTimeoutRef.current = setTimeout(checkBackend, 5000);
      }
    );

    // Refresh historical alerts periodically if backend is connected
    const alertInterval = setInterval(async () => {
      const alertRes = await fetchAlerts(15);
      if (alertRes && alertRes.alerts && isMounted) {
        setAlerts(alertRes.alerts);
      }
    }, 4000);

    return () => {
      isMounted = false;
      unsubscribe();
      clearInterval(alertInterval);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, []);

  const triggerAnomaly = async (type = 'VOLTAGE_SAG', duration = 5) => {
    if (isBackendOnline) {
      return await triggerSyntheticAnomaly(type, duration);
    } else {
      // Simulate synthetic trigger locally when backend is offline
      const syntheticAlert = {
        alert_id: `ALT-LOCAL-${Date.now()}`,
        timestamp: new Date().toISOString(),
        node_id: "NODE_SOLAR_01",
        node_name: "Rooftop Solar Array PV-1",
        severity: "CRITICAL",
        anomaly_type: type,
        message: `Synthetic ${type} simulated in local fallback mode.`,
        metric_value: type === 'VOLTAGE_SAG' ? 189.5 : 540.0,
        threshold_value: type === 'VOLTAGE_SAG' ? 200.0 : 500.0,
        unit: type === 'VOLTAGE_SAG' ? 'V' : 'kW',
        mitigation_action: "BESS Reactive Power support dispatched"
      };
      setAlerts((prev) => [syntheticAlert, ...prev]);
      return { status: "SIMULATED_LOCAL" };
    }
  };

  return {
    telemetry: telemetry || MOCK_FALLBACK_TELEMETRY,
    alerts: alerts.length > 0 ? alerts : MOCK_FALLBACK_ALERTS,
    activeAlerts,
    isConnected,
    isBackendOnline,
    historyBuffer,
    triggerAnomaly
  };
}
