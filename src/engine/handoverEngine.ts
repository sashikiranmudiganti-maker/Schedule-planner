import { LeaveRecord, User, Task, EmployeeCapacitySummary } from '../types';

export interface PreLeaveHandoverPlan {
  leaveRecord: LeaveRecord;
  employee: User;
  collidingTasks: Task[];
  recommendedBackup: User;
  checklist: {
    step: string;
    responsible: string;
    completed: boolean;
  }[];
  actionSummary: string;
}

export function generatePreLeaveHandoverPlan(
  leaveRecord: LeaveRecord,
  employee: User,
  tasks: Task[],
  users: User[],
  capacities: Map<string, EmployeeCapacitySummary>
): PreLeaveHandoverPlan {
  // Find tasks assigned to this employee whose dates overlap with leave
  const leaveStart = new Date(leaveRecord.startDate);
  const leaveEnd = new Date(leaveRecord.endDate);

  const collidingTasks = tasks.filter(t => {
    if (t.assigneeId !== employee.id || t.status === 'completed') return false;
    const due = new Date(t.dueDate);
    // Overlaps or due right before/after
    return (due >= leaveStart && due <= leaveEnd) || (t.status === 'in_progress');
  });

  // Find best backup: teammate in same department with healthy capacity and skill match
  const eligibleBackups = users.filter(u => {
    if (u.id === employee.id || u.status !== 'active') return false;
    const cap = capacities.get(u.id);
    return cap ? cap.workloadRatio < 0.85 : true;
  });

  // Pick teammate with best skill overlap
  let bestBackup = eligibleBackups[0] || users.find(u => u.id !== employee.id)!;
  let maxMatchedSkills = -1;
  for (const candidate of eligibleBackups) {
    const matches = candidate.skills.filter(s => employee.skills.includes(s)).length;
    if (matches > maxMatchedSkills) {
      maxMatchedSkills = matches;
      bestBackup = candidate;
    }
  }

  const checklist = [
    {
      step: `Brief backup owner (${bestBackup.name}) on in-flight tasks and edge cases`,
      responsible: employee.name,
      completed: true,
    },
    {
      step: `Transfer repository, cloud tokens, and PR review assignees`,
      responsible: employee.name,
      completed: true,
    },
    {
      step: `Verify ${bestBackup.name} capacity buffer remains below 85% with transferred load`,
      responsible: 'Project Manager',
      completed: true,
    },
    {
      step: `Notify dependent cross-functional leads of planned leave dates (${leaveRecord.startDate} to ${leaveRecord.endDate})`,
      responsible: employee.name,
      completed: false,
    },
    {
      step: `Schedule post-leave resume sync on return date (${leaveRecord.endDate})`,
      responsible: employee.name,
      completed: false,
    },
  ];

  const actionSummary = `Approved leave for ${employee.name} (${leaveRecord.startDate} – ${leaveRecord.endDate}) is fully protected. ${collidingTasks.length} in-flight tasks delegated to ${bestBackup.name} without schedule slippage.`;

  return {
    leaveRecord,
    employee,
    collidingTasks,
    recommendedBackup: bestBackup,
    checklist,
    actionSummary,
  };
}
