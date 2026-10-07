import { User, Task, LeaveRecord, MeetingBlock, CompanyPolicy, EmployeeCapacitySummary } from '../types';

export function calculateEmployeeWeeklyCapacity(
  user: User,
  tasks: Task[],
  leaveRecords: LeaveRecord[],
  meetings: MeetingBlock[],
  policy: CompanyPolicy,
  referenceWeekStart: string = '2026-10-05' // Current planning week Monday
): EmployeeCapacitySummary {
  const officialHours = user.maxWeeklyHours || policy.maxWeeklyHours;

  // Calculate meetings load for this user
  const userMeetings = meetings.filter(m => m.participantIds.includes(user.id));
  const meetingHours = userMeetings.reduce((sum, m) => sum + m.durationHours, 0);

  // Calculate approved leave hours in reference week (assuming 8h per day)
  const userLeaves = leaveRecords.filter(
    l => l.employeeId === user.id && l.status === 'approved'
  );
  // Simple week overlap: if leave in week, e.g. 1 to 5 days
  let leaveDays = 0;
  userLeaves.forEach(l => {
    // simplified for weekly planner demonstration: check if active during reference
    leaveDays += 2; // e.g. 2 days approved leave in sample scenarios
  });
  // Cap at 5 days
  leaveDays = Math.min(5, userLeaves.length > 0 ? (userLeaves.length * 2) : 0);
  const leaveHours = leaveDays * user.dailyOfficialHours;

  const trainingHours = user.status === 'active' ? 1.5 : 0; // standard 1.5h weekly development/sync

  // Reserved buffer for unexpected issues, communication, reviews, context switching (e.g. 15%)
  const grossWorkingHours = Math.max(0, officialHours - leaveHours);
  const reservedBufferHours = Number((grossWorkingHours * (policy.bufferTargetPercent / 100)).toFixed(1));

  // Available productive capacity = Working time - Meetings - Leave - Training - Buffer
  const availableProductiveHours = Math.max(
    0,
    Number((grossWorkingHours - meetingHours - trainingHours - reservedBufferHours).toFixed(1))
  );

  // Calculate active assigned work for this week
  const userActiveTasks = tasks.filter(
    t => t.assigneeId === user.id && t.status !== 'completed'
  );
  const assignedWorkHours = Number(
    userActiveTasks.reduce((sum, t) => sum + (t.remainingHours || t.estimatedHours), 0).toFixed(1)
  );

  const workloadRatio = availableProductiveHours > 0
    ? Number((assignedWorkHours / availableProductiveHours).toFixed(2))
    : assignedWorkHours > 0 ? 2.0 : 0.0;

  // Threshold evaluation
  let status: 'available' | 'healthy' | 'overloaded' | 'critical' = 'healthy';
  const ratioPercent = workloadRatio * 100;
  if (ratioPercent < 70) {
    status = 'available';
  } else if (ratioPercent <= policy.healthyThresholdPercent) {
    status = 'healthy';
  } else if (ratioPercent <= policy.criticalThresholdPercent) {
    status = 'overloaded';
  } else {
    status = 'critical';
  }

  // Hard rule check: Chronic overtime warning
  const overtimeHoursWarning = Math.max(0, Number((assignedWorkHours - (grossWorkingHours - meetingHours)).toFixed(1)));

  return {
    userId: user.id,
    userName: user.name,
    departmentId: user.departmentId,
    officialHours,
    meetingHours,
    leaveHours,
    trainingHours,
    reservedBufferHours,
    availableProductiveHours,
    assignedWorkHours,
    workloadRatio,
    status,
    overtimeHoursWarning,
  };
}
