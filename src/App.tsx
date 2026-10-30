/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { TopBar } from './components/TopBar';
import { HeroConfigPanel, TARGET_PRESETS } from './components/HeroConfigPanel';
import { TopBuildsTable } from './components/TopBuildsTable';
import { BuildComparisonTray } from './components/BuildComparisonTray';
import { DamageTimelineChart } from './components/DamageTimelineChart';
import { EventLogViewer } from './components/EventLogViewer';
import { DataReadinessDrawer } from './components/DataReadinessDrawer';
import { TargetEditorModal } from './components/TargetEditorModal';
import { HERO_ROSTER } from './data/heroes';
import { BOOT_ITEMS, NON_BOOT_ITEMS } from './data/items';
import { BuildEvaluation, CombatConfig, OptimizationProgress } from './types';
import { runBeamSearchOptimizer, runExhaustiveOptimizer } from './engine/optimizer';
import { runCombatSimulation } from './engine/simulator';

export default function App() {
  const [activeTab, setActiveTab] = useState<'optimizer' | 'simulator' | 'comparison' | 'log'>('optimizer');
  const [isDataReadinessOpen, setIsDataReadinessOpen] = useState(false);
  const [isTargetEditorOpen, setIsTargetEditorOpen] = useState(false);

  // Core Simulation Configuration
  const [config, setConfig] = useState<CombatConfig>({
    heroId: 'lina',
    level: 30,
    facetId: 'thermal_runaway',
    mode: 'sustained',
    durationSeconds: 30,
    target: TARGET_PRESETS['moderate'],
    permanentUpgrades: {
      consumedMoonShard: true,
      aghanimsScepter: false,
      aghanimsShard: false
    },
    randomSeed: 1337
  });

  // Optimization State
  const [builds, setBuilds] = useState<BuildEvaluation[]>([]);
  const [selectedBuild, setSelectedBuild] = useState<BuildEvaluation | null>(null);
  const [comparedBuildIds, setComparedBuildIds] = useState<string[]>([]);
  const [progress, setProgress] = useState<OptimizationProgress>({
    isRunning: false,
    currentIteration: 0,
    totalCombinations: 0,
    currentBestDps: 0,
    currentBestItems: [],
    stage: 'Idle',
    percent: 0
  });

  const shouldCancelRef = useRef<boolean>(false);

  // Initialize with a default baseline run on initial mount
  useEffect(() => {
    runInitialBaseline();
  }, []);

  const runInitialBaseline = async () => {
    const linaHero = HERO_ROSTER[0];
    const results = await runBeamSearchOptimizer(linaHero, config, {
      mode: 'beam',
      beamWidth: 10,
      candidateBoots: BOOT_ITEMS,
      candidateNonBoots: NON_BOOT_ITEMS
    });
    if (results.length > 0) {
      setBuilds(results);
      setSelectedBuild(results[0]);
      setComparedBuildIds([results[0].buildId]);
    }
  };

  const handleRunOptimizer = async (mode: 'beam' | 'exhaustive') => {
    shouldCancelRef.current = false;
    const hero = HERO_ROSTER.find(h => h.id === config.heroId) || HERO_ROSTER[0];

    setProgress({
      isRunning: true,
      currentIteration: 0,
      totalCombinations: 0,
      currentBestDps: 0,
      currentBestItems: [],
      stage: `Initializing ${mode === 'beam' ? 'Hybrid Beam Search' : 'Deep Exhaustive Search'} (1 Boot + 5 Unique Items)...`,
      percent: 0
    });

    try {
      let results: BuildEvaluation[] = [];
      if (mode === 'beam') {
        results = await runBeamSearchOptimizer(hero, config, {
          mode: 'beam',
          beamWidth: 16,
          candidateBoots: BOOT_ITEMS,
          candidateNonBoots: NON_BOOT_ITEMS,
          shouldCancel: () => shouldCancelRef.current,
          onProgress: p => setProgress(p)
        });
      } else {
        results = await runExhaustiveOptimizer(hero, config, {
          mode: 'exhaustive',
          candidateBoots: BOOT_ITEMS,
          candidateNonBoots: NON_BOOT_ITEMS.slice(0, 10),
          shouldCancel: () => shouldCancelRef.current,
          onProgress: p => setProgress(p)
        });
      }

      if (results.length > 0) {
        setBuilds(results);
        setSelectedBuild(results[0]);
        setComparedBuildIds([results[0].buildId]);
        setActiveTab('optimizer');
      }
    } catch (err) {
      console.error('Optimization error:', err);
    } finally {
      setProgress(prev => ({ ...prev, isRunning: false }));
    }
  };

  const handleCancelOptimizer = () => {
    shouldCancelRef.current = true;
    setProgress(prev => ({ ...prev, isRunning: false, stage: 'Cancelled by user' }));
  };

  const handleToggleCompare = (buildId: string) => {
    setComparedBuildIds(prev => {
      if (prev.includes(buildId)) {
        return prev.filter(id => id !== buildId);
      } else {
        if (prev.length >= 3) {
          // Keep at most 3 builds in comparison tray
          return [...prev.slice(1), buildId];
        }
        return [...prev, buildId];
      }
    });
  };

  const comparedBuilds = builds.filter(b => comparedBuildIds.includes(b.buildId));

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30">
      {/* 1. Universal Top Bar */}
      <TopBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openDataReadiness={() => setIsDataReadinessOpen(true)}
      />

      {/* Main Lab Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Section 1: Hero, Scenario & Optimization Parameters */}
        <HeroConfigPanel
          config={config}
          onChangeConfig={newCfg => setConfig(newCfg)}
          onRunOptimizer={handleRunOptimizer}
          onCancelOptimizer={handleCancelOptimizer}
          isOptimizing={progress.isRunning}
          onOpenTargetEditor={() => setIsTargetEditorOpen(true)}
        />

        {/* Section 2: Tabbed Stage (Optimizer, Simulator, Comparison, Log) */}
        <div>
          {activeTab === 'optimizer' && (
            <TopBuildsTable
              builds={builds}
              selectedBuild={selectedBuild}
              onSelectBuild={b => setSelectedBuild(b)}
              comparedBuildIds={comparedBuildIds}
              onToggleCompare={handleToggleCompare}
              progress={progress}
              onViewSimulator={b => {
                setSelectedBuild(b);
                setActiveTab('simulator');
              }}
            />
          )}

          {activeTab === 'simulator' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-mono text-slate-400">
                  Inspecting Build:{' '}
                  <span className="text-cyan-300 font-bold">
                    {selectedBuild ? selectedBuild.items.map(i => i.name).join(' + ') : 'None'}
                  </span>
                </span>
                <button
                  onClick={() => setActiveTab('optimizer')}
                  className="text-xs font-mono text-cyan-400 hover:text-cyan-300 underline"
                >
                  ← Back to Builds Table
                </button>
              </div>
              <DamageTimelineChart result={selectedBuild?.singleRunResult || null} />
            </div>
          )}

          {activeTab === 'comparison' && (
            <BuildComparisonTray
              builds={comparedBuilds}
              onRemoveBuild={handleToggleCompare}
              onClearAll={() => setComparedBuildIds([])}
            />
          )}

          {activeTab === 'log' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-mono text-slate-400">
                  Showing event stream for:{' '}
                  <span className="text-cyan-300 font-bold">
                    {selectedBuild ? selectedBuild.items.map(i => i.name).join(' + ') : 'None'}
                  </span>
                </span>
                <button
                  onClick={() => setActiveTab('optimizer')}
                  className="text-xs font-mono text-cyan-400 hover:text-cyan-300 underline"
                >
                  ← Back to Builds Table
                </button>
              </div>
              <EventLogViewer events={selectedBuild?.singleRunResult.events || []} />
            </div>
          )}
        </div>
      </main>

      {/* Target Editor Modal */}
      <TargetEditorModal
        isOpen={isTargetEditorOpen}
        onClose={() => setIsTargetEditorOpen(false)}
        currentTarget={config.target}
        onSaveTarget={target => setConfig({ ...config, target })}
      />

      {/* Data-Readiness & Patch 7.41f Provenance Drawer */}
      <DataReadinessDrawer
        isOpen={isDataReadinessOpen}
        onClose={() => setIsDataReadinessOpen(false)}
      />

      {/* Clean, quiet footer */}
      <footer className="border-t border-slate-800/80 px-6 py-4 text-center text-xs font-mono text-slate-500">
        Dota 2 Maximum DPS Lab · Patch 7.41f Verified Simulation Engine · All neutral items strictly excluded
      </footer>
    </div>
  );
}
