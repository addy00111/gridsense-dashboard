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
import { useLiveTelemetry } from './hooks/useLiveTelemetry';

export default function App() {
  const [pitchDeckOpen, setPitchDeckOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const { isBackendOnline } = useLiveTelemetry();

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Top Navigation */}
      <Navbar 
        onOpenPitchDeck={() => setPitchDeckOpen(true)}
        onOpenSchedule={() => setScheduleOpen(true)}
        isBackendOnline={isBackendOnline}
      />

      {/* Main Content Sections */}
      <main>
        {/* 1. Hero & Value Proposition */}
        <HeroSection 
          onOpenPitchDeck={() => setPitchDeckOpen(true)}
          onOpenSchedule={() => setScheduleOpen(true)}
        />

        {/* 2. Interactive Real-Time Energy Flow Simulator */}
        <EnergyFlowSimulator />

        {/* 3. Live Metrics & 24-Hour AI Predictive Dashboard */}
        <PredictiveDashboard />

        {/* 4. Problem & System Architecture Visualizer */}
        <ProblemArchitecture />

        {/* 5. Interactive Investor ROI & Impact Calculator */}
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
