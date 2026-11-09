import React from 'react';
import { Shield, Server, Activity, Terminal, Clock, RefreshCw, Cpu, Layers, Sparkles } from 'lucide-react';

interface HeaderProps {
  onOpenIngest: () => void;
  onOpenScannerSpec: () => void;
  onOpenScanCommand?: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  endpointCount: number;
  viewMode: 'simplified' | 'advanced';
  setViewMode: (mode: 'simplified' | 'advanced') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenIngest,
  onOpenScannerSpec,
  onOpenScanCommand,
  activeTab,
  setActiveTab,
  endpointCount,
  viewMode,
  setViewMode,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Tag */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600/20 border border-indigo-500/40 rounded-xl text-indigo-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white">Sentinel AI</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  Diagnostics
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Multi-OS Endpoint Triage & Reliability</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('fleet')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'fleet'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>{viewMode === 'simplified' ? 'Computers' : 'Fleet & Telemetry'}</span>
              <span className="ml-0.5 px-1.5 py-0.2 bg-slate-800 rounded-full text-[10px] text-slate-300">
                {endpointCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('runbooks')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'runbooks'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Runbooks</span>
            </button>

            <button
              onClick={() => setActiveTab('architecture')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all hidden md:flex items-center gap-1.5 ${
                activeTab === 'architecture'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Architecture</span>
            </button>
          </nav>

          {/* View Mode Switcher & Quick Actions */}
          <div className="flex items-center gap-2.5">
            {/* View Mode Toggle Pill */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setViewMode('simplified')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 text-[11px] ${
                  viewMode === 'simplified'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Switch to simplified, friendly view"
              >
                <Sparkles className="w-3 h-3 text-indigo-200" />
                <span>Simple</span>
              </button>
              <button
                onClick={() => setViewMode('advanced')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 text-[11px] ${
                  viewMode === 'advanced'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Switch to advanced SRE console with raw telemetry tables"
              >
                <span>Pro SRE</span>
              </button>
            </div>

            <button
              onClick={onOpenScannerSpec}
              className="hidden lg:flex px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 items-center gap-1.5 transition-colors"
              title="Inspect Python Probe script and packaging"
            >
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              <span>Python Probe</span>
            </button>

            {onOpenScanCommand && (
              <button
                onClick={onOpenScanCommand}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                title="Get 1-line automated scan command for Linux, Mac, or Windows"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span className="font-medium">Copy Scan Command</span>
              </button>
            )}

            <button
              onClick={onOpenIngest}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-colors shadow-sm"
              title="Ingest new telemetry scan"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Manual Ingest</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
