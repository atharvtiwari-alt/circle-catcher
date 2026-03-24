import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { CyberButton } from '../ui/cyber-button';
import { SECRET_TREE_UPGRADES, UpgradeDefinition, UpgradeState, canUpgrade, getUpgradeCost, getUpgradeLevel } from '../../types/upgrades';

interface SecretTechTreeProps {
  credits: number;
  rareOrbs: number;
  epicOrbs: number;
  legendaryOrbs: number;
  upgrades: UpgradeState;
  onBuy: (id: string) => void;
  onBack: () => void;
}

export function SecretTechTree({ credits, rareOrbs, epicOrbs, legendaryOrbs, upgrades, onBuy, onBack }: SecretTechTreeProps) {
  const circleUpgrades = SECRET_TREE_UPGRADES.filter((u) => u.category === 'circle');
  const droneUpgrades = SECRET_TREE_UPGRADES.filter((u) => u.category === 'drone');

  function renderUpgrade(upgrade: UpgradeDefinition) {
    const level = getUpgradeLevel(upgrades, upgrade.id);
    const affordable = canUpgrade(upgrades, upgrade, credits, rareOrbs, epicOrbs, legendaryOrbs);
    const cost = getUpgradeCost(upgrades, upgrade);
    return (
      <motion.div key={upgrade.id} whileHover={{ scale: 1.03 }} className="border border-orange-400/30 p-4 rounded bg-black/40 backdrop-blur-sm">
        <div className="font-display text-orange-300 text-lg">{upgrade.name}</div>
        <div className="text-xs text-muted-foreground mt-1">{upgrade.description}</div>
        <div className="text-xs mt-2">Level {level} / {upgrade.maxLevel}</div>
        <div className="text-xs text-yellow-400">Cost: {cost} {upgrade.currency}</div>
        <CyberButton className="mt-3 w-full" disabled={!affordable} onClick={() => onBuy(upgrade.id)}>Upgrade</CyberButton>
      </motion.div>
    );
  }

  function renderSection(title: string, items: UpgradeDefinition[]) {
    if (items.length === 0) return null;
    return (
      <div className="mb-10">
        <h2 className="text-2xl font-display text-orange-400 mb-4">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{items.map(renderUpgrade)}</div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 overflow-y-auto p-8 bg-background/95 backdrop-blur-lg">
      <div className="flex items-center justify-between mb-8">
        <div className="text-4xl font-display text-orange-400">SECRET TECH TREE</div>
        <CyberButton onClick={onBack}><ArrowLeft className="w-4 h-4 mr-2" />Back</CyberButton>
      </div>
      <div className="flex gap-8 text-sm mb-10">
        <div className="text-yellow-400">Credits: {credits}</div>
        <div className="text-cyan-400">Rare Orbs: {rareOrbs}</div>
        <div className="text-purple-400">Epic Orbs: {epicOrbs}</div>
        <div className="text-orange-400">Legendary Orbs: {legendaryOrbs}</div>
      </div>
      {renderSection('CIRCLE UPGRADES', circleUpgrades)}
      {renderSection('DRONE UPGRADES', droneUpgrades)}
    </motion.div>
  );
}
