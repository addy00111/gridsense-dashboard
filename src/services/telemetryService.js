const API_BASE_URL = 'http://localhost:8000';
const WS_BASE_URL = 'ws://localhost:8000';

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
  try {
    const eventSource = new EventSource(`${API_BASE_URL}/api/v1/stream`);
    
    eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        onData(parsed);
      } catch (e) {
        console.error('[GridSense SSE] Error parsing message:', e);
      }
    };

    eventSource.onerror = (err) => {
      if (onError) onError(err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  } catch (err) {
    if (onError) onError(err);
    return () => {};
  }
}
