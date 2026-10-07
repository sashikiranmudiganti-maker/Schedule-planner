import React, { useState } from 'react';
import { useWorkflow } from '../../context/WorkflowContext';
import { Project, Task } from '../../types';
import { TaskAllocationModal } from '../TaskAllocationModal';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  ShieldCheck,
  TrendingUp,
  Layers,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface CommandCenterViewProps {
  onOpenCopilot: () => void;
  onOpenScenarioLab: () => void;
}

export const CommandCenterView: React.FC<CommandCenterViewProps> = ({
  onOpenCopilot,
  onOpenScenarioLab,
}) => {
  const {
    projects,
    tasks,
    users,
    capacities,
    blockers,
    actionRecommendations,
    resolveBlocker,
    optimizePlan,
  } = useWorkflow();

  const [selectedProject, setSelectedProject] = useState<Project | null>(projects[0] || null);
  const [filterDept, setFilterDept] = useState<string>('all');
  const [allocationTask, setAllocationTask] = useState<Task | null>(null);

  // Aggregated metrics
  const activeProjectsCount = projects.filter(p => p.status === 'in_progress' || p.status === 'planning').length;
  const atRiskProjectsCount = projects.filter(p => p.health.status === 'at_risk' || p.health.status === 'critical').length;
  const openBlockers = blockers.filter(b => b.status === 'open');
  const completedTasksCount = tasks.filter(t => t.status === 'completed').length;
  const totalTasksCount = tasks.length;

  const overloadedEmployees = Array.from(capacities.values()).filter(
    c => c.status === 'overloaded' || c.status === 'critical'
  );

  const availableEmployees = Array.from(capacities.values()).filter(
    c => c.status === 'available'
  );

  const filteredProjects = filterDept === 'all'
    ? projects
    : projects.filter(p => p.departmentId === filterDept);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner / Philosophy reminder */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#111927] via-[#152033] to-[#0e1624] border border-[#233148] shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">
              Operations Control
            </span>
            <span className="text-xs text-slate-400">Live Continuous Capacity &amp; Delivery Engine</span>
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">
            Team Command Center
          </h1>
          <p className="text-xs text-slate-300">
            Monitoring delivery velocity against strict working-hour limits. Zero chronic overtime tolerated.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={optimizePlan}
            className="px-3.5 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950 transition flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Balance Capacity</span>
          </button>
          <button
            onClick={onOpenCopilot}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#1a2538] hover:bg-[#23324d] text-cyan-300 border border-[#2b3d5b] transition"
          >
            Ask Copilot
          </button>
        </div>
      </div>

      {/* High-Density Operational KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Active & At-Risk Projects */}
        <div className="p-4 rounded-xl bg-[#121927] border border-[#202c40] space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Active Projects</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{activeProjectsCount}</span>
            {atRiskProjectsCount > 0 ? (
              <span className="text-[11px] font-bold text-rose-400 font-mono">
                ({atRiskProjectsCount} at risk)
              </span>
            ) : (
              <span className="text-[11px] font-bold text-emerald-400 font-mono">
                (All on track)
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-400">
            {Math.round((completedTasksCount / Math.max(1, totalTasksCount)) * 100)}% overall completion rate
          </div>
        </div>

        {/* Active Blockers */}
        <div className="p-4 rounded-xl bg-[#121927] border border-[#202c40] space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Critical Path Blockers</span>
            <AlertTriangle className={`w-4 h-4 ${openBlockers.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{openBlockers.length}</span>
            <span className={`text-[11px] font-bold font-mono ${openBlockers.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {openBlockers.length > 0 ? 'Immediate action required' : 'Zero blockers'}
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            Impact: inter-service latency &amp; approval gates
          </div>
        </div>

        {/* Overloaded Staff vs Spare Capacity */}
        <div className="p-4 rounded-xl bg-[#121927] border border-[#202c40] space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Capacity Balance</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{overloadedEmployees.length}</span>
            <span className="text-[11px] font-bold text-amber-400 font-mono">
              overloaded (&gt;85%)
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            {availableEmployees.length} team members have available buffer (&lt;70%)
          </div>
        </div>

        {/* Working Hour Protection Guard */}
        <div className="p-4 rounded-xl bg-[#121927] border border-[#202c40] space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Working-Hour Guard</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400">100%</span>
            <span className="text-[11px] font-bold text-emerald-300 font-mono">
              Policy Enforced
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            Approved leaves protected; 0 forced overtime
          </div>
        </div>
      </div>

      {/* Open Blockers Alert Strip if any */}
      {openBlockers.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/60 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>Active Blocker Impacting Delivery Schedule:</span>
            </div>
            <span className="text-[11px] font-mono text-rose-400">Resolving recovers up to 2.5 days</span>
          </div>
          {openBlockers.map(b => {
            const task = tasks.find(t => t.id === b.taskId);
            return (
              <div key={b.id} className="p-2.5 rounded-lg bg-[#0f141f] border border-rose-900/40 flex items-center justify-between gap-4">
                <div>
                  <span className="font-semibold text-white">Task: {task?.title || b.taskId}</span>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    Category: <strong className="text-rose-300">{b.category}</strong> • Details: {b.details}
                  </div>
                </div>
                <button
                  onClick={() => resolveBlocker(b.id)}
                  className="px-3 py-1 rounded bg-rose-800 hover:bg-rose-700 text-white text-[11px] font-bold transition shrink-0"
                >
                  Mark Resolved
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Main Grid: Projects Health & Timeline (Left 7 cols) & Workload Heatmap / Capacity (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Project Health & Deep Dive */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Project Health &amp; Deadline Forecasts</span>
            </h2>
            <div className="text-[11px] text-slate-400">
              Multi-factor calculation (Not a mystery number)
            </div>
          </div>

          {/* Project List Cards */}
          <div className="space-y-3">
            {filteredProjects.map(proj => {
              const isSelected = selectedProject?.id === proj.id;
              const statusColor = proj.health.status === 'healthy'
                ? 'text-emerald-400 border-emerald-800/60 bg-emerald-950/20'
                : proj.health.status === 'needs_attention'
                ? 'text-amber-400 border-amber-800/60 bg-amber-950/20'
                : 'text-rose-400 border-rose-800/60 bg-rose-950/20';

              return (
                <div
                  key={proj.id}
                  onClick={() => setSelectedProject(proj)}
                  className={`p-4 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-[#151f30] border-cyan-500 shadow-md ring-1 ring-cyan-500/50'
                      : 'bg-[#121927] border-[#202c40] hover:bg-[#172235]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white text-sm">{proj.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1e2a3f] text-slate-300">
                          {proj.key}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{proj.description}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className={`px-2.5 py-1 rounded-lg border text-xs font-extrabold font-mono ${statusColor}`}>
                        Health: {proj.health.overall}/100
                      </div>
                      <div className="text-[10px] uppercase font-bold text-slate-400 mt-1">
                        {proj.health.status.replace('_', ' ')}
                      </div>
                    </div>
                  </div>

                  {/* Progress & Deadlines */}
                  <div className="mt-3 pt-3 border-t border-[#1d293d] grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400">Progress</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex-1 h-2 rounded-full bg-[#1b2537] overflow-hidden">
                          <div
                            className="h-full bg-cyan-500 rounded-full"
                            style={{ width: `${proj.progress}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] text-cyan-300 font-bold">{proj.progress}%</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-400">Planned Deadline</div>
                      <div className="text-slate-200 font-mono mt-0.5">{proj.plannedEndDate}</div>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-400">Forecast Completion</div>
                      <div className={`font-mono font-bold mt-0.5 ${
                        proj.forecastEndDate > proj.plannedEndDate ? 'text-rose-400' : 'text-emerald-400'
                      }`}>
                        {proj.forecastEndDate}
                        {proj.forecastEndDate > proj.plannedEndDate && ' (Late)'}
                      </div>
                    </div>
                  </div>

                  {/* Why explanation preview */}
                  <div className="mt-2.5 p-2 rounded-lg bg-[#0d131f] border border-[#1b2538] text-[11px] text-slate-300">
                    <strong className="text-cyan-400">Why {proj.health.overall}/100: </strong>
                    <span>{proj.health.explanation[0]}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Health Breakdown & Factor Weights for Selected Project */}
          {selectedProject && (
            <div className="p-4 rounded-xl bg-[#101726] border border-[#222f46] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-white uppercase tracking-wider">
                  Health Factor Breakdown: {selectedProject.name}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  Score: {selectedProject.health.overall} / 100
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-[#141d2d] border border-[#1e2a3f]">
                  <div className="text-[10px] text-slate-400">Schedule (max 25)</div>
                  <div className="text-sm font-bold text-white font-mono mt-0.5">
                    {selectedProject.health.scheduleScore} / 25
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#141d2d] border border-[#1e2a3f]">
                  <div className="text-[10px] text-slate-400">Completion (max 20)</div>
                  <div className="text-sm font-bold text-white font-mono mt-0.5">
                    {selectedProject.health.completionScore} / 20
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#141d2d] border border-[#1e2a3f]">
                  <div className="text-[10px] text-slate-400">Capacity (max 15)</div>
                  <div className="text-sm font-bold text-white font-mono mt-0.5">
                    {selectedProject.health.capacityScore} / 15
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#141d2d] border border-[#1e2a3f]">
                  <div className="text-[10px] text-slate-400">Dependencies (max 15)</div>
                  <div className="text-sm font-bold text-white font-mono mt-0.5">
                    {selectedProject.health.dependencyScore} / 15
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#141d2d] border border-[#1e2a3f]">
                  <div className="text-[10px] text-slate-400">Blockers (max 15)</div>
                  <div className="text-sm font-bold text-white font-mono mt-0.5">
                    {selectedProject.health.blockerScore} / 15
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#141d2d] border border-[#1e2a3f]">
                  <div className="text-[10px] text-slate-400">Quality (max 10)</div>
                  <div className="text-sm font-bold text-white font-mono mt-0.5">
                    {selectedProject.health.qualityScore} / 10
                  </div>
                </div>
              </div>

              {/* Full explanations */}
              <div className="space-y-1 pt-1">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Audit Explanations:</div>
                <ul className="text-xs text-slate-300 list-disc pl-4 space-y-1">
                  {selectedProject.health.explanation.map((exp, idx) => (
                    <li key={idx}>{exp}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Workload Heatmap & Team Capacities */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>Team Workload Heatmap</span>
            </h2>
            <span className="text-[10px] text-slate-400 font-mono">Buffer Target: 15%</span>
          </div>

          {/* Member Capacity Bars */}
          <div className="p-4 rounded-xl bg-[#121927] border border-[#202c40] space-y-4">
            {users.map(u => {
              const cap = capacities.get(u.id);
              if (!cap) return null;
              const ratioPct = Math.round(cap.workloadRatio * 100);

              let badgeColor = 'bg-emerald-950 text-emerald-300 border-emerald-800';
              let barColor = 'bg-emerald-500';
              if (cap.status === 'overloaded') {
                badgeColor = 'bg-amber-950 text-amber-300 border-amber-800';
                barColor = 'bg-amber-500';
              } else if (cap.status === 'critical') {
                badgeColor = 'bg-rose-950 text-rose-300 border-rose-800';
                barColor = 'bg-rose-500';
              } else if (cap.status === 'available') {
                badgeColor = 'bg-cyan-950 text-cyan-300 border-cyan-800';
                barColor = 'bg-cyan-500';
              }

              return (
                <div key={u.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <img src={u.avatar} alt={u.name} className="w-5 h-5 rounded-full object-cover" />
                      <span className="font-bold text-white">{u.name}</span>
                      <span className="text-[10px] text-slate-400 hidden sm:inline">{u.title.split(' ')[0]}</span>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <span className="text-slate-300">{cap.assignedWorkHours}h / {cap.availableProductiveHours}h</span>
                      <span className={`px-1.5 py-0.2 rounded border text-[10px] font-bold ${badgeColor}`}>
                        {ratioPct}%
                      </span>
                    </div>
                  </div>

                  {/* Visual Capacity Stack */}
                  <div className="h-2 rounded-full bg-[#1c2637] overflow-hidden flex">
                    <div
                      className={`h-full ${barColor} rounded-full transition-all duration-300`}
                      style={{ width: `${Math.min(100, ratioPct)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>Mtgs: {cap.meetingHours}h • Leave: {cap.leaveHours}h</span>
                    <span>Buffer: {cap.reservedBufferHours}h protected</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Active Tasks List with Reallocation button */}
          <div className="p-4 rounded-xl bg-[#121927] border border-[#202c40] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                In-Flight Critical Path Tasks
              </span>
              <span className="text-[10px] text-slate-400">{tasks.filter(t => t.status !== 'completed').length} active</span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {tasks.filter(t => t.status !== 'completed').slice(0, 5).map(task => {
                const assignee = users.find(u => u.id === task.assigneeId);
                return (
                  <div
                    key={task.id}
                    className="p-2.5 rounded-lg bg-[#0e1420] border border-[#1b2538] flex items-center justify-between text-xs hover:border-[#2a3c5a] transition"
                  >
                    <div className="truncate mr-2">
                      <div className="font-semibold text-white truncate">{task.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Assigned: <strong className="text-slate-300">{assignee?.name}</strong> • Remaining: {task.remainingHours}h • Due: {task.dueDate}
                      </div>
                    </div>
                    <button
                      onClick={() => setAllocationTask(task)}
                      className="px-2.5 py-1 rounded bg-[#1c293e] hover:bg-cyan-900/60 text-cyan-300 border border-[#263753] text-[11px] font-semibold transition shrink-0"
                    >
                      Reallocate
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Task Reallocation Recommender Modal */}
      {allocationTask && (
        <TaskAllocationModal
          task={allocationTask}
          isOpen={!!allocationTask}
          onClose={() => setAllocationTask(null)}
        />
      )}
    </div>
  );
};
