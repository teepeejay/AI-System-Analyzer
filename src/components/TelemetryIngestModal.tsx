import React, { useState } from 'react';
import { SAMPLE_ENDPOINTS } from '../data/sampleEndpoints.js';
import { EndpointTelemetry } from '../types/sentinel.js';
import { X, Upload, CheckCircle2, AlertTriangle, FileJson, RefreshCw } from 'lucide-react';

interface TelemetryIngestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIngestSuccess: (endpoint: EndpointTelemetry) => void;
}

export const TelemetryIngestModal: React.FC<TelemetryIngestModalProps> = ({
  isOpen,
  onClose,
  onIngestSuccess,
}) => {
  const [jsonText, setJsonText] = useState<string>(
    JSON.stringify(SAMPLE_ENDPOINTS[0], null, 2)
  );
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectPreset = (index: number) => {
    setJsonText(JSON.stringify(SAMPLE_ENDPOINTS[index], null, 2));
    setValidationError(null);
    setSuccessMessage(null);
  };

  const handleValidateAndSubmit = async () => {
    setValidationError(null);
    setSuccessMessage(null);

    let parsed: any;
    try {
      parsed = JSON.parse(jsonText);
    } catch (e: any) {
      setValidationError(`JSON Syntax Error: ${e.message}`);
      return;
    }

    // Schema Validation
    if (!parsed.system || !parsed.system.hostname || !parsed.system.platform) {
      setValidationError(
        'Validation Failed: Telemetry payload must contain "system.hostname" and "system.platform" ("linux", "windows", or "darwin").'
      );
      return;
    }

    if (!parsed.hardware || typeof parsed.hardware.cpuUtilizationPercent !== 'number') {
      setValidationError(
        'Validation Failed: Payload must contain "hardware.cpuUtilizationPercent".'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/telemetry/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Server rejected telemetry payload');
      }

      const resData = await res.json();
      setSuccessMessage(resData.message || 'Telemetry successfully ingested into fleet!');
      onIngestSuccess(parsed as EndpointTelemetry);
      setTimeout(() => {
        onClose();
        setSuccessMessage(null);
      }, 1200);
    } catch (err: any) {
      setValidationError(`API Ingestion Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600/20 border border-indigo-500/40 rounded-lg text-indigo-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Ingest Machine Telemetry</h3>
              <p className="text-xs text-slate-400">
                Upload raw structured JSON telemetry conforming to the Sentinel AI discovery schema.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Selector */}
        <div className="p-3 bg-slate-900/80 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider pl-1">
            Load Preset Incidents:
          </span>
          <button
            onClick={() => handleSelectPreset(0)}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 whitespace-nowrap transition-colors"
          >
            🐧 Linux OOM-Killer
          </button>
          <button
            onClick={() => handleSelectPreset(1)}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 whitespace-nowrap transition-colors"
          >
            🪟 Windows Spooler Hang
          </button>
          <button
            onClick={() => handleSelectPreset(2)}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 whitespace-nowrap transition-colors"
          >
            🍎 macOS APFS Lock
          </button>
          <button
            onClick={() => handleSelectPreset(3)}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 whitespace-nowrap transition-colors"
          >
            Nominal Linux DB
          </button>
        </div>

        {/* JSON Editor Body */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3">
          {validationError && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="relative">
            <textarea
              value={jsonText}
              onChange={(e) => {
                setJsonText(e.target.value);
                setValidationError(null);
              }}
              rows={18}
              className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-indigo-200 focus:outline-none focus:border-indigo-500 leading-relaxed resize-none"
              placeholder="Paste JSON schema..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
            <FileJson className="w-4 h-4 text-indigo-400" />
            <span>Strict Schema: SystemInfo, HardwareMetrics, LogTraces, Services</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleValidateAndSubmit}
              disabled={isSubmitting}
              className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-colors shadow-md disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Validating...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Validate & Ingest Telemetry</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
