import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, Star } from 'lucide-react';
import { CyberButton } from '../ui/cyber-button';
import { PRESTIGE_UPGRADES, PrestigeState, canPrestigeUpgrade, getPrestigeCost } from '../../types/prestige';

interface PrestigeShopProps {
  prestigePoints: number;
  prestige: PrestigeState;
  canUseShop: boolean;
  onBuy: (id: keyof PrestigeState) => void;
  onBack: () => void;
}

export function PrestigeShop({ prestigePoints, prestige, canUseShop, onBuy, onBack }: PrestigeShopProps) {
  function renderUpgrade(upgrade: (typeof PRESTIGE_UPGRADES)[number]) {
    const level = prestige[upgrade.id] ?? 0;
    const cost = getPrestigeCost(prestige, upgrade);
    const canBuy = canUseShop && canPrestigeUpgrade(prestige, upgrade, prestigePoints);

    return (
      <motion.div key={upgrade.id} whileHover={{ scale: 1.02 }} className="border border-yellow-400/30 p-4 rounded bg-black/40 backdrop-blur-sm">
        <div className="font-display text-yellow-300 text-lg">{upgrade.name}</div>
        <div className="text-xs text-muted-foreground mt-1">{upgrade.description}</div>
        <div className="text-xs mt-2">Level {level} / {upgrade.maxLevel}</div>
        <div className="text-xs text-yellow-400">Cost: {cost} Prestige Points</div>
        <CyberButton className="mt-3 w-full" disabled={!canBuy} onClick={() => onBuy(upgrade.id)}>
          {canUseShop ? 'Upgrade' : 'Locked'}
        </CyberButton>
      </motion.div>
    );
  }

  if (!canUseShop) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-background/95 backdrop-blur-lg">
        <Lock className="w-16 h-16 text-red-500" />
        <div className="text-3xl font-display text-red-400">PRESTIGE REQUIRED</div>
        <div className="text-sm text-muted-foreground">Prestige to access the shop</div>
        <CyberButton onClick={onBack} className="w-48">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </CyberButton>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 overflow-y-auto p-8 bg-background/95 backdrop-blur-lg">
      <div className="flex items-center justify-between mb-8">
        <div className="text-4xl font-display text-yellow-400 flex items-center gap-3">
          <Star className="w-8 h-8" />
          PRESTIGE SHOP
        </div>
        <CyberButton onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </CyberButton>
      </div>
      <div className="text-xl text-yellow-300 mb-8">Prestige Points: {prestigePoints}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{PRESTIGE_UPGRADES.map(renderUpgrade)}</div>
    </motion.div>
  );
}
