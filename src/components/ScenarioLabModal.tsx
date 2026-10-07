import React, { useState } from 'react';
import { useWorkflow } from '../context/WorkflowContext';
import { FlaskConical, Play, CheckCircle2, ChevronRight, X, Sparkles } from 'lucide-react';

interface ScenarioLabModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToView: (viewId: string) => void;
}

export const ScenarioLabModal: React.FC<ScenarioLabModalProps> = ({
  isOpen,
  onClose,
  onNavigateToView,
}) => {
  const { loadPresetScenario } = useWorkflow();
  const [activeScenarioKey, setActiveScenarioKey] = useState<string>('A');
  const [executionMessage, setExecutionMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const scenarios = [
    {
      key: 'A',
      title: 'Scenario A: Normal Workload',
      description: 'Standard sprint workload with realistic 15% buffer and balanced allocation across engineers.',
      expected: 'Balanced capacity ratios (<85%), healthy project scores, zero overtime.',
      recommendedView: 'command',
      viewName: 'Command Center',
    },
    {
      key: 'B',
      title: 'Scenario B: Employee Unavailable',
      description: 'Lead Site Reliability Engineer Kai Tanaka suddenly becomes unavailable due to an unexpected event.',
      expected: 'System identifies orphaned tasks (VPC Latency Test & IAM Rotation) and prompts reallocation.',
      recommendedView: 'action_plans',
      viewName: 'Action Plans',
    },
    {
      key: 'C',
      title: 'Scenario C: Project Falls Behind',
      description: 'Project Nexus sharding tasks delayed by unexpected Debezium CDC replica lag.',
      expected: 'System flags project as "Needs Attention" 4 days before deadline and displays Recommended Action Plan.',
      recommendedView: 'command',
      viewName: 'Command Center & Timeline',
    },
    {
      key: 'D',
      title: 'Scenario D: Capacity Conflict (>40h Assigned)',
      description: 'Assigns 44h of critical work to Maya Lin within a single 40h work week.',
      expected: 'System triggers HARD RULE: "Capacity Conflict: Assigned work exceeds official hours. No chronic overtime!"',
      recommendedView: 'distribution',
      viewName: 'Work Distribution',
    },
    {
      key: 'E',
      title: 'Scenario E: Approved Leave & Handover',
      description: 'Kai Tanaka has approved 3-day annual leave from Oct 12–14.',
      expected: 'System locks leave as fixed constraint, generates Pre-Leave Handover Plan, delegates to Maya Lin.',
      recommendedView: 'leave_holidays',
      viewName: 'Leave & Handover Planner',
    },
    {
      key: 'F',
      title: 'Scenario F: Deadline Moves Earlier',
      description: 'Project Nexus target completion pulled forward 2 days by executive stakeholders.',
      expected: 'Scenario simulator shows consequence, identifies bottleneck, and suggests scope trimming.',
      recommendedView: 'simulator',
      viewName: 'Scenario Simulator ("What If?")',
    },
    {
      key: 'G',
      title: 'Scenario G: Fairness Imbalance',
      description: 'Maya Lin repeatedly assigned 80%+ of urgent tasks because she finishes them quickly.',
      expected: 'Fairness Engine flags "Workload imbalance detected" and warns against burnout of high performers.',
      recommendedView: 'fairness_quality',
      viewName: 'Fairness & Quality Engine',
    },
    {
      key: 'H',
      title: 'Scenario H: Quality vs Speed Trade-off',
      description: 'Delivery velocity increased by +18%, but rework and defect rate increased by +11.4%.',
      expected: 'Quality Protection Engine alerts management: "Do not sacrifice quality for superficial speed."',
      recommendedView: 'fairness_quality',
      viewName: 'Fairness & Quality Engine',
    },
    {
      key: 'I',
      title: 'Scenario I: Cross-Department Blocker',
      description: 'Backend task blocked by AWS egress gateway throttling managed by Infrastructure.',
      expected: 'Dependency alert identifies blocker, impacted teams, and initiates cross-functional pairing.',
      recommendedView: 'command',
      viewName: 'Command Center',
    },
    {
      key: 'J',
      title: 'Scenario J: Competing Project Contention',
      description: 'Multiple projects (Nexus, Pulse, Shield) simultaneously compete for Maya Lin.',
      expected: 'Shared resource bottleneck identified; recommends priority sequencing rather than parallel overload.',
      recommendedView: 'action_plans',
      viewName: 'Action Plans',
    },
  ];

  const currentScenario = scenarios.find(s => s.key === activeScenarioKey) || scenarios[0];

  const handleRunScenario = (key: string) => {
    loadPresetScenario(key as any);
    setActiveScenarioKey(key);
    setExecutionMessage(`Loaded ${scenarios.find(s => s.key === key)?.title}. Live data models updated!`);
    setTimeout(() => setExecutionMessage(null), 4000);
  };

  const handleRunAndJump = (scenario: typeof scenarios[0]) => {
    loadPresetScenario(scenario.key as any);
    onNavigateToView(scenario.recommendedView);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl bg-[#0f1523] border border-[#2b3a56] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#141e30] border-b border-[#222f46] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">SCENARIO TEST LAB</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                  Prompt Scenarios A to J
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Execute live operational test cases defined in the WORKFLOW OS specification
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Execution toast */}
        {executionMessage && (
          <div className="px-5 py-2 bg-emerald-950/80 border-b border-emerald-700/80 text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{executionMessage}</span>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          {/* Scenario List (Left) */}
          <div className="md:col-span-5 border-r border-[#1e2a3f] overflow-y-auto p-3 space-y-1 bg-[#0b101a]">
            {scenarios.map(s => {
              const isSelected = activeScenarioKey === s.key;
              return (
                <button
                  key={s.key}
                  onClick={() => setActiveScenarioKey(s.key)}
                  className={`w-full text-left p-2.5 rounded-lg border transition ${
                    isSelected
                      ? 'bg-amber-950/40 border-amber-500 text-amber-200 shadow-sm'
                      : 'bg-[#121927] border-[#1d273a] text-slate-300 hover:bg-[#182234]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{s.title}</span>
                    <span className="text-[10px] font-mono px-1 py-0.5 rounded bg-[#1f2b40] text-slate-400">
                      {s.key}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{s.description}</p>
                </button>
              );
            })}
          </div>

          {/* Scenario Details & Controls (Right) */}
          <div className="md:col-span-7 p-6 overflow-y-auto space-y-5 bg-[#0f1523]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-amber-400 px-2 py-0.5 rounded bg-amber-950/80 border border-amber-800">
                  Scenario {currentScenario.key}
                </span>
                <span className="text-base font-extrabold text-white">{currentScenario.title}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mt-2">
                {currentScenario.description}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#141c2c] border border-[#232f46] space-y-2">
              <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>System Expected Behavior:</span>
              </div>
              <p className="text-xs text-cyan-200 leading-relaxed font-mono">
                {currentScenario.expected}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#141c2c] border border-[#232f46] flex items-center justify-between">
              <div>
                <div className="text-[11px] text-slate-400">Best view to observe results:</div>
                <div className="text-xs font-bold text-white mt-0.5">{currentScenario.viewName}</div>
              </div>
              <button
                onClick={() => handleRunAndJump(currentScenario)}
                className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center gap-1.5 transition"
              >
                <span>Run &amp; View Screen</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Action buttons */}
            <div className="pt-3 border-t border-[#1e2a3f] flex items-center gap-3">
              <button
                onClick={() => handleRunScenario(currentScenario.key)}
                className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-950 transition"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Execute Scenario {currentScenario.key} in Background</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
