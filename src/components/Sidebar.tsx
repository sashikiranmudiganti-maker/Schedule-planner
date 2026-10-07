import React from 'react';
import { useWorkflow } from '../context/WorkflowContext';
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  Lightbulb,
  GitBranch,
  Scale,
  Palmtree,
  FileSpreadsheet,
  Settings,
  HelpCircle,
  FlaskConical,
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  onOpenScenarioLab: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  onOpenScenarioLab,
}) => {
  const { currentRole, actionRecommendations, blockers } = useWorkflow();

  const pendingActions = actionRecommendations.filter(a => a.status === 'pending').length;
  const activeBlockers = blockers.filter(b => b.status === 'open').length;

  const navItems = [
    {
      id: 'command',
      label: 'Command Center',
      icon: LayoutDashboard,
      roles: ['super_admin', 'executive', 'dept_manager', 'project_manager', 'auditor'],
      badge: activeBlockers > 0 ? `${activeBlockers} Blk` : undefined,
      badgeColor: 'bg-rose-950 text-rose-300 border border-rose-700',
    },
    {
      id: 'my_day',
      label: 'My Day (Employee)',
      icon: CalendarCheck,
      roles: ['employee', 'super_admin', 'dept_manager', 'project_manager'],
      badge: currentRole === 'employee' ? 'Focus' : undefined,
      badgeColor: 'bg-cyan-950 text-cyan-300 border border-cyan-800',
    },
    {
      id: 'distribution',
      label: 'Work Distribution',
      icon: Users,
      roles: ['super_admin', 'dept_manager', 'project_manager', 'hr_admin'],
    },
    {
      id: 'action_plans',
      label: 'Action Plans ("What Now?")',
      icon: Lightbulb,
      roles: ['super_admin', 'executive', 'dept_manager', 'project_manager'],
      badge: pendingActions > 0 ? `${pendingActions} Plan` : undefined,
      badgeColor: 'bg-amber-950 text-amber-300 border border-amber-700',
    },
    {
      id: 'simulator',
      label: 'Scenario Simulator',
      icon: GitBranch,
      roles: ['super_admin', 'executive', 'dept_manager', 'project_manager'],
    },
    {
      id: 'fairness_quality',
      label: 'Fairness & Quality',
      icon: Scale,
      roles: ['super_admin', 'executive', 'dept_manager', 'hr_admin', 'auditor'],
    },
    {
      id: 'leave_holidays',
      label: 'Leave & Handover',
      icon: Palmtree,
      roles: ['super_admin', 'hr_admin', 'dept_manager', 'employee'],
    },
    {
      id: 'briefs',
      label: 'Operations Briefs',
      icon: FileSpreadsheet,
      roles: ['super_admin', 'executive', 'dept_manager', 'project_manager'],
    },
    {
      id: 'admin',
      label: 'Admin & Audit Trail',
      icon: Settings,
      roles: ['super_admin', 'hr_admin', 'auditor'],
    },
  ];

  const visibleItems = navItems.filter(item => item.roles.includes(currentRole));

  return (
    <aside className="w-64 bg-[#0b0f17] border-r border-[#232d42] flex flex-col shrink-0 min-h-[calc(100vh-53px)]">
      {/* Navigation Links */}
      <div className="p-3 space-y-1 flex-1">
        <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-300">
          Work Operations
        </div>

        {visibleItems.map(item => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition ${
                isActive
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 shadow-sm shadow-cyan-950'
                  : 'text-slate-300 hover:text-white hover:bg-[#162032]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-300'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Test Lab shortcut */}
        <div className="pt-4 px-3">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-300 mb-1.5">
            Verification
          </div>
          <button
            onClick={onOpenScenarioLab}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium bg-[#131b29] hover:bg-[#1c273a] text-amber-300 border border-amber-900/40 transition"
          >
            <div className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-amber-400" />
              <span>Prompt Scenarios (A–J)</span>
            </div>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1 rounded">10</span>
          </button>
        </div>
      </div>

      {/* Philosophy / Hard Rule card at bottom */}
      <div className="p-3 m-3 rounded-xl bg-gradient-to-b from-[#141b28] to-[#101622] border border-[#232f45] text-slate-300 text-xs">
        <div className="flex items-center gap-2 text-cyan-400 font-bold mb-1">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Core Principle</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed italic">
          “Finish more through better planning, not through longer working hours.”
        </p>
        <div className="mt-2 pt-2 border-t border-[#1e283d] flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span>Max: 40h/wk</span>
          <span>Buffer: 15%</span>
        </div>
      </div>
    </aside>
  );
};
