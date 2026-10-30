import React from 'react';
import { X, Layers, TrendingUp, DollarSign, Activity } from 'lucide-react';
import { BuildEvaluation } from '../types';

interface BuildComparisonTrayProps {
  builds: BuildEvaluation[];
  onRemoveBuild: (buildId: string) => void;
  onClearAll: () => void;
}

export const BuildComparisonTray: React.FC<BuildComparisonTrayProps> = ({
  builds,
  onRemoveBuild,
  onClearAll
}) => {
  if (builds.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-10 text-center space-y-3">
        <Layers className="w-8 h-8 text-slate-600 mx-auto" />
        <h3 className="text-sm font-mono font-bold text-slate-300">
          No Builds Selected for Comparison
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Click the "Compare" button on any build in the Top 6-Slot Configurations table to compare up to 3 builds side-by-side.
        </p>
      </div>
    );
  }

  const maxDps = Math.max(...builds.map(b => b.meanDps), 1);

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-5 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h3 className="text-base font-bold font-mono text-slate-100">
            Side-by-Side 3-Way Build Comparison ({builds.length}/3)
          </h3>
        </div>
        <button
          onClick={onClearAll}
          className="text-xs font-mono text-slate-400 hover:text-rose-400 transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className={`grid grid-cols-1 ${builds.length === 2 ? 'md:grid-cols-2' : builds.length === 3 ? 'md:grid-cols-3' : ''} gap-4`}>
        {builds.map(build => {
          const sim = build.singleRunResult;
          const dpsRatio = (build.meanDps / maxDps) * 100;
          const dpsPerThousandGold = Math.round((build.meanDps / (build.totalCost / 1000)) * 10) / 10;

          const totalDmg = sim.totalDamage || 1;
          const physPct = Math.round((sim.damageByType.physical / totalDmg) * 100);
          const magPct = Math.round((sim.damageByType.magical / totalDmg) * 100);
          const purePct = Math.round((sim.damageByType.pure / totalDmg) * 100);

          return (
            <div
              key={build.buildId}
              className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-4 relative flex flex-col justify-between"
            >
              <button
                onClick={() => onRemoveBuild(build.buildId)}
                className="absolute top-3 right-3 text-slate-500 hover:text-slate-200 transition-colors"
                title="Remove from comparison"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-3">
                {/* Header DPS */}
                <div>
                  <div className="text-xs font-mono text-slate-400 uppercase">
                    Mean DPS (95% CI)
                  </div>
                  <div className="text-2xl font-bold font-mono text-cyan-300 tabular-nums">
                    {build.meanDps.toLocaleString()}
                    <span className="text-xs font-normal text-slate-400 ml-1">DPS</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 tabular-nums">
                    [{build.confidenceInterval95[0]} - {build.confidenceInterval95[1]}] · σ={build.stdDev}
                  </div>
                </div>

                {/* Relative DPS Bar */}
                <div className="space-y-1">
                  <div className="w-full bg-slate-900 rounded h-1.5 overflow-hidden">
                    <div
                      className="bg-cyan-500 h-full rounded"
                      style={{ width: `${dpsRatio}%` }}
                    />
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 text-right">
                    {Math.round(dpsRatio)}% of highest contender
                  </div>
                </div>

                {/* Items in inventory */}
                <div className="space-y-1.5">
                  <span className="text-xs font-mono text-slate-400 block">
                    Inventory Items:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {build.items.map((item, idx) => {
                      const isBoot = item.isBoot || item.uniqueGroup === 'boots';
                      return (
                        <span
                          key={idx}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono ${
                            isBoot
                              ? 'bg-cyan-950/80 border border-cyan-500/80 text-cyan-200 font-semibold'
                              : 'bg-slate-900 border border-slate-800 text-slate-200'
                          }`}
                        >
                          <span>{item.name}</span>
                          {isBoot && (
                            <span className="text-[9px] uppercase px-1 bg-cyan-900 text-cyan-300 rounded">
                              Boot
                            </span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Gold & Efficiency */}
                <div className="p-2.5 bg-slate-900/60 border border-slate-850 rounded space-y-1 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Gold Cost:</span>
                    <span className="text-amber-300 font-bold tabular-nums">
                      {build.totalCost.toLocaleString()}g
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Gold Efficiency:</span>
                    <span className="text-cyan-400 font-semibold tabular-nums">
                      {dpsPerThousandGold} DPS / 1k gold
                    </span>
                  </div>
                </div>

                {/* Damage Breakdown Type */}
                <div className="space-y-1 text-xs font-mono">
                  <span className="text-slate-400 block">Damage Type Composition:</span>
                  <div className="flex h-2.5 rounded overflow-hidden bg-slate-900">
                    <div
                      style={{ width: `${physPct}%` }}
                      className="bg-red-500"
                      title={`Physical: ${physPct}%`}
                    />
                    <div
                      style={{ width: `${magPct}%` }}
                      className="bg-cyan-400"
                      title={`Magical: ${magPct}%`}
                    />
                    <div
                      style={{ width: `${purePct}%` }}
                      className="bg-amber-400"
                      title={`Pure: ${purePct}%`}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 pt-0.5">
                    <span className="text-red-400">Phys {physPct}%</span>
                    <span className="text-cyan-400">Magic {magPct}%</span>
                    <span className="text-amber-400">Pure {purePct}%</span>
                  </div>
                </div>

                {/* Combat Stats */}
                <div className="space-y-1 text-xs font-mono border-t border-slate-850 pt-2 text-slate-400">
                  <div className="flex justify-between">
                    <span>Attack Speed:</span>
                    <span className="text-slate-200 tabular-nums">
                      {sim.statsSummary.finalAttackSpeed} ({sim.statsSummary.attacksPerSecond} APS)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Attacks Executed:</span>
                    <span className="text-slate-200 tabular-nums">{sim.attackCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Crits Procced:</span>
                    <span className="text-slate-200 tabular-nums">{sim.critCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mana Consumed:</span>
                    <span className="text-slate-200 tabular-nums">{sim.manaSpent} MP</span>
                  </div>
                </div>
              </div>

              {/* Provenance note */}
              <div className="pt-3 border-t border-slate-850 text-[10px] font-mono text-slate-500">
                {build.provenanceLabel}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
