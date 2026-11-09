import React, { useState } from 'react';
import { EndpointTelemetry, OperatingSystem, IncidentSeverity } from '../types/sentinel.js';
import { countScannedMetrics } from '../utils/metricCounter.js';
import { 
  Server, 
  AlertOctagon, 
  AlertTriangle, 
  CheckCircle, 
  Search, 
  Cpu, 
  HardDrive, 
  Activity, 
  Clock, 
  ExternalLink,
  Filter,
  BarChart3
} from 'lucide-react';

interface FleetOverviewProps {
  endpoints: EndpointTelemetry[];
  selectedEndpointId: string | null;
  onSelectEndpoint: (id: string) => void;
  onOpenIngest: () => void;
}

export const FleetOverview: React.FC<FleetOverviewProps> = ({
  endpoints,
  selectedEndpointId,
  onSelectEndpoint,
  onOpenIngest,
}) => {
  const [osFilter, setOsFilter] = useState<'all' | OperatingSystem>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | IncidentSeverity>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fleet Statistics
  const totalCount = endpoints.length;
  const criticalCount = endpoints.filter((e) => e.reportedSeverity === 'CRITICAL').length;
  const highCount = endpoints.filter((e) => e.reportedSeverity === 'HIGH').length;
  const mediumCount = endpoints.filter((e) => e.reportedSeverity === 'MEDIUM').length;
  const nominalCount = endpoints.filter((e) => e.reportedSeverity === 'NOMINAL').length;

  const filteredEndpoints = endpoints.filter((e) => {
    if (osFilter !== 'all' && e.system.platform !== osFilter) return false;
    if (severityFilter !== 'all' && e.reportedSeverity !== severityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchHost = e.system.hostname.toLowerCase().includes(q);
      const matchIp = e.system.ipAddresses.some((ip) => ip.includes(q));
      const matchOs = e.system.osName.toLowerCase().includes(q);
      const matchAlert = (e.alertSummary || '').toLowerCase().includes(q);
      if (!matchHost && !matchIp && !matchOs && !matchAlert) return false;
    }
    return true;
  });

  const getSeverityBadge = (severity: IncidentSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
            CRITICAL
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-200 border border-amber-500/20">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
            MEDIUM
          </span>
        );
      case 'NOMINAL':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            NOMINAL
          </span>
        );
    }
  };

  const getPlatformIcon = (platform: OperatingSystem) => {
    switch (platform) {
      case 'linux':
        return (
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 font-mono text-xs font-bold">
            🐧
          </div>
        );
      case 'windows':
        return (
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-mono text-xs font-bold">
            🪟
          </div>
        );
      case 'darwin':
        return (
          <div className="w-8 h-8 rounded-lg bg-slate-500/10 border border-slate-400/30 flex items-center justify-center text-slate-300 font-mono text-xs font-bold">
            🍎
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Monitored Nodes</span>
            <Server className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{totalCount}</span>
            <span className="text-xs text-slate-400">Endpoints</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Cross-platform telemetry active
          </div>
        </div>

        <div className="bg-slate-900 border border-rose-900/30 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-rose-300">Critical Incidents</span>
            <AlertOctagon className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-400">{criticalCount}</span>
            <span className="text-xs text-slate-400">Requires Immediate Triage</span>
          </div>
          <div className="mt-2 text-[11px] text-rose-400/80">OOM Killer / Process Failure</div>
        </div>

        <div className="bg-slate-900 border border-amber-900/30 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-300">Warning Incidents</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-400">{highCount + mediumCount}</span>
            <span className="text-xs text-slate-400">Degraded Services</span>
          </div>
          <div className="mt-2 text-[11px] text-amber-400/80">Port / APFS disk pressure</div>
        </div>

        <div className="bg-slate-900 border border-emerald-900/30 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-300">Nominal Fleet Nodes</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-400">{nominalCount}</span>
            <span className="text-xs text-slate-400">Health checks green</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-400/80">Replicas synced, SLA 99.9%</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setOsFilter('all')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                osFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All OS
            </button>
            <button
              onClick={() => setOsFilter('linux')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                osFilter === 'linux' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>🐧</span> Linux
            </button>
            <button
              onClick={() => setOsFilter('windows')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                osFilter === 'windows' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>🪟</span> Windows
            </button>
            <button
              onClick={() => setOsFilter('darwin')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                osFilter === 'darwin' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>🍎</span> macOS
            </button>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setSeverityFilter('all')}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                severityFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Severities
            </button>
            <button
              onClick={() => setSeverityFilter('CRITICAL')}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                severityFilter === 'CRITICAL' ? 'bg-rose-900/60 text-rose-200 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Critical
            </button>
            <button
              onClick={() => setSeverityFilter('HIGH')}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                severityFilter === 'HIGH' ? 'bg-amber-900/60 text-amber-200 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              High
            </button>
            <button
              onClick={() => setSeverityFilter('NOMINAL')}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                severityFilter === 'NOMINAL' ? 'bg-emerald-900/60 text-emerald-200' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Nominal
            </button>
          </div>
        </div>

        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter hostname, IP, error..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Endpoints Table / Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Endpoint Identity</th>
                <th className="py-3 px-4">Platform & Kernel</th>
                <th className="py-3 px-4">Incident Status</th>
                <th className="py-3 px-4">CPU / RAM / Disk</th>
                <th className="py-3 px-4">Last Probe Scan</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-normal">
              {filteredEndpoints.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No endpoints match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredEndpoints.map((ep) => {
                  const isSelected = ep.id === selectedEndpointId;
                  const cpuPercent = ep.hardware.cpuUtilizationPercent;
                  const memPercent = ep.hardware.memory.usedPercent;
                  const diskPercent = ep.hardware.disks[0]?.usedPercent || 0;

                  return (
                    <tr
                      key={ep.id}
                      onClick={() => onSelectEndpoint(ep.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-indigo-950/40 border-l-4 border-l-indigo-500'
                          : 'hover:bg-slate-800/40'
                      }`}
                    >
                      {/* Identity */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {getPlatformIcon(ep.system.platform)}
                          <div>
                            <div className="font-bold text-white flex items-center gap-2 flex-wrap">
                              {ep.system.hostname}
                              {ep.reportedSeverity === 'CRITICAL' && (
                                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                              )}
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                                <BarChart3 className="w-2.5 h-2.5 text-indigo-400" />
                                {countScannedMetrics(ep).totalScanned} items
                              </span>
                            </div>
                            <div className="text-[11px] font-mono text-slate-400">
                              {ep.system.ipAddresses[0] || '127.0.0.1'} • {ep.system.architecture}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* OS & Kernel */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-200">{ep.system.osName}</div>
                        <div className="text-[11px] text-slate-400 font-mono truncate max-w-xs" title={ep.system.kernelVersion}>
                          Kernel: {ep.system.kernelVersion}
                        </div>
                      </td>

                      {/* Incident Status */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          {getSeverityBadge(ep.reportedSeverity)}
                          <div className="text-[11px] text-slate-400 truncate max-w-xs" title={ep.alertSummary}>
                            {ep.alertSummary || 'Operating normally'}
                          </div>
                        </div>
                      </td>

                      {/* Resources Utilization */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1.5 w-44">
                          {/* CPU */}
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-slate-400 flex items-center gap-1">
                              <Cpu className="w-3 h-3 text-slate-500" /> CPU
                            </span>
                            <span className={`font-mono ${cpuPercent > 85 ? 'text-rose-400 font-bold' : 'text-slate-300'}`}>
                              {cpuPercent}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                cpuPercent > 85 ? 'bg-rose-500' : cpuPercent > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(100, cpuPercent)}%` }}
                            ></div>
                          </div>

                          {/* RAM */}
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-slate-400 flex items-center gap-1">
                              <Activity className="w-3 h-3 text-slate-500" /> RAM
                            </span>
                            <span className={`font-mono ${memPercent > 90 ? 'text-rose-400 font-bold' : 'text-slate-300'}`}>
                              {memPercent}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                memPercent > 90 ? 'bg-rose-500' : memPercent > 75 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(100, memPercent)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>

                      {/* Last Probe Scan */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {new Date(ep.probeMetadata.scanTimestamp).toLocaleTimeString()}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Duration: {ep.probeMetadata.executionDurationMs}ms
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectEndpoint(ep.id);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            isSelected
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-800 hover:bg-slate-700 text-indigo-300'
                          }`}
                        >
                          Inspect Telemetry
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
