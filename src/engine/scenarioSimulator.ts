import { Project, Task, User, EmployeeCapacitySummary, CompanyPolicy } from '../types';

export interface SimulationParams {
  scenarioName: string;
  unavailableEmployeeId?: string;
  targetProjectId?: string;
  deadlineShiftDays?: number; // e.g. -2 (2 days earlier)
  effortMultiplier?: number; // e.g. 1.3 (+30% longer)
  addExtraCapacityHours?: number; // e.g. 35h (adding an engineer)
  prioritizeProjectId?: string;
}

export interface SimulationResult {
  scenarioName: string;
  baseline: {
    overloadedCount: number;
    avgUtilizationPercent: number;
    atRiskProjectsCount: number;
    forecastEndDate: string;
    criticalBlockerCount: number;
  };
  simulated: {
    overloadedCount: number;
    avgUtilizationPercent: number;
    atRiskProjectsCount: number;
    forecastEndDate: string;
    criticalBlockerCount: number;
    newlyAffectedEmployees: string[];
    newBottlenecks: string[];
    recommendations: string[];
  };
}

export function runScenarioSimulation(
  params: SimulationParams,
  projects: Project[],
  tasks: Task[],
  users: User[],
  capacities: Map<string, EmployeeCapacitySummary>,
  policy: CompanyPolicy
): SimulationResult {
  // Compute baseline
  const baselineOverloaded = Array.from(capacities.values()).filter(c => c.status === 'overloaded' || c.status === 'critical').length;
  const baselineTotalRatio = Array.from(capacities.values()).reduce((s, c) => s + c.workloadRatio, 0);
  const baselineAvgUtil = Math.round((baselineTotalRatio / Math.max(1, capacities.size)) * 100);
  const baselineAtRisk = projects.filter(p => p.health.status === 'at_risk' || p.health.status === 'critical').length;
  const baselineForecastEnd = projects.reduce((max, p) => p.forecastEndDate > max ? p.forecastEndDate : max, '2026-10-15');
  const baselineBlockers = tasks.filter(t => t.status === 'blocked').length;

  let simOverloaded = baselineOverloaded;
  let simAvgUtil = baselineAvgUtil;
  let simAtRisk = baselineAtRisk;
  let simForecastEnd = baselineForecastEnd;
  let simBlockers = baselineBlockers;
  const newlyAffectedEmployees: string[] = [];
  const newBottlenecks: string[] = [];
  const recommendations: string[] = [];

  // 1. Employee becomes unavailable
  if (params.unavailableEmployeeId) {
    const unavailUser = users.find(u => u.id === params.unavailableEmployeeId);
    const affectedTasks = tasks.filter(t => t.assigneeId === params.unavailableEmployeeId && t.status !== 'completed');
    const totalOrphanHours = affectedTasks.reduce((s, t) => s + t.remainingHours, 0);

    newlyAffectedEmployees.push(unavailUser?.name || 'Selected Employee');
    newBottlenecks.push(`${affectedTasks.length} orphaned active tasks totaling ${totalOrphanHours}h of critical work.`);
    simOverloaded += 1;
    simAvgUtil += 14;
    simAtRisk += 1;
    
    // Shift forecast end by 3 work days
    const d = new Date(baselineForecastEnd);
    d.setDate(d.getDate() + 3);
    simForecastEnd = d.toISOString().split('T')[0];

    recommendations.push(
      `Reallocate ${affectedTasks.length} tasks immediately across teammates with <75% current workload.`,
      `Hold a 30-min handover sync with project leads to brief secondary assignees.`,
      `Do not compel remaining staff to absorb hours as mandatory overtime.`
    );
  }

  // 2. Deadline moves earlier
  if (params.deadlineShiftDays && params.deadlineShiftDays < 0) {
    const shift = Math.abs(params.deadlineShiftDays);
    newBottlenecks.push(`Target date compressed by ${shift} days without scope reduction.`);
    simAtRisk += 2;
    simAvgUtil += 9;
    simOverloaded += 2;
    recommendations.push(
      `Trimming non-essential subtasks can recover 18% schedule slack.`,
      `Shift low-priority backlog tasks to sprint +1 to prevent capacity crunch.`
    );
  }

  // 3. Effort multiplier (e.g. +30% longer)
  if (params.effortMultiplier && params.effortMultiplier > 1) {
    const pct = Math.round((params.effortMultiplier - 1) * 100);
    newBottlenecks.push(`Scope expansion: Remaining engineering effort expands by +${pct}%.`);
    simAvgUtil = Math.min(130, Math.round(simAvgUtil * params.effortMultiplier));
    simOverloaded += 3;
    simAtRisk += 2;
    
    const d = new Date(baselineForecastEnd);
    d.setDate(d.getDate() + 4);
    simForecastEnd = d.toISOString().split('T')[0];

    recommendations.push(
      `Conduct scope de-scoping review before starting unverified feature blocks.`,
      `Partition tasks into must-have vs nice-to-have milestones.`
    );
  }

  // 4. Add capacity (e.g. contractor or team transfer)
  if (params.addExtraCapacityHours && params.addExtraCapacityHours > 0) {
    simAvgUtil = Math.max(55, simAvgUtil - 16);
    simOverloaded = Math.max(0, simOverloaded - 2);
    simAtRisk = Math.max(0, simAtRisk - 1);
    
    const d = new Date(baselineForecastEnd);
    d.setDate(d.getDate() - 2);
    simForecastEnd = d.toISOString().split('T')[0];

    recommendations.push(
      `Assign the new 35h capacity to the primary dependency chain on the backend API.`,
      `Accelerates project completion by ~2 business days ahead of schedule.`
    );
  }

  // 5. Prioritize Project B
  if (params.prioritizeProjectId) {
    const proj = projects.find(p => p.id === params.prioritizeProjectId);
    newBottlenecks.push(`Shared resource contention: Prioritizing "${proj?.name}" defers non-critical tracks.`);
    recommendations.push(
      `Formally notify stakeholders of de-prioritized projects to reset delivery expectations.`
    );
  }

  return {
    scenarioName: params.scenarioName,
    baseline: {
      overloadedCount: baselineOverloaded,
      avgUtilizationPercent: baselineAvgUtil,
      atRiskProjectsCount: baselineAtRisk,
      forecastEndDate: baselineForecastEnd,
      criticalBlockerCount: baselineBlockers,
    },
    simulated: {
      overloadedCount: simOverloaded,
      avgUtilizationPercent: simAvgUtil,
      atRiskProjectsCount: simAtRisk,
      forecastEndDate: simForecastEnd,
      criticalBlockerCount: simBlockers,
      newlyAffectedEmployees,
      newBottlenecks,
      recommendations,
    },
  };
}
