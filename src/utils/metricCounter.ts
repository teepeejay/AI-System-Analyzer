import { EndpointTelemetry } from '../types/sentinel.js';

export interface ScannedItemDetail {
  id: string;
  category: string;
  name: string;
  value: string | number;
  description?: string;
}

export interface ScannedCategorySummary {
  id: string;
  label: string;
  count: number;
  iconName: 'Server' | 'Cpu' | 'Activity' | 'Layers' | 'Network' | 'FileText' | 'ShieldCheck';
  color: string;
  badgeColor: string;
  description: string;
  items: ScannedItemDetail[];
}

export interface MetricCountResult {
  totalScanned: number;
  categories: ScannedCategorySummary[];
}

/**
 * Calculates the exact count of all individual metrics, properties, processes,
 * services, network sockets, log traces, and metadata scanned on a target endpoint.
 * Every individual data point collected counts as 1.
 */
export function countScannedMetrics(endpoint: EndpointTelemetry): MetricCountResult {
  const categories: ScannedCategorySummary[] = [];

  // 1. System Identity & OS Specifications
  const systemItems: ScannedItemDetail[] = [
    {
      id: 'sys-hostname',
      category: 'System Identity',
      name: 'Hostname Identifier',
      value: endpoint.system.hostname,
      description: 'Host network node name',
    },
    {
      id: 'sys-platform',
      category: 'System Identity',
      name: 'Target OS Platform',
      value: endpoint.system.platform,
      description: 'Underlying operating system family',
    },
    {
      id: 'sys-os-name',
      category: 'System Identity',
      name: 'OS Distribution / Edition',
      value: endpoint.system.osName,
      description: 'Full distribution and release name',
    },
    {
      id: 'sys-os-release',
      category: 'System Identity',
      name: 'OS Release Version',
      value: endpoint.system.osRelease,
      description: 'Vendor release designation',
    },
    {
      id: 'sys-os-version',
      category: 'System Identity',
      name: 'OS Build / Subversion',
      value: endpoint.system.osVersion,
      description: 'Detailed operating system build signature',
    },
    {
      id: 'sys-arch',
      category: 'System Identity',
      name: 'CPU Architecture',
      value: endpoint.system.architecture,
      description: 'Instruction set architecture (e.g. x86_64, arm64)',
    },
    {
      id: 'sys-kernel',
      category: 'System Identity',
      name: 'Kernel Version',
      value: endpoint.system.kernelVersion,
      description: 'Active operating system kernel',
    },
    {
      id: 'sys-uptime',
      category: 'System Identity',
      name: 'System Uptime',
      value: `${Math.floor(endpoint.system.uptimeSeconds / 3600)}h ${Math.floor((endpoint.system.uptimeSeconds % 3600) / 60)}m (${endpoint.system.uptimeSeconds}s)`,
      description: 'Continuous runtime duration since last boot',
    },
    {
      id: 'sys-boot-time',
      category: 'System Identity',
      name: 'System Boot Timestamp',
      value: endpoint.system.bootTime,
      description: 'Point in time when system was initialized',
    },
  ];

  if (endpoint.system.domainOrWorkgroup) {
    systemItems.push({
      id: 'sys-domain',
      category: 'System Identity',
      name: 'Domain or Workgroup',
      value: endpoint.system.domainOrWorkgroup,
      description: 'Active Directory domain or workgroup membership',
    });
  }

  // Count each IP address scanned as 1
  endpoint.system.ipAddresses.forEach((ip, idx) => {
    systemItems.push({
      id: `sys-ip-${idx}`,
      category: 'System Identity',
      name: `Network IPv4/IPv6 Address #${idx + 1}`,
      value: ip,
      description: 'Active network interface binding',
    });
  });

  // Count each MAC address scanned as 1
  endpoint.system.macAddresses.forEach((mac, idx) => {
    systemItems.push({
      id: `sys-mac-${idx}`,
      category: 'System Identity',
      name: `Hardware MAC Address #${idx + 1}`,
      value: mac,
      description: 'Physical network adapter identifier',
    });
  });

  categories.push({
    id: 'system',
    label: 'System & OS Identity',
    count: systemItems.length,
    iconName: 'Server',
    color: 'text-indigo-400',
    badgeColor: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
    description: 'Hardware identification, operating system builds, kernel versions, and network addresses',
    items: systemItems,
  });

  // 2. Hardware Resources & Telemetry Metrics
  const hardwareItems: ScannedItemDetail[] = [
    {
      id: 'hw-cpu-util',
      category: 'Hardware Metrics',
      name: 'CPU Total Utilization',
      value: `${endpoint.hardware.cpuUtilizationPercent}%`,
      description: 'Current combined processor workload percentage',
    },
    {
      id: 'hw-cpu-cores',
      category: 'Hardware Metrics',
      name: 'CPU Physical / Logical Cores',
      value: `${endpoint.hardware.cpuCores} Cores`,
      description: 'Number of active CPU processing execution cores',
    },
    {
      id: 'hw-cpu-model',
      category: 'Hardware Metrics',
      name: 'CPU Model Name',
      value: endpoint.hardware.cpuModel,
      description: 'Detected processor model string',
    },
  ];

  if (endpoint.hardware.loadAverage && endpoint.hardware.loadAverage.length > 0) {
    const labels = ['1-Minute Load Average', '5-Minute Load Average', '15-Minute Load Average'];
    endpoint.hardware.loadAverage.forEach((load, idx) => {
      hardwareItems.push({
        id: `hw-load-${idx}`,
        category: 'Hardware Metrics',
        name: labels[idx] || `Load Average #${idx + 1}`,
        value: load,
        description: 'Exponential decay running queue length',
      });
    });
  }

  // Memory metrics (each metric counts as 1)
  hardwareItems.push(
    {
      id: 'hw-mem-total',
      category: 'Hardware Metrics',
      name: 'Physical RAM Total Capacity',
      value: `${endpoint.hardware.memory.totalMb} MB (${(endpoint.hardware.memory.totalMb / 1024).toFixed(1)} GB)`,
      description: 'Total installed system physical memory',
    },
    {
      id: 'hw-mem-used',
      category: 'Hardware Metrics',
      name: 'Physical RAM Used Space',
      value: `${endpoint.hardware.memory.usedMb} MB (${(endpoint.hardware.memory.usedMb / 1024).toFixed(1)} GB)`,
      description: 'Memory allocated to applications and system caches',
    },
    {
      id: 'hw-mem-free',
      category: 'Hardware Metrics',
      name: 'Physical RAM Free Space',
      value: `${endpoint.hardware.memory.freeMb} MB`,
      description: 'Unallocated immediately available memory',
    },
    {
      id: 'hw-mem-pct',
      category: 'Hardware Metrics',
      name: 'Physical RAM Utilization Rate',
      value: `${endpoint.hardware.memory.usedPercent}%`,
      description: 'Percentage of total memory currently occupied',
    }
  );

  if (endpoint.hardware.memory.cachedMb !== undefined) {
    hardwareItems.push({
      id: 'hw-mem-cached',
      category: 'Hardware Metrics',
      name: 'RAM Cached / Buffer Memory',
      value: `${endpoint.hardware.memory.cachedMb} MB`,
      description: 'Page cache and filesystem buffers reclaimable by kernel',
    });
  }

  // Swap / Virtual memory metrics (each metric counts as 1)
  if (endpoint.hardware.swap) {
    hardwareItems.push(
      {
        id: 'hw-swap-total',
        category: 'Hardware Metrics',
        name: 'Swap Virtual Memory Total',
        value: `${endpoint.hardware.swap.totalMb} MB`,
        description: 'Total disk-backed paging file / swap partition capacity',
      },
      {
        id: 'hw-swap-used',
        category: 'Hardware Metrics',
        name: 'Swap Virtual Memory Used',
        value: `${endpoint.hardware.swap.usedMb} MB`,
        description: 'Paged anonymous memory stored on disk',
      },
      {
        id: 'hw-swap-free',
        category: 'Hardware Metrics',
        name: 'Swap Virtual Memory Free',
        value: `${endpoint.hardware.swap.freeMb} MB`,
        description: 'Remaining available swap headroom',
      },
      {
        id: 'hw-swap-pct',
        category: 'Hardware Metrics',
        name: 'Swap Utilization Rate',
        value: `${endpoint.hardware.swap.usedPercent}%`,
        description: 'Paging space saturation percentage',
      }
    );
  }

  // Disks and Partitions (each partition property counts as 1)
  endpoint.hardware.disks.forEach((disk, dIdx) => {
    hardwareItems.push(
      {
        id: `hw-disk-${dIdx}-mount`,
        category: 'Hardware Metrics',
        name: `Disk #${dIdx + 1} Mount Point`,
        value: disk.mountPoint,
        description: 'Filesystem directory mounting path',
      },
      {
        id: `hw-disk-${dIdx}-dev`,
        category: 'Hardware Metrics',
        name: `Disk #${dIdx + 1} Block Device`,
        value: disk.device,
        description: 'Underlying storage drive partition identifier',
      },
      {
        id: `hw-disk-${dIdx}-fstype`,
        category: 'Hardware Metrics',
        name: `Disk #${dIdx + 1} Filesystem Type`,
        value: disk.fsType,
        description: 'Filesystem format (e.g. ext4, NTFS, APFS, XFS)',
      },
      {
        id: `hw-disk-${dIdx}-total`,
        category: 'Hardware Metrics',
        name: `Disk #${dIdx + 1} Total Capacity`,
        value: `${disk.totalGb} GB`,
        description: 'Volume total addressable storage',
      },
      {
        id: `hw-disk-${dIdx}-used`,
        category: 'Hardware Metrics',
        name: `Disk #${dIdx + 1} Used Storage`,
        value: `${disk.usedGb} GB`,
        description: 'Storage space currently consumed',
      },
      {
        id: `hw-disk-${dIdx}-free`,
        category: 'Hardware Metrics',
        name: `Disk #${dIdx + 1} Free Storage`,
        value: `${disk.freeGb} GB`,
        description: 'Remaining unallocated storage headroom',
      },
      {
        id: `hw-disk-${dIdx}-pct`,
        category: 'Hardware Metrics',
        name: `Disk #${dIdx + 1} Space Utilization`,
        value: `${disk.usedPercent}%`,
        description: 'Drive capacity usage percentage',
      }
    );

    if (disk.inodesTotal !== undefined) {
      hardwareItems.push(
        {
          id: `hw-disk-${dIdx}-inodes-total`,
          category: 'Hardware Metrics',
          name: `Disk #${dIdx + 1} Total Inodes`,
          value: disk.inodesTotal.toLocaleString(),
          description: 'Maximum index nodes allocated on volume',
        },
        {
          id: `hw-disk-${dIdx}-inodes-used`,
          category: 'Hardware Metrics',
          name: `Disk #${dIdx + 1} Allocated Inodes`,
          value: (disk.inodesUsed || 0).toLocaleString(),
          description: 'Inodes currently occupied by files and directories',
        },
        {
          id: `hw-disk-${dIdx}-inodes-pct`,
          category: 'Hardware Metrics',
          name: `Disk #${dIdx + 1} Inode Saturation Rate`,
          value: `${disk.inodesUsedPercent || 0}%`,
          description: 'Inode exhaustion metric',
        }
      );
    }
  });

  // Network Interface Metrics (if available, count each scanned interface counter as 1)
  if (endpoint.hardware.networkInterfaces) {
    endpoint.hardware.networkInterfaces.forEach((netif, nIdx) => {
      hardwareItems.push(
        {
          id: `hw-net-${nIdx}-ifname`,
          category: 'Hardware Metrics',
          name: `Network Adapter #${nIdx + 1} Interface`,
          value: netif.interfaceName,
          description: 'Interface controller name',
        },
        {
          id: `hw-net-${nIdx}-bsent`,
          category: 'Hardware Metrics',
          name: `Network #${nIdx + 1} Bytes Transmitted`,
          value: netif.bytesSent.toLocaleString(),
          description: 'Outbound network throughput volume',
        },
        {
          id: `hw-net-${nIdx}-brecv`,
          category: 'Hardware Metrics',
          name: `Network #${nIdx + 1} Bytes Received`,
          value: netif.bytesReceived.toLocaleString(),
          description: 'Inbound network throughput volume',
        },
        {
          id: `hw-net-${nIdx}-psent`,
          category: 'Hardware Metrics',
          name: `Network #${nIdx + 1} Packets Transmitted`,
          value: netif.packetsSent.toLocaleString(),
          description: 'Total egress packet count',
        },
        {
          id: `hw-net-${nIdx}-precv`,
          category: 'Hardware Metrics',
          name: `Network #${nIdx + 1} Packets Received`,
          value: netif.packetsReceived.toLocaleString(),
          description: 'Total ingress packet count',
        },
        {
          id: `hw-net-${nIdx}-errin`,
          category: 'Hardware Metrics',
          name: `Network #${nIdx + 1} Inbound Packet Errors`,
          value: netif.errorsIn,
          description: 'Corrupted or dropped incoming frame count',
        },
        {
          id: `hw-net-${nIdx}-errout`,
          category: 'Hardware Metrics',
          name: `Network #${nIdx + 1} Outbound Packet Errors`,
          value: netif.errorsOut,
          description: 'Failed transmission attempts',
        },
        {
          id: `hw-net-${nIdx}-dropin`,
          category: 'Hardware Metrics',
          name: `Network #${nIdx + 1} Inbound Drops`,
          value: netif.dropsIn,
          description: 'Packets dropped by ring buffer or firewall',
        },
        {
          id: `hw-net-${nIdx}-dropout`,
          category: 'Hardware Metrics',
          name: `Network #${nIdx + 1} Outbound Drops`,
          value: netif.dropsOut,
          description: 'Packets discarded before wire transmission',
        }
      );
    });
  }

  categories.push({
    id: 'hardware',
    label: 'Hardware & Resource Metrics',
    count: hardwareItems.length,
    iconName: 'Cpu',
    color: 'text-amber-400',
    badgeColor: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    description: 'CPU saturation, memory partitions, virtual swap, mounted storage volumes, and network adapters',
    items: hardwareItems,
  });

  // 3. Active Processes (each audited process counts as 1)
  const processItems: ScannedItemDetail[] = endpoint.processes.map((p, idx) => ({
    id: `proc-${idx}-${p.pid}`,
    category: 'Active Processes',
    name: `PID ${p.pid}: ${p.name}`,
    value: `User: ${p.username} | CPU: ${p.cpuPercent}% | RAM: ${p.memoryMb} MB | Status: ${p.status}`,
    description: p.commandLine,
  }));

  categories.push({
    id: 'processes',
    label: 'Audited Active Processes',
    count: processItems.length,
    iconName: 'Activity',
    color: 'text-emerald-400',
    badgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    description: 'Process tree snapshot with resource allocations, user owners, status flags, and sanitized commands',
    items: processItems,
  });

  // 4. System Services & Units (each service unit counts as 1)
  const serviceItems: ScannedItemDetail[] = endpoint.services.map((svc, idx) => ({
    id: `svc-${idx}-${svc.name}`,
    category: 'System Services',
    name: svc.name,
    value: `State: ${svc.status.toUpperCase()}${svc.subState ? ` (${svc.subState})` : ''}`,
    description: svc.displayName || svc.description || 'System service daemon',
  }));

  categories.push({
    id: 'services',
    label: 'Services & Units Evaluated',
    count: serviceItems.length,
    iconName: 'Layers',
    color: 'text-sky-400',
    badgeColor: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
    description: 'systemd units, Windows services, or macOS launchd daemons checked for active execution or failures',
    items: serviceItems,
  });

  // 5. Network Sockets & Active Connections (each connection counts as 1)
  const networkItems: ScannedItemDetail[] = endpoint.networkConnections.map((conn, idx) => ({
    id: `conn-${idx}-${conn.localPort}`,
    category: 'Network Connections',
    name: `${conn.protocol.toUpperCase()} Socket ${conn.localAddress}:${conn.localPort}`,
    value: `Peer: ${conn.foreignAddress}:${conn.foreignPort} | State: ${conn.state}${conn.processName ? ` (${conn.processName})` : ''}`,
    description: `Bound network socket connection in ${conn.state} state`,
  }));

  categories.push({
    id: 'network',
    label: 'Network Sockets Monitored',
    count: networkItems.length,
    iconName: 'Network',
    color: 'text-cyan-400',
    badgeColor: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
    description: 'Active listening network endpoints, established sessions, and dynamic ephemeral ports',
    items: networkItems,
  });

  // 6. Log Traces & Journal Events (each log entry counts as 1)
  const logItems: ScannedItemDetail[] = endpoint.logTraces.map((log, idx) => ({
    id: `log-${idx}`,
    category: 'Log Traces',
    name: `[${log.level}] ${log.source}${log.eventId ? ` (Event #${log.eventId})` : ''}`,
    value: log.message,
    description: `Facility: ${log.facility} @ ${log.timestamp}`,
  }));

  categories.push({
    id: 'logs',
    label: 'Log Traces & Events Captured',
    count: logItems.length,
    iconName: 'FileText',
    color: 'text-purple-400',
    badgeColor: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
    description: 'Journald, dmesg, Windows Event Logs, or kernel panic traces analyzed during scan',
    items: logItems,
  });

  // 7. Probe Verification & Security Audit Metadata (each field counts as 1)
  const probeItems: ScannedItemDetail[] = [
    {
      id: 'meta-version',
      category: 'Probe Metadata',
      name: 'Sentinel Probe Version',
      value: endpoint.probeMetadata.probeVersion,
      description: 'Discovery scanner binary release version',
    },
    {
      id: 'meta-timestamp',
      category: 'Probe Metadata',
      name: 'Scan Execution Timestamp',
      value: endpoint.probeMetadata.scanTimestamp,
      description: 'Point-in-time when telemetry was captured',
    },
    {
      id: 'meta-duration',
      category: 'Probe Metadata',
      name: 'Scan Execution Duration',
      value: `${endpoint.probeMetadata.executionDurationMs} ms`,
      description: 'Total latency to inspect all system subcomponents',
    },
    {
      id: 'meta-readonly',
      category: 'Probe Metadata',
      name: 'Read-Only Mode Enforcement',
      value: endpoint.probeMetadata.readOnlyEnforced ? 'STRICTLY ENFORCED (Passive)' : 'Warning: Non-standard',
      description: 'Guarantee that probe executed zero mutating commands',
    },
    {
      id: 'meta-collector',
      category: 'Probe Metadata',
      name: 'Collector Runtime Engine',
      value: endpoint.probeMetadata.collectedBy,
      description: 'Local host runtime environment executing probe',
    },
    {
      id: 'meta-severity',
      category: 'Probe Metadata',
      name: 'Incident Severity Assessment',
      value: endpoint.reportedSeverity,
      description: 'Deterministic severity classification',
    },
  ];

  if (endpoint.probeMetadata.checksumSha256) {
    probeItems.push({
      id: 'meta-sha256',
      category: 'Probe Metadata',
      name: 'Payload SHA-256 Checksum',
      value: endpoint.probeMetadata.checksumSha256,
      description: 'Cryptographic integrity digest of the telemetry payload',
    });
  }

  if (endpoint.alertSummary) {
    probeItems.push({
      id: 'meta-alert',
      category: 'Probe Metadata',
      name: 'Triage Summary Headline',
      value: endpoint.alertSummary,
      description: 'High-level operational symptom diagnosis',
    });
  }

  categories.push({
    id: 'metadata',
    label: 'Probe Integrity & Scan Metadata',
    count: probeItems.length,
    iconName: 'ShieldCheck',
    color: 'text-emerald-400',
    badgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    description: 'Execution duration, cryptographic checksums, read-only audit verification, and scanner specs',
    items: probeItems,
  });

  // Calculate total: each individual thing scanned counts as 1
  const totalScanned = categories.reduce((sum, cat) => sum + cat.count, 0);

  return {
    totalScanned,
    categories,
  };
}
