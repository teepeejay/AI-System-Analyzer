import React from 'react';
import { 
  Layers, 
  Server, 
  Terminal, 
  BrainCircuit, 
  FileCheck2, 
  Database, 
  ShieldCheck, 
  ArrowRight,
  FolderTree,
  Code2
} from 'lucide-react';

export const ArchitectureDocTab: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600/20 border border-indigo-500/40 rounded-xl text-indigo-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Sentinel AI Engineering Architecture & Roadmap</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Production-grade architectural foundation establishing strict data contracts, cross-platform telemetry schema,
              and multi-agent isolation.
            </p>
          </div>
        </div>
      </div>

      {/* Architecture Topology */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Server className="w-4 h-4 text-indigo-400" />
          End-to-End System Topology
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          {/* Node 1 */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-emerald-400 font-bold text-[10px]">LAYER 01</span>
              <Terminal className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="font-bold text-white text-xs">Target Endpoints</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Linux, Windows, & macOS machines running the read-only Python discovery probe locally via cron or MDM.
            </p>
            <div className="text-[10px] text-slate-500 font-mono">Payload: JSON Schema</div>
          </div>

          {/* Node 2 */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-indigo-400 font-bold text-[10px]">LAYER 02</span>
              <Server className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="font-bold text-white text-xs">Sentinel AI Ingest API</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Node.js Express backend validates incoming telemetry payloads against strict TypeScript schemas.
            </p>
            <div className="text-[10px] text-slate-500 font-mono">Endpoint: /api/telemetry/ingest</div>
          </div>

          {/* Node 3 */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-indigo-400 font-bold text-[10px]">LAYER 03</span>
              <BrainCircuit className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="font-bold text-white text-xs">Diagnostic Research Agent</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Gemini 3.8 Flash model cross-references telemetry anomalies against curated internal SRE runbooks.
            </p>
            <div className="text-[10px] text-slate-500 font-mono">Target: Milestone 2</div>
          </div>

          {/* Node 4 */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-slate-400 font-bold text-[10px]">LAYER 04</span>
              <FileCheck2 className="w-4 h-4 text-slate-400" />
            </div>
            <div className="font-bold text-white text-xs">Reporting Agent</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Synthesizes root-cause diagnosis into executive reports and verifiable, OS-tailored commands.
            </p>
            <div className="text-[10px] text-slate-500 font-mono">Target: Milestone 3</div>
          </div>
        </div>
      </div>

      {/* File Manifest & Structure */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <FolderTree className="w-4 h-4 text-indigo-400" />
          Project Architecture & File Manifest
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono">
            <div className="text-indigo-400 font-bold">/src/types/sentinel.ts</div>
            <p className="text-slate-400 font-sans text-[11px] leading-relaxed">
              Standardized contracts defining <code>EndpointTelemetry</code>, <code>HardwareMetrics</code>, <code>InternalRunbook</code>, <code>DiagnosticAnalysis</code>, and <code>DiagnosticReport</code> schemas.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono">
            <div className="text-indigo-400 font-bold">/server.ts</div>
            <p className="text-slate-400 font-sans text-[11px] leading-relaxed">
              Express full-stack backend running Vite middleware in dev, handling telemetry ingestion, runbooks API, probe script delivery, and health checks.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono">
            <div className="text-indigo-400 font-bold">/scripts/sentinel_probe.py</div>
            <p className="text-slate-400 font-sans text-[11px] leading-relaxed">
              Zero-dependency Python 3 scanner with read-only guarantees, command-line credential sanitization, and multi-OS discovery.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono">
            <div className="text-indigo-400 font-bold">/src/data/runbooks.ts</div>
            <p className="text-slate-400 font-sans text-[11px] leading-relaxed">
              Internal SRE runbooks indexing symptoms, diagnostic triggers, known root causes, and safe OS-specific remediation steps.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono">
            <div className="text-indigo-400 font-bold">/src/data/sampleEndpoints.ts</div>
            <p className="text-slate-400 font-sans text-[11px] leading-relaxed">
              Real-world telemetry datasets covering Linux OOM incidents, Windows RPC/Spooler hangs, and macOS APFS snapshot pressure.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono">
            <div className="text-indigo-400 font-bold">/src/components/*</div>
            <p className="text-slate-400 font-sans text-[11px] leading-relaxed">
              High-density IT management console: Fleet table, deep telemetry inspector, runbooks browser, and JSON ingestion engine.
            </p>
          </div>
        </div>
      </div>

      {/* Security & Isolation */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Security, Privacy & Read-Only Operational Guarantees
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="font-bold text-white">Read-Only Probe</span>
            <p className="text-slate-400 text-[11px]">
              Probe queries read-only filesystems (/proc, sysctl) and status APIs without altering system states or configurations.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="font-bold text-white">Credential Masking</span>
            <p className="text-slate-400 text-[11px]">
              Sensitive CLI arguments (passwords, tokens, bearer headers) are automatically stripped before transmitting telemetry.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="font-bold text-white">Server-Side AI Proxy</span>
            <p className="text-slate-400 text-[11px]">
              Gemini API calls are orchestrated exclusively on the backend server; client browsers never hold secret keys or credentials.
            </p>
          </div>
        </div>
      </div>

      {/* Development Milestones */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-white">Development Milestones Roadmap</h3>

        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/40 flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              1
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-xs">Milestone 1 (Current): Core Architecture & IT Dashboard</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                  COMPLETE & VERIFIED
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Defined structured JSON schemas, full-stack Express + Vite environment, cross-platform Python discovery probe architecture,
                sample fleet with multi-OS telemetry, runbook repository, and deep inspection console.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-slate-800 text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              2
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-xs">Milestone 2: Diagnostic Research Agent Integration</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-bold">
                  NEXT MILESTONE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Implement server-side Gemini 3.8 reasoning pipeline to inspect telemetry, cross-reference symptoms with internal runbooks,
                and produce structured diagnostic evaluations with OS-specific commands.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              3
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-xs">Milestone 3: Reporting Agent & Automated Action Plans</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-bold">
                  PLANNED
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Generate executive summaries, post-mortem writeups, downloadable PDF/Markdown reports, and verification workflows with confidence metrics.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
