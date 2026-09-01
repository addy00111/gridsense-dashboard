import React from 'react';
import {
  Zap,
  ShieldCheck,
  Sparkles,
  Presentation,
  Calendar,
  Globe,
  Share2,
  Mail,
  ArrowUp
} from 'lucide-react';

export default function Footer({ onOpenPitchDeck, onOpenSchedule }) {
  return (
    <footer className="bg-[#03060c] border-t border-slate-800/80 pt-16 pb-12 relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-emerald-500/5 blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-slate-800/80">

          {/* Brand Col (5 cols) */}
          <div className="md:col-span-5">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-600 p-[1px] shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <div className="w-full h-full bg-[#070d1a] rounded-[11px] flex items-center justify-center">
                  <Zap className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Grid<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Sense</span>
              </span>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed max-w-sm mb-6">
              AI-Powered Smart Energy Management for Green Campuses. Autonomous microgrid dispatch minimizing expensive peak grid reliance while maximizing rooftop solar utilization.
            </p>

            <div className="flex items-center space-x-3">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Seed Round Active • $1.2M Target</span>
              </span>
            </div>
          </div>

          {/* Nav Col 1: Platform Sections (3 cols) */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4">
              Interactive Sections
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <a href="#simulator" className="hover:text-emerald-400 transition-colors">
                  Energy Flow Simulator
                </a>
              </li>
              <li>
                <a href="#analytics" className="hover:text-emerald-400 transition-colors">
                  24-Hour AI Predictive Model
                </a>
              </li>
              <li>
                <a href="#architecture" className="hover:text-emerald-400 transition-colors">
                  System Architecture
                </a>
              </li>
              <li>
                <a href="#roi-calculator" className="hover:text-emerald-400 transition-colors">
                  Investor ROI Calculator
                </a>
              </li>
            </ul>
          </div>

          {/* Nav Col 2: Pitch Deck & Contact (4 cols) */}
          <div className="md:col-span-4">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4">
              Investor Resources
            </h4>
            <div className="space-y-3">
              <button
                onClick={onOpenPitchDeck}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-teal-500/50 text-slate-200 text-xs font-semibold transition-all group"
              >
                <span className="flex items-center space-x-2">
                  <Presentation className="w-4 h-4 text-teal-400" />
                  <span>View Full Pitch Deck</span>
                </span>
                <span className="text-slate-500 group-hover:text-teal-400 transition-colors">→</span>
              </button>

              <button
                onClick={onOpenSchedule}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/30 transition-all group"
              >
                <span className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span>Book Investor Briefing</span>
                </span>
                <span className="text-emerald-400">→</span>
              </button>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            © 2026 GridSense Technologies Inc. • AI Microgrid Dispatch Engine • Patent Pending
          </div>

          <div className="flex items-center space-x-4">
            <span>Zero-Carbon Campus Infrastructure</span>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Scroll to top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
