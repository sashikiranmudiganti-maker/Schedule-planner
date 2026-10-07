import React, { useState } from 'react';
import { useWorkflow } from '../context/WorkflowContext';
import { UserRole } from '../types';
import {
  Sparkles,
  Zap,
  Bell,
  Sliders,
  FileText,
  ShieldCheck,
  ChevronDown,
  AlertTriangle,
  UserCheck,
  CheckCircle2,
  Cpu,
} from 'lucide-react';

interface NavbarProps {
  onOpenCopilot: () => void;
  onOpenScenarioLab: () => void;
  onOpenDailyBrief: () => void;
  activeView: string;
  setActiveView: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCopilot,
  onOpenScenarioLab,
  onOpenDailyBrief,
  activeView,
  setActiveView,
}) => {
  const {
    currentUser,
    currentRole,
    users,
    switchUser,
    switchRole,
    optimizePlan,
    blockers,
    actionRecommendations,
  } = useWorkflow();

  const [optimizerNotice, setOptimizerNotice] = useState<string | null>(null);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const activeBlockersCount = blockers.filter(b => b.status === 'open').length;
  const pendingActionsCount = actionRecommendations.filter(a => a.status === 'pending').length;
  const totalAlerts = activeBlockersCount + pendingActionsCount;

  const roleLabels: Record<UserRole, { label: string; badge: string; scope: string }> = {
    super_admin: { label: 'Super Admin', badge: 'bg-purple-900/60 text-purple-300 border-purple-700', scope: 'Full Platform' },
    hr_admin: { label: 'HR / Org Admin', badge: 'bg-emerald-900/60 text-emerald-300 border-emerald-700', scope: 'Organization' },
    executive: { label: 'Executive', badge: 'bg-blue-900/60 text-blue-300 border-blue-700', scope: 'Company-Wide' },
    dept_manager: { label: 'Dept Manager', badge: 'bg-amber-900/60 text-amber-300 border-amber-700', scope: 'Department' },
    project_manager: { label: 'Project Manager', badge: 'bg-cyan-900/60 text-cyan-300 border-cyan-700', scope: 'Project' },
    employee: { label: 'Employee', badge: 'bg-slate-800 text-slate-300 border-slate-700', scope: 'Personal' },
    auditor: { label: 'Viewer / Auditor', badge: 'bg-rose-900/60 text-rose-300 border-rose-700', scope: 'Read-Only' },
  };

  const handleOptimizeClick = () => {
    const result = optimizePlan();
    setOptimizerNotice(result.summary);
    setTimeout(() => setOptimizerNotice(null), 5000);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0d131f]/95 backdrop-blur border-b border-[#232d42] px-4 py-2.5">
      <div className="flex items-center justify-between gap-4">
        {/* Brand & Motto */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-900/30">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-white text-base">WORKFLOW OS</span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/80">
                  v2.6 Enterprise
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden md:block">
                Finish more through better planning, not through longer working hours
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls & Top Bar */}
        <div className="flex items-center gap-2.5">
          {/* Quick Scenario Lab Runner (Scenarios A - J) */}
          <button
            onClick={onOpenScenarioLab}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-[#162032] hover:bg-[#1f2d47] text-slate-200 border border-[#2b3a56] transition"
            title="Interactive test suite for prompt scenarios A through J"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Scenario Lab</span>
            <span className="text-[10px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">A–J</span>
          </button>

          {/* Daily Operations Brief */}
          <button
            onClick={onOpenDailyBrief}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-[#162032] hover:bg-[#1f2d47] text-slate-200 border border-[#2b3a56] transition"
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Daily Brief</span>
          </button>

          {/* 1-Click Optimize Plan */}
          <button
            onClick={handleOptimizeClick}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-md bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-sm shadow-emerald-950 transition active:scale-95"
            title="Rebalances schedule, protects buffer, eliminates overtime"
          >
            <Zap className="w-3.5 h-3.5 text-emerald-200" />
            <span>OPTIMIZE PLAN</span>
          </button>

          {/* Workflow Copilot AI Button */}
          <button
            onClick={onOpenCopilot}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-sm shadow-indigo-950 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
            <span className="hidden sm:inline">Workflow Copilot</span>
          </button>

          {/* Notifications / Alerts */}
          <div className="relative">
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="relative p-2 rounded-md bg-[#162032] hover:bg-[#1f2d47] text-slate-300 border border-[#2b3a56] transition"
              aria-label="Alerts"
            >
              <Bell className="w-4 h-4" />
              {totalAlerts > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white ring-2 ring-[#0d131f]">
                  {totalAlerts}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 rounded-lg bg-[#151c2b] border border-[#2c3954] shadow-2xl p-3 z-50 text-xs text-slate-200">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#243149]">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Operational Intelligence Alerts
                  </span>
                  <span className="text-[10px] text-slate-400">{totalAlerts} active</span>
                </div>
                {activeBlockersCount > 0 && (
                  <div
                    onClick={() => {
                      setActiveView('command');
                      setShowNotifMenu(false);
                    }}
                    className="p-2 mb-1.5 rounded bg-rose-950/40 border border-rose-800/60 hover:bg-rose-950/60 cursor-pointer"
                  >
                    <div className="font-semibold text-rose-300">🔴 {activeBlockersCount} Active Dependency Blockers</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">VPC latency &amp; cloud throttles delaying project critical paths.</div>
                  </div>
                )}
                {pendingActionsCount > 0 && (
                  <div
                    onClick={() => {
                      setActiveView('action_plans');
                      setShowNotifMenu(false);
                    }}
                    className="p-2 rounded bg-amber-950/40 border border-amber-800/60 hover:bg-amber-950/60 cursor-pointer"
                  >
                    <div className="font-semibold text-amber-300">🟠 {pendingActionsCount} Recommended Action Plans</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Capacity relief &amp; early deadline adjustments ready.</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick RBAC Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md border text-xs font-semibold transition ${roleLabels[currentRole].badge}`}
              title="Switch user role to test RBAC & Scopes"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <div className="flex flex-col text-left leading-none">
                <span className="font-bold">{roleLabels[currentRole].label}</span>
                <span className="text-[9px] opacity-75 font-normal">{roleLabels[currentRole].scope}</span>
              </div>
              <ChevronDown className="w-3 h-3 ml-1 opacity-75" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-lg bg-[#151c2b] border border-[#2c3954] shadow-2xl p-1.5 z-50">
                <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Test Role Perspectives (RBAC)
                </div>
                {(Object.keys(roleLabels) as UserRole[]).map(r => (
                  <button
                    key={r}
                    onClick={() => {
                      switchRole(r);
                      setShowRoleMenu(false);
                      if (r === 'employee') setActiveView('my_day');
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-md text-left transition ${
                      currentRole === r ? 'bg-cyan-950 text-cyan-300 font-bold' : 'hover:bg-[#1e283d] text-slate-300'
                    }`}
                  >
                    <span>{roleLabels[r].label}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{roleLabels[r].scope}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Active User Avatar & Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-md bg-[#162032] border border-[#2b3a56] hover:bg-[#1f2d47] transition"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-6 h-6 rounded-full object-cover ring-1 ring-cyan-500/50"
              />
              <span className="text-xs font-medium text-slate-200 hidden lg:inline max-w-[90px] truncate">
                {currentUser.name}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 rounded-lg bg-[#151c2b] border border-[#2c3954] shadow-2xl p-1.5 z-50">
                <div className="px-2.5 py-2 border-b border-[#243149] mb-1">
                  <div className="font-bold text-white text-xs">{currentUser.name}</div>
                  <div className="text-[11px] text-slate-400 truncate">{currentUser.title}</div>
                  <div className="text-[10px] text-cyan-400 font-mono mt-0.5">{currentUser.email}</div>
                </div>
                <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Switch Active Teammate
                </div>
                <div className="max-h-56 overflow-y-auto">
                  {users.map(u => (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchUser(u.id);
                        setShowUserMenu(false);
                      }}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded text-left transition ${
                        currentUser.id === u.id ? 'bg-cyan-950/80 text-cyan-200 font-semibold' : 'hover:bg-[#1e283d] text-slate-300'
                      }`}
                    >
                      <img src={u.avatar} alt={u.name} className="w-5 h-5 rounded-full object-cover" />
                      <div className="truncate">
                        <div>{u.name}</div>
                        <div className="text-[10px] text-slate-500">{u.title}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Optimizer Live Toast Banner */}
      {optimizerNotice && (
        <div className="mt-2 px-3 py-1.5 rounded-md bg-emerald-950/90 border border-emerald-600/80 text-emerald-200 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{optimizerNotice}</span>
          </div>
          <button
            onClick={() => setOptimizerNotice(null)}
            className="text-emerald-400 hover:text-white font-mono text-xs px-1"
          >
            ✕
          </button>
        </div>
      )}
    </header>
  );
};
