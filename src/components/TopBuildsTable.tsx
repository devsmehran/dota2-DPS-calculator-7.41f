import React from 'react';
import { Download, Layers, BarChart2, Eye, Award } from 'lucide-react';
import { BuildEvaluation, OptimizationProgress } from '../types';

interface TopBuildsTableProps {
  builds: BuildEvaluation[];
  selectedBuild: BuildEvaluation | null;
  onSelectBuild: (build: BuildEvaluation) => void;
  comparedBuildIds: string[];
  onToggleCompare: (buildId: string) => void;
  progress: OptimizationProgress;
  onViewSimulator: (build: BuildEvaluation) => void;
}

export const TopBuildsTable: React.FC<TopBuildsTableProps> = ({
  builds,
  selectedBuild,
  onSelectBuild,
  comparedBuildIds,
  onToggleCompare,
  progress,
  onViewSimulator
}) => {
  const exportCsv = () => {
    if (builds.length === 0) return;
    const headers = [
      'Rank',
      'Mean DPS',
      'StdDev',
      'CI_95_Min',
      'CI_95_Max',
      'Total Gold',
      'Boot Item',
      'Unique Item 2',
      'Unique Item 3',
      'Unique Item 4',
      'Unique Item 5',
      'Unique Item 6',
      'Provenance Label'
    ];
    const rows = builds.map((b, idx) => [
      idx + 1,
      b.meanDps,
      b.stdDev,
      b.confidenceInterval95[0],
      b.confidenceInterval95[1],
      b.totalCost,
      b.items[0]?.name || '',
      b.items[1]?.name || '',
      b.items[2]?.name || '',
      b.items[3]?.name || '',
      b.items[4]?.name || '',
      b.items[5]?.name || '',
      `"${b.provenanceLabel}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dota2-optimal-builds-patch741f.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-5 space-y-4">
      {/* Table Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-cyan-400" />
            <h3 className="text-base font-bold font-mono text-slate-100">
              Top 6-Slot Item Configurations
            </h3>
            <span className="text-[11px] font-mono font-semibold text-cyan-400 bg-cyan-950/60 border border-cyan-800/80 px-2 py-0.5 rounded">
              1 Boot + 5 Unique Slots
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Ranked by mean DPS under empirical combat simulation · Every slot is a unique item · Boot item strictly required
          </p>
        </div>

        <div className="flex items-center gap-2">
          {builds.length > 0 && (
            <button
              onClick={exportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-slate-300 bg-slate-950 hover:bg-slate-800 rounded border border-slate-800 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Download CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar during Optimization */}
      {progress.isRunning && (
        <div className="p-4 bg-slate-950 border border-cyan-800/60 rounded-lg space-y-2 animate-pulse">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-cyan-300 font-semibold">{progress.stage}</span>
            <span className="text-slate-400">
              Evaluated {progress.currentIteration.toLocaleString()} iterations ({progress.percent}%)
            </span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
            <div
              className="bg-cyan-500 h-full transition-all duration-300"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
          {progress.currentBestDps > 0 && (
            <div className="text-[11px] font-mono text-slate-400 flex justify-between">
              <span>Leading DPS Candidate:</span>
              <span className="text-emerald-400 font-bold">{progress.currentBestDps.toLocaleString()} DPS</span>
            </div>
          )}
        </div>
      )}

      {/* Builds Table */}
      {builds.length === 0 ? (
        <div className="p-12 text-center bg-slate-950/40 rounded border border-dashed border-slate-800 space-y-2">
          <Layers className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-sm font-mono text-slate-400">
            No optimization results yet.
          </p>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Select a hero and target scenario, then click "Run 6-Slot Optimizer" to begin combinatorial simulation.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400">
              <tr>
                <th className="px-3 py-2.5">Rank</th>
                <th className="px-3 py-2.5">Mean DPS (95% CI)</th>
                <th className="px-3 py-2.5">6-Slot Legal Inventory</th>
                <th className="px-3 py-2.5">Total Gold</th>
                <th className="px-3 py-2.5">Provenance</th>
                <th className="px-3 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-950/30">
              {builds.map((build, index) => {
                const isSelected = selectedBuild?.buildId === build.buildId;
                const isCompared = comparedBuildIds.includes(build.buildId);

                return (
                  <tr
                    key={build.buildId}
                    className={`transition-colors ${
                      isSelected
                        ? 'bg-cyan-950/30 border-l-2 border-l-cyan-400'
                        : 'hover:bg-slate-900/50'
                    }`}
                  >
                    {/* Rank */}
                    <td className="px-3 py-3">
                      <span className={`font-bold ${index === 0 ? 'text-amber-400 text-sm' : 'text-slate-400'}`}>
                        #{index + 1}
                      </span>
                    </td>

                    {/* DPS and Confidence Interval */}
                    <td className="px-3 py-3">
                      <div className="text-sm font-bold text-slate-100 tabular-nums">
                        {build.meanDps.toLocaleString()}
                        <span className="text-xs font-normal text-slate-400 ml-1">DPS</span>
                      </div>
                      <div className="text-[10px] text-slate-500 tabular-nums">
                        95% CI: [{build.confidenceInterval95[0]} - {build.confidenceInterval95[1]}] · σ={build.stdDev}
                      </div>
                    </td>

                    {/* Inventory */}
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap items-center gap-1.5 max-w-md">
                        {build.items.map((item, itemIdx) => {
                          const isBoot = item.isBoot || item.uniqueGroup === 'boots';
                          return (
                            <span
                              key={itemIdx}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono ${
                                isBoot
                                  ? 'bg-cyan-950/80 border border-cyan-500/80 text-cyan-200 font-semibold'
                                  : 'bg-slate-900 border border-slate-800 text-slate-200'
                              }`}
                              title={`${item.name} (${item.cost}g)${isBoot ? ' · Mandatory Boot Item' : ' · Unique Item'}\n${item.notes || ''}`}
                            >
                              <span>{item.name}</span>
                              {isBoot && (
                                <span className="text-[9px] uppercase px-1 py-0.2 bg-cyan-900/90 text-cyan-300 rounded">
                                  Boot
                                </span>
                              )}
                            </span>
                          );
                        })}
                      </div>
                    </td>

                    {/* Total Cost */}
                    <td className="px-3 py-3 font-semibold text-amber-300 tabular-nums">
                      {build.totalCost.toLocaleString()}g
                    </td>

                    {/* Provenance Status Label */}
                    <td className="px-3 py-3">
                      <span className="text-[11px] text-slate-400 block max-w-xs leading-tight">
                        {build.provenanceLabel}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onToggleCompare(build.buildId)}
                          className={`px-2.5 py-1 rounded text-[11px] transition-colors border ${
                            isCompared
                              ? 'bg-cyan-900/60 border-cyan-500 text-cyan-200'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                          }`}
                          title="Add to 3-way build comparison"
                        >
                          <BarChart2 className="w-3 h-3 inline mr-1" />
                          {isCompared ? 'Compared' : 'Compare'}
                        </button>
                        <button
                          onClick={() => {
                            onSelectBuild(build);
                            onViewSimulator(build);
                          }}
                          className="px-2.5 py-1 bg-cyan-600/90 hover:bg-cyan-500 text-white rounded text-[11px] font-semibold transition-colors"
                          title="Inspect timeline and combat log"
                        >
                          <Eye className="w-3 h-3 inline mr-1" />
                          Inspect
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
