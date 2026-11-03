import React, { useState } from 'react';
import { INTERNAL_RUNBOOKS } from '../data/runbooks.js';
import { OperatingSystem, InternalRunbook } from '../types/sentinel.js';
import { 
  BookOpen, 
  Search, 
  Terminal, 
  ExternalLink, 
  Copy, 
  Check, 
  AlertTriangle, 
  ShieldCheck, 
  HelpCircle,
  FileCode2
} from 'lucide-react';

export const RunbooksLibrary: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOS, setSelectedOS] = useState<'all' | OperatingSystem>('all');
  const [selectedRunbook, setSelectedRunbook] = useState<InternalRunbook | null>(INTERNAL_RUNBOOKS[0]);
  const [copiedCmdIndex, setCopiedCmdIndex] = useState<number | null>(null);

  const filteredRunbooks = INTERNAL_RUNBOOKS.filter((rb) => {
    if (selectedOS !== 'all' && !rb.targetOS.includes(selectedOS) && !rb.targetOS.includes('all')) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = rb.title.toLowerCase().includes(q);
      const matchDesc = rb.symptomDescription.toLowerCase().includes(q);
      const matchKey = rb.symptomKeywords.some((k) => k.toLowerCase().includes(q));
      const matchId = rb.id.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchKey && !matchId) return false;
    }
    return true;
  });

  const handleCopyCmd = (command: string, index: number) => {
    navigator.clipboard.writeText(command);
    setCopiedCmdIndex(index);
    setTimeout(() => setCopiedCmdIndex(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Intro Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600/20 border border-indigo-500/40 rounded-xl text-indigo-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Internal SRE Runbook Knowledge Base</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Curated IT runbooks for incident triage. The upcoming Diagnostic Research Agent cross-references endpoint telemetry against these procedures to prescribe safe, OS-specific remediation.
            </p>
          </div>
        </div>
      </div>

      {/* Search and OS filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setSelectedOS('all')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              selectedOS === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Platforms
          </button>
          <button
            onClick={() => setSelectedOS('linux')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              selectedOS === 'linux' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🐧</span> Linux
          </button>
          <button
            onClick={() => setSelectedOS('windows')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              selectedOS === 'windows' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🪟</span> Windows
          </button>
          <button
            onClick={() => setSelectedOS('darwin')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              selectedOS === 'darwin' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🍎</span> macOS
          </button>
        </div>

        <div className="relative max-w-sm flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search runbook symptoms, codes, keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Master-Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Runbook List Sidebar */}
        <div className="lg:col-span-5 space-y-2">
          {filteredRunbooks.map((rb) => {
            const isSelected = selectedRunbook?.id === rb.id;
            return (
              <div
                key={rb.id}
                onClick={() => setSelectedRunbook(rb)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-indigo-950/40 border-indigo-500 shadow-md ring-1 ring-indigo-500/30'
                    : 'bg-slate-900 border-slate-800 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <span className="font-mono font-bold text-indigo-400">{rb.id}</span>
                  <div className="flex items-center gap-1">
                    {rb.targetOS.map((os, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-950 text-slate-300 border border-slate-800">
                        {os}
                      </span>
                    ))}
                  </div>
                </div>
                <h3 className="text-xs font-bold text-white leading-snug">{rb.title}</h3>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{rb.symptomDescription}</p>
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  {rb.symptomKeywords.slice(0, 3).map((kw, i) => (
                    <span key={i} className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Runbook Deep Dive */}
        <div className="lg:col-span-7">
          {selectedRunbook ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-5">
              {/* Header */}
              <div className="border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2 mb-1 text-xs">
                  <span className="font-mono font-bold text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                    {selectedRunbook.id}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-400 uppercase tracking-wider text-[10px] font-semibold">
                    {selectedRunbook.category}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">{selectedRunbook.title}</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {selectedRunbook.symptomDescription}
                </p>
              </div>

              {/* Diagnostic Triggers */}
              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  Diagnostic Matching Triggers
                </span>
                <div className="space-y-1 text-xs font-mono text-slate-300">
                  {selectedRunbook.diagnosticTriggers.metricThresholds?.map((m, i) => (
                    <div key={i} className="flex items-center gap-2 text-rose-300 text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                      <span>Metric Condition: {m}</span>
                    </div>
                  ))}
                  {selectedRunbook.diagnosticTriggers.logPatterns?.map((l, i) => (
                    <div key={i} className="flex items-center gap-2 text-amber-300 text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                      <span>Log Pattern: "{l}"</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Known Root Causes */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Known Root Causes
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                  {selectedRunbook.knownRootCauses.map((cause, i) => (
                    <li key={i} className="leading-relaxed">
                      {cause}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Remediation Steps */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2.5">
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                  Tailored OS Remediation Commands
                </span>
                <div className="space-y-3">
                  {selectedRunbook.remediationSteps.map((step, idx) => (
                    <div key={idx} className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-white">
                          Step {step.stepNumber}: {step.title}
                        </span>
                        <div className="flex items-center gap-2">
                          {step.requiresElevation && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-mono">
                              Requires Sudo/Admin
                            </span>
                          )}
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 uppercase font-mono">
                            {step.targetOS}
                          </span>
                        </div>
                      </div>

                      <div className="relative group">
                        <pre className="p-2.5 rounded bg-slate-900 border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto">
                          {step.command}
                        </pre>
                        <button
                          onClick={() => handleCopyCmd(step.command, idx)}
                          className="absolute right-2 top-2 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                          title="Copy command to clipboard"
                        >
                          {copiedCmdIndex === idx ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {step.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Official Documentation */}
              <div className="pt-3 border-t border-slate-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Official Documentation & Grounding References
                </span>
                <div className="space-y-1.5">
                  {selectedRunbook.officialDocs.map((doc, i) => (
                    <a
                      key={i}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-indigo-300 group transition-colors"
                    >
                      <span className="font-medium group-hover:text-indigo-200">{doc.title}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-300 ml-2 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-xs">
              Select a runbook from the left to view triggers and remediation procedures.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
