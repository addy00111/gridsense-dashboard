import React, { useState } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import EnergyFlowSimulator from './components/EnergyFlowSimulator';
import PredictiveDashboard from './components/PredictiveDashboard';
import ProblemArchitecture from './components/ProblemArchitecture';
import RoiCalculator from './components/RoiCalculator';
import PitchDeckModal from './components/PitchDeckModal';
import SchedulePitchModal from './components/SchedulePitchModal';
import Footer from './components/Footer';

export default function App() {
  const [pitchDeckOpen, setPitchDeckOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Top Navigation */}
      <Navbar 
        onOpenPitchDeck={() => setPitchDeckOpen(true)}
        onOpenSchedule={() => setScheduleOpen(true)}
      />

      {/* Main Content Sections */}
      <main>
        {/* 1. Hero & Value Proposition (Slide 01 & 08) */}
        <HeroSection 
          onOpenPitchDeck={() => setPitchDeckOpen(true)}
          onOpenSchedule={() => setScheduleOpen(true)}
        />

        {/* 2. Interactive Real-Time Energy Flow Simulator (Slides 02 & 04) */}
        <EnergyFlowSimulator />

        {/* 3. Live Metrics & 24-Hour AI Predictive Dashboard (Slides 03 & 05) */}
        <PredictiveDashboard />

        {/* 4. Problem & System Architecture Visualizer (Slides 01 & 06) */}
        <ProblemArchitecture />

        {/* 5. Interactive Investor ROI & Impact Calculator (Slide 07) */}
        <RoiCalculator 
          onOpenSchedule={() => setScheduleOpen(true)}
        />
      </main>

      {/* Footer */}
      <Footer 
        onOpenPitchDeck={() => setPitchDeckOpen(true)}
        onOpenSchedule={() => setScheduleOpen(true)}
      />

      {/* Interactive Modals */}
      <PitchDeckModal 
        isOpen={pitchDeckOpen}
        onClose={() => setPitchDeckOpen(false)}
        onOpenSchedule={() => setScheduleOpen(true)}
      />

      <SchedulePitchModal 
        isOpen={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
      />

    </div>
  );
}
