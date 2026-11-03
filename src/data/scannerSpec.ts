/**
 * Sentinel AI - Python Endpoint Scanner Architectural Specification
 */

export const SCANNER_ARCHITECTURE_SPEC = {
  version: '1.4.0',
  title: 'Sentinel AI Cross-Platform Endpoint Discovery Probe Architecture',
  targetOperatingSystems: [
    {
      os: 'Linux (Ubuntu, Debian, RHEL, Rocky, Alpine)',
      primarySources: ['/proc/meminfo', '/proc/uptime', '/proc/loadavg', 'systemd (systemctl)', 'journalctl -p 3', 'ip route / ss'],
      privilegeRequirement: 'Unprivileged user (standard metrics) or root/sudo (for detailed dmesg/systemd service unit internals)',
      packaging: 'Single self-contained Python script or PyInstaller Linux ELF / zipapp (.pyz)',
    },
    {
      os: 'Microsoft Windows (Windows 10/11, Windows Server 2016-2025)',
      primarySources: ['WMI / CIM via PowerShell', 'Get-Service', 'Get-WinEvent / wevtutil (Application & System logs)', 'netstat / Get-NetTCPConnection'],
      privilegeRequirement: 'Standard User (General metrics) or Administrator (EventLog reading)',
      packaging: 'Single script or PyInstaller one-file .exe signed with corporate code-signing certificate',
    },
    {
      os: 'Apple macOS (macOS 12 Monterey through macOS 15 Sequoia)',
      primarySources: ['sysctl (hw.ncpu, hw.memsize)', 'vm_stat', 'diskutil apfs', 'launchctl list', 'log show --predicate'],
      privilegeRequirement: 'Standard user / admin terminal or MDM payload (Jamf, Kandji, Intune)',
      packaging: 'Signed and notarized universal binary or standalone python3 script executed via MDM',
    },
  ],
  securityGuarantees: [
    {
      principle: 'Strictly Read-Only Operations',
      detail: 'The scanner code contains zero state-mutating system calls. It never runs DROP, DELETE, KILL, STOP, or registry modification operations.',
    },
    {
      principle: 'Data Sanitization & Credential Masking',
      detail: 'Command line process arguments are passed through regex sanitizers before serialization, masking --password, Bearer tokens, and secrets.',
    },
    {
      principle: 'Zero Third-Party Pip Dependency Footprint',
      detail: 'Probe core relies exclusively on the Python 3 standard library (platform, socket, os, sys, shutil, subprocess, json) for high compatibility without needing pip install in restricted environments.',
    },
    {
      principle: 'Bounded Execution & Timeouts',
      detail: 'All subprocess command inquiries enforce a hard 5-second timeout to prevent deadlocks from hanging network mounts or locked services.',
    },
  ],
  pipelineWorkflow: [
    {
      step: 1,
      name: 'Local Probe Execution',
      description: 'The endpoint runs `sentinel_probe.py` via cron, scheduled task, MDM, or manual incident trigger.',
    },
    {
      step: 2,
      name: 'Schema Serialization',
      description: 'System state is gathered into the standardized `EndpointTelemetry` JSON schema with cryptographic checksum.',
    },
    {
      step: 3,
      name: 'Secure Ingestion',
      description: 'Payload is uploaded via TLS to the Sentinel AI backend `/api/telemetry/ingest` or loaded directly into the SRE console.',
    },
    {
      step: 4,
      name: 'Agent Processing Queue',
      description: 'Telemetry feeds the Diagnostic Research Agent (Milestone 2) and subsequent Reporting Agent (Milestone 3).',
    },
  ],
};
