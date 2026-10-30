export type AttributeType = 'strength' | 'agility' | 'intelligence' | 'universal';

export type DamageType = 'physical' | 'magical' | 'pure';

export type CombatMode = 'sustained' | 'full_kit' | 'burst';

export type MechanicStatus = 'verified' | 'approximate' | 'unsupported';

export interface HeroFacet {
  id: string;
  name: string;
  description: string;
  effectType: 'damage' | 'speed' | 'spell' | 'utility';
  multiplier?: number;
  bonusDamage?: number;
  bonusAttackSpeed?: number;
}

export interface HeroDefinition {
  id: string;
  name: string;
  primaryAttribute: AttributeType;
  baseStrength: number;
  strengthGain: number;
  baseAgility: number;
  agilityGain: number;
  baseIntelligence: number;
  intelligenceGain: number;
  baseDamageMin: number;
  baseDamageMax: number;
  baseAttackTime: number; // BAT, e.g. 1.7, 1.4, 1.6
  attackPoint: number;    // Animation frontswing, e.g. 0.3
  attackBackswing: number;// Backswing e.g. 0.5
  isRanged: boolean;
  projectileSpeed: number; // 0 for melee, e.g. 1000 for Lina
  baseArmor: number;
  baseMagicResistance: number; // usually 0.25
  movementSpeed: number;
  turnRate: number;
  facets: HeroFacet[];
  mechanicsStatus: {
    passives: MechanicStatus;
    actives: MechanicStatus;
    facets: MechanicStatus;
    talents: MechanicStatus;
  };
  specialMechanicsDescription: string;
}

export interface ItemDefinition {
  id: string;
  name: string;
  cost: number;
  bonusDamage?: number;
  bonusStrength?: number;
  bonusAgility?: number;
  bonusIntelligence?: number;
  bonusAllAttributes?: number;
  bonusAttackSpeed?: number;
  bonusArmor?: number;
  bonusMagicResistance?: number;
  bonusMana?: number;
  bonusManaRegen?: number;
  isConsumableUpgrade?: boolean;
  isBoot?: boolean; // Must be present in every legal 6-slot inventory
  uniqueGroup?: string; // e.g., 'basher', 'boots', 'crit'
  isUniqueProc?: boolean;
  accuracyChance?: number; // e.g., MKB 0.8
  procChance?: number;    // e.g., MKB 0.8, Basher 0.25
  procDamage?: number;    // e.g., MKB 70 pure
  procDamageType?: DamageType;
  critChance?: number;    // e.g., Daedalus 0.30
  critMultiplier?: number;// e.g., Daedalus 2.25
  armorReduction?: number;// e.g., Desolator 6, AC 5
  activeAbility?: {
    name: string;
    cooldown: number;
    duration: number;
    manaCost: number;
    damageMultiplier?: number;
    extraDamagePerAttack?: number;
    magicDamageAmp?: number;
    critChance?: number;
    critMultiplier?: number;
  };
  notes?: string;
}

export interface TargetDummy {
  name: string;
  armor: number;
  magicResistance: number; // 0.0 - 1.0
  maxHp: number;
  isImmortal: boolean;
  evasion: number; // 0.0 - 1.0
  hpRegen: number;
}

export interface CombatConfig {
  heroId: string;
  level: number;
  facetId: string;
  mode: CombatMode;
  durationSeconds: number; // 5, 10, 30, 60, 180
  target: TargetDummy;
  permanentUpgrades: {
    consumedMoonShard: boolean;
    aghanimsScepter: boolean;
    aghanimsShard: boolean;
  };
  randomSeed: number;
  goldBudget?: number;
}

export interface DamageEntry {
  timestamp: number;
  amount: number;
  rawAmount: number;
  type: DamageType;
  source: 'auto_attack' | 'critical' | 'passive_proc' | 'spell' | 'item_active' | 'illusion';
  name: string;
}

export interface CombatEvent {
  id: string;
  timestamp: number; // in seconds
  type: 'attack_start' | 'attack_hit' | 'spell_cast' | 'item_activated' | 'buff_applied' | 'buff_expired' | 'proc';
  source: string;
  detail: string;
  damage?: number;
  damageType?: DamageType;
  remainingMana?: number;
}

export interface SimulationResult {
  id: string;
  heroId: string;
  items: ItemDefinition[];
  totalCost: number;
  duration: number;
  totalDamage: number;
  dps: number;
  attackCount: number;
  critCount: number;
  procCount: number;
  spellsCastCount: number;
  manaSpent: number;
  damageByType: {
    physical: number;
    magical: number;
    pure: number;
  };
  damageBySource: {
    auto_attack: number;
    critical: number;
    passive_proc: number;
    spell: number;
    item_active: number;
    illusion: number;
  };
  timeToKill?: number | null; // if target was finite HP
  timeline: {
    timestamp: number;
    cumulativeDamage: number;
    currentDps: number;
    mana: number;
  }[];
  events: CombatEvent[];
  statsSummary: {
    finalDamage: number;
    finalAttackSpeed: number;
    attacksPerSecond: number;
    finalArmor: number;
    finalMana: number;
  };
}

export interface BuildEvaluation {
  buildId: string;
  items: ItemDefinition[];
  totalCost: number;
  meanDps: number;
  stdDev: number;
  confidenceInterval95: [number, number];
  sampleCount: number;
  singleRunResult: SimulationResult;
  provenanceLabel: 'Proven optimum within the stated search space' | 'Best build found under this search budget' | 'Partial result — unsupported mechanics remain';
}

export interface OptimizationProgress {
  isRunning: boolean;
  currentIteration: number;
  totalCombinations: number;
  currentBestDps: number;
  currentBestItems: ItemDefinition[];
  stage: string;
  percent: number;
}
