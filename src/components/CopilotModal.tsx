import React, { useState } from 'react';
import { useWorkflow } from '../context/WorkflowContext';
import { askWorkflowCopilot, CopilotMessage } from '../services/copilotService';
import { Sparkles, Send, ShieldAlert, Bot, User as UserIcon, X, CheckCircle, RefreshCw } from 'lucide-react';

interface CopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CopilotModal: React.FC<CopilotModalProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    currentRole,
    projects,
    tasks,
    users,
    capacities,
    blockers,
    companyPolicy,
  } = useWorkflow();

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello ${currentUser.name}! I am Workflow Copilot. I analyze live project commitments, dependencies, and employee capacities strictly within your authorized scope (${currentRole.toUpperCase()}). Ask me about task priorities, blockers, capacity, or on-time delivery.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  if (!isOpen) return null;

  const quickQuestionsByRole = currentRole === 'employee'
    ? [
        'What should I work on next?',
        'Why is this task urgent?',
        'What is blocking Project Nexus?',
        'Who is available to help in my team?',
        'Who is the most overloaded person in the company?', // RBAC test query
      ]
    : [
        'Which projects are at risk?',
        'Where do we have unused capacity?',
        'Which tasks are blocking delivery?',
        'Show me overloaded teams.',
        'How can we finish earlier without overtime?',
      ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || loading) return;

    const userMsg: CopilotMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const response = await askWorkflowCopilot(
        textToSend,
        currentUser,
        currentRole,
        projects,
        tasks,
        users,
        capacities,
        blockers,
        companyPolicy
      );

      const assistantMsg: CopilotMessage = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        deniedByRbac: response.deniedByRbac,
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: 'Encountered a system error communicating with Workflow Copilot.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-[#0f1624] border border-[#2b3a56] rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#222f46] bg-[#141d2e]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">WORKFLOW COPILOT</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  RBAC Enforced
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Operating as: <strong className="text-slate-200">{currentUser.name}</strong> ({currentRole})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1f2c44] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#0b101a]">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-cyan-950 border border-cyan-700 flex items-center justify-center shrink-0 text-cyan-300">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-xl px-4 py-2.5 text-xs leading-relaxed shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : msg.deniedByRbac
                    ? 'bg-rose-950/60 border border-rose-800/80 text-rose-200 rounded-bl-none'
                    : 'bg-[#151e2f] border border-[#233148] text-slate-200 rounded-bl-none'
                }`}
              >
                {msg.deniedByRbac && (
                  <div className="flex items-center gap-1.5 text-rose-400 font-bold mb-1 text-[11px]">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>RBAC Access Control Violation</span>
                  </div>
                )}
                <div className="whitespace-pre-wrap">{msg.text}</div>
                <div
                  className={`text-[9px] mt-1 text-right font-mono ${
                    msg.sender === 'user' ? 'text-blue-200' : 'text-slate-300'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
              {msg.sender === 'user' && (
                <div className="w-7 h-7 rounded-full bg-blue-900 border border-blue-600 flex items-center justify-center shrink-0 text-blue-200">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-cyan-400 pl-10">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing live schedules, dependencies &amp; RBAC rules...</span>
            </div>
          )}
        </div>

        {/* Suggested Quick Questions */}
        <div className="px-4 py-2 bg-[#101726] border-t border-[#1e2a3f]">
          <div className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Suggested queries for {currentRole}:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {quickQuestionsByRole.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                disabled={loading}
                className="text-[11px] px-2.5 py-1 rounded bg-[#182337] hover:bg-[#23334e] text-slate-300 hover:text-cyan-300 border border-[#2a3b59] transition"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-[#131d2e] border-t border-[#222f46] flex items-center gap-2">
          <input
            type="text"
            value={inputQuery}
            onChange={e => setInputQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask Copilot about plans, capacity, bottlenecks, or priorities..."
            className="flex-1 bg-[#0b101a] border border-[#27364f] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputQuery.trim() || loading}
            className="px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1.5 transition"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
