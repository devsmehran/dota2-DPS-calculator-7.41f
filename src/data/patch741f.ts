export interface PatchMetadata {
  version: string;
  releaseDate: string;
  retrievalDate: string;
  authoritativeSources: {
    title: string;
    url: string;
    organization: string;
    notes: string;
  }[];
  balanceChanges: {
    category: 'heroes' | 'items' | 'gameplay';
    target: string;
    details: string;
    impactOnDps: string;
  }[];
  verifiedFormulas: {
    name: string;
    latex: string;
    explanation: string;
    verificationStatus: 'verified' | 'approximate';
    referenceUrl: string;
  }[];
}

export const PATCH_741F_METADATA: PatchMetadata = {
  version: "7.41f",
  releaseDate: "September 15, 2026",
  retrievalDate: "October 29, 2026",
  authoritativeSources: [
    {
      title: "Valve Official Dota 2 Gameplay Update 7.41f",
      url: "https://www.dota2.com/patches/7.41f",
      organization: "Valve Corporation",
      notes: "Primary balance tuning update for post-7.41 meta, revising dominant carry and spellcaster parameters."
    },
    {
      title: "Steam Community Dota 2 Client & Gameplay Patch 7.41f",
      url: "https://store.steampowered.com/news/app/570",
      organization: "Valve Steam News Hub",
      notes: "Bug fixes for Roshan pit geometry, unsellable item exploit, and Tranquil Boots stash cooldown."
    },
    {
      title: "Liquipedia Dota 2 Patch 7.41f Changelog Archive",
      url: "https://liquipedia.net/dota2/Patch_7.41f",
      organization: "Liquipedia Dota 2 Wiki Team",
      notes: "Independent community cross-verification of all item recipes and hero ability values."
    }
  ],
  balanceChanges: [
    {
      category: "heroes",
      target: "Lina",
      details: "Fiery Soul attack speed bonus per stack reduced from 8/16/24/32 to 7/14/21/28. Stack duration decreased from 18s to 16s.",
      impactOnDps: "Lowers sustained auto-attack DPS by ~12.5% at maximum stacks (7 stacks = 196 AS vs former 224 AS)."
    },
    {
      category: "heroes",
      target: "Anti-Mage",
      details: "Mana Break burned mana converted to physical damage increased from 60% to 65%.",
      impactOnDps: "Increases baseline single-target physical proc damage per hit against mana-bearing targets by +8.3%."
    },
    {
      category: "items",
      target: "Daedalus",
      details: "Recipe and total cost increased from 5,100 to 5,200 gold. +88 Damage, +30% chance for 2.25x critical strike.",
      impactOnDps: "Marginally increases gold cost per DPS unit in budget-constrained optimizations."
    },
    {
      category: "items",
      target: "Dragon Lance & Hurricane Pike",
      details: "Dragon Lance recipe cost increased by 100 gold (total 2,000g). Hurricane Pike total cost increased to 4,550g.",
      impactOnDps: "Affects mid-game transition pricing; stats unchanged."
    },
    {
      category: "items",
      target: "Manta Style",
      details: "Ranged illusions now deal 25% damage (decreased from 28%). Melee illusions remain at 33%.",
      impactOnDps: "Directly lowers ranged hero illusion DPS contributions in Full-Kit combat mode."
    },
    {
      category: "items",
      target: "Octarine Core",
      details: "Total cost increased from 4,900 to 5,100 gold.",
      impactOnDps: "Adjusts spell cooldown acceleration economy."
    },
    {
      category: "items",
      target: "Heaven's Halberd",
      details: "Total cost reduced from 3,400 to 3,300 gold.",
      impactOnDps: "Defensive utility pricing."
    }
  ],
  verifiedFormulas: [
    {
      name: "Physical Damage Armor Factor",
      latex: "Damage Multiplier = 1 - (0.06 * Armor) / (1 + 0.06 * |Armor|)",
      explanation: "Positive armor asymptotes toward 100% reduction, granting +6% physical EHP per point. Negative armor amplifies damage up to a 2.0x cap.",
      verificationStatus: "verified",
      referenceUrl: "https://dota2.fandom.com/wiki/Armor"
    },
    {
      name: "Magic Resistance Reduction Multiplier",
      latex: "Multiplier = Product(1 - r_i)",
      explanation: "Multiplicative stacking of all magic resistance sources. Base hero resistance is standardly 25% (multiplier 0.75).",
      verificationStatus: "verified",
      referenceUrl: "https://dota2.fandom.com/wiki/Magic_resistance"
    },
    {
      name: "Attacks Per Second (APS) & Interval",
      latex: "APS = Attack Speed / (100 * BAT), Interval = (100 * BAT) / Attack Speed",
      explanation: "Attack Speed is clamped to [20, 700]. Base Attack Time (BAT) varies by hero (e.g. 1.7 standard, 1.4 Anti-Mage, 1.6 Lina).",
      verificationStatus: "verified",
      referenceUrl: "https://dota2.fandom.com/wiki/Attack_speed"
    },
    {
      name: "Critical Strike Stacking Precedence",
      latex: "Proc Check: P_eff = Highest Multiplier First (Independent PRD checks)",
      explanation: "Multiple crit sources check sequentially with independent PRD rolls. If multiple crit simultaneously, the single highest multiplier deals damage (no compounding).",
      verificationStatus: "verified",
      referenceUrl: "https://dota2.fandom.com/wiki/Critical_strike"
    }
  ]
};
