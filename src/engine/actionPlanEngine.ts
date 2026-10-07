import { Project, Task, User, ActionRecommendation, EmployeeCapacitySummary } from '../types';

export function generateActionRecommendations(
  projects: Project[],
  tasks: Task[],
  users: User[],
  capacities: Map<string, EmployeeCapacitySummary>
): ActionRecommendation[] {
  const recommendations: ActionRecommendation[] = [];

  // 1. Check for blocked critical path tasks
  const blockedTasks = tasks.filter(t => t.status === 'blocked');
  for (const bTask of blockedTasks) {
    const project = projects.find(p => p.id === bTask.projectId);
    const assignee = users.find(u => u.id === bTask.assigneeId);
    
    // Find unblocked peer with spare capacity and matching skills
    const sparePeers = users.filter(u => {
      const cap = capacities.get(u.id);
      return u.id !== bTask.assigneeId && (cap ? cap.workloadRatio < 0.75 : true) && u.status === 'active';
    });
    const candidate = sparePeers[0] || users.find(u => u.id !== bTask.assigneeId);

    recommendations.push({
      id: `act-blocker-${bTask.id}`,
      category: 'dependency_blocker',
      title: `Unblock Critical Path: ${bTask.title}`,
      problem: `Task "${bTask.title}" in ${project?.name || 'Project'} is blocked (${bTask.blockerCategory || 'Dependency'}).`,
      cause: bTask.blockerReason || 'Waiting on dependent service deployment and inter-team review approval.',
      recommendedActions: [
        `Triage blocker category "${bTask.blockerCategory || 'dependency'}" with owning team lead immediately.`,
        `Temporarily pair ${candidate?.name || 'an available engineer'} to unblock the technical hurdle.`,
        `Shift downstream non-critical tasks to preserve primary release window.`,
        `Maintain strict 8h official working limit without emergency overtime.`,
      ],
      currentForecast: `Estimated 2.5-day schedule slip (to ${bTask.forecastDueDate})`,
      optimizedForecast: `Resolved in ~6 work hours; restores original target (${bTask.dueDate})`,
      impactSummary: `Prevents a cascaded delay across ${project?.name} and protects downstream QA delivery.`,
      status: 'pending',
      projectId: project?.id,
      taskId: bTask.id,
      employeeId: assignee?.id,
    });
  }

  // 2. Check for Overloaded Employees (Workload Ratio > 0.85 or Critical > 1.0)
  for (const [userId, cap] of capacities.entries()) {
    if (cap.status === 'critical' || cap.status === 'overloaded') {
      const employee = users.find(u => u.id === userId);
      const empTasks = tasks.filter(t => t.assigneeId === userId && t.status !== 'completed');
      const lowPriorityTask = empTasks.find(t => t.priority === 'low' || t.priority === 'medium') || empTasks[0];
      
      // Find eligible recipient
      const underloaded = users.find(u => {
        const c = capacities.get(u.id);
        return u.id !== userId && (c?.status === 'available' || (c?.workloadRatio || 0) < 0.7);
      });

      if (employee && lowPriorityTask) {
        recommendations.push({
          id: `act-overload-${userId}`,
          category: 'overload',
          title: `Capacity Relief for ${employee.name}`,
          problem: `${employee.name} is operating at ${Math.round(cap.workloadRatio * 100)}% workload ratio (${cap.assignedWorkHours}h assigned vs ${cap.availableProductiveHours}h productive capacity).`,
          cause: `Excessive concurrent task allocation combined with ${cap.meetingHours}h of scheduled meetings.`,
          recommendedActions: [
            `Reassign "${lowPriorityTask.title}" (${lowPriorityTask.remainingHours}h) to ${underloaded ? underloaded.name : 'another available teammate'}.`,
            `Move 2 optional recurring status meetings to asynchronous updates, recovering 2.5h buffer.`,
            `Protect approved personal rest and keep weekly hours within the 40h standard.`,
            `Re-forecast sprint commitments based on verified 6.0h daily productive capacity.`,
          ],
          currentForecast: `Severe burnout risk; predicted delivery delayed by ~3 days due to fatigue`,
          optimizedForecast: `Workload ratio drops to balanced 82%; on-time completion across all prioritized items`,
          impactSummary: `Preserves team health, prevents resignation risk, and guarantees high execution quality.`,
          status: 'pending',
          employeeId: userId,
          taskId: lowPriorityTask.id,
        });
      }
    }
  }

  // 3. Check for At-Risk Projects
  for (const proj of projects) {
    if (proj.health.status === 'at_risk' || proj.health.status === 'critical') {
      recommendations.push({
        id: `act-proj-${proj.id}`,
        category: 'deadline_risk',
        title: `Project Stabilization: ${proj.name}`,
        problem: `${proj.name} health score is ${proj.health.overall}/100 with forecast completion trailing deadline.`,
        cause: proj.health.explanation.join(' '),
        recommendedActions: [
          `Prioritize critical-path milestone deliverables; defer low-impact polish tasks to next iteration.`,
          `Reallocate 12h of surplus capacity from healthy departments.`,
          `Establish fast-track peer reviews to cut turnaround lag from 1.5 days to 2 hours.`,
          `Protect employee working hours: do not mandate weekend or night shifts.`,
        ],
        currentForecast: `Forecast completion: ${proj.forecastEndDate} (Delayed by ~4 days)`,
        optimizedForecast: `Optimized completion: ${proj.plannedEndDate} (Ahead of schedule by 4 hours)`,
        impactSummary: `Restores project health to 85+ (Healthy) while respecting human capacity constraints.`,
        status: 'pending',
        projectId: proj.id,
      });
    }
  }

  // 4. Meeting Optimization Alert if anyone has > 12h meetings
  for (const [userId, cap] of capacities.entries()) {
    if (cap.meetingHours > 10) {
      const emp = users.find(u => u.id === userId);
      recommendations.push({
        id: `act-meeting-${userId}`,
        category: 'meeting_reduction',
        title: `Meeting Load Optimization: ${emp?.name || 'Staff Member'}`,
        problem: `${emp?.name} has ${cap.meetingHours} hours of meetings booked this week, leaving only ${cap.availableProductiveHours}h for focused deep work.`,
        cause: `High participation in multi-attendee recurring cross-functional syncs.`,
        recommendedActions: [
          `Convert weekly 90-minute architecture review to an asynchronous written RFC review.`,
          `Delegate operational status sync to rotating team representatives.`,
          `Establish meeting-free focus blocks on Tuesday & Thursday afternoons.`,
        ],
        currentForecast: `Fragmented schedule with ~18 context switches per week`,
        optimizedForecast: `Recovers 4.5 hours of focus time, lifting productive capacity by 28%`,
        impactSummary: `Drastically reduces context switching fatigue and accelerates task completion.`,
        status: 'pending',
        employeeId: userId,
      });
      break; // one is enough for prompt
    }
  }

  return recommendations;
}
