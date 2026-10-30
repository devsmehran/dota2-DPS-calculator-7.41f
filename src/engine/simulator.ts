import {
  CombatConfig,
  CombatEvent,
  DamageType,
  HeroDefinition,
  ItemDefinition,
  SimulationResult
} from '../types';
import { calculateArmorMultiplier, calculateHeroStats, calculateMagicResMultiplier } from './formulas';
import { PRDTracker, SeededPRNG } from './prng';

interface ScheduledEvent {
  timestamp: number;
  type: 'attack_hit' | 'spell_cast' | 'item_activate' | 'buff_expire' | 'tick' | 'soul_rend_pop';
  data?: any;
}

export function runCombatSimulation(
  hero: HeroDefinition,
  items: ItemDefinition[],
  config: CombatConfig
): SimulationResult {
  const prng = new SeededPRNG(config.randomSeed);
  const baseStats = calculateHeroStats(hero, items, config);

  // Target initialization
  const effectiveTargetArmor = config.target.armor - baseStats.armorReduction;
  const armorMultiplier = calculateArmorMultiplier(effectiveTargetArmor);
  const magicResMultiplier = calculateMagicResMultiplier(config.target.magicResistance);

  let targetCurrentHp = config.target.maxHp;
  let timeToKill: number | null = null;

  // PRD trackers for each crit source
  const critTrackers = baseStats.critSources.map(cs => ({
    ...cs,
    tracker: new PRDTracker(cs.chance)
  }));

  // PRD trackers for procs
  const procTrackers = baseStats.procs.map(p => ({
    ...p,
    tracker: new PRDTracker(p.chance),
    lastProcTime: -999
  }));

  // Hero resource and state tracking
  let currentMana = baseStats.maxMana;
  let manaSpent = 0;
  let currentTime = 0;
  let nextAttackTime = 0;

  // Active buffs / debuffs
  const activeBuffs = {
    bloodthornActive: false,
    bloodthornDamageAccumulator: 0,
    mantaActive: false,
    mantaExpireTime: 0,
    swiftBlinkActive: false,
    godsStrengthActive: false,
    fierySoulStacks: hero.id === 'lina' ? (config.facetId === 'thermal_runaway' ? 7 : 4) : 0,
    revenantsBroochToggled: items.some(i => i.id === 'revenants_brooch')
  };

  // Cooldown tracking
  const cooldowns: Record<string, number> = {};

  // Counters and breakdown
  let totalDamage = 0;
  let attackCount = 0;
  let critCount = 0;
  let procCount = 0;
  let spellsCastCount = 0;

  const damageByType: { physical: number; magical: number; pure: number } = {
    physical: 0,
    magical: 0,
    pure: 0
  };

  const damageBySource: {
    auto_attack: number;
    critical: number;
    passive_proc: number;
    spell: number;
    item_active: number;
    illusion: number;
  } = {
    auto_attack: 0,
    critical: 0,
    passive_proc: 0,
    spell: 0,
    item_active: 0,
    illusion: 0
  };

  const events: CombatEvent[] = [];
  const timeline: { timestamp: number; cumulativeDamage: number; currentDps: number; mana: number }[] = [];

  const eventQueue: ScheduledEvent[] = [];

  function schedule(event: ScheduledEvent) {
    eventQueue.push(event);
    eventQueue.sort((a, b) => a.timestamp - b.timestamp);
  }

  // Pre-combat buffs for Full-Kit mode
  if (config.mode === 'full_kit') {
    if (hero.id === 'sven') {
      activeBuffs.godsStrengthActive = true;
      cooldowns['gods_strength'] = 110;
      events.push({
        id: `event-${events.length}`,
        timestamp: 0,
        type: 'spell_cast',
        source: 'Sven',
        detail: "God's Strength activated: +200% Base Attack Damage"
      });
    }

    // Check for Manta Style activation
    const manta = items.find(i => i.id === 'manta_style');
    if (manta && currentMana >= 125) {
      currentMana -= 125;
      manaSpent += 125;
      activeBuffs.mantaActive = true;
      activeBuffs.mantaExpireTime = 20;
      cooldowns['manta'] = 30;
      events.push({
        id: `event-${events.length}`,
        timestamp: 0,
        type: 'item_activated',
        source: 'Manta Style',
        detail: 'Mirror Image: 2 illusions created (20s duration)'
      });
    }

    // Check for Bloodthorn activation
    const bloodthorn = items.find(i => i.id === 'bloodthorn');
    if (bloodthorn && currentMana >= 100) {
      currentMana -= 100;
      manaSpent += 100;
      activeBuffs.bloodthornActive = true;
      cooldowns['bloodthorn'] = 15;
      schedule({
        timestamp: 5.0,
        type: 'soul_rend_pop'
      });
      events.push({
        id: `event-${events.length}`,
        timestamp: 0,
        type: 'item_activated',
        source: 'Bloodthorn',
        detail: 'Soul Rend applied to target: +60 magic dmg per hit, 1.4x crits'
      });
    }
  }

  // Simulation time step loop (resolution 0.02s = 50 ticks/sec for discrete event precision)
  const dt = 0.02;
  const maxDuration = config.durationSeconds;
  let lastSampleTime = 0;

  while (currentTime <= maxDuration) {
    // Regenerate mana
    currentMana = Math.min(baseStats.maxMana, currentMana + baseStats.manaRegen * dt);

    // Process queued events for current timestamp
    while (eventQueue.length > 0 && eventQueue[0].timestamp <= currentTime) {
      const evt = eventQueue.shift()!;
      if (evt.type === 'soul_rend_pop') {
        activeBuffs.bloodthornActive = false;
        const popRawDamage = activeBuffs.bloodthornDamageAccumulator * 0.30;
        const finalPopDamage = popRawDamage * magicResMultiplier;
        totalDamage += finalPopDamage;
        damageByType.magical += finalPopDamage;
        damageBySource.item_active += finalPopDamage;
        targetCurrentHp -= finalPopDamage;

        events.push({
          id: `event-${events.length}`,
          timestamp: Math.round(currentTime * 100) / 100,
          type: 'item_activated',
          source: 'Bloodthorn',
          detail: `Soul Rend 30% Damage Burst: ${Math.round(finalPopDamage)} magical damage`,
          damage: Math.round(finalPopDamage),
          damageType: 'magical'
        });
      }
    }

    // Hero Spells in Full-Kit mode
    if (config.mode === 'full_kit') {
      if (hero.id === 'lina' && (!cooldowns['laguna'] || cooldowns['laguna'] <= currentTime) && currentMana >= 250) {
        currentMana -= 250;
        manaSpent += 250;
        cooldowns['laguna'] = currentTime + 50;
        spellsCastCount++;
        const spellDamage = 900 * magicResMultiplier;
        totalDamage += spellDamage;
        damageByType.magical += spellDamage;
        damageBySource.spell += spellDamage;
        targetCurrentHp -= spellDamage;
        if (activeBuffs.bloodthornActive) {
          activeBuffs.bloodthornDamageAccumulator += spellDamage;
        }

        events.push({
          id: `event-${events.length}`,
          timestamp: Math.round(currentTime * 100) / 100,
          type: 'spell_cast',
          source: 'Lina',
          detail: `Laguna Blade: ${Math.round(spellDamage)} magical damage`,
          damage: Math.round(spellDamage),
          damageType: 'magical',
          remainingMana: Math.round(currentMana)
        });
      }
    }

    // Check if hero can execute an attack
    if (currentTime >= nextAttackTime) {
      // Calculate dynamic attack damage considering active buffs
      let effectiveBaseDamage = baseStats.baseDamage;
      if (activeBuffs.godsStrengthActive) {
        const bonusMultiplier = config.facetId === 'heavy_hitter' ? 2.0 : 1.6;
        effectiveBaseDamage += baseStats.baseDamage * bonusMultiplier;
      }

      let attackDmg = effectiveBaseDamage + baseStats.bonusDamage;

      // Accuracy vs Evasion calculation
      let hitSuccess = true;
      if (config.target.evasion > 0) {
        const mkb = items.find(i => i.id === 'monkey_king_bar');
        const hasPierced = mkb && prng.next() < 0.80;
        if (!hasPierced) {
          hitSuccess = prng.next() >= config.target.evasion;
        }
      }

      if (hitSuccess) {
        attackCount++;

        // Critical strike check (highest multiplier takes precedence)
        let appliedCritMultiplier = 1.0;
        let critSourceName = '';

        for (const cs of critTrackers) {
          if (cs.tracker.roll(prng)) {
            appliedCritMultiplier = cs.multiplier;
            critSourceName = cs.source;
            break; // highest multiplier took effect
          }
        }

        // Bloodthorn guaranteed 1.4x crit if no higher crit procced
        if (activeBuffs.bloodthornActive && appliedCritMultiplier < 1.4) {
          appliedCritMultiplier = 1.4;
          critSourceName = 'Bloodthorn (Soul Rend)';
        }

        if (appliedCritMultiplier > 1.0) {
          critCount++;
        }

        const rawHitDamage = attackDmg * appliedCritMultiplier;

        // Damage type calculation: Check Revenant's Brooch toggle
        let isMagicalAttack = false;
        if (activeBuffs.revenantsBroochToggled && currentMana >= 75) {
          currentMana -= 75;
          manaSpent += 75;
          isMagicalAttack = true;
        }

        let dealtDamage = 0;
        let dType: DamageType = 'physical';

        if (isMagicalAttack) {
          dealtDamage = rawHitDamage * magicResMultiplier;
          dType = 'magical';
          damageByType.magical += dealtDamage;
        } else {
          dealtDamage = rawHitDamage * armorMultiplier;
          dType = 'physical';
          damageByType.physical += dealtDamage;
        }

        if (appliedCritMultiplier > 1.0) {
          damageBySource.critical += dealtDamage;
        } else {
          damageBySource.auto_attack += dealtDamage;
        }

        totalDamage += dealtDamage;
        targetCurrentHp -= dealtDamage;

        if (activeBuffs.bloodthornActive) {
          activeBuffs.bloodthornDamageAccumulator += dealtDamage;
        }

        // Record attack event
        events.push({
          id: `event-${events.length}`,
          timestamp: Math.round(currentTime * 100) / 100,
          type: appliedCritMultiplier > 1.0 ? 'proc' : 'attack_hit',
          source: hero.name,
          detail: appliedCritMultiplier > 1.0
            ? `Critical Strike (${critSourceName} ${appliedCritMultiplier}x): ${Math.round(dealtDamage)} ${dType}`
            : `Attack Hit: ${Math.round(dealtDamage)} ${dType}`,
          damage: Math.round(dealtDamage),
          damageType: dType,
          remainingMana: Math.round(currentMana)
        });

        // On-hit procs
        for (const proc of procTrackers) {
          if (proc.internalCooldown && currentTime - proc.lastProcTime < proc.internalCooldown) {
            continue;
          }
          if (proc.tracker.roll(prng)) {
            proc.lastProcTime = currentTime;
            procCount++;
            let pDamage = proc.damage;
            if (proc.damageType === 'physical') {
              pDamage *= armorMultiplier;
              damageByType.physical += pDamage;
            } else if (proc.damageType === 'magical') {
              pDamage *= magicResMultiplier;
              damageByType.magical += pDamage;
            } else {
              // Pure
              damageByType.pure += pDamage;
            }

            totalDamage += pDamage;
            damageBySource.passive_proc += pDamage;
            targetCurrentHp -= pDamage;

            if (activeBuffs.bloodthornActive) {
              activeBuffs.bloodthornDamageAccumulator += pDamage;
            }

            events.push({
              id: `event-${events.length}`,
              timestamp: Math.round(currentTime * 100) / 100,
              type: 'proc',
              source: proc.source,
              detail: `Proc: ${Math.round(pDamage)} ${proc.damageType} damage`,
              damage: Math.round(pDamage),
              damageType: proc.damageType
            });
          }
        }

        // Bloodthorn bonus magic damage on hit (+60 magic dmg)
        if (activeBuffs.bloodthornActive) {
          const btProcDamage = 60 * magicResMultiplier;
          totalDamage += btProcDamage;
          damageByType.magical += btProcDamage;
          damageBySource.item_active += btProcDamage;
          targetCurrentHp -= btProcDamage;
          activeBuffs.bloodthornDamageAccumulator += btProcDamage;
        }

        // Illusions damage contribution from Manta Style
        if (activeBuffs.mantaActive && currentTime <= activeBuffs.mantaExpireTime) {
          const illusionMultiplier = hero.isRanged ? 0.25 : 0.33;
          // 2 illusions hit for illusionMultiplier * effectiveBaseDamage (illusions do not gain raw +damage items)
          const illusionDamage = 2 * (effectiveBaseDamage * illusionMultiplier) * armorMultiplier;
          totalDamage += illusionDamage;
          damageByType.physical += illusionDamage;
          damageBySource.illusion += illusionDamage;
          targetCurrentHp -= illusionDamage;
          if (activeBuffs.bloodthornActive) {
            activeBuffs.bloodthornDamageAccumulator += illusionDamage;
          }
        }
      }

      // Schedule next attack interval based on attack speed
      nextAttackTime = currentTime + baseStats.attackInterval;
    }

    // Check finite HP target death
    if (!config.target.isImmortal && targetCurrentHp <= 0 && timeToKill === null) {
      timeToKill = Math.round(currentTime * 100) / 100;
      break;
    }

    // Sample timeline every 0.25s
    if (currentTime - lastSampleTime >= 0.25 || currentTime >= maxDuration) {
      lastSampleTime = currentTime;
      const currentDps = currentTime > 0 ? totalDamage / currentTime : 0;
      timeline.push({
        timestamp: Math.round(currentTime * 10) / 10,
        cumulativeDamage: Math.round(totalDamage),
        currentDps: Math.round(currentDps * 10) / 10,
        mana: Math.round(currentMana)
      });
    }

    currentTime += dt;
  }

  const effectiveDuration = timeToKill !== null ? timeToKill : maxDuration;
  const dps = effectiveDuration > 0 ? totalDamage / effectiveDuration : 0;

  let totalCost = 0;
  for (const item of items) {
    totalCost += item.cost;
  }
  if (config.permanentUpgrades.consumedMoonShard) totalCost += 4000;
  if (config.permanentUpgrades.aghanimsScepter) totalCost += 5800;
  if (config.permanentUpgrades.aghanimsShard) totalCost += 1400;

  return {
    id: `sim-${Date.now()}-${prng.nextInt(100, 999)}`,
    heroId: hero.id,
    items,
    totalCost,
    duration: Math.round(effectiveDuration * 100) / 100,
    totalDamage: Math.round(totalDamage),
    dps: Math.round(dps * 10) / 10,
    attackCount,
    critCount,
    procCount,
    spellsCastCount,
    manaSpent: Math.round(manaSpent),
    damageByType: {
      physical: Math.round(damageByType.physical),
      magical: Math.round(damageByType.magical),
      pure: Math.round(damageByType.pure)
    },
    damageBySource: {
      auto_attack: Math.round(damageBySource.auto_attack),
      critical: Math.round(damageBySource.critical),
      passive_proc: Math.round(damageBySource.passive_proc),
      spell: Math.round(damageBySource.spell),
      item_active: Math.round(damageBySource.item_active),
      illusion: Math.round(damageBySource.illusion)
    },
    timeToKill,
    timeline,
    events,
    statsSummary: {
      finalDamage: baseStats.totalDamage,
      finalAttackSpeed: baseStats.attackSpeed,
      attacksPerSecond: baseStats.attacksPerSecond,
      finalArmor: baseStats.armor,
      finalMana: Math.round(currentMana)
    }
  };
}
