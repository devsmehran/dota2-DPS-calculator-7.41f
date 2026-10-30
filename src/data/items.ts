import { ItemDefinition } from '../types';

export const BOOT_ITEMS: ItemDefinition[] = [
  {
    id: 'power_treads_agi',
    name: 'Power Treads (Agility)',
    cost: 1400,
    isBoot: true,
    uniqueGroup: 'boots',
    bonusAgility: 10,
    bonusAttackSpeed: 25,
    notes: '+45 Movement Speed, +10 Agility (+10 Dmg/AS for Agility, +7 Dmg for Universal), +25 Attack Speed.'
  },
  {
    id: 'power_treads_str',
    name: 'Power Treads (Strength)',
    cost: 1400,
    isBoot: true,
    uniqueGroup: 'boots',
    bonusStrength: 10,
    bonusAttackSpeed: 25,
    notes: '+45 Movement Speed, +10 Strength (+10 Dmg for Strength, +7 Dmg for Universal), +25 Attack Speed.'
  },
  {
    id: 'power_treads_int',
    name: 'Power Treads (Intelligence)',
    cost: 1400,
    isBoot: true,
    uniqueGroup: 'boots',
    bonusIntelligence: 10,
    bonusAttackSpeed: 25,
    notes: '+45 Movement Speed, +10 Intelligence (+10 Dmg for Int, +7 Dmg for Universal), +25 Attack Speed.'
  },
  {
    id: 'phase_boots',
    name: 'Phase Boots',
    cost: 1500,
    isBoot: true,
    uniqueGroup: 'boots',
    bonusDamage: 18,
    bonusArmor: 4,
    notes: '+45 Movement Speed, +18 Damage (+12 for ranged), +4 Armor, Active: Phase burst.'
  },
  {
    id: 'boots_of_bearing',
    name: 'Boots of Bearing',
    cost: 4075,
    isBoot: true,
    uniqueGroup: 'boots',
    bonusStrength: 20,
    bonusAttackSpeed: 20,
    activeAbility: {
      name: 'Endurance Aura Active',
      cooldown: 30,
      duration: 6,
      manaCost: 0,
      damageMultiplier: 1.0
    },
    notes: '+65 MS, +20 Strength, +20 AS. Active Endurance grants +50 Attack Speed and 1.5s unslowable.'
  },
  {
    id: 'boots_of_travel_2',
    name: 'Boots of Travel 2',
    cost: 4000,
    isBoot: true,
    uniqueGroup: 'boots',
    notes: '+110 Movement Speed and global teleportation.'
  },
  {
    id: 'guardian_greaves',
    name: 'Guardian Greaves',
    cost: 5150,
    isBoot: true,
    uniqueGroup: 'boots',
    bonusArmor: 4,
    bonusMana: 250,
    notes: '+50 Movement Speed, +4 Armor, +250 Mana, Mend active.'
  }
];

export const NON_BOOT_ITEMS: ItemDefinition[] = [
  {
    id: 'daedalus',
    name: 'Daedalus',
    cost: 5200, // Patch 7.41f adjustment
    bonusDamage: 88,
    critChance: 0.30,
    critMultiplier: 2.25,
    notes: 'Primary physical burst item. Critical Strike uses PRD (C = 0.0847). Non-stacking highest multiplier precedence.'
  },
  {
    id: 'monkey_king_bar',
    name: 'Monkey King Bar',
    cost: 4975,
    bonusDamage: 40,
    bonusAttackSpeed: 45,
    accuracyChance: 0.80,
    procChance: 0.80,
    procDamage: 70,
    procDamageType: 'pure',
    notes: 'Pierce proc pierces evasion 80% of the time and inflicts 70 bonus pure damage.'
  },
  {
    id: 'divine_rapier',
    name: 'Divine Rapier',
    cost: 5600,
    bonusDamage: 350,
    notes: 'Highest raw physical damage item in Dota 2. No defensive stats.'
  },
  {
    id: 'butterfly',
    name: 'Butterfly',
    cost: 5450,
    bonusAgility: 35,
    bonusAttackSpeed: 30,
    bonusDamage: 25,
    activeAbility: {
      name: 'Flutter',
      cooldown: 25,
      duration: 6,
      manaCost: 0
    },
    notes: 'High agility scaling item. Grants 35% evasion.'
  },
  {
    id: 'bloodthorn',
    name: 'Bloodthorn',
    cost: 6625,
    bonusDamage: 15,
    bonusAttackSpeed: 50,
    bonusIntelligence: 15,
    bonusManaRegen: 6.0,
    bonusMana: 300,
    activeAbility: {
      name: 'Soul Rend',
      cooldown: 15,
      duration: 5,
      manaCost: 100,
      extraDamagePerAttack: 60, // 60 magical damage per auto attack during active
      critChance: 1.0,         // All attacks crit for 1.4x during soul rend
      critMultiplier: 1.40,
      magicDamageAmp: 0.30     // 30% of total damage taken during silence dealt at end
    },
    notes: 'Target receives 60 bonus magic damage per attack, attacks cannot miss and crit for 1.4x, pops 30% accumulated damage at end.'
  },
  {
    id: 'revenants_brooch',
    name: 'Revenant\'s Brooch',
    cost: 4900,
    bonusIntelligence: 45,
    bonusArmor: 8,
    bonusMana: 300,
    activeAbility: {
      name: 'Phantom Province',
      cooldown: 0,
      duration: 15,
      manaCost: 75, // Consumes 75 mana per attack while toggled on
    },
    notes: 'Active converts physical auto-attack damage to Magical damage, bypassing high armor targets at 75 mana per swing.'
  },
  {
    id: 'desolator',
    name: 'Desolator',
    cost: 3500,
    bonusDamage: 50,
    armorReduction: 6,
    notes: 'Corruption reduces target armor by 6 for 7 seconds. Amplifies all physical damage.'
  },
  {
    id: 'eye_of_skadi',
    name: 'Eye of Skadi',
    cost: 5300,
    bonusAllAttributes: 22,
    bonusDamage: 0,
    notes: '+22 to all attributes (+22 Str, +22 Agi, +22 Int), +220 HP, +220 Mana. Universal heroes gain +39.6 base damage.'
  },
  {
    id: 'nullifier',
    name: 'Nullifier',
    cost: 4375,
    bonusDamage: 75,
    bonusArmor: 10,
    activeAbility: {
      name: 'Nullify',
      cooldown: 10,
      duration: 5,
      manaCost: 75
    },
    notes: 'Continuous dispelling target and slowing. High raw physical damage and armor.'
  },
  {
    id: 'manta_style',
    name: 'Manta Style',
    cost: 4600,
    bonusStrength: 10,
    bonusAgility: 26,
    bonusIntelligence: 10,
    bonusAttackSpeed: 12,
    activeAbility: {
      name: 'Mirror Image',
      cooldown: 30,
      duration: 20,
      manaCost: 125,
      damageMultiplier: 0.25 // Patch 7.41f: 25% ranged illusion damage
    },
    notes: 'Spawns 2 illusions lasting 20s. Patch 7.41f: Ranged illusions deal 25% damage (down from 28%).'
  },
  {
    id: 'moon_shard',
    name: 'Moon Shard',
    cost: 4000,
    bonusAttackSpeed: 140,
    notes: 'Provides highest non-attribute attack speed in Dota 2 (+140 AS).'
  },
  {
    id: 'assault_cuirass',
    name: 'Assault Cuirass',
    cost: 5125,
    bonusAttackSpeed: 60, // 30 item + 30 aura
    bonusArmor: 15,       // 10 item + 5 aura
    armorReduction: 5,    // -5 armor aura to enemy
    notes: '+60 total Attack Speed, +15 Armor, -5 enemy Armor aura.'
  },
  {
    id: 'silver_edge',
    name: 'Silver Edge',
    cost: 5450,
    bonusDamage: 52,
    bonusAttackSpeed: 35,
    critChance: 0.30,
    critMultiplier: 1.60,
    activeAbility: {
      name: 'Shadow Walk Break',
      cooldown: 20,
      duration: 14,
      manaCost: 75,
      extraDamagePerAttack: 175
    },
    notes: 'Grants +52 damage, +35 AS, 30% chance for 1.6x crit, and +175 physical damage opener.'
  },
  {
    id: 'disperser',
    name: 'Disperser',
    cost: 5700,
    bonusAgility: 40,
    bonusIntelligence: 10,
    bonusDamage: 8,
    procChance: 1.0,
    procDamage: 40,
    procDamageType: 'physical',
    notes: 'Burns 40 mana and deals 40 physical damage per attack to mana-bearing targets.'
  },
  {
    id: 'abyssal_blade',
    name: 'Abyssal Blade',
    cost: 6250,
    uniqueGroup: 'basher',
    bonusDamage: 25,
    bonusStrength: 10,
    procChance: 0.25,
    procDamage: 120,
    procDamageType: 'physical',
    activeAbility: {
      name: 'Overwhelm',
      cooldown: 35,
      duration: 2.0,
      manaCost: 75
    },
    notes: '25% chance for 120 physical damage bash (melee) / 10% (ranged). Internal cooldown 1.5s.'
  },
  {
    id: 'swift_blink',
    name: 'Swift Blink',
    cost: 6800,
    bonusAgility: 35,
    activeAbility: {
      name: 'Swift Blink Surge',
      cooldown: 15,
      duration: 6,
      manaCost: 0,
      damageMultiplier: 1.0
    },
    notes: 'Active grants +35 extra Agility (+35 damage, +35 attack speed for agi heroes) for 6 seconds.'
  },
  {
    id: 'khanda',
    name: 'Khanda',
    cost: 5000,
    bonusDamage: 50,
    bonusAllAttributes: 8,
    critChance: 0.30,
    critMultiplier: 1.60,
    activeAbility: {
      name: 'Empower Spell Proc',
      cooldown: 6,
      duration: 0,
      manaCost: 0,
      extraDamagePerAttack: 100
    },
    notes: '30% chance for 1.6x crit. Casting targeted spells deals 100 + 75% base attack damage.'
  },
  {
    id: 'radiance',
    name: 'Radiance',
    cost: 4700,
    bonusDamage: 55,
    notes: 'Burn aura inflicts 60 magic damage per second to nearby enemy targets.'
  },
  {
    id: 'mjollnir',
    name: 'Mjollnir',
    cost: 5600,
    bonusDamage: 24,
    bonusAttackSpeed: 70,
    procChance: 0.20,
    procDamage: 180,
    procDamageType: 'magical',
    notes: 'Chain Lightning 20% chance to discharge 180 magical damage.'
  },
  {
    id: 'satanic',
    name: 'Satanic',
    cost: 5050,
    bonusStrength: 25,
    bonusDamage: 38,
    notes: '+25 Strength (+25 dmg for Str, +17.5 for Universal), +38 Damage, Unholy Rage lifesteal.'
  },
  {
    id: 'hurricane_pike',
    name: 'Hurricane Pike',
    cost: 4550, // Patch 7.41f adjustment
    bonusStrength: 15,
    bonusAgility: 20,
    bonusIntelligence: 15,
    notes: '+15 Str, +20 Agi, +15 Int, +150 attack range for ranged heroes.'
  },
  {
    id: 'heart_of_tarrasque',
    name: 'Heart of Tarrasque',
    cost: 5300, // Patch 7.41f adjustment
    bonusStrength: 40,
    notes: '+40 Strength (+40 dmg for Str, +28 for Universal) and +250 HP.'
  }
];

export const DOTA_ITEMS: ItemDefinition[] = [
  ...BOOT_ITEMS,
  ...NON_BOOT_ITEMS
];

export const PERMANENT_CONSUMABLES = {
  consumedMoonShard: {
    name: 'Consumed Moon Shard',
    cost: 4000,
    bonusAttackSpeed: 60,
    notes: 'Consumes a Moon Shard permanently, freeing an inventory slot while granting +60 Attack Speed.'
  },
  aghanimsScepter: {
    name: 'Aghanim\'s Scepter (Synth)',
    cost: 5800, // 4200 recipe + 1600 blessing
    bonusAllAttributes: 10,
    bonusHealth: 175,
    bonusMana: 175,
    notes: 'Alchemist blessing or consumed recipe: frees slot, keeps +10 all attributes, +175 HP/Mana, and hero upgrade.'
  },
  aghanimsShard: {
    name: 'Aghanim\'s Shard',
    cost: 1400,
    notes: 'Permanent upgrade buff augmenting hero innate or secondary skill.'
  }
};
