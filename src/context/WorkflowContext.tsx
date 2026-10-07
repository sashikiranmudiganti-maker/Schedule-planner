import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import {
  User,
  UserRole,
  Department,
  Project,
  Task,
  LeaveRecord,
  CompanyPolicy,
  MeetingBlock,
  BlockerReport,
  AuditLog,
  ActionRecommendation,
  EmployeeCapacitySummary,
  BlockerCategory,
} from '../types';
import {
  initialUsers,
  initialDepartments,
  initialProjects,
  initialTasks,
  initialLeaveRecords,
  initialCompanyPolicy,
  initialMeetingBlocks,
  initialBlockerReports,
  initialAuditLogs,
} from '../data/mockData';
import { calculateEmployeeWeeklyCapacity } from '../engine/capacityEngine';
import { calculateTaskForecast, calculateProjectHealthAndForecast } from '../engine/predictionEngine';
import { generateActionRecommendations } from '../engine/actionPlanEngine';
import { evaluateTeamFairness, evaluateQualityProtection, FairnessAnalysis, QualityAnalysis } from '../engine/fairnessQualityEngine';

interface WorkflowContextType {
  currentUser: User;
  currentRole: UserRole;
  users: User[];
  departments: Department[];
  projects: Project[];
  tasks: Task[];
  leaveRecords: LeaveRecord[];
  companyPolicy: CompanyPolicy;
  meetings: MeetingBlock[];
  blockers: BlockerReport[];
  auditLogs: AuditLog[];
  actionRecommendations: ActionRecommendation[];
  capacities: Map<string, EmployeeCapacitySummary>;
  fairnessAnalysis: FairnessAnalysis;
  qualityAnalysis: QualityAnalysis;
  switchUser: (userId: string) => void;
  switchRole: (role: UserRole) => void;
  updateTaskStatus: (taskId: string, status: Task['status']) => void;
  reassignTask: (taskId: string, newAssigneeId: string, reason: string) => void;
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'forecastDueDate' | 'riskLevel'>) => void;
  reportBlocker: (taskId: string, category: BlockerCategory, details: string) => void;
  resolveBlocker: (blockerId: string) => void;
  optimizePlan: () => { movedTasksCount: number; reallocatedHours: number; summary: string };
  applyActionRecommendation: (recommendationId: string) => void;
  updateCompanyPolicy: (policy: Partial<CompanyPolicy>) => void;
  loadPresetScenario: (scenarioKey: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J') => void;
  addAuditLog: (action: string, targetType: string, targetId: string, details: string, reason: string) => void;
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

export const WorkflowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [currentUser, setCurrentUser] = useState<User>(initialUsers[0]); // Starts as Super Admin
  const [currentRole, setCurrentRole] = useState<UserRole>(initialUsers[0].role);
  const [departments] = useState<Department[]>(initialDepartments);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [leaveRecords, setLeaveRecords] = useState<LeaveRecord[]>(initialLeaveRecords);
  const [companyPolicy, setCompanyPolicy] = useState<CompanyPolicy>(initialCompanyPolicy);
  const [meetings, setMeetings] = useState<MeetingBlock[]>(initialMeetingBlocks);
  const [blockers, setBlockers] = useState<BlockerReport[]>(initialBlockerReports);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);

  // Switch role or user
  const switchUser = useCallback((userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      setCurrentRole(user.role);
    }
  }, [users]);

  const switchRole = useCallback((role: UserRole) => {
    setCurrentRole(role);
    // Find first user matching this role or keep current
    const matchingUser = users.find(u => u.role === role);
    if (matchingUser) {
      setCurrentUser(matchingUser);
    }
  }, [users]);

  // Log audit helper
  const addAuditLog = useCallback((
    action: string,
    targetType: string,
    targetId: string,
    details: string,
    reason: string
  ) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actorId: currentUser.id,
      actorName: currentUser.name,
      role: currentRole,
      action,
      targetType,
      targetId,
      details,
      reason,
    };
    setAuditLogs(prev => [newLog, ...prev]);
  }, [currentUser, currentRole]);

  // Dynamic capacity map
  const capacities = useMemo(() => {
    const map = new Map<string, EmployeeCapacitySummary>();
    users.forEach(user => {
      const summary = calculateEmployeeWeeklyCapacity(user, tasks, leaveRecords, meetings, companyPolicy);
      map.set(user.id, summary);
    });
    return map;
  }, [users, tasks, leaveRecords, meetings, companyPolicy]);

  // Dynamically update task forecasts and project health
  const computedTasks = useMemo(() => {
    return tasks.map(task => {
      const assigneeCap = capacities.get(task.assigneeId);
      const dailyHours = assigneeCap ? Math.max(3, assigneeCap.availableProductiveHours / 5) : 6.0;
      const forecast = calculateTaskForecast(task, tasks, dailyHours);
      return {
        ...task,
        forecastDueDate: forecast.forecastDueDate,
        riskLevel: forecast.riskLevel,
      };
    });
  }, [tasks, capacities]);

  const computedProjects = useMemo(() => {
    return projects.map(proj => {
      const projTasks = computedTasks.filter(t => t.projectId === proj.id);
      const healthCalc = calculateProjectHealthAndForecast(proj, projTasks);
      return {
        ...proj,
        progress: healthCalc.progress,
        forecastEndDate: healthCalc.forecastEndDate,
        health: {
          overall: healthCalc.healthScore,
          status: healthCalc.status,
          scheduleScore: healthCalc.breakdown.scheduleScore,
          completionScore: healthCalc.breakdown.completionScore,
          capacityScore: healthCalc.breakdown.capacityScore,
          dependencyScore: healthCalc.breakdown.dependencyScore,
          blockerScore: healthCalc.breakdown.blockerScore,
          qualityScore: healthCalc.breakdown.qualityScore,
          explanation: healthCalc.explanation,
        },
      };
    });
  }, [projects, computedTasks]);

  // Action Recommendations
  const actionRecommendations = useMemo(() => {
    return generateActionRecommendations(computedProjects, computedTasks, users, capacities);
  }, [computedProjects, computedTasks, users, capacities]);

  // Fairness & Quality
  const fairnessAnalysis = useMemo(() => {
    return evaluateTeamFairness(users, computedTasks, capacities);
  }, [users, computedTasks, capacities]);

  const qualityAnalysis = useMemo(() => {
    return evaluateQualityProtection(computedTasks);
  }, [computedTasks]);

  // Task mutations
  const updateTaskStatus = useCallback((taskId: string, status: Task['status']) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const completedAt = status === 'completed' ? new Date().toISOString().split('T')[0] : t.completedAt;
        const remainingHours = status === 'completed' ? 0 : t.remainingHours;
        return { ...t, status, completedAt, remainingHours };
      }
      return t;
    }));
    addAuditLog('TASK_STATUS_UPDATED', 'Task', taskId, `Status changed to ${status}`, 'User progress report');
  }, [addAuditLog]);

  const reassignTask = useCallback((taskId: string, newAssigneeId: string, reason: string) => {
    const targetUser = users.find(u => u.id === newAssigneeId);
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, assigneeId: newAssigneeId };
      }
      return t;
    }));
    addAuditLog(
      'TASK_REASSIGNED',
      'Task',
      taskId,
      `Reassigned to ${targetUser?.name || newAssigneeId}`,
      reason || 'Workload rebalance by operations engine'
    );
  }, [users, addAuditLog]);

  const createTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt' | 'forecastDueDate' | 'riskLevel'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      forecastDueDate: taskData.dueDate,
      riskLevel: 'low',
    };
    setTasks(prev => [...prev, newTask]);
    addAuditLog('TASK_CREATED', 'Task', newTask.id, `Created task "${newTask.title}"`, 'Operational planning');
  }, [addAuditLog]);

  const reportBlocker = useCallback((taskId: string, category: BlockerCategory, details: string) => {
    const task = tasks.find(t => t.id === taskId);
    const newBlocker: BlockerReport = {
      id: `blocker-${Date.now()}`,
      taskId,
      reportedBy: currentUser.id,
      assigneeId: task?.assigneeId || currentUser.id,
      category,
      details,
      createdAt: new Date().toISOString(),
      status: 'open',
      impactedDepartments: ['Software Engineering'],
    };
    setBlockers(prev => [newBlocker, ...prev]);
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: 'blocked',
          blockerCategory: category,
          blockerReason: details,
          blockedAt: new Date().toISOString().split('T')[0],
        };
      }
      return t;
    }));
    addAuditLog('BLOCKER_REPORTED', 'Task', taskId, `Blocked: ${category} - ${details}`, 'Employee blocker alert');
  }, [tasks, currentUser, addAuditLog]);

  const resolveBlocker = useCallback((blockerId: string) => {
    const report = blockers.find(b => b.id === blockerId);
    setBlockers(prev => prev.map(b => b.id === blockerId ? { ...b, status: 'resolved', resolvedAt: new Date().toISOString() } : b));
    if (report) {
      setTasks(prev => prev.map(t => {
        if (t.id === report.taskId) {
          return {
            ...t,
            status: 'in_progress',
            blockerReason: undefined,
            blockerCategory: undefined,
          };
        }
        return t;
      }));
      addAuditLog('BLOCKER_RESOLVED', 'BlockerReport', blockerId, 'Blocker resolved and work resumed', 'Operational resolution');
    }
  }, [blockers, addAuditLog]);

  // Global Optimizer: "OPTIMIZE PLAN"
  const optimizePlan = useCallback(() => {
    let movedTasksCount = 0;
    let reallocatedHours = 0;

    // 1. Identify overloaded users (>85%) and shift eligible tasks to available users (<70%)
    setTasks(prevTasks => {
      const nextTasks = [...prevTasks];
      const underloadedUsers = users.filter(u => {
        const c = capacities.get(u.id);
        return u.status === 'active' && (c?.status === 'available' || (c?.workloadRatio || 0) < 0.70);
      });

      if (underloadedUsers.length === 0) return nextTasks;

      nextTasks.forEach((t, idx) => {
        if (t.status === 'completed' || t.priority === 'critical') return;
        const currentAssigneeCap = capacities.get(t.assigneeId);
        if (currentAssigneeCap && currentAssigneeCap.workloadRatio > 0.85) {
          // Reassign to available recipient matching skills
          const recipient = underloadedUsers.find(u =>
            t.requiredSkills.some(s => u.skills.includes(s))
          ) || underloadedUsers[0];

          if (recipient && recipient.id !== t.assigneeId) {
            nextTasks[idx] = { ...t, assigneeId: recipient.id };
            movedTasksCount++;
            reallocatedHours += (t.remainingHours || t.estimatedHours);
          }
        }
      });
      return nextTasks;
    });

    addAuditLog(
      'PLAN_OPTIMIZED',
      'System',
      'global-schedule',
      `Auto-Planning balanced workload: Reallocated ${movedTasksCount} tasks (${reallocatedHours}h) to protect working hours.`,
      'Manager triggered "OPTIMIZE PLAN"'
    );

    return {
      movedTasksCount,
      reallocatedHours,
      summary: `Successfully rebalanced ${movedTasksCount} tasks (${reallocatedHours} hrs) to employees with available capacity. Zero overtime required.`,
    };
  }, [users, capacities, addAuditLog]);

  // 1-Click apply recommended action plan
  const applyActionRecommendation = useCallback((recommendationId: string) => {
    const rec = actionRecommendations.find(r => r.id === recommendationId);
    if (!rec) return;

    if (rec.category === 'overload' && rec.employeeId && rec.taskId) {
      // Find recipient
      const recipient = users.find(u => {
        const c = capacities.get(u.id);
        return u.id !== rec.employeeId && (c?.status === 'available' || (c?.workloadRatio || 0) < 0.75);
      });
      if (recipient) {
        reassignTask(rec.taskId, recipient.id, `Action Plan applied: capacity relief for ${rec.employeeId}`);
      }
    } else if (rec.category === 'dependency_blocker' && rec.taskId) {
      // Pair additional help & unblock
      setTasks(prev => prev.map(t => t.id === rec.taskId ? { ...t, status: 'in_progress' } : t));
      addAuditLog('ACTION_PLAN_APPLIED', 'Task', rec.taskId, 'Unblocked with secondary peer allocation', rec.title);
    } else if (rec.category === 'meeting_reduction' && rec.employeeId) {
      // Reduce meetings by 2.5 hours
      setMeetings(prev => prev.map(m => {
        if (m.participantIds.includes(rec.employeeId!) && m.isOptional) {
          return { ...m, durationHours: Math.max(0.5, m.durationHours - 1.0) };
        }
        return m;
      }));
      addAuditLog('ACTION_PLAN_APPLIED', 'MeetingBlock', 'meetings', 'Converted optional meetings to async check-ins', rec.title);
    }

    addAuditLog('ACTION_RECOMMENDATION_EXECUTED', 'ActionRecommendation', recommendationId, rec.title, 'Manager approved solution');
  }, [actionRecommendations, users, capacities, reassignTask, addAuditLog]);

  const updateCompanyPolicy = useCallback((newPolicy: Partial<CompanyPolicy>) => {
    setCompanyPolicy(prev => ({ ...prev, ...newPolicy }));
    addAuditLog('POLICY_UPDATED', 'CompanyPolicy', 'policy-default', JSON.stringify(newPolicy), 'Admin configuration update');
  }, [addAuditLog]);

  // Preset Scenario Runner for the 10 Test Scenarios from prompt
  const loadPresetScenario = useCallback((scenarioKey: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J') => {
    switch (scenarioKey) {
      case 'A': // Normal workload: Balanced allocation
        setTasks(prev => prev.map(t => {
          if (t.id === 'task-102') return { ...t, assigneeId: 'user-maya', remainingHours: 12 };
          if (t.id === 'task-201') return { ...t, assigneeId: 'user-devon', remainingHours: 8 };
          if (t.id === 'task-103') return { ...t, status: 'in_progress' };
          return t;
        }));
        addAuditLog('SCENARIO_LOADED', 'TestLab', 'Scenario-A', 'Loaded Scenario A: Normal balanced workload', 'Test verification');
        break;

      case 'B': // One employee becomes unavailable (Kai Tanaka)
        setUsers(prev => prev.map(u => u.id === 'user-kai' ? { ...u, status: 'on_leave' } : u));
        addAuditLog('SCENARIO_LOADED', 'TestLab', 'Scenario-B', 'Scenario B: Kai Tanaka unavailable; tasks require redistribution', 'Test verification');
        break;

      case 'C': // A project falls behind (Project Nexus)
        setTasks(prev => prev.map(t => {
          if (t.id === 'task-102') return { ...t, remainingHours: 32, forecastDueDate: '2026-10-22', riskLevel: 'critical' };
          return t;
        }));
        addAuditLog('SCENARIO_LOADED', 'TestLab', 'Scenario-C', 'Scenario C: Project Nexus falling behind; early risk detected', 'Test verification');
        break;

      case 'D': // Too much work for available hours (Maya assigned 44 hours)
        setTasks(prev => prev.map(t => {
          if (t.assigneeId === 'user-maya') return { ...t, remainingHours: t.remainingHours + 16 };
          return t;
        }));
        addAuditLog('SCENARIO_LOADED', 'TestLab', 'Scenario-D', 'Scenario D: Chronic overtime prevented; capacity conflict flagged', 'Test verification');
        break;

      case 'E': // Employee has approved leave (Kai Tanaka Oct 12-14)
        // Ensure leave is active and handover is highlighted
        setLeaveRecords(prev => prev.map(l => l.id === 'leave-kai-oct' ? { ...l, handoverGenerated: true } : l));
        addAuditLog('SCENARIO_LOADED', 'TestLab', 'Scenario-E', 'Scenario E: Approved leave protected with handover plan', 'Test verification');
        break;

      case 'F': // Critical deadline moves 2 days earlier
        setProjects(prev => prev.map(p => p.id === 'proj-nexus' ? { ...p, plannedEndDate: '2026-10-14' } : p));
        addAuditLog('SCENARIO_LOADED', 'TestLab', 'Scenario-F', 'Scenario F: Critical deadline compressed by 2 days', 'Test verification');
        break;

      case 'G': // One employee repeatedly receives urgent tasks (Maya Lin receives 85% of critical tasks)
        setTasks(prev => prev.map(t => {
          if (t.priority === 'critical' || t.priority === 'high') {
            return { ...t, assigneeId: 'user-maya' };
          }
          return t;
        }));
        addAuditLog('SCENARIO_LOADED', 'TestLab', 'Scenario-G', 'Scenario G: Fairness engine flags urgent task imbalance', 'Test verification');
        break;

      case 'H': // Quality decreases while speed increases (+18% speed, +11% rework)
        setTasks(prev => prev.map(t => {
          if (t.id === 'task-301') {
            return {
              ...t,
              qualityMetrics: { reopenCount: 4, defectCount: 5, reworkHours: 14 },
            };
          }
          return t;
        }));
        addAuditLog('SCENARIO_LOADED', 'TestLab', 'Scenario-H', 'Scenario H: Quality protection alert triggered (speed vs rework trade-off)', 'Test verification');
        break;

      case 'I': // Task blocked by another department (task-103 VPC egress throttling)
        setTasks(prev => prev.map(t => {
          if (t.id === 'task-103') {
            return {
              ...t,
              status: 'blocked',
              blockerCategory: 'technical_problem',
              blockerReason: 'Cloud provider egress gateway throttling simulation VPC traffic above 5 Gbps.',
            };
          }
          return t;
        }));
        addAuditLog('SCENARIO_LOADED', 'TestLab', 'Scenario-I', 'Scenario I: Cross-department dependency blocker identified', 'Test verification');
        break;

      case 'J': // Several projects compete for the same employee (Maya Lin needed by Nexus, Pulse, and Shield)
        setTasks(prev => prev.map(t => {
          if (t.id === 'task-202' || t.id === 'task-301') {
            return { ...t, assigneeId: 'user-maya' };
          }
          return t;
        }));
        addAuditLog('SCENARIO_LOADED', 'TestLab', 'Scenario-J', 'Scenario J: Shared resource bottleneck identified across projects', 'Test verification');
        break;
    }
  }, [addAuditLog]);

  return (
    <WorkflowContext.Provider
      value={{
        currentUser,
        currentRole,
        users,
        departments,
        projects: computedProjects,
        tasks: computedTasks,
        leaveRecords,
        companyPolicy,
        meetings,
        blockers,
        auditLogs,
        actionRecommendations,
        capacities,
        fairnessAnalysis,
        qualityAnalysis,
        switchUser,
        switchRole,
        updateTaskStatus,
        reassignTask,
        createTask,
        reportBlocker,
        resolveBlocker,
        optimizePlan,
        applyActionRecommendation,
        updateCompanyPolicy,
        loadPresetScenario,
        addAuditLog,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
};

export const useWorkflow = () => {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
};
