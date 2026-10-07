import React, { useState } from 'react';
import { useWorkflow } from '../context/WorkflowContext';
import { FileText, Sun, Moon, Calendar, AlertTriangle, CheckCircle, ArrowRight, X } from 'lucide-react';

interface DailyBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DailyBriefModal: React.FC<DailyBriefModalProps> = ({ isOpen, onClose }) => {
  const { projects, tasks, users, capacities, blockers, actionRecommendations } = useWorkflow();
  const [tab, setTab] = useState<'morning' | 'eod' | 'weekly'>('morning');

  if (!isOpen) return null;

  const criticalProjects = projects.filter(p => p.health.status === 'critical' || p.priority === 'critical');
  const atRiskProjects = projects.filter(p => p.health.status === 'at_risk');
  const openBlockers = blockers.filter(b => b.status === 'open');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const activeTasks = tasks.filter(t => t.status !== 'completed');

  // Top priorities
  const topPriorities = activeTasks
    .filter(t => t.priority === 'critical' || t.priority === 'high')
    .slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl bg-[#0f1624] border border-[#2b3a56] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="px-6 py-4 bg-[#141e30] border-b border-[#222f46] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-white text-base">OPERATIONAL INTELLIGENCE BRIEF</span>
              <p className="text-[11px] text-slate-400">
                Automated daily executive synthesis — {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-[#202c42] bg-[#0b101a] px-6 gap-4">
          <button
            onClick={() => setTab('morning')}
            className={`py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
              tab === 'morning'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-400" />
            <span>Today's Operations Brief (Morning)</span>
          </button>
          <button
            onClick={() => setTab('eod')}
            className={`py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
              tab === 'eod'
                ? 'border-indigo-400 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Moon className="w-4 h-4 text-indigo-400" />
            <span>End-of-Day Review (Evening)</span>
          </button>
          <button
            onClick={() => setTab('weekly')}
            className={`py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
              tab === 'weekly'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span>7-Day &amp; 30-Day Forecast</span>
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 text-xs text-slate-200 bg-[#0f1624]">
          {tab === 'morning' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-[#141b2b] border border-[#232f45]">
                  <div className="text-[11px] font-bold text-rose-400 flex items-center gap-1.5 uppercase">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Critical Projects</span>
                  </div>
                  <div className="text-xl font-extrabold text-white mt-1">{criticalProjects.length}</div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {criticalProjects.map(p => p.name).join(', ') || 'None'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#141b2b] border border-[#232f45]">
                  <div className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5 uppercase">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Active Blockers</span>
                  </div>
                  <div className="text-xl font-extrabold text-white mt-1">{openBlockers.length}</div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Cloud VPC Egress &amp; AWS token throttles
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#141b2b] border border-[#232f45]">
                  <div className="text-[11px] font-bold text-cyan-400 flex items-center gap-1.5 uppercase">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Avg Capacity Health</span>
                  </div>
                  <div className="text-xl font-extrabold text-white mt-1">79%</div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Within healthy &lt;85% threshold; 15% buffer intact
                  </div>
                </div>
              </div>

              {/* Today's Priorities */}
              <div className="p-4 rounded-xl bg-[#131b2a] border border-[#222e44] space-y-2.5">
                <div className="font-bold text-white text-sm">Today's Key Priorities</div>
                <div className="space-y-2">
                  {topPriorities.map(t => {
                    const u = users.find(usr => usr.id === t.assigneeId);
                    return (
                      <div key={t.id} className="p-2.5 rounded-lg bg-[#0c121d] border border-[#1e283d] flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-white">{t.title}</div>
                          <div className="text-[11px] text-slate-400">
                            Assigned: <strong className="text-slate-300">{u?.name}</strong> • Remaining: {t.remainingHours}h • Due: {t.dueDate}
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          t.priority === 'critical' ? 'bg-rose-950 text-rose-300' : 'bg-amber-950 text-amber-300'
                        }`}>
                          {t.priority}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recommended Actions */}
              <div className="p-4 rounded-xl bg-[#131b2a] border border-[#222e44] space-y-2.5">
                <div className="font-bold text-white text-sm">3–5 Recommended Management Actions</div>
                <ol className="list-decimal pl-5 space-y-1.5 text-slate-300 leading-relaxed">
                  <li>Triage Cloud Provider egress throttling on Project Nexus to prevent 2.5-day schedule slip.</li>
                  <li>Shift 7h non-critical frontend backlog from Maya Lin to Devon Miller to protect Maya's 8h daily limit.</li>
                  <li>Verify Kai Tanaka's pre-leave handover plan prior to approved absence starting Oct 12.</li>
                  <li>Convert Thursday's 2-hour architecture sync into asynchronous written RFC review to save 6h team focus time.</li>
                </ol>
              </div>
            </div>
          )}

          {tab === 'eod' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-[#131b2a] border border-[#222e44] space-y-3">
                <div className="font-bold text-white text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Work Completed Today</span>
                </div>
                <div className="text-slate-300">
                  {completedTasks.length} milestone tickets completed without recorded overtime. All items verified against automated regression suites.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#131b2a] border border-[#222e44] space-y-2">
                <div className="font-bold text-white text-sm">Carryover &amp; Adjustments</div>
                <p className="text-slate-300 leading-relaxed">
                  3 tasks carrying over to tomorrow's schedule. In accordance with WORKFLOW OS principles, carryover is treated as **planning calibration data**, never for employee shaming.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#131b2a] border border-[#222e44] space-y-2">
                <div className="font-bold text-white text-sm">Tomorrow's Focus</div>
                <p className="text-slate-300 leading-relaxed">
                  Priority 1: Geo-Distributed CockroachDB benchmark run. Available team productive hours budgeted: 32.4h with 4.8h contingency buffer.
                </p>
              </div>
            </div>
          )}

          {tab === 'weekly' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-[#131b2a] border border-[#222e44] space-y-2">
                <div className="font-bold text-cyan-300 text-sm">Next 7 Days Outlook</div>
                <ul className="space-y-1.5 text-slate-300 list-disc pl-5 leading-relaxed">
                  <li>Oct 09: Project Pulse frontend milestone demo. (Current forecast: on schedule).</li>
                  <li>Oct 12–14: Approved Annual Leave for Kai Tanaka. Pre-leave handover assigned to Maya Lin.</li>
                  <li>Oct 16: Project Nexus sharding freeze. At risk unless egress blocker resolved by Oct 07.</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-[#131b2a] border border-[#222e44] space-y-2">
                <div className="font-bold text-cyan-300 text-sm">Next 30 Days Capacity Forecast</div>
                <ul className="space-y-1.5 text-slate-300 list-disc pl-5 leading-relaxed">
                  <li>SOC2 / ISO-27001 statutory compliance review on Oct 20.</li>
                  <li>Total budgeted team effort: 640 hours. Planned available productive capacity: 688 hours (Healthy +7% margin).</li>
                  <li>Zero scheduled weekend or night shifts required.</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
