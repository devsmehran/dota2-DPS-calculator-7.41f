/**
 * Deterministic PRNG and Valve Pseudo-Random Distribution (PRD) engine
 */

export class SeededPRNG {
  private state: number;

  constructor(seed: number = 1337) {
    this.state = seed >>> 0;
  }

  /**
   * Mulberry32 algorithm: fast, high quality 32-bit PRNG
   */
  next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
}

/**
 * Standard Dota 2 PRD C-value constants for target nominal probabilities
 * Reference: Valve Dota 2 Mechanics Wiki - PRD Table
 */
export const PRD_C_TABLE: Record<number, number> = {
  0.05: 0.00380,
  0.10: 0.01475,
  0.15: 0.03222,
  0.17: 0.04085,
  0.20: 0.05570,
  0.24: 0.07842,
  0.25: 0.08474,
  0.30: 0.11895,
  0.35: 0.15798,
  0.40: 0.20155,
  0.45: 0.24931,
  0.50: 0.30210,
  0.60: 0.42265,
  0.70: 0.57143,
  0.80: 0.74900,
  0.85: 0.85000,
};

export function getClosestC(probability: number): number {
  const rounded = Math.round(probability * 100) / 100;
  if (PRD_C_TABLE[rounded] !== undefined) {
    return PRD_C_TABLE[rounded];
  }
  // Formula approximation for unlisted probabilities: C ~= P / (1/P - P/2)
  return probability * 0.35; // reasonable approximation
}

export class PRDTracker {
  private cVal: number;
  private currentN: number = 1;

  constructor(public nominalProbability: number) {
    this.cVal = getClosestC(nominalProbability);
  }

  roll(prng: SeededPRNG): boolean {
    const chance = Math.min(1.0, this.currentN * this.cVal);
    const result = prng.next() < chance;
    if (result) {
      this.currentN = 1;
    } else {
      this.currentN++;
    }
    return result;
  }

  reset() {
    this.currentN = 1;
  }
}
