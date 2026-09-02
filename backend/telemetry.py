import math
import random
import time
from datetime import datetime, timezone
from typing import List, Dict, Tuple
from models import GridNodeTelemetry, AnomalyAlert, TelemetrySnapshot

class GridTelemetryEngine:
    def __init__(self):
        self.step = 0
        self.battery_soc = 82.0
        self.alert_history: List[AnomalyAlert] = []
        self.active_alerts: List[AnomalyAlert] = []
        
        # Anomaly simulation counters
        self.anomaly_cooldown = 0
        self.current_forced_anomaly: Optional[str] = None
        self.anomaly_duration = 0

    def generate_snapshot(self) -> TelemetrySnapshot:
        self.step += 1
        now = datetime.now(timezone.utc)
        
        # Solar diurnal factor (sinusoidal simulation centered on midday)
        solar_factor = max(0.0, math.sin((self.step % 60) / 60.0 * math.pi))
        
        # Base metrics
        base_solar_kw = round(450.0 * solar_factor + random.uniform(-10.0, 10.0), 2)
        base_solar_kw = max(0.0, base_solar_kw)
        
        base_demand_kw = round(380.0 + 120.0 * math.sin((self.step % 80) / 80.0 * math.pi) + random.uniform(-15.0, 15.0), 2)
        
        # Battery behavior
        if base_solar_kw > base_demand_kw:
            # Solar surplus -> charge battery
            bess_kw = round(-(base_solar_kw - base_demand_kw) * 0.75, 2)
            self.battery_soc = min(98.0, self.battery_soc + 0.1)
        else:
            # Demand deficit -> discharge battery to shave peak
            deficit = base_demand_kw - base_solar_kw
            bess_kw = round(min(280.0, deficit * 0.85), 2)
            self.battery_soc = max(18.0, self.battery_soc - 0.12)
            
        # Grid import is remainder
        grid_import_kw = round(max(0.0, base_demand_kw - base_solar_kw - bess_kw), 2)
        
        # Anomaly Injection Logic
        current_alerts: List[AnomalyAlert] = []
        
        # Randomly trigger a synthetic anomaly every 25-35 steps if none active
        if self.anomaly_cooldown <= 0 and random.random() < 0.18:
            anomaly_types = ["VOLTAGE_SAG", "FREQUENCY_SPIKE", "LINE_OVERLOAD", "LOW_POWER_FACTOR"]
            self.current_forced_anomaly = random.choice(anomaly_types)
            self.anomaly_duration = random.randint(3, 6) # lasts 3-6 seconds
            self.anomaly_cooldown = random.randint(25, 45) # cooldown before next
        elif self.anomaly_cooldown > 0:
            self.anomaly_cooldown -= 1

        if self.anomaly_duration > 0:
            self.anomaly_duration -= 1
        else:
            self.current_forced_anomaly = None

        # --- NODE 1: Solar Substation ---
        solar_v = round(230.0 + random.uniform(-1.5, 1.5), 1)
        solar_hz = round(50.0 + random.uniform(-0.04, 0.04), 2)
        solar_pf = round(0.98 + random.uniform(-0.02, 0.01), 2)
        solar_status = "NORMAL"

        if self.current_forced_anomaly == "VOLTAGE_SAG":
            solar_v = round(random.uniform(182.0, 196.0), 1)
            solar_status = "CRITICAL"
            alert = AnomalyAlert(
                alert_id=f"ALT-{int(time.time()*1000)}-1",
                timestamp=now,
                node_id="NODE_SOLAR_01",
                node_name="Rooftop Solar Array PV-1",
                severity="CRITICAL",
                anomaly_type="VOLTAGE_SAG",
                message=f"Critical voltage sag detected on Feeder A ({solar_v}V < 200.0V threshold)",
                metric_value=solar_v,
                threshold_value=200.0,
                unit="V",
                mitigation_action="BESS Inverter dynamically injecting reactive power (VAR support)"
            )
            current_alerts.append(alert)

        solar_current = round((base_solar_kw * 1000) / (solar_v * solar_pf * 1.732), 1) if base_solar_kw > 0 else 0.0
        node_solar = GridNodeTelemetry(
            node_id="NODE_SOLAR_01",
            node_name="Rooftop Solar Substation",
            node_type="SOLAR_SUBSTATION",
            voltage_v=solar_v,
            current_a=solar_current,
            power_factor=solar_pf,
            active_power_kw=base_solar_kw,
            reactive_power_kvar=round(base_solar_kw * math.tan(math.acos(min(1.0, solar_pf))), 2),
            frequency_hz=solar_hz,
            status=solar_status
        )

        # --- NODE 2: BESS 500kWh Storage ---
        bess_v = round(230.0 + random.uniform(-1.0, 1.0), 1)
        bess_hz = round(50.0 + random.uniform(-0.03, 0.03), 2)
        bess_pf = 0.99
        bess_status = "NORMAL"

        if self.current_forced_anomaly == "FREQUENCY_SPIKE":
            bess_hz = round(51.35 + random.uniform(0.1, 0.4), 2)
            bess_status = "WARNING"
            alert = AnomalyAlert(
                alert_id=f"ALT-{int(time.time()*1000)}-2",
                timestamp=now,
                node_id="NODE_BESS_02",
                node_name="Central BESS 500kWh Hub",
                severity="WARNING",
                anomaly_type="FREQUENCY_SPIKE",
                message=f"High frequency excursion on microgrid bus ({bess_hz}Hz > 50.5Hz nominal)",
                metric_value=bess_hz,
                threshold_value=50.5,
                unit="Hz",
                mitigation_action="Fast frequency response (FFR) governor ramped down inverter throttle"
            )
            current_alerts.append(alert)

        bess_current = round(abs(bess_kw * 1000) / (bess_v * 1.732), 1)
        node_bess = GridNodeTelemetry(
            node_id="NODE_BESS_02",
            node_name="Central BESS 500kWh Hub",
            node_type="BESS_STORAGE",
            voltage_v=bess_v,
            current_a=bess_current,
            power_factor=bess_pf,
            active_power_kw=bess_kw,
            reactive_power_kvar=round(abs(bess_kw) * 0.05, 2),
            frequency_hz=bess_hz,
            status=bess_status,
            soc_percentage=round(self.battery_soc, 1)
        )

        # --- NODE 3: Campus Main Feeder ---
        campus_v = round(230.0 + random.uniform(-2.0, 2.0), 1)
        campus_hz = round(50.0 + random.uniform(-0.04, 0.04), 2)
        campus_pf = round(0.92 + random.uniform(-0.03, 0.03), 2)
        campus_status = "NORMAL"

        if self.current_forced_anomaly == "LINE_OVERLOAD":
            base_demand_kw = round(random.uniform(540.0, 595.0), 2)
            campus_status = "CRITICAL"
            alert = AnomalyAlert(
                alert_id=f"ALT-{int(time.time()*1000)}-3",
                timestamp=now,
                node_id="NODE_CAMPUS_03",
                node_name="Campus Main Feeder Feeder-1",
                severity="CRITICAL",
                anomaly_type="LINE_OVERLOAD",
                message=f"Contractual Maximum Demand (MDC) breach ({base_demand_kw}kW > 500.0kW limit)",
                metric_value=base_demand_kw,
                threshold_value=500.0,
                unit="kW",
                mitigation_action="Autonomous emergency peak-shaving: Discharging BESS at maximum 250kW rating"
            )
            current_alerts.append(alert)

        elif self.current_forced_anomaly == "LOW_POWER_FACTOR":
            campus_pf = round(random.uniform(0.72, 0.79), 2)
            campus_status = "WARNING"
            alert = AnomalyAlert(
                alert_id=f"ALT-{int(time.time()*1000)}-4",
                timestamp=now,
                node_id="NODE_CAMPUS_03",
                node_name="Campus Main Feeder Feeder-1",
                severity="WARNING",
                anomaly_type="LOW_POWER_FACTOR",
                message=f"Low power factor detected ({campus_pf} < 0.85 tariff penalty threshold)",
                metric_value=campus_pf,
                threshold_value=0.85,
                unit="PF",
                mitigation_action="Triggered automatic APFC capacitor bank stage-3 engagement"
            )
            current_alerts.append(alert)

        campus_current = round((base_demand_kw * 1000) / (campus_v * campus_pf * 1.732), 1)
        node_campus = GridNodeTelemetry(
            node_id="NODE_CAMPUS_03",
            node_name="Campus Main Feeder & HVAC",
            node_type="CAMPUS_MAIN_FEEDER",
            voltage_v=campus_v,
            current_a=campus_current,
            power_factor=campus_pf,
            active_power_kw=base_demand_kw,
            reactive_power_kvar=round(base_demand_kw * math.tan(math.acos(min(1.0, campus_pf))), 2),
            frequency_hz=campus_hz,
            status=campus_status
        )

        # Update historical and active alerts
        self.active_alerts = current_alerts
        for alert in current_alerts:
            # Prepend to history, keep last 50
            if not any(a.alert_id == alert.alert_id for a in self.alert_history):
                self.alert_history.insert(0, alert)
        self.alert_history = self.alert_history[:50]

        return TelemetrySnapshot(
            timestamp=now,
            total_grid_import_kw=grid_import_kw,
            total_solar_generation_kw=base_solar_kw,
            total_campus_demand_kw=base_demand_kw,
            battery_net_kw=bess_kw,
            nodes=[node_solar, node_bess, node_campus],
            active_alerts=self.active_alerts
        )

# Global singleton telemetry engine
engine = GridTelemetryEngine()
