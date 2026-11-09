import React, { useState } from 'react';
import { X, Terminal, Copy, Check, ShieldCheck, Sparkles, Laptop, Server } from 'lucide-react';

interface ScanCommandModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScanCommandModal: React.FC<ScanCommandModalProps> = ({ isOpen, onClose }) => {
  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  const [selectedOS, setSelectedOS] = useState<'linux' | 'macos' | 'windows' | 'local'>('linux');

  if (!isOpen) return null;

  const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'http://localhost:3000';

  const commands = {
    linux: `curl -sSL ${origin}/api/scanner/script | python3 - --upload ${origin}/api/telemetry/ingest`,
    macos: `curl -sSL ${origin}/api/scanner/script | python3 - --upload ${origin}/api/telemetry/ingest`,
    windows: `curl.exe -sSL "${origin}/api/scanner/script" | python - --upload "${origin}/api/telemetry/ingest"`,
    local: `python3 sentinel_probe.py --upload ${origin}/api/telemetry/ingest`,
  };

  const handleCopy = (key: string, cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedTab(key);
    setTimeout(() => setCopiedTab(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/20 border border-indigo-500/40 rounded-xl text-indigo-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">1-Line Automated Scan Command</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Zero Install
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Run this command on any computer to scan it and automatically send results to this dashboard.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* OS Selector Tabs */}
        <div className="bg-slate-950 px-4 border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setSelectedOS('linux')}
            className={`py-3 px-3 text-xs font-medium border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              selectedOS === 'linux'
                ? 'border-indigo-500 text-white font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🐧</span> Linux (Ubuntu / Mint / Debian / RHEL)
          </button>

          <button
            onClick={() => setSelectedOS('macos')}
            className={`py-3 px-3 text-xs font-medium border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              selectedOS === 'macos'
                ? 'border-indigo-500 text-white font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🍎</span> macOS (Terminal)
          </button>

          <button
            onClick={() => setSelectedOS('windows')}
            className={`py-3 px-3 text-xs font-medium border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              selectedOS === 'windows'
                ? 'border-indigo-500 text-white font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🪟</span> Windows (PowerShell / CMD)
          </button>

          <button
            onClick={() => setSelectedOS('local')}
            className={`py-3 px-3 text-xs font-medium border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              selectedOS === 'local'
                ? 'border-indigo-500 text-white font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-3.5 h-3.5 text-slate-400" />
            Existing Python File
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300">
                Paste into your machine's terminal:
              </span>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Read-only passive scan (~1 second)
              </span>
            </div>

            <div className="relative group">
              <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed pr-24">
                {commands[selectedOS]}
              </pre>
              <button
                onClick={() => handleCopy(selectedOS, commands[selectedOS])}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
              >
                {copiedTab === selectedOS ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Command</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* How It Works Explainer */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
            <div className="font-semibold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              What this command does:
            </div>
            <ul className="space-y-1.5 text-slate-300 list-disc list-inside text-[11px] leading-relaxed">
              <li>
                <strong>Pulls the probe directly:</strong> Downloads the Python probe into memory without leaving clutter on your disk.
              </li>
              <li>
                <strong>Passively scans system metrics:</strong> Identifies CPU, RAM, disks, processes, and services in ~100–300 ms.
              </li>
              <li>
                <strong>Direct Ingestion:</strong> Automatically sends the scan directly to this dashboard without any copy-pasting.
              </li>
              <li>
                <strong>Zero PIP Packages:</strong> Relies 100% on Python's built-in standard library.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>The machine will immediately appear on your dashboard upon completion.</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
