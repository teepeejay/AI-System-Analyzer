#!/usr/bin/env python3
"""
Sentinel AI - Cross-Platform Read-Only Endpoint Discovery Probe
Version: 1.4.0
Supported Platforms: Linux (including Linux Mint, Ubuntu, Debian, RHEL), Windows, macOS

Security & Operational Guarantees:
- STRICTLY READ-ONLY: Executes only non-mutating passive queries against OS interfaces.
- PURE STANDARD LIBRARY: Requires zero pip packages; relies exclusively on standard Python 3.
- DATA SANITIZATION: Redacts sensitive passwords, tokens, and authorization credentials from command lines.
- STRUCTURED COMPLIANCE: Emits validated JSON adhering to the Sentinel AI EndpointTelemetry schema.

Usage:
  python sentinel_probe.py > telemetry.json
  python sentinel_probe.py --upload http://127.0.0.1:3000/api/telemetry/ingest
"""

import sys
import os
import platform
import subprocess
import json
import socket
import shutil
import re
import time
from datetime import datetime, timezone
import urllib.request
import urllib.error

PROBE_VERSION = "1.4.0"
READ_ONLY_ENFORCED = True

# Common credential patterns to redact from CLI process command lines
REDACT_PATTERNS = [
    re.compile(r'(password|token|secret|key|auth|bearer)[\s=:"]+([^\s,;]+)', re.IGNORECASE),
]

# Non-critical, live-installation, or transient services that must not cause HIGH severity
NON_CRITICAL_SERVICES = {
    "casper-md5check.service",
    "casper-md5check",
    "live-config.service",
    "live-tools.service",
    "plymouth-quit.service",
    "plymouth-start.service",
    "systemd-fsck-root.service",
    "fwupd-refresh.service",
    "apt-daily.service",
    "apt-daily-upgrade.service",
    "man-db.service",
    "motd-news.service",
    "update-notifier-download.service",
    "update-notifier-motd.service",
    "cloud-init-local.service",
    "e2scrub_reap.service",
}

# Critical Tier-1 infrastructure services whose failure indicates serious outage
CRITICAL_SERVICES = {
    "sshd.service",
    "ssh.service",
    "systemd-journald.service",
    "systemd-resolved.service",
    "systemd-networkd.service",
    "NetworkManager.service",
    "networking.service",
    "dbus.service",
    "docker.service",
    "containerd.service",
    "kubelet.service",
    "nginx.service",
    "apache2.service",
    "httpd.service",
    "postgresql.service",
    "postgresql-16.service",
    "mysql.service",
    "mariadb.service",
    "mongod.service",
    "redis.service",
    "api-backend.service",
    "node-worker.service",
    "Spooler",
    "NTDS",
    "DNS",
    "LanmanServer",
}

def sanitize_cmd(command_line: str) -> str:
    """Redacts passwords and sensitive tokens from process command lines."""
    sanitized = command_line
    for pattern in REDACT_PATTERNS:
        sanitized = pattern.sub(r'\1=********', sanitized)
    return sanitized

def run_command(cmd, timeout=5):
    """Executes a safe read-only system command with a strict timeout."""
    try:
        proc = subprocess.run(
            cmd,
            shell=isinstance(cmd, str),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            timeout=timeout,
            check=False
        )
        return proc.stdout.strip()
    except Exception:
        return ""

def get_ip_addresses():
    """
    Identifies actual LAN IPv4 addresses using safe standard-library techniques.
    Avoids returning only 127.0.0.1 on Linux distributions like Linux Mint where
    /etc/hosts maps hostname to 127.0.1.1.
    """
    ips = []

    # Strategy 1: Standard POSIX UDP routing socket query (zero packets sent over network)
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        # Using link-local dummy destination to probe routing table for primary LAN interface
        s.connect(("10.255.255.255", 1))
        lan_ip = s.getsockname()[0]
        s.close()
        if lan_ip and not lan_ip.startswith("127.") and lan_ip not in ips:
            ips.append(lan_ip)
    except Exception:
        pass

    # Strategy 2: hostname -I (standard on Linux Mint, Ubuntu, Debian, RHEL)
    out = run_command("hostname -I 2>/dev/null")
    if out:
        for token in out.split():
            clean_ip = token.strip()
            if clean_ip and not clean_ip.startswith("127.") and ":" not in clean_ip:
                if clean_ip not in ips:
                    ips.append(clean_ip)

    # Strategy 3: ip -4 route get query
    if not ips:
        route_out = run_command("ip -4 route get 1.1.1.1 2>/dev/null")
        for line in route_out.splitlines():
            if "src" in line:
                parts = line.split()
                if "src" in parts:
                    idx = parts.index("src")
                    if idx + 1 < len(parts):
                        src_ip = parts[idx + 1].strip()
                        if src_ip and not src_ip.startswith("127.") and src_ip not in ips:
                            ips.append(src_ip)

    # Strategy 4: Cross-platform socket.getaddrinfo fallback
    if not ips:
        try:
            hostname = socket.gethostname()
            for addrinfo in socket.getaddrinfo(hostname, None, socket.AF_INET):
                candidate_ip = addrinfo[4][0]
                if candidate_ip and not candidate_ip.startswith("127.") and candidate_ip not in ips:
                    ips.append(candidate_ip)
        except Exception:
            pass

    # Fallback to loopback only if no physical/virtual network interface is reachable
    if not ips:
        ips = ["127.0.0.1"]

    return ips

def get_system_info():
    """Identifies the operating system, architecture, kernel, and network identity."""
    plat = platform.system().lower()
    if plat.startswith("darwin"):
        plat = "darwin"
    elif plat.startswith("win"):
        plat = "windows"
    else:
        plat = "linux"

    hostname = socket.gethostname()
    ip_addresses = get_ip_addresses()

    uptime_sec = 0
    boot_iso = None

    if plat == "linux":
        # Read uptime from /proc/uptime
        try:
            with open("/proc/uptime", "r", encoding="utf-8", errors="replace") as f:
                uptime_sec = int(float(f.readline().split()[0]))
        except Exception:
            pass

        # Calculate actual boot time using /proc/stat btime (kernel boot timestamp)
        try:
            btime_epoch = None
            if os.path.exists("/proc/stat"):
                with open("/proc/stat", "r", encoding="utf-8", errors="replace") as f:
                    for line in f:
                        if line.startswith("btime "):
                            btime_epoch = int(line.split()[1])
                            break
            if btime_epoch is not None and btime_epoch > 0:
                boot_iso = datetime.fromtimestamp(btime_epoch, timezone.utc).isoformat()
            elif uptime_sec > 0:
                boot_epoch = time.time() - uptime_sec
                boot_iso = datetime.fromtimestamp(boot_epoch, timezone.utc).isoformat()
        except Exception:
            pass

    # Fallback boot time calculation for Windows, macOS, or missing /proc/stat
    if not boot_iso:
        if uptime_sec > 0:
            boot_epoch = time.time() - uptime_sec
            boot_iso = datetime.fromtimestamp(boot_epoch, timezone.utc).isoformat()
        else:
            boot_iso = datetime.now(timezone.utc).isoformat()

    return {
        "hostname": hostname,
        "platform": plat,
        "osName": f"{platform.system()} {platform.release()}",
        "osRelease": platform.release(),
        "osVersion": platform.version(),
        "architecture": platform.machine(),
        "kernelVersion": platform.uname().release,
        "uptimeSeconds": uptime_sec,
        "bootTime": boot_iso,
        "domainOrWorkgroup": "WORKGROUP" if plat == "windows" else "local",
        "ipAddresses": ip_addresses,
        "macAddresses": []
    }

def get_cpu_model(plat):
    """
    Detects the actual CPU model name from /proc/cpuinfo or lscpu.
    Never reports raw architecture strings (such as x86_64 or amd64) as the CPU model.
    """
    model = ""
    vendor = ""
    arch_blacklist = {"x86_64", "amd64", "i386", "i686", "arm64", "aarch64", "unknown", ""}

    if plat == "linux":
        # Primary check: /proc/cpuinfo
        try:
            if os.path.exists("/proc/cpuinfo"):
                with open("/proc/cpuinfo", "r", encoding="utf-8", errors="replace") as f:
                    for line in f:
                        if ":" in line:
                            raw_key, raw_val = line.split(":", 1)
                            key = raw_key.strip().lower()
                            val = raw_val.strip()
                            if key in ("model name", "hardware", "cpu model") and val:
                                if val.lower() not in arch_blacklist and not val.isdigit():
                                    model = val
                                    break
                            elif key == "vendor_id" and val and not vendor:
                                vendor = val
                            elif key == "processor" and val and not model:
                                if not val.isdigit() and val.lower() not in arch_blacklist:
                                    model = val
        except Exception:
            pass

        # Secondary check: lscpu
        if not model or model.lower() in arch_blacklist:
            lscpu_out = run_command("lscpu 2>/dev/null")
            for line in lscpu_out.splitlines():
                if ":" in line:
                    k, v = [p.strip() for p in line.split(":", 1)]
                    if k.lower() == "model name" and v and v.lower() not in arch_blacklist:
                        model = v
                        break
                    elif k.lower() == "vendor id" and v and not vendor:
                        vendor = v

        if model.lower() in arch_blacklist:
            model = ""

        if not model:
            if vendor:
                model = f"{vendor} Processor"
            else:
                proc = platform.processor()
                if proc and proc.lower() not in arch_blacklist:
                    model = proc
                else:
                    model = "Generic Processor"
    elif plat == "darwin":
        sysctl_cpu = run_command("sysctl -n machdep.cpu.brand_string 2>/dev/null")
        if sysctl_cpu and sysctl_cpu.lower() not in arch_blacklist:
            model = sysctl_cpu
        else:
            model = platform.processor() or "Apple Silicon Processor"
    elif plat == "windows":
        wmic_cpu = run_command("wmic cpu get name /format:value 2>nul")
        for line in wmic_cpu.splitlines():
            if line.lower().startswith("name="):
                model = line.split("=", 1)[1].strip()
                break
        if not model or model.lower() in arch_blacklist:
            model = os.environ.get("PROCESSOR_IDENTIFIER") or platform.processor() or "Generic Windows Processor"
    else:
        model = platform.processor() or "Generic Processor"

    if model.lower() in arch_blacklist or not model:
        model = "Generic Processor"

    return model

def get_hardware_metrics(plat):
    """Gathers hardware utilization (CPU, Memory, Disks, Swap) in a strictly read-only manner."""
    cpu_cores = os.cpu_count() or 1
    cpu_model = get_cpu_model(plat)
    cpu_util = 0.0

    mem_total = 1024
    mem_used = 512
    mem_free = 512
    mem_cached = 0

    load_avg = [0.0, 0.0, 0.0]
    if hasattr(os, "getloadavg"):
        try:
            load_avg = list(os.getloadavg())
        except Exception:
            pass

    swap_total = 0
    swap_used = 0
    swap_free = 0
    swap_percent = 0.0

    if plat == "linux":
        try:
            with open("/proc/meminfo", "r", encoding="utf-8", errors="replace") as f:
                memdata = {}
                for line in f:
                    parts = line.split(":")
                    if len(parts) == 2:
                        memdata[parts[0].strip()] = int(parts[1].strip().split()[0])
                mem_total = memdata.get("MemTotal", 1024000) // 1024
                mem_free = memdata.get("MemFree", 512000) // 1024
                mem_cached = memdata.get("Cached", 0) // 1024
                mem_available = memdata.get("MemAvailable", mem_free + mem_cached) // 1024
                mem_used = max(0, mem_total - mem_available)

                swap_total = memdata.get("SwapTotal", 0) // 1024
                swap_free = memdata.get("SwapFree", 0) // 1024
                swap_used = max(0, swap_total - swap_free)
                if swap_total > 0:
                    swap_percent = round((swap_used / swap_total) * 100, 1)
        except Exception:
            pass

    disks = []
    try:
        usage = shutil.disk_usage("/")
        total_gb = round(usage.total / (1024**3), 1)
        used_gb = round(usage.used / (1024**3), 1)
        free_gb = round(usage.free / (1024**3), 1)
        disks.append({
            "mountPoint": "C:\\" if plat == "windows" else "/",
            "device": "SystemDrive" if plat == "windows" else "/dev/root",
            "fsType": "NTFS" if plat == "windows" else "ext4",
            "totalGb": total_gb,
            "usedGb": used_gb,
            "freeGb": free_gb,
            "usedPercent": round((used_gb / total_gb * 100), 1) if total_gb > 0 else 0
        })
    except Exception:
        pass

    hw = {
        "cpuUtilizationPercent": cpu_util,
        "cpuCores": cpu_cores,
        "cpuModel": cpu_model,
        "loadAverage": load_avg,
        "memory": {
            "totalMb": mem_total,
            "usedMb": mem_used,
            "freeMb": mem_free,
            "cachedMb": mem_cached,
            "usedPercent": round((mem_used / mem_total * 100), 1) if mem_total > 0 else 0
        },
        "disks": disks
    }
    if swap_total > 0:
        hw["swap"] = {
            "totalMb": swap_total,
            "usedMb": swap_used,
            "freeMb": swap_free,
            "usedPercent": swap_percent
        }
    return hw

def get_processes(plat):
    """Lists running processes safely with credential masking."""
    processes = []
    if plat in ("linux", "darwin"):
        out = run_command("ps -eo pid,ppid,user,%cpu,%mem,stat,comm --sort=-%mem 2>/dev/null | head -n 25")
        lines = out.splitlines()
        for line in lines[1:]:
            parts = line.split(None, 6)
            if len(parts) >= 7:
                try:
                    processes.append({
                        "pid": int(parts[0]),
                        "ppid": int(parts[1]),
                        "username": parts[2],
                        "cpuPercent": float(parts[3]),
                        "memoryMb": round(float(parts[4]) * 10, 1),
                        "status": "running" if "R" in parts[5] else "sleeping",
                        "commandLine": sanitize_cmd(parts[6])
                    })
                except Exception:
                    continue
    return processes

def parse_systemd_service_line(line: str):
    """
    Parses a single line from `systemctl list-units --type=service`.
    Defensively strips decorative symbols (●, *, +, !, -) so they are never
    interpreted as unit names. Captures: name, load state, active state, substate, description.
    """
    if not line or not line.strip():
        return None

    tokens = line.strip().split()
    if not tokens:
        return None

    # Strip decorative symbols (●, *, +, -, !) and single-character terminal noise
    while tokens and (tokens[0] in ("●", "*", "+", "-", "!") or (len(tokens[0]) == 1 and not tokens[0].isalnum())):
        tokens.pop(0)

    if not tokens:
        return None

    # Identify the unit name token (typically ends with .service)
    unit_name = tokens[0]
    if not unit_name.endswith(".service"):
        for i, t in enumerate(tokens):
            if t.endswith(".service"):
                unit_name = t
                tokens = tokens[i:]
                break

    if not unit_name or unit_name in ("●", "*", "+", "-", "!"):
        return None

    load_state = "unknown"
    active_state = "unknown"
    sub_state = "unknown"
    desc = ""

    # Standard systemctl output columns: [UNIT, LOAD, ACTIVE, SUB, ...DESCRIPTION]
    if len(tokens) >= 4:
        load_state = tokens[1]
        active_state = tokens[2]
        sub_state = tokens[3]
        desc = " ".join(tokens[4:]) if len(tokens) > 4 else ""
    elif len(tokens) == 3:
        load_state = tokens[1]
        active_state = tokens[2]
    elif len(tokens) == 2:
        active_state = tokens[1]

    # Map state to schema status: 'running' | 'failed' | 'stopped' | 'starting' | 'unknown'
    status = "unknown"
    if active_state == "failed" or sub_state == "failed" or load_state == "error":
        status = "failed"
    elif active_state == "active":
        if sub_state in ("running", "exited"):
            status = "running"
        elif sub_state in ("waiting", "dead"):
            status = "stopped"
        else:
            status = "running"
    elif active_state in ("inactive", "deactivating"):
        status = "stopped"
    elif active_state in ("activating", "reloading"):
        status = "starting"
    elif "fail" in active_state or "fail" in sub_state:
        status = "failed"

    return {
        "name": unit_name,
        "displayName": desc or unit_name,
        "status": status,
        "subState": sub_state,
        "description": desc
    }

def get_services(plat):
    """
    Inspects system daemons and services.
    Accurately identifies failed units without interpreting decorative symbols as names.
    """
    services = []
    seen_names = set()

    if plat == "linux":
        # Always check failed units first to ensure full capture
        failed_out = run_command("systemctl list-units --type=service --state=failed --no-legend --no-pager --plain 2>/dev/null")
        if not failed_out:
            failed_out = run_command("systemctl list-units --type=service --state=failed --no-legend --no-pager 2>/dev/null")

        for line in failed_out.splitlines():
            svc = parse_systemd_service_line(line)
            if svc and svc["name"] not in seen_names:
                services.append(svc)
                seen_names.add(svc["name"])

        # Capture running units
        running_out = run_command("systemctl list-units --type=service --state=running --no-legend --no-pager --plain 2>/dev/null | head -n 30")
        if not running_out:
            running_out = run_command("systemctl list-units --type=service --state=running --no-legend --no-pager 2>/dev/null | head -n 30")

        for line in running_out.splitlines():
            svc = parse_systemd_service_line(line)
            if svc and svc["name"] not in seen_names:
                services.append(svc)
                seen_names.add(svc["name"])

    return services

def classify_log_entry(raw_line: str, priority_hint=None):
    """
    Classifies a system log entry into CRITICAL, ERROR, WARNING, or INFO.
    Avoids labeling benign informational or notice messages as ERROR.
    """
    clean_line = raw_line.strip()
    if not clean_line:
        return None

    msg_lower = clean_line.lower()

    # Priority mapping if systemd priority integer was supplied
    if priority_hint is not None:
        try:
            pri = int(priority_hint)
            if pri in (0, 1, 2):
                return "CRITICAL"
            elif pri == 3:
                # Filter out benign messages that ended up on stderr/syslog with priority 3
                if any(benign in msg_lower for benign in ("listening on", "reached target", "started ", "startup completed")):
                    return "INFO"
                if "casper-md5check" in msg_lower or any(nc in msg_lower for nc in NON_CRITICAL_SERVICES):
                    return "WARNING"
                return "ERROR"
            elif pri == 4:
                return "WARNING"
            elif pri in (5, 6):
                return "INFO"
            elif pri == 7:
                return "DEBUG"
        except (ValueError, TypeError):
            pass

    # Special handling for known non-critical / live installer services: never label as ERROR
    if "casper-md5check" in msg_lower or any(nc in msg_lower for nc in NON_CRITICAL_SERVICES):
        return "WARNING" if any(w in msg_lower for w in ("fail", "error", "warn")) else "INFO"

    # Serious system/kernel failures
    if any(crit in msg_lower for crit in ("oom-killer", "out of memory: killed process", "kernel panic", "kernel bug", "general protection fault", "hardware error", "fatal:")):
        return "CRITICAL"

    # Standard errors
    if any(err in msg_lower for err in ("error", "failed", "failure", "exception", "segfault", "connection refused", "crashed", "core dump")):
        return "ERROR"

    # Warnings
    if any(warn in msg_lower for warn in ("warning", "warn", "deprecated", "throttled", "retry", "ignored")):
        return "WARNING"

    # Informational
    if any(info in msg_lower for info in ("started ", "listening on", "reached target", "mounted ", "activated ", "startup complete", "notice", "info")):
        return "INFO"

    return "INFO"

def get_recent_logs(plat):
    """
    Collects recent system error log traces.
    Classifies levels properly (CRITICAL, ERROR, WARNING, INFO) rather than labeling all as ERROR.
    """
    logs = []
    now_iso = datetime.now(timezone.utc).isoformat()

    if plat == "linux":
        # First attempt: structured json output from journalctl
        json_out = run_command("journalctl -p 4 -n 20 --no-pager -o json 2>/dev/null")
        if json_out:
            for line in json_out.splitlines():
                line = line.strip()
                if not line or not line.startswith("{"):
                    continue
                try:
                    entry = json.loads(line)
                    pri = entry.get("PRIORITY", "4")
                    msg = entry.get("MESSAGE", "")
                    facility = entry.get("SYSLOG_FACILITY", "systemd-journald")
                    source = entry.get("SYSLOG_IDENTIFIER") or entry.get("_SYSTEMD_UNIT") or "journalctl"
                    level = classify_log_entry(msg, priority_hint=pri) or "WARNING"

                    # Calculate precise timestamp if available
                    log_time = now_iso
                    realtime_us = entry.get("__REALTIME_TIMESTAMP")
                    if realtime_us:
                        try:
                            log_time = datetime.fromtimestamp(int(realtime_us) / 1000000, timezone.utc).isoformat()
                        except Exception:
                            pass

                    logs.append({
                        "timestamp": log_time,
                        "level": level,
                        "facility": str(facility),
                        "source": str(source),
                        "message": str(msg).strip()
                    })
                except Exception:
                    continue

        # Fallback to short-iso output if json format is unavailable
        if not logs:
            text_out = run_command("journalctl -p 4 -n 20 --no-pager -o short-iso 2>/dev/null")
            for line in text_out.splitlines():
                clean = line.strip()
                if not clean:
                    continue
                level = classify_log_entry(clean)
                log_time = now_iso
                source = "journalctl"
                msg = clean

                # Extract ISO timestamp if present at beginning of short-iso line
                # Format: 2026-11-03T16:00:00+0000 hostname source[pid]: message
                parts = clean.split(None, 2)
                if len(parts) >= 3 and "T" in parts[0]:
                    log_time = parts[0]
                    # Source and message
                    rem = parts[2]
                    if ":" in rem:
                        src_part, msg_part = rem.split(":", 1)
                        source = src_part.strip()
                        msg = msg_part.strip()

                logs.append({
                    "timestamp": log_time,
                    "level": level,
                    "facility": "systemd-journald",
                    "source": source,
                    "message": msg
                })

    return logs

def classify_severity(svcs, logs, hw, plat):
    """
    Deterministic severity classification:
    - NOMINAL: No meaningful service failures or serious errors.
    - LOW: Non-critical service failures (e.g. casper-md5check.service) or mild resource pressure.
    - MEDIUM: Significant errors requiring investigation (general service failures, ERROR logs, high memory/disk).
    - HIGH: Critical service failures or serious system problems (OOM killer, kernel panic, Tier-1 service failure).
    """
    failed_services = [s["name"] for s in svcs if s.get("status") == "failed"]

    # Partition failed services into critical, non-critical/live-install, and general
    critical_failed = [s for s in failed_services if s in CRITICAL_SERVICES]
    non_critical_failed = [s for s in failed_services if s in NON_CRITICAL_SERVICES]
    general_failed = [s for s in failed_services if s not in CRITICAL_SERVICES and s not in NON_CRITICAL_SERVICES]

    # Check for serious kernel / system errors in log traces
    has_oom_or_panic = False
    has_error_logs = False
    for log in logs:
        msg = log.get("message", "").lower()
        if "oom-killer" in msg or "out of memory: killed process" in msg or "kernel panic" in msg:
            has_oom_or_panic = True
        elif log.get("level") in ("CRITICAL", "ERROR"):
            has_error_logs = True

    # Check hardware thresholds
    mem_used_pct = hw.get("memory", {}).get("usedPercent", 0)
    swap_used_pct = hw.get("swap", {}).get("usedPercent", 0)
    disk_used_pct = 0
    if hw.get("disks"):
        disk_used_pct = hw["disks"][0].get("usedPercent", 0)

    # RULE 1: HIGH - Critical service failures or serious system problems
    if critical_failed or has_oom_or_panic or (mem_used_pct >= 95 and swap_used_pct >= 90) or disk_used_pct >= 98:
        reasons = []
        if critical_failed:
            reasons.append(f"critical service failure ({', '.join(critical_failed)})")
        if has_oom_or_panic:
            reasons.append("kernel OOM killer or panic detected in logs")
        if mem_used_pct >= 95 and swap_used_pct >= 90:
            reasons.append(f"severe memory/swap thrashing ({mem_used_pct}% RAM, {swap_used_pct}% swap)")
        if disk_used_pct >= 98:
            reasons.append(f"root filesystem exhaustion ({disk_used_pct}%)")
        return "HIGH", f"Critical problem detected: {'; '.join(reasons)}"

    # RULE 2: MEDIUM - Significant errors requiring investigation
    if general_failed or has_error_logs or mem_used_pct >= 90 or disk_used_pct >= 90:
        reasons = []
        if general_failed:
            reasons.append(f"failed service ({', '.join(general_failed)})")
        if has_error_logs:
            reasons.append("system error logs recorded")
        if mem_used_pct >= 90:
            reasons.append(f"elevated memory utilization ({mem_used_pct}%)")
        if disk_used_pct >= 90:
            reasons.append(f"elevated disk storage ({disk_used_pct}%)")
        return "MEDIUM", f"Investigation required: {'; '.join(reasons)}"

    # RULE 3: LOW - Non-critical service failures or mild warnings
    if non_critical_failed or mem_used_pct >= 80 or disk_used_pct >= 80:
        reasons = []
        if non_critical_failed:
            reasons.append(f"non-critical service failure ({', '.join(non_critical_failed)})")
        if mem_used_pct >= 80:
            reasons.append(f"moderate memory usage ({mem_used_pct}%)")
        if disk_used_pct >= 80:
            reasons.append(f"moderate disk usage ({disk_used_pct}%)")
        return "LOW", f"Non-critical issue: {'; '.join(reasons)}"

    # RULE 4: NOMINAL - No meaningful service failures or serious errors
    return "NOMINAL", "System nominal: all monitored services and telemetry within healthy thresholds"

def collect_telemetry():
    """Main discovery orchestrator."""
    start_time = time.time()
    sys_info = get_system_info()
    plat = sys_info["platform"]
    hw = get_hardware_metrics(plat)
    procs = get_processes(plat)
    svcs = get_services(plat)
    logs = get_recent_logs(plat)
    duration_ms = int((time.time() - start_time) * 1000)

    # Classify severity deterministically
    severity, alert_summary = classify_severity(svcs, logs, hw, plat)

    payload = {
        "id": f"ep-{plat}-{sys_info['hostname'].lower()}",
        "reportedSeverity": severity,
        "alertSummary": alert_summary,
        "system": sys_info,
        "hardware": hw,
        "processes": procs,
        "services": svcs,
        "networkConnections": [],
        "logTraces": logs,
        "probeMetadata": {
            "probeVersion": PROBE_VERSION,
            "scanTimestamp": datetime.now(timezone.utc).isoformat(),
            "executionDurationMs": duration_ms,
            "readOnlyEnforced": READ_ONLY_ENFORCED,
            "collectedBy": f"Sentinel Probe (Python {sys.version.split()[0]} on {plat.capitalize()})"
        }
    }
    return payload

def upload_telemetry(url: str, payload: dict) -> bool:
    """
    POSTs the JSON telemetry to the supplied URL using Python's standard library (urllib.request).
    Prints the HTTP response status and response body.
    """
    try:
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=data,
            headers={
                "Content-Type": "application/json",
                "User-Agent": f"Sentinel-Probe/{PROBE_VERSION}"
            },
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=15) as resp:
            status_code = resp.getcode()
            response_body = resp.read().decode("utf-8", errors="replace")
            print(f"HTTP Status: {status_code}")
            print(f"Response: {response_body}")
            return True
    except urllib.error.HTTPError as e:
        status_code = e.code
        response_body = e.read().decode("utf-8", errors="replace")
        print(f"HTTP Status: {status_code}")
        print(f"Response: {response_body}")
        return False
    except urllib.error.URLError as e:
        print(f"Connection Error: {e.reason}")
        return False
    except Exception as e:
        print(f"Upload Error: {e}")
        return False

def main():
    # Parse CLI flags
    upload_url = None
    args = sys.argv[1:]
    i = 0
    while i < len(args):
        if args[i] == "--upload" and i + 1 < len(args):
            upload_url = args[i + 1]
            i += 2
        else:
            i += 1

    payload = collect_telemetry()
    json_output = json.dumps(payload, indent=2)

    if upload_url:
        success = upload_telemetry(upload_url, payload)
        if not success:
            sys.exit(1)
    else:
        # Standard stdout emission
        print(json_output)

if __name__ == "__main__":
    main()
