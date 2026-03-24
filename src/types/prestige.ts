export interface PrestigeState {
  creditBoost: number;
  spawnBoost: number;
  chargeBoost: number;
  bossReward: number;
}

export const DEFAULT_PRESTIGE: PrestigeState = {
  creditBoost: 0,
  spawnBoost: 0,
  chargeBoost: 0,
  bossReward: 0,
};

export interface PrestigeUpgrade {
  id: keyof PrestigeState;
  name: string;
  description: string;
  cost: number;
  maxLevel: number;
}

export const PRESTIGE_UPGRADES: PrestigeUpgrade[] = [
  { id: 'creditBoost', name: 'Credit Amplifier', description: 'Increase credits gained per circle', cost: 1, maxLevel: 10 },
  { id: 'spawnBoost', name: 'Spawn Acceleration', description: 'Circles spawn faster', cost: 1, maxLevel: 10 },
  { id: 'chargeBoost', name: 'Boss Charger', description: 'Boss meter fills faster', cost: 1, maxLevel: 10 },
  { id: 'bossReward', name: 'Boss Profit', description: 'Gain extra prestige points from bosses', cost: 2, maxLevel: 10 },
];

export function getPrestigeLevel(prestige: PrestigeState, id: keyof PrestigeState): number {
  return prestige[id] ?? 0;
}

export function getPrestigeCost(prestige: PrestigeState, upgrade: PrestigeUpgrade): number {
  const level = prestige[upgrade.id] ?? 0;
  return Math.floor(upgrade.cost * Math.pow(1.5, level));
}

export function canPrestigeUpgrade(prestige: PrestigeState, upgrade: PrestigeUpgrade, points: number): boolean {
  const level = prestige[upgrade.id] ?? 0;
  if (level >= upgrade.maxLevel) return false;
  return points >= getPrestigeCost(prestige, upgrade);
}

export function applyPrestigeUpgrade(prestige: PrestigeState, upgrade: PrestigeUpgrade): PrestigeState {
  const level = prestige[upgrade.id] ?? 0;
  if (level >= upgrade.maxLevel) return prestige;
  return { ...prestige, [upgrade.id]: level + 1 };
}
