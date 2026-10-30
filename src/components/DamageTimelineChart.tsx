import React from 'react';
import { Activity, ShieldAlert, Zap, Clock } from 'lucide-react';
import { SimulationResult } from '../types';

interface DamageTimelineChartProps {
  result: SimulationResult | null;
}

export const DamageTimelineChart: React.FC<DamageTimelineChartProps> = ({ result }) => {
  if (!result || result.timeline.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-10 text-center space-y-3">
        <Activity className="w-8 h-8 text-slate-600 mx-auto" />
        <h3 className="text-sm font-mono font-bold text-slate-300">
          No Simulation Data Available
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Run an optimization or click "Inspect" on any build to view the continuous damage timeline and source breakdown.
        </p>
      </div>
    );
  }

  const timeline = result.timeline;
  const maxDamage = Math.max(...timeline.map(t => t.cumulativeDamage), 1);
  const maxDps = Math.max(...timeline.map(t => t.currentDps), 1);
  const totalDuration = timeline[timeline.length - 1].timestamp || 1;

  // Build SVG path points for cumulative damage and DPS curves
  const width = 600;
  const height = 180;
  const padding = 30;

  const damagePoints = timeline.map(t => {
    const x = padding + (t.timestamp / totalDuration) * (width - 2 * padding);
    const y = height - padding - (t.cumulativeDamage / maxDamage) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(' ');

  const dpsPoints = timeline.map(t => {
    const x = padding + (t.timestamp / totalDuration) * (width - 2 * padding);
    const y = height - padding - (t.currentDps / maxDps) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(' ');

  const totalDmg = result.totalDamage || 1;
  const sourceKeys = Object.entries(result.damageBySource).filter(([_, val]) => val > 0);

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-5 space-y-6">
      {/* KPI metric strips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
          <span className="text-[11px] font-mono text-slate-400 uppercase block">
            Mean Simulated DPS
          </span>
          <div className="text-xl font-bold font-mono text-cyan-300 mt-1 tabular-nums">
            {result.dps.toLocaleString()}
            <span className="text-xs font-normal text-slate-400 ml-1">DPS</span>
          </div>
        </div>

        <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
          <span className="text-[11px] font-mono text-slate-400 uppercase block">
            Total Damage Output
          </span>
          <div className="text-xl font-bold font-mono text-slate-100 mt-1 tabular-nums">
            {result.totalDamage.toLocaleString()}
          </div>
        </div>

        <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
          <span className="text-[11px] font-mono text-slate-400 uppercase block">
            Attacks & Crits
          </span>
          <div className="text-xl font-bold font-mono text-slate-100 mt-1 tabular-nums">
            {result.attackCount} <span className="text-xs text-slate-400">({result.critCount} crits)</span>
          </div>
        </div>

        <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
          <span className="text-[11px] font-mono text-slate-400 uppercase block">
            Final Attack Speed & BAT
          </span>
          <div className="text-xl font-bold font-mono text-slate-100 mt-1 tabular-nums">
            {result.statsSummary.finalAttackSpeed} <span className="text-xs text-slate-400">({result.statsSummary.attacksPerSecond} APS)</span>
          </div>
        </div>
      </div>

      {/* SVG Timeline Chart */}
      <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-4">
            <span className="text-slate-300 font-semibold">Continuous Combat Timeline</span>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-2.5 h-0.5 bg-cyan-400 inline-block" />
                Cumulative Damage ({maxDamage.toLocaleString()})
              </span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2.5 h-0.5 bg-amber-400 inline-block" />
                Instantaneous DPS ({Math.round(maxDps).toLocaleString()})
              </span>
            </div>
          </div>
          <span className="text-slate-500">
            Window: 0s – {totalDuration}s
          </span>
        </div>

        <div className="w-full overflow-hidden">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44">
            {/* Grid lines */}
            <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#1e293b" strokeDasharray="3 3" />
            <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#1e293b" strokeDasharray="3 3" />
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#334155" />
            <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#334155" />

            {/* Cumulative Damage Line (Cyan) */}
            <polyline
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2.5"
              points={damagePoints}
            />

            {/* Instantaneous DPS Line (Amber) */}
            <polyline
              fill="none"
              stroke="#f59e0b"
              strokeWidth="1.5"
              strokeDasharray="4 2"
              points={dpsPoints}
            />

            {/* Time labels */}
            <text x={padding} y={height - 8} fill="#64748b" fontSize="10" fontFamily="monospace">0s</text>
            <text x={width / 2} y={height - 8} fill="#64748b" fontSize="10" textAnchor="middle" fontFamily="monospace">{Math.round(totalDuration / 2)}s</text>
            <text x={width - padding} y={height - 8} fill="#64748b" fontSize="10" textAnchor="end" fontFamily="monospace">{totalDuration}s</text>
          </svg>
        </div>
      </div>

      {/* Damage Breakdown: Types and Sources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
        {/* By Damage Type */}
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
          <span className="text-slate-300 font-semibold block">Damage by Classification</span>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-400">Physical Damage:</span>
                <span className="text-red-400 font-bold tabular-nums">
                  {result.damageByType.physical.toLocaleString()} ({Math.round((result.damageByType.physical / totalDmg) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-slate-900 rounded h-1.5 overflow-hidden">
                <div
                  className="bg-red-500 h-full"
                  style={{ width: `${(result.damageByType.physical / totalDmg) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-400">Magical Damage:</span>
                <span className="text-cyan-400 font-bold tabular-nums">
                  {result.damageByType.magical.toLocaleString()} ({Math.round((result.damageByType.magical / totalDmg) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-slate-900 rounded h-1.5 overflow-hidden">
                <div
                  className="bg-cyan-400 h-full"
                  style={{ width: `${(result.damageByType.magical / totalDmg) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-400">Pure Damage:</span>
                <span className="text-amber-400 font-bold tabular-nums">
                  {result.damageByType.pure.toLocaleString()} ({Math.round((result.damageByType.pure / totalDmg) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-slate-900 rounded h-1.5 overflow-hidden">
                <div
                  className="bg-amber-400 h-full"
                  style={{ width: `${(result.damageByType.pure / totalDmg) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* By Damage Source */}
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
          <span className="text-slate-300 font-semibold block">Damage by Source</span>
          <div className="space-y-2">
            {sourceKeys.map(([key, val]) => (
              <div key={key}>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400 capitalize">{key.replace('_', ' ')}:</span>
                  <span className="text-slate-200 font-bold tabular-nums">
                    {val.toLocaleString()} ({Math.round((val / totalDmg) * 100)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-900 rounded h-1.5 overflow-hidden">
                  <div
                    className="bg-slate-300 h-full"
                    style={{ width: `${(val / totalDmg) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
