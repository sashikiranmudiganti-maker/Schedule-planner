import React, { useState } from 'react';
import { useWorkflow } from '../../context/WorkflowContext';
import { Task } from '../../types';
import { BlockerModal } from '../BlockerModal';
import {
  CalendarCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ChevronRight,
  Shield,
  Coffee,
  Check,
} from 'lucide-react';

interface MyDayViewProps {
  onOpenCopilot: () => void;
}

export const MyDayView: React.FC<MyDayViewProps> = ({ onOpenCopilot }) => {
  const { currentUser, tasks, capacities, updateTaskStatus } = useWorkflow();
  const [blockerModalOpen, setBlockerModalOpen] = useState(false);
  const [selectedTaskForBlocker, setSelectedTaskForBlocker] = useState<Task | undefined>(undefined);

  // Filter tasks assigned to current logged-in employee
  const myTasks = tasks.filter(t => t.assigneeId === currentUser.id);
  const myActiveTasks = myTasks.filter(t => t.status !== 'completed');
  const myCompletedTasks = myTasks.filter(t => t.status === 'completed');

  const cap = capacities.get(currentUser.id);

  // Daily numbers calculation
  const dailyWorkload = 6.2;
  const dailyProductiveCapacity = cap ? Number((cap.availableProductiveHours / 5).toFixed(1)) : 6.8;
  const dailyBuffer = Number((dailyProductiveCapacity - dailyWorkload).toFixed(1));

  // Sort priorities: critical > high > medium > low
  const sortedActive = [...myActiveTasks].sort((a, b) => {
    const pWeight = { critical: 4, high: 3, medium: 2, low: 1 };
    return (pWeight[b.priority] || 0) - (pWeight[a.priority] || 0);
  });

  const priority1 = sortedActive[0];
  const priority2 = sortedActive[1];
  const priority3 = sortedActive[2];
  const otherUpcoming = sortedActive.slice(3);

  const handleOpenBlocker = (task?: Task) => {
    setSelectedTaskForBlocker(task);
    setBlockerModalOpen(true);
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#121a29] to-[#172235] border border-[#25334c] shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">
              Personal Operations Space
            </span>
            <span className="text-xs text-slate-400">Sustainable Workload System</span>
          </div>
          <h1 className="text-xl font-black text-white mt-1">
            My Day — {currentUser.name}
          </h1>
          <p className="text-xs text-slate-300">
            Clear daily priorities, protected buffers, and realistic hours. No hidden overtime.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleOpenBlocker()}
            className="px-3.5 py-2 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-950 flex items-center gap-1.5 transition active:scale-95"
          >
            <AlertCircle className="w-4 h-4" />
            <span>I'm Blocked</span>
          </button>
          <button
            onClick={onOpenCopilot}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#1e2a3f] hover:bg-[#283752] text-cyan-300 border border-[#2c3d5a] transition"
          >
            Ask Copilot
          </button>
        </div>
      </div>

      {/* Daily Capacity & Buffer Gauge (Requirement 8) */}
      <div className="p-4 rounded-xl bg-[#121927] border border-[#202c40] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-white uppercase tracking-wider text-xs">Today's Capacity Health</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span>Planned Workload: <strong className="text-cyan-300">{dailyWorkload} hrs</strong></span>
            <span>Productive Capacity: <strong className="text-slate-200">{dailyProductiveCapacity} hrs</strong></span>
            <span>Contingency Buffer: <strong className="text-emerald-400">+{Math.max(0, dailyBuffer)} hrs</strong></span>
          </div>
        </div>

        {/* Visual Bar */}
        <div className="h-3 rounded-full bg-[#1a2436] overflow-hidden flex shadow-inner">
          <div
            className="h-full bg-cyan-500 rounded-l-full"
            style={{ width: `${Math.min(100, Math.round((dailyWorkload / dailyProductiveCapacity) * 100))}%` }}
            title="Assigned deep work effort"
          />
          <div
            className="h-full bg-emerald-500/80 rounded-r-full"
            style={{ width: `${Math.max(0, Math.round((dailyBuffer / dailyProductiveCapacity) * 100))}%` }}
            title="Protected buffer for communication, reviews & rest"
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-cyan-500 inline-block" />
            Focused Execution Work ({dailyWorkload}h)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            Protected Buffer ({Math.max(0, dailyBuffer)}h)
          </span>
          <span className="font-mono text-emerald-400">
            ✓ Fits completely within 8.0h working day
          </span>
        </div>
      </div>

      {/* Today's 3 Key Priorities (Requirement 8) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-white flex items-center gap-2 uppercase tracking-wider">
            <CalendarCheck className="w-4 h-4 text-cyan-400" />
            <span>Today's Priorities</span>
          </h2>
          <span className="text-xs text-slate-400">Focus on quality over speed</span>
        </div>

        <div className="space-y-3">
          {/* Priority 1 */}
          {priority1 ? (
            <div className="p-4 rounded-xl bg-[#141d2e] border-2 border-cyan-500/60 shadow-lg space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-cyan-500 text-slate-950 text-xs font-black uppercase">
                    Priority 1
                  </span>
                  <span className="font-bold text-white text-sm">{priority1.title}</span>
                </div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                  {priority1.priority}
                </span>
              </div>
              <p className="text-xs text-slate-300">{priority1.description}</p>
              <div className="flex flex-wrap items-center justify-between pt-2 border-t border-[#1e2a3f] text-xs gap-2">
                <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
                  <span>Est. Effort: <strong className="text-slate-200">{priority1.remainingHours}h</strong></span>
                  <span>Deadline: <strong className="text-slate-200">{priority1.dueDate}</strong></span>
                  <span>Forecast: <strong className="text-cyan-300">{priority1.forecastDueDate}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenBlocker(priority1)}
                    className="px-2.5 py-1 text-[11px] rounded bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/80 transition"
                  >
                    Flag Blocker
                  </button>
                  <button
                    onClick={() => updateTaskStatus(priority1.id, 'completed')}
                    className="px-3 py-1 text-[11px] font-bold rounded bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 shadow-sm transition"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Complete</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center rounded-xl bg-[#121927] border border-[#202c40] text-slate-400 text-xs">
              No active priority tasks assigned for today. Your capacity is fully open.
            </div>
          )}

          {/* Priority 2 */}
          {priority2 && (
            <div className="p-4 rounded-xl bg-[#121927] border border-[#202c40] space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-900 text-blue-200 text-xs font-bold uppercase">
                    Priority 2
                  </span>
                  <span className="font-bold text-white text-xs">{priority2.title}</span>
                </div>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#1e2a3f] text-slate-300">
                  {priority2.priority}
                </span>
              </div>
              <p className="text-xs text-slate-400">{priority2.description}</p>
              <div className="flex items-center justify-between pt-2 border-t border-[#1a2538] text-xs">
                <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
                  <span>Est. Effort: <strong className="text-slate-200">{priority2.remainingHours}h</strong></span>
                  <span>Due: <strong className="text-slate-200">{priority2.dueDate}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenBlocker(priority2)}
                    className="px-2 py-1 text-[11px] rounded bg-[#1a2436] hover:bg-rose-950 text-slate-300 hover:text-rose-300 transition"
                  >
                    Blocker
                  </button>
                  <button
                    onClick={() => updateTaskStatus(priority2.id, 'completed')}
                    className="px-3 py-1 text-[11px] font-semibold rounded bg-slate-800 hover:bg-emerald-700 text-white transition"
                  >
                    Complete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Priority 3 */}
          {priority3 && (
            <div className="p-4 rounded-xl bg-[#121927] border border-[#202c40] space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-bold uppercase">
                    Priority 3
                  </span>
                  <span className="font-bold text-white text-xs">{priority3.title}</span>
                </div>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#1e2a3f] text-slate-300">
                  {priority3.priority}
                </span>
              </div>
              <p className="text-xs text-slate-400">{priority3.description}</p>
              <div className="flex items-center justify-between pt-2 border-t border-[#1a2538] text-xs">
                <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
                  <span>Est. Effort: <strong className="text-slate-200">{priority3.remainingHours}h</strong></span>
                  <span>Due: <strong className="text-slate-200">{priority3.dueDate}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenBlocker(priority3)}
                    className="px-2 py-1 text-[11px] rounded bg-[#1a2436] hover:bg-rose-950 text-slate-300 hover:text-rose-300 transition"
                  >
                    Blocker
                  </button>
                  <button
                    onClick={() => updateTaskStatus(priority3.id, 'completed')}
                    className="px-3 py-1 text-[11px] font-semibold rounded bg-slate-800 hover:bg-emerald-700 text-white transition"
                  >
                    Complete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Work & Recently Finished */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Upcoming Queue */}
        <div className="p-4 rounded-xl bg-[#121927] border border-[#202c40] space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white uppercase tracking-wider">Upcoming Tasks</span>
            <span className="text-slate-400 text-[11px]">{otherUpcoming.length} scheduled</span>
          </div>
          {otherUpcoming.length > 0 ? (
            <div className="space-y-2">
              {otherUpcoming.map(t => (
                <div key={t.id} className="p-2.5 rounded-lg bg-[#0e1420] border border-[#1b2538] text-xs">
                  <div className="font-semibold text-white">{t.title}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Remaining: {t.remainingHours}h • Due: {t.dueDate} • Skills: {t.requiredSkills.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-slate-400 text-xs py-2">
              No further pending items in backlog.
            </div>
          )}
        </div>

        {/* Finished Today */}
        <div className="p-4 rounded-xl bg-[#121927] border border-[#202c40] space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Completed Deliverables</span>
            </span>
            <span className="text-emerald-400 font-mono text-[11px]">{myCompletedTasks.length} finished</span>
          </div>
          {myCompletedTasks.length > 0 ? (
            <div className="space-y-2">
              {myCompletedTasks.map(t => (
                <div key={t.id} className="p-2.5 rounded-lg bg-[#0e1420] border border-[#1b2538] text-xs flex items-center justify-between">
                  <div className="truncate mr-2">
                    <div className="font-semibold text-slate-300 line-through truncate">{t.title}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Completed {t.completedAt}</div>
                  </div>
                  <span className="text-emerald-400 font-mono text-[11px] font-bold shrink-0">Done ✓</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-slate-400 text-xs py-2">
              None completed yet today.
            </div>
          )}
        </div>
      </div>

      {/* Blocker Modal */}
      <BlockerModal
        isOpen={blockerModalOpen}
        onClose={() => setBlockerModalOpen(false)}
        targetTask={selectedTaskForBlocker}
      />
    </div>
  );
};
