import { useState, useEffect, useRef } from 'react';
import { 
  fetchTelemetrySnapshot, 
  fetchAlerts, 
  subscribeToTelemetryStream,
  triggerSyntheticAnomaly 
} from '../services/telemetryService';

export function useLiveTelemetry() {
  const [telemetry, setTelemetry] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isBackendOnline, setIsBackendOnline] = useState(false);
  const [historyBuffer, setHistoryBuffer] = useState([]);
  const reconnectTimeoutRef = useRef(null);

  // Polling initial snapshot + alerts
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
      }

      const alertRes = await fetchAlerts(15);
      if (alertRes && alertRes.alerts && isMounted) {
        setAlerts(alertRes.alerts);
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
        // Retry connection in 5 seconds
        reconnectTimeoutRef.current = setTimeout(checkBackend, 5000);
      }
    );

    // Refresh historical alerts periodically
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
    return await triggerSyntheticAnomaly(type, duration);
  };

  return {
    telemetry,
    alerts,
    activeAlerts,
    isConnected,
    isBackendOnline,
    historyBuffer,
    triggerAnomaly
  };
}
