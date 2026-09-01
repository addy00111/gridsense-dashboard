import React, { useState } from 'react';
import { 
  Calculator, 
  Building2, 
  IndianRupee, 
  DollarSign, 
  TrendingUp, 
  Leaf, 
  ShieldCheck, 
  Zap, 
  Sparkles,
  ArrowRight,
  PieChart,
  Clock
} from 'lucide-react';

export default function RoiCalculator({ onOpenSchedule }) {
  const [buildingCount, setBuildingCount] = useState(12);
  const [currency, setCurrency] = useState('INR'); // 'INR' or 'USD'
  const [tariffRate, setTariffRate] = useState(11.5); // ₹ per kWh avg or $0.14
  
  // Rate conversions
  const conversionRate = 84; // 1 USD = 84 INR approx

  // Dynamic calculations per building baseline:
  // Avg building consumes ~120,000 kWh/year
  // Peak shaving + solar optimization saves ~21% of total bill
  // 1 building saves ~25,200 kWh/yr peak power + avoidance of peak penalties
  const annualSavingsINRPerBuilding = 285000; // ~₹2.85 Lakhs/yr
  const licenseCostINRPerBuilding = 65000; // ~₹65k SaaS ARR/building
  const co2AvoidedTonnesPerBuilding = 24.5; // tonnes CO2/yr

  // Totals
  const totalAnnualSavingsINR = buildingCount * annualSavingsINRPerBuilding;
  const totalLicenseINR = buildingCount * licenseCostINRPerBuilding;
  const netAnnualSavingsINR = totalAnnualSavingsINR - totalLicenseINR;
  const totalCO2Tonnes = (buildingCount * co2AvoidedTonnesPerBuilding).toFixed(1);
  const paybackMonths = ((totalLicenseINR / (totalAnnualSavingsINR / 12))).toFixed(1);

  // Currency formatted strings
  const formatCurrency = (valINR) => {
    if (currency === 'INR') {
      if (valINR >= 10000000) {
        return `₹${(valINR / 10000000).toFixed(2)} Cr`;
      } else if (valINR >= 100000) {
        return `₹${(valINR / 100000).toFixed(2)} Lakhs`;
      }
      return `₹${valINR.toLocaleString('en-IN')}`;
    } else {
      const valUSD = valINR / conversionRate;
      if (valUSD >= 1000000) {
        return `$${(valUSD / 1000000).toFixed(2)}M`;
      } else if (valUSD >= 1000) {
        return `$${(valUSD / 1000).toFixed(1)}k`;
      }
      return `$${Math.round(valUSD).toLocaleString('en-US')}`;
    }
  };

  return (
    <section id="roi-calculator" className="py-20 bg-[#060913] relative overflow-hidden">
      
      {/* Background glow effects */}
      <div className="absolute -bottom-24 left-1/4 w-[600px] h-[400px] bg-emerald-500/10 blur-[140px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Calculator className="w-3.5 h-3.5" />
            <span>Slide 07 • Financial Modeling & Investor Unit Economics</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Interactive Investor <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-emerald-300 to-teal-400">ROI & Impact Calculator</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-2">
            Model the multi-year savings, carbon reductions, and SaaS software expansion potential across scalable university campuses.
          </p>
        </div>

        {/* Calculator Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Controls Column (5 cols) */}
          <div className="lg:col-span-5 p-6 lg:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Building2 className="w-5 h-5 text-emerald-400" />
                  <span>Deployment Parameters</span>
                </h3>

                {/* Currency Switcher */}
                <div className="flex items-center space-x-1 p-1 rounded-lg bg-slate-950 border border-slate-800">
                  <button
                    onClick={() => setCurrency('INR')}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                      currency === 'INR' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    ₹ INR
                  </button>
                  <button
                    onClick={() => setCurrency('USD')}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                      currency === 'USD' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    $ USD
                  </button>
                </div>
              </div>

              {/* Slider: Number of Campus Buildings */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-slate-200">
                    Campus Scale (Connected Buildings)
                  </label>
                  <span className="text-2xl font-black text-emerald-400 font-mono px-3 py-1 rounded-xl bg-slate-950 border border-emerald-500/30">
                    {buildingCount} <span className="text-xs font-normal text-slate-400">bldgs</span>
                  </span>
                </div>
                
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={buildingCount}
                  onChange={(e) => setBuildingCount(parseInt(e.target.value))}
                  className="w-full h-3 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-400 border border-slate-800"
                />
                
                <div className="flex justify-between text-[11px] text-slate-400 mt-2">
                  <span>1 Building (Pilot Testbed)</span>
                  <span>25 Bldgs (Medium University)</span>
                  <span>50 Bldgs (Large Mega-Campus)</span>
                </div>
              </div>

              {/* Preset quick buttons */}
              <div className="mb-6">
                <span className="text-xs font-medium text-slate-400 block mb-2">
                  Quick Scenario Presets:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Pilot (3 Bldgs)', count: 3 },
                    { label: 'Typical (12 Bldgs)', count: 12 },
                    { label: 'Campus Hub (35)', count: 35 }
                  ].map((preset) => (
                    <button
                      key={preset.count}
                      onClick={() => setBuildingCount(preset.count)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        buildingCount === preset.count
                          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hardware Assumptions summary */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs text-slate-400 space-y-2">
                <div className="flex justify-between">
                  <span>Estimated Solar Installed:</span>
                  <span className="text-slate-200 font-semibold">{buildingCount * 40} kWp</span>
                </div>
                <div className="flex justify-between">
                  <span>Recommended BESS Storage:</span>
                  <span className="text-slate-200 font-semibold">{buildingCount * 50} kWh</span>
                </div>
                <div className="flex justify-between">
                  <span>Grid Peak Tariff Saved:</span>
                  <span className="text-emerald-400 font-semibold">21.4% Avg</span>
                </div>
              </div>
            </div>

            {/* CTA in Controls */}
            <div className="mt-8 pt-6 border-t border-slate-800">
              <button
                onClick={onOpenSchedule}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 font-bold text-sm shadow-[0_0_25px_rgba(16,185,129,0.35)] hover:shadow-[0_0_35px_rgba(16,185,129,0.6)] hover:scale-[1.01] transition-all flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Request Campus Feasibility Audit</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Results Output Column (7 cols) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5 items-stretch">
            
            {/* Metric 1: Total Gross Savings */}
            <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-emerald-500/30 shadow-xl flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <TrendingUp className="w-24 h-24 text-emerald-400" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                  Projected Annual Cost Savings
                </span>
                <div className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight my-2">
                  {formatCurrency(totalAnnualSavingsINR)}
                </div>
                <p className="text-xs text-slate-400">
                  Direct utility bill reduction via peak-shaving & self-consumption optimization.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-emerald-300 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>ROI verified against 12 pilot campuses</span>
              </div>
            </div>

            {/* Metric 2: Net Annual Customer ROI */}
            <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-amber-500/30 shadow-xl flex flex-col justify-between group">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-1">
                  Net Annual Benefit (After SaaS)
                </span>
                <div className="text-4xl sm:text-5xl font-black text-amber-300 font-mono tracking-tight my-2">
                  {formatCurrency(netAnnualSavingsINR)}
                </div>
                <p className="text-xs text-slate-400">
                  Pure net economic surplus returned to campus operating budget annually.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-amber-300 font-semibold flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Payback in ~{paybackMonths} months</span>
              </div>
            </div>

            {/* Metric 3: GridSense SaaS License ARR Value */}
            <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-purple-500/30 shadow-xl flex flex-col justify-between group">
              <div>
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider block mb-1">
                  GridSense Software ARR Value
                </span>
                <div className="text-4xl sm:text-5xl font-black text-purple-300 font-mono tracking-tight my-2">
                  {formatCurrency(totalLicenseINR)}
                </div>
                <p className="text-xs text-slate-400">
                  Recurring SaaS software revenue model for GridSense enterprise licensing.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-purple-300 font-semibold">
                Billed annually • Includes 24/7 AI dispatch updates
              </div>
            </div>

            {/* Metric 4: Carbon Emissions Avoided */}
            <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-cyan-500/30 shadow-xl flex flex-col justify-between group">
              <div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                  Annual Carbon Offset
                </span>
                <div className="text-4xl sm:text-5xl font-black text-cyan-300 font-mono tracking-tight my-2">
                  {totalCO2Tonnes} <span className="text-2xl font-normal text-slate-400">Tons</span>
                </div>
                <p className="text-xs text-slate-400">
                  Direct Scope-2 emission reduction qualifying for certified green campus accreditations.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-cyan-300 font-semibold flex items-center gap-1.5">
                <Leaf className="w-4 h-4 text-cyan-400" />
                <span>Equivalent to removing {(buildingCount * 5.2).toFixed(0)} cars off roads</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
