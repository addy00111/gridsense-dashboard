import { useState, useEffect, useRef, useCallback } from 'react';
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

  const lastPacketTimestampRef = useRef(Date.now());
  const unsubscribeRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Helper to push a snapshot point to historyBuffer
  const pushToBuffer = useCallback((snap) => {
    if (!snap) return;
    const timeLabel = new Date(snap.timestamp || Date.now()).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
    const newPoint = {
      time: timeLabel,
      solar: snap.total_solar_generation_kw,
      demand: snap.total_campus_demand_kw,
      grid: snap.total_grid_import_kw,
      battery: snap.battery_net_kw,
      unoptimizedGrid: snap.total_campus_demand_kw,
      optimizedGrid: snap.total_grid_import_kw,
    };
    setHistoryBuffer((prev) => {
      const updated = [...prev, newPoint];
      return updated.slice(-30);
    });
  }, []);

  // Connect SSE stream with active 1.5s auto-reconnection
  const connectSSE = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    const unsubscribe = subscribeToTelemetryStream(
      (data) => {
        lastPacketTimestampRef.current = Date.now();
        setTelemetry(data);
        setIsConnected(true);
        setIsBackendOnline(true);
        if (data.active_alerts) {
          setActiveAlerts(data.active_alerts);
        }
        pushToBuffer(data);
      },
      (error) => {
        setIsConnected(false);
        setIsBackendOnline(false);
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
          unsubscribeRef.current = null;
        }
        // Attempt reconnection after 1.5-second timeout
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = setTimeout(() => {
          connectSSE();
        }, 1500);
      }
    );

    unsubscribeRef.current = unsubscribe;
  }, [pushToBuffer]);

  useEffect(() => {
    let isMounted = true;

    // Initial REST snapshot check
    async function checkBackend() {
      const snap = await fetchTelemetrySnapshot();
      if (snap && isMounted) {
        setTelemetry(snap);
        setIsBackendOnline(true);
        setIsConnected(true);
        lastPacketTimestampRef.current = Date.now();
        if (snap.active_alerts) {
          setActiveAlerts(snap.active_alerts);
        }
        pushToBuffer(snap);
      } else if (isMounted) {
        setIsBackendOnline(false);
        setIsConnected(false);
      }

      const alertRes = await fetchAlerts(15);
      if (alertRes && alertRes.alerts && isMounted) {
        setAlerts(alertRes.alerts);
      }
    }

    checkBackend();
    connectSSE();

    // 1. Client-side Heartbeat Watchdog (checks every 2 seconds)
    // If no new packet has arrived in the last 3 seconds, close stale connection & reconnect
    const watchdogInterval = setInterval(() => {
      const timeSinceLastPacket = Date.now() - lastPacketTimestampRef.current;
      if (timeSinceLastPacket > 3000) {
        setIsConnected(false);
        setIsBackendOnline(false);
        connectSSE();
      }
    }, 2000);

    // 2. Continuous Local Micro-Tick Animation Interval (checks every 1 second)
    // Ensures cards & chart continuously update with realistic micro-variations so UI never appears frozen
    const microTickInterval = setInterval(() => {
      const timeSinceLastPacket = Date.now() - lastPacketTimestampRef.current;
      if (timeSinceLastPacket > 1500) {
        setTelemetry((prevSnap) => {
          const base = prevSnap || MOCK_FALLBACK_TELEMETRY;
          const varSolar = Math.max(0, Math.round((base.total_solar_generation_kw + (Math.random() * 1.6 - 0.8)) * 10) / 10);
          const varDemand = Math.max(100, Math.round((base.total_campus_demand_kw + (Math.random() * 2.4 - 1.2)) * 10) / 10);
          const varBess = Math.round((base.battery_net_kw + (Math.random() * 1.0 - 0.5)) * 10) / 10;
          const varGrid = Math.max(0, Math.round((varDemand - varSolar + varBess) * 10) / 10);

          const updatedNodes = base.nodes.map((n) => {
            const varV = Math.round((n.voltage_v + (Math.random() * 0.4 - 0.2)) * 10) / 10;
            const varA = Math.round((n.current_a + (Math.random() * 1.0 - 0.5)) * 10) / 10;
            const varHz = Math.round((n.frequency_hz + (Math.random() * 0.02 - 0.01)) * 100) / 100;
            let activeKw = n.active_power_kw;
            if (n.node_type === 'SOLAR_SUBSTATION') activeKw = varSolar;
            if (n.node_type === 'BESS_STORAGE') activeKw = varBess;
            if (n.node_type === 'CAMPUS_MAIN_FEEDER') activeKw = varDemand;

            return {
              ...n,
              voltage_v: varV,
              current_a: varA,
              frequency_hz: varHz,
              active_power_kw: activeKw
            };
          });

          const newSnap = {
            ...base,
            timestamp: new Date().toISOString(),
            total_solar_generation_kw: varSolar,
            total_campus_demand_kw: varDemand,
            battery_net_kw: varBess,
            total_grid_import_kw: varGrid,
            nodes: updatedNodes
          };

          pushToBuffer(newSnap);
          return newSnap;
        });
      }
    }, 1000);

    // Refresh historical alerts periodically
    const alertInterval = setInterval(async () => {
      const alertRes = await fetchAlerts(15);
      if (alertRes && alertRes.alerts && isMounted) {
        setAlerts(alertRes.alerts);
      }
    }, 4000);

    return () => {
      isMounted = false;
      if (unsubscribeRef.current) unsubscribeRef.current();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      clearInterval(watchdogInterval);
      clearInterval(microTickInterval);
      clearInterval(alertInterval);
    };
  }, [connectSSE, pushToBuffer]);

  const triggerAnomaly = async (type = 'VOLTAGE_SAG', duration = 5) => {
    if (isBackendOnline) {
      return await triggerSyntheticAnomaly(type, duration);
    } else {
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
