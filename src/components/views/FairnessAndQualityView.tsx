import React from 'react';
import { useWorkflow } from '../../context/WorkflowContext';
import {
  Scale,
  ShieldCheck,
  AlertTriangle,
  Flame,
  CheckCircle,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';

export const FairnessAndQualityView: React.FC = () => {
  const { fairnessAnalysis, qualityAnalysis, users, tasks, capacities } = useWorkflow();

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#111927] to-[#1c2438] border border-[#233148] shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-400 px-2 py-0.5 rounded bg-teal-950 border border-teal-800">
              Ethical Governance
            </span>
            <span className="text-xs text-slate-400">Sections 11 &amp; 18 Protection Systems</span>
          </div>
          <h1 className="text-xl font-extrabold text-white mt-1">
            Fairness &amp; Quality Protection Engines
          </h1>
          <p className="text-xs text-slate-300">
            Preventing burnout of top performers while guarding code quality against rushed, defect-prone deliveries.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-[#121c2d] px-3 py-2 rounded-xl border border-[#223350]">
          <ShieldCheck className="w-4 h-4" />
          <span>Continuous Health Auditing Active</span>
        </div>
      </div>

      {/* Grid: Fairness Engine (Left 6) & Quality Radar (Right 6) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fairness Engine Column */}
        <div className="p-5 rounded-2xl bg-[#121927] border border-[#202c40] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Fairness &amp; Workload Distribution Engine
              </h2>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
              fairnessAnalysis.imbalanceDetected ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-emerald-950 text-emerald-300'
            }`}>
              {fairnessAnalysis.imbalanceDetected ? 'Imbalance Alert' : 'Balanced'}
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Ensures senior engineers are not repeatedly overloaded with emergencies merely because they finish tickets quickly.
          </p>

          {/* Metric Callouts */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-[#0e1422] border border-[#1b2538]">
              <div className="text-[10px] uppercase font-bold text-slate-400">Workload Disparity</div>
              <div className="text-xl font-black text-white mt-1">
                {Math.round(fairnessAnalysis.workloadDisparity * 100)}%
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Spread between max &amp; min load</div>
            </div>

            <div className="p-3 rounded-xl bg-[#0e1422] border border-[#1b2538]">
              <div className="text-[10px] uppercase font-bold text-slate-400">Urgent Task Clustering</div>
              <div className="text-xl font-black text-amber-300 mt-1">
                {fairnessAnalysis.mostAssignedUrgentUser?.percentage || 0}%
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Handled by {fairnessAnalysis.mostAssignedUrgentUser?.user.name || 'single user'}
              </div>
            </div>
          </div>

          {/* Alerts if any */}
          {fairnessAnalysis.alerts.map((alert, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/80 text-xs text-amber-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-amber-300">Workload Imbalance Warning:</strong>
                <span>{alert}</span>
              </div>
            </div>
          ))}

          {/* Recommendations */}
          <div className="p-3.5 rounded-xl bg-[#0d131f] border border-[#1a2538] space-y-2 text-xs">
            <div className="font-bold text-cyan-300 text-[11px] uppercase tracking-wider">
              Fairness Engine Policy Directives:
            </div>
            <ul className="list-disc pl-4 space-y-1 text-slate-300 leading-relaxed">
              {fairnessAnalysis.recommendations.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Quality Protection Column */}
        <div className="p-5 rounded-2xl bg-[#121927] border border-[#202c40] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Quality Protection Monitor
              </h2>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
              qualityAnalysis.tradeoffDetected ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-emerald-950 text-emerald-300'
            }`}>
              {qualityAnalysis.tradeoffDetected ? 'Quality Trade-off' : 'High Integrity'}
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Speed is never measured in isolation. Delivering early but generating rework is treated as a defect of planning.
          </p>

          {/* Metric Callouts */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-[#0e1422] border border-[#1b2538]">
              <div className="text-[10px] uppercase font-bold text-slate-400">Velocity Shift</div>
              <div className="text-xl font-black text-emerald-400 mt-1">
                +{qualityAnalysis.speedDeltaPercent}%
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Reported completion speed</div>
            </div>

            <div className="p-3 rounded-xl bg-[#0e1422] border border-[#1b2538]">
              <div className="text-[10px] uppercase font-bold text-slate-400">Rework Hours Logged</div>
              <div className="text-xl font-black text-rose-400 mt-1">
                +{qualityAnalysis.totalReworkHours} hrs
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Post-merge corrections</div>
            </div>
          </div>

          {/* Trade-off alert if detected */}
          {qualityAnalysis.alertMessage && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/80 text-xs text-rose-200 flex items-start gap-2">
              <Activity className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-rose-300">Speed vs Quality Conflict Detected:</strong>
                <span>{qualityAnalysis.alertMessage}</span>
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="p-3.5 rounded-xl bg-[#0d131f] border border-[#1a2538] space-y-2 text-xs">
            <div className="font-bold text-cyan-300 text-[11px] uppercase tracking-wider">
              Quality Preservation Standards:
            </div>
            <ul className="list-disc pl-4 space-y-1 text-slate-300 leading-relaxed">
              {qualityAnalysis.recommendations.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
