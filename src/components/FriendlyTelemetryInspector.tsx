import React, { useState } from 'react';
import { EndpointTelemetry } from '../types/sentinel.js';
import { countScannedMetrics } from '../utils/metricCounter.js';
import { ScannedMetricsSection } from './ScannedMetricsSection.js';
import { 
  Server, 
  AlertTriangle, 
  CheckCircle2, 
  AlertOctagon, 
  Terminal, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Cpu, 
  HardDrive, 
  Activity, 
  ArrowRight,
  ShieldCheck,
  Sparkles,
  BarChart3
} from 'lucide-react';

interface FriendlyTelemetryInspectorProps {
  endpoint: EndpointTelemetry;
  onOpenRunbooks?: () => void;
  onSwitchToAdvanced?: () => void;
}

export const FriendlyTelemetryInspector: React.FC<FriendlyTelemetryInspectorProps> = ({
  endpoint,
  onOpenRunbooks,
  onSwitchToAdvanced,
}) => {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);

  // Friendly plain-language interpretation based dynamically on real endpoint telemetry
  const getFriendlyDiagnosis = (ep: EndpointTelemetry) => {
    const failedServices = ep.services.filter((s) => s.status === 'failed');
    const isLinux = ep.system.platform === 'linux';
    const isWindows = ep.system.platform === 'windows';
    const isMac = ep.system.platform === 'darwin';

    if (ep.reportedSeverity === 'CRITICAL') {
      const fixCmd = failedServices.length > 0
        ? (isLinux ? `systemctl status ${failedServices[0].name} --no-pager && journalctl -u ${failedServices[0].name} -n 50 --no-pager` : isWindows ? `Get-Service -Name ${failedServices[0].name} | Select-Object -Property *` : `sudo launchctl list | grep -i ${failedServices[0].name}`)
        : (isLinux ? 'dmesg -T | grep -E -i "oom|error|critical|killed" | tail -n 30' : isWindows ? 'Get-EventLog -LogName System -EntryType Error -Newest 15' : 'sudo dmesg | tail -n 30');

      return {
        issueTitle: ep.alertSummary || 'Critical Incident Detected on System',
        issueDescription: failedServices.length > 0
          ? `Detected ${failedServices.length} failed service(s): ${failedServices.map((s) => s.name).join(', ')}. Immediate investigation is recommended.`
          : 'High system resource exhaustion or critical kernel/daemon errors detected in telemetry.',
        recommendedFixTitle: failedServices.length > 0 ? `Inspect logs for ${failedServices[0].name}` : 'Inspect system error log traces',
        safeCommand: fixCmd,
        commandReason: 'Safely queries system logs to isolate the error cause without changing system configurations.',
        impact: 'Service degradation or unexpected application termination.',
        targetOS: isLinux ? 'Linux' : isWindows ? 'Windows' : isMac ? 'macOS' : 'Host OS',
      };
    }
    if (ep.reportedSeverity === 'HIGH' || ep.reportedSeverity === 'MEDIUM') {
      const fixCmd = failedServices.length > 0
        ? (isLinux ? `systemctl status ${failedServices[0].name} --no-pager` : isWindows ? `Get-Service -Name ${failedServices[0].name}` : 'sudo launchctl list')
        : (isLinux ? 'uptime && free -h && df -h' : isWindows ? 'Get-Process | Sort-Object -Descending CPU | Select-Object -First 10' : 'top -l 1 | head -n 25');

      return {
        issueTitle: ep.alertSummary || 'Elevated Warnings or Resource Saturation',
        issueDescription: failedServices.length > 0
          ? `Non-critical service failures or abnormal units noted: ${failedServices.map((s) => s.name).join(', ')}.`
          : 'Resource pressure or background warning events detected by discovery probe.',
        recommendedFixTitle: 'Investigate system resource usage and service states',
        safeCommand: fixCmd,
        commandReason: 'Collects active health diagnostics to verify headroom without mutating system files.',
        impact: 'May cause elevated latency or background task delays.',
        targetOS: isLinux ? 'Linux' : isWindows ? 'Windows' : isMac ? 'macOS' : 'Host OS',
      };
    }
    return {
      issueTitle: 'System is running normally with no issues detected',
      issueDescription: `All monitored services, CPU cores (${ep.hardware.cpuCores}), RAM (${ep.hardware.memory.usedPercent}% used), and disk partitions on ${ep.system.hostname} are well within normal operational thresholds.`,
      recommendedFixTitle: 'No remediation needed',
      safeCommand: isLinux ? 'uptime && systemctl is-system-running' : isWindows ? 'Get-ComputerInfo -Property OsName, WindowsUptime' : 'uptime',
      commandReason: 'Continues automated routine background health monitoring.',
      impact: 'Zero customer or operational impact.',
      targetOS: isLinux ? 'Linux' : isWindows ? 'Windows' : isMac ? 'macOS' : 'Host OS',
    };
  };

  const diagnosis = getFriendlyDiagnosis(endpoint);

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(diagnosis.safeCommand);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const cpuPercent = endpoint.hardware.cpuUtilizationPercent;
  const memUsedGb = (endpoint.hardware.memory.usedMb / 1024).toFixed(1);
  const memTotalGb = Math.round(endpoint.hardware.memory.totalMb / 1024);
  const disk = endpoint.hardware.disks[0];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl mt-6">
      {/* Friendly Inspector Header */}
      <div className="p-5 sm:p-6 bg-slate-950 border-b border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs uppercase font-semibold tracking-wider text-slate-400">
              Inspection Report
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-indigo-400 font-medium">{endpoint.system.osName}</span>
            <span className="text-slate-600">•</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
              <BarChart3 className="w-3 h-3 text-indigo-400" />
              {countScannedMetrics(endpoint).totalScanned} Items Scanned
            </span>
          </div>
          <h3 className="text-xl font-bold text-white font-mono mt-0.5">{endpoint.system.hostname}</h3>
          <p className="text-xs text-slate-400 mt-1">
            IP: {endpoint.system.ipAddresses.join(', ')} • Uptime: {Math.floor(endpoint.system.uptimeSeconds / 3600)} hours
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onSwitchToAdvanced && (
            <button
              onClick={onSwitchToAdvanced}
              className="text-xs text-slate-400 hover:text-slate-200 underline decoration-slate-600 underline-offset-4 transition-colors"
            >
              Switch to Pro SRE View
            </button>
          )}
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* Identified Issue & AI Triage Box */}
        <div className={`p-5 rounded-2xl border ${
          endpoint.reportedSeverity === 'CRITICAL'
            ? 'bg-rose-950/20 border-rose-500/30'
            : endpoint.reportedSeverity === 'HIGH' || endpoint.reportedSeverity === 'MEDIUM'
            ? 'bg-amber-950/20 border-amber-500/30'
            : 'bg-emerald-950/20 border-emerald-500/30'
        }`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 shrink-0 mt-0.5">
                {endpoint.reportedSeverity === 'CRITICAL' ? (
                  <AlertOctagon className="w-5 h-5 text-rose-400" />
                ) : endpoint.reportedSeverity === 'HIGH' || endpoint.reportedSeverity === 'MEDIUM' ? (
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                )}
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Identified Problem
                </span>
                <h4 className="text-base sm:text-lg font-bold text-white mt-0.5">
                  {diagnosis.issueTitle}
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                  {diagnosis.issueDescription}
                </p>
                {diagnosis.impact && (
                  <div className="mt-2 text-xs text-rose-300/90 font-medium">
                    ⚠️ Impact: {diagnosis.impact}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recommended Safe Fix */}
          {endpoint.reportedSeverity !== 'NOMINAL' && (
            <div className="mt-5 pt-4 border-t border-slate-800/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Recommended Safe Fix: {diagnosis.recommendedFixTitle}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  Tailored for {diagnosis.targetOS}
                </span>
              </div>

              <div className="relative group">
                <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto whitespace-pre-wrap leading-relaxed pr-24">
                  {diagnosis.safeCommand}
                </pre>
                <button
                  onClick={handleCopyCommand}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{copiedCmd ? 'Copied' : 'Copy Fix'}</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-400 mt-2">
                💡 <strong className="text-slate-300">Why this helps:</strong> {diagnosis.commandReason}
              </p>
            </div>
          )}
        </div>

        {/* 3 Clear Vital Signs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* CPU Card */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-medium text-slate-300">
                <Cpu className="w-4 h-4 text-indigo-400" /> Processor (CPU)
              </span>
              <span className="font-mono">{endpoint.hardware.cpuCores} Cores</span>
            </div>
            <div className="text-2xl font-bold font-mono text-white">
              {cpuPercent}%
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full ${cpuPercent > 80 ? 'bg-rose-500' : 'bg-indigo-500'}`}
                style={{ width: `${Math.min(100, cpuPercent)}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-400">
              {cpuPercent > 80 ? 'High CPU workload' : 'Normal processing activity'}
            </p>
          </div>

          {/* Memory Card */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-medium text-slate-300">
                <Activity className="w-4 h-4 text-emerald-400" /> Memory (RAM)
              </span>
              <span className="font-mono">{endpoint.hardware.memory.usedPercent}% used</span>
            </div>
            <div className="text-2xl font-bold font-mono text-white">
              {memUsedGb} <span className="text-sm font-normal text-slate-400">/ {memTotalGb} GB</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  endpoint.hardware.memory.usedPercent > 85 ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, endpoint.hardware.memory.usedPercent)}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-400">
              {endpoint.hardware.memory.usedPercent > 85 ? 'System experiencing memory pressure' : 'Ample memory available'}
            </p>
          </div>

          {/* Storage Card */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-medium text-slate-300">
                <HardDrive className="w-4 h-4 text-amber-400" /> Hard Drive Space
              </span>
              <span className="font-mono">{disk?.freeGb} GB Free</span>
            </div>
            <div className="text-2xl font-bold font-mono text-white">
              {disk?.usedPercent}% <span className="text-sm font-normal text-slate-400">Full</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  (disk?.usedPercent || 0) > 90 ? 'bg-amber-500' : 'bg-indigo-500'
                }`}
                style={{ width: `${Math.min(100, disk?.usedPercent || 0)}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-400">
              Drive mount: <code className="text-slate-300">{disk?.mountPoint}</code>
            </p>
          </div>
        </div>

        {/* Dedicated Scanned Metrics & Telemetry Inventory Section */}
        <ScannedMetricsSection endpoint={endpoint} variant="friendly" defaultExpanded={true} />

        {/* Collapsible Technical Details (Uncluttered by default!) */}
        <div className="border border-slate-800 rounded-xl overflow-hidden">
          <button
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="w-full p-4 bg-slate-950 hover:bg-slate-900/80 flex items-center justify-between text-xs text-slate-300 transition-colors"
          >
            <span className="font-semibold flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-400" />
              Detailed Technical Data (Processes & System Error Logs)
            </span>
            <div className="flex items-center gap-1.5 text-slate-400">
              <span>{showTechnicalDetails ? 'Hide Details' : 'Show Details'}</span>
              {showTechnicalDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {showTechnicalDetails && (
            <div className="p-4 bg-slate-950/60 border-t border-slate-800 space-y-4 text-xs">
              {/* Recent Error Log Snippets */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Recent Error Log Traces
                </span>
                <div className="space-y-1.5 font-mono">
                  {endpoint.logTraces.slice(0, 3).map((log, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-[11px]">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                        <span className="font-bold text-rose-400">{log.level}</span>
                        <span>{log.source}</span>
                      </div>
                      <div className="text-slate-200">{log.message}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Processes */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Top Running Processes
                </span>
                <div className="rounded-lg border border-slate-800 overflow-hidden">
                  <table className="w-full text-left font-mono text-[11px]">
                    <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-2">Name</th>
                        <th className="p-2">PID</th>
                        <th className="p-2">CPU</th>
                        <th className="p-2">Memory</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {endpoint.processes.slice(0, 4).map((p) => (
                        <tr key={p.pid}>
                          <td className="p-2 font-bold text-white">{p.name}</td>
                          <td className="p-2 text-slate-400">{p.pid}</td>
                          <td className="p-2">{p.cpuPercent}%</td>
                          <td className="p-2">{p.memoryMb} MB</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Diagnostic research is continuously cross-referenced with internal IT runbooks.</span>
        </div>
        {onOpenRunbooks && (
          <button
            onClick={onOpenRunbooks}
            className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition-colors"
          >
            <span>View IT Runbooks</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
