/**
 * Sentinel AI - Core System Types & Structured JSON Schemas
 * Standardized contracts for Endpoint Discovery, Diagnostic Research, and Reporting Agents.
 */

export type OperatingSystem = 'linux' | 'windows' | 'darwin';

export type IncidentSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NOMINAL';

export type LogLevel = 'CRITICAL' | 'ERROR' | 'WARNING' | 'INFO' | 'DEBUG';

export interface SystemInfo {
  hostname: string;
  platform: OperatingSystem;
  osName: string;
  osRelease: string;
  osVersion: string;
  architecture: string;
  kernelVersion: string;
  uptimeSeconds: number;
  bootTime: string;
  domainOrWorkgroup?: string;
  ipAddresses: string[];
  macAddresses: string[];
}

export interface MemoryMetrics {
  totalMb: number;
  usedMb: number;
  freeMb: number;
  cachedMb?: number;
  usedPercent: number;
}

export interface SwapMetrics {
  totalMb: number;
  usedMb: number;
  freeMb: number;
  usedPercent: number;
}

export interface DiskPartition {
  mountPoint: string;
  device: string;
  fsType: string;
  totalGb: number;
  usedGb: number;
  freeGb: number;
  usedPercent: number;
  inodesTotal?: number;
  inodesUsed?: number;
  inodesUsedPercent?: number;
}

export interface NetworkInterfaceMetric {
  interfaceName: string;
  bytesSent: number;
  bytesReceived: number;
  packetsSent: number;
  packetsReceived: number;
  errorsIn: number;
  errorsOut: number;
  dropsIn: number;
  dropsOut: number;
}

export interface HardwareMetrics {
  cpuUtilizationPercent: number;
  cpuCores: number;
  cpuModel: string;
  loadAverage?: [number, number, number]; // 1m, 5m, 15m
  memory: MemoryMetrics;
  swap?: SwapMetrics;
  disks: DiskPartition[];
  networkInterfaces?: NetworkInterfaceMetric[];
}

export interface ProcessItem {
  pid: number;
  ppid?: number;
  name: string;
  username: string;
  cpuPercent: number;
  memoryMb: number;
  status: 'running' | 'sleeping' | 'stopped' | 'zombie' | 'uninterruptible_disk_sleep';
  commandLine: string;
  startedAt?: string;
}

export interface SystemServiceItem {
  name: string;
  displayName?: string;
  status: 'running' | 'failed' | 'stopped' | 'starting' | 'unknown';
  startupType?: 'auto' | 'manual' | 'disabled' | 'delayed';
  subState?: string;
  description?: string;
}

export interface NetworkConnectionItem {
  protocol: 'tcp' | 'udp' | 'tcp6' | 'udp6';
  localAddress: string;
  localPort: number;
  foreignAddress: string;
  foreignPort: number;
  state: string; // LISTEN, ESTABLISHED, TIME_WAIT, CLOSE_WAIT, SYN_SENT
  pid?: number;
  processName?: string;
}

export interface LogTraceItem {
  timestamp: string;
  level: LogLevel;
  facility: string; // e.g. systemd, dmesg, EventLog:Application, launchd
  source: string;
  message: string;
  eventId?: string | number;
  stackTraceOrContext?: string;
}

export interface ProbeMetadata {
  probeVersion: string;
  scanTimestamp: string;
  executionDurationMs: number;
  readOnlyEnforced: boolean;
  collectedBy: string; // e.g. "Sentinel Probe (Python 3.11)"
  checksumSha256?: string;
}

export interface EndpointTelemetry {
  id: string;
  system: SystemInfo;
  hardware: HardwareMetrics;
  processes: ProcessItem[];
  services: SystemServiceItem[];
  networkConnections: NetworkConnectionItem[];
  logTraces: LogTraceItem[];
  probeMetadata: ProbeMetadata;
  reportedSeverity: IncidentSeverity;
  alertSummary?: string;
}

/**
 * Internal Runbook Definition
 * Cross-referenced by Diagnostic Research Agent to resolve incidents.
 */
export interface RunbookRemediationStep {
  stepNumber: number;
  title: string;
  targetOS: OperatingSystem | 'all';
  command: string;
  explanation: string;
  isDestructive: boolean;
  requiresElevation: boolean;
  expectedOutputNote?: string;
}

export interface InternalRunbook {
  id: string;
  title: string;
  category: 'Resource Exhaustion' | 'Service Failure' | 'Network & RPC' | 'Storage & FileSystem' | 'Kernel / Panic';
  targetOS: (OperatingSystem | 'all')[];
  symptomKeywords: string[];
  symptomDescription: string;
  diagnosticTriggers: {
    metricThresholds?: string[];
    logPatterns?: string[];
    serviceFailures?: string[];
  };
  knownRootCauses: string[];
  remediationSteps: RunbookRemediationStep[];
  verificationCommand: string;
  officialDocs: {
    title: string;
    url: string;
    publisher: string;
  }[];
}

/**
 * Diagnostic Analysis Schema
 * Produced by Diagnostic Research Agent
 */
export interface DiagnosticAnalysis {
  incidentId: string;
  endpointId: string;
  analyzedAt: string;
  targetOS: OperatingSystem;
  severity: IncidentSeverity;
  rootCause: string;
  affectedComponents: string[];
  evidencePoints: {
    source: 'metrics' | 'logs' | 'processes' | 'services' | 'network';
    finding: string;
    rawSnippet?: string;
  }[];
  matchedRunbooks: {
    runbookId: string;
    title: string;
    confidenceScore: number;
    matchRationale: string;
  }[];
  remediationCommands: RunbookRemediationStep[];
  confidenceScore: number; // 0.0 - 1.0
  reasoningNotes: string;
}

/**
 * Reporting Agent Schema
 * Formatted executive and technical diagnosis report
 */
export interface DiagnosticReport {
  reportId: string;
  incidentId: string;
  generatedAt: string;
  endpointSummary: {
    hostname: string;
    os: string;
    ip: string;
    environment: string;
  };
  executiveSummary: {
    whatHappened: string;
    whyItHappened: string;
    howToFix: string;
    businessImpact: string;
    confidenceLevel: 'High' | 'Medium' | 'Low';
  };
  technicalDeepDive: {
    rootCauseAnalysis: string;
    telemetryEvidence: string[];
    remediationWorkflow: {
      step: number;
      action: string;
      osSpecificCommand: string;
      isElevated: boolean;
      safetyGuarantee: string;
    }[];
    verificationSteps: string[];
    preventiveRecommendations: string[];
  };
  supportingDocumentation: {
    title: string;
    url: string;
    source: string;
  }[];
}

/**
 * Agent Architecture Lifecycle Status
 */
export interface AgentPipelineStatus {
  milestone: number;
  milestoneTitle: string;
  agents: {
    endpointDiscovery: {
      name: string;
      stage: 'Design & Specification' | 'Ready' | 'Active';
      status: 'nominal' | 'active' | 'pending';
      details: string;
    };
    diagnosticResearch: {
      name: string;
      stage: 'Milestone 2 - Integration' | 'Ready' | 'Pending';
      status: 'pending' | 'ready';
      details: string;
    };
    reporting: {
      name: string;
      stage: 'Milestone 3 - Automated Reports' | 'Ready' | 'Pending';
      status: 'pending' | 'ready';
      details: string;
    };
  };
}
