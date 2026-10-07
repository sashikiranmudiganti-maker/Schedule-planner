import React, { useState } from 'react';
import { useWorkflow } from '../../context/WorkflowContext';
import { ActionRecommendation } from '../../types';
import {
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Check,
  RotateCcw,
  Clock,
} from 'lucide-react';

export const ActionPlansView: React.FC = () => {
  const { actionRecommendations, applyActionRecommendation } = useWorkflow();
  const [appliedId, setAppliedId] = useState<string | null>(null);

  const handleApply = (id: string) => {
    applyActionRecommendation(id);
    setAppliedId(id);
    setTimeout(() => setAppliedId(null), 3000);
  };

  const pendingRecommendations = actionRecommendations.filter(r => r.status === 'pending');

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#111927] to-[#1a2336] border border-[#233148] shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 px-2 py-0.5 rounded bg-amber-950 border border-amber-800">
              Prescriptive Decision Engine
            </span>
            <span className="text-xs text-slate-400">Section 7 “What Should We Do Now?”</span>
          </div>
          <h1 className="text-xl font-extrabold text-white mt-1">
            Recommended Action Plans
          </h1>
          <p className="text-xs text-slate-300">
            Never merely state “Project delayed.” We prescribe ethical, high-leverage solutions without demanding overtime.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-lg bg-[#141d2e] border border-[#24334f] text-xs font-mono text-cyan-300">
          {pendingRecommendations.length} Prescriptive Action Plans Available
        </div>
      </div>

      {/* Applied success banner */}
      {appliedId && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-600 text-emerald-200 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Action Plan successfully applied to active schedule! Workload rebalanced and tasks unblocked.</span>
        </div>
      )}

      {/* Cards List */}
      <div className="space-y-5">
        {actionRecommendations.map(rec => {
          const isPending = rec.status === 'pending';
          const categoryBadge = {
            overload: 'bg-rose-950 text-rose-300 border-rose-800',
            deadline_risk: 'bg-amber-950 text-amber-300 border-amber-800',
            dependency_blocker: 'bg-purple-950 text-purple-300 border-purple-800',
            meeting_reduction: 'bg-blue-950 text-blue-300 border-blue-800',
            fairness_imbalance: 'bg-orange-950 text-orange-300 border-orange-800',
            quality_tradeoff: 'bg-teal-950 text-teal-300 border-teal-800',
          }[rec.category];

          return (
            <div
              key={rec.id}
              className="p-5 rounded-2xl bg-[#121927] border border-[#202c40] space-y-4 shadow-lg hover:border-[#2c3d5a] transition"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono border ${categoryBadge}`}>
                      {rec.category.replace('_', ' ')}
                    </span>
                    <h2 className="font-extrabold text-white text-base">{rec.title}</h2>
                  </div>
                  <div className="text-xs text-rose-300 font-medium">
                    <strong>Problem:</strong> {rec.problem}
                  </div>
                  <div className="text-xs text-slate-400">
                    <strong>Root Cause:</strong> {rec.cause}
                  </div>
                </div>

                <div className="shrink-0">
                  <button
                    onClick={() => handleApply(rec.id)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-950 flex items-center gap-2 transition active:scale-95"
                  >
                    <Check className="w-4 h-4" />
                    <span>Apply Solution Plan</span>
                  </button>
                </div>
              </div>

              {/* Prescribed Concrete Solution Steps */}
              <div className="p-4 rounded-xl bg-[#0c121d] border border-[#1b2538] space-y-2">
                <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>Recommended Concrete Actions (Human Decision Support):</span>
                </div>
                <ol className="list-decimal pl-5 space-y-1 text-xs text-slate-300 leading-relaxed">
                  {rec.recommendedActions.map((action, idx) => (
                    <li key={idx}>{action}</li>
                  ))}
                </ol>
              </div>

              {/* Before vs After Forecast Delta */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-lg bg-[#141b29] border border-rose-900/40 text-slate-300">
                  <div className="text-[10px] uppercase font-bold text-rose-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Current Uncorrected Forecast (Estimate)</span>
                  </div>
                  <div className="font-semibold text-rose-200 mt-1">{rec.currentForecast}</div>
                </div>

                <div className="p-3 rounded-lg bg-[#141b29] border border-emerald-900/40 text-slate-300">
                  <div className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Optimized Prescribed Forecast (Estimate)</span>
                  </div>
                  <div className="font-semibold text-emerald-300 mt-1">{rec.optimizedForecast}</div>
                </div>
              </div>

              {/* Ethical impact footer */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-[#182335]">
                <span className="flex items-center gap-1 text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{rec.impactSummary}</span>
                </span>
                <span className="italic">All forecasts clearly labeled as estimates.</span>
              </div>
            </div>
          );
        })}

        {actionRecommendations.length === 0 && (
          <div className="p-12 text-center rounded-2xl bg-[#121927] border border-[#202c40] text-slate-400 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <div className="text-white font-bold text-sm">All Plans Stable</div>
            <p className="mt-1">Zero critical path bottlenecks or chronic overloads currently flagged.</p>
          </div>
        )}
      </div>
    </div>
  );
};
