import React, { useState } from 'react';
import { SCANNER_ARCHITECTURE_SPEC } from '../data/scannerSpec.js';
import { 
  X, 
  Terminal, 
  ShieldCheck, 
  Download, 
  Copy, 
  Check, 
  Cpu, 
  Lock, 
  FileCode,
  Layers,
  CheckCircle2
} from 'lucide-react';

interface ScannerSpecModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScannerSpecModal: React.FC<ScannerSpecModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'source'>('architecture');
  const [copiedCode, setCopiedCode] = useState(false);
  const [probeSource, setProbeSource] = useState<string>('');
  const [isLoadingSource, setIsLoadingSource] = useState(false);

  React.useEffect(() => {
    if (isOpen && !probeSource) {
      setIsLoadingSource(true);
      fetch('/api/scanner/script')
        .then((res) => res.text())
        .then((txt) => {
          setProbeSource(txt);
          setIsLoadingSource(false);
        })
        .catch(() => {
          setIsLoadingSource(false);
        });
    }
  }, [isOpen, probeSource]);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(probeSource);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([probeSource], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sentinel_probe.py';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600/20 border border-indigo-500/40 rounded-lg text-indigo-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Endpoint Discovery Agent Probe Architecture</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                  v{SCANNER_ARCHITECTURE_SPEC.version}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Multi-OS read-only Python scanner packaged to execute locally on target nodes.
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

        {/* Tabs */}
        <div className="bg-slate-950 px-4 border-b border-slate-800 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`py-2.5 px-3 text-xs font-medium border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'architecture'
                ? 'border-indigo-500 text-white font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Security & OS Architecture
          </button>
          <button
            onClick={() => setActiveTab('source')}
            className={`py-2.5 px-3 text-xs font-medium border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'source'
                ? 'border-indigo-500 text-white font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            Python Script Code (sentinel_probe.py)
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-5">
          {activeTab === 'architecture' ? (
            <div className="space-y-6">
              {/* Security Principles */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Read-Only Security Guarantees & Privacy Disciplines
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {SCANNER_ARCHITECTURE_SPEC.securityGuarantees.map((sec, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-white">
                        <Lock className="w-3.5 h-3.5 text-indigo-400" />
                        {sec.principle}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{sec.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* OS Instrumentation Details */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-3">
                  <Cpu className="w-4 h-4 text-indigo-400" />
                  Cross-Platform Instrumentation Matrix
                </h4>
                <div className="space-y-3">
                  {SCANNER_ARCHITECTURE_SPEC.targetOperatingSystems.map((os, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white">{os.os}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 font-mono border border-slate-800">
                          {os.packaging}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        <strong className="text-slate-300">Sources:</strong>{' '}
                        {os.primarySources.join(', ')}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        <strong className="text-slate-300">Privileges:</strong> {os.privilegeRequirement}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pipeline Workflow */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                  Lifecycle Workflow
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  {SCANNER_ARCHITECTURE_SPEC.pipelineWorkflow.map((step, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-[10px] font-mono text-indigo-400 font-bold">Step 0{step.step}</span>
                      <div className="text-xs font-bold text-white">{step.name}</div>
                      <p className="text-[10px] text-slate-400 leading-snug">{step.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">
                  scripts/sentinel_probe.py (Executable Python 3 Script)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyCode}
                    className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                    <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    className="px-2.5 py-1 text-xs rounded bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 font-medium"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Script</span>
                  </button>
                </div>
              </div>

              {isLoadingSource ? (
                <div className="p-8 text-center text-slate-400 text-xs">Loading Python script...</div>
              ) : (
                <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto max-h-[500px] leading-relaxed">
                  {probeSource || '# Loading sentinel_probe.py...'}
                </pre>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            Compliant with Linux, Windows Server, and macOS Endpoint Security standards.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
