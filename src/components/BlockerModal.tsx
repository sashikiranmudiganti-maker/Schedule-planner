import React, { useState } from 'react';
import { useWorkflow } from '../context/WorkflowContext';
import { BlockerCategory, Task } from '../types';
import { AlertCircle, X, Check } from 'lucide-react';

interface BlockerModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetTask?: Task;
}

export const BlockerModal: React.FC<BlockerModalProps> = ({
  isOpen,
  onClose,
  targetTask,
}) => {
  const { tasks, currentUser, reportBlocker } = useWorkflow();

  const userTasks = tasks.filter(t => t.assigneeId === currentUser.id && t.status !== 'completed');
  const [selectedTaskId, setSelectedTaskId] = useState<string>(targetTask?.id || userTasks[0]?.id || '');
  const [category, setCategory] = useState<BlockerCategory>('technical_problem');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const categories: { key: BlockerCategory; label: string; desc: string }[] = [
    { key: 'waiting_for_info', label: 'Waiting for Information', desc: 'Missing specs, customer answers, or external feedback' },
    { key: 'waiting_for_approval', label: 'Waiting for Approval', desc: 'PR review, executive sign-off, or compliance gate' },
    { key: 'technical_problem', label: 'Technical Problem', desc: 'Infrastructure breakdown, tool bug, or failing cloud gateway' },
    { key: 'dependency', label: 'Dependency on Team / Task', desc: 'Blocked by prerequisite API, database, or library' },
    { key: 'unclear_requirement', label: 'Unclear Requirement', desc: 'Ambiguous ticket goals or conflicting direction' },
    { key: 'other', label: 'Other Blocker', desc: 'Any other impediment hindering productive progress' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskId || !details.trim()) return;

    reportBlocker(selectedTaskId, category, details);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-[#121927] border border-rose-900/60 rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="px-5 py-3.5 bg-rose-950/40 border-b border-rose-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
            <AlertCircle className="w-5 h-5 text-rose-400" />
            <span>Report Work Blocker ("I'm Blocked")</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-950 border border-emerald-600 flex items-center justify-center mx-auto text-emerald-400">
              <Check className="w-6 h-6" />
            </div>
            <div className="text-base font-bold text-white">Blocker Alert Dispatched</div>
            <p className="text-xs text-slate-300">
              Your Project Manager and Department Lead have been notified. Forecast schedules have been protected without blaming your delivery pace.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Task selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Which task is blocked?
              </label>
              <select
                value={selectedTaskId}
                onChange={e => setSelectedTaskId(e.target.value)}
                className="w-full bg-[#0b101a] border border-[#26354d] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                required
              >
                {userTasks.map(t => (
                  <option key={t.id} value={t.id}>
                    [{t.priority.toUpperCase()}] {t.title} (Due: {t.dueDate})
                  </option>
                ))}
                {userTasks.length === 0 && (
                  <option value="" disabled>No active assigned tasks</option>
                )}
              </select>
            </div>

            {/* Category selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Blocker Category
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {categories.map(cat => (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setCategory(cat.key)}
                    className={`p-2.5 rounded-lg border text-left transition ${
                      category === cat.key
                        ? 'bg-rose-950/60 border-rose-500 text-rose-200'
                        : 'bg-[#151e2f] border-[#222e44] text-slate-300 hover:bg-[#1a253a]'
                    }`}
                  >
                    <div className="font-semibold text-xs">{cat.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{cat.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Details */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Specific Obstacle &amp; What Is Needed to Unblock
              </label>
              <textarea
                value={details}
                onChange={e => setDetails(e.target.value)}
                placeholder="Example: Egress gateway is throttling test traffic above 5 Gbps. Need DevOps AWS policy exception or vendor ticket response."
                rows={3}
                className="w-full bg-[#0b101a] border border-[#26354d] rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                required
              />
            </div>

            {/* Operational guarantee */}
            <div className="p-2.5 rounded-lg bg-blue-950/30 border border-blue-900/40 text-[11px] text-blue-300 leading-relaxed">
              <strong>Psychological Safety Guarantee:</strong> Reporting blockers promptly is treated as vital operations intelligence, never as an employee shortcoming.
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-lg border border-[#26354d] text-xs font-medium text-slate-300 hover:bg-[#1a253a]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedTaskId || !details.trim()}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-rose-950 transition"
              >
                Report Blocker &amp; Alert Manager
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
