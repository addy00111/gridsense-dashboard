# GridSense FastAPI Backend ⚡

Lightweight, high-performance telemetry simulator and anomaly alerting engine for the GridSense Microgrid Intelligence platform.

---

## 🚀 Quickstart

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Start the Server
```bash
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
or run directly:
```bash
python main.py
```

The server will be live at **http://localhost:8000** with interactive Swagger documentation at **http://localhost:8000/docs**.

---

## 📡 API Endpoints

| Method | Endpoint | Type | Description |
|---|---|---|---|
| `GET` | `/api/v1/telemetry` | REST | Current snapshot of all 3 grid nodes + microgrid balance |
| `GET` | `/api/v1/alerts` | REST | Recent & active anomaly alerts (voltage sag, frequency spike, line overload, etc.) |
| `GET` | `/api/v1/stream` | SSE | Server-Sent Events stream yielding live 1-second telemetry JSON |
| `WS` | `/api/v1/ws/stream` | WebSocket | High-frequency bidirectional streaming for React dashboards |
| `POST` | `/api/v1/simulate/anomaly` | REST | Manually trigger a synthetic grid anomaly for live pitch demos |
| `GET` | `/api/v1/health` | REST | System health check and connected client count |

---

## 🔌 Frontend Integration (React)

### Connecting via WebSocket in React:
```javascript
const ws = new WebSocket("ws://localhost:8000/api/v1/ws/stream");

ws.onmessage = (event) => {
  const telemetrySnapshot = JSON.parse(event.data);
  console.log("Live Grid Telemetry:", telemetrySnapshot);
};
```

### Connecting via Server-Sent Events (SSE) in React:
```javascript
const eventSource = new EventSource("http://localhost:8000/api/v1/stream");

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("Real-Time Telemetry:", data);
};
```

---

## ⚡ 3-Node Microgrid Spec

1. **`NODE_SOLAR_01` (Rooftop Solar Substation)**
   - Metrics: Voltage (V), Current (A), Power Factor (PF), Active Power (kW), Frequency (Hz)
   - Simulates diurnal solar generation curves with atmospheric noise.

2. **`NODE_BESS_02` (Central 500kWh BESS Hub)**
   - Metrics: Charge/Discharge kW, SoC %, Voltage, Current, Reactive Power.
   - Dynamically absorbs surplus solar or discharges to shave campus peak loads.

3. **`NODE_CAMPUS_03` (Campus Main Feeder & HVAC)**
   - Metrics: Active Load (kW), Power Factor, Voltage, Line Current.
   - Periodic anomaly injections: Voltage Sags (<200V), Frequency Excursions, Maximum Demand Limit Surges (>500kW), Low PF (<0.85).
