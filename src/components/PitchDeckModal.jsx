import React, { useState } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Presentation,
  Zap,
  ShieldAlert,
  Cpu,
  TrendingUp,
  Calculator,
  CheckCircle2,
  Sparkles,
  Download,
  Calendar
} from 'lucide-react';

export default function PitchDeckModal({ isOpen, onClose, onOpenSchedule }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!isOpen) return null;

  const slides = [
    {
      number: "01",
      title: "Executive Summary & The Problem",
      subtitle: "The Broken Economics of Green Campus Microgrids",
      icon: ShieldAlert,
      tag: "Problem Statement",
      color: "from-rose-500 to-amber-500",
      content: [
        "Unpredictable Solar Intermittency: Rapid cloud cover causes 40-70% generation drops in seconds.",
        "Peak Demand Penalty Surges: Concurrent HVAC and laboratory loads incur ₹18+/kWh maximum demand charges.",
        "Wasted Midday Surplus: Midday solar generation curtailed or exported at unfavorable feed-in tariffs.",
        "Siloed Hardware: Solar inverters, battery BMS, and sub-meters operate without unified AI dispatch."
      ],
      highlight: "Campuses lose up to 35% of their clean energy investment value without smart coordination."
    },
    {
      number: "02",
      title: "The Solution: GridSense AI Core",
      subtitle: "Autonomous Real-Time Microgrid Intelligence",
      icon: Zap,
      tag: "Product Vision",
      color: "from-emerald-400 to-teal-400",
      content: [
        "Solar First Priority: Direct solar power routed to campus baseload with microsecond dispatch.",
        "Surplus Battery Absorption: Automatically channels excess daytime generation into campus BESS storage.",
        "Peak Tariff Shaving: Predictively discharges stored battery energy during utility peak demand windows.",
        "Off-Peak Night Arbitrage: Charges batteries at lowest time-of-use rates (₹3.80/kWh) when solar is offline."
      ],
      highlight: "Delivers 21% net grid bill reduction and 68% campus clean energy self-consumption."
    },
    {
      number: "03",
      title: "Live Metrics & Campus Impact",
      subtitle: "Validated KPIs Across Pilot Installations",
      icon: TrendingUp,
      tag: "Traction & KPIs",
      color: "from-cyan-400 to-emerald-400",
      content: [
        "21% Peak Load Shaved: Eliminates expensive maximum demand penalties during university hours.",
        "68% Renewable Share: Maximizes rooftop PV utilization without relying on grid curtailment.",
        "₹18.4k Daily Cost Savings: Direct operating cost reduction per typical university campus cluster.",
        "420 kg CO₂ Offset / Day: Certified Scope-2 carbon reductions for green campus accreditations."
      ],
      highlight: "Average pilot campus achieved positive cash-flow in under 3.2 months."
    },
    {
      number: "04",
      title: "Physics & Dynamic Energy Flow Logic",
      subtitle: "Autonomous 3-Scenario Dispatch Matrix",
      icon: Cpu,
      tag: "Engineering Logic",
      color: "from-amber-400 to-emerald-400",
      content: [
        "Scenario A (Sunny Day): 100% solar supply to campus + 140 kW surplus into battery storage.",
        "Scenario B (Cloudy / High Demand): Battery supplies 310 kW peak shave to prevent grid penalty tariffs.",
        "Scenario C (Night Off-Peak): Low-cost grid power supplies baseload and recharges battery at ₹3.80/kWh.",
        "Fail-Safe Operation: Local microgrid controller maintains heuristic fallback if cloud connection drops."
      ],
      highlight: "Model Predictive Control (MPC) updates dispatch state machine every 15 seconds."
    },
    {
      number: "05",
      title: "24-Hour AI Predictive Forecasting",
      subtitle: "Ensemble Neural Networks for Demand & Weather",
      icon: Sparkles,
      tag: "AI Architecture",
      color: "from-purple-400 to-cyan-400",
      content: [
        "Ensemble LSTM & Transformer Networks: Combines numerical weather forecasts with historical campus usage.",
        "99.4% Forecast Accuracy: High-fidelity prediction of solar irradiance and building load curves.",
        "Dynamic Peak Window Identification: Pre-dispatches battery reserves 2 hours ahead of expected surge.",
        "Online Continuous Retraining: Models adapt automatically to seasonal academic calendar changes."
      ],
      highlight: "Predictive foresight prevents battery depletion before peak demand spikes occur."
    },
    {
      number: "06",
      title: "Full-Stack System Architecture",
      subtitle: "From Edge IoT to Cloud Enterprise Command",
      icon: Cpu,
      tag: "Tech Stack",
      color: "from-teal-400 to-blue-500",
      content: [
        "Edge / IoT Layer: Modbus RTU/TCP telemetry from smart meters, pyranometers, and battery BMS.",
        "Data Engine: High-throughput time-series streaming engine with sub-second ingestion.",
        "AI Intelligence: Optimization solver for real-time multi-variable microgrid dispatch.",
        "Hardware Control: Sub-second command execution via encrypted industrial IoT gateways.",
        "Enterprise Dashboard: Role-based executive command center with ESG reporting and sub-meter billing."
      ],
      highlight: "Hardware-agnostic architecture integrates with existing solar inverters & BMS systems."
    },
    {
      number: "07",
      title: "Financial Model & Investor Unit Economics",
      subtitle: "High Margin SaaS + Fast Customer Payback",
      icon: Calculator,
      tag: "Business Model",
      color: "from-amber-400 to-teal-400",
      content: [
        "Annual SaaS Subscription: ₹65,000 (~$770) ARR per connected building.",
        "Customer ROI: ₹2.85 Lakhs annual savings per building — delivers 4.3x customer value multiple.",
        "Payback Period: Less than 2.8 months for software deployment.",
        "Scalable Market: Over 45,000 universities & commercial institutions in target geographic expansion."
      ],
      highlight: "Negative net customer cost with instant ROI payback from Month 1 savings."
    },
    {
      number: "08",
      title: "Vision & Seed Round Opportunity",
      subtitle: "Autonomous Clean Energy for Every Enterprise",
      icon: Zap,
      tag: "Seed Round Pitch",
      color: "from-emerald-400 to-cyan-400",
      content: [
        "Seed Round Target: $1.2M USD for product engineering, hardware certs, and campus pilot expansion.",
        "Milestones: Deploy 150 campus microgrids, achieve ₹12 Cr ARR run-rate within 18 months.",
        "IP & Moat: Proprietary microgrid dispatch neural engine with edge fallback and patented MPC logic.",
        "Join Us: Partnering with top-tier climate-tech and enterprise software venture investors."
      ],
      highlight: "GridSense is turning institutional campuses into self-balancing, green profit centers."
    }
  ];

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-3xl shadow-[0_0_80px_rgba(16,185,129,0.15)] overflow-hidden flex flex-col max-h-[90vh]">

        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <Presentation className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <span className="text-sm font-bold text-white">GridSense Seed Pitch Deck</span>
              <span className="text-xs text-slate-400 ml-2">{currentSlide + 1} of {slides.length}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => { onClose(); onOpenSchedule(); }}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold transition-colors"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Schedule Pitch</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Slide Content Area */}
        <div className="p-6 sm:p-10 overflow-y-auto flex-1">

          {/* Slide Tag & Number */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-emerald-400 uppercase tracking-wider">
              {slide.tag}
            </span>
            <span className="text-3xl font-black text-slate-700 font-mono">
              #{slide.number}
            </span>
          </div>

          {/* Slide Title */}
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {slide.title}
            </h2>
            <p className="text-sm sm:text-base text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300 font-semibold mt-1">
              {slide.subtitle}
            </p>
          </div>

          {/* Slide Bullet Content */}
          <div className="space-y-3.5 mb-8">
            {slide.content.map((item, idx) => (
              <div key={idx} className="flex items-start space-x-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-slate-200 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>

          {/* Highlight Key Takeaway Callout */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-teal-950/40 to-slate-950 border border-emerald-500/40 text-emerald-300 flex items-center space-x-3 text-xs sm:text-sm font-semibold">
            <Sparkles className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>Key Takeaway: {slide.highlight}</span>
          </div>

        </div>

        {/* Slide Footer Navigation */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800/80 bg-slate-900/60">

          <button
            onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
            disabled={currentSlide === 0}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all disabled:opacity-30 disabled:pointer-events-none bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {/* Slide dots */}
          <div className="flex items-center space-x-1.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${currentSlide === idx
                  ? 'w-6 bg-emerald-400'
                  : 'bg-slate-700 hover:bg-slate-500'
                  }`}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1))}
            disabled={currentSlide === slides.length - 1}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all disabled:opacity-30 disabled:pointer-events-none bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:brightness-110 shadow-md"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>

        </div>

      </div>
    </div>
  );
}
