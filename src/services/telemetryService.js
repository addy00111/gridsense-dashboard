const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL && import.meta.env.VITE_API_BASE_URL.trim() !== '')
  ? import.meta.env.VITE_API_BASE_URL
  : 'https://gridsense-dashboard-7gqv.onrender.com';

const WS_BASE_URL = (import.meta.env.VITE_WS_BASE_URL && import.meta.env.VITE_WS_BASE_URL.trim() !== '')
  ? import.meta.env.VITE_WS_BASE_URL
  : 'wss://gridsense-dashboard-7gqv.onrender.com';

export async function fetchTelemetrySnapshot() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/telemetry`, {
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[GridSense API] Telemetry fetch failed, using fallback:', err.message);
    return null;
  }
}

export async function fetchAlerts(limit = 20) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/alerts?limit=${limit}`, {
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[GridSense API] Alerts fetch failed:', err.message);
    return null;
  }
}

export async function triggerSyntheticAnomaly(anomalyType = 'VOLTAGE_SAG', durationSeconds = 5) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/simulate/anomaly`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        anomaly_type: anomalyType,
        duration_seconds: durationSeconds
      })
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[GridSense API] Trigger anomaly failed:', err.message);
    return null;
  }
}

export function subscribeToTelemetryStream(onData, onError) {
  let eventSource = null;
  try {
    eventSource = new EventSource(`${API_BASE_URL}/api/v1/stream`);
    
    eventSource.onmessage = (event) => {
      try {
        if (event.data && event.data.trim() !== '') {
          const parsed = JSON.parse(event.data);
          onData(parsed);
        }
      } catch (e) {
        console.error('[GridSense SSE] Error parsing message:', e);
      }
    };

    eventSource.onerror = (err) => {
      if (onError) onError(err);
      if (eventSource) {
        eventSource.close();
      }
    };

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  } catch (err) {
    if (onError) onError(err);
    return () => {};
  }
}
