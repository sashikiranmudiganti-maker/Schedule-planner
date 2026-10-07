import { Task, User, EmployeeCapacitySummary } from '../types';

export interface AllocationCandidate {
  user: User;
  score: number; // 0 - 100
  skillMatchPercent: number;
  capacityStatus: 'available' | 'healthy' | 'overloaded' | 'critical';
  currentRatio: number;
  projectedRatio: number;
  recommendationReason: string;
  isEligible: boolean;
}

export function recommendTaskAllocation(
  task: Task,
  users: User[],
  capacities: Map<string, EmployeeCapacitySummary>
): AllocationCandidate[] {
  const candidates: AllocationCandidate[] = users
    .filter(u => u.status === 'active')
    .map(user => {
      const cap = capacities.get(user.id);
      const currentRatio = cap ? cap.workloadRatio : 0.7;
      const availableHours = cap ? cap.availableProductiveHours : 30;

      // 1. Skill Match (40% weight)
      let matchedCount = 0;
      if (task.requiredSkills.length > 0) {
        matchedCount = task.requiredSkills.filter(reqSkill =>
          user.skills.some(userSkill => userSkill.toLowerCase() === reqSkill.toLowerCase())
        ).length;
      }
      const skillMatchPercent = task.requiredSkills.length > 0
        ? Math.round((matchedCount / task.requiredSkills.length) * 100)
        : 100;

      // 2. Capacity & Overload avoidance (35% weight)
      let capacityScore = 35;
      const taskHours = task.remainingHours || task.estimatedHours;
      const projectedWork = (cap?.assignedWorkHours || 0) + taskHours;
      const projectedRatio = availableHours > 0 ? Number((projectedWork / availableHours).toFixed(2)) : 2.0;

      if (projectedRatio > 1.0) {
        capacityScore = 5; // would violate working hours
      } else if (projectedRatio > 0.85) {
        capacityScore = 15; // pushed into overload
      } else if (projectedRatio > 0.65) {
        capacityScore = 35; // optimal healthy sweet spot
      } else {
        capacityScore = 30; // abundant spare capacity
      }

      // 3. Department matching (15% weight)
      const deptScore = 15; // default equal within relevant projects

      // 4. Experience & Reliability (10% weight)
      const experienceScore = user.skills.length > 3 ? 10 : 8;

      const totalScore = Math.round(
        (skillMatchPercent * 0.4) +
        capacityScore +
        deptScore +
        experienceScore
      );

      let recommendationReason = '';
      if (skillMatchPercent === 100 && projectedRatio <= 0.85) {
        recommendationReason = `Optimal Match: 100% skill alignment (${task.requiredSkills.join(', ')}) with healthy post-assignment capacity (${Math.round(projectedRatio * 100)}%).`;
      } else if (projectedRatio > 1.0) {
        recommendationReason = `High Overload Risk: Adding ${taskHours}h would push weekly load to ${Math.round(projectedRatio * 100)}% of official hours.`;
      } else if (skillMatchPercent < 50) {
        recommendationReason = `Partial skill match (${skillMatchPercent}%). May require onboarding or paired peer review.`;
      } else {
        recommendationReason = `Good balance: ${skillMatchPercent}% skill match with available capacity.`;
      }

      return {
        user,
        score: totalScore,
        skillMatchPercent,
        capacityStatus: cap?.status || 'healthy',
        currentRatio,
        projectedRatio,
        recommendationReason,
        isEligible: projectedRatio <= 1.05 && skillMatchPercent >= 40,
      };
    });

  // Sort by highest score first
  return candidates.sort((a, b) => b.score - a.score);
}
