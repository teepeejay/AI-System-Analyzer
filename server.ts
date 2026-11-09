/**
 * Sentinel AI - Backend Server Entrypoint
 * Express server providing REST endpoints for multi-OS endpoint telemetry,
 * runbooks, probe distribution, and Vite development middleware.
 */

import express, { Request, Response } from 'express';
import http from 'http';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import { INTERNAL_RUNBOOKS } from './src/data/runbooks.js';
import { EndpointTelemetry } from './src/types/sentinel.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// In-memory fleet storage populated exclusively by real incoming telemetry scans
const fleetStore: Map<string, EndpointTelemetry> = new Map();

// API Routes
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'Sentinel AI Backend Engine',
    version: '1.4.0',
    currentTime: new Date().toISOString(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    managedEndpointsCount: fleetStore.size,
  });
});

app.get('/api/pipeline/status', (_req: Request, res: Response) => {
  res.json({
    milestone: 1,
    milestoneTitle: 'Milestone 1: Core Architecture, Telemetry Schema & SRE Operations Console',
    agents: {
      endpointDiscovery: {
        name: 'Endpoint Discovery Agent',
        stage: 'Architecture & Probe Template Active',
        status: 'active',
        details: 'Cross-platform Python probe specification drafted with read-only guarantees and standardized JSON schema serialization.',
      },
      diagnosticResearch: {
        name: 'Diagnostic Research Agent',
        stage: 'Milestone 2 - Ready for Activation',
        status: 'pending',
        details: 'Internal SRE runbook knowledge base prepared. Gemini reasoning and document cross-referencing to be connected in Milestone 2.',
      },
      reporting: {
        name: 'Reporting Agent',
        stage: 'Milestone 3 - Automated SRE Reports',
        status: 'pending',
        details: 'Report schema and confidence-level contracts defined. Executive & technical report generation to be connected in Milestone 3.',
      },
    },
  });
});

app.get('/api/endpoints', (_req: Request, res: Response) => {
  const endpoints = Array.from(fleetStore.values());
  res.json({ endpoints });
});

app.get('/api/endpoints/:id', (req: Request, res: Response) => {
  const ep = fleetStore.get(req.params.id);
  if (!ep) {
    return res.status(404).json({ error: `Endpoint '${req.params.id}' not found.` });
  }
  res.json(ep);
});

app.post('/api/telemetry/ingest', (req: Request, res: Response) => {
  const payload = req.body as Partial<EndpointTelemetry>;

  if (!payload || !payload.system || !payload.system.hostname || !payload.system.platform) {
    return res.status(400).json({
      error: 'Invalid telemetry payload. Required fields: system.hostname, system.platform.',
    });
  }

  const id = payload.id || `ep-${payload.system.platform}-${payload.system.hostname.toLowerCase()}`;
  const completeRecord: EndpointTelemetry = {
    id,
    reportedSeverity: payload.reportedSeverity || 'NOMINAL',
    alertSummary: payload.alertSummary || 'Manual or API telemetry ingestion',
    system: {
      hostname: payload.system.hostname,
      platform: payload.system.platform,
      osName: payload.system.osName || `${payload.system.platform} system`,
      osRelease: payload.system.osRelease || 'unknown',
      osVersion: payload.system.osVersion || 'unknown',
      architecture: payload.system.architecture || 'x86_64',
      kernelVersion: payload.system.kernelVersion || 'unknown',
      uptimeSeconds: payload.system.uptimeSeconds || 0,
      bootTime: payload.system.bootTime || new Date().toISOString(),
      domainOrWorkgroup: payload.system.domainOrWorkgroup || 'WORKGROUP',
      ipAddresses: payload.system.ipAddresses || ['127.0.0.1'],
      macAddresses: payload.system.macAddresses || [],
    },
    hardware: payload.hardware || {
      cpuUtilizationPercent: 0,
      cpuCores: 1,
      cpuModel: 'Generic Processor',
      memory: { totalMb: 1024, usedMb: 512, freeMb: 512, usedPercent: 50 },
      disks: [{ mountPoint: '/', device: '/dev/root', fsType: 'ext4', totalGb: 50, usedGb: 25, freeGb: 25, usedPercent: 50 }],
    },
    processes: payload.processes || [],
    services: payload.services || [],
    networkConnections: payload.networkConnections || [],
    logTraces: payload.logTraces || [],
    probeMetadata: payload.probeMetadata || {
      probeVersion: '1.4.0',
      scanTimestamp: new Date().toISOString(),
      executionDurationMs: 150,
      readOnlyEnforced: true,
      collectedBy: 'Manual Ingestion API',
    },
  };

  fleetStore.set(id, completeRecord);

  res.status(201).json({
    message: `Telemetry ingested successfully for endpoint ${completeRecord.system.hostname}`,
    endpointId: id,
    severity: completeRecord.reportedSeverity,
  });
});

app.get('/api/runbooks', (_req: Request, res: Response) => {
  res.json({ runbooks: INTERNAL_RUNBOOKS });
});

app.get('/api/scanner/script', (_req: Request, res: Response) => {
  const probePath = path.join(__dirname, 'scripts', 'sentinel_probe.py');
  if (fs.existsSync(probePath)) {
    const scriptContent = fs.readFileSync(probePath, 'utf-8');
    res.setHeader('Content-Type', 'text/x-python');
    res.setHeader('Content-Disposition', 'attachment; filename="sentinel_probe.py"');
    return res.send(scriptContent);
  }
  res.status(404).json({ error: 'Sentinel probe script not found on server.' });
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';
  const httpServer = http.createServer(app);

  if (!isProduction) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          server: httpServer,
        },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`[Sentinel AI] Core Server initialized on http://0.0.0.0:${PORT}`);
  });
}

startServer();
