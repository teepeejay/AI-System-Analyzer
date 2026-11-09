import React, { useState } from 'react';
import { EndpointTelemetry, LogLevel } from '../types/sentinel.js';
import { countScannedMetrics } from '../utils/metricCounter.js';
import { ScannedMetricsSection } from './ScannedMetricsSection.js';
import { 
  Server, 
  Cpu, 
  HardDrive, 
  Activity, 
  Terminal, 
  FileText, 
  Copy, 
  Check, 
  AlertOctagon, 
  AlertTriangle, 
  CheckCircle, 
  Layers, 
  Network,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  BarChart3
} from 'lucide-react';

interface TelemetryInspectorProps {
  endpoint: EndpointTelemetry;
  onClose?: () => void;
  onOpenRunbooks?: () => void;
}

export const TelemetryInspector: React.FC<TelemetryInspectorProps> = ({
  endpoint,
  onClose,
  onOpenRunbooks,
}) => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'processes' | 'services' | 'logs' | 'inventory' | 'raw'>('metrics');
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [logFilter, setLogFilter] = useState<'all' | LogLevel>('all');
  const [processSearch, setProcessSearch] = useState('');

  const metricData = countScannedMetrics(endpoint);

  const handleCopyRaw = () => {
    navigator.clipboard.writeText(JSON.stringify(endpoint, null, 2));
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2000);
  };

  const filteredLogs = endpoint.logTraces.filter((log) => {
    if (logFilter === 'all') return true;
    return log.level === logFilter;
  });

  const filteredProcesses = endpoint.processes.filter((p) => {
    if (!processSearch.trim()) return true;
    const q = processSearch.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.commandLine.toLowerCase().includes(q) ||
      p.username.toLowerCase().includes(q) ||
      String(p.pid).includes(q)
    );
  });

  const getSeverityColor = (level: LogLevel) => {
    switch (level) {
      case 'CRITICAL':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      case 'ERROR':
        return 'text-rose-300 bg-rose-500/10 border-rose-500/20';
      case 'WARNING':
        return 'text-amber-300 bg-amber-500/10 border-amber-500/20';
      case 'INFO':
      default:
        return 'text-slate-300 bg-slate-800 border-slate-700';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl mt-4">
      {/* Top Banner with Machine Specs */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/40 border-b border-slate-800">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-indigo-600/20 border border-indigo-500/40 rounded-xl text-indigo-400">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-white font-mono">{endpoint.system.hostname}</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-indigo-300 border border-indigo-500/30">
                  {endpoint.system.platform.toUpperCase()} • {endpoint.system.architecture}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  endpoint.reportedSeverity === 'CRITICAL'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : endpoint.reportedSeverity === 'HIGH'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}>
                  {endpoint.reportedSeverity}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">{endpoint.system.osName}</p>
              <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1.5 flex-wrap font-mono">
                <span>Kernel: {endpoint.system.kernelVersion}</span>
                <span>•</span>
                <span>IP: {endpoint.system.ipAddresses.join(', ')}</span>
                <span>•</span>
                <span>Uptime: {Math.floor(endpoint.system.uptimeSeconds / 3600)}h {Math.floor((endpoint.system.uptimeSeconds % 3600) / 60)}m</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  <BarChart3 className="w-3 h-3 text-indigo-400" />
                  {metricData.totalScanned} Items Scanned
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            <button
              onClick={handleCopyRaw}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              {copiedRaw ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copiedRaw ? 'Copied JSON' : 'Copy Telemetry'}</span>
            </button>
          </div>
        </div>

        {/* Alert Context Bar */}
        {endpoint.alertSummary && (
          <div className="mt-3 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <ShieldAlert className={`w-4 h-4 ${endpoint.reportedSeverity === 'CRITICAL' ? 'text-rose-400' : 'text-amber-400'}`} />
              <span className="text-slate-300">
                <strong className="text-white">Active Alert: </strong> {endpoint.alertSummary}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Probe Scan: {new Date(endpoint.probeMetadata.scanTimestamp).toLocaleTimeString()}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-slate-950 px-4 border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('metrics')}
          className={`py-3 px-3 text-xs font-medium border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'metrics'
              ? 'border-indigo-500 text-white font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          Hardware & Resources
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`py-3 px-3 text-xs font-medium border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'inventory'
              ? 'border-indigo-500 text-white font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
          Scanned Inventory ({metricData.totalScanned})
        </button>

        <button
          onClick={() => setActiveTab('processes')}
          className={`py-3 px-3 text-xs font-medium border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'processes'
              ? 'border-indigo-500 text-white font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          Active Processes ({endpoint.processes.length})
        </button>

        <button
          onClick={() => setActiveTab('services')}
          className={`py-3 px-3 text-xs font-medium border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'services'
              ? 'border-indigo-500 text-white font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Services & Units ({endpoint.services.length})
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`py-3 px-3 text-xs font-medium border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'logs'
              ? 'border-indigo-500 text-white font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          Log Traces ({endpoint.logTraces.length})
        </button>

        <button
          onClick={() => setActiveTab('raw')}
          className={`py-3 px-3 text-xs font-medium border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'raw'
              ? 'border-indigo-500 text-white font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Structured JSON Schema
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-4 sm:p-5">
        {/* 1. Hardware & Resources */}
        {activeTab === 'metrics' && (
          <div className="space-y-6">
            {/* Scanned Metrics Quick Bar */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-white">
                    {metricData.totalScanned} Total Items Scanned
                  </span>
                  <span className="text-slate-400 text-[11px] ml-2">
                    ({metricData.categories.map(c => `${c.count} ${c.label}`).join(' • ')})
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('inventory')}
                className="px-2.5 py-1 text-[11px] font-semibold text-indigo-300 hover:text-white rounded bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 transition-colors flex items-center gap-1 shrink-0"
              >
                <span>View Complete Inventory</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* CPU Box */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 font-medium text-slate-300">
                    <Cpu className="w-4 h-4 text-indigo-400" /> CPU Utilization
                  </span>
                  <span className="font-mono">{endpoint.hardware.cpuCores} Cores</span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-bold font-mono text-white">
                    {endpoint.hardware.cpuUtilizationPercent}%
                  </span>
                </div>
                <div className="mt-2 w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      endpoint.hardware.cpuUtilizationPercent > 85 ? 'bg-rose-500' : 'bg-indigo-500'
                    }`}
                    style={{ width: `${Math.min(100, endpoint.hardware.cpuUtilizationPercent)}%` }}
                  ></div>
                </div>
                <div className="mt-3 text-[11px] text-slate-400">
                  Model: <span className="text-slate-300">{endpoint.hardware.cpuModel}</span>
                </div>
                {endpoint.hardware.loadAverage && (
                  <div className="mt-1 text-[11px] text-slate-400 font-mono">
                    Load Avg: [{endpoint.hardware.loadAverage.join(', ')}]
                  </div>
                )}
              </div>

              {/* Memory Box */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 font-medium text-slate-300">
                    <Activity className="w-4 h-4 text-emerald-400" /> Physical RAM
                  </span>
                  <span className="font-mono">
                    {Math.round(endpoint.hardware.memory.totalMb / 1024)} GB Total
                  </span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-bold font-mono text-white">
                    {endpoint.hardware.memory.usedPercent}%
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    ({endpoint.hardware.memory.usedMb} MB used)
                  </span>
                </div>
                <div className="mt-2 w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      endpoint.hardware.memory.usedPercent > 90 ? 'bg-rose-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, endpoint.hardware.memory.usedPercent)}%` }}
                  ></div>
                </div>
                <div className="mt-3 flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>Free: {endpoint.hardware.memory.freeMb} MB</span>
                  {endpoint.hardware.memory.cachedMb !== undefined && (
                    <span>Cached: {endpoint.hardware.memory.cachedMb} MB</span>
                  )}
                </div>
              </div>

              {/* Swap Box (if applicable) */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 font-medium text-slate-300">
                    <HardDrive className="w-4 h-4 text-amber-400" /> Virtual Memory / Swap
                  </span>
                  <span className="font-mono">
                    {endpoint.hardware.swap ? `${Math.round(endpoint.hardware.swap.totalMb / 1024)} GB` : 'N/A'}
                  </span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-bold font-mono text-white">
                    {endpoint.hardware.swap ? `${endpoint.hardware.swap.usedPercent}%` : 'Disabled'}
                  </span>
                  {endpoint.hardware.swap && (
                    <span className="text-xs text-slate-400 font-mono">
                      ({endpoint.hardware.swap.usedMb} MB used)
                    </span>
                  )}
                </div>
                <div className="mt-2 w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      (endpoint.hardware.swap?.usedPercent || 0) > 80 ? 'bg-rose-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(100, endpoint.hardware.swap?.usedPercent || 0)}%` }}
                  ></div>
                </div>
                <div className="mt-3 text-[11px] text-slate-400">
                  Swap Thrashing Indicator:{' '}
                  {(endpoint.hardware.swap?.usedPercent || 0) > 90 ? (
                    <span className="text-rose-400 font-bold">CRITICAL THRASHING</span>
                  ) : (
                    <span className="text-emerald-400">Nominal</span>
                  )}
                </div>
              </div>
            </div>

            {/* Storage Partitions */}
            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-indigo-400" /> Mounted Storage Volumes & Inodes
              </h4>
              <div className="space-y-3">
                {endpoint.hardware.disks.map((disk, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white">{disk.mountPoint}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                          {disk.device} ({disk.fsType})
                        </span>
                      </div>
                      <div className="font-mono text-slate-300">
                        {disk.usedGb} GB / {disk.totalGb} GB ({disk.usedPercent}%)
                      </div>
                    </div>

                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          disk.usedPercent > 90 ? 'bg-rose-500' : disk.usedPercent > 75 ? 'bg-amber-500' : 'bg-indigo-500'
                        }`}
                        style={{ width: `${Math.min(100, disk.usedPercent)}%` }}
                      ></div>
                    </div>

                    {disk.inodesTotal && (
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
                        <span>Inodes Allocated: {disk.inodesUsed?.toLocaleString()} / {disk.inodesTotal.toLocaleString()}</span>
                        <span className={disk.inodesUsedPercent && disk.inodesUsedPercent > 90 ? 'text-rose-400 font-bold' : ''}>
                          Inode Saturation: {disk.inodesUsedPercent}%
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. Processes */}
        {activeTab === 'processes' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-slate-400">
                Top processes by memory & CPU consumption (read-only snapshot)
              </span>
              <input
                type="text"
                placeholder="Search PID, name, user..."
                value={processSearch}
                onChange={(e) => setProcessSearch(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase font-mono border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">PID</th>
                    <th className="py-2.5 px-3">User</th>
                    <th className="py-2.5 px-3">Process Name</th>
                    <th className="py-2.5 px-3">CPU %</th>
                    <th className="py-2.5 px-3">RAM (MB)</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Command Line</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredProcesses.map((p) => (
                    <tr key={p.pid} className="hover:bg-slate-800/40">
                      <td className="py-2 px-3 text-indigo-400">{p.pid}</td>
                      <td className="py-2 px-3 text-slate-400">{p.username}</td>
                      <td className="py-2 px-3 font-bold text-white">{p.name}</td>
                      <td className={`py-2 px-3 ${p.cpuPercent > 50 ? 'text-rose-400 font-bold' : ''}`}>
                        {p.cpuPercent}%
                      </td>
                      <td className={`py-2 px-3 ${p.memoryMb > 2000 ? 'text-rose-400 font-bold' : ''}`}>
                        {p.memoryMb} MB
                      </td>
                      <td className="py-2 px-3">
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">
                          {p.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-400 text-[11px] truncate max-w-md font-sans" title={p.commandLine}>
                        {p.commandLine}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. Services */}
        {activeTab === 'services' && (
          <div className="space-y-3">
            <span className="text-xs text-slate-400">
              System unit services, daemons, and background supervisors
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {endpoint.services.map((svc, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-lg border ${
                    svc.status === 'failed'
                      ? 'bg-rose-950/20 border-rose-500/40'
                      : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sm text-white">{svc.name}</span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        svc.status === 'failed'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {svc.status}
                    </span>
                  </div>
                  {svc.displayName && (
                    <div className="text-xs text-slate-300 mt-1">{svc.displayName}</div>
                  )}
                  {svc.subState && (
                    <div className="text-[11px] font-mono text-slate-400 mt-1">
                      SubState: {svc.subState}
                    </div>
                  )}
                  {svc.description && (
                    <div className="text-[11px] text-slate-400 mt-1">{svc.description}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Logs */}
        {activeTab === 'logs' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <span className="text-xs text-slate-400">
                System journal & event log traces captured during discovery probe scan
              </span>
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                <button
                  onClick={() => setLogFilter('all')}
                  className={`px-2 py-1 rounded ${logFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                >
                  All Logs
                </button>
                <button
                  onClick={() => setLogFilter('CRITICAL')}
                  className={`px-2 py-1 rounded ${logFilter === 'CRITICAL' ? 'bg-rose-900/60 text-rose-200 font-bold' : 'text-slate-400'}`}
                >
                  Critical
                </button>
                <button
                  onClick={() => setLogFilter('ERROR')}
                  className={`px-2 py-1 rounded ${logFilter === 'ERROR' ? 'bg-rose-900/60 text-rose-200' : 'text-slate-400'}`}
                >
                  Errors
                </button>
                <button
                  onClick={() => setLogFilter('WARNING')}
                  className={`px-2 py-1 rounded ${logFilter === 'WARNING' ? 'bg-amber-900/60 text-amber-200' : 'text-slate-400'}`}
                >
                  Warnings
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {filteredLogs.map((log, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border font-mono text-xs ${getSeverityColor(log.level)}`}
                >
                  <div className="flex items-center justify-between text-[11px] pb-1 border-b border-slate-800/50 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{log.level}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-300">{log.source}</span>
                      {log.eventId && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-indigo-300">
                          Event {log.eventId}
                        </span>
                      )}
                    </div>
                    <span className="text-slate-400">{log.timestamp}</span>
                  </div>
                  <div className="text-slate-200 font-sans leading-relaxed">{log.message}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scanned Metrics Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            <ScannedMetricsSection endpoint={endpoint} variant="dense" defaultExpanded={true} />
          </div>
        )}

        {/* 5. Raw JSON Schema */}
        {activeTab === 'raw' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Pure Sentinel AI Telemetry Schema Specification (JSON)
              </span>
              <button
                onClick={handleCopyRaw}
                className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5"
              >
                {copiedRaw ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copiedRaw ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-indigo-300 overflow-x-auto max-h-[500px]">
              {JSON.stringify(endpoint, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Milestone 2 Diagnostic Agent Link Footer */}
      <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>
            Upcoming Milestone 2 will dispatch the <strong className="text-white">Diagnostic Research Agent</strong> across this telemetry.
          </span>
        </div>
        {onOpenRunbooks && (
          <button
            onClick={onOpenRunbooks}
            className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5 transition-colors font-medium"
          >
            <span>Inspect Matching Runbooks</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
