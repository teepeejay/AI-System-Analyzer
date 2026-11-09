import React, { useState } from 'react';
import { EndpointTelemetry } from '../types/sentinel.js';
import { countScannedMetrics, ScannedCategorySummary } from '../utils/metricCounter.js';
import {
  Server,
  Cpu,
  Activity,
  Layers,
  Network,
  FileText,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Search,
  CheckCircle2,
  Sparkles,
  BarChart3,
  ListFilter
} from 'lucide-react';

interface ScannedMetricsSectionProps {
  endpoint: EndpointTelemetry;
  defaultExpanded?: boolean;
  variant?: 'friendly' | 'dense';
}

export const ScannedMetricsSection: React.FC<ScannedMetricsSectionProps> = ({
  endpoint,
  defaultExpanded = true,
  variant = 'friendly',
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [itemSearch, setItemSearch] = useState('');

  const metricData = countScannedMetrics(endpoint);

  const getCategoryIcon = (iconName: string, className = 'w-4 h-4') => {
    switch (iconName) {
      case 'Server':
        return <Server className={className} />;
      case 'Cpu':
        return <Cpu className={className} />;
      case 'Activity':
        return <Activity className={className} />;
      case 'Layers':
        return <Layers className={className} />;
      case 'Network':
        return <Network className={className} />;
      case 'FileText':
        return <FileText className={className} />;
      case 'ShieldCheck':
      default:
        return <ShieldCheck className={className} />;
    }
  };

  // Collect all items across categories or filter by selected category
  const activeCategories = selectedCategory === 'all'
    ? metricData.categories
    : metricData.categories.filter((c) => c.id === selectedCategory);

  const filteredItems = activeCategories.flatMap((cat) =>
    cat.items
      .filter((item) => {
        if (!itemSearch.trim()) return true;
        const q = itemSearch.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          String(item.value).toLowerCase().includes(q) ||
          (item.description && item.description.toLowerCase().includes(q))
        );
      })
      .map((item) => ({ ...item, categoryLabel: cat.label, categoryColor: cat.color, categoryIcon: cat.iconName }))
  );

  return (
    <div className={`rounded-2xl border transition-all ${
      variant === 'friendly'
        ? 'bg-gradient-to-b from-slate-950/90 to-slate-900/90 border-indigo-500/30 shadow-lg'
        : 'bg-slate-950 border-slate-800'
    }`}>
      {/* Header bar showing the prominent total count */}
      <div className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs uppercase font-bold tracking-wider text-indigo-400">
                Scanned Metrics & Inventory
              </span>
              <span className="text-slate-600">•</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono">
                1 Item = 1 Counted Scan
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <h4 className="text-xl sm:text-2xl font-bold font-mono text-white">
                {metricData.totalScanned}{' '}
                <span className="text-sm sm:text-base font-semibold text-slate-300 font-sans">
                  Total Items Scanned
                </span>
              </h4>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Comprehensive inventory of every hardware metric, OS parameter, process, service, and log entry inspected on{' '}
              <span className="font-mono text-indigo-300">{endpoint.system.hostname}</span>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <span>{isExpanded ? 'Collapse Inventory' : 'View All Scanned Items'}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Summary KPI Badges (Category Breakdown) */}
      <div className="p-4 sm:p-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {metricData.categories.map((cat) => {
            const isCategorySelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  if (selectedCategory === cat.id) {
                    setSelectedCategory('all');
                  } else {
                    setSelectedCategory(cat.id);
                  }
                  setIsExpanded(true);
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isCategorySelected
                    ? 'bg-indigo-950/60 border-indigo-400 ring-2 ring-indigo-500/40'
                    : 'bg-slate-900/80 hover:bg-slate-800/80 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className={`p-1.5 rounded-lg bg-slate-950 ${cat.color}`}>
                    {getCategoryIcon(cat.iconName, 'w-3.5 h-3.5')}
                  </div>
                  <span className="font-mono text-base font-bold text-white">
                    {cat.count}
                  </span>
                </div>
                <div className="text-[11px] font-semibold text-slate-200 truncate">
                  {cat.label}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {cat.count} individual {cat.count === 1 ? 'item' : 'items'}
                </div>
              </button>
            );
          })}
        </div>

        {/* Expanded Detailed Inventory Table */}
        {isExpanded && (
          <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-3">
            {/* Filter and Search Bar for individual items */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors whitespace-nowrap ${
                    selectedCategory === 'all'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  All ({metricData.totalScanned})
                </button>
                {metricData.categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors whitespace-nowrap ${
                      selectedCategory === cat.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {cat.label} ({cat.count})
                  </button>
                ))}
              </div>

              <div className="relative min-w-[220px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter scanned items..."
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Scanned Items Itemized Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-800 max-h-80 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase font-mono sticky top-0 z-10 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3.5 w-16 text-center">Count</th>
                    <th className="py-2.5 px-3.5">Category</th>
                    <th className="py-2.5 px-3.5">Metric / Monitored Parameter</th>
                    <th className="py-2.5 px-3.5">Captured Telemetry Value</th>
                    <th className="py-2.5 px-3.5">Inspection Context</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400">
                        No scanned items match your search.
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item, index) => (
                      <tr key={item.id} className="hover:bg-slate-850/50 transition-colors">
                        <td className="py-2 px-3 text-center">
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-mono text-[10px] font-bold">
                            +1
                          </span>
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${item.categoryColor}`}>
                            {getCategoryIcon(item.categoryIcon, 'w-3 h-3')}
                            {item.categoryLabel}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-semibold text-white font-mono text-[11px]">
                          {item.name}
                        </td>
                        <td className="py-2 px-3 font-mono text-emerald-300 text-[11px] max-w-xs sm:max-w-md truncate" title={String(item.value)}>
                          {String(item.value)}
                        </td>
                        <td className="py-2 px-3 text-slate-400 text-[11px] max-w-xs truncate" title={item.description || ''}>
                          {item.description || '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>
                Showing {filteredItems.length} of {metricData.totalScanned} scanned items
              </span>
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                All {metricData.totalScanned} items verified read-only
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
