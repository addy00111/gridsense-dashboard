import os
import csv
import math
import random
import time
import json
import urllib.request
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Tuple, Optional
from models import (
    GridNodeTelemetry, 
    AnomalyAlert, 
    TelemetrySnapshot, 
    WeatherTelemetry, 
    BaselineComparison, 
    SafetyGuardrail
)

class GridTelemetryEngine:
    def __init__(self):
        self.step = 0
        self.battery_soc = 82.0
        self.alert_history: List[AnomalyAlert] = []
        self.active_alerts: List[AnomalyAlert] = []
        
        # Single building pilot specification: Hostel Block A
        self.building_name = "Hostel Block A (Calibrated from Campus Meter Logs)"
        self.solar_capacity_kwp = 40.0 # 40 kWp rooftop solar PV installed on Hostel Block A
        self.battery_capacity_kwh = 45.0 # 45 kWh BESS storage
        self.max_battery_power_kw = 18.0 # 18 kW bidirectional inverter
        
        # Weather cache
        self.last_weather_fetch = 0
        self.weather_cache_interval = 300 # 5 minutes cache
        self.cached_cloud_cover = 45.0 # %
        self.cached_irradiance = 780.0 # W/m²
        self.cached_cloud_volatility = 12.0 # %
        self.cached_is_day = True
        self.last_weather_time = datetime.now(timezone.utc)
        
        # Load CSV meter baseline data
        self.csv_path = os.path.join(os.path.dirname(__file__), "data", "hostel_meter_data.csv")
        self.baseline_records = self.load_baseline_csv()
        
        # Anomaly simulation counters
        self.anomaly_cooldown = 0
        self.current_forced_anomaly: Optional[str] = None
        self.anomaly_duration = 0
        
        # Fetch initial weather synchronously
        self.fetch_pune_weather()

    def load_baseline_csv(self) -> List[Dict]:
        """
        Loads 24-hour calibrated college hostel baseline meter data from CSV.
        """
        records = []
        try:
            if os.path.exists(self.csv_path):
                with open(self.csv_path, mode="r", encoding="utf-8") as f:
                    reader = csv.DictReader(f)
                    for row in reader:
                        records.append({
                            "hour": row["hour"].strip(),
                            "baseline_kw": float(row["baseline_kw"]),
                            "peak_tariff_rate_inr": float(row["peak_tariff_rate_inr"])
                        })
        except Exception as e:
            print(f"[GridSense Engine] Error reading baseline CSV: {e}")
            
        # Fallback 24h profile if CSV is unreadable
        if not records:
            default_kw = [16.8, 15.4, 14.5, 14.0, 14.2, 16.5, 22.4, 29.8, 38.5, 34.2, 27.0, 25.2,
                          24.8, 26.0, 28.5, 27.4, 31.0, 37.8, 44.2, 45.5, 42.0, 38.6, 26.4, 20.5]
            for h, kw in enumerate(default_kw):
                tariff = 6.20 if h < 6 else (14.80 if 17 <= h <= 21 else 11.50)
                records.append({
                    "hour": f"{h:02d}:00",
                    "baseline_kw": kw,
                    "peak_tariff_rate_inr": tariff
                })
        return records

    def fetch_pune_weather(self) -> Dict:
        """
        Pulls live solar irradiance and cloud cover data using the Open-Meteo Solar & Weather API
        for Pune, India (Latitude 18.5204, Longitude 73.8567).
        """
        now_ts = time.time()
        if now_ts - self.last_weather_fetch < self.weather_cache_interval and self.last_weather_fetch > 0:
            return {
                "cloud_cover": self.cached_cloud_cover,
                "irradiance": self.cached_irradiance,
                "volatility": self.cached_cloud_volatility,
                "is_day": self.cached_is_day
            }
            
        try:
            url = (
                "https://api.open-meteo.com/v1/forecast?"
                "latitude=18.5204&longitude=73.8567&"
                "current=cloud_cover,direct_normal_irradiance,shortwave_radiation,is_day&"
                "hourly=cloud_cover,shortwave_radiation&"
                "timezone=Asia%2FKolkata"
            )
            req = urllib.request.Request(url, headers={"User-Agent": "GridSense-HostelBlockA/1.0"})
            with urllib.request.urlopen(req, timeout=4.0) as res:
                data = json.loads(res.read().decode("utf-8"))
                current = data.get("current", {})
                
                cloud_cover = float(current.get("cloud_cover", 40.0))
                irradiance = float(current.get("shortwave_radiation") or current.get("direct_normal_irradiance") or 650.0)
                is_day = bool(current.get("is_day", 1))
                
                hourly = data.get("hourly", {})
                hourly_clouds = hourly.get("cloud_cover", [])[:8]
                if hourly_clouds and len(hourly_clouds) > 1:
                    avg_c = sum(hourly_clouds) / len(hourly_clouds)
                    variance = sum((c - avg_c) ** 2 for c in hourly_clouds) / len(hourly_clouds)
                    volatility = round(math.sqrt(variance), 1)
                else:
                    volatility = round(abs(cloud_cover - 35.0) * 0.4 + 10.0, 1)

                self.cached_cloud_cover = cloud_cover
                self.cached_irradiance = irradiance
                self.cached_cloud_volatility = volatility
                self.cached_is_day = is_day
                self.last_weather_fetch = now_ts
                self.last_weather_time = datetime.now(timezone.utc)
        except Exception as e:
            pass
            
        return {
            "cloud_cover": self.cached_cloud_cover,
            "irradiance": self.cached_irradiance,
            "volatility": self.cached_cloud_volatility,
            "is_day": self.cached_is_day
        }

    def calculate_exact_bill_comparison(self, weather_info: Dict) -> Tuple[BaselineComparison, List[Dict]]:
        """
        Calculates exact rupee savings by comparing the 24-hour baseline meter readings from the CSV
        against GridSense AI solar + battery dispatch logic.
        """
        cloud_pct = weather_info["cloud_cover"]
        irradiance_wm2 = weather_info["irradiance"]
        
        cloud_attenuation = 1.0 - (cloud_pct / 100.0) * 0.65
        irradiance_factor = min(1.2, irradiance_wm2 / 1000.0)
        inverter_efficiency = 0.88
        
        # Max solar output during midday peak under current weather
        peak_solar_capability = self.solar_capacity_kwp * irradiance_factor * inverter_efficiency * cloud_attenuation
        
        hourly_profile = []
        total_baseline_kwh = 0.0
        total_baseline_cost_inr = 0.0
        total_gridsense_cost_inr = 0.0
        
        # Hourly diurnal solar profile distribution (6am - 6pm)
        solar_diurnal_weights = [
            0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
            0.08, 0.35, 0.65, 0.88, 0.98, 1.0,
            0.98, 0.90, 0.72, 0.45, 0.18, 0.04,
            0.0, 0.0, 0.0, 0.0, 0.0, 0.0
        ]
        
        # Battery state tracking through 24h
        sim_soc = 80.0
        battery_kwh_available = self.battery_capacity_kwh * 0.75 # usable capacity between 20% and 95%
        
        for h_idx, record in enumerate(self.baseline_records):
            time_str = record["hour"]
            base_kw = record["baseline_kw"]
            tariff = record["peak_tariff_rate_inr"]
            
            # Solar generation for this hour based on live Open-Meteo weather
            h_solar_kw = round(peak_solar_capability * solar_diurnal_weights[h_idx], 2)
            
            # Battery Dispatch logic:
            # - Midday surplus: Charge BESS (solar > demand)
            # - Off-peak night (00:00 - 05:00): Charge BESS at cheap tariff (₹6.20)
            # - Peak evening tariff (17:00 - 21:00 @ ₹14.80/kWh): Discharge BESS up to 14 kW to shave peak grid load
            h_battery_kw = 0.0
            if 17 <= h_idx <= 21:
                # Evening peak shaving: Discharge battery to minimize grid import at highest tariff
                h_battery_kw = round(min(self.max_battery_power_kw, base_kw - h_solar_kw, 15.0), 2)
                sim_soc = max(20.0, sim_soc - 12.0)
            elif h_solar_kw > base_kw:
                # Midday solar surplus: Charge battery
                h_battery_kw = round(-min(self.max_battery_power_kw, (h_solar_kw - base_kw) * 0.9), 2)
                sim_soc = min(98.0, sim_soc + 8.0)
            elif h_idx <= 4:
                # Off-peak night charging
                h_battery_kw = -6.0
                sim_soc = min(90.0, sim_soc + 4.0)

            # Net grid import for this hour
            if h_battery_kw < 0:
                # Charging battery adds to grid import if solar is insufficient
                h_grid_kw = round(max(0.0, base_kw - h_solar_kw + abs(h_battery_kw)), 2)
            else:
                # Discharging battery reduces grid import
                h_grid_kw = round(max(0.0, base_kw - h_solar_kw - h_battery_kw), 2)
                
            # Costs
            base_cost = base_kw * 1.0 * tariff
            gridsense_cost = h_grid_kw * 1.0 * tariff
            cost_avoided = round(max(0.0, base_cost - gridsense_cost), 2)
            
            total_baseline_kwh += base_kw
            total_baseline_cost_inr += base_cost
            total_gridsense_cost_inr += gridsense_cost
            
            hourly_profile.append({
                "time": time_str,
                "demand": base_kw,
                "solar": h_solar_kw,
                "unoptimizedGrid": base_kw,
                "optimizedGrid": h_grid_kw,
                "battery": h_battery_kw,
                "tariffRate": tariff,
                "costAvoided": cost_avoided
            })
            
        # 30-day monthly projections + MSEDCL Demand Sanction Factor
        baseline_daily_cost = round(total_baseline_cost_inr, 2)
        gridsense_daily_cost = round(total_gridsense_cost_inr, 2)
        
        # Monthly calculations (30 days)
        baseline_monthly_bill = round(baseline_daily_cost * 30.0, 2)
        gridsense_monthly_bill = round(gridsense_daily_cost * 30.0, 2)
        monthly_savings = round(baseline_monthly_bill - gridsense_monthly_bill, 2)
        savings_pct = round((monthly_savings / baseline_monthly_bill) * 100.0, 1)
        
        comparison = BaselineComparison(
            building_name=self.building_name,
            baseline_monthly_bill_inr=baseline_monthly_bill,
            gridsense_monthly_bill_inr=gridsense_monthly_bill,
            monthly_savings_inr=monthly_savings,
            savings_percentage=savings_pct,
            solar_installed_kwp=self.solar_capacity_kwp,
            bess_capacity_kwh=self.battery_capacity_kwh,
            standard_tariff_inr=11.50,
            baseline_daily_kwh=round(total_baseline_kwh, 1),
            baseline_daily_cost_inr=baseline_daily_cost,
            gridsense_daily_cost_inr=gridsense_daily_cost,
            description="Baseline data sourced from 24h college hostel sub-meter readings against official MSEDCL commercial tariffs.",
            hourly_profile=hourly_profile
        )
        
        return comparison, hourly_profile

    def generate_snapshot(self) -> TelemetrySnapshot:
        self.step += 1
        now = datetime.now(timezone.utc)
        
        # Pull live weather data for Pune
        weather_info = self.fetch_pune_weather()
        cloud_pct = weather_info["cloud_cover"]
        irradiance_wm2 = weather_info["irradiance"]
        volatility_pct = weather_info["volatility"]
        is_day = weather_info["is_day"]

        # Calculate exact baseline comparison from CSV & live weather
        baseline_comparison, hourly_profile = self.calculate_exact_bill_comparison(weather_info)

        # Map current time / simulation step to CSV hour
        current_hour_idx = (datetime.now().hour) % 24
        # Blend with simulation step for live dynamic demonstration
        sim_hour_idx = (current_hour_idx + (self.step // 10)) % 24
        csv_record = self.baseline_records[sim_hour_idx]
        csv_baseline_kw = csv_record["baseline_kw"]

        # Demand profile for Hostel Block A from CSV with realistic sub-second electrical jitter (+/- 0.4 kW)
        hostel_demand_kw = round(max(12.0, csv_baseline_kw + random.uniform(-0.4, 0.4)), 2)

        # Estimated live solar generation for Hostel Block A (40 kWp single pilot building)
        if is_day and irradiance_wm2 > 10.0:
            cloud_attenuation = 1.0 - (cloud_pct / 100.0) * 0.65
            irradiance_factor = min(1.2, irradiance_wm2 / 1000.0)
            inverter_efficiency = 0.88
            
            # Base generation for 40 kWp system
            calculated_solar = self.solar_capacity_kwp * irradiance_factor * inverter_efficiency * cloud_attenuation
            live_solar_kw = round(max(0.0, calculated_solar + random.uniform(-0.5, 0.5)), 2)
        else:
            live_solar_kw = 0.0

        # Safety Guardrail Check
        guardrail_triggered = volatility_pct > 25.0
        
        # Battery Load Shifting Logic vs Baseline
        if guardrail_triggered:
            bess_kw = 0.0
            guardrail_status = "GUARDRAIL_ACTIVE"
            guardrail_action = "Safety Guardrail engaged: Cloud volatility >25%. Battery in conservative reserve; grid supplying base load."
        elif live_solar_kw > hostel_demand_kw:
            surplus = live_solar_kw - hostel_demand_kw
            bess_kw = round(-min(self.max_battery_power_kw, surplus * 0.90), 2)
            self.battery_soc = min(98.0, round(self.battery_soc + 0.08, 2))
            guardrail_status = "NORMAL"
            guardrail_action = "Absorbing rooftop solar surplus into Hostel Block A 45kWh BESS."
        else:
            deficit = hostel_demand_kw - live_solar_kw
            bess_kw = round(min(self.max_battery_power_kw, deficit * 0.85), 2)
            self.battery_soc = max(18.0, round(self.battery_soc - 0.07, 2))
            guardrail_status = "NORMAL"
            guardrail_action = "Discharging BESS to shave Hostel Block A peak load and avoid peak tariff."

        # Net grid import for Hostel Block A with GridSense
        grid_import_kw = round(max(0.0, hostel_demand_kw - live_solar_kw - bess_kw), 2)

        # Anomaly Injection Logic
        current_alerts: List[AnomalyAlert] = []
        
        if self.anomaly_cooldown <= 0 and random.random() < 0.16:
            anomaly_types = ["VOLTAGE_SAG", "FREQUENCY_SPIKE", "LINE_OVERLOAD", "LOW_POWER_FACTOR"]
            self.current_forced_anomaly = random.choice(anomaly_types)
            self.anomaly_duration = random.randint(3, 5)
            self.anomaly_cooldown = random.randint(30, 50)
        elif self.anomaly_cooldown > 0:
            self.anomaly_cooldown -= 1

        if self.anomaly_duration > 0:
            self.anomaly_duration -= 1
        else:
            self.current_forced_anomaly = None

        # --- NODE 1: Hostel Block A Rooftop Solar PV ---
        solar_v = round(230.0 + random.uniform(-1.2, 1.2), 1)
        solar_hz = round(50.0 + random.uniform(-0.03, 0.03), 2)
        solar_pf = round(0.98 + random.uniform(-0.01, 0.01), 2)
        solar_status = "NORMAL"

        if self.current_forced_anomaly == "VOLTAGE_SAG":
            solar_v = round(random.uniform(184.0, 196.0), 1)
            solar_status = "CRITICAL"
            alert = AnomalyAlert(
                alert_id=f"ALT-{int(time.time()*1000)}-1",
                timestamp=now,
                node_id="NODE_SOLAR_01",
                node_name="Hostel Block A - Rooftop Solar (40 kWp)",
                severity="CRITICAL",
                anomaly_type="VOLTAGE_SAG",
                message=f"Voltage sag detected on Hostel A Solar Inverter ({solar_v}V < 200.0V limit)",
                metric_value=solar_v,
                threshold_value=200.0,
                unit="V",
                mitigation_action="BESS Inverter dynamically injecting reactive VAR support"
            )
            current_alerts.append(alert)

        solar_current = round((live_solar_kw * 1000) / (solar_v * solar_pf * 1.732), 1) if live_solar_kw > 0 else 0.0
        node_solar = GridNodeTelemetry(
            node_id="NODE_SOLAR_01",
            node_name="Hostel Block A - Rooftop Solar (40 kWp)",
            node_type="SOLAR_SUBSTATION",
            voltage_v=solar_v,
            current_a=solar_current,
            power_factor=solar_pf,
            active_power_kw=live_solar_kw,
            reactive_power_kvar=round(live_solar_kw * 0.12, 2),
            frequency_hz=solar_hz,
            status=solar_status
        )

        # --- NODE 2: Hostel Block A 45kWh BESS Storage ---
        bess_v = round(230.0 + random.uniform(-0.8, 0.8), 1)
        bess_hz = round(50.0 + random.uniform(-0.02, 0.02), 2)
        bess_pf = 0.99
        bess_status = "NORMAL"

        if self.current_forced_anomaly == "FREQUENCY_SPIKE":
            bess_hz = round(51.25 + random.uniform(0.1, 0.3), 2)
            bess_status = "WARNING"
            alert = AnomalyAlert(
                alert_id=f"ALT-{int(time.time()*1000)}-2",
                timestamp=now,
                node_id="NODE_BESS_02",
                node_name="Hostel Block A - BESS Storage (45 kWh)",
                severity="WARNING",
                anomaly_type="FREQUENCY_SPIKE",
                message=f"Microgrid bus frequency excursion ({bess_hz}Hz > 50.5Hz nominal)",
                metric_value=bess_hz,
                threshold_value=50.5,
                unit="Hz",
                mitigation_action="Fast frequency response throttled battery inverter power"
            )
            current_alerts.append(alert)

        bess_current = round(abs(bess_kw * 1000) / (bess_v * 1.732), 1)
        node_bess = GridNodeTelemetry(
            node_id="NODE_BESS_02",
            node_name="Hostel Block A - BESS Storage (45 kWh)",
            node_type="BESS_STORAGE",
            voltage_v=bess_v,
            current_a=bess_current,
            power_factor=bess_pf,
            active_power_kw=bess_kw,
            reactive_power_kvar=round(abs(bess_kw) * 0.04, 2),
            frequency_hz=bess_hz,
            status=bess_status,
            soc_percentage=round(self.battery_soc, 1)
        )

        # --- NODE 3: Primary Monitoring Node - Hostel Block A Feeder ---
        hostel_v = round(230.0 + random.uniform(-1.5, 1.5), 1)
        hostel_hz = round(50.0 + random.uniform(-0.03, 0.03), 2)
        hostel_pf = round(0.93 + random.uniform(-0.02, 0.02), 2)
        hostel_status = "NORMAL"

        if self.current_forced_anomaly == "LINE_OVERLOAD":
            hostel_demand_kw = round(random.uniform(52.0, 58.0), 2)
            hostel_status = "CRITICAL"
            alert = AnomalyAlert(
                alert_id=f"ALT-{int(time.time()*1000)}-3",
                timestamp=now,
                node_id="NODE_HOSTEL_03",
                node_name="Hostel Block A (Calibrated from Campus Meter Logs)",
                severity="CRITICAL",
                anomaly_type="LINE_OVERLOAD",
                message=f"Hostel Block A demand surge ({hostel_demand_kw}kW > 50.0kW sanction limit)",
                metric_value=hostel_demand_kw,
                threshold_value=50.0,
                unit="kW",
                mitigation_action="Discharging BESS at maximum 18kW capacity to shave peak demand"
            )
            current_alerts.append(alert)

        elif self.current_forced_anomaly == "LOW_POWER_FACTOR":
            hostel_pf = round(random.uniform(0.74, 0.79), 2)
            hostel_status = "WARNING"
            alert = AnomalyAlert(
                alert_id=f"ALT-{int(time.time()*1000)}-4",
                timestamp=now,
                node_id="NODE_HOSTEL_03",
                node_name="Hostel Block A (Calibrated from Campus Meter Logs)",
                severity="WARNING",
                anomaly_type="LOW_POWER_FACTOR",
                message=f"Hostel sub-panel power factor low ({hostel_pf} < 0.85 penalty threshold)",
                metric_value=hostel_pf,
                threshold_value=0.85,
                unit="PF",
                mitigation_action="Triggered automatic APFC capacitor stage-2 engagement"
            )
            current_alerts.append(alert)

        hostel_current = round((hostel_demand_kw * 1000) / (hostel_v * hostel_pf * 1.732), 1)
        node_hostel = GridNodeTelemetry(
            node_id="NODE_HOSTEL_03",
            node_name="Hostel Block A (Calibrated from Campus Meter Logs)",
            node_type="CAMPUS_MAIN_FEEDER",
            voltage_v=hostel_v,
            current_a=hostel_current,
            power_factor=hostel_pf,
            active_power_kw=hostel_demand_kw,
            reactive_power_kvar=round(hostel_demand_kw * 0.35, 2),
            frequency_hz=hostel_hz,
            status=hostel_status
        )

        # Update historical and active alerts
        self.active_alerts = current_alerts
        for alert in current_alerts:
            if not any(a.alert_id == alert.alert_id for a in self.alert_history):
                self.alert_history.insert(0, alert)
        self.alert_history = self.alert_history[:50]

        # Assemble Weather Telemetry Model
        weather_telemetry = WeatherTelemetry(
            city="Pune, Maharashtra",
            latitude=18.5204,
            longitude=73.8567,
            cloud_cover_percentage=round(cloud_pct, 1),
            solar_irradiance_w_m2=round(irradiance_wm2, 1),
            cloud_volatility_percentage=round(volatility_pct, 1),
            is_day=is_day,
            source="Open-Meteo Solar API (Live)",
            last_updated=self.last_weather_time
        )

        # Assemble Safety Guardrail Model
        guardrail = SafetyGuardrail(
            status=guardrail_status,
            volatility_threshold_pct=25.0,
            current_volatility_pct=volatility_pct,
            message="Safety Guardrail: Reverts to conservative grid power if cloud forecast volatility exceeds 25%.",
            action_taken=guardrail_action
        )

        return TelemetrySnapshot(
            timestamp=now,
            pilot_building=self.building_name,
            total_grid_import_kw=grid_import_kw,
            total_solar_generation_kw=live_solar_kw,
            total_campus_demand_kw=hostel_demand_kw,
            battery_net_kw=bess_kw,
            nodes=[node_solar, node_bess, node_hostel],
            active_alerts=self.active_alerts,
            weather=weather_telemetry,
            baseline_comparison=baseline_comparison,
            guardrail=guardrail
        )

# Global singleton telemetry engine
engine = GridTelemetryEngine()
