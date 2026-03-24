export type CurrencyType = 'credits' | 'rare' | 'epic' | 'legendary';
export type UpgradeCategory = 'player' | 'economy' | 'drone' | 'boss' | 'circle';

export interface UpgradeDefinition {
  id: string;
  name: string;
  description: string;
  category: UpgradeCategory;
  currency: CurrencyType;
  cost: number;
  maxLevel: number;
  requires?: string;
}

export interface UpgradeState {
  [key: string]: number;
}

export const DEFAULT_UPGRADES: UpgradeState = {};

export const PLAYER_UPGRADES: UpgradeDefinition[] = [
  { id: 'moveSpeed1', name: 'Movement I', description: 'Increase player movement speed', category: 'player', currency: 'credits', cost: 50, maxLevel: 5 },
  { id: 'moveSpeed2', name: 'Movement II', description: 'Further increase movement speed', category: 'player', currency: 'credits', cost: 100, maxLevel: 5, requires: 'moveSpeed1' },
  { id: 'catcherSize1', name: 'Catcher Expansion I', description: 'Increase catcher size', category: 'player', currency: 'credits', cost: 100, maxLevel: 5 },
  { id: 'catcherSize2', name: 'Catcher Expansion II', description: 'Further increase catcher size', category: 'player', currency: 'credits', cost: 200, maxLevel: 5, requires: 'catcherSize1' },
  { id: 'extraLives1', name: 'Extra Life I', description: 'Start with +1 life', category: 'player', currency: 'credits', cost: 300, maxLevel: 1 },
  { id: 'extraLives2', name: 'Extra Life II', description: 'Start with +2 lives', category: 'player', currency: 'credits', cost: 500, maxLevel: 1, requires: 'extraLives1' },
  { id: 'magnetRange1', name: 'Orb Magnet I', description: 'Increase orb pickup range', category: 'player', currency: 'credits', cost: 200, maxLevel: 5 },
  { id: 'magnetRange2', name: 'Orb Magnet II', description: 'Further increase orb pickup range', category: 'player', currency: 'credits', cost: 400, maxLevel: 5, requires: 'magnetRange1' },
  { id: 'shield1', name: 'Energy Shield I', description: 'Gain one shield', category: 'player', currency: 'credits', cost: 400, maxLevel: 1 },
  { id: 'shield2', name: 'Energy Shield II', description: 'Gain additional shield', category: 'player', currency: 'credits', cost: 600, maxLevel: 1, requires: 'shield1' },
];

export const ECONOMY_UPGRADES: UpgradeDefinition[] = [
  { id: 'scoreBoost1', name: 'Score Multiplier I', description: 'Increase score gained', category: 'economy', currency: 'credits', cost: 100, maxLevel: 10 },
  { id: 'scoreBoost2', name: 'Score Multiplier II', description: 'Further increase score gained', category: 'economy', currency: 'credits', cost: 200, maxLevel: 10, requires: 'scoreBoost1' },
  { id: 'creditBoost1', name: 'Credit Multiplier I', description: 'Increase credits gained', category: 'economy', currency: 'credits', cost: 200, maxLevel: 10 },
  { id: 'creditBoost2', name: 'Credit Multiplier II', description: 'Further increase credits gained', category: 'economy', currency: 'credits', cost: 400, maxLevel: 10, requires: 'creditBoost1' },
];

export const ALL_UPGRADES: UpgradeDefinition[] = [...PLAYER_UPGRADES, ...ECONOMY_UPGRADES];

export const MAIN_TREE_UPGRADES = ALL_UPGRADES.filter((u) => u.category === 'player' || u.category === 'economy' || u.category === 'drone' || u.category === 'boss');
export const SECRET_TREE_UPGRADES = ALL_UPGRADES.filter((u) => u.category === 'circle');

export function getUpgradeLevel(upgrades: UpgradeState, id: string): number {
  return upgrades[id] ?? 0;
}

export function getUpgradeCost(upgrades: UpgradeState, upgrade: UpgradeDefinition): number {
  const level = upgrades[upgrade.id] ?? 0;
  return Math.floor(upgrade.cost * Math.pow(1.35, level));
}

export function canUpgrade(upgrades: UpgradeState, upgrade: UpgradeDefinition, credits: number, rare: number, epic: number, legendary: number): boolean {
  const level = upgrades[upgrade.id] ?? 0;
  if (level >= upgrade.maxLevel) return false;
  if (upgrade.requires && (upgrades[upgrade.requires] ?? 0) === 0) return false;
  const cost = getUpgradeCost(upgrades, upgrade);
  switch (upgrade.currency) {
    case 'credits': return credits >= cost;
    case 'rare': return rare >= cost;
    case 'epic': return epic >= cost;
    case 'legendary': return legendary >= cost;
    default: return false;
  }
}

function sum(upgrades: UpgradeState, ...keys: string[]) {
  return keys.reduce((total, key) => total + (upgrades[key] ?? 0), 0);
}

export function getEffectiveUpgradeLevels(upgrades: UpgradeState) {
  return {
    moveSpeed: sum(upgrades, 'moveSpeed1', 'moveSpeed2'),
    catcherSize: sum(upgrades, 'catcherSize1', 'catcherSize2'),
    extraLives: (upgrades.extraLives1 ?? 0) + (upgrades.extraLives2 ?? 0) * 2,
    magnetRange: sum(upgrades, 'magnetRange1', 'magnetRange2'),
    shield: sum(upgrades, 'shield1', 'shield2'),
    scoreMultiplier: sum(upgrades, 'scoreBoost1', 'scoreBoost2'),
    creditMultiplier: sum(upgrades, 'creditBoost1', 'creditBoost2'),
  };
}

ALL_UPGRADES.forEach((upgrade) => {
  if (!(upgrade.id in DEFAULT_UPGRADES)) {
    DEFAULT_UPGRADES[upgrade.id] = 0;
  }
});
