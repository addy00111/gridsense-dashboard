import React from 'react';
import { 
  TrendingDown, 
  SunMedium, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  Zap, 
  ShieldAlert, 
  Coins, 
  Layers,
  ChevronDown
} from 'lucide-react';

export default function HeroSection({ onOpenPitchDeck, onOpenSchedule }) {
  const quickStats = [
    {
      label: "Grid Peak Savings",
      value: "21%",
      sub: "Peak tariff reduction",
      icon: TrendingDown,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30"
    },
    {
      label: "Renewable Share",
      value: "68%",
      sub: "Campus clean energy",
      icon: SunMedium,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/30"
    },
    {
      label: "AI Forecast Horizon",
      value: "24 Hrs",
      sub: "99.4% dispatch accuracy",
      icon: Clock,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/30"
    },
    {
      label: "Annual Campus ROI",
      value: "₹24.8L+",
      sub: "< 2.8 yr payback period",
      icon: Coins,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/30"
    }
  ];

  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
      {/* Background Glows and Grid Lines */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-b from-emerald-500/20 via-teal-500/10 to-transparent blur-[120px] rounded-full"></div>
        <div className="absolute top-1/3 -left-48 w-96 h-96 bg-cyan-500/15 blur-[100px] rounded-full"></div>
        <div className="absolute top-1/2 -right-48 w-96 h-96 bg-emerald-500/15 blur-[100px] rounded-full"></div>
        
        {/* Subtle grid mesh overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #10b981 1px, transparent 0)`,
            backgroundSize: '36px 36px'
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Pitch Stage Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.2)] text-xs font-semibold backdrop-blur-md">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300">
              Next-Gen Energy Intelligence • Autonomous Campus Microgrids
            </span>
          </div>
        </div>

        {/* Main Headline */}
        <div className="text-center max-w-4xl mx-auto mb-8">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-6">
            AI-Powered Smart Energy Management for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              Green Campuses
            </span>
          </h1>

          {/* Sub-headline Pill Sequence */}
          <p className="text-lg sm:text-2xl text-slate-300 font-medium max-w-3xl mx-auto leading-relaxed mb-6">
            <span className="text-emerald-400 font-semibold">Predict demand</span> •{' '}
            <span className="text-teal-300 font-semibold">Use solar first</span> •{' '}
            <span className="text-cyan-400 font-semibold">Store surplus</span> •{' '}
            <span className="text-amber-300 font-semibold">Shave peak costs</span>
          </p>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            GridSense synchronizes university solar generation, IoT sub-meters, and BESS storage with 24-hour predictive machine learning to autonomously minimize expensive grid consumption.
          </p>
        </div>

        {/* CTA Button Row */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <a
            href="#simulator"
            className="group px-7 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 text-white font-bold text-sm sm:text-base shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:shadow-[0_0_45px_rgba(16,185,129,0.7)] hover:scale-[1.02] transition-all duration-300 flex items-center space-x-2"
          >
            <Zap className="w-5 h-5 fill-white/30 text-white" />
            <span>Launch Live Flow Simulator</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>

          <button
            onClick={onOpenPitchDeck}
            className="px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-slate-700/80 hover:border-teal-500/50 text-slate-200 font-semibold text-sm sm:text-base backdrop-blur-xl transition-all duration-200 shadow-sm flex items-center space-x-2"
          >
            <Layers className="w-5 h-5 text-teal-400" />
            <span>Explore Pitch Deck</span>
          </button>
        </div>

        {/* Quick-stat Ticker Chips */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
          {quickStats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div 
                key={idx}
                className="group relative p-5 rounded-2xl bg-gradient-to-b from-slate-900/80 to-slate-950/90 border border-slate-800 hover:border-emerald-500/40 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_30px_rgba(16,185,129,0.15)] hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                    {stat.label}
                  </span>
                  <div className={`p-2 rounded-lg ${stat.bg} ${stat.border} border`}>
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                </div>
                <div className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${stat.color} mb-1 font-sans`}>
                  {stat.value}
                </div>
                <div className="text-xs text-slate-400 font-medium">
                  {stat.sub}
                </div>
              </div>
            );
          })}
        </div>

        {/* Scroll Cue */}
        <div className="flex justify-center mt-12">
          <a 
            href="#simulator" 
            className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-500 hover:text-emerald-400 transition-colors animate-bounce"
          >
            <span>Explore Real-Time Microgrid</span>
            <ChevronDown className="w-4 h-4" />
          </a>
        </div>

      </div>
    </section>
  );
}
