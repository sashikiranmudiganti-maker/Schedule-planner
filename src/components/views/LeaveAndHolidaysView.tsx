import React, { useState } from 'react';
import { useWorkflow } from '../../context/WorkflowContext';
import { generatePreLeaveHandoverPlan } from '../../engine/handoverEngine';
import {
  Palmtree,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  UserCheck,
  FileCheck,
  Check,
  Sparkles,
} from 'lucide-react';

export const LeaveAndHolidaysView: React.FC = () => {
  const { leaveRecords, users, tasks, capacities } = useWorkflow();
  const [selectedLeaveId, setSelectedLeaveId] = useState<string>(leaveRecords[0]?.id || '');

  const activeLeave = leaveRecords.find(l => l.id === selectedLeaveId) || leaveRecords[0];
  const leaveEmployee = users.find(u => u.id === activeLeave?.employeeId);

  const handoverPlan = (activeLeave && leaveEmployee)
    ? generatePreLeaveHandoverPlan(activeLeave, leaveEmployee, tasks, users, capacities)
    : null;

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#111927] to-[#152332] border border-[#233148] shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800">
              Leave &amp; Rest Protection
            </span>
            <span className="text-xs text-slate-400">Section 14 Statutory Compliance</span>
          </div>
          <h1 className="text-xl font-extrabold text-white mt-1">
            Approved Leave &amp; Pre-Leave Handover System
          </h1>
          <p className="text-xs text-slate-300">
            Approved leave is treated as a fixed constraint. The system guarantees business continuity without pressuring staff to cancel leave.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-700/80 text-emerald-300 text-xs font-mono">
          <ShieldCheck className="w-4 h-4" />
          <span>Statutory Rest Preserved</span>
        </div>
      </div>

      {/* Main Grid: Scheduled Approved Leave Calendar (Left 4 cols) & Pre-Leave Handover Plan (Right 8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Approved Leave List */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-[#121927] border border-[#202c40] space-y-4">
          <h2 className="text-xs font-bold uppercase text-white tracking-wider flex items-center gap-2">
            <Palmtree className="w-4 h-4 text-emerald-400" />
            <span>Approved Employee Leave</span>
          </h2>

          <div className="space-y-2.5">
            {leaveRecords.map(leave => {
              const emp = users.find(u => u.id === leave.employeeId);
              const isSelected = selectedLeaveId === leave.id;

              return (
                <div
                  key={leave.id}
                  onClick={() => setSelectedLeaveId(leave.id)}
                  className={`p-3 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-950/40 border-emerald-500 shadow-md ring-1 ring-emerald-500/50'
                      : 'bg-[#0f1522] border-[#1d273a] hover:bg-[#162033]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img src={emp?.avatar} alt={emp?.name} className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <div className="font-bold text-white text-xs">{emp?.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {leave.startDate} → {leave.endDate}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="uppercase font-semibold text-emerald-400">{leave.type.replace('_', ' ')}</span>
                    <span className="font-mono text-emerald-300">✓ Handover active</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Company Holidays */}
          <div className="pt-4 border-t border-[#1e2a3f] space-y-2">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Upcoming Company Shutdown Days:
            </div>
            <div className="p-2.5 rounded-lg bg-[#0d131f] border border-[#1b2538] text-xs space-y-1">
              <div className="flex justify-between text-slate-200">
                <span>Autumn Governance Recess</span>
                <span className="font-mono text-cyan-300">Oct 26</span>
              </div>
              <div className="text-[10px] text-slate-500">Official company holiday; capacity is zeroed out.</div>
            </div>
          </div>
        </div>

        {/* Pre-Leave Handover Plan Detail */}
        <div className="lg:col-span-8 space-y-4">
          {handoverPlan ? (
            <div className="p-5 rounded-2xl bg-[#121927] border border-[#202c40] space-y-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold uppercase text-emerald-400 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800">
                      Automated Handover Plan
                    </span>
                    <h2 className="font-extrabold text-white text-sm">
                      {handoverPlan.employee.name} ({handoverPlan.leaveRecord.startDate} to {handoverPlan.leaveRecord.endDate})
                    </h2>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    {handoverPlan.actionSummary}
                  </p>
                </div>
              </div>

              {/* Backup Assignee Card */}
              <div className="p-4 rounded-xl bg-[#0e1522] border border-[#1d293d] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={handoverPlan.recommendedBackup.avatar} alt={handoverPlan.recommendedBackup.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Designated Backup Owner</div>
                    <div className="font-bold text-white text-sm">{handoverPlan.recommendedBackup.name}</div>
                    <div className="text-[11px] text-slate-400">{handoverPlan.recommendedBackup.title}</div>
                  </div>
                </div>

                <div className="text-right text-xs font-mono">
                  <div className="text-emerald-400 font-bold">100% Verified Buffer</div>
                  <div className="text-slate-400 text-[11px]">No capacity overload created</div>
                </div>
              </div>

              {/* Handover Checklist */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-cyan-400" />
                  <span>Pre-Leave Handover Checklist:</span>
                </div>

                <div className="space-y-2">
                  {handoverPlan.checklist.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-[#0b101a] border border-[#1a2538] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                          item.completed ? 'bg-emerald-950 text-emerald-400 border border-emerald-600' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {item.completed ? <Check className="w-3 h-3" /> : <span className="text-[10px]">{idx + 1}</span>}
                        </div>
                        <span className={item.completed ? 'text-slate-200' : 'text-slate-400'}>{item.step}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono shrink-0">{item.responsible}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Safety notice */}
              <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-900/40 text-[11px] text-blue-300 leading-relaxed">
                <strong>Policy Guarantee:</strong> Employee leave requests approved by HR are locked against arbitrary cancellation. Workloads are adjusted around human rest, never the inverse.
              </div>
            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl bg-[#121927] border border-[#202c40] text-slate-400 text-xs">
              Select an approved leave record to inspect its automated handover plan.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
