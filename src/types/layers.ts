export type GameLayer = 1 | 2 | 3 | 4;

export interface LayerDefinition {
  id: GameLayer;
  name: string;
  difficultySpeed: number;
  spawnMultiplier: number;
  bossMultiplier: number;
  rareOrbs: boolean;
  epicOrbs: boolean;
  legendaryOrbs: boolean;
}

export const LAYERS: Record<GameLayer, LayerDefinition> = {
  1: { id: 1, name: 'Starter Field', difficultySpeed: 1, spawnMultiplier: 1, bossMultiplier: 1, rareOrbs: false, epicOrbs: false, legendaryOrbs: false },
  2: { id: 2, name: 'Rare Fields', difficultySpeed: 1.15, spawnMultiplier: 1, bossMultiplier: 1, rareOrbs: true, epicOrbs: false, legendaryOrbs: false },
  3: { id: 3, name: 'Epic Arena', difficultySpeed: 1.25, spawnMultiplier: 1.2, bossMultiplier: 1.2, rareOrbs: true, epicOrbs: true, legendaryOrbs: false },
  4: { id: 4, name: 'Ancient Temple', difficultySpeed: 1.35, spawnMultiplier: 1.35, bossMultiplier: 1.35, rareOrbs: true, epicOrbs: true, legendaryOrbs: true },
};
