export type OrbType = 'rare' | 'epic' | 'legendary';
export type CreatureRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type CreatureTier = 1 | 2 | 3 | 4;
export type CreatureElement = 'fire' | 'water' | 'earth' | 'air' | 'thunder' | 'electric';

export interface Creature {
  id: string;
  name: string;
  rarity: CreatureRarity;
  tier: CreatureTier;
  element: CreatureElement;
  damage: number;
  health: number;
}

export const CREATURE_BASE_STATS: Record<CreatureRarity, { damage: number; health: number }> = {
  common: { damage: 10, health: 50 },
  uncommon: { damage: 18, health: 80 },
  rare: { damage: 30, health: 120 },
  epic: { damage: 55, health: 180 },
  legendary: { damage: 90, health: 260 },
};

export const TIER_MULTIPLIER: Record<CreatureTier, number> = { 1: 1, 2: 1.6, 3: 2.4, 4: 3.5 };
export const MERGE_COST_BASE = 50;
export const MERGE_COST_RARITY: Record<CreatureRarity, number> = { common: 0, uncommon: 10, rare: 20, epic: 30, legendary: 40 };
export const TIER_COST_ADDITION: Record<CreatureTier, number> = { 1: 30, 2: 50, 3: 100, 4: 0 };

export type EggRarity = 'common' | 'rare' | 'epic' | 'legendary';
export interface Egg { id: string; rarity: EggRarity; hatchTime: number; }
export const EGG_TIMERS: Record<EggRarity, number> = { common: 30, rare: 120, epic: 300, legendary: 900 };
export const EGG_SHOP_COST: Record<EggRarity, number> = { common: 1, rare: 2, epic: 3, legendary: 5 };

export interface Relic { id: string; name: string; description: string; power: number; }
export const RELICS: Relic[] = [
  { id: 'orb_magnet', name: 'Orb Magnet', description: 'Increase orb drop rate', power: 0.1 },
  { id: 'credit_core', name: 'Credit Core', description: 'Increase credit gain', power: 0.15 },
  { id: 'boss_core', name: 'Boss Core', description: 'Increase boss rewards', power: 0.2 },
];

export interface LabState {
  creatures: Creature[];
  eggs: Egg[];
  creditLens: number;
  chargeCore: number;
  droneDamage: number;
  orbMagnet: number;
}

export const DEFAULT_LAB: LabState = {
  creatures: [], eggs: [], creditLens: 0, chargeCore: 0, droneDamage: 0, orbMagnet: 0,
};

export interface ShopBuffs {
  speedBoost: number;
  extraLife: number;
  creditSurge: number;
  powerShield: number;
}

export const DEFAULT_SHOP: ShopBuffs = { speedBoost: 0, extraLife: 0, creditSurge: 0, powerShield: 0 };

export interface BattleChallengeDef { bossHp: number; bossSpeedMult: number; chargeTimeMult: number; ppReward: number; }
export const DEFAULT_BATTLE: BattleChallengeDef = { bossHp: 120, bossSpeedMult: 1, chargeTimeMult: 1, ppReward: 1 };

export interface SlotReward { id: string; chance: number; }
export const SLOT_REWARDS: SlotReward[] = [
  { id: 'credits_small', chance: 0.4 },
  { id: 'rare_orb', chance: 0.25 },
  { id: 'epic_orb', chance: 0.2 },
  { id: 'legendary_orb', chance: 0.1 },
  { id: 'egg_epic', chance: 0.05 },
];
