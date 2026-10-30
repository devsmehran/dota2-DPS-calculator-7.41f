import React, { useState } from 'react';
import { Play, Settings2, Shield, Zap, Sparkles, AlertCircle, Ban } from 'lucide-react';
import { CombatConfig, CombatMode, HeroDefinition, TargetDummy } from '../types';
import { HERO_ROSTER } from '../data/heroes';

interface HeroConfigPanelProps {
  config: CombatConfig;
  onChangeConfig: (newConfig: CombatConfig) => void;
  onRunOptimizer: (mode: 'beam' | 'exhaustive') => void;
  onCancelOptimizer: () => void;
  isOptimizing: boolean;
  onOpenTargetEditor: () => void;
}

export const TARGET_PRESETS: Record<string, TargetDummy> = {
  zero_armor: {
    name: 'Zero-Armor Dummy',
    armor: 0,
    magicResistance: 0.0,
    maxHp: 100000,
    isImmortal: true,
    evasion: 0,
    hpRegen: 0
  },
  moderate: {
    name: 'Standard Hero (15 Armor, 25% Magic Res)',
    armor: 15,
    magicResistance: 0.25,
    maxHp: 100000,
    isImmortal: true,
    evasion: 0,
    hpRegen: 0
  },
  high_armor: {
    name: 'High-Armor Tank (40 Armor, 25% Magic Res)',
    armor: 40,
    magicResistance: 0.25,
    maxHp: 100000,
    isImmortal: true,
    evasion: 0,
    hpRegen: 0
  },
  high_magic_res: {
    name: 'Mage Slayer Target (15 Armor, 60% Magic Res)',
    armor: 15,
    magicResistance: 0.60,
    maxHp: 100000,
    isImmortal: true,
    evasion: 0,
    hpRegen: 0
  },
  evasive: {
    name: 'Evasive Target (20 Armor, 35% Evasion)',
    armor: 20,
    magicResistance: 0.25,
    maxHp: 100000,
    isImmortal: true,
    evasion: 0.35,
    hpRegen: 0
  }
};

export const HeroConfigPanel: React.FC<HeroConfigPanelProps> = ({
  config,
  onChangeConfig,
  onRunOptimizer,
  onCancelOptimizer,
  isOptimizing,
  onOpenTargetEditor
}) => {
  const [heroSearch, setHeroSearch] = useState('');
  const [optimizerMode, setOptimizerMode] = useState<'beam' | 'exhaustive'>('beam');

  const selectedHero = HERO_ROSTER.find(h => h.id === config.heroId) || HERO_ROSTER[0];

  const filteredHeroes = HERO_ROSTER.filter(h =>
    h.name.toLowerCase().includes(heroSearch.toLowerCase()) ||
    h.primaryAttribute.toLowerCase().includes(heroSearch.toLowerCase())
  );

  const handleHeroSelect = (hero: HeroDefinition) => {
    onChangeConfig({
      ...config,
      heroId: hero.id,
      facetId: hero.facets[0]?.id || ''
    });
  };

  const handleFacetSelect = (facetId: string) => {
    onChangeConfig({
      ...config,
      facetId
    });
  };

  const handleModeChange = (mode: CombatMode) => {
    onChangeConfig({
      ...config,
      mode
    });
  };

  const handleDurationChange = (duration: number) => {
    onChangeConfig({
      ...config,
      durationSeconds: duration
    });
  };

  const handlePresetSelect = (presetKey: string) => {
    if (TARGET_PRESETS[presetKey]) {
      onChangeConfig({
        ...config,
        target: TARGET_PRESETS[presetKey]
      });
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-5 space-y-6">
      {/* 1. Hero Selection Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
            1. Select Hero & Facet
          </label>
          <div className="text-xs font-mono text-cyan-400">
            Level {config.level} (Standard Benchmark)
          </div>
        </div>

        {/* Hero Dropdown & Search */}
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Search hero (e.g. Lina, Anti-Mage, Sven)..."
            value={heroSearch}
            onChange={e => setHeroSearch(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-1 bg-slate-950/40 rounded border border-slate-850">
            {filteredHeroes.map(h => (
              <button
                key={h.id}
                onClick={() => handleHeroSelect(h)}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded text-left text-xs font-mono transition-colors ${
                  selectedHero.id === h.id
                    ? 'bg-cyan-950/60 border border-cyan-600/70 text-cyan-200'
                    : 'bg-slate-900/60 hover:bg-slate-800/80 text-slate-300 border border-slate-800/60'
                }`}
              >
                <span className="truncate">{h.name}</span>
                <span className="text-[10px] text-slate-500 uppercase shrink-0 ml-1">
                  {h.primaryAttribute.slice(0, 3)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Hero Info & Facet */}
        <div className="mt-3 p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-100">
              {selectedHero.name}
            </span>
            <span className="text-xs font-mono text-cyan-400">
              BAT: {selectedHero.baseAttackTime}s · {selectedHero.isRanged ? 'Ranged' : 'Melee'}
            </span>
          </div>

          <div className="text-xs text-slate-400 font-sans leading-relaxed">
            {selectedHero.specialMechanicsDescription}
          </div>

          {/* Facets Selector */}
          <div className="pt-2 border-t border-slate-850">
            <span className="text-xs font-mono text-slate-400 block mb-1.5">
              Hero Facet:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {selectedHero.facets.map(f => (
                <button
                  key={f.id}
                  onClick={() => handleFacetSelect(f.id)}
                  className={`p-2 rounded text-left text-xs transition-colors border ${
                    config.facetId === f.id
                      ? 'bg-slate-900 border-cyan-500 text-slate-100'
                      : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="font-semibold text-cyan-300">{f.name}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                    {f.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Combat Mode & Window */}
      <div>
        <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold block mb-2">
          2. Combat Mode & Duration
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleModeChange('sustained')}
            className={`p-2.5 rounded text-left border transition-colors ${
              config.mode === 'sustained'
                ? 'bg-cyan-950/40 border-cyan-500 text-cyan-100'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="text-xs font-bold font-mono">A. Sustained</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Attacks + passives only (No spells or actives)
            </div>
          </button>

          <button
            onClick={() => handleModeChange('full_kit')}
            className={`p-2.5 rounded text-left border transition-colors ${
              config.mode === 'full_kit'
                ? 'bg-cyan-950/40 border-cyan-500 text-cyan-100'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="text-xs font-bold font-mono flex items-center gap-1">
              <Zap className="w-3 h-3 text-cyan-400" />
              B. Full-Kit
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Attacks + spells + legal item actives + illusions
            </div>
          </button>

          <button
            onClick={() => handleModeChange('burst')}
            className={`p-2.5 rounded text-left border transition-colors ${
              config.mode === 'burst'
                ? 'bg-cyan-950/40 border-cyan-500 text-cyan-100'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="text-xs font-bold font-mono flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              C. Burst Window
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Maximum damage over short burst interval
            </div>
          </button>
        </div>

        {/* Duration selector */}
        <div className="flex items-center gap-2 mt-3 text-xs font-mono">
          <span className="text-slate-400 shrink-0">Duration:</span>
          {[5, 10, 30, 60, 180].map(sec => (
            <button
              key={sec}
              onClick={() => handleDurationChange(sec)}
              className={`px-2.5 py-1 rounded transition-colors ${
                config.durationSeconds === sec
                  ? 'bg-cyan-600 text-white font-bold'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {sec}s
            </button>
          ))}
        </div>
      </div>

      {/* 3. Target Dummy Selection */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            3. Target Preset & Armor
          </label>
          <button
            onClick={onOpenTargetEditor}
            className="flex items-center gap-1 text-xs font-mono text-cyan-400 hover:text-cyan-300 underline"
          >
            <Settings2 className="w-3 h-3" />
            Customize Target
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {Object.entries(TARGET_PRESETS).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => handlePresetSelect(key)}
              className={`p-2 rounded text-left border text-xs font-mono transition-colors ${
                config.target.name === preset.name
                  ? 'bg-cyan-950/40 border-cyan-500 text-cyan-200'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="font-semibold text-slate-200 truncate">{preset.name}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Armor: {preset.armor} · Res: {Math.round(preset.magicResistance * 100)}%
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Permanent Upgrades & Consumables */}
      <div>
        <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold block mb-2">
          4. Permanent Upgrades (0-Slot Occupied)
        </label>
        <div className="grid grid-cols-3 gap-2 text-xs font-mono">
          <label className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
            config.permanentUpgrades.consumedMoonShard
              ? 'bg-slate-900 border-cyan-500 text-cyan-200'
              : 'bg-slate-950 border-slate-800 text-slate-400'
          }`}>
            <input
              type="checkbox"
              checked={config.permanentUpgrades.consumedMoonShard}
              onChange={e => onChangeConfig({
                ...config,
                permanentUpgrades: {
                  ...config.permanentUpgrades,
                  consumedMoonShard: e.target.checked
                }
              })}
              className="rounded text-cyan-500 focus:ring-0"
            />
            <span>Consumed Moon Shard (+60 AS, 4k gold)</span>
          </label>

          <label className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
            config.permanentUpgrades.aghanimsScepter
              ? 'bg-slate-900 border-cyan-500 text-cyan-200'
              : 'bg-slate-950 border-slate-800 text-slate-400'
          }`}>
            <input
              type="checkbox"
              checked={config.permanentUpgrades.aghanimsScepter}
              onChange={e => onChangeConfig({
                ...config,
                permanentUpgrades: {
                  ...config.permanentUpgrades,
                  aghanimsScepter: e.target.checked
                }
              })}
              className="rounded text-cyan-500 focus:ring-0"
            />
            <span>Aghanim's Synth (+10 stats, +175 HP/MP, 5.8k gold)</span>
          </label>

          <label className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
            config.permanentUpgrades.aghanimsShard
              ? 'bg-slate-900 border-cyan-500 text-cyan-200'
              : 'bg-slate-950 border-slate-800 text-slate-400'
          }`}>
            <input
              type="checkbox"
              checked={config.permanentUpgrades.aghanimsShard}
              onChange={e => onChangeConfig({
                ...config,
                permanentUpgrades: {
                  ...config.permanentUpgrades,
                  aghanimsShard: e.target.checked
                }
              })}
              className="rounded text-cyan-500 focus:ring-0"
            />
            <span>Aghanim's Shard (1.4k gold)</span>
          </label>
        </div>
      </div>

      {/* 5. Optimization Mode and Execution Bar */}
      <div className="pt-2 border-t border-slate-850 flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs font-mono bg-slate-950/70 p-2.5 rounded border border-slate-850">
          <div className="flex items-center gap-2 text-cyan-300">
            <span className="font-semibold uppercase tracking-wider">Inventory Invariants:</span>
            <span className="text-slate-300">Every slot must be an entirely unique item</span>
            <span className="text-slate-600">·</span>
            <span className="text-amber-300 font-semibold">1 Boot item strictly required</span>
          </div>
          <span className="text-slate-500 text-[11px]">0 Neutral Items</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400">Search Strategy:</span>
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded border border-slate-800 text-xs font-mono">
              <button
                onClick={() => setOptimizerMode('beam')}
                className={`px-3 py-1 rounded transition-colors ${
                  optimizerMode === 'beam'
                    ? 'bg-cyan-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Hybrid Beam Search (Fast)
              </button>
              <button
                onClick={() => setOptimizerMode('exhaustive')}
                className={`px-3 py-1 rounded transition-colors ${
                  optimizerMode === 'exhaustive'
                    ? 'bg-cyan-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Deep Exhaustive (Exact)
              </button>
            </div>
          </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {isOptimizing ? (
            <button
              onClick={onCancelOptimizer}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-bold rounded transition-colors w-full sm:w-auto"
            >
              <Ban className="w-4 h-4" />
              <span>Cancel Search</span>
            </button>
          ) : (
            <button
              onClick={() => onRunOptimizer(optimizerMode)}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold rounded transition-colors shadow-lg shadow-cyan-950/40 w-full sm:w-auto"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Run 6-Slot Optimizer</span>
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
  );
};
