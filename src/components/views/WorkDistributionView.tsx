import React, { useState } from 'react';
import { useWorkflow } from '../../context/WorkflowContext';
import { Task, User } from '../../types';
import { TaskAllocationModal } from '../TaskAllocationModal';
import {
  Users,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Plus,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

export const WorkDistributionView: React.FC = () => {
  const {
    users,
    tasks,
    projects,
    capacities,
    companyPolicy,
    optimizePlan,
    createTask,
  } = useWorkflow();

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [filterDept, setFilterDept] = useState<string>('all');

  // Form state for creating a new task
  const [newTitle, setNewTitle] = useState('');
  const [newProjectId, setNewProjectId] = useState(projects[0]?.id || '');
  const [newAssigneeId, setNewAssigneeId] = useState(users[0]?.id || '');
  const [newHours, setNewHours] = useState(8);
  const [newDueDate, setNewDueDate] = useState('2026-10-15');
  const [newPriority, setNewPriority] = useState<Task['priority']>('medium');

  const filteredUsers = filterDept === 'all'
    ? users
    : users.filter(u => u.departmentId === filterDept);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    createTask({
      projectId: newProjectId,
      title: newTitle,
      type: 'task',
      status: 'todo',
      priority: newPriority,
      assigneeId: newAssigneeId,
      estimatedHours: Number(newHours),
      remainingHours: Number(newHours),
      spentHours: 0,
      startDate: new Date().toISOString().split('T')[0],
      dueDate: newDueDate,
      requiredSkills: [],
      dependencies: [],
      description: 'Planned during workload distribution.',
    });

    setNewTitle('');
    setShowNewTaskModal(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#111927] to-[#162134] border border-[#233148] shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">
              Capacity Engine &amp; Allocation
            </span>
            <span className="text-xs text-slate-400">Section 3 &amp; 8 Engine</span>
          </div>
          <h1 className="text-xl font-extrabold text-white mt-1">
            Work Distribution &amp; Capacity Planner
          </h1>
          <p className="text-xs text-slate-300">
            Real capacity calculation: Working Time − Meetings − Leave − Training − Buffer. No chronic overtime.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowNewTaskModal(true)}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#182337] hover:bg-[#22314c] text-white border border-[#2b3c59] transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-cyan-400" />
            <span>Plan New Task</span>
          </button>
          <button
            onClick={optimizePlan}
            className="px-3.5 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950 transition flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
            <span>OPTIMIZE PLAN</span>
          </button>
        </div>
      </div>

      {/* Capacity Formula Explainer Card */}
      <div className="p-4 rounded-xl bg-[#0f1522] border border-[#222e44] text-xs text-slate-300 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <div className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">Gross Working Hours</div>
          <div className="text-base font-extrabold text-white mt-0.5">40.0h / week</div>
          <div className="text-[11px] text-slate-400 mt-1">8.0 hours / day statutory limit</div>
        </div>
        <div>
          <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Reserved Time Deductions</div>
          <div className="text-base font-extrabold text-white mt-0.5">Meetings + Leave + Sync</div>
          <div className="text-[11px] text-slate-400 mt-1">Never treated as assignable work</div>
        </div>
        <div>
          <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Protected Buffer</div>
          <div className="text-base font-extrabold text-white mt-0.5">15% Target Buffer</div>
          <div className="text-[11px] text-slate-400 mt-1">Absorbs context-switching &amp; reviews</div>
        </div>
        <div>
          <div className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Healthy Threshold</div>
          <div className="text-base font-extrabold text-white mt-0.5">70% – 85% Load</div>
          <div className="text-[11px] text-slate-400 mt-1">&gt;85% triggers warning; &gt;100% blocked</div>
        </div>
      </div>

      {/* Employees Workload Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <span>Weekly Capacity &amp; Assigned Work by Team Member</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">Reference Week: Oct 05 – Oct 09, 2026</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredUsers.map(user => {
            const cap = capacities.get(user.id);
            if (!cap) return null;

            const userActiveTasks = tasks.filter(t => t.assigneeId === user.id && t.status !== 'completed');
            const ratioPct = Math.round(cap.workloadRatio * 100);
            const isOverloaded = cap.status === 'overloaded' || cap.status === 'critical';
            const isCriticalOverload = cap.workloadRatio > 1.0;

            return (
              <div
                key={user.id}
                className={`p-4 rounded-xl border transition ${
                  isCriticalOverload
                    ? 'bg-rose-950/20 border-rose-800/80 shadow-md ring-1 ring-rose-500/40'
                    : isOverloaded
                    ? 'bg-amber-950/20 border-amber-800/80 shadow-md'
                    : 'bg-[#121927] border-[#202c40]'
                }`}
              >
                {/* Employee Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover ring-1 ring-[#2c3d5a]" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{user.name}</span>
                        <span className={`px-2 py-0.2 rounded text-[10px] font-bold uppercase font-mono ${
                          cap.status === 'critical' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                          cap.status === 'overloaded' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                          cap.status === 'healthy' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                          'bg-cyan-950 text-cyan-300 border border-cyan-800'
                        }`}>
                          {cap.status} ({ratioPct}%)
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{user.title}</div>
                    </div>
                  </div>

                  <div className="text-right text-xs font-mono">
                    <div className="text-white font-bold">{cap.assignedWorkHours}h Assigned</div>
                    <div className="text-slate-400 text-[11px]">of {cap.availableProductiveHours}h Productive</div>
                  </div>
                </div>

                {/* Overtime warning if critical */}
                {isCriticalOverload && (
                  <div className="mt-3 p-2.5 rounded-lg bg-rose-950/80 border border-rose-600 text-rose-200 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span><strong>Capacity Conflict:</strong> Assigned {cap.assignedWorkHours}h exceeds safe hours!</span>
                    </div>
                    <span className="text-[10px] font-mono uppercase bg-rose-900 px-1.5 py-0.5 rounded">Hard Rule</span>
                  </div>
                )}

                {/* Capacity breakdown pills */}
                <div className="mt-3 pt-3 border-t border-[#1e2a3f] grid grid-cols-4 gap-1 text-[11px] text-slate-400 font-mono text-center">
                  <div className="p-1 rounded bg-[#0d131f]">
                    <div className="text-[9px] uppercase text-slate-300">Meetings</div>
                    <div className="text-slate-200 font-bold">{cap.meetingHours}h</div>
                  </div>
                  <div className="p-1 rounded bg-[#0d131f]">
                    <div className="text-[9px] uppercase text-slate-300">Leave</div>
                    <div className="text-slate-200 font-bold">{cap.leaveHours}h</div>
                  </div>
                  <div className="p-1 rounded bg-[#0d131f]">
                    <div className="text-[9px] uppercase text-slate-300">Buffer</div>
                    <div className="text-emerald-400 font-bold">{cap.reservedBufferHours}h</div>
                  </div>
                  <div className="p-1 rounded bg-[#0d131f]">
                    <div className="text-[9px] uppercase text-slate-300">Productive</div>
                    <div className="text-cyan-300 font-bold">{cap.availableProductiveHours}h</div>
                  </div>
                </div>

                {/* Active assigned tasks for this user */}
                <div className="mt-3 space-y-1.5">
                  <div className="text-[10px] uppercase font-bold text-slate-300">
                    Active Tasks ({userActiveTasks.length}):
                  </div>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {userActiveTasks.map(task => (
                      <div
                        key={task.id}
                        className="p-2 rounded-lg bg-[#0e1420] border border-[#1b2538] flex items-center justify-between text-xs"
                      >
                        <div className="truncate mr-2">
                          <span className="font-semibold text-slate-200 truncate">{task.title}</span>
                          <div className="text-[10px] text-slate-400">
                            {task.remainingHours}h • Due: {task.dueDate} • [{task.priority}]
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedTask(task)}
                          className="px-2 py-0.5 rounded bg-[#1c293e] hover:bg-cyan-900/60 text-cyan-300 text-[10px] font-semibold transition shrink-0"
                        >
                          Reassign
                        </button>
                      </div>
                    ))}
                    {userActiveTasks.length === 0 && (
                      <div className="text-slate-300 text-xs italic py-1">
                        No active tasks assigned. Capacity available for incoming work.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task Reallocation Modal */}
      {selectedTask && (
        <TaskAllocationModal
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}

      {/* Plan New Task Modal */}
      {showNewTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#0f1624] border border-[#2b3a56] rounded-2xl p-5 space-y-4 shadow-2xl">
            <h3 className="font-extrabold text-white text-sm">Plan New Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Task Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Implement OAuth token refresh flow"
                  className="w-full bg-[#0b101a] border border-[#26354d] rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Project</label>
                <select
                  value={newProjectId}
                  onChange={e => setNewProjectId(e.target.value)}
                  className="w-full bg-[#0b101a] border border-[#26354d] rounded-lg p-2 text-white"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Assignee</label>
                <select
                  value={newAssigneeId}
                  onChange={e => setNewAssigneeId(e.target.value)}
                  className="w-full bg-[#0b101a] border border-[#26354d] rounded-lg p-2 text-white"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.title})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Estimated Hours</label>
                  <input
                    type="number"
                    value={newHours}
                    onChange={e => setNewHours(Number(e.target.value))}
                    min={1}
                    max={40}
                    className="w-full bg-[#0b101a] border border-[#26354d] rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={e => setNewPriority(e.target.value as any)}
                    className="w-full bg-[#0b101a] border border-[#26354d] rounded-lg p-2 text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Due Date</label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={e => setNewDueDate(e.target.value)}
                  className="w-full bg-[#0b101a] border border-[#26354d] rounded-lg p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-[#26354d] text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 font-bold text-white"
                >
                  Create &amp; Check Capacity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
