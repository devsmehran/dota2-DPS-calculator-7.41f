import React, { useState } from 'react';
import { Download, Filter, Terminal, Search } from 'lucide-react';
import { CombatEvent } from '../types';

interface EventLogViewerProps {
  events: CombatEvent[];
}

export const EventLogViewer: React.FC<EventLogViewerProps> = ({ events }) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredEvents = events.filter(e => {
    if (filterType !== 'all' && e.type !== filterType) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        e.source.toLowerCase().includes(term) ||
        e.detail.toLowerCase().includes(term) ||
        (e.damageType && e.damageType.toLowerCase().includes(term))
      );
    }
    return true;
  });

  const exportLogJson = () => {
    const blob = new Blob([JSON.stringify(events, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dota2-combat-event-log-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-5 space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <h3 className="text-base font-bold font-mono text-slate-100">
            Discrete-Event Combat Simulation Log ({events.length} events)
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {events.length > 0 && (
            <button
              onClick={exportLogJson}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-slate-300 bg-slate-950 hover:bg-slate-800 rounded border border-slate-800 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export Log JSON</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 text-xs font-mono">
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search log events, procs, damage types..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
          {['all', 'attack_hit', 'proc', 'spell_cast', 'item_activated'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-2.5 py-1 rounded capitalize whitespace-nowrap transition-colors ${
                filterType === type
                  ? 'bg-cyan-600 text-white font-semibold'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {type.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Log Feed */}
      {filteredEvents.length === 0 ? (
        <div className="p-10 text-center bg-slate-950/40 rounded border border-slate-850 text-xs font-mono text-slate-500">
          No events matching the current filter.
        </div>
      ) : (
        <div className="max-h-96 overflow-y-auto space-y-1.5 font-mono text-xs pr-1">
          {filteredEvents.map(evt => {
            const isDamage = !!evt.damage;
            let badgeColor = 'text-slate-400';
            if (evt.damageType === 'physical') badgeColor = 'text-red-400';
            if (evt.damageType === 'magical') badgeColor = 'text-cyan-400';
            if (evt.damageType === 'pure') badgeColor = 'text-amber-400';

            return (
              <div
                key={evt.id}
                className="flex items-center justify-between p-2 bg-slate-950/70 border border-slate-850/80 rounded hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 text-[11px] tabular-nums w-12 shrink-0">
                    {evt.timestamp.toFixed(2)}s
                  </span>
                  <span className="font-semibold text-slate-300 shrink-0">
                    [{evt.source}]
                  </span>
                  <span className="text-slate-400">
                    {evt.detail}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-4">
                  {isDamage && (
                    <span className={`font-bold tabular-nums ${badgeColor}`}>
                      +{evt.damage} {evt.damageType}
                    </span>
                  )}
                  {evt.remainingMana !== undefined && (
                    <span className="text-slate-500 text-[11px] tabular-nums">
                      MP: {evt.remainingMana}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
