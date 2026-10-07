import React, { useState } from 'react';
import { useWorkflow } from '../../context/WorkflowContext';
import {
  FileText,
  Sun,
  Moon,
  Calendar,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';

export const DailyBriefView: React.FC = () => {
  const { projects, tasks, users, capacities, blockers, actionRecommendations } = useWorkflow();
  const [activeTab, setActiveTab] = useState<'morning' | 'eod' | 'weekly' | 'metrics'>('morning');

  const criticalProjects = projects.filter(p => p.health.status === 'critical' || p.priority === 'critical');
  const atRiskProjects = projects.filter(p => p.health.status === 'at_risk');
  const openBlockers = blockers.filter(b => b.status === 'open');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const activeTasks = tasks.filter(t => t.status !== 'completed');

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#111927] to-[#172236] border border-[#233148] shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400 px-2 py-0.5 rounded bg-blue-950 border border-blue-800">
              Operations Intelligence
            </span>
            <span className="text-xs text-slate-400">Sections 23, 24, 25 &amp; 32</span>
          </div>
          <h1 className="text-xl font-extrabold text-white mt-1">
            Operations Briefs &amp; Organizational Health
          </h1>
          <p className="text-xs text-slate-300">
            Automated morning syntheses, constructive end-of-day retrospectives, and 30-day capacity forecasts.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 bg-[#121c2d] px-3 py-2 rounded-xl border border-[#223350]">
          <Calendar className="w-4 h-4" />
          <span>October 06, 2026</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#202c42] bg-[#0c121d] px-4 rounded-xl gap-6">
        <button
          onClick={() => setActiveTab('morning')}
          className={`py-3.5 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'morning'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sun className="w-4 h-4 text-amber-400" />
          <span>Morning Operations Brief</span>
        </button>

        <button
          onClick={() => setActiveTab('eod')}
          className={`py-3.5 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'eod'
              ? 'border-indigo-400 text-indigo-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Moon className="w-4 h-4 text-indigo-400" />
          <span>End-of-Day Review</span>
        </button>

        <button
          onClick={() => setActiveTab('weekly')}
          className={`py-3.5 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'weekly'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4 text-cyan-400" />
          <span>Weekly &amp; 30-Day Forecast</span>
        </button>

        <button
          onClick={() => setActiveTab('metrics')}
          className={`py-3.5 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'metrics'
              ? 'border-emerald-400 text-emerald-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          <span>Success Metrics (Sec 32)</span>
        </button>
      </div>

      {/* Content */}
      <div className="p-6 rounded-2xl bg-[#121927] border border-[#202c40] space-y-6">
        {activeTab === 'morning' && (
          <div className="space-y-5">
            <h2 className="text-base font-bold text-white">TODAY'S OPERATIONS BRIEF</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-[#0e1420] border border-[#1b2538]">
                <div className="text-[10px] font-bold text-rose-400 uppercase">Critical Projects</div>
                <div className="text-xl font-black text-white mt-1">{criticalProjects.length}</div>
                <div className="text-[11px] text-slate-400 mt-1">Project Nexus</div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0e1420] border border-[#1b2538]">
                <div className="text-[10px] font-bold text-amber-400 uppercase">At-Risk Forecasts</div>
                <div className="text-xl font-black text-white mt-1">{atRiskProjects.length}</div>
                <div className="text-[11px] text-slate-400 mt-1">Project Shield</div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0e1420] border border-[#1b2538]">
                <div className="text-[10px] font-bold text-rose-400 uppercase">Blocked Tasks</div>
                <div className="text-xl font-black text-white mt-1">{openBlockers.length}</div>
                <div className="text-[11px] text-slate-400 mt-1">VPC Latency Throttle</div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0e1420] border border-[#1b2538]">
                <div className="text-[10px] font-bold text-emerald-400 uppercase">Buffer Health</div>
                <div className="text-xl font-black text-emerald-300 mt-1">15.0%</div>
                <div className="text-[11px] text-slate-400 mt-1">Zero chronic overtime</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#0e1420] border border-[#1b2538] space-y-2">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Recommended Actions for Management Today:
              </div>
              <ol className="list-decimal pl-5 space-y-1.5 text-xs text-slate-300 leading-relaxed">
                <li>Pair Site Reliability Lead with Software Eng to resolve the AWS VPC egress blocker on Project Nexus.</li>
                <li>Shift 7 hours of low-priority backlog from Maya Lin to Devon Miller to maintain Maya's &lt;85% load.</li>
                <li>Review Kai Tanaka's pre-leave handover plan prior to annual leave starting next week.</li>
                <li>Audit quality metrics on Project Shield to prevent velocity pressure from increasing bug rates.</li>
              </ol>
            </div>
          </div>
        )}

        {activeTab === 'eod' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white">END-OF-DAY REVIEW</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              WORKFLOW OS Principle: Unfinished work is planning calibration information, never a tool for employee shaming.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#0e1420] border border-[#1b2538] space-y-2">
                <div className="text-xs font-bold text-emerald-400 uppercase">Completed Deliverables</div>
                <p className="text-xs text-slate-300">
                  {completedTasks.length} major deliverables passed automated peer review and integration testing today.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0e1420] border border-[#1b2538] space-y-2">
                <div className="text-xs font-bold text-amber-400 uppercase">Carryover Items</div>
                <p className="text-xs text-slate-300">
                  3 tasks carrying over to tomorrow morning. Automatically integrated into tomorrow's 6.2h budgeted schedule.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'weekly' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white">FORECAST: NEXT 7 &amp; 30 DAYS</h2>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-4 rounded-xl bg-[#0e1420] border border-[#1b2538] space-y-2">
                <div className="font-bold text-cyan-300">Next 7 Days (Tactical Delivery)</div>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Oct 09: Project Pulse frontend milestone delivery (On Schedule).</li>
                  <li>Oct 12–14: Approved Annual Leave for Kai Tanaka (Handover mapped).</li>
                  <li>Oct 16: Project Nexus Geo-replication deadline.</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-[#0e1420] border border-[#1b2538] space-y-2">
                <div className="font-bold text-cyan-300">Next 30 Days (Strategic Capacity)</div>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Total budgeted team effort: 640 hours. Planned productive capacity: 688 hours (+7% margin).</li>
                  <li>SOC2 / ISO-27001 statutory compliance review on Oct 20.</li>
                  <li>Zero overtime forecasted across all 4 departments.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'metrics' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white">ORGANIZATIONAL SUCCESS METRICS (Section 32)</h2>
            <p className="text-xs text-slate-400">
              Measuring organizational improvement without optimizing for dangerous “100% utilization”.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#0e1420] border border-[#1b2538]">
                <div className="text-[10px] text-slate-400 uppercase font-bold">On-Time Delivery Rate</div>
                <div className="text-xl font-black text-emerald-400 mt-1">94.2%</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Historical sprint average</div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0e1420] border border-[#1b2538]">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Schedule Accuracy</div>
                <div className="text-xl font-black text-cyan-400 mt-1">91.8%</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Estimated vs actual duration</div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0e1420] border border-[#1b2538]">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Overtime Frequency</div>
                <div className="text-xl font-black text-emerald-400 mt-1">0.0%</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Strict policy enforcement</div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0e1420] border border-[#1b2538]">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Avg Blocker Resolution</div>
                <div className="text-xl font-black text-white mt-1">4.2 hrs</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Down from 2.5 days</div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0e1420] border border-[#1b2538]">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Protected Buffer</div>
                <div className="text-xl font-black text-indigo-400 mt-1">15.0%</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Guaranteed slack for reviews</div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0e1420] border border-[#1b2538]">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Post-Release Rework Rate</div>
                <div className="text-xl font-black text-amber-300 mt-1">4.8%</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Monitored for speed trade-off</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
