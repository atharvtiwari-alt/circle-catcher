import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { CyberButton } from '../ui/cyber-button';
import { MAIN_TREE_UPGRADES, UpgradeDefinition, UpgradeState, canUpgrade, getUpgradeCost, getUpgradeLevel } from '../../types/upgrades';

interface TechTreeProps {
  credits: number;
  rareOrbs?: number;
  epicOrbs?: number;
  legendaryOrbs?: number;
  upgrades: UpgradeState;
  onBuy: (id: string) => void;
  onBack: () => void;
}

interface LineDef { id: string; x1: number; y1: number; x2: number; y2: number; }

export function TechTree({ credits, rareOrbs = 0, epicOrbs = 0, legendaryOrbs = 0, upgrades, onBuy, onBack }: TechTreeProps) {
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [lines, setLines] = useState<LineDef[]>([]);

  const playerUpgrades = MAIN_TREE_UPGRADES.filter((u) => u.category === 'player');
  const economyUpgrades = MAIN_TREE_UPGRADES.filter((u) => u.category === 'economy');
  const droneUpgrades = MAIN_TREE_UPGRADES.filter((u) => u.category === 'drone');
  const bossUpgrades = MAIN_TREE_UPGRADES.filter((u) => u.category === 'boss');

  useEffect(() => {
    const calculatedLines: LineDef[] = [];
    MAIN_TREE_UPGRADES.forEach((u) => {
      if (!u.requires) return;
      const from = nodeRefs.current[u.requires];
      const to = nodeRefs.current[u.id];
      if (!from || !to) return;
      const r1 = from.getBoundingClientRect();
      const r2 = to.getBoundingClientRect();
      calculatedLines.push({ id: u.id, x1: r1.left + r1.width / 2, y1: r1.bottom, x2: r2.left + r2.width / 2, y2: r2.top });
    });
    setLines(calculatedLines);
  }, [upgrades]);

  function renderUpgrade(upgrade: UpgradeDefinition) {
    const level = getUpgradeLevel(upgrades, upgrade.id);
    const affordable = canUpgrade(upgrades, upgrade, credits, rareOrbs, epicOrbs, legendaryOrbs);
    const cost = getUpgradeCost(upgrades, upgrade);

    return (
      <motion.div key={upgrade.id} ref={(el: HTMLDivElement | null) => { nodeRefs.current[upgrade.id] = el; }} whileHover={{ scale: 1.02 }} className="border border-neon-cyan/30 p-4 rounded bg-black/40 backdrop-blur-sm">
        <div className="font-display text-neon-cyan text-lg">{upgrade.name}</div>
        <div className="text-xs text-muted-foreground mt-1">{upgrade.description}</div>
        <div className="text-xs mt-2">Level {level} / {upgrade.maxLevel}</div>
        <div className="text-xs text-yellow-400">Cost: {cost} {upgrade.currency}</div>
        <CyberButton className="mt-3 w-full" disabled={!affordable} onClick={() => onBuy(upgrade.id)}>Upgrade</CyberButton>
      </motion.div>
    );
  }

  function renderSection(title: string, items: UpgradeDefinition[]) {
    return (
      <div className="mb-10">
        <h2 className="text-2xl font-display text-neon-magenta mb-4">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{items.map(renderUpgrade)}</div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 overflow-y-auto p-8 bg-background/95 backdrop-blur-lg">
      <div className="flex items-center justify-between mb-8">
        <div className="text-4xl font-display text-neon-cyan">TECH TREE</div>
        <CyberButton onClick={onBack}><ArrowLeft className="w-4 h-4 mr-2" />Back</CyberButton>
      </div>
      <div className="flex gap-8 text-sm mb-10">
        <div className="text-yellow-400">Credits: {credits}</div>
        <div className="text-cyan-400">Rare Orbs: {rareOrbs}</div>
        <div className="text-purple-400">Epic Orbs: {epicOrbs}</div>
        <div className="text-orange-400">Legendary Orbs: {legendaryOrbs}</div>
      </div>
      {renderSection('PLAYER UPGRADES', playerUpgrades)}
      {renderSection('ECONOMY UPGRADES', economyUpgrades)}
      {droneUpgrades.length > 0 && renderSection('DRONE UPGRADES', droneUpgrades)}
      {bossUpgrades.length > 0 && renderSection('BOSS UPGRADES', bossUpgrades)}
      <svg className="absolute inset-0 pointer-events-none w-full h-full">{lines.map((line) => <line key={line.id} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} stroke="#00ffff" strokeWidth="2" strokeOpacity="0.6" />)}</svg>
    </motion.div>
  );
}
