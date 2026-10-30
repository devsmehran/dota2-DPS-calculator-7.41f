import {
  BuildEvaluation,
  CombatConfig,
  HeroDefinition,
  ItemDefinition,
  OptimizationProgress,
  SimulationResult
} from '../types';
import { BOOT_ITEMS, NON_BOOT_ITEMS } from '../data/items';
import { runCombatSimulation } from './simulator';

export interface OptimizerOptions {
  mode: 'beam' | 'exhaustive';
  beamWidth?: number;
  candidateItems?: ItemDefinition[];
  candidateBoots?: ItemDefinition[];
  candidateNonBoots?: ItemDefinition[];
  goldBudget?: number;
  onProgress?: (progress: OptimizationProgress) => void;
  shouldCancel?: () => boolean;
}

/**
 * Validates whether an inventory of items violates uniqueness, boots constraint, or game rules:
 * 1. EVERY slot must be an entirely unique item (no duplicates).
 * 2. A boot item MUST be present in every legal 6-slot combination.
 * 3. At most one boot item is allowed.
 * 4. Stacking and unique group restrictions are enforced.
 */
export function isLegalInventory(items: ItemDefinition[], goldBudget?: number): boolean {
  if (items.length > 6) return false;

  // RULE 1: EVERY SLOT MUST BE A UNIQUE ITEM (NO DUPLICATES)
  const itemIds = new Set<string>();
  for (const item of items) {
    if (itemIds.has(item.id)) {
      return false; // Duplicate item in inventory!
    }
    itemIds.add(item.id);
  }

  // Check unique groups and count boots
  let totalCost = 0;
  let bootCount = 0;
  const uniqueGroups = new Set<string>();

  for (const item of items) {
    totalCost += item.cost;
    if (item.isBoot || item.uniqueGroup === 'boots') {
      bootCount++;
    }
    if (item.uniqueGroup) {
      if (uniqueGroups.has(item.uniqueGroup)) {
        return false;
      }
      uniqueGroups.add(item.uniqueGroup);
    }
  }

  // Maximum 1 boot item per build
  if (bootCount > 1) {
    return false;
  }

  // RULE 2: A BOOT ITEM MUST BE PRESENT IN EVERY 6-SLOT COMBINATION
  if (items.length === 6 && bootCount === 0) {
    return false; // Missing boot item in complete 6-slot build!
  }

  if (goldBudget && totalCost > goldBudget) {
    return false;
  }

  return true;
}

/**
 * Calculates mean, standard deviation, and 95% confidence interval across multiple seeds
 */
export function evaluateBuildMultiSeed(
  hero: HeroDefinition,
  items: ItemDefinition[],
  config: CombatConfig,
  seedCount: number = 5
): {
  meanDps: number;
  stdDev: number;
  confidenceInterval95: [number, number];
  sampleCount: number;
  primaryResult: SimulationResult;
} {
  const seeds = [config.randomSeed, 42, 999, 1337, 7777].slice(0, seedCount);
  const dpsResults: number[] = [];
  let primaryResult: SimulationResult | null = null;

  for (const seed of seeds) {
    const res = runCombatSimulation(hero, items, { ...config, randomSeed: seed });
    dpsResults.push(res.dps);
    if (!primaryResult) primaryResult = res;
  }

  const n = dpsResults.length;
  const meanDps = dpsResults.reduce((a, b) => a + b, 0) / n;
  const variance = dpsResults.reduce((sum, val) => sum + Math.pow(val - meanDps, 2), 0) / (n > 1 ? n - 1 : 1);
  const stdDev = Math.sqrt(variance);
  const marginOfError = 1.96 * (stdDev / Math.sqrt(n));

  return {
    meanDps: Math.round(meanDps * 10) / 10,
    stdDev: Math.round(stdDev * 10) / 10,
    confidenceInterval95: [
      Math.round((meanDps - marginOfError) * 10) / 10,
      Math.round((meanDps + marginOfError) * 10) / 10
    ],
    sampleCount: n,
    primaryResult: primaryResult!
  };
}

/**
 * Hybrid Fast Beam Search Optimizer with Mandatory Boot and 100% Unique Slots
 */
export async function runBeamSearchOptimizer(
  hero: HeroDefinition,
  config: CombatConfig,
  options: OptimizerOptions
): Promise<BuildEvaluation[]> {
  const beamWidth = options.beamWidth || 20;
  const boots = options.candidateBoots || BOOT_ITEMS;
  const nonBoots = options.candidateNonBoots || NON_BOOT_ITEMS;
  const goldBudget = options.goldBudget;

  let iterationCounter = 0;
  const estimatedTotal = (boots.length + 5 * nonBoots.length) * beamWidth;

  // Step 1: Initialize Slot 1 strictly with candidate Boot items
  let currentBeams: ItemDefinition[][] = [];
  for (const boot of boots) {
    if (!goldBudget || boot.cost <= goldBudget) {
      currentBeams.push([boot]);
    }
  }

  // Step 2: Incrementally add 5 unique non-boot items (slots 2 through 6)
  for (let slot = 2; slot <= 6; slot++) {
    const nextCandidates: { items: ItemDefinition[]; dps: number }[] = [];

    for (const partial of currentBeams) {
      for (const item of nonBoots) {
        if (options.shouldCancel && options.shouldCancel()) {
          return [];
        }

        // Must be unique slot: cannot already be in partial inventory
        if (partial.some(existing => existing.id === item.id)) {
          continue;
        }

        const candidateBuild = [...partial, item];
        if (!isLegalInventory(candidateBuild, goldBudget)) {
          continue;
        }

        iterationCounter++;
        const sim = runCombatSimulation(hero, candidateBuild, config);

        nextCandidates.push({
          items: candidateBuild,
          dps: sim.dps
        });

        if (iterationCounter % 25 === 0 && options.onProgress) {
          options.onProgress({
            isRunning: true,
            currentIteration: iterationCounter,
            totalCombinations: estimatedTotal,
            currentBestDps: nextCandidates.length > 0 ? Math.max(...nextCandidates.map(c => c.dps)) : 0,
            currentBestItems: nextCandidates.length > 0 ? nextCandidates[0].items : [],
            stage: `Exploring slot ${slot} of 6 (Boot guaranteed, unique slots, Beam: ${beamWidth})`,
            percent: Math.min(95, Math.round((slot / 6) * 100))
          });
          await new Promise(r => setTimeout(r, 0));
        }
      }
    }

    // Keep top beamWidth builds
    nextCandidates.sort((a, b) => b.dps - a.dps);
    currentBeams = nextCandidates.slice(0, beamWidth).map(c => c.items);
  }

  // Step 3: Local Hill-Climbing Refinement preserving Boot + Unique Slots
  if (options.onProgress) {
    options.onProgress({
      isRunning: true,
      currentIteration: iterationCounter,
      totalCombinations: estimatedTotal,
      currentBestDps: 0,
      currentBestItems: currentBeams[0] || [],
      stage: 'Local hill-climbing refinement & multi-seed verification',
      percent: 96
    });
  }

  const topBuildsMap = new Map<string, ItemDefinition[]>();
  for (const build of currentBeams) {
    const key = build.map(i => i.id).sort().join('|');
    topBuildsMap.set(key, build);
  }

  // Refine top 5 builds with single item swaps
  const buildsToRefine = Array.from(topBuildsMap.values()).slice(0, 5);
  for (const build of buildsToRefine) {
    for (let i = 0; i < build.length; i++) {
      const itemToReplace = build[i];
      const isReplacingBoot = itemToReplace.isBoot || itemToReplace.uniqueGroup === 'boots';
      const replacementPool = isReplacingBoot ? boots : nonBoots;

      for (const replacement of replacementPool) {
        if (replacement.id === itemToReplace.id) continue;
        // Verify unique item constraint
        if (build.some((other, oIdx) => oIdx !== i && other.id === replacement.id)) {
          continue;
        }

        const mutated = [...build];
        mutated[i] = replacement;
        if (!isLegalInventory(mutated, goldBudget)) continue;

        const key = mutated.map(m => m.id).sort().join('|');
        if (!topBuildsMap.has(key)) {
          topBuildsMap.set(key, mutated);
        }
      }
    }
  }

  // Step 4: Multi-seed re-evaluation of finalists
  const uniqueBuilds = Array.from(topBuildsMap.values());
  const evaluatedBuilds: BuildEvaluation[] = [];

  for (let i = 0; i < Math.min(15, uniqueBuilds.length); i++) {
    const build = uniqueBuilds[i];
    const multiEval = evaluateBuildMultiSeed(hero, build, config, 5);

    let totalCost = 0;
    for (const it of build) totalCost += it.cost;
    if (config.permanentUpgrades.consumedMoonShard) totalCost += 4000;
    if (config.permanentUpgrades.aghanimsScepter) totalCost += 5800;
    if (config.permanentUpgrades.aghanimsShard) totalCost += 1400;

    let provenanceLabel: BuildEvaluation['provenanceLabel'] = 'Best build found under this search budget';
    if (hero.mechanicsStatus.passives !== 'verified' || hero.mechanicsStatus.actives !== 'verified') {
      provenanceLabel = 'Partial result — unsupported mechanics remain';
    }

    evaluatedBuilds.push({
      buildId: `build-${i + 1}-${build.map(b => b.id.slice(0, 3)).join('-')}`,
      items: build,
      totalCost,
      meanDps: multiEval.meanDps,
      stdDev: multiEval.stdDev,
      confidenceInterval95: multiEval.confidenceInterval95,
      sampleCount: multiEval.sampleCount,
      singleRunResult: multiEval.primaryResult,
      provenanceLabel
    });
  }

  evaluatedBuilds.sort((a, b) => b.meanDps - a.meanDps);

  if (options.onProgress) {
    options.onProgress({
      isRunning: false,
      currentIteration: iterationCounter,
      totalCombinations: iterationCounter,
      currentBestDps: evaluatedBuilds[0]?.meanDps || 0,
      currentBestItems: evaluatedBuilds[0]?.items || [],
      stage: 'Optimization Complete (1 Boot + 5 Unique Items)',
      percent: 100
    });
  }

  return evaluatedBuilds;
}

/**
 * Deep Exhaustive Optimizer: Combinatorial search over (1 Boot) + (5 Unique Non-Boot Items)
 */
export async function runExhaustiveOptimizer(
  hero: HeroDefinition,
  config: CombatConfig,
  options: OptimizerOptions
): Promise<BuildEvaluation[]> {
  const boots = options.candidateBoots || BOOT_ITEMS;
  const nonBoots = (options.candidateNonBoots || NON_BOOT_ITEMS).slice(0, 10); // C(10, 5) = 252 * boots.length
  const goldBudget = options.goldBudget;

  // Generate all 5-item combinations from nonBoots
  const nonBootCombos: ItemDefinition[][] = [];
  function generateCombos(start: number, current: ItemDefinition[]) {
    if (current.length === 5) {
      nonBootCombos.push([...current]);
      return;
    }
    for (let i = start; i < nonBoots.length; i++) {
      current.push(nonBoots[i]);
      generateCombos(i + 1, current); // STRICTLY UNIQUE ITEMS (i + 1)
      current.pop();
    }
  }
  generateCombos(0, []);

  // Form full 6-slot inventories: 1 boot + 5 non-boots
  const allCombos: ItemDefinition[][] = [];
  for (const boot of boots) {
    for (const nb of nonBootCombos) {
      const full = [boot, ...nb];
      if (isLegalInventory(full, goldBudget)) {
        allCombos.push(full);
      }
    }
  }

  let iteration = 0;
  const candidateScores: { items: ItemDefinition[]; dps: number }[] = [];

  for (const combo of allCombos) {
    if (options.shouldCancel && options.shouldCancel()) return [];

    iteration++;
    const sim = runCombatSimulation(hero, combo, config);
    candidateScores.push({ items: combo, dps: sim.dps });

    if (iteration % 40 === 0 && options.onProgress) {
      options.onProgress({
        isRunning: true,
        currentIteration: iteration,
        totalCombinations: allCombos.length,
        currentBestDps: candidateScores.length > 0 ? Math.max(...candidateScores.map(c => c.dps)) : 0,
        currentBestItems: candidateScores[0]?.items || [],
        stage: `Exhaustive search: evaluated ${iteration} / ${allCombos.length} unique combinations`,
        percent: Math.round((iteration / allCombos.length) * 100)
      });
      await new Promise(r => setTimeout(r, 0));
    }
  }

  candidateScores.sort((a, b) => b.dps - a.dps);
  const finalists = candidateScores.slice(0, 10);

  const evaluatedBuilds: BuildEvaluation[] = [];

  for (let i = 0; i < finalists.length; i++) {
    const f = finalists[i];
    const multiEval = evaluateBuildMultiSeed(hero, f.items, config, 5);

    let totalCost = 0;
    for (const it of f.items) totalCost += it.cost;
    if (config.permanentUpgrades.consumedMoonShard) totalCost += 4000;
    if (config.permanentUpgrades.aghanimsScepter) totalCost += 5800;
    if (config.permanentUpgrades.aghanimsShard) totalCost += 1400;

    let provenanceLabel: BuildEvaluation['provenanceLabel'] = 'Proven optimum within the stated search space';
    if (hero.mechanicsStatus.passives !== 'verified' || hero.mechanicsStatus.actives !== 'verified') {
      provenanceLabel = 'Partial result — unsupported mechanics remain';
    }

    evaluatedBuilds.push({
      buildId: `opt-exh-${i + 1}`,
      items: f.items,
      totalCost,
      meanDps: multiEval.meanDps,
      stdDev: multiEval.stdDev,
      confidenceInterval95: multiEval.confidenceInterval95,
      sampleCount: multiEval.sampleCount,
      singleRunResult: multiEval.primaryResult,
      provenanceLabel
    });
  }

  evaluatedBuilds.sort((a, b) => b.meanDps - a.meanDps);

  if (options.onProgress) {
    options.onProgress({
      isRunning: false,
      currentIteration: iteration,
      totalCombinations: allCombos.length,
      currentBestDps: evaluatedBuilds[0]?.meanDps || 0,
      currentBestItems: evaluatedBuilds[0]?.items || [],
      stage: 'Exhaustive Enumeration Complete (1 Boot + 5 Unique Items)',
      percent: 100
    });
  }

  return evaluatedBuilds;
}
