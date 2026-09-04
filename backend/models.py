from datetime import datetime
from typing import List, Optional, Literal, Dict, Any
from pydantic import BaseModel, Field

class GridNodeTelemetry(BaseModel):
    node_id: str = Field(..., description="Unique identifier for the grid node")
    node_name: str = Field(..., description="Human readable node name")
    node_type: str = Field(..., description="Node type identifier e.g. SOLAR_SUBSTATION, BESS_STORAGE, CAMPUS_MAIN_FEEDER")
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
        "HARMONIC_DISTORTION",
        "CLOUD_VOLATILITY_SURGE"
    ]
    message: str
    metric_value: float
    threshold_value: float
    unit: str
    mitigation_action: str

class WeatherTelemetry(BaseModel):
    city: str = "Pune, Maharashtra"
    latitude: float = 18.5204
    longitude: float = 73.8567
    cloud_cover_percentage: float
    solar_irradiance_w_m2: float
    cloud_volatility_percentage: float
    is_day: bool
    source: str = "Open-Meteo Solar API (Live)"
    last_updated: datetime

class BaselineComparison(BaseModel):
    building_name: str = "Hostel Block A (Calibrated from Campus Meter Logs)"
    baseline_monthly_bill_inr: float = 182400.0
    gridsense_monthly_bill_inr: float = 163600.0
    monthly_savings_inr: float = 18800.0
    savings_percentage: float = 10.3
    solar_installed_kwp: float = 40.0
    bess_capacity_kwh: float = 45.0
    standard_tariff_inr: float = 11.50
    baseline_daily_kwh: float = 650.0
    baseline_daily_cost_inr: float = 6080.0
    gridsense_daily_cost_inr: float = 5453.0
    description: str = "Baseline data sourced from 24h college hostel sub-meter readings against official MSEDCL commercial tariffs."
    hourly_profile: Optional[List[Dict[str, Any]]] = None

class SafetyGuardrail(BaseModel):
    status: Literal["NORMAL", "VOLATILITY_ALERT", "GUARDRAIL_ACTIVE"] = "NORMAL"
    volatility_threshold_pct: float = 25.0
    current_volatility_pct: float = 12.0
    message: str = "Safety Guardrail: Reverts to conservative grid power if cloud forecast volatility exceeds 25%."
    action_taken: str = "Grid power standby active; optimal battery load-shifting engaged."

class TelemetrySnapshot(BaseModel):
    timestamp: datetime
    pilot_building: str = "Hostel Block A (Calibrated from Campus Meter Logs)"
    total_grid_import_kw: float
    total_solar_generation_kw: float
    total_campus_demand_kw: float
    battery_net_kw: float
    nodes: List[GridNodeTelemetry]
    active_alerts: List[AnomalyAlert]
    weather: Optional[WeatherTelemetry] = None
    baseline_comparison: Optional[BaselineComparison] = None
    guardrail: Optional[SafetyGuardrail] = None

class AlertHistoryResponse(BaseModel):
    total_count: int
    alerts: List[AnomalyAlert]
