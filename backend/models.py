from datetime import datetime
from typing import List, Optional, Literal
from pydantic import BaseModel, Field

class GridNodeTelemetry(BaseModel):
    node_id: str = Field(..., description="Unique identifier for the grid node")
    node_name: str = Field(..., description="Human readable node name")
    node_type: Literal["SOLAR_SUBSTATION", "BESS_STORAGE", "CAMPUS_MAIN_FEEDER"]
    voltage_v: float = Field(..., description="Line-to-neutral voltage in Volts")
    current_a: float = Field(..., description="Current in Amperes")
    power_factor: float = Field(..., description="Power factor between -1.0 and 1.0")
    active_power_kw: float = Field(..., description="Active power in Kilowatts")
    reactive_power_kvar: float = Field(..., description="Reactive power in kVAR")
    frequency_hz: float = Field(..., description="Grid frequency in Hertz (nominal 50.0Hz)")
    status: Literal["NORMAL", "WARNING", "CRITICAL", "ISOLATED"] = "NORMAL"
    soc_percentage: Optional[float] = Field(None, description="State of charge for battery nodes")

class AnomalyAlert(BaseModel):
    alert_id: str
    timestamp: datetime
    node_id: str
    node_name: str
    severity: Literal["INFO", "WARNING", "CRITICAL"]
    anomaly_type: Literal[
        "VOLTAGE_SAG", 
        "FREQUENCY_SPIKE", 
        "LINE_OVERLOAD", 
        "LOW_POWER_FACTOR", 
        "SOLAR_RAPID_DROP",
        "HARMONIC_DISTORTION"
    ]
    message: str
    metric_value: float
    threshold_value: float
    unit: str
    mitigation_action: str

class TelemetrySnapshot(BaseModel):
    timestamp: datetime
    total_grid_import_kw: float
    total_solar_generation_kw: float
    total_campus_demand_kw: float
    battery_net_kw: float
    nodes: List[GridNodeTelemetry]
    active_alerts: List[AnomalyAlert]

class AlertHistoryResponse(BaseModel):
    total_count: int
    alerts: List[AnomalyAlert]
