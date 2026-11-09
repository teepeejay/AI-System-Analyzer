/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.js';
import { PipelineBanner } from './components/PipelineBanner.js';
import { FriendlyFleetView } from './components/FriendlyFleetView.js';
import { FriendlyTelemetryInspector } from './components/FriendlyTelemetryInspector.js';
import { FleetOverview } from './components/FleetOverview.js';
import { TelemetryInspector } from './components/TelemetryInspector.js';
import { RunbooksLibrary } from './components/RunbooksLibrary.js';
import { ArchitectureDocTab } from './components/ArchitectureDocTab.js';
import { TelemetryIngestModal } from './components/TelemetryIngestModal.js';
import { ScannerSpecModal } from './components/ScannerSpecModal.js';
import { ScanCommandModal } from './components/ScanCommandModal.js';
import { EndpointTelemetry } from './types/sentinel.js';
import { Server, Sparkles, Terminal } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'fleet' | 'runbooks' | 'architecture'>('fleet');
  const [viewMode, setViewMode] = useState<'simplified' | 'advanced'>('simplified');
  const [endpoints, setEndpoints] = useState<EndpointTelemetry[]>([]);
  const [selectedEndpointId, setSelectedEndpointId] = useState<string | null>(null);
  const [selectedEndpointTelemetry, setSelectedEndpointTelemetry] = useState<EndpointTelemetry | null>(null);
  const [isLoadingFleet, setIsLoadingFleet] = useState(false);
  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);
  const [isScannerSpecModalOpen, setIsScannerSpecModalOpen] = useState(false);
  const [isScanCommandModalOpen, setIsScanCommandModalOpen] = useState(false);

  // Fetch fleet list from backend API
  const refreshFleet = async () => {
    setIsLoadingFleet(true);
    try {
      const res = await fetch('/api/endpoints');
      if (res.ok) {
        const listData = await res.json();
        const incomingEndpoints: EndpointTelemetry[] = listData.endpoints || [];
        setEndpoints(incomingEndpoints);

        if (incomingEndpoints.length === 0) {
          // Clear selected endpoint and its telemetry when backend returns an empty list
          setSelectedEndpointId(null);
          setSelectedEndpointTelemetry(null);
        } else {
          // Preserve current selection if it still exists in the incoming list,
          // otherwise automatically select the first real endpoint
          setSelectedEndpointId((prevId) => {
            const exists = prevId ? incomingEndpoints.find((e) => e.id === prevId) : null;
            const targetId = exists ? exists.id : incomingEndpoints[0].id;
            const targetTelemetry = exists || incomingEndpoints[0];
            setSelectedEndpointTelemetry(targetTelemetry);
            return targetId;
          });
        }
      }
    } catch (err) {
      console.error('Failed to retrieve endpoints from backend API:', err);
      // Clean error handling without inserting any mock/sample data
    } finally {
      setIsLoadingFleet(false);
    }
  };

  useEffect(() => {
    refreshFleet();
    // Poll backend periodically so incoming probe uploads appear automatically
    const interval = setInterval(refreshFleet, 4000);
    return () => clearInterval(interval);
  }, []);

  // Update selected telemetry when endpoint selection changes
  const handleSelectEndpoint = async (id: string) => {
    setSelectedEndpointId(id);
    const local = endpoints.find((e) => e.id === id);
    if (local) {
      setSelectedEndpointTelemetry(local);
    }

    try {
      const res = await fetch(`/api/endpoints/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedEndpointTelemetry(data);
      }
    } catch (err) {
      console.error(`Failed to fetch details for endpoint ${id}:`, err);
    }
  };

  const handleIngestSuccess = (newEndpoint: EndpointTelemetry) => {
    setEndpoints((prev) => {
      const filtered = prev.filter((e) => e.id !== newEndpoint.id);
      return [newEndpoint, ...filtered];
    });
    setSelectedEndpointId(newEndpoint.id);
    setSelectedEndpointTelemetry(newEndpoint);
    setActiveTab('fleet');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Application Header with View Mode Switcher */}
      <Header
        onOpenIngest={() => setIsIngestModalOpen(true)}
        onOpenScannerSpec={() => setIsScannerSpecModalOpen(true)}
        onOpenScanCommand={() => setIsScanCommandModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={(t) => setActiveTab(t as any)}
        endpointCount={endpoints.length}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* Main Operations Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Pipeline Banner (Adapts between simplified and advanced view) */}
        <PipelineBanner viewMode={viewMode} />

        {/* Tab View Switcher */}
        {activeTab === 'fleet' && (
          <div className="space-y-6">
            {viewMode === 'simplified' ? (
              /* --- SIMPLIFIED / USER-FRIENDLY VIEW --- */
              <>
                <FriendlyFleetView
                  endpoints={endpoints}
                  selectedEndpointId={selectedEndpointId}
                  onSelectEndpoint={handleSelectEndpoint}
                  onOpenIngest={() => setIsIngestModalOpen(true)}
                  onOpenScanCommand={() => setIsScanCommandModalOpen(true)}
                />

                {selectedEndpointTelemetry ? (
                  <FriendlyTelemetryInspector
                    endpoint={selectedEndpointTelemetry}
                    onOpenRunbooks={() => setActiveTab('runbooks')}
                    onSwitchToAdvanced={() => setViewMode('advanced')}
                  />
                ) : (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
                    <Server className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-xs">Select a computer from above to see its diagnostics.</p>
                  </div>
                )}
              </>
            ) : (
              /* --- ADVANCED PRO SRE CONSOLE VIEW --- */
              <>
                <FleetOverview
                  endpoints={endpoints}
                  selectedEndpointId={selectedEndpointId}
                  onSelectEndpoint={handleSelectEndpoint}
                  onOpenIngest={() => setIsIngestModalOpen(true)}
                  onOpenScanCommand={() => setIsScanCommandModalOpen(true)}
                />

                {selectedEndpointTelemetry ? (
                  <TelemetryInspector
                    endpoint={selectedEndpointTelemetry}
                    onOpenRunbooks={() => setActiveTab('runbooks')}
                  />
                ) : (
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
                    <Server className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-xs">Select an endpoint from the fleet table above to inspect its telemetry.</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'runbooks' && <RunbooksLibrary />}

        {activeTab === 'architecture' && <ArchitectureDocTab />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 text-slate-500 text-xs py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">Sentinel AI</span>
            <span>•</span>
            <span>Milestone 1: Operations Console</span>
            <span>•</span>
            <span className="text-indigo-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {viewMode === 'simplified' ? 'Simple Friendly Mode' : 'Advanced Pro SRE Mode'}
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            Read-only diagnostics • Node.js + Express • React 19 • Tailwind CSS
          </div>
        </div>
      </footer>

      {/* Modals */}
      <TelemetryIngestModal
        isOpen={isIngestModalOpen}
        onClose={() => setIsIngestModalOpen(false)}
        onIngestSuccess={handleIngestSuccess}
      />

      <ScannerSpecModal
        isOpen={isScannerSpecModalOpen}
        onClose={() => setIsScannerSpecModalOpen(false)}
      />

      <ScanCommandModal
        isOpen={isScanCommandModalOpen}
        onClose={() => setIsScanCommandModalOpen(false)}
      />
    </div>
  );
}
