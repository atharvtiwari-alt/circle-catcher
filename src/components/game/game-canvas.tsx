import React, { useEffect, useRef } from 'react';
import { BattleChallengeDef, DEFAULT_LAB, DEFAULT_SHOP, LabState, ShopBuffs } from '../../types/orbs';
import { DEFAULT_PRESTIGE, PrestigeState } from '../../types/prestige';
import { DEFAULT_UPGRADES, UpgradeState, getEffectiveUpgradeLevels } from '../../types/upgrades';

interface GameCanvasProps {
  key?: number;
  onScore: (score: number) => void;
  onLifeLost: (lives: number) => void;
  onGameOver: () => void;
  onBossDefeated: (extraPP: number) => void;
  onOrbEarned: (type: string, count: number) => void;
  upgrades: UpgradeState;
  prestige: PrestigeState;
  lab: LabState;
  shopBuffs: ShopBuffs;
  battleChallenge: BattleChallengeDef | null;
}

const LOGICAL_WIDTH = 800;
const LOGICAL_HEIGHT = 600;
const BASE_PLAYER_SIZE = 60;
const BASE_LIVES = 3;

type CircleType = 'normal' | 'rare' | 'epic' | 'legendary' | 'special';

interface CircleDef {
  color: string;
  glowColor: string;
  radius: number;
  points: number;
  speedMult: number;
  label: string;
  orbDrop: number;
  orbDropChance: number;
}

const CIRCLE_DEFS: Record<CircleType, CircleDef> = {
  normal: { color: '#ffff00', glowColor: '#ffff00', radius: 15, points: 10, speedMult: 1, label: '', orbDrop: 0, orbDropChance: 0.03 },
  rare: { color: '#00ffff', glowColor: '#00ffff', radius: 13, points: 50, speedMult: 1.3, label: 'RARE', orbDrop: 1, orbDropChance: 0.08 },
  epic: { color: '#cc44ff', glowColor: '#ff00ff', radius: 11, points: 150, speedMult: 1.7, label: 'EPIC', orbDrop: 2, orbDropChance: 0.15 },
  legendary: { color: '#ff8800', glowColor: '#ffaa00', radius: 20, points: 500, speedMult: 0.7, label: '★ LEGENDARY', orbDrop: 3, orbDropChance: 0.3 },
  special: { color: '#ff66ff', glowColor: '#ffffff', radius: 12, points: 75, speedMult: 0.9, label: '✦ SPECIAL', orbDrop: 1, orbDropChance: 1 },
};

interface Circle { id: number; x: number; y: number; r: number; speed: number; type: CircleType; pulse: number; }

function pickCircleType(specialChance: number): CircleType {
  const roll = Math.random();
  if (roll < specialChance) return 'special';
  if (roll < 0.8) return 'normal';
  if (roll < 0.92) return 'rare';
  if (roll < 0.98) return 'epic';
  return 'legendary';
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  onScore,
  onLifeLost,
  onGameOver,
  onBossDefeated,
  onOrbEarned,
  upgrades,
  prestige,
  lab,
  shopBuffs,
  battleChallenge,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const onScoreRef = useRef(onScore);
  const onLifeLostRef = useRef(onLifeLost);
  const onGameOverRef = useRef(onGameOver);
  const onBossDefeatedRef = useRef(onBossDefeated);
  const onOrbEarnedRef = useRef(onOrbEarned);
  const upgradesRef = useRef(upgrades);
  const prestigeRef = useRef(prestige);
  const labRef = useRef(lab);

  useEffect(() => { onScoreRef.current = onScore; }, [onScore]);
  useEffect(() => { onLifeLostRef.current = onLifeLost; }, [onLifeLost]);
  useEffect(() => { onGameOverRef.current = onGameOver; }, [onGameOver]);
  useEffect(() => { onBossDefeatedRef.current = onBossDefeated; }, [onBossDefeated]);
  useEffect(() => { onOrbEarnedRef.current = onOrbEarned; }, [onOrbEarned]);
  useEffect(() => { upgradesRef.current = upgrades; }, [upgrades]);
  useEffect(() => { prestigeRef.current = prestige; }, [prestige]);
  useEffect(() => { labRef.current = lab; }, [lab]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const effective = getEffectiveUpgradeLevels(upgradesRef.current ?? DEFAULT_UPGRADES);
    const currentPrestige = prestigeRef.current ?? DEFAULT_PRESTIGE;
    const currentLab = labRef.current ?? DEFAULT_LAB;
    const currentShop = shopBuffs ?? DEFAULT_SHOP;

    const playerSize = BASE_PLAYER_SIZE + effective.catcherSize * 10;
    const startLives = BASE_LIVES + effective.extraLives + currentShop.extraLife;
    const creditMult = 1 + effective.creditMultiplier * 0.25 + currentPrestige.creditBoost * 0.15 + currentLab.creditLens * 0.1 + currentShop.creditSurge * 0.5;
    const speedBoost = 0.45 + effective.moveSpeed * 0.08 + currentShop.speedBoost * 0.08;
    const specialChance = 0.02 + currentLab.orbMagnet * 0.01;

    const state = {
      score: 0,
      lives: startLives,
      playerX: LOGICAL_WIDTH / 2 - playerSize / 2,
      playerY: LOGICAL_HEIGHT - playerSize - 20,
      circles: [] as Circle[],
      nextCircleId: 0,
      spawnTimer: 0,
      spawnRate: battleChallenge ? 900 : 1200,
      speedMultiplier: 1,
      lastTime: performance.now(),
      keys: { left: false, right: false },
      isActive: true,
      bossTimer: 0,
    };

    const loseLife = () => {
      state.lives -= 1;
      onLifeLostRef.current(state.lives);
      if (state.lives <= 0) {
        state.isActive = false;
        onGameOverRef.current();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') state.keys.left = true;
      if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') state.keys.right = true;
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') state.keys.left = false;
      if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') state.keys.right = false;
    };

    const handlePointer = (clientX: number) => {
      const rect = canvas.getBoundingClientRect();
      const ratio = LOGICAL_WIDTH / rect.width;
      state.playerX = Math.max(0, Math.min((clientX - rect.left) * ratio - playerSize / 2, LOGICAL_WIDTH - playerSize));
    };

    const handleMouseMove = (event: MouseEvent) => handlePointer(event.clientX);
    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches[0]) handlePointer(event.touches[0].clientX);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('touchstart', handleTouchMove, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });

    let animationFrameId = 0;

    const render = (time: number) => {
      if (!state.isActive) return;
      const dt = Math.min(time - state.lastTime, 50);
      state.lastTime = time;

      if (state.keys.left) state.playerX -= speedBoost * dt;
      if (state.keys.right) state.playerX += speedBoost * dt;
      state.playerX = Math.max(0, Math.min(state.playerX, LOGICAL_WIDTH - playerSize));

      state.spawnTimer -= dt;
      state.bossTimer += dt;

      if (state.spawnTimer <= 0) {
        const type = pickCircleType(specialChance);
        const def = CIRCLE_DEFS[type];
        state.circles.push({
          id: state.nextCircleId++,
          x: Math.random() * (LOGICAL_WIDTH - def.radius * 2) + def.radius,
          y: -def.radius * 2,
          r: def.radius,
          speed: (0.12 + Math.random() * 0.12) * state.speedMultiplier * def.speedMult,
          type,
          pulse: Math.random() * Math.PI * 2,
        });
        state.spawnTimer = Math.max(350, state.spawnRate * Math.pow(0.9, currentPrestige.spawnBoost));
        state.speedMultiplier += 0.004;
      }

      if (state.bossTimer >= (battleChallenge ? 15000 : 30000)) {
        state.bossTimer = 0;
        onBossDefeatedRef.current(battleChallenge?.ppReward ?? 0);
      }

      for (let i = state.circles.length - 1; i >= 0; i -= 1) {
        const circle = state.circles[i];
        circle.y += circle.speed * dt;
        circle.pulse += 0.08;

        const closestX = Math.max(state.playerX, Math.min(circle.x, state.playerX + playerSize));
        const closestY = Math.max(state.playerY, Math.min(circle.y, state.playerY + playerSize));
        const dx = circle.x - closestX;
        const dy = circle.y - closestY;

        if (dx * dx + dy * dy < circle.r * circle.r) {
          const def = CIRCLE_DEFS[circle.type];
          const earned = Math.round(def.points * creditMult * (1 + effective.scoreMultiplier * 0.2));
          state.score += earned;
          onScoreRef.current(state.score);
          if (circle.type !== 'normal') {
            const orbType = circle.type === 'legendary' ? 'legendary' : circle.type === 'epic' ? 'epic' : 'rare';
            const orbs = def.orbDrop;
            onOrbEarnedRef.current(orbType, orbs);
          }
          state.circles.splice(i, 1);
          continue;
        }

        if (circle.y - circle.r > LOGICAL_HEIGHT) {
          state.circles.splice(i, 1);
          if (circle.type !== 'special') loseLife();
        }
      }

      ctx.clearRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

      ctx.shadowBlur = 20;
      ctx.shadowColor = '#00ff88';
      ctx.fillStyle = '#00ff88';
      ctx.fillRect(state.playerX, state.playerY, playerSize, playerSize);
      ctx.shadowBlur = 0;

      state.circles.forEach((circle) => {
        const def = CIRCLE_DEFS[circle.type];
        const radius = circle.r * (1 + Math.sin(circle.pulse) * 0.05);
        ctx.shadowBlur = 12;
        ctx.shadowColor = def.glowColor;
        ctx.fillStyle = def.color;
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, radius, 0, Math.PI * 2);
        ctx.fill();

        if (def.label) {
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#ffffff';
          ctx.font = '12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(def.label, circle.x, circle.y - radius - 8);
        }
      });

      ctx.shadowBlur = 0;
      ctx.fillStyle = '#f8fafc';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Lives: ${state.lives}`, 16, 24);
      ctx.fillText(`Catch special circles, dodge misses`, 16, 46);

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      state.isActive = false;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('touchstart', handleTouchMove);
      container.removeEventListener('touchmove', handleTouchMove);
    };
  }, [battleChallenge, onBossDefeated, onGameOver, onLifeLost, onOrbEarned, onScore, shopBuffs]);

  return (
    <div ref={containerRef} className="relative w-full h-full max-w-4xl mx-auto flex items-center justify-center bg-black/40 backdrop-blur-sm border-x border-neon-cyan/20 overflow-hidden cursor-crosshair touch-none">
      <canvas ref={canvasRef} width={LOGICAL_WIDTH} height={LOGICAL_HEIGHT} className="w-full h-full object-contain" />
    </div>
  );
};
