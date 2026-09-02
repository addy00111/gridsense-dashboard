import React, { useState } from 'react';
import { 
  Zap, 
  Presentation, 
  Calendar, 
  Activity, 
  Menu, 
  X, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export default function Navbar({ onOpenPitchDeck, onOpenSchedule, isBackendOnline = true }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#060913]/80 border-b border-emerald-500/20 shadow-[0_4px_30px_rgba(0,255,136,0.05)] transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 p-[1px] shadow-[0_0_20px_rgba(16,185,129,0.4)] group-hover:shadow-[0_0_30px_rgba(16,185,129,0.7)] transition-all duration-300">
              <div className="w-full h-full bg-[#070d1a] rounded-[11px] flex items-center justify-center">
                <Zap className="w-6 h-6 text-emerald-400 fill-emerald-400/20 group-hover:scale-110 transition-transform duration-300 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-2xl font-black tracking-tight text-white font-sans">
                  Grid<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">Sense</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wider hidden sm:block font-medium">
                Autonomous Microgrid Intelligence
              </p>
            </div>
          </div>

          {/* Center: Live Status Badge & Nav Links */}
          <div className="hidden lg:flex items-center space-x-8">
            {/* Live Operational Status */}
            <div className={`flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full border transition-all duration-300 ${
              isBackendOnline 
                ? 'bg-emerald-950/60 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                : 'bg-amber-950/60 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
            }`}>
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isBackendOnline ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isBackendOnline ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              </span>
              <span className={`text-xs font-semibold tracking-wide flex items-center gap-1.5 ${isBackendOnline ? 'text-emerald-300' : 'text-amber-300'}`}>
                {isBackendOnline ? 'FASTAPI CLOUD BACKEND: ONLINE' : 'STANDALONE SIMULATOR MODE'} <span className="opacity-40">•</span> ALL SYSTEMS OPTIMAL
              </span>
            </div>

            <nav className="flex items-center space-x-6 text-sm font-medium text-slate-300">
              <a href="#simulator" className="hover:text-emerald-400 transition-colors">Microgrid Flow</a>
              <a href="#analytics" className="hover:text-emerald-400 transition-colors">AI Analytics</a>
              <a href="#architecture" className="hover:text-emerald-400 transition-colors">Architecture</a>
              <a href="#roi-calculator" className="hover:text-emerald-400 transition-colors">ROI Model</a>
            </nav>
          </div>

          {/* Right Action CTAs */}
          <div className="hidden sm:flex items-center space-x-3.5">
            <button
              onClick={onOpenPitchDeck}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-teal-500/50 transition-all duration-200 shadow-sm hover:shadow-[0_0_15px_rgba(20,184,166,0.2)]"
            >
              <Presentation className="w-4 h-4 text-teal-400" />
              <span>Investor Pitch Deck</span>
            </button>

            <button
              onClick={onOpenSchedule}
              className="relative group overflow-hidden rounded-xl p-[1px] font-semibold text-xs transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 rounded-xl group-hover:opacity-100 opacity-90 transition-opacity"></span>
              <div className="relative px-4 py-2 rounded-[11px] bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white flex items-center space-x-2 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <Calendar className="w-4 h-4" />
                <span>Schedule Investor Pitch</span>
              </div>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex sm:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden px-4 pt-2 pb-6 space-y-3 bg-[#070c18] border-b border-slate-800 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>LIVE DEMO • ALL SYSTEMS OPTIMAL</span>
          </div>
          <nav className="flex flex-col space-y-2 text-sm text-slate-300 py-2">
            <a 
              href="#simulator" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-emerald-400"
            >
              Microgrid Flow
            </a>
            <a 
              href="#analytics" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-emerald-400"
            >
              AI Analytics
            </a>
            <a 
              href="#architecture" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-emerald-400"
            >
              Architecture
            </a>
            <a 
              href="#roi-calculator" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-emerald-400"
            >
              ROI Model
            </a>
          </nav>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => { onOpenPitchDeck(); setMobileMenuOpen(false); }}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-200"
            >
              <Presentation className="w-4 h-4 text-teal-400" />
              <span>Investor Pitch Deck</span>
            </button>
            <button
              onClick={() => { onOpenSchedule(); setMobileMenuOpen(false); }}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg"
            >
              <Calendar className="w-4 h-4" />
              <span>Schedule Pitch</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
