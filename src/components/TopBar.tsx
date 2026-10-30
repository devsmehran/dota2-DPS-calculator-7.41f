import React from 'react';
import { ShieldCheck, Cpu } from 'lucide-react';

interface TopBarProps {
  activeTab: 'optimizer' | 'simulator' | 'comparison' | 'log';
  setActiveTab: (tab: 'optimizer' | 'simulator' | 'comparison' | 'log') => void;
  openDataReadiness: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  setActiveTab,
  openDataReadiness
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-slate-950 border-b border-slate-800 shrink-0">
      {/* Zone 1: Brand wordmark (single element, clean display) */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded bg-cyan-950 border border-cyan-800/80 flex items-center justify-center text-cyan-400">
          <Cpu className="w-4 h-4" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-base font-bold font-mono tracking-tight text-slate-100 whitespace-nowrap">
            Dota 2 Maximum DPS Lab
          </span>
          <span className="text-xs font-mono text-cyan-400/90 tracking-wider">
            Patch 7.41f
          </span>
        </div>
      </div>

      {/* Zone 2: Navigation links (single line, no pills) */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
        <button
          onClick={() => setActiveTab('optimizer')}
          className={`transition-colors whitespace-nowrap py-1 ${
            activeTab === 'optimizer'
              ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold'
              : 'hover:text-slate-200'
          }`}
        >
          Item Optimizer
        </button>
        <button
          onClick={() => setActiveTab('simulator')}
          className={`transition-colors whitespace-nowrap py-1 ${
            activeTab === 'simulator'
              ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold'
              : 'hover:text-slate-200'
          }`}
        >
          Damage Breakdown
        </button>
        <button
          onClick={() => setActiveTab('comparison')}
          className={`transition-colors whitespace-nowrap py-1 ${
            activeTab === 'comparison'
              ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold'
              : 'hover:text-slate-200'
          }`}
        >
          Build Comparison
        </button>
        <button
          onClick={() => setActiveTab('log')}
          className={`transition-colors whitespace-nowrap py-1 ${
            activeTab === 'log'
              ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold'
              : 'hover:text-slate-200'
          }`}
        >
          Combat Event Log
        </button>
      </nav>

      {/* Zone 3: Primary Action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={openDataReadiness}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-mono font-medium text-cyan-300 bg-slate-900 border border-cyan-800/80 rounded hover:bg-slate-800 hover:border-cyan-500 transition-colors whitespace-nowrap"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>Patch 7.41f Data-Readiness</span>
        </button>
      </div>
    </header>
  );
};
