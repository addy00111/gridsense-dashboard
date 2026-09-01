import React, { useState, useEffect } from 'react';
import { 
  Sun, 
  BatteryCharging, 
  Battery, 
  Building2, 
  Globe2, 
  Zap, 
  ArrowRight, 
  CloudSun, 
  Moon, 
  Gauge, 
  Info,
  CheckCircle2,
  Sparkles,
  Sliders,
  TrendingUp,
  Cpu
} from 'lucide-react';

export default function EnergyFlowSimulator() {
  const [activeScenario, setActiveScenario] = useState('A');
  const [batterySoc, setBatterySoc] = useState(84);
  const [isSimulating, setIsSimulating] = useState(true);

  // Microgrid simulation scenarios
  const scenarios = {
    A: {
      id: 'A',
      title: 'Scenario A: Normal Sunny Day',
      badge: 'High Solar Production • Battery Charging',
      desc: 'Abundant solar powers 100% of campus load while excess generation charges the campus BESS battery. Zero expensive grid import.',
      icon: Sun,
      color: 'from-amber-500 to-emerald-400',
      accentColor: 'text-amber-400',
      borderColor: 'border-amber-500/40',
      bgGlow: 'rgba(245, 158, 11, 0.15)',
      solar: { kw: 480, status: 'Surplus Generation', sub: '980 W/m² irradiance' },
      battery: { kw: '+140 kW', mode: 'CHARGING', soc: 88, status: 'Absorbing surplus' },
      campus: { kw: 340, status: '100% Green Powered', sub: 'HVAC & Labs active' },
      grid: { kw: '0 kW', mode: 'IDLE / NET-EXPORT', status: 'Self-Sustaining campus' },
      flows: {
        solarToCampus: true,
        solarToBattery: true,
        batteryToCampus: false,
        gridToCampus: false,
        gridToBattery: false,
        solarToGrid: false
      },
      liveHighlight: 'Saving ₹8,400/hr by avoiding peak grid tariff.'
    },
    B: {
      id: 'B',
      title: 'Scenario B: Cloudy / Peak Demand Spike',
      badge: 'Peak-Shaving Active • Battery Discharge',
      desc: 'Cloud cover drops solar while campus demand surges during lecture hours. GridSense discharges battery to prevent expensive grid peak demand penalties.',
      icon: CloudSun,
      color: 'from-rose-500 to-amber-500',
      accentColor: 'text-rose-400',
      borderColor: 'border-rose-500/40',
      bgGlow: 'rgba(244, 63, 94, 0.15)',
      solar: { kw: 110, status: 'Intermittent Solar', sub: '310 W/m² cloudy' },
      battery: { kw: '-310 kW', mode: 'DISCHARGING', soc: 62, status: 'Peak-Shaving Active' },
      campus: { kw: 450, status: 'Peak Demand Peak', sub: 'All zones occupied' },
      grid: { kw: '30 kW', mode: 'MINIMAL IMPORT', status: 'Avoided ₹18/kWh penalty' },
      flows: {
        solarToCampus: true,
        solarToBattery: false,
        batteryToCampus: true,
        gridToCampus: true,
        gridToBattery: false,
        solarToGrid: false
      },
      liveHighlight: 'Peak shaved by 68% using predictive battery intervention.'
    },
    C: {
      id: 'C',
      title: 'Scenario C: Night Time / Cheap Off-Peak',
      badge: 'Off-Peak Arbitrage • Low Tariff Charging',
      desc: 'Zero solar production at night. GridSense imports low-cost night electricity (₹3.80/kWh) to power essential campus baseload and recharge battery for morning.',
      icon: Moon,
      color: 'from-indigo-500 to-cyan-400',
      accentColor: 'text-cyan-400',
      borderColor: 'border-cyan-500/40',
      bgGlow: 'rgba(6, 182, 212, 0.15)',
      solar: { kw: 0, status: 'Offline (Night)', sub: '0 W/m² moonlight' },
      battery: { kw: '+90 kW', mode: 'OFF-PEAK CHARGE', soc: 94, status: 'Charging at ₹3.80/kWh' },
      campus: { kw: 180, status: 'Night Baseload', sub: 'Dormitories & Data Centers' },
      grid: { kw: '270 kW', mode: 'OFF-PEAK IMPORT', status: 'Lowest Time-of-Use Rate' },
      flows: {
        solarToCampus: false,
        solarToBattery: false,
        batteryToCampus: false,
        gridToCampus: true,
        gridToBattery: true,
        solarToGrid: false
      },
      liveHighlight: 'Arbitrage optimization: Storing cheap night power for peak hours.'
    }
  };

  const current = scenarios[activeScenario];

  // Dynamic particle pulse speed
  useEffect(() => {
    const timer = setInterval(() => {
      if (activeScenario === 'A') {
        setBatterySoc(prev => (prev < 98 ? prev + 1 : 85));
      } else if (activeScenario === 'B') {
        setBatterySoc(prev => (prev > 25 ? prev - 1 : 65));
      } else {
        setBatterySoc(prev => (prev < 99 ? prev + 1 : 90));
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [activeScenario]);

  return (
    <section id="simulator" className="relative py-20 bg-slate-950/60 border-y border-slate-800/80">
      {/* Background radial gradient */}
      <div 
        className="absolute inset-0 pointer-events-none transition-all duration-700 opacity-20"
        style={{
          background: `radial-gradient(circle at 50% 40%, ${current.bgGlow}, transparent 70%)`
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
              <Zap className="w-3.5 h-3.5" />
              <span>Real-Time Physics & Microgrid Simulation</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Interactive Microgrid <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Energy Flow Simulator</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-2xl">
              Watch how GridSense's autonomous dispatch algorithm coordinates Solar PV, Battery Storage, Campus Load, and the Grid in real-time.
            </p>
          </div>

          {/* Algorithm Status Pill */}
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-md">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <Cpu className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">GridSense Dispatch Core</div>
              <div className="text-sm font-bold text-white flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                <span>MPC Optimized (Every 15s)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scenario Selection Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {Object.values(scenarios).map((scn) => {
            const Icon = scn.icon;
            const isSelected = activeScenario === scn.id;
            return (
              <button
                key={scn.id}
                onClick={() => setActiveScenario(scn.id)}
                className={`text-left p-5 rounded-2xl transition-all duration-300 border backdrop-blur-xl relative overflow-hidden group ${
                  isSelected 
                    ? `bg-slate-900/90 ${scn.borderColor} shadow-[0_0_25px_rgba(16,185,129,0.2)] ring-1 ring-emerald-500/40`
                    : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/70 hover:border-slate-700 text-slate-400'
                }`}
              >
                {isSelected && (
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${scn.color}`} />
                )}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2.5">
                    <div className={`p-2 rounded-xl ${isSelected ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                      {scn.id === 'A' ? 'Sunny Peak Solar' : scn.id === 'B' ? 'Cloudy Peak Demand' : 'Night Off-Peak'}
                    </span>
                  </div>
                  {isSelected && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      ACTIVE
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {scn.desc}
                </p>
              </button>
            );
          })}
        </div>

        {/* Live Simulation Card */}
        <div className="p-6 lg:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur-2xl relative overflow-hidden">
          
          {/* Top Banner with Active Highlight */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-8 border-b border-slate-800/80 gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-lg font-bold text-white">{current.title}</h3>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-emerald-300">
                  {current.badge}
                </span>
              </div>
              <p className="text-xs text-slate-400">{current.desc}</p>
            </div>
            
            <div className="px-4 py-2 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center space-x-2 text-xs font-semibold text-emerald-300">
              <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{current.liveHighlight}</span>
            </div>
          </div>

          {/* SVG Animated Microgrid Flow Canvas */}
          <div className="relative w-full py-8 px-2 sm:px-6">
            
            {/* Grid Diagram Nodes Layout */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 lg:gap-8 items-center relative z-20">
              
              {/* NODE 1: Solar Array */}
              <div className={`p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border transition-all duration-300 ${
                current.flows.solarToCampus || current.flows.solarToBattery
                  ? 'border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.2)]'
                  : 'border-slate-800 opacity-70'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Source 01</span>
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <Sun className={`w-6 h-6 text-amber-400 ${current.solar.kw > 0 ? 'animate-spin-slow' : ''}`} />
                  </div>
                </div>
                <h4 className="text-base font-bold text-white mb-1">Rooftop Solar PV</h4>
                <div className="text-2xl font-black text-amber-400 font-mono">
                  {current.solar.kw} <span className="text-sm font-normal text-slate-400">kW</span>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-800/80 flex justify-between text-[11px] text-slate-400">
                  <span>{current.solar.status}</span>
                  <span className="text-amber-300 font-medium">{current.solar.sub}</span>
                </div>
              </div>

              {/* NODE 2: Battery Storage BESS */}
              <div className={`p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border transition-all duration-300 ${
                current.flows.solarToBattery || current.flows.batteryToCampus || current.flows.gridToBattery
                  ? 'border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.25)]'
                  : 'border-slate-800'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Storage BESS</span>
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                    {current.battery.mode.includes('CHARGE') ? (
                      <BatteryCharging className="w-6 h-6 text-emerald-400 animate-pulse" />
                    ) : (
                      <Battery className="w-6 h-6 text-emerald-400" />
                    )}
                  </div>
                </div>
                <h4 className="text-base font-bold text-white mb-1">Campus 500kWh BESS</h4>
                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-black text-emerald-400 font-mono">
                    {current.battery.kw}
                  </div>
                  <div className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    {current.battery.mode}
                  </div>
                </div>
                {/* SoC Progress bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>State of Charge (SoC)</span>
                    <span className="text-emerald-400 font-bold font-mono">{batterySoc}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-300 transition-all duration-500 rounded-full"
                      style={{ width: `${batterySoc}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* NODE 3: Campus Buildings (Demand) */}
              <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Demand Load</span>
                  <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30">
                    <Building2 className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
                <h4 className="text-base font-bold text-white mb-1">Campus Buildings</h4>
                <div className="text-2xl font-black text-purple-400 font-mono">
                  {current.campus.kw} <span className="text-sm font-normal text-slate-400">kW</span>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-800/80 flex justify-between text-[11px] text-slate-400">
                  <span>{current.campus.status}</span>
                  <span className="text-purple-300 font-medium">12 Sub-Meters</span>
                </div>
              </div>

              {/* NODE 4: City Grid */}
              <div className={`p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border transition-all duration-300 ${
                current.flows.gridToCampus || current.flows.gridToBattery
                  ? 'border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.2)]'
                  : 'border-slate-800 opacity-60'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Utility Grid</span>
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                    <Globe2 className="w-6 h-6 text-cyan-400" />
                  </div>
                </div>
                <h4 className="text-base font-bold text-white mb-1">City Power Grid</h4>
                <div className="text-2xl font-black text-cyan-400 font-mono">
                  {current.grid.kw}
                </div>
                <div className="mt-3 pt-3 border-t border-slate-800/80 flex justify-between text-[11px] text-slate-400">
                  <span>{current.grid.mode}</span>
                  <span className="text-cyan-300 font-medium">{current.grid.status}</span>
                </div>
              </div>

            </div>

            {/* Microgrid Flow Status Breakdown Footer */}
            <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-xs text-slate-400">Renewable Contribution</div>
                <div className="text-lg font-bold text-emerald-400 mt-0.5">
                  {activeScenario === 'A' ? '100% Direct Solar' : activeScenario === 'B' ? '93% (Solar + Battery)' : '0% (Night Mode)'}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-xs text-slate-400">Current Tariff Rate</div>
                <div className="text-lg font-bold text-amber-400 mt-0.5">
                  {activeScenario === 'A' ? '₹0.00 / kWh (Solar)' : activeScenario === 'B' ? '₹14.20 / kWh (Peak Avoided!)' : '₹3.80 / kWh (Off-Peak)'}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-xs text-slate-400">Autonomous Decision</div>
                <div className="text-lg font-bold text-cyan-400 mt-0.5">
                  {activeScenario === 'A' ? 'Charge Battery Surplus' : activeScenario === 'B' ? 'Discharge BESS to Shave Peak' : 'Off-Peak Battery Recharge'}
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
