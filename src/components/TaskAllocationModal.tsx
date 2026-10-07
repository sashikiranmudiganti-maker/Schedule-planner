import React, { useState } from 'react';
import { useWorkflow } from '../context/WorkflowContext';
import { Task } from '../types';
import { recommendTaskAllocation } from '../engine/allocationEngine';
import { UserCheck, Sparkles, X, Check, ShieldAlert } from 'lucide-react';

interface TaskAllocationModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}

export const TaskAllocationModal: React.FC<TaskAllocationModalProps> = ({
  task,
  isOpen,
  onClose,
}) => {
  const { users, capacities, reassignTask } = useWorkflow();
  const candidates = recommendTaskAllocation(task, users, capacities);
  const [selectedUserId, setSelectedUserId] = useState<string>(candidates[0]?.user.id || '');
  const [reason, setReason] = useState<string>('');

  if (!isOpen) return null;

  const currentAssignee = users.find(u => u.id === task.assigneeId);
  const chosenCandidate = candidates.find(c => c.user.id === selectedUserId);

  const handleAssign = () => {
    if (!selectedUserId) return;
    const finalReason = reason.trim() || chosenCandidate?.recommendationReason || 'Optimized allocation';
    reassignTask(task.id, selectedUserId, finalReason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-[#0f1624] border border-[#2b3a56] rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#141e30] border-b border-[#222f46] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">Intelligent Task Allocation</div>
              <p className="text-[11px] text-slate-400">
                Evaluating skill match, current capacity, buffer protection &amp; fairness
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Task Info Bar */}
        <div className="px-5 py-3 bg-[#111929] border-b border-[#1f2b42] flex items-center justify-between text-xs">
          <div>
            <span className="font-semibold text-white">{task.title}</span>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Effort: <strong>{task.remainingHours || task.estimatedHours}h</strong> • Due: <strong>{task.dueDate}</strong> • Skills: {task.requiredSkills.join(', ') || 'General'}
            </div>
          </div>
          <div className="text-right text-[11px] text-slate-400">
            Current Assignee: <strong className="text-slate-200">{currentAssignee?.name || 'Unassigned'}</strong>
          </div>
        </div>

        {/* Candidate List */}
        <div className="flex-1 p-5 overflow-y-auto space-y-2.5 bg-[#0b101a]">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Engine Recommendations (Sorted by suitability):
          </div>

          {candidates.map((cand, index) => {
            const isSelected = selectedUserId === cand.user.id;
            const isOverload = cand.projectedRatio > 1.0;

            return (
              <div
                key={cand.user.id}
                onClick={() => setSelectedUserId(cand.user.id)}
                className={`p-3 rounded-xl border transition cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-500 ring-1 ring-cyan-500/50 shadow-md'
                    : 'bg-[#121927] border-[#202b3f] hover:bg-[#182235]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={cand.user.avatar} alt={cand.user.name} className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{cand.user.name}</span>
                        {index === 0 && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">
                            Recommended
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400">{cand.user.title}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Skills match: <strong className="text-cyan-300">{cand.skillMatchPercent}%</strong> • Load: {Math.round(cand.currentRatio * 100)}% → Projected: <strong className={isOverload ? 'text-rose-400' : 'text-slate-200'}>{Math.round(cand.projectedRatio * 100)}%</strong>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-extrabold text-cyan-300 font-mono">{cand.score} pts</div>
                    <div className="text-[9px] uppercase font-bold text-slate-400">Fit Score</div>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-[#1d273a] text-[11px] text-slate-300 italic flex items-center gap-1.5">
                  {isOverload ? (
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  ) : (
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  )}
                  <span>{cand.recommendationReason}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Confirmation & Audit notes */}
        <div className="p-4 bg-[#141d2e] border-t border-[#222f46] space-y-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Audit Note / Allocation Rationale
            </label>
            <input
              type="text"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder={chosenCandidate?.recommendationReason || 'Audit justification for allocation'}
              className="w-full bg-[#0b101a] border border-[#26354d] rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-[#27364f] text-xs text-slate-300 hover:bg-[#1b263b]"
            >
              Cancel
            </button>
            <button
              onClick={handleAssign}
              disabled={!selectedUserId}
              className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-950 transition"
            >
              <UserCheck className="w-4 h-4" />
              <span>Confirm Assignment</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
