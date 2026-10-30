import { HeroDefinition } from '../types';

export const HERO_ROSTER: HeroDefinition[] = [
  {
    id: 'lina',
    name: 'Lina',
    primaryAttribute: 'intelligence',
    baseStrength: 20,
    strengthGain: 2.4,
    baseAgility: 23,
    agilityGain: 2.4,
    baseIntelligence: 30,
    intelligenceGain: 3.8,
    baseDamageMin: 21,
    baseDamageMax: 29,
    baseAttackTime: 1.6, // Fast BAT
    attackPoint: 0.35,
    attackBackswing: 0.70,
    isRanged: true,
    projectileSpeed: 1000,
    baseArmor: 0.5,
    baseMagicResistance: 0.25,
    movementSpeed: 290,
    turnRate: 0.6,
    facets: [
      {
        id: 'thermal_runaway',
        name: 'Thermal Runaway',
        description: 'Casting Laguna Blade supercharges Lina, granting maximum Fiery Soul stacks for 5 seconds.',
        effectType: 'speed',
        bonusAttackSpeed: 196
      },
      {
        id: 'slow_burn',
        name: 'Slow Burn',
        description: 'Lina spells inflict 60% of their damage over time but gain +15% total spell amplification.',
        effectType: 'damage',
        multiplier: 1.15
      }
    ],
    mechanicsStatus: {
      passives: 'verified',
      actives: 'verified',
      facets: 'verified',
      talents: 'verified'
    },
    specialMechanicsDescription: 'Patch 7.41f verified: Fiery Soul provides 7/14/21/28 attack speed per stack (max 7 stacks = +196 AS with Level 25 talent +1 stack = 8 stacks = +224 AS, stack duration 16s). Laguna Blade deals 900 magic damage (pure with Aghanim).'
  },
  {
    id: 'anti_mage',
    name: 'Anti-Mage',
    primaryAttribute: 'agility',
    baseStrength: 19,
    strengthGain: 1.6,
    baseAgility: 24,
    agilityGain: 2.8,
    baseIntelligence: 12,
    intelligenceGain: 1.8,
    baseDamageMin: 29,
    baseDamageMax: 33,
    baseAttackTime: 1.4, // Exceptional 1.4 BAT
    attackPoint: 0.30,
    attackBackswing: 0.60,
    isRanged: false,
    projectileSpeed: 0,
    baseArmor: -1.0,
    baseMagicResistance: 0.25,
    movementSpeed: 310,
    turnRate: 0.6,
    facets: [
      {
        id: 'magebane_mirror',
        name: 'Magebane\'s Mirror',
        description: 'Counterspell reflects spells and inflicts bonus magic damage.',
        effectType: 'utility'
      },
      {
        id: 'mana_thirst',
        name: 'Mana Thirst',
        description: 'Anti-Mage gains +2.5% physical attack damage per missing 10% enemy mana pool.',
        effectType: 'damage',
        bonusDamage: 35
      }
    ],
    mechanicsStatus: {
      passives: 'verified',
      actives: 'verified',
      facets: 'verified',
      talents: 'verified'
    },
    specialMechanicsDescription: 'Patch 7.41f verified: Mana Break burns 44 mana per hit and converts 65% of burned mana into bonus physical damage (+28.6 physical damage on hit). 1.4 Base Attack Time maximizes attack speed returns.'
  },
  {
    id: 'phantom_assassin',
    name: 'Phantom Assassin',
    primaryAttribute: 'agility',
    baseStrength: 19,
    strengthGain: 2.0,
    baseAgility: 23,
    agilityGain: 3.4,
    baseIntelligence: 15,
    intelligenceGain: 1.4,
    baseDamageMin: 31,
    baseDamageMax: 33,
    baseAttackTime: 1.7,
    attackPoint: 0.30,
    attackBackswing: 0.40,
    isRanged: false,
    projectileSpeed: 0,
    baseArmor: 1.83,
    baseMagicResistance: 0.25,
    movementSpeed: 305,
    turnRate: 0.8,
    facets: [
      {
        id: 'veiled_one',
        name: 'Veiled One',
        description: 'Phantom Strike gains +25% duration and Blur grants extra evasion.',
        effectType: 'speed',
        bonusAttackSpeed: 170
      },
      {
        id: 'methodical',
        name: 'Methodical',
        description: 'Coup de Grace procs deterministically every 6th attack on a target for 325% critical damage.',
        effectType: 'damage',
        multiplier: 3.25
      }
    ],
    mechanicsStatus: {
      passives: 'verified',
      actives: 'verified',
      facets: 'verified',
      talents: 'verified'
    },
    specialMechanicsDescription: 'Coup de Grace: 15% chance for 450% critical damage (or deterministic 6th attack under Methodical facet). Phantom Strike provides +170 bonus Attack Speed for 3 seconds.'
  },
  {
    id: 'juggernaut',
    name: 'Juggernaut',
    primaryAttribute: 'agility',
    baseStrength: 20,
    strengthGain: 2.2,
    baseAgility: 34,
    agilityGain: 2.8,
    baseIntelligence: 14,
    intelligenceGain: 1.4,
    baseDamageMin: 20,
    baseDamageMax: 24,
    baseAttackTime: 1.4, // Exceptional 1.4 BAT
    attackPoint: 0.33,
    attackBackswing: 0.77,
    isRanged: false,
    projectileSpeed: 0,
    baseArmor: 0.5,
    baseMagicResistance: 0.25,
    movementSpeed: 305,
    turnRate: 0.6,
    facets: [
      {
        id: 'bladeform',
        name: 'Bladeform',
        description: 'Builds up to 10 stacks of Bladeform, granting +1.5% agility and +1% movement speed per stack.',
        effectType: 'damage',
        bonusDamage: 45,
        bonusAttackSpeed: 35
      },
      {
        id: 'relentless_duelist',
        name: 'Relentless Duelist',
        description: 'Juggernaut deals 10% bonus damage when attacking enemies from the front.',
        effectType: 'damage',
        multiplier: 1.10
      }
    ],
    mechanicsStatus: {
      passives: 'verified',
      actives: 'verified',
      facets: 'verified',
      talents: 'verified'
    },
    specialMechanicsDescription: 'Blade Dance grants 35% chance for 190% critical strike. Omnislash slashes at 1.5x Juggernaut\'s attack rate with +50 bonus damage per slash for 3.5s.'
  },
  {
    id: 'sven',
    name: 'Sven',
    primaryAttribute: 'strength',
    baseStrength: 22,
    strengthGain: 3.2,
    baseAgility: 21,
    agilityGain: 2.0,
    baseIntelligence: 16,
    intelligenceGain: 1.3,
    baseDamageMin: 41,
    baseDamageMax: 43,
    baseAttackTime: 1.8,
    attackPoint: 0.40,
    attackBackswing: 0.30,
    isRanged: false,
    projectileSpeed: 0,
    baseArmor: 1.5,
    baseMagicResistance: 0.25,
    movementSpeed: 325,
    turnRate: 0.6,
    facets: [
      {
        id: 'heavy_hitter',
        name: 'Heavy Hitter',
        description: 'God\'s Strength provides +200% bonus base damage (up from 160%).',
        effectType: 'damage',
        multiplier: 3.0 // 1 + 2.00
      },
      {
        id: 'wrath_of_god',
        name: 'Wrath of God',
        description: 'Sven base damage is increased by 0.5 per point of total Strength.',
        effectType: 'damage',
        bonusDamage: 75
      }
    ],
    mechanicsStatus: {
      passives: 'verified',
      actives: 'verified',
      facets: 'verified',
      talents: 'verified'
    },
    specialMechanicsDescription: 'God\'s Strength provides +160% (or +200% with Heavy Hitter facet) base damage multiplier for 35s. Warcry provides +15 armor and +45 attack damage at level 25.'
  },
  {
    id: 'muerta',
    name: 'Muerta',
    primaryAttribute: 'intelligence',
    baseStrength: 19,
    strengthGain: 2.0,
    baseAgility: 22,
    agilityGain: 2.0,
    baseIntelligence: 24,
    intelligenceGain: 3.3,
    baseDamageMin: 24,
    baseDamageMax: 32,
    baseAttackTime: 1.6,
    attackPoint: 0.35,
    attackBackswing: 0.70,
    isRanged: true,
    projectileSpeed: 1200,
    baseArmor: -0.5,
    baseMagicResistance: 0.25,
    movementSpeed: 295,
    turnRate: 0.7,
    facets: [
      {
        id: 'dance_of_the_dead',
        name: 'Dance of the Dead',
        description: 'Pierce the Veil grants +65 bonus magical attack damage.',
        effectType: 'damage',
        bonusDamage: 65
      },
      {
        id: 'gunslinger_focus',
        name: 'Ofrenda Gunslinger',
        description: 'Gunslinger has +10% higher proc chance against primary target.',
        effectType: 'damage'
      }
    ],
    mechanicsStatus: {
      passives: 'verified',
      actives: 'verified',
      facets: 'verified',
      talents: 'approximate'
    },
    specialMechanicsDescription: 'Pierce the Veil transforms all attack damage into pure magical damage with +100 bonus damage. Gunslinger grants 50% chance to trigger an additional full attack.'
  },
  {
    id: 'slark',
    name: 'Slark',
    primaryAttribute: 'agility',
    baseStrength: 20,
    strengthGain: 1.9,
    baseAgility: 21,
    agilityGain: 1.7,
    baseIntelligence: 16,
    intelligenceGain: 1.7,
    baseDamageMin: 33,
    baseDamageMax: 39,
    baseAttackTime: 1.7,
    attackPoint: 0.35,
    attackBackswing: 0.70,
    isRanged: false,
    projectileSpeed: 0,
    baseArmor: -0.5,
    baseMagicResistance: 0.25,
    movementSpeed: 300,
    turnRate: 0.7,
    facets: [
      {
        id: 'dark_reef_renegade',
        name: 'Dark Reef Renegade',
        description: 'Essence Shift steals +1 additional agility per attack on hero.',
        effectType: 'damage',
        bonusAttackSpeed: 40
      },
      {
        id: 'leaping_predator',
        name: 'Leaping Predator',
        description: 'Pounce adds 80 physical damage and grants 25 attack speed.',
        effectType: 'speed',
        bonusAttackSpeed: 25
      }
    ],
    mechanicsStatus: {
      passives: 'verified',
      actives: 'verified',
      facets: 'verified',
      talents: 'approximate'
    },
    specialMechanicsDescription: 'Essence Shift: Steals 1 point of each attribute from enemy and converts it into +3 temporary Agility per hit (+3 damage and +3 AS).'
  },
  {
    id: 'drow_ranger',
    name: 'Drow Ranger',
    primaryAttribute: 'agility',
    baseStrength: 16,
    strengthGain: 1.9,
    baseAgility: 20,
    agilityGain: 2.9,
    baseIntelligence: 15,
    intelligenceGain: 1.4,
    baseDamageMin: 29,
    baseDamageMax: 40,
    baseAttackTime: 1.7,
    attackPoint: 0.50,
    attackBackswing: 0.30,
    isRanged: true,
    projectileSpeed: 1250,
    baseArmor: 0.33,
    baseMagicResistance: 0.25,
    movementSpeed: 300,
    turnRate: 0.7,
    facets: [
      {
        id: 'vantage_point',
        name: 'Vantage Point',
        description: 'Attacking from high ground or elevation deals 20% bonus physical damage.',
        effectType: 'damage',
        multiplier: 1.20
      },
      {
        id: 'sidestep',
        name: 'Sidestep',
        description: 'Multishot can be channeled while moving at 50% movement speed.',
        effectType: 'utility'
      }
    ],
    mechanicsStatus: {
      passives: 'verified',
      actives: 'verified',
      facets: 'verified',
      talents: 'approximate'
    },
    specialMechanicsDescription: 'Marksmanship: Grants 40% chance for arrows to pierce base armor entirely and inflict 120 bonus pure damage. Precision Aura provides bonus Agility to Drow.'
  },
  {
    id: 'faceless_void',
    name: 'Faceless Void',
    primaryAttribute: 'agility',
    baseStrength: 20,
    strengthGain: 2.4,
    baseAgility: 19,
    agilityGain: 3.0,
    baseIntelligence: 15,
    intelligenceGain: 1.5,
    baseDamageMin: 37,
    baseDamageMax: 43,
    baseAttackTime: 1.6, // 1.6 BAT
    attackPoint: 0.33,
    attackBackswing: 0.56,
    isRanged: false,
    projectileSpeed: 0,
    baseArmor: 0.83,
    baseMagicResistance: 0.25,
    movementSpeed: 300,
    turnRate: 1.0,
    facets: [
      {
        id: 'chronosphere_mastery',
        name: 'Temporal Mastery',
        description: 'Chronosphere grants +30 bonus attack speed and guarantees free movement.',
        effectType: 'speed',
        bonusAttackSpeed: 30
      },
      {
        id: 'time_dilation_drain',
        name: 'Time Dilation Drain',
        description: 'Enemies affected take damage per cooldown on active abilities.',
        effectType: 'damage'
      }
    ],
    mechanicsStatus: {
      passives: 'verified',
      actives: 'verified',
      facets: 'verified',
      talents: 'approximate'
    },
    specialMechanicsDescription: 'Time Lock: 24% chance on attack to stun for 0.65s and deal 30 bonus magical damage, followed immediately by a second bonus free attack.'
  },
  {
    id: 'sniper',
    name: 'Sniper',
    primaryAttribute: 'agility',
    baseStrength: 19,
    strengthGain: 2.0,
    baseAgility: 27,
    agilityGain: 3.2,
    baseIntelligence: 15,
    intelligenceGain: 1.4,
    baseDamageMin: 13,
    baseDamageMax: 19,
    baseAttackTime: 1.7,
    attackPoint: 0.17, // Fastest attack point in game
    attackBackswing: 0.70,
    isRanged: true,
    projectileSpeed: 3000, // Near-instant 3000 projectile speed
    baseArmor: -0.5,
    baseMagicResistance: 0.25,
    movementSpeed: 285,
    turnRate: 0.7,
    facets: [
      {
        id: 'ghillie_suit',
        name: 'Ghillie Suit',
        description: 'Take Aim grants invisibility and 100% true strike while stationary.',
        effectType: 'damage'
      },
      {
        id: 'heavy_fire',
        name: 'Heavy Fire',
        description: 'Headshot deals +30 additional physical damage and slows enemy turn rate.',
        effectType: 'damage',
        bonusDamage: 30
      }
    ],
    mechanicsStatus: {
      passives: 'verified',
      actives: 'verified',
      facets: 'verified',
      talents: 'approximate'
    },
    specialMechanicsDescription: 'Headshot: 40% chance on attack to inflict 120 physical damage. Take Aim active grants +400 attack range and +100% headshot chance for initial shots.'
  },
  {
    id: 'marci',
    name: 'Marci',
    primaryAttribute: 'universal',
    baseStrength: 23,
    strengthGain: 3.3,
    baseAgility: 20,
    agilityGain: 2.0,
    baseIntelligence: 19,
    intelligenceGain: 1.9,
    baseDamageMin: 13,
    baseDamageMax: 19,
    baseAttackTime: 1.7,
    attackPoint: 0.30,
    attackBackswing: 0.70,
    isRanged: false,
    projectileSpeed: 0,
    baseArmor: 0.33,
    baseMagicResistance: 0.25,
    movementSpeed: 315,
    turnRate: 0.9,
    facets: [
      {
        id: 'unleash_haste',
        name: 'Unleash Haste',
        description: 'Unleash attacks increase movement speed and grant +2 extra furry pulses.',
        effectType: 'speed',
        bonusAttackSpeed: 100
      },
      {
        id: 'sidekick_empower',
        name: 'Sidekick Empower',
        description: 'Sidekick grants +20% bonus base damage permanently to Marci.',
        effectType: 'damage',
        multiplier: 1.20
      }
    ],
    mechanicsStatus: {
      passives: 'verified',
      actives: 'verified',
      facets: 'verified',
      talents: 'approximate'
    },
    specialMechanicsDescription: 'Universal Hero: gains 0.7 damage per point of all attributes. Unleash grants rapid furry flurry combos with +180 Attack Speed and damaging pulses.'
  }
];
