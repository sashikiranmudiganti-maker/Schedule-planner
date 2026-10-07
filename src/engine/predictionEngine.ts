import { Task, Project, RiskLevel } from '../types';

export function calculateTaskForecast(
  task: Task,
  allTasks: Task[],
  dailyProductiveHours: number = 6.0,
  referenceDate: string = '2026-10-06'
): { forecastDueDate: string; riskLevel: RiskLevel; daysVariance: number; explanation: string } {
  // If already completed, keep completion date
  if (task.status === 'completed') {
    return {
      forecastDueDate: task.completedAt || task.dueDate,
      riskLevel: 'low',
      daysVariance: 0,
      explanation: 'Task is completed.',
    };
  }

  // Work days needed for remaining effort
  let daysRequired = Math.ceil((task.remainingHours || task.estimatedHours || 4) / Math.max(2, dailyProductiveHours));

  // Blocker penalty
  if (task.status === 'blocked') {
    daysRequired += 2; // Average resolution lag
  }

  // Dependency constraint: cannot finish before predecessor tasks
  let latestDepForecast = new Date(referenceDate);
  if (task.dependencies && task.dependencies.length > 0) {
    const parentTasks = allTasks.filter(t => task.dependencies.includes(t.id));
    for (const parent of parentTasks) {
      const parentDate = new Date(parent.forecastDueDate || parent.dueDate);
      if (parentDate > latestDepForecast) {
        latestDepForecast = parentDate;
      }
    }
  }

  // Calculate forecast date from latest of reference date and parent completion
  const startDate = new Date(referenceDate);
  const effectiveStart = latestDepForecast > startDate ? latestDepForecast : startDate;
  
  const forecastDate = new Date(effectiveStart);
  // Add required working days (skipping weekends)
  let addedDays = 0;
  while (addedDays < daysRequired) {
    forecastDate.setDate(forecastDate.getDate() + 1);
    const day = forecastDate.getDay();
    if (day !== 0 && day !== 6) {
      addedDays++;
    }
  }

  const forecastStr = forecastDate.toISOString().split('T')[0];
  const due = new Date(task.dueDate);
  const diffTime = forecastDate.getTime() - due.getTime();
  const daysVariance = Math.round(diffTime / (1000 * 60 * 60 * 24));

  let riskLevel: RiskLevel = 'low';
  let explanation = 'On schedule within planned working hours.';

  if (task.status === 'blocked') {
    riskLevel = 'critical';
    explanation = `Blocked: ${task.blockerReason || 'Waiting on external team or technical resolution'}. Adds 2+ days delay.`;
  } else if (daysVariance > 4) {
    riskLevel = 'critical';
    explanation = `Forecast completion is ${daysVariance} days after planned deadline. Overloaded capacity and dependency chain.`;
  } else if (daysVariance > 1) {
    riskLevel = 'high';
    explanation = `Forecast completion is ${daysVariance} days late. Requires task re-prioritization or scope trimming.`;
  } else if (daysVariance === 1) {
    riskLevel = 'medium';
    explanation = 'Tight schedule with minimal buffer. Minor risk of 1-day delay.';
  }

  return {
    forecastDueDate: forecastStr,
    riskLevel,
    daysVariance,
    explanation,
  };
}

export function calculateProjectHealthAndForecast(
  project: Project,
  projectTasks: Task[]
): {
  forecastEndDate: string;
  progress: number;
  healthScore: number;
  status: 'healthy' | 'needs_attention' | 'at_risk' | 'critical';
  breakdown: {
    scheduleScore: number;
    completionScore: number;
    capacityScore: number;
    dependencyScore: number;
    blockerScore: number;
    qualityScore: number;
  };
  explanation: string[];
} {
  const totalTasks = projectTasks.length;
  if (totalTasks === 0) {
    return {
      forecastEndDate: project.plannedEndDate,
      progress: 0,
      healthScore: 100,
      status: 'healthy',
      breakdown: {
        scheduleScore: 25,
        completionScore: 20,
        capacityScore: 15,
        dependencyScore: 15,
        blockerScore: 15,
        qualityScore: 10,
      },
      explanation: ['Project in initial planning with no scheduled tasks yet.'],
    };
  }

  const completedTasks = projectTasks.filter(t => t.status === 'completed');
  const blockedTasks = projectTasks.filter(t => t.status === 'blocked');
  const criticalTasks = projectTasks.filter(t => t.riskLevel === 'critical' || t.riskLevel === 'high');

  const totalEstimated = projectTasks.reduce((s, t) => s + t.estimatedHours, 0);
  const totalSpent = projectTasks.reduce((s, t) => s + t.spentHours, 0);
  const totalRemaining = projectTasks.reduce((s, t) => s + (t.status === 'completed' ? 0 : t.remainingHours), 0);

  const progress = totalEstimated > 0
    ? Math.min(100, Math.round(((totalEstimated - totalRemaining) / totalEstimated) * 100))
    : Math.round((completedTasks.length / totalTasks) * 100);

  // Latest forecast date among project tasks
  let latestTaskForecast = new Date(project.plannedEndDate);
  for (const t of projectTasks) {
    if (t.forecastDueDate) {
      const fd = new Date(t.forecastDueDate);
      if (fd > latestTaskForecast) {
        latestTaskForecast = fd;
      }
    }
  }
  const forecastEndDate = latestTaskForecast.toISOString().split('T')[0];

  const plannedEnd = new Date(project.plannedEndDate);
  const diffDays = Math.round((latestTaskForecast.getTime() - plannedEnd.getTime()) / (1000 * 60 * 60 * 24));

  // Factor scoring
  // 1. Schedule (max 25)
  let scheduleScore = 25;
  if (diffDays > 7) scheduleScore = 5;
  else if (diffDays > 3) scheduleScore = 12;
  else if (diffDays > 0) scheduleScore = 18;

  // 2. Completion progress vs elapsed time (max 20)
  let completionScore = 20;
  if (progress < 40 && diffDays > 0) completionScore = 10;
  if (progress < 25 && diffDays > 3) completionScore = 6;

  // 3. Capacity & Overload (max 15)
  let capacityScore = 15;
  const highRiskCount = criticalTasks.length;
  if (highRiskCount >= 3) capacityScore = 6;
  else if (highRiskCount >= 1) capacityScore = 10;

  // 4. Dependencies (max 15)
  let dependencyScore = 15;
  const hasExternalDeps = projectTasks.some(t => t.dependencies.length > 2);
  if (hasExternalDeps) dependencyScore -= 4;

  // 5. Blockers (max 15)
  let blockerScore = 15;
  if (blockedTasks.length >= 2) blockerScore = 3;
  else if (blockedTasks.length === 1) blockerScore = 7;

  // 6. Quality (max 10)
  let qualityScore = 10;
  const defectCount = projectTasks.reduce((sum, t) => sum + (t.qualityMetrics?.defectCount || 0), 0);
  const reworkHours = projectTasks.reduce((sum, t) => sum + (t.qualityMetrics?.reworkHours || 0), 0);
  if (reworkHours > 15 || defectCount > 4) qualityScore = 4;
  else if (reworkHours > 6 || defectCount > 1) qualityScore = 7;

  const healthScore = Math.max(0, Math.min(100, scheduleScore + completionScore + capacityScore + dependencyScore + blockerScore + qualityScore));

  let status: 'healthy' | 'needs_attention' | 'at_risk' | 'critical' = 'healthy';
  if (healthScore >= 80) status = 'healthy';
  else if (healthScore >= 65) status = 'needs_attention';
  else if (healthScore >= 45) status = 'at_risk';
  else status = 'critical';

  // Human-readable transparent explanation of WHY
  const explanation: string[] = [];
  if (diffDays > 0) {
    explanation.push(`Schedule variance: Forecast completion is ${diffDays} day(s) behind original deadline (${forecastEndDate} vs ${project.plannedEndDate}).`);
  } else {
    explanation.push(`Schedule on track: Predicted completion meets or precedes official deadline.`);
  }

  if (blockedTasks.length > 0) {
    explanation.push(`Blocker impact (-${15 - blockerScore} pts): ${blockedTasks.length} task(s) currently marked blocked.`);
  }

  if (highRiskCount > 0) {
    explanation.push(`Capacity pressure (-${15 - capacityScore} pts): ${highRiskCount} tasks operating under high or critical deadline risk.`);
  }

  if (reworkHours > 5) {
    explanation.push(`Quality alert (-${10 - qualityScore} pts): ${reworkHours}h of rework logged; watch for speed vs quality trade-off.`);
  }

  return {
    forecastEndDate,
    progress,
    healthScore,
    status,
    breakdown: {
      scheduleScore,
      completionScore,
      capacityScore,
      dependencyScore,
      blockerScore,
      qualityScore,
    },
    explanation,
  };
}
