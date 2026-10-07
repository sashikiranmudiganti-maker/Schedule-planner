import React, { useState } from 'react';
import { WorkflowProvider, useWorkflow } from './context/WorkflowContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { CopilotModal } from './components/CopilotModal';
import { ScenarioLabModal } from './components/ScenarioLabModal';
import { DailyBriefModal } from './components/DailyBriefModal';

// Views
import { CommandCenterView } from './components/views/CommandCenterView';
import { MyDayView } from './components/views/MyDayView';
import { WorkDistributionView } from './components/views/WorkDistributionView';
import { ActionPlansView } from './components/views/ActionPlansView';
import { ScenarioSimulatorView } from './components/views/ScenarioSimulatorView';
import { FairnessAndQualityView } from './components/views/FairnessAndQualityView';
import { LeaveAndHolidaysView } from './components/views/LeaveAndHolidaysView';
import { DailyBriefView } from './components/views/DailyBriefView';
import { AdminControlsView } from './components/views/AdminControlsView';

const MainLayout: React.FC = () => {
  const { currentRole } = useWorkflow();

  // If role is employee, default to 'my_day', else 'command'
  const [activeView, setActiveView] = useState<string>(
    currentRole === 'employee' ? 'my_day' : 'command'
  );

  const [copilotOpen, setCopilotOpen] = useState(false);
  const [scenarioLabOpen, setScenarioLabOpen] = useState(false);
  const [dailyBriefOpen, setDailyBriefOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navbar */}
      <Navbar
        onOpenCopilot={() => setCopilotOpen(true)}
        onOpenScenarioLab={() => setScenarioLabOpen(true)}
        onOpenDailyBrief={() => setDailyBriefOpen(true)}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          onOpenScenarioLab={() => setScenarioLabOpen(true)}
        />

        {/* Primary Viewport Area */}
        <main className="flex-1 overflow-y-auto bg-[#0b0f17]">
          {activeView === 'command' && (
            <CommandCenterView
              onOpenCopilot={() => setCopilotOpen(true)}
              onOpenScenarioLab={() => setScenarioLabOpen(true)}
            />
          )}
          {activeView === 'my_day' && (
            <MyDayView onOpenCopilot={() => setCopilotOpen(true)} />
          )}
          {activeView === 'distribution' && <WorkDistributionView />}
          {activeView === 'action_plans' && <ActionPlansView />}
          {activeView === 'simulator' && <ScenarioSimulatorView />}
          {activeView === 'fairness_quality' && <FairnessAndQualityView />}
          {activeView === 'leave_holidays' && <LeaveAndHolidaysView />}
          {activeView === 'briefs' && <DailyBriefView />}
          {activeView === 'admin' && <AdminControlsView />}
        </main>
      </div>

      {/* Global Modals */}
      <CopilotModal
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
      />

      <ScenarioLabModal
        isOpen={scenarioLabOpen}
        onClose={() => setScenarioLabOpen(false)}
        onNavigateToView={(viewId) => setActiveView(viewId)}
      />

      <DailyBriefModal
        isOpen={dailyBriefOpen}
        onClose={() => setDailyBriefOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <WorkflowProvider>
      <MainLayout />
    </WorkflowProvider>
  );
}
