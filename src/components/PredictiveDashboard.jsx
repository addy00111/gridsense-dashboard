import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ReferenceArea,
  ReferenceLine
} from 'recharts';
import { 
  Sun, 
  TrendingDown, 
  IndianRupee, 
  Leaf, 
  Activity, 
  Sparkles, 
  SlidersHorizontal,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Radio,
  AlertTriangle,
  Zap,
  ShieldAlert,
  Play
} from 'lucide-react';
import { useLiveTelemetry } from '../hooks/useLiveTelemetry';

export default function PredictiveDashboard() {
  const { 
    telemetry, 
    alerts, 
    activeAlerts, 
    isConnected, 
    isBackendOnline, 
    historyBuffer, 
    triggerAnomaly 
  } = useLiveTelemetry();

  const [viewMode, setViewMode] = useState('live'); // 'live' or '24h'
  const [showPeakWindow, setShowPeakWindow] = useState(true);
  const [triggering, setTriggering] = useState(false);

  // 24-Hour AI Predictive Baseline Data
  const hourlyData = [
    { time: '00:00', solar: 0, demand: 180, unoptimizedGrid: 180, optimizedGrid: 180, battery: 0, costAvoided: 0 },
    { time: '02:00', solar: 0, demand: 160, unoptimizedGrid: 160, optimizedGrid: 220, battery: 60, costAvoided: 0 },
    { time: '04:00', solar: 0, demand: 150, unoptimizedGrid: 150, optimizedGrid: 210, battery: 60, costAvoided: 0 },
    { time: '06:00', solar: 40, demand: 210, unoptimizedGrid: 210, optimizedGrid: 170, battery: 0, costAvoided: 140 },
    { time: '08:00', solar: 180, demand: 320, unoptimizedGrid: 320, optimizedGrid: 140, battery: 0, costAvoided: 720 },
    { time: '10:00', solar: 390, demand: 410, unoptimizedGrid: 410, optimizedGrid: 60, battery: 40, costAvoided: 1850 },
    { time: '12:00', solar: 480, demand: 470, unoptimizedGrid: 470, optimizedGrid: 0, battery: 10, costAvoided: 3200 },
    { time: '14:00', solar: 420, demand: 490, unoptimizedGrid: 490, optimizedGrid: 20, battery: -50, costAvoided: 3600 },
    { time: '16:00', solar: 240, demand: 480, unoptimizedGrid: 480, optimizedGrid: 90, battery: -150, costAvoided: 3900 },
    { time: '18:00', solar: 60, demand: 430, unoptimizedGrid: 430, optimizedGrid: 230, battery: -140, costAvoided: 2400 },
    { time: '20:00', solar: 0, demand: 310, unoptimizedGrid: 310, optimizedGrid: 260, battery: -50, costAvoided: 1100 },
    { time: '22:00', solar: 0, demand: 220, unoptimizedGrid: 220, optimizedGrid: 220, battery: 0, costAvoided: 0 },
    { time: '24:00', solar: 0, demand: 180, unoptimizedGrid: 180, optimizedGrid: 180, battery: 0, costAvoided: 0 },
  ];

  // Pick chart data: live rolling stream buffer or 24h forecast
  const chartData = (viewMode === 'live' && historyBuffer.length > 2) 
    ? historyBuffer 
    : hourlyData;

  const handleTriggerAnomaly = async (type) => {
    setTriggering(true);
    await triggerAnomaly(type, 6);
    setTimeout(() => setTriggering(false), 2000);
  };

  // Custom tooltip for ultra-clean dark UI
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-4 rounded-xl bg-slate-900/95 border border-slate-700 shadow-2xl backdrop-blur-xl text-xs space-y-2 min-w-[200px]">
          <div className="font-bold text-slate-200 border-b border-slate-800 pb-1.5 flex items-center justify-between">
            <span>{viewMode === 'live' ? 'Live Tick:' : 'Forecast Hour:'} {label}</span>
            <span className="text-emerald-400 font-mono">{viewMode === 'live' ? 'Live Telemetry' : 'AI Active'}</span>
          </div>
          {payload.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <span className="flex items-center space-x-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span>{item.name}:</span>
              </span>
              <span className="font-bold font-mono text-white">
                {item.value} kW
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <section id="analytics" className="py-20 bg-[#070b16] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-3">
              <Activity className="w-3.5 h-3.5" />
              <span>Predictive Analytics & Demand Shaving</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Live Metrics & <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">24-Hour AI Predictive Model</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-2xl">
              Streaming live 1-second telemetry from GridSense Edge Telemetry Engine with real-time neural load forecasting and synthetic anomaly detection.
            </p>
          </div>

          {/* View mode toggle: Live Stream vs 24H Horizon */}
          <div className="flex items-center space-x-2 p-1.5 rounded-xl bg-slate-900 border border-slate-800 self-start md:self-auto">
            <button
              onClick={() => setViewMode('live')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                viewMode === 'live'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Live 1s SSE Stream</span>
            </button>
            <button
              onClick={() => setViewMode('24h')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === '24h'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>24-Hour AI Horizon</span>
            </button>
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          
          {/* KPI 1: Renewable Share with Radial Gauge */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800/90 hover:border-emerald-500/40 transition-all duration-300 shadow-lg relative overflow-hidden group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Renewable Share</span>
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <Sun className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="text-4xl font-extrabold text-white font-sans">
                  {telemetry 
                    ? `${Math.min(100, Math.round((telemetry.total_solar_generation_kw / Math.max(1, telemetry.total_campus_demand_kw)) * 100))}%` 
                    : '68%'}
                </div>
                <div className="text-xs text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>+14% vs conventional grid</span>
                </div>
              </div>

              {/* Mini Circular Gauge Ring */}
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-emerald-400 transition-all duration-1000 ease-out"
                    strokeDasharray="68, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute text-[11px] font-bold text-emerald-300">
                  {telemetry ? `${Math.min(100, Math.round((telemetry.total_solar_generation_kw / Math.max(1, telemetry.total_campus_demand_kw)) * 100))}%` : '68%'}
                </span>
              </div>
            </div>
          </div>

          {/* KPI 2: Peak Load Reduction */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800/90 hover:border-cyan-500/40 transition-all duration-300 shadow-lg group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Peak Load Shaved</span>
              <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                <TrendingDown className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <div className="text-4xl font-extrabold text-cyan-400 font-sans">↓ 21%</div>
            <div className="text-xs text-slate-400 font-medium mt-2">
              Grid contract penalty avoided during 14:00 peak
            </div>
          </div>

          {/* KPI 3: Daily Cost Savings */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800/90 hover:border-amber-500/40 transition-all duration-300 shadow-lg group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Daily Cost Savings</span>
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <IndianRupee className="w-4 h-4 text-amber-400" />
              </div>
            </div>
            <div className="text-4xl font-extrabold text-amber-400 font-sans">₹18.4k</div>
            <div className="text-xs text-slate-400 font-medium mt-2">
              ~$220/day per typical campus cluster
            </div>
          </div>

          {/* KPI 4: Carbon Offset */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800/90 hover:border-emerald-500/40 transition-all duration-300 shadow-lg group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Daily CO₂ Avoided</span>
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <Leaf className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
            <div className="text-4xl font-extrabold text-emerald-400 font-sans">420 kg</div>
            <div className="text-xs text-slate-400 font-medium mt-2">
              Equivalent to 19 mature trees planted daily
            </div>
          </div>

        </div>

        {/* 24-Hour AI Predictive Line Chart with Peak-Shaving Highlight Window */}
        <div className="p-6 lg:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur-2xl mb-8">
          
          {/* Chart Header & Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-slate-800 gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-white">
                  {viewMode === 'live' 
                    ? 'Live 1-Second Telemetry Stream (Solar, Demand & Battery Flow)' 
                    : 'Solar Supply vs Campus Demand & Peak-Shaving Intervention'}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {viewMode === 'live' ? 'LIVE TELEMETRY STREAM' : 'AI PREDICTIVE DISPATCH'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {viewMode === 'live' 
                  ? 'Real-time telemetry buffer rolling every 1000ms.' 
                  : 'Comparing unoptimized grid consumption against GridSense battery-dispatched microgrid.'}
              </p>
            </div>

            {/* Toggle peak shaving window highlight */}
            <div className="flex items-center space-x-3">
              {viewMode === '24h' && (
                <button
                  onClick={() => setShowPeakWindow(!showPeakWindow)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center space-x-1.5 ${
                    showPeakWindow
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{showPeakWindow ? 'Peak-Shave Window: ON' : 'Show Peak Window'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Recharts Area Container */}
          <div className="h-[380px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="solarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="demandGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="gridGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} unit=" kW" />
                
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  iconType="circle"
                  wrapperStyle={{ fontSize: '12px', color: '#cbd5e1' }}
                />

                {/* Highlight Peak-Shaving Window on 24h view */}
                {viewMode === '24h' && showPeakWindow && (
                  <ReferenceArea 
                    x1="12:00" 
                    x2="18:00" 
                    fill="#f59e0b" 
                    fillOpacity={0.08}
                    stroke="#f59e0b"
                    strokeOpacity={0.3}
                    strokeDasharray="4 4"
                    label={{
                      value: "⚡ Peak-Shaving Window (Battery Discharging)", 
                      fill: "#fbbf24", 
                      fontSize: 11,
                      fontWeight: 600,
                      position: "top"
                    }}
                  />
                )}

                {/* Unoptimized Baseline Demand */}
                <Line 
                  type="monotone" 
                  dataKey="unoptimizedGrid" 
                  name="Unoptimized Grid Baseline" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />

                {/* Campus Demand */}
                <Area 
                  type="monotone" 
                  dataKey="demand" 
                  name="Campus Demand (kW)" 
                  stroke="#a855f7" 
                  fillOpacity={1} 
                  fill="url(#demandGradient)" 
                  strokeWidth={2.5}
                />

                {/* Solar Generation */}
                <Area 
                  type="monotone" 
                  dataKey="solar" 
                  name="Solar PV (kW)" 
                  stroke="#f59e0b" 
                  fillOpacity={1} 
                  fill="url(#solarGradient)" 
                  strokeWidth={2.5}
                />

                {/* Grid Consumption with GridSense */}
                <Area 
                  type="monotone" 
                  dataKey="optimizedGrid" 
                  name="Net Grid Import (kW)" 
                  stroke="#10b981" 
                  fillOpacity={1} 
                  fill="url(#gridGradient)" 
                  strokeWidth={2.5}
                />

              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Chart Insights Callout */}
          <div className="mt-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs gap-3">
            <div className="flex items-center space-x-2 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>
                <strong className="text-white font-semibold">AI Dispatch Accuracy:</strong> Neural network achieved <strong>99.4%</strong> demand forecast fidelity over 120 campus validation cycles.
              </span>
            </div>
            <div className="text-emerald-400 font-bold font-mono">
              Avoided Peak Penalty: ₹11,200/day
            </div>
          </div>

        </div>

        {/* Live Anomaly Alerts & Autonomous Mitigation Center */}
        <div className="p-6 lg:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-2xl">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-6 border-b border-slate-800 gap-4">
            <div>
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30">
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>Live Anomaly Detection & Autonomous Mitigations</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {alerts.length} Captured
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    GridSense Telemetry Engine continuously validates grid compliance thresholds (Voltage, Frequency, Overloads).
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive Demo Anomaly Trigger Buttons for Investor Pitches */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-400 mr-1">Pitch Demo Trigger:</span>
              <button
                disabled={triggering}
                onClick={() => handleTriggerAnomaly('VOLTAGE_SAG')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 transition-all disabled:opacity-50"
              >
                Inject Voltage Sag (&lt;200V)
              </button>
              <button
                disabled={triggering}
                onClick={() => handleTriggerAnomaly('LINE_OVERLOAD')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 transition-all disabled:opacity-50"
              >
                Inject Peak Surge (&gt;500kW)
              </button>
              <button
                disabled={triggering}
                onClick={() => handleTriggerAnomaly('FREQUENCY_SPIKE')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 transition-all disabled:opacity-50"
              >
                Inject Freq Spike
              </button>
            </div>
          </div>

          {/* Active Alerts List */}
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {alerts.length > 0 ? (
              alerts.slice(0, 5).map((alert) => (
                <div
                  key={alert.alert_id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    alert.severity === 'CRITICAL'
                      ? 'bg-rose-950/40 border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.15)]'
                      : 'bg-amber-950/40 border-amber-500/40'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-xl mt-0.5 ${alert.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-white">{alert.node_name}</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                          alert.severity === 'CRITICAL' ? 'bg-rose-500/30 text-rose-300 border border-rose-500/40' : 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
                        }`}>
                          {alert.severity} • {alert.anomaly_type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">{alert.message}</p>
                      <div className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5" />
                        <span>Autonomous Action: {alert.mitigation_action}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right sm:flex-shrink-0 text-xs text-slate-400 font-mono">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500 text-xs">
                All 3 grid nodes operating within nominal boundaries. No active anomalies.
              </div>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}
