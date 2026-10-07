export type UserRole =
  | 'super_admin'
  | 'hr_admin'
  | 'executive'
  | 'dept_manager'
  | 'project_manager'
  | 'employee'
  | 'auditor';

export type PermissionScope = 'organization' | 'department' | 'project' | 'personal';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId: string;
  title: string;
  avatar: string;
  skills: string[];
  maxWeeklyHours: number; // default 40
  dailyOfficialHours: number; // default 8
  weeklyMeetingHours: number;
  status: 'active' | 'on_leave' | 'deactivated';
}

export interface Department {
  id: string;
  name: string;
  managerId: string;
  code: string;
  totalMembers: number;
}

export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type TaskType = 'task' | 'bug' | 'subtask' | 'review' | 'approval' | 'recurring' | 'operational';
export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'blocked' | 'completed';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface Dependency {
  sourceTaskId: string; // Must finish first
  targetTaskId: string; // Blocked until source finishes
  type: 'finish_to_start' | 'review_required' | 'approval_required' | 'external';
  description?: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  type: TaskType;
  status: TaskStatus;
  priority: Priority;
  assigneeId: string;
  estimatedHours: number;
  remainingHours: number;
  spentHours: number;
  startDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD (Planned)
  forecastDueDate: string; // YYYY-MM-DD (Predicted)
  riskLevel: RiskLevel;
  requiredSkills: string[];
  dependencies: string[]; // task IDs this task depends on
  blockerReason?: string;
  blockerCategory?: BlockerCategory;
  blockedAt?: string;
  qualityMetrics?: {
    reopenCount: number;
    defectCount: number;
    reworkHours: number;
  };
  createdAt: string;
  completedAt?: string;
  description: string;
}

export type BlockerCategory =
  | 'waiting_for_info'
  | 'waiting_for_approval'
  | 'technical_problem'
  | 'dependency'
  | 'unclear_requirement'
  | 'other';

export interface BlockerReport {
  id: string;
  taskId: string;
  reportedBy: string;
  assigneeId: string;
  category: BlockerCategory;
  details: string;
  createdAt: string;
  status: 'open' | 'resolved';
  resolvedAt?: string;
  impactedDepartments: string[];
}

export interface ProjectHealthBreakdown {
  overall: number; // 0 - 100
  status: 'healthy' | 'needs_attention' | 'at_risk' | 'critical';
  scheduleScore: number; // 0 - 25
  completionScore: number; // 0 - 20
  capacityScore: number; // 0 - 15
  dependencyScore: number; // 0 - 15
  blockerScore: number; // 0 - 15
  qualityScore: number; // 0 - 10
  explanation: string[];
}

export interface Project {
  id: string;
  name: string;
  key: string;
  departmentId: string;
  managerId: string;
  status: 'planning' | 'in_progress' | 'review' | 'completed' | 'on_hold';
  priority: Priority;
  plannedStartDate: string;
  plannedEndDate: string;
  forecastEndDate: string;
  budgetHours: number;
  spentHours: number;
  progress: number; // 0 - 100
  health: ProjectHealthBreakdown;
  description: string;
}

export interface LeaveRecord {
  id: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  type: 'annual' | 'sick' | 'training' | 'company_holiday';
  status: 'approved' | 'pending';
  handoverGenerated: boolean;
  handoverPlan?: {
    backupEmployeeId: string;
    transferredTaskIds: string[];
    documentationNotes: string;
    completedPreTasks: string[];
  };
}

export interface CompanyPolicy {
  officialDailyHours: number; // 8.0
  maxWeeklyHours: number; // 40.0
  bufferTargetPercent: number; // 15% reserved for unplanned work/communication
  healthyThresholdPercent: number; // up to 85%
  overloadThresholdPercent: number; // 86 - 100%
  criticalThresholdPercent: number; // >100%
  hardRuleNoChronicOvertime: boolean;
  workingDays: string[]; // ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  meetingReductionGuidelinePercent: number; // 25%
}

export interface MeetingBlock {
  id: string;
  title: string;
  participantIds: string[];
  departmentId: string;
  dayOfWeek: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri';
  durationHours: number;
  recurring: boolean;
  isOptional: boolean;
  asynchronousRecommendation?: string;
}

export interface ActionRecommendation {
  id: string;
  category: 'overload' | 'deadline_risk' | 'dependency_blocker' | 'meeting_reduction' | 'fairness_imbalance' | 'quality_tradeoff';
  title: string;
  problem: string;
  cause: string;
  recommendedActions: string[];
  currentForecast: string;
  optimizedForecast: string;
  impactSummary: string;
  status: 'pending' | 'applied' | 'dismissed';
  projectId?: string;
  employeeId?: string;
  taskId?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  role: UserRole;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  reason: string;
}

export interface EmployeeCapacitySummary {
  userId: string;
  userName: string;
  departmentId: string;
  officialHours: number;
  meetingHours: number;
  leaveHours: number;
  trainingHours: number;
  reservedBufferHours: number;
  availableProductiveHours: number;
  assignedWorkHours: number;
  workloadRatio: number; // assigned / availableProductive
  status: 'available' | 'healthy' | 'overloaded' | 'critical';
  overtimeHoursWarning: number;
}
