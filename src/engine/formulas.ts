import { HeroDefinition, ItemDefinition, CombatConfig, DamageType } from '../types';

export interface CalculatedHeroStats {
  strength: number;
  agility: number;
  intelligence: number;
  baseDamage: number;
  bonusDamage: number;
  totalDamage: number;
  attackSpeed: number; // 20 - 700
  bat: number;
  attacksPerSecond: number;
  attackInterval: number;
  attackPoint: number;
  armor: number;
  magicResistance: number;
  maxMana: number;
  manaRegen: number;
  maxHp: number;
  critSources: { chance: number; multiplier: number; source: string }[];
  procs: {
    chance: number;
    damage: number;
    damageType: DamageType;
    source: string;
    accuracy?: number;
    internalCooldown?: number;
  }[];
  armorReduction: number;
}

/**
 * Physical armor reduction multiplier:
 * Multiplier = 1 - (0.06 * armor) / (1 + 0.06 * |armor|)
 * Amplification cap is 2.0 (100% bonus damage) for negative armor.
 */
export function calculateArmorMultiplier(armor: number): number {
  if (armor >= 0) {
    return 1 - (0.06 * armor) / (1 + 0.06 * armor);
  } else {
    // Negative armor amplifies damage: Multiplier = 1 - (0.06 * armor) / (1 - 0.06 * armor)
    const multiplier = 1 - (0.06 * armor) / (1 - 0.06 * armor);
    return Math.min(2.0, multiplier);
  }
}

/**
 * Magic resistance multiplier:
 * Multiplier = Product(1 - r_i)
 */
export function calculateMagicResMultiplier(magicRes: number): number {
  return Math.max(0, 1 - magicRes);
}

/**
 * Compute hero attributes, damage, attack speed, and derived stats at a specified level
 */
export function calculateHeroStats(
  hero: HeroDefinition,
  items: ItemDefinition[],
  config: CombatConfig
): CalculatedHeroStats {
  const level = config.level;
  const levelDiff = Math.max(0, level - 1);

  // Level 30 talent/attribute bonus: +2 to all stats per level after max skills (approx +14 to all stats at lvl 30)
  const bonusAttributePoints = level >= 30 ? 14 : Math.max(0, Math.min(14, (level - 16) * 2));

  let str = hero.baseStrength + levelDiff * hero.strengthGain + bonusAttributePoints;
  let agi = hero.baseAgility + levelDiff * hero.agilityGain + bonusAttributePoints;
  let int = hero.baseIntelligence + levelDiff * hero.intelligenceGain + bonusAttributePoints;

  // Add Item attributes
  for (const item of items) {
    str += (item.bonusStrength || 0) + (item.bonusAllAttributes || 0);
    agi += (item.bonusAgility || 0) + (item.bonusAllAttributes || 0);
    int += (item.bonusIntelligence || 0) + (item.bonusAllAttributes || 0);
  }

  // Add Permanent Upgrades
  if (config.permanentUpgrades.aghanimsScepter) {
    str += 10;
    agi += 10;
    int += 10;
  }

  // Base Damage computation
  const avgBaseWeaponDamage = (hero.baseDamageMin + hero.baseDamageMax) / 2;
  let baseDamageFromAttributes = 0;
  if (hero.primaryAttribute === 'strength') {
    baseDamageFromAttributes = str;
  } else if (hero.primaryAttribute === 'agility') {
    baseDamageFromAttributes = agi;
  } else if (hero.primaryAttribute === 'intelligence') {
    baseDamageFromAttributes = int;
  } else if (hero.primaryAttribute === 'universal') {
    baseDamageFromAttributes = (str + agi + int) * 0.7;
  }

  let totalBaseDamage = avgBaseWeaponDamage + baseDamageFromAttributes;

  // Bonus Raw Damage from items
  let bonusDamage = 0;
  for (const item of items) {
    bonusDamage += item.bonusDamage || 0;
  }

  // Attack Speed computation:
  // Base 100 AS + Agility + Item AS + Consumed Moon Shard
  let rawAttackSpeed = 100 + agi;
  for (const item of items) {
    rawAttackSpeed += item.bonusAttackSpeed || 0;
  }
  if (config.permanentUpgrades.consumedMoonShard) {
    rawAttackSpeed += 60;
  }

  // Hero Facet bonuses
  const activeFacet = hero.facets.find(f => f.id === config.facetId);
  if (activeFacet) {
    if (activeFacet.bonusDamage) {
      bonusDamage += activeFacet.bonusDamage;
    }
    if (activeFacet.bonusAttackSpeed) {
      rawAttackSpeed += activeFacet.bonusAttackSpeed;
    }
    if (activeFacet.multiplier) {
      totalBaseDamage *= activeFacet.multiplier;
    }
  }

  // Clamped Attack Speed between 20 (floor) and 700 (ceiling)
  const attackSpeed = Math.min(700, Math.max(20, Math.round(rawAttackSpeed)));

  // BAT (Base Attack Time)
  const bat = hero.baseAttackTime;
  const attacksPerSecond = attackSpeed / (100 * bat);
  const attackInterval = (100 * bat) / attackSpeed;

  // Frontswing animation scaled by attack speed
  // Attack point is compressed as attack speed increases: attackPoint / (attackSpeed / 100)
  const attackPoint = hero.attackPoint / (attackSpeed / 100);

  // Armor: Base Armor + Agi / 6 + Item Armor
  let armor = hero.baseArmor + agi / 6;
  for (const item of items) {
    armor += item.bonusArmor || 0;
  }

  // Magic Resistance
  const magicResistance = hero.baseMagicResistance;

  // Mana pool and Mana regen
  let maxMana = 75 + int * 12;
  let manaRegen = 0.5 + int * 0.05;
  for (const item of items) {
    maxMana += item.bonusMana || 0;
    manaRegen += item.bonusManaRegen || 0;
  }
  if (config.permanentUpgrades.aghanimsScepter) {
    maxMana += 175;
  }

  // Max HP
  const maxHp = 120 + str * 22;

  // Crits and On-Hit Procs
  const critSources: { chance: number; multiplier: number; source: string }[] = [];
  const procs: {
    chance: number;
    damage: number;
    damageType: DamageType;
    source: string;
    accuracy?: number;
    internalCooldown?: number;
  }[] = [];

  let armorReduction = 0;

  // Hero innate criticals / procs
  if (hero.id === 'phantom_assassin') {
    // Coup de Grace: 15% chance for 4.5x crit (or Methodical facet)
    if (config.facetId === 'methodical') {
      critSources.push({ chance: 1 / 6, multiplier: 3.25, source: 'Coup de Grace (Methodical)' });
    } else {
      critSources.push({ chance: 0.15, multiplier: 4.50, source: 'Coup de Grace' });
    }
  } else if (hero.id === 'juggernaut') {
    critSources.push({ chance: 0.35, multiplier: 1.90, source: 'Blade Dance' });
  } else if (hero.id === 'anti_mage') {
    // 7.41f Mana Break: 44 mana burned * 0.65 = 28.6 physical damage
    procs.push({
      chance: 1.0,
      damage: 28.6,
      damageType: 'physical',
      source: 'Mana Break (7.41f)'
    });
  }

  // Item Crits & Procs
  for (const item of items) {
    if (item.critChance && item.critMultiplier) {
      critSources.push({
        chance: item.critChance,
        multiplier: item.critMultiplier,
        source: item.name
      });
    }
    if (item.procChance && item.procDamage && item.procDamageType) {
      procs.push({
        chance: item.procChance,
        damage: item.procDamage,
        damageType: item.procDamageType,
        source: item.name,
        accuracy: item.accuracyChance,
        internalCooldown: item.id === 'abyssal_blade' ? 1.5 : 0
      });
    }
    if (item.armorReduction) {
      armorReduction += item.armorReduction;
    }
  }

  // Sort critical strike sources by multiplier descending
  critSources.sort((a, b) => b.multiplier - a.multiplier);

  return {
    strength: Math.round(str * 10) / 10,
    agility: Math.round(agi * 10) / 10,
    intelligence: Math.round(int * 10) / 10,
    baseDamage: Math.round(totalBaseDamage * 10) / 10,
    bonusDamage: Math.round(bonusDamage * 10) / 10,
    totalDamage: Math.round((totalBaseDamage + bonusDamage) * 10) / 10,
    attackSpeed,
    bat,
    attacksPerSecond: Math.round(attacksPerSecond * 100) / 100,
    attackInterval,
    attackPoint,
    armor: Math.round(armor * 10) / 10,
    magicResistance,
    maxMana: Math.round(maxMana),
    manaRegen: Math.round(manaRegen * 10) / 10,
    maxHp: Math.round(maxHp),
    critSources,
    procs,
    armorReduction
  };
}
