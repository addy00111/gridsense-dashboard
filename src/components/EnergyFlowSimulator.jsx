import React, { useState } from 'react';
import {
  Sun,
  BatteryCharging,
  Building2,
  Globe2,
  Zap,
  CloudSun,
  Moon,
  Sparkles,
  Radio,
  MapPin
} from 'lucide-react';
import { useLiveTelemetry } from '../hooks/useLiveTelemetry';

export default function EnergyFlowSimulator() {
  const { telemetry, isConnected, isBackendOnline } = useLiveTelemetry();
  const [activeScenario, setActiveScenario] = useState('LIVE');
  const [batterySoc] = useState(84);

  const weather = telemetry?.weather || {
    cloud_cover_percentage: 45.0,
    solar_irradiance_w_m2: 780.0,
    city: "Pune, Maharashtra"
  };

  // Microgrid simulation scenarios for Hostel Block A (Single Pilot Building)
  const scenarios = {
    LIVE: {
      id: 'LIVE',
      title: 'Hostel Block A Live Telemetry Stream',
      badge: isConnected ? 'Live Feed (1s Refresh)' : 'Connecting to Telemetry Engine...',
      desc: 'Real-time telemetry streamed from GridSense Edge Telemetry Engine for Hostel Block A (Node-1 Solar 40kWp, Node-2 BESS 45kWh, Node-3 Single Building Feeder).',
      icon: Radio,
      color: 'from-emerald-400 via-teal-400 to-cyan-400',
      accentColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/50',
      bgGlow: 'rgba(16, 185, 129, 0.2)',
      liveHighlight: isConnected ? `Live Weather: ${weather.cloud_cover_percentage}% Cloud • ${weather.solar_irradiance_w_m2} W/m² (Open-Meteo Pune)` : 'Reconnecting to Edge Telemetry Engine...'
    },
    A: {
      id: 'A',
      title: 'Scenario A: Normal Sunny Midday',
      badge: 'High Solar • Battery Charging',
      desc: 'Abundant solar (38 kW) powers 100% of Hostel Block A load while excess generation charges the 45 kWh BESS. Zero expensive grid import.',
      icon: Sun,
      color: 'from-amber-500 to-emerald-400',
      accentColor: 'text-amber-400',
      borderColor: 'border-amber-500/40',
      bgGlow: 'rgba(245, 158, 11, 0.15)',
      solar: { kw: 38, status: 'Surplus Generation', sub: '850 W/m² irradiance', v: 230.2, a: 95.5, pf: 0.98, hz: 50.01 },
      battery: { kw: '+12 kW', mode: 'CHARGING', soc: 88, status: 'Absorbing surplus', v: 230.1, a: 30.1, pf: 0.99, hz: 50.00 },
      campus: { kw: 26, status: '100% Green Powered', sub: 'Hostel Rooms & Common Area', v: 229.8, a: 68.2, pf: 0.94, hz: 49.99 },
      grid: { kw: '0 kW', mode: 'IDLE / NET-ZERO', status: 'Self-sustaining pilot building' },
      liveHighlight: 'Saving ₹450/hr by avoiding peak utility tariff.'
    },
    B: {
      id: 'B',
      title: 'Scenario B: Cloudy / Evening Student Peak',
      badge: 'Peak-Shaving Active • Battery Discharge',
      desc: 'Cloud cover reduces rooftop solar while hostel demand surges to 42 kW. GridSense discharges the 45 kWh BESS to shave peak demand penalties.',
      icon: CloudSun,
      color: 'from-rose-500 to-amber-500',
      accentColor: 'text-rose-400',
      borderColor: 'border-rose-500/40',
      bgGlow: 'rgba(244, 63, 94, 0.15)',
      solar: { kw: 9, status: 'Intermittent Solar', sub: '280 W/m² cloudy', v: 228.4, a: 22.8, pf: 0.97, hz: 49.98 },
      battery: { kw: '-15 kW', mode: 'DISCHARGING', soc: 62, status: 'Peak-Shaving Active', v: 229.4, a: 37.8, pf: 0.99, hz: 50.01 },
      campus: { kw: 42, status: 'Evening Student Load', sub: 'Water heaters & Rooms', v: 227.9, a: 110.4, pf: 0.91, hz: 49.96 },
      grid: { kw: '18 kW', mode: 'MINIMAL IMPORT', status: 'Avoided ₹14.5/kWh peak rate' },
      liveHighlight: 'Hostel peak demand shaved by 35% using BESS load shifting.'
    },
    C: {
      id: 'C',
      title: 'Scenario C: Night Time / Cheap Off-Peak',
      badge: 'Off-Peak Arbitrage • Low Tariff Charging',
      desc: 'Zero solar at night. GridSense imports low-cost night electricity (₹6.20/kWh) to power essential hostel baseload and recharge battery for morning.',
      icon: Moon,
      color: 'from-indigo-500 to-cyan-400',
      accentColor: 'text-cyan-400',
      borderColor: 'border-cyan-500/40',
      bgGlow: 'rgba(6, 182, 212, 0.15)',
      solar: { kw: 0, status: 'Offline (Night)', sub: '0 W/m² moonlight', v: 0.0, a: 0.0, pf: 1.0, hz: 50.0 },
      battery: { kw: '+8 kW', mode: 'OFF-PEAK CHARGE', soc: 94, status: 'Charging at ₹6.20/kWh', v: 230.5, a: 20.1, pf: 0.99, hz: 50.02 },
      campus: { kw: 14, status: 'Night Baseload', sub: 'Hostel corridors & emergency', v: 231.2, a: 36.8, pf: 0.96, hz: 50.01 },
      grid: { kw: '22 kW', mode: 'OFF-PEAK IMPORT', status: 'Lowest Time-of-Use Rate' },
      liveHighlight: 'Arbitrage optimization: Storing low-cost night power for morning peak.'
    }
  };

  // Resolve Live Node Data vs Preset Scenario Data
  const isLive = activeScenario === 'LIVE';
  const solarNode = telemetry?.nodes?.find(n => n.node_type === 'SOLAR_SUBSTATION');
  const bessNode = telemetry?.nodes?.find(n => n.node_type === 'BESS_STORAGE');
  const hostelNode = telemetry?.nodes?.find(n => n.node_type === 'CAMPUS_MAIN_FEEDER' || n.node_id === 'NODE_HOSTEL_03');

  const liveSolarKw = solarNode ? solarNode.active_power_kw : 24.8;
  const liveBessKw = bessNode ? bessNode.active_power_kw : -8.2;
  const liveHostelKw = hostelNode ? hostelNode.active_power_kw : 32.5;
  const liveGridKw = telemetry ? telemetry.total_grid_import_kw : 6.5;
  const liveSoc = bessNode?.soc_percentage ?? batterySoc;

  // Active view metrics
  const activeSolarKw = isLive ? liveSolarKw : scenarios[activeScenario].solar.kw;
  const activeBessKw = isLive
    ? (liveBessKw > 0 ? `-${liveBessKw} kW` : `+${Math.abs(liveBessKw)} kW`)
    : scenarios[activeScenario].battery.kw;
  const activeHostelKw = isLive ? liveHostelKw : scenarios[activeScenario].campus.kw;
  const activeGridKw = isLive ? `${liveGridKw} kW` : scenarios[activeScenario].grid.kw;
  const activeSoc = isLive ? liveSoc : scenarios[activeScenario].battery.soc;

  const current = scenarios[activeScenario];

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
              <span>Pilot Building Energy Flow Simulator</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Hostel Block A <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Microgrid Dispatch</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-2xl">
              Autonomous real-time power dispatch between 40kWp rooftop solar, 45kWh BESS, and Hostel Block A building loads.
            </p>
          </div>

          {/* Backend Connection & Algorithm Status Pill */}
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-md">
            <div className={`p-2 rounded-lg ${isBackendOnline ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
              <Radio className={`w-5 h-5 ${isBackendOnline ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Hostel Block A Telemetry Engine</div>
              <div className="text-sm font-bold text-white flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${isBackendOnline ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`}></span>
                <span>{isBackendOnline ? 'Live Open-Meteo & SSE (1s)' : 'Hostel Block A Fallback Feed'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scenario Selection Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">

          {/* LIVE TELEMETRY TAB */}
          <button
            onClick={() => setActiveScenario('LIVE')}
            className={`text-left p-4 rounded-2xl transition-all duration-300 border backdrop-blur-xl relative overflow-hidden group ${activeScenario === 'LIVE'
              ? 'bg-slate-900/95 border-emerald-500/70 shadow-[0_0_30px_rgba(16,185,129,0.3)] ring-1 ring-emerald-500/50'
              : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/70 hover:border-slate-700 text-slate-400'
              }`}
          >
            {activeScenario === 'LIVE' && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400" />
            )}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className={`p-1.5 rounded-lg ${activeScenario === 'LIVE' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}`}>
                  <Radio className="w-4 h-4 animate-pulse" />
                </div>
                <span className={`text-xs sm:text-sm font-bold ${activeScenario === 'LIVE' ? 'text-white' : 'text-slate-300'}`}>
                  Live Telemetry
                </span>
              </div>
              <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${isBackendOnline ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300'}`}>
                {isBackendOnline ? 'ACTIVE FEED' : 'STANDALONE'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
              Streaming real-time Hostel Block A pilot telemetry synced with Pune solar weather.
            </p>
          </button>

          {/* Preset Scenario Tabs */}
          {['A', 'B', 'C'].map((scnId) => {
            const scn = scenarios[scnId];
            const Icon = scn.icon;
            const isSelected = activeScenario === scn.id;
            return (
              <button
                key={scn.id}
                onClick={() => setActiveScenario(scn.id)}
                className={`text-left p-4 rounded-2xl transition-all duration-300 border backdrop-blur-xl relative overflow-hidden group ${isSelected
                  ? `bg-slate-900/90 ${scn.borderColor} shadow-[0_0_25px_rgba(16,185,129,0.2)] ring-1 ring-emerald-500/40`
                  : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/70 hover:border-slate-700 text-slate-400'
                  }`}
              >
                {isSelected && (
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${scn.color}`} />
                )}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`text-xs sm:text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                      {scn.id === 'A' ? 'Sunny Surplus' : scn.id === 'B' ? 'Cloudy Peak' : 'Night Off-Peak'}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
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

          {/* Microgrid Nodes Grid Layout for Hostel Block A */}
          <div className="relative w-full py-4">

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-stretch relative z-20">

              {/* NODE 1: Solar Array */}
              <div className={`p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border transition-all duration-300 flex flex-col justify-between ${solarNode?.status === 'CRITICAL'
                ? 'border-rose-500/80 shadow-[0_0_30px_rgba(244,63,94,0.3)] animate-pulse'
                : 'border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.2)]'
                }`}>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Node 01: Solar PV</span>
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
                      <Sun className="w-6 h-6 text-amber-400 animate-spin-slow" />
                    </div>
                  </div>
                  <h4 className="text-base font-bold text-white mb-1">Hostel Block A Solar (40 kWp)</h4>
                  <div className="text-3xl font-black text-amber-400 font-mono">
                    {activeSolarKw} <span className="text-sm font-normal text-slate-400">kW</span>
                  </div>
                </div>

                {/* Electrical Telemetry Badges */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-[11px]">
                  <div className="flex justify-between text-slate-400">
                    <span>Inverter Voltage:</span>
                    <span className="font-mono text-slate-200 font-bold">
                      {isLive && solarNode ? `${solarNode.voltage_v} V` : '230.2 V'}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Array Current:</span>
                    <span className="font-mono text-slate-200 font-bold">
                      {isLive && solarNode ? `${solarNode.current_a} A` : '62.4 A'}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Power Factor / Hz:</span>
                    <span className="font-mono text-amber-300 font-bold">
                      {isLive && solarNode ? `${solarNode.power_factor} PF • ${solarNode.frequency_hz}Hz` : '0.98 PF • 50.0Hz'}
                    </span>
                  </div>
                </div>
              </div>

              {/* NODE 2: Battery Storage BESS */}
              <div className={`p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border transition-all duration-300 flex flex-col justify-between ${bessNode?.status === 'WARNING'
                ? 'border-amber-500/80 shadow-[0_0_30px_rgba(245,158,11,0.3)] animate-pulse'
                : 'border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.25)]'
                }`}>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Node 02: BESS</span>
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                      <BatteryCharging className="w-6 h-6 text-emerald-400 animate-pulse" />
                    </div>
                  </div>
                  <h4 className="text-base font-bold text-white mb-1">Hostel Block A 45kWh BESS</h4>
                  <div className="flex items-baseline justify-between">
                    <div className="text-3xl font-black text-emerald-400 font-mono">
                      {activeBessKw}
                    </div>
                    <div className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      {isLive ? (liveBessKw < 0 ? 'CHARGING' : 'DISCHARGING') : scenarios[activeScenario].battery.mode}
                    </div>
                  </div>

                  {/* SoC Progress bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>State of Charge (SoC)</span>
                      <span className="text-emerald-400 font-bold font-mono">{activeSoc}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-300 transition-all duration-500 rounded-full"
                        style={{ width: `${activeSoc}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Electrical Telemetry */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-[11px]">
                  <div className="flex justify-between text-slate-400">
                    <span>Inverter Voltage:</span>
                    <span className="font-mono text-slate-200 font-bold">
                      {isLive && bessNode ? `${bessNode.voltage_v} V` : '230.1 V'}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Frequency:</span>
                    <span className="font-mono text-emerald-300 font-bold">
                      {isLive && bessNode ? `${bessNode.frequency_hz} Hz` : '50.00 Hz'}
                    </span>
                  </div>
                </div>
              </div>

              {/* NODE 3: Hostel Block A Single Building Demand */}
              <div className={`p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border transition-all duration-300 flex flex-col justify-between ${hostelNode?.status === 'CRITICAL'
                ? 'border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.3)] animate-pulse'
                : 'border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.2)]'
                }`}>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Node 03: Pilot Feeder</span>
                    <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30">
                      <Building2 className="w-6 h-6 text-purple-400" />
                    </div>
                  </div>
                  <h4 className="text-base font-bold text-white mb-1">Hostel Block A (Calibrated from Campus Meter Logs)</h4>
                  <div className="text-3xl font-black text-purple-400 font-mono">
                    {activeHostelKw} <span className="text-sm font-normal text-slate-400">kW</span>
                  </div>
                </div>

                {/* Electrical Telemetry */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-[11px]">
                  <div className="flex justify-between text-slate-400">
                    <span>Line Current (A):</span>
                    <span className="font-mono text-slate-200 font-bold">
                      {isLive && hostelNode ? `${hostelNode.current_a} A` : '86.4 A'}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Power Factor (PF):</span>
                    <span className="font-mono text-purple-300 font-bold">
                      {isLive && hostelNode ? `${hostelNode.power_factor} PF` : '0.94 PF'}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Sub-Meters:</span>
                    <span className="font-mono text-slate-200 font-bold">4 Wing Sub-Panels</span>
                  </div>
                </div>
              </div>

              {/* NODE 4: Utility Grid */}
              <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.2)] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Utility Grid</span>
                    <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                      <Globe2 className="w-6 h-6 text-cyan-400" />
                    </div>
                  </div>
                  <h4 className="text-base font-bold text-white mb-1">MSEDCL Grid (Pune)</h4>
                  <div className="text-3xl font-black text-cyan-400 font-mono">
                    {activeGridKw}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-[11px]">
                  <div className="flex justify-between text-slate-400">
                    <span>Dispatch Policy:</span>
                    <span className="font-mono text-cyan-300 font-bold">Hostel Peak Shaved</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Grid Status:</span>
                    <span className="font-mono text-slate-200 font-bold">Synced 50Hz</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Peak Tariff:</span>
                    <span className="font-mono text-amber-300 font-bold">₹14.50/kWh avoided</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Live Telemetry KPI Footer */}
            <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-xs text-slate-400">Hostel Solar Coverage</div>
                <div className="text-lg font-bold text-emerald-400 mt-0.5">
                  {isLive
                    ? `${Math.min(100, Math.round((liveSolarKw / Math.max(1, liveHostelKw)) * 100))}% Direct Solar`
                    : (activeScenario === 'A' ? '100% Direct Solar' : activeScenario === 'B' ? '57% (Solar + Battery)' : '0% (Night Mode)')}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-xs text-slate-400">Pilot Building Savings</div>
                <div className="text-lg font-bold text-amber-400 mt-0.5">
                  ~10.3% Honest Monthly Bill Reduction
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-xs text-slate-400">Autonomous Pilot Decision</div>
                <div className="text-lg font-bold text-cyan-400 mt-0.5">
                  {isLive
                    ? (liveSolarKw > liveHostelKw ? 'Storing Solar Surplus into 45kWh BESS' : 'Peak Shaving Active for Hostel A')
                    : (activeScenario === 'A' ? 'Store Surplus Solar in BESS' : activeScenario === 'B' ? 'Discharge BESS to Shave Evening Peak' : 'Off-Peak Low-Rate BESS Recharge')}
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
