import React, { useState } from 'react';
import { useWorkflow } from '../../context/WorkflowContext';
import { runScenarioSimulation, SimulationParams } from '../../engine/scenarioSimulator';
import {
  GitBranch,
  Play,
  RotateCcw,
  Check,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Users,
  Clock,
  Sparkles,
} from 'lucide-react';

export const ScenarioSimulatorView: React.FC = () => {
  const { projects, tasks, users, capacities, companyPolicy, optimizePlan } = useWorkflow();

  // Simulation controls state
  const [selectedUserOut, setSelectedUserOut] = useState<string>('');
  const [deadlineShift, setDeadlineShift] = useState<number>(0);
  const [effortMultiplier, setEffortMultiplier] = useState<number>(1.0);
  const [addExtraCapacity, setAddExtraCapacity] = useState<number>(0);
  const [prioritizeProj, setPrioritizeProj] = useState<string>('');

  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);

  const simulationParams: SimulationParams = {
    scenarioName: 'Interactive Simulation',
    unavailableEmployeeId: selectedUserOut || undefined,
    deadlineShiftDays: deadlineShift !== 0 ? deadlineShift : undefined,
    effortMultiplier: effortMultiplier !== 1.0 ? effortMultiplier : undefined,
    addExtraCapacityHours: addExtraCapacity > 0 ? addExtraCapacity : undefined,
    prioritizeProjectId: prioritizeProj || undefined,
  };

  const results = runScenarioSimulation(
    simulationParams,
    projects,
    tasks,
    users,
    capacities,
    companyPolicy
  );

  const handleReset = () => {
    setSelectedUserOut('');
    setDeadlineShift(0);
    setEffortMultiplier(1.0);
    setAddExtraCapacity(0);
    setPrioritizeProj('');
  };

  const handleApplyScenario = () => {
    optimizePlan();
    setAppliedNotice('Simulation commitments applied to schedule! Tasks re-allocated safely.');
    setTimeout(() => setAppliedNotice(null), 4000);
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#111927] to-[#1d1f35] border border-[#233148] shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-400 px-2 py-0.5 rounded bg-purple-950 border border-purple-800">
              Hypothesis Testing Engine
            </span>
            <span className="text-xs text-slate-400">Section 16 “What If?” Simulator</span>
          </div>
          <h1 className="text-xl font-extrabold text-white mt-1">
            Scenario Simulator ("What If?")
          </h1>
          <p className="text-xs text-slate-300">
            Simulate operational shocks before committing. Test employee absences, compressed deadlines, or scope surges.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleReset}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#162032] hover:bg-[#1f2d47] text-slate-300 border border-[#2b3a56] transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Levers</span>
          </button>
          <button
            onClick={handleApplyScenario}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-indigo-950 transition flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Approve &amp; Apply Scenario</span>
          </button>
        </div>
      </div>

      {appliedNotice && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-600 text-emerald-200 text-xs flex items-center gap-2 animate-fadeIn">
          <span>{appliedNotice}</span>
        </div>
      )}

      {/* Main Grid: Levers (Left 4 cols) vs Simulation Impact Comparison (Right 8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Levers Controls */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-[#121927] border border-[#202c40] space-y-4">
          <h2 className="text-xs font-bold uppercase text-white tracking-wider flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-purple-400" />
            <span>Simulation Parameters</span>
          </h2>

          {/* Lever 1: Employee Unavailable */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              What if an employee becomes unavailable?
            </label>
            <select
              value={selectedUserOut}
              onChange={e => setSelectedUserOut(e.target.value)}
              className="w-full bg-[#0b101a] border border-[#27364f] rounded-lg p-2 text-xs text-white focus:outline-none focus:border-purple-500"
            >
              <option value="">No employee absence (Normal)</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.title})
                </option>
              ))}
            </select>
          </div>

          {/* Lever 2: Deadline Shift */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
              <span>What if deadline shifts?</span>
              <span className="font-mono text-purple-300">
                {deadlineShift === 0 ? 'No change' : `${deadlineShift > 0 ? '+' : ''}${deadlineShift} days`}
              </span>
            </div>
            <input
              type="range"
              min={-5}
              max={5}
              step={1}
              value={deadlineShift}
              onChange={e => setDeadlineShift(Number(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
              <span>-5 days earlier</span>
              <span>Baseline</span>
              <span>+5 days later</span>
            </div>
          </div>

          {/* Lever 3: Effort Multiplier */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
              <span>What if tasks take longer? (Scope surge)</span>
              <span className="font-mono text-purple-300">
                +{Math.round((effortMultiplier - 1) * 100)}% effort
              </span>
            </div>
            <input
              type="range"
              min={1.0}
              max={1.6}
              step={0.1}
              value={effortMultiplier}
              onChange={e => setEffortMultiplier(Number(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
              <span>1.0x (Normal)</span>
              <span>1.3x (+30%)</span>
              <span>1.6x (+60%)</span>
            </div>
          </div>

          {/* Lever 4: Add extra capacity */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
              <span>What if we add contractor capacity?</span>
              <span className="font-mono text-purple-300">+{addExtraCapacity} hrs/wk</span>
            </div>
            <input
              type="range"
              min={0}
              max={70}
              step={10}
              value={addExtraCapacity}
              onChange={e => setAddExtraCapacity(Number(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
              <span>0h</span>
              <span>35h (1 Full Engineer)</span>
              <span>70h</span>
            </div>
          </div>

          {/* Lever 5: Prioritize Project */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              What if a project takes top priority?
            </label>
            <select
              value={prioritizeProj}
              onChange={e => setPrioritizeProj(e.target.value)}
              className="w-full bg-[#0b101a] border border-[#27364f] rounded-lg p-2 text-xs text-white focus:outline-none focus:border-purple-500"
            >
              <option value="">Balanced project priority</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Comparison Output (Baseline vs Simulated) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-5 rounded-2xl bg-[#121927] border border-[#202c40] space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Baseline vs. Simulated Consequences</span>
              </h2>
              <span className="text-[11px] text-slate-400 font-mono">Live Delta Calculation</span>
            </div>

            {/* Metrics Delta Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-[#0f1522] border border-[#1e2a3f]">
                <div className="text-[10px] uppercase font-bold text-slate-400">Overloaded Staff</div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-lg font-bold text-slate-400">{results.baseline.overloadedCount}</span>
                  <ArrowRight className="w-3 h-3 text-slate-500" />
                  <span className={`text-lg font-black ${
                    results.simulated.overloadedCount > results.baseline.overloadedCount ? 'text-rose-400' : 'text-emerald-400'
                  }`}>
                    {results.simulated.overloadedCount}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0f1522] border border-[#1e2a3f]">
                <div className="text-[10px] uppercase font-bold text-slate-400">Avg Utilization</div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-lg font-bold text-slate-400">{results.baseline.avgUtilizationPercent}%</span>
                  <ArrowRight className="w-3 h-3 text-slate-500" />
                  <span className={`text-lg font-black ${
                    results.simulated.avgUtilizationPercent > 90 ? 'text-rose-400' : 'text-cyan-300'
                  }`}>
                    {results.simulated.avgUtilizationPercent}%
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0f1522] border border-[#1e2a3f]">
                <div className="text-[10px] uppercase font-bold text-slate-400">At-Risk Projects</div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-lg font-bold text-slate-400">{results.baseline.atRiskProjectsCount}</span>
                  <ArrowRight className="w-3 h-3 text-slate-500" />
                  <span className={`text-lg font-black ${
                    results.simulated.atRiskProjectsCount > results.baseline.atRiskProjectsCount ? 'text-rose-400' : 'text-emerald-400'
                  }`}>
                    {results.simulated.atRiskProjectsCount}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0f1522] border border-[#1e2a3f]">
                <div className="text-[10px] uppercase font-bold text-slate-400">Forecast End Date</div>
                <div className="text-xs font-mono font-bold mt-1 text-purple-300">
                  {results.simulated.forecastEndDate}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Base: {results.baseline.forecastEndDate}
                </div>
              </div>
            </div>

            {/* Emerging Bottlenecks identified */}
            {results.simulated.newBottlenecks.length > 0 && (
              <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-900/50 space-y-2 text-xs">
                <div className="font-bold text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>New Bottlenecks Detected in this Scenario:</span>
                </div>
                <ul className="list-disc pl-5 space-y-1 text-slate-300">
                  {results.simulated.newBottlenecks.map((b, idx) => (
                    <li key={idx}>{b}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommended Compensating Actions */}
            <div className="p-4 rounded-xl bg-[#0c121d] border border-[#1b2538] space-y-2 text-xs">
              <div className="font-bold text-cyan-300 uppercase tracking-wider text-[11px]">
                Recommended Compensating Plan (Without Demanding Overtime):
              </div>
              <ul className="list-disc pl-5 space-y-1 text-slate-300 leading-relaxed">
                {results.simulated.recommendations.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
