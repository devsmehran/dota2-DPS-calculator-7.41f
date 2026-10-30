# Dota 2 Maximum DPS Lab — Patch 7.41f

An empirical combat simulation and combinatorial inventory optimization engine for Dota 2 (Patch 7.41f), modeling legal six-slot item configurations under strictly defined combat scenarios without neutral items.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following key decisions were confirmed via interactive user interview and govern the simulation architecture:

- **Optimization Algorithm Strategy**: **Hybrid: Fast beam search with optional deep exhaustive mode**. Provides immediate sub-second feedback for expansive item spaces while offering exact exhaustive combinatorial enumeration for selected candidate subsets and dominance-pruned tiers.
- **Initial Hero Roster Package**: **Diverse meta batch: Lina, Anti-Mage, Phantom Assassin, Juggernaut, and Sven** implemented with full high-fidelity ability/passive adapters and patch 7.41f mechanics, supported by an extensible adapter architecture accommodating all playable heroes with base attributes, BAT, and attribute gains.
- **Data-Readiness & Patch Verification Presentation**: **Dedicated Data-Readiness drawer with formula inspector and badges** providing full provenance documentation, exact mathematical formulas, and transparency for every hero/item mechanic status (`Verified`, `Approximate`, or `Unsupported`).

---

## 1. Overview & Core Concept

The **Dota 2 Maximum DPS Lab** is a deterministic, discrete-event combat simulation and combinatorial item optimizer. Rather than relying on static theorycrafting formulas or arbitrary tier lists, it simulates actual tick-by-tick combat encounters featuring attack windups, projectile travel, pseudo-random distribution (PRD) procs, critical strike resolution, spell casting animations, mana expenditure, and active item scheduling.

### Target Audience & Persona
- Competitive theorycrafters, analysts, and high-MMR players seeking empirical optimal build paths under specific enemy defensive thresholds (armor, magic resistance, evasion).
- Developers and researchers studying game balance dynamics, item synergies, and combinatorial optimization.

### Key Value
Answers the precise question: *"Given hero $H$ at level 30 against target $T$ with armor $A$ and resistance $R$ over duration $D$, what legal 6-slot inventory produces the highest damage output?"* with complete mathematical proof, variance analysis (95% CI), and inspectable event logs.

---

## 2. User Experience & Visual Design

The UI follows the **Science, Space & Biotech** visual design standard: a clinical, high-density lab console aesthetic with precision typography, tabular numerals, disciplined 60-30-10 color allocation (deep charcoal/slate `#0B0F17`, structural slate `#151D2C`, laser cyan `#06B6D4` / amber telemetry accents), zero-pill metadata discipline, and clean 1px hairline borders.

### Top Bar Contract
Single-row header following the strict 3-zone layout:
1. **Brand Wordmark**: `Dota 2 Maximum DPS Lab` (`font-bold tracking-tight text-slate-100 font-mono`)
2. **Navigation Links**: `Optimizer`, `Combat Simulator`, `Build Comparison`, `Data Provenance`
3. **Primary Action**: `Data Readiness & Patch 7.41f` drawer toggle button

### Workspace Zones
```
+---------------------------------------------------------------------------------------------------------+
| BRAND: Dota 2 Maximum DPS Lab [7.41f]     Optimizer  Simulator  Comparison  Logs   [Data Readiness]     |
+------------------------------------+--------------------------------------------------------------------+
| HERO & SCENARIO CONFIGURATION      | SIMULATION STAGE & OPTIMIZATION RESULTS                            |
| Hero: Lina [Level 30]              | Top Proven Builds Table (Rank, DPS, Total Gold, Items, CI)          |
| Facet: Thermal Runaway             | +----------------------------------------------------------------+ |
| Mode: Sustained / Full-Kit / Burst | | #1: Daedalus + MKB + Moon Shard + Revenant's + Bloodthorn + Manta |
| Duration: [ 10s ] [ 30s ] [ 60s ]  | | Mean DPS: 4,812.4 (+-38.2) | Cost: 31,450g | 95% CI Verified    |
| Target Preset: High Armor (40)     | +----------------------------------------------------------------+ |
| Permanent Buffs: Shard, Moon Shard | Damage Timeline & DPS Breakdown Chart (Physical / Magic / Pure)    |
| Run Optimization [Beam / Exhaust]  | Combat Event Log (Tick, Actor, Action, Event, Damage, Mana)        |
+------------------------------------+--------------------------------------------------------------------+
| 3-BUILD COMPARISON TRAY: Side-by-side DPS, time-to-kill, cost efficiency, and buff uptime comparison   |
+---------------------------------------------------------------------------------------------------------+
```

### Key User Flows
1. **Scenario Setup**: Select hero, level (default 30), facet, combat mode (Sustained Attack, Full-Kit Single Target, Burst 5s/10s/30s/60s), and target dummy preset or custom parameters (Armor, Magic Resistance, Evasion, Max HP).
2. **Item Optimization**: Click "Run Optimizer". Web Worker executes the hybrid beam search across all valid late-game offensive items, respecting unique attack modifiers, item slot legality, and duplicate item rules.
3. **Deep Inspection & Comparison**: View ranked builds, select up to 3 builds for side-by-side differential analysis, inspect damage source breakdown (auto-attacks, crits, passive procs, active items, spells), and view the tick-by-tick combat event log.
4. **Data-Readiness Inspection**: Open the Data Readiness Drawer to inspect Patch 7.41f provenance, official balance changes, exact armor/magic resistance equations, and verification status badges for every hero ability and item effect.
5. **Export & Reproduce**: Export findings as CSV, download replayable simulation JSON definitions, or copy exact random seed configuration to re-run simulations deterministically.

---

## 3. Patch 7.41f Verification & Provenance

### Authoritative Patch Grounding
- **Release Date**: September 15, 2026.
- **Authoritative Baseline**: Official Valve gameplay update & balance cycle 7.41f.
- **Documented Item & Hero Deltas in 7.41f**:
  - *Dragon Lance*: Recipe increased by 100g (Total: 2,000g).
  - *Hurricane Pike*: Total cost: 4,550g.
  - *Daedalus*: Total cost adjusted to 5,200g (+88 Damage, +30% chance for 2.25x Critical Strike).
  - *Heart of Tarrasque*: Total cost 5,300g.
  - *Octarine Core*: Total cost 5,100g.
  - *Heaven's Halberd*: Total cost decreased to 3,300g.
  - *Manta Style*: Ranged illusions deal 25% damage (down from 28%).
  - *Lina (Fiery Soul)*: Attack speed per stack adjusted to 7/14/21/28 (from 8/16/24/32), stack duration 16s.
  - *Anti-Mage (Mana Break)*: Burned mana converted to damage increased to 65% (from 60%).

### Empirical Mathematical Formulas
- **Physical Damage Armor Multiplier**:
  $$\text{Multiplier} = 1 - \frac{0.06 \times \text{Armor}}{1 + 0.06 \times |\text{Armor}|}$$
  - For positive armor: approaches 100% reduction asymptotically; Effective HP increases by $6\%$ per armor point.
  - For negative armor: amplifies damage up to a maximum multiplier of 2.0 ($+100\%$ extra damage).
- **Magic Resistance Multiplier**:
  $$\text{Multiplier} = \prod_{i} (1 - r_i)$$
  - Standard base hero resistance is 25% ($0.75\times$).
- **Attack Speed & Interval**:
  $$\text{Attacks Per Second (APS)} = \frac{\text{Attack Speed}}{100 \times \text{BAT}}$$
  $$\text{Attack Cooldown} = \frac{1}{\text{APS}} = \frac{100 \times \text{BAT}}{\text{Attack Speed}}$$
  - Minimum Attack Speed: 20 (cap floor); Maximum Attack Speed: 700 (cap ceiling).
- **Critical Strike Stacking**:
  - Independent PRD rolls per critical strike source; when multiple procs coincide on the same attack, the highest multiplier takes precedence (no multiplicative stacking).

---

## 4. Technical Architecture & Simulation Engine

```
+--------------------------------------------------------------------------------+
|                              REACT UI APPLICATION                              |
|  [Header & Nav]   [Hero / Target Config]   [Top Builds Table]   [Event Log]    |
|  [3-Way Compare]  [Damage Breakdown Chart] [Data-Readiness Drawer]             |
+--------------------------------------------------------------------------------+
                                        │ User actions / Run Optimization
                                        ▼
+--------------------------------------------------------------------------------+
|                            OPTIMIZATION CONTROLLER                             |
|  - Candidate Generator (Pruning non-viable items, boots deduplication)         |
|  - Beam Search (Beam width = 16-32, depth = 6 slots)                           |
|  - Optional Deep Exhaustive Evaluator (Combinations C(N, 6))                   |
|  - Multi-seed Statistical Evaluator (Confidence intervals, mean, stddev)       |
+--------------------------------------------------------------------------------+
                                        │ Evaluates build candidates
                                        ▼
+--------------------------------------------------------------------------------+
|                     DETERMINISTIC DISCRETE-EVENT SIMULATOR                     |
|  - Priority Event Queue (Ordered by discrete timestamps: Ticks / Milliseconds) |
|  - Seeded PRNG (SplitMix32 / Mulberry32 with pseudo-random distribution tables)|
|  - Attack Animation Scheduler (Attack point, backswing, projectile arrival)    |
|  - Resource Tracker (Mana pool, regen per second, cooldowns, active buffs)     |
|  - Damage Engine (Physical armor, magic resistance, pure damage, amp, crits)   |
+--------------------------------------------------------------------------------+
                                        │ Emits
                                        ▼
+--------------------------------------------------------------------------------+
|                           SIMULATION RUN RESULTS                               |
|  - Summary (Total Damage, Mean DPS, Peak Burst DPS, TTK)                       |
|  - Damage Composition (Physical, Magical, Pure, Spell, Item, Attack Procs)     |
|  - Event Stream (Structured timestamped attack, cast, proc, buff records)      |
+--------------------------------------------------------------------------------+
```

### Combat Modes
1. **Sustained Attack DPS**:
   - Pure auto-attacks + passives (e.g. Coup de Grace, Fiery Soul, Mana Break, Blade Dance).
   - Zero manual spell casts or item actives.
2. **Full-Kit Single Target DPS**:
   - Optimal legal action scheduling: pre-buffs, damage spells (e.g. Laguna Blade, Stifling Dagger, Omnislash, God's Strength), active item debuffs (Bloodthorn Soul Rend, Nullifier, Revenant's Brooch, Manta illusions).
   - Strict cooldown and mana cost tracking.
3. **Burst Damage**:
   - Total damage within exact fixed windows: 5s, 10s, 30s, 60s, or 180s.

### Optimization Mechanics
- **Item Search Pool**: All offensive and stat-scaling Dota 2 end-game items:
  - Daedalus, Monkey King Bar, Bloodthorn, Butterfly, Divine Rapier, Nullifier, Revenant's Brooch, Desolator, Eye of Skadi, Manta Style, Moon Shard, Assault Cuirass, Satanic, Silver Edge, Diffusal Blade / Disperser, Abyssal Blade, Swift Blink, Khanda, Radiance, Gleipnir / Mjollnir.
- **Constraints**:
  - Max 6 main inventory slots.
  - Unique effect exclusion (e.g., only one Basher/Abyssal proc applies).
  - Consumable upgrades modeled separately: Consumed Moon Shard (+60 AS), Aghanim's Scepter Synth (+10 all stats, +175 HP, +175 Mana, +Scepter Upgrade), Aghanim's Shard.
- **Beam Search Strategy**:
  - Iteratively builds inventories 1 to 6 slots.
  - At each slot, evaluates all candidate items on top $K$ partial builds.
  - Retains top $B$ builds (beam width) based on simulated DPS.
  - Performs local neighborhood swap refinement on top candidates.
  - Re-evaluates final top 10 builds over 5 independent random seeds to prevent selection bias and compute 95% confidence intervals.

---

## 5. Verification & Implementation Sequence

1. **Step 1: Simulation Core & Math Engine**:
   - Implement `SeededPRNG`, `PRD` (pseudo-random distribution table), and discrete event queue.
   - Implement exact armor and magic resistance formulas.
   - Implement unit tests verifying armor curves, attack speed formulas, and critical strike resolution.
2. **Step 2: Hero & Item Database (Patch 7.41f Grounded)**:
   - Load level 30 attributes, growth rates, BAT, attack point, and facet data for Lina, Anti-Mage, PA, Juggernaut, Sven, plus full roster base stats.
   - Implement complete item registry with patch 7.41f gold costs, stats, passives, and active abilities.
3. **Step 3: Discrete Event Simulator & Action Scheduler**:
   - Implement auto-attack cycle, animation delays, projectile speeds, buff lifecycles, and spell casting.
   - Implement full combat run generator returning detailed DPS breakdowns and timeline events.
4. **Step 4: Combinatorial Optimization Engine**:
   - Implement beam search and optional exhaustive search.
   - Implement multi-seed variance analysis and confidence interval calculation.
5. **Step 5: User Interface & Analytics Dashboards**:
   - Construct responsive lab console layout with hero/scenario selectors, run trigger, and progress indicator.
   - Build Top Builds Table, 3-Way Build Comparison, Damage Timeline SVG Chart, and Inspectable Event Log.
   - Build the dedicated Data-Readiness Drawer with full 7.41f provenance documentation and mechanic verification badges.
6. **Step 6: Validation & Export**:
   - Validate against edge cases (0 armor, 50 armor, 100% evasion with MKB accuracy, max attack speed 700 cap).
   - Test JSON definition and CSV export capabilities.
   - Run build compilation verification (`compile_applet`).
