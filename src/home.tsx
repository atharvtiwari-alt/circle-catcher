import { useCallback, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Heart, Lock, ShoppingCart, Star, Trophy, Zap } from 'lucide-react';
import { GameCanvas } from './components/game/game-canvas';
import { PrestigeShop } from './components/game/prestige-shop';
import { SecretTechTree } from './components/game/secret-tech-tree';
import { TechTree } from './components/game/tech-tree';
import { CyberButton } from './components/ui/cyber-button';
import { Scanlines } from './components/ui/scanlines';
import { useLocalStorage } from './hooks/use-local-storage';
import { cn } from './lib/utils';
import { DEFAULT_LAB, DEFAULT_SHOP } from './types/orbs';
import { DEFAULT_PRESTIGE, PRESTIGE_UPGRADES, PrestigeState, canPrestigeUpgrade, getPrestigeCost } from './types/prestige';
import { ALL_UPGRADES, DEFAULT_UPGRADES, UpgradeState, canUpgrade, getEffectiveUpgradeLevels, getUpgradeCost } from './types/upgrades';

type ScreenState = 'MENU' | 'PLAYING' | 'GAMEOVER' | 'TECHTREE' | 'SECRETTREE' | 'PRESTIGESHOP';

export default function Home() {
  const [screen, setScreen] = useState<ScreenState>('MENU');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [isHit, setIsHit] = useState(false);
  const [gameKey, setGameKey] = useState(0);

  const [highScore, setHighScore] = useLocalStorage('circle-catcher-highscore', 0);
  const [credits, setCredits] = useLocalStorage('circle-catcher-credits', 0);
  const [tickets] = useLocalStorage('circle-catcher-tickets', 0);
  const [rareOrbs, setRareOrbs] = useLocalStorage('circle-catcher-rare-orbs', 0);
  const [epicOrbs, setEpicOrbs] = useLocalStorage('circle-catcher-epic-orbs', 0);
  const [legendaryOrbs, setLegendaryOrbs] = useLocalStorage('circle-catcher-legendary-orbs', 0);
  const [prestigePoints, setPrestigePoints] = useLocalStorage('circle-catcher-prestige', 0);
  const [rawUpgrades, setUpgrades] = useLocalStorage<UpgradeState>('circle-catcher-upgrades', DEFAULT_UPGRADES);
  const [rawPrestige, setPrestige] = useLocalStorage<PrestigeState>('circle-catcher-prestige-upgrades', DEFAULT_PRESTIGE);

  const upgrades: UpgradeState = { ...DEFAULT_UPGRADES, ...rawUpgrades };
  const prestige: PrestigeState = { ...DEFAULT_PRESTIGE, ...rawPrestige };
  const effective = getEffectiveUpgradeLevels(upgrades);

  const startGame = () => {
    setScore(0);
    setLives(3 + effective.extraLives);
    setGameKey((k) => k + 1);
    setScreen('PLAYING');
  };

  const handleScore = useCallback((newScore: number) => { setScore(newScore); }, []);
  const handleLifeLost = useCallback((newLives: number) => {
    setLives(newLives);
    setIsHit(true);
    window.setTimeout(() => setIsHit(false), 300);
  }, []);
  const handleBossDefeated = useCallback((extraPP: number) => {
    const earned = 1 + (prestige.bossReward ?? 0) + extraPP;
    setPrestigePoints((p) => p + earned);
  }, [prestige.bossReward, setPrestigePoints]);
  const handleGameOver = useCallback(() => {
    setScore((prev) => {
      if (prev > highScore) setHighScore(prev);
      setCredits((c) => c + prev);
      return prev;
    });
    setScreen('GAMEOVER');
  }, [highScore, setCredits, setHighScore]);

  const handlePrestige = () => {
    setCredits(0);
    setScore(0);
    setLives(3);
    setUpgrades({ ...DEFAULT_UPGRADES });
    setHighScore(0);
    setGameKey((k) => k + 1);
    setScreen('MENU');
  };

  const handleBuyUpgrade = (id: string) => {
    const upgrade = ALL_UPGRADES.find((u) => u.id === id);
    if (!upgrade) return;
    const cost = getUpgradeCost(upgrades, upgrade);
    if (!canUpgrade(upgrades, upgrade, credits, rareOrbs, epicOrbs, legendaryOrbs)) return;
    if (upgrade.currency === 'credits') setCredits((c) => c - cost);
    if (upgrade.currency === 'rare') setRareOrbs((o) => o - cost);
    if (upgrade.currency === 'epic') setEpicOrbs((o) => o - cost);
    if (upgrade.currency === 'legendary') setLegendaryOrbs((o) => o - cost);
    setUpgrades((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  };

  const handlePrestigeUpgrade = (id: keyof PrestigeState) => {
    const upgrade = PRESTIGE_UPGRADES.find((item) => item.id === id);
    if (!upgrade) return;
    const cost = getPrestigeCost(prestige, upgrade);
    if (!canPrestigeUpgrade(prestige, upgrade, prestigePoints)) return;
    setPrestige((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
    setPrestigePoints((p) => p - cost);
  };

  return (
    <div className={cn('min-h-screen w-full relative overflow-hidden transition-colors duration-300', isHit ? 'bg-red-900 animate-shake' : 'bg-background')}>
      <Scanlines />
      <main className="relative z-10 w-full h-screen flex flex-col">
        <AnimatePresence>
          {screen === 'PLAYING' && (
            <motion.header initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -100, opacity: 0 }} className="absolute top-0 left-0 w-full p-6 flex justify-between items-start">
              <div>
                <div className="flex gap-1 items-center">
                  {[...Array(3 + effective.extraLives)].map((_, i) => (
                    <Heart key={i} className={cn('w-8 h-8', i < lives ? 'fill-neon-magenta text-neon-magenta' : 'opacity-30')} />
                  ))}
                </div>
                <div className="text-neon-cyan font-display text-sm flex items-center gap-2"><Trophy className="w-4 h-4" />HI: {Math.max(score, highScore)}</div>
                <div className="text-xs mt-2 text-neon-cyan">Rare ✦ {rareOrbs} | Epic ✦ {epicOrbs} | Legendary ✦ {legendaryOrbs}</div>
                <div className="text-xs text-yellow-400">Tickets 🎟 {tickets}</div>
              </div>
              <div className="text-right">
                <div className="text-neon-yellow text-5xl font-display">{score}</div>
                <div className="text-xs uppercase text-neon-cyan/70">Score</div>
              </div>
            </motion.header>
          )}
        </AnimatePresence>

        <div className="flex-1 w-full h-full relative">
          {screen === 'MENU' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-8">
              <div className="text-5xl font-display text-neon-cyan">CIRCLE CATCHER</div>
              <div className="text-xl text-yellow-300">High Score: {highScore}</div>
              <div className="text-sm text-muted-foreground">Catch falling circles, buy upgrades, and prestige for faster runs.</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
                <CyberButton onClick={startGame}><Zap className="w-4 h-4 mr-2" />Start Game</CyberButton>
                <CyberButton onClick={() => setScreen('TECHTREE')}><ShoppingCart className="w-4 h-4 mr-2" />Tech Tree</CyberButton>
                <CyberButton onClick={() => setScreen('PRESTIGESHOP')}><Star className="w-4 h-4 mr-2" />Prestige Shop</CyberButton>
                <CyberButton onClick={() => setScreen('SECRETTREE')}><Lock className="w-4 h-4 mr-2" />Secret Tree</CyberButton>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl">
                <div className="border p-4 rounded bg-black/40"><div className="text-yellow-400">Credits</div><div className="text-2xl">{credits}</div></div>
                <div className="border p-4 rounded bg-black/40"><div className="text-cyan-400">Orbs</div><div className="text-2xl">{rareOrbs + epicOrbs + legendaryOrbs}</div></div>
                <div className="border p-4 rounded bg-black/40"><div className="text-orange-400">Prestige</div><div className="text-2xl">{prestigePoints}</div></div>
              </div>
            </motion.div>
          )}

          {screen === 'PLAYING' && (
            <GameCanvas
              key={gameKey}
              onScore={handleScore}
              onLifeLost={handleLifeLost}
              onGameOver={handleGameOver}
              onBossDefeated={handleBossDefeated}
              onOrbEarned={(type, n) => {
                if (type === 'rare') setRareOrbs((o) => o + n);
                if (type === 'epic') setEpicOrbs((o) => o + n);
                if (type === 'legendary') setLegendaryOrbs((o) => o + n);
              }}
              upgrades={upgrades}
              prestige={prestige}
              lab={DEFAULT_LAB}
              shopBuffs={DEFAULT_SHOP}
              battleChallenge={null}
            />
          )}

          {screen === 'GAMEOVER' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-background/95 backdrop-blur-lg">
              <div className="text-4xl font-display text-red-400">GAME OVER</div>
              <div className="text-xl">Final Score: {score}</div>
              <div className="flex gap-4">
                <CyberButton onClick={startGame}><Zap className="w-4 h-4 mr-2" />Play Again</CyberButton>
                <CyberButton onClick={() => setScreen('MENU')}><ArrowLeft className="w-4 h-4 mr-2" />Menu</CyberButton>
              </div>
              <CyberButton onClick={handlePrestige}><Star className="w-4 h-4 mr-2" />Soft Reset</CyberButton>
            </motion.div>
          )}

          {screen === 'TECHTREE' && <TechTree credits={credits} rareOrbs={rareOrbs} epicOrbs={epicOrbs} legendaryOrbs={legendaryOrbs} upgrades={upgrades} onBuy={handleBuyUpgrade} onBack={() => setScreen('MENU')} />}
          {screen === 'SECRETTREE' && <SecretTechTree credits={credits} rareOrbs={rareOrbs} epicOrbs={epicOrbs} legendaryOrbs={legendaryOrbs} upgrades={upgrades} onBuy={handleBuyUpgrade} onBack={() => setScreen('MENU')} />}
          {screen === 'PRESTIGESHOP' && <PrestigeShop prestigePoints={prestigePoints} prestige={prestige} canUseShop={prestigePoints > 0} onBuy={handlePrestigeUpgrade} onBack={() => setScreen('MENU')} />}
        </div>
      </main>
    </div>
  );
}
