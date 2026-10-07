import React, { useState } from 'react';
import { useWorkflow } from '../../context/WorkflowContext';
import { CompanyPolicy } from '../../types';
import {
  Settings,
  ShieldCheck,
  FileText,
  Sliders,
  CheckCircle2,
  Clock,
  Search,
  Filter,
} from 'lucide-react';

export const AdminControlsView: React.FC = () => {
  const { companyPolicy, updateCompanyPolicy, auditLogs } = useWorkflow();

  const [policyForm, setPolicyForm] = useState<CompanyPolicy>(companyPolicy);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');

  const handleSavePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanyPolicy(policyForm);
    setSaveMessage('Company workforce policies successfully updated and audited.');
    setTimeout(() => setSaveMessage(null), 4000);
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#111927] to-[#1a2133] border border-[#233148] shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-400 px-2 py-0.5 rounded bg-purple-950 border border-purple-800">
              Governance &amp; Audit
            </span>
            <span className="text-xs text-slate-400">Sections 19, 20 &amp; 27 Controls</span>
          </div>
          <h1 className="text-xl font-extrabold text-white mt-1">
            System Policies &amp; Immutable Audit Trail
          </h1>
          <p className="text-xs text-slate-300">
            Configure working hours, buffer thresholds, and audit explainable AI/allocation decisions.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-purple-300 bg-[#141b2a] px-3 py-2 rounded-xl border border-[#26354f]">
          <ShieldCheck className="w-4 h-4" />
          <span>RBAC + Scope Access Active</span>
        </div>
      </div>

      {saveMessage && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-600 text-emerald-200 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Main Grid: Policy Editor (Left 5 cols) & Audit Trail Table (Right 7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Policy Editor */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-[#121927] border border-[#202c40] space-y-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-400" />
            <h2 className="text-xs font-bold uppercase text-white tracking-wider">
              Workforce &amp; Capacity Policies
            </h2>
          </div>

          <form onSubmit={handleSavePolicy} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Official Daily Working Hours Limit
              </label>
              <input
                type="number"
                step="0.5"
                min="4"
                max="10"
                value={policyForm.officialDailyHours}
                onChange={e => setPolicyForm({ ...policyForm, officialDailyHours: Number(e.target.value) })}
                className="w-full bg-[#0b101a] border border-[#26354d] rounded-lg p-2 text-white"
              />
              <div className="text-[10px] text-slate-500 mt-0.5">Statutory standard: 8.0 hours/day</div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Maximum Weekly Hours Ceiling
              </label>
              <input
                type="number"
                step="1"
                min="20"
                max="50"
                value={policyForm.maxWeeklyHours}
                onChange={e => setPolicyForm({ ...policyForm, maxWeeklyHours: Number(e.target.value) })}
                className="w-full bg-[#0b101a] border border-[#26354d] rounded-lg p-2 text-white"
              />
              <div className="text-[10px] text-slate-500 mt-0.5">Standard: 40.0 hours/week</div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Reserved Buffer Capacity Target (%)
              </label>
              <input
                type="number"
                step="1"
                min="5"
                max="30"
                value={policyForm.bufferTargetPercent}
                onChange={e => setPolicyForm({ ...policyForm, bufferTargetPercent: Number(e.target.value) })}
                className="w-full bg-[#0b101a] border border-[#26354d] rounded-lg p-2 text-white"
              />
              <div className="text-[10px] text-slate-500 mt-0.5">Recommended: 15% reserved for context switching &amp; reviews</div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Healthy Range Max (%)</label>
                <input
                  type="number"
                  value={policyForm.healthyThresholdPercent}
                  onChange={e => setPolicyForm({ ...policyForm, healthyThresholdPercent: Number(e.target.value) })}
                  className="w-full bg-[#0b101a] border border-[#26354d] rounded-lg p-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Overload Threshold (%)</label>
                <input
                  type="number"
                  value={policyForm.overloadThresholdPercent}
                  onChange={e => setPolicyForm({ ...policyForm, overloadThresholdPercent: Number(e.target.value) })}
                  className="w-full bg-[#0b101a] border border-[#26354d] rounded-lg p-2 text-white"
                />
              </div>
            </div>

            {/* Hard rule checkbox */}
            <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/50 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={policyForm.hardRuleNoChronicOvertime}
                  onChange={e => setPolicyForm({ ...policyForm, hardRuleNoChronicOvertime: e.target.checked })}
                  className="accent-purple-500 w-4 h-4 rounded"
                />
                <span className="font-bold text-white text-xs">
                  Hard Rule: Prevent Chronic Overtime
                </span>
              </label>
              <p className="text-[11px] text-purple-200 leading-relaxed">
                When enabled, the system strictly blocks silent overtime generation and flags capacity conflicts requiring scope/deadline rebalancing.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-950 transition"
            >
              Save Policy Configuration
            </button>
          </form>
        </div>

        {/* Audit Trail Table */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-[#121927] border border-[#202c40] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <h2 className="text-xs font-bold uppercase text-white tracking-wider">
                Explainable Audit Trail
              </h2>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {filteredLogs.length} events recorded
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Every significant recommendation, allocation, and policy override is permanently logged with actor and reason.
          </p>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search audit trail by actor, action, or reason..."
              className="w-full bg-[#0b101a] border border-[#26354d] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Logs List */}
          <div className="space-y-2 max-h-[460px] overflow-y-auto">
            {filteredLogs.map(log => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-[#0b101a] border border-[#1b2538] text-xs space-y-1 hover:border-[#2a3c5a] transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-cyan-400 px-1.5 py-0.2 rounded bg-cyan-950/80 border border-cyan-800">
                      {log.action}
                    </span>
                    <span className="font-bold text-white">{log.actorName}</span>
                    <span className="text-[10px] text-slate-500 font-mono">({log.role})</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{log.timestamp}</span>
                </div>
                <div className="text-slate-300 font-medium">{log.details}</div>
                <div className="text-[11px] text-slate-400 italic">
                  <strong>Reason:</strong> {log.reason}
                </div>
              </div>
            ))}

            {filteredLogs.length === 0 && (
              <div className="p-8 text-center text-slate-500 text-xs">
                No audit logs match current filter criteria.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
