import asyncio
import json
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from models import TelemetrySnapshot, AlertHistoryResponse, AnomalyAlert
from telemetry import engine

app = FastAPI(
    title="GridSense Telemetry & Microgrid Intelligence API",
    version="1.0.0",
    description="Live time-series microgrid telemetry simulator and anomaly alerting engine for green campuses."
)

# Enable CORS for localhost and Vercel deployments
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Active WebSocket connections manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                pass

manager = ConnectionManager()

# Background task to continuously broadcast telemetry to WebSocket clients
@app.on_event("startup")
async def startup_event():
    async def telemetry_broadcaster():
        while True:
            snapshot = engine.generate_snapshot()
            data = snapshot.model_dump_json()
            await manager.broadcast(data)
            await asyncio.sleep(1.0)

    asyncio.create_task(telemetry_broadcaster())

# --- REST Endpoints ---

@app.get("/")
def root():
    return {
        "service": "GridSense Autonomous Microgrid Intelligence API",
        "status": "OPERATIONAL",
        "version": "1.0.0",
        "endpoints": {
            "telemetry": "/api/v1/telemetry",
            "stream_sse": "/api/v1/stream",
            "stream_ws": "/api/v1/ws/stream",
            "alerts": "/api/v1/alerts",
            "health": "/api/v1/health"
        }
    }

@app.get("/api/v1/health")
def health_check():
    return {
        "status": "HEALTHY",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "connected_ws_clients": len(manager.active_connections),
        "total_historical_alerts": len(engine.alert_history),
        "battery_soc": round(engine.battery_soc, 2)
    }

@app.get("/api/v1/telemetry", response_model=TelemetrySnapshot)
def get_current_telemetry():
    """
    Returns the current real-time snapshot of all 3 campus grid nodes,
    overall microgrid balance, and active alerts.
    """
    return engine.generate_snapshot()

@app.get("/api/v1/alerts", response_model=AlertHistoryResponse)
def get_alerts(limit: int = Query(20, ge=1, le=100)):
    """
    Returns historical and currently active microgrid anomaly alerts.
    """
    return AlertHistoryResponse(
        total_count=len(engine.alert_history),
        alerts=engine.alert_history[:limit]
    )

class AnomalyTriggerRequest(BaseModel):
    anomaly_type: str = "VOLTAGE_SAG"
    duration_seconds: int = 5

@app.post("/api/v1/simulate/anomaly")
def trigger_synthetic_anomaly(req: AnomalyTriggerRequest):
    """
    Allows interactive frontend or investor demo to inject a specific
    synthetic anomaly on-demand (e.g. VOLTAGE_SAG, FREQUENCY_SPIKE, LINE_OVERLOAD).
    """
    engine.current_forced_anomaly = req.anomaly_type
    engine.anomaly_duration = req.duration_seconds
    engine.anomaly_cooldown = 15
    return {
        "status": "TRIGGERED",
        "anomaly_type": req.anomaly_type,
        "duration_seconds": req.duration_seconds,
        "message": f"Synthetic {req.anomaly_type} injected into telemetry stream."
    }

# --- Streaming Endpoints ---

@app.get("/api/v1/stream")
async def stream_telemetry_sse():
    """
    Server-Sent Events (SSE) endpoint streaming continuous 1-second grid telemetry updates.
    """
    async def event_generator():
        while True:
            snapshot = engine.generate_snapshot()
            yield f"data: {snapshot.model_dump_json()}\n\n"
            await asyncio.sleep(1.0)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

@app.websocket("/api/v1/ws/stream")
async def websocket_telemetry(websocket: WebSocket):
    """
    WebSocket endpoint streaming real-time 1-second grid telemetry to web frontend.
    """
    await manager.connect(websocket)
    try:
        # Send initial snapshot immediately upon connecting
        initial = engine.generate_snapshot()
        await websocket.send_text(initial.model_dump_json())
        
        while True:
            # Keep connection open and accept client messages/heartbeats
            msg = await websocket.receive_text()
            try:
                payload = json.loads(msg)
                if payload.get("action") == "TRIGGER_ANOMALY":
                    engine.current_forced_anomaly = payload.get("type", "VOLTAGE_SAG")
                    engine.anomaly_duration = 5
            except Exception:
                pass
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
