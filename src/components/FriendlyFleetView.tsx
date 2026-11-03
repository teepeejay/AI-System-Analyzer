import React, { useState } from 'react';
import { EndpointTelemetry, OperatingSystem } from '../types/sentinel.js';
import { 
  Server, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  Search, 
  Cpu, 
  HardDrive, 
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';

interface FriendlyFleetViewProps {
  endpoints: EndpointTelemetry[];
  selectedEndpointId: string | null;
  onSelectEndpoint: (id: string) => void;
  onOpenIngest: () => void;
}

export const FriendlyFleetView: React.FC<FriendlyFleetViewProps> = ({
  endpoints,
  selectedEndpointId,
  onSelectEndpoint,
  onOpenIngest,
}) => {
  const [osFilter, setOsFilter] = useState<'all' | OperatingSystem>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Human-friendly plain-English descriptions for incidents
  const getFriendlyIssueSummary = (ep: EndpointTelemetry) => {
    if (ep.reportedSeverity === 'CRITICAL') {
      return {
        badge: 'High Priority',
        badgeColor: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
        headline: 'Memory Exhausted & Service Stopped',
        explanation: 'The system ran out of RAM, causing the operating system to stop the API worker process.',
      };
    }
    if (ep.reportedSeverity === 'HIGH') {
      return {
        badge: 'Action Recommended',
        badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        headline: 'Service Freezing (Port Exhaustion)',
        explanation: 'The Windows Print Spooler service stopped responding due to exhausted network connections.',
      };
    }
    if (ep.reportedSeverity === 'MEDIUM') {
      return {
        badge: 'Warning',
        badgeColor: 'bg-amber-500/10 text-amber-200 border-amber-500/20',
        headline: 'Storage Space Almost Full',
        explanation: 'Backup snapshots are taking up 97% of drive capacity, which may slow down build jobs.',
      };
    }
    return {
      badge: 'Healthy',
      badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      headline: 'Running Smoothly',
      explanation: 'All system checks are green with normal CPU, memory, and database replication.',
    };
  };

  const getFriendlyPlatformLabel = (platform: OperatingSystem) => {
    switch (platform) {
      case 'linux':
        return { label: 'Linux Server', icon: '🐧' };
      case 'windows':
        return { label: 'Windows Server', icon: '🪟' };
      case 'darwin':
        return { label: 'macOS Workstation', icon: '🍎' };
    }
  };

  const filteredEndpoints = endpoints.filter((e) => {
    if (osFilter !== 'all' && e.system.platform !== osFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchHost = e.system.hostname.toLowerCase().includes(q);
      const matchOs = e.system.osName.toLowerCase().includes(q);
      const matchIp = e.system.ipAddresses.some((ip) => ip.includes(q));
      if (!matchHost && !matchOs && !matchIp) return false;
    }
    return true;
  });

  const criticalOrWarningCount = endpoints.filter(
    (e) => e.reportedSeverity === 'CRITICAL' || e.reportedSeverity === 'HIGH' || e.reportedSeverity === 'MEDIUM'
  ).length;

  return (
    <div className="space-y-6">
      {/* Friendly Fleet Health Summary Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/30 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                System Overview
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-xs text-slate-400">{endpoints.length} Computers Monitored</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
              {criticalOrWarningCount > 0 ? (
                <span className="flex items-center gap-2 text-white">
                  <span>{criticalOrWarningCount} {criticalOrWarningCount === 1 ? 'computer needs' : 'computers need'} attention</span>
                </span>
              ) : (
                <span className="text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6" />
                  All computers are healthy
                </span>
              )}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Sentinel AI automatically monitors machine health, resource usage, and background services across your Linux, Windows, and Mac devices.
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto">
            <button
              onClick={onOpenIngest}
              className="w-full md:w-auto px-4 py-2 text-xs font-medium rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <span>+ Ingest New Scan</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setOsFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                osFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              All Computers ({endpoints.length})
            </button>
            <button
              onClick={() => setOsFilter('linux')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                osFilter === 'linux'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span>🐧</span> Linux
            </button>
            <button
              onClick={() => setOsFilter('windows')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                osFilter === 'windows'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span>🪟</span> Windows
            </button>
            <button
              onClick={() => setOsFilter('darwin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                osFilter === 'darwin'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span>🍎</span> Mac
            </button>
          </div>

          <div className="relative max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search computer name or IP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Clean Friendly Computer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEndpoints.map((ep) => {
          const isSelected = ep.id === selectedEndpointId;
          const friendly = getFriendlyIssueSummary(ep);
          const osInfo = getFriendlyPlatformLabel(ep.system.platform);
          const cpuPercent = ep.hardware.cpuUtilizationPercent;
          const memPercent = ep.hardware.memory.usedPercent;
          const diskPercent = ep.hardware.disks[0]?.usedPercent || 0;

          return (
            <div
              key={ep.id}
              onClick={() => onSelectEndpoint(ep.id)}
              className={`rounded-2xl p-5 border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-indigo-950/30 border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="text-2xl p-2.5 rounded-xl bg-slate-950 border border-slate-800 shrink-0">
                    {osInfo.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-base font-mono">{ep.system.hostname}</h3>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {osInfo.label} • {ep.system.ipAddresses[0] || '127.0.0.1'}
                    </p>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${friendly.badgeColor}`}>
                  {friendly.badge}
                </span>
              </div>

              {/* Friendly Issue Explanation */}
              <div className="mt-4 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  {ep.reportedSeverity === 'CRITICAL' ? (
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  ) : ep.reportedSeverity === 'HIGH' || ep.reportedSeverity === 'MEDIUM' ? (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  )}
                  <span>{friendly.headline}</span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {friendly.explanation}
                </p>
              </div>

              {/* 3 Simple Vitals Bars */}
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-slate-950/40 border border-slate-800/50">
                  <div className="text-[10px] text-slate-400 uppercase font-medium">CPU</div>
                  <div className={`font-mono font-bold mt-0.5 ${cpuPercent > 80 ? 'text-rose-400' : 'text-slate-200'}`}>
                    {cpuPercent}%
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-slate-950/40 border border-slate-800/50">
                  <div className="text-[10px] text-slate-400 uppercase font-medium">Memory</div>
                  <div className={`font-mono font-bold mt-0.5 ${memPercent > 85 ? 'text-rose-400' : 'text-slate-200'}`}>
                    {memPercent}%
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-slate-950/40 border border-slate-800/50">
                  <div className="text-[10px] text-slate-400 uppercase font-medium">Storage</div>
                  <div className={`font-mono font-bold mt-0.5 ${diskPercent > 90 ? 'text-amber-400' : 'text-slate-200'}`}>
                    {diskPercent}%
                  </div>
                </div>
              </div>

              {/* Select Button */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">
                  Last checked: {new Date(ep.probeMetadata.scanTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className={`font-semibold flex items-center gap-1 ${isSelected ? 'text-indigo-400' : 'text-slate-300'}`}>
                  {isSelected ? 'Currently Inspecting' : 'Click to Inspect'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
