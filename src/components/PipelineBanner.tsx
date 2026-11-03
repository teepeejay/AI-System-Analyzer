import React, { useState } from 'react';
import { Search, BrainCircuit, FileCheck2, CheckCircle2, ChevronDown, ChevronUp, Sparkles, ArrowRight } from 'lucide-react';

interface PipelineBannerProps {
  viewMode?: 'simplified' | 'advanced';
}

export const PipelineBanner: React.FC<PipelineBannerProps> = ({ viewMode = 'simplified' }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // If in simplified mode: display clean, uncluttered, approachable card
  if (viewMode === 'simplified') {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">How Sentinel AI Triage Works</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Automated SRE Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                3-stage AI triage pipeline diagnosing Linux, Windows, and macOS endpoints without modifying system state.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 self-end sm:self-auto transition-colors"
          >
            <span>{isExpanded ? 'Hide Pipeline Steps' : 'View Pipeline Steps'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <Search className="w-3.5 h-3.5" />
                <span>1. Read-Only Scan</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Python scanner runs locally, collecting metrics, processes, services, and error logs with zero modifications.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
                <BrainCircuit className="w-3.5 h-3.5" />
                <span>2. AI Research Agent</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Gemini cross-references telemetry anomalies against curated internal SRE runbooks to isolate the exact cause.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>3. Clear Fix Report</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Produces plain-English diagnosis and safe, copyable remediation commands tailored to the machine's OS.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Advanced Pro SRE View (original detailed architecture banner preserved)
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-lg backdrop-blur">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Milestone 1 Active
            </span>
            <span className="text-xs text-slate-400">Core Architecture & Operations Console</span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1">Sentinel AI Agent Triage & Diagnostics Pipeline</h2>
          <p className="text-xs text-slate-400 max-w-3xl mt-0.5">
            Designed for multi-OS fleet reliability (Linux, Windows, macOS). Telemetry is collected by read-only endpoint probes,
            cross-referenced with internal SRE runbooks, and synthesized into actionable remediation workflows.
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
            <span className="text-slate-400">Target Framework: </span>
            <span className="font-semibold text-indigo-300">React + Node.js + Gemini 3.8</span>
          </div>
        </div>
      </div>

      {/* 3-Agent Pipeline Visualizer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4">
        {/* Agent 1 */}
        <div className="p-3.5 rounded-lg bg-slate-950/70 border border-emerald-500/30 relative overflow-hidden group">
          <div className="absolute top-0 left-0 h-1 w-full bg-emerald-500"></div>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Search className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white">1. Endpoint Discovery Agent</span>
                </div>
                <span className="text-[10px] font-medium text-emerald-400 uppercase tracking-wider">
                  Operational (Schema & Probe)
                </span>
              </div>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
              v1.4.0
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2.5 leading-relaxed">
            Local read-only Python scanner collecting hardware metrics, processes, services, network sockets, and system logs across Linux, Windows, & macOS.
          </p>
          <div className="mt-2.5 pt-2 border-t border-slate-900 flex items-center justify-between text-[10px]">
            <span className="text-slate-400">Read-Only Guard: <strong className="text-emerald-400">Enforced</strong></span>
            <span className="text-slate-400 font-mono">Pure Python 3</span>
          </div>
        </div>

        {/* Agent 2 */}
        <div className="p-3.5 rounded-lg bg-slate-950/70 border border-indigo-500/30 relative overflow-hidden group">
          <div className="absolute top-0 left-0 h-1 w-full bg-indigo-500"></div>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <BrainCircuit className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white">2. Diagnostic Research Agent</span>
                </div>
                <span className="text-[10px] font-medium text-indigo-300 uppercase tracking-wider">
                  Milestone 2 Next Up
                </span>
              </div>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono">
              Ready
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2.5 leading-relaxed">
            Cross-references telemetry anomalies against internal SRE runbooks and official documentation using Gemini reasoning to isolate exact root causes.
          </p>
          <div className="mt-2.5 pt-2 border-t border-slate-900 flex items-center justify-between text-[10px]">
            <span className="text-slate-400">Runbook Grounding: <strong className="text-indigo-400">Indexed</strong></span>
            <span className="text-slate-400 font-mono">OS-Tailored Cmds</span>
          </div>
        </div>

        {/* Agent 3 */}
        <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800 relative overflow-hidden group">
          <div className="absolute top-0 left-0 h-1 w-full bg-slate-700"></div>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                <FileCheck2 className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white">3. Reporting Agent</span>
                </div>
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                  Milestone 3 Planned
                </span>
              </div>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 font-mono">
              Queue
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2.5 leading-relaxed">
            Synthesizes diagnostic findings into executive summaries, technical timelines, verifiable safe commands, and confidence ratings for SRE teams.
          </p>
          <div className="mt-2.5 pt-2 border-t border-slate-900 flex items-center justify-between text-[10px]">
            <span className="text-slate-400">Output: <strong className="text-slate-300">Executive & SRE</strong></span>
            <span className="text-slate-400 font-mono">Confidence Level</span>
          </div>
        </div>
      </div>
    </div>
  );
};
