import React, { useState } from 'react';
import {
  CloudRain,
  TrendingUp,
  Trash2,
  Layers,
  Cpu,
  Database,
  BrainCircuit,
  Sliders,
  LayoutDashboard,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  Server,
  Zap
} from 'lucide-react';

export default function ProblemArchitecture() {
  const [activeStep, setActiveStep] = useState(2); // AI Intelligence highlighted by default

  const problems = [
    {
      id: 1,
      title: "Unpredictable Solar Intermittency",
      subtitle: "Sudden Cloud Drops",
      desc: "Fast-moving cloud cover causes 40-70% generation drops in seconds, forcing campuses to instantly draw expensive emergency grid power.",
      icon: CloudRain,
      color: "text-rose-400",
      bg: "bg-rose-500/10",
      border: "hover:border-rose-500/50",
      tag: "Volatility"
    },
    {
      id: 2,
      title: "Peak Demand Penalty Tariffs",
      subtitle: "₹18+/kWh Surges",
      desc: "Campus HVAC, laboratories, and lecture hall surges overlap during commercial peak hours, incurring massive maximum demand charges (MDC).",
      icon: TrendingUp,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "hover:border-amber-500/50",
      tag: "High Cost"
    },
    {
      id: 3,
      title: "Wasted Midday Solar Surplus",
      subtitle: "Suboptimal Storage",
      desc: "Midday peak solar generation is often curtailed or exported back to the grid at low feed-in tariffs due to lack of intelligent automated battery charging.",
      icon: Trash2,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "hover:border-purple-500/50",
      tag: "Lost Revenue"
    },
    {
      id: 4,
      title: "Fragmented Energy Silos",
      subtitle: "Zero Automation",
      desc: "Solar inverters, battery BMS, building sub-meters, and grid meters operate in isolated proprietary systems with no unified AI control.",
      icon: Layers,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      border: "hover:border-cyan-500/50",
      tag: "Data Gaps"
    }
  ];

  const architectureSteps = [
    {
      step: "01",
      title: "EDGE / IoT Ingestion",
      subtitle: "Field Telemetry",
      icon: Database,
      tag: "Hardware Layer",
      color: "from-blue-500 to-cyan-500",
      textColor: "text-cyan-400",
      desc: "Modbus/RS485 smart meters, solar pyranometers, battery BMS controllers, and weather stations stream telemetry at 1-second intervals.",
      specs: ["Modbus RTU / TCP", "MQTT over TLS", "Zero-trust IoT Gateway"]
    },
    {
      step: "02",
      title: "Real-Time Data Engine",
      subtitle: "Stream Processing",
      icon: Server,
      tag: "Processing Layer",
      color: "from-cyan-500 to-teal-500",
      textColor: "text-teal-300",
      desc: "High-throughput time-series data pipeline normalizes multi-building telemetry and prepares feature vectors for predictive modeling.",
      specs: ["TimescaleDB Engine", "Sub-second Ingestion", "Automated Outlier Cleaning"]
    },
    {
      step: "03",
      title: "AI Intelligence Core",
      subtitle: "Predictive Neural Ensemble",
      icon: BrainCircuit,
      tag: "GridSense AI Engine",
      color: "from-emerald-400 to-teal-400",
      textColor: "text-emerald-400",
      desc: "LSTM & Transformer neural networks combine numerical weather forecasts (NWP) with campus calendar schedules for 24-hr demand & solar forecasting.",
      specs: ["99.4% Forecast Fidelity", "Multi-Variable Optimization", "Continuous Online Retraining"]
    },
    {
      step: "04",
      title: "Automated Hardware Control",
      subtitle: "MPC Dispatch Execution",
      icon: Sliders,
      tag: "Execution Layer",
      color: "from-amber-400 to-orange-500",
      textColor: "text-amber-400",
      desc: "Model Predictive Control (MPC) autonomously issues sub-second charge/discharge commands to battery inverters to shave peak grid loads.",
      specs: ["<15ms Response Time", "Safety Interlocks", "Grid Compliance Guaranteed"]
    },
    {
      step: "05",
      title: "Enterprise Admin Console",
      subtitle: "ESG & Billing Dashboard",
      icon: LayoutDashboard,
      tag: "Application Layer",
      color: "from-purple-500 to-pink-500",
      textColor: "text-purple-400",
      desc: "Executive command center providing live microgrid telemetry, departmental sub-meter billing, ROI tracking, and certified ESG carbon reports.",
      specs: ["Role-Based Access", "ESG Compliance Reports", "Automated Financial Audits"]
    }
  ];

  return (
    <section id="architecture" className="py-20 bg-slate-950 relative overflow-hidden">

      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-teal-500/10 blur-[150px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* ================= SECTION A: THE PROBLEM ================= */}
        <div className="mb-24">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold uppercase tracking-wider mb-3">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>The Green Campus Dilemma</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              The 4 Critical Bottlenecks in <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-300">Modern Campus Microgrids</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2">
              Campuses invest millions in solar and batteries, yet lose up to 35% of potential ROI due to uncoordinated, reactive energy management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {problems.map((prob) => {
              const Icon = prob.icon;
              return (
                <div
                  key={prob.id}
                  className={`p-6 rounded-2xl bg-gradient-to-b from-slate-900/80 to-slate-950 border border-slate-800 transition-all duration-300 shadow-lg hover:-translate-y-1 hover:shadow-2xl ${prob.border} group`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${prob.bg} border border-white/5 group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-6 h-6 ${prob.color}`} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {prob.tag}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-emerald-300 transition-colors">
                    {prob.title}
                  </h3>
                  <div className={`text-xs font-semibold ${prob.color} mb-3`}>
                    {prob.subtitle}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {prob.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= SECTION B: SYSTEM ARCHITECTURE ================= */}
        <div>
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
              <Cpu className="w-3.5 h-3.5" />
              <span>End-to-End Technology Stack</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              GridSense <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">Autonomous Architecture</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2">
              From IoT field telemetry to neural forecasting and automated inverter dispatch — built for enterprise reliability and ultra-low latency.
            </p>
          </div>

          {/* Architecture Step-by-Step Flow */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-8">
            {architectureSteps.map((step, idx) => {
              const Icon = step.icon;
              const isSelected = activeStep === idx;
              return (
                <button
                  key={step.step}
                  onClick={() => setActiveStep(idx)}
                  className={`text-left p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${isSelected
                    ? 'bg-slate-900/90 border-emerald-500/60 shadow-[0_0_30px_rgba(16,185,129,0.25)] ring-1 ring-emerald-500/40'
                    : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/70 hover:border-slate-700'
                    }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-black text-slate-500 font-mono">
                        STEP {step.step}
                      </span>
                      <div className={`p-2 rounded-lg ${isSelected ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>

                    <h4 className={`text-sm font-bold mb-0.5 ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                      {step.title}
                    </h4>
                    <span className={`text-[11px] font-semibold ${step.textColor}`}>
                      {step.subtitle}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
                    <span>{step.tag}</span>
                    <ArrowRight className={`w-3 h-3 ${isSelected ? 'text-emerald-400' : 'text-slate-600'}`} />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detailed Active Step Inspector Panel */}
          {activeStep !== null && (
            <div className="p-6 lg:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-2xl relative overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">

                <div className="lg:col-span-2">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-xs font-black px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                      LAYER {architectureSteps[activeStep].step}
                    </span>
                    <h3 className="text-xl font-bold text-white">
                      {architectureSteps[activeStep].title}
                    </h3>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed mb-4">
                    {architectureSteps[activeStep].desc}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {architectureSteps[activeStep].specs.map((spec, sIdx) => (
                      <span
                        key={sIdx}
                        className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-medium text-emerald-300"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{spec}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-center text-center">
                  <div className="text-xs text-slate-400 font-medium mb-1">Architecture Guarantee</div>
                  <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 font-mono">
                    99.99% Uptime
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Autonomous fallback to local microgrid heuristics if internet connection is severed.
                  </p>
                </div>

              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
}
