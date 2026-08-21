/**
 * Fonctions pures de progression (XP/niveaux, roue, bonus quotidien, tables).
 * Le temps est TOUJOURS passé en paramètre → fonctions déterministes, testables.
 */

import {
  WHEEL_SEGMENTS,
  levelForXp,
  xpToReachLevel,
  coinsRewardForLevel,
  LEVEL_MILESTONES,
  dailyBonusForStreak,
  type WheelSegment,
} from "./config";

// ----------------------------------------------------------------- XP

export interface XpProgress {
  level: number;
  /** XP accumulée dans le niveau courant. */
  into: number;
  /** XP totale nécessaire pour passer au niveau suivant. */
  span: number;
  /** Fraction 0..1 de progression dans le niveau. */
  pct: number;
}

export function xpProgress(xp: number): XpProgress {
  const level = levelForXp(xp);
  const base = xpToReachLevel(level);
  const next = xpToReachLevel(level + 1);
  const span = Math.max(1, next - base);
  const into = Math.max(0, xp - base);
  return { level, into, span, pct: Math.min(1, into / span) };
}

export interface LevelUpRewards {
  levels: number[];
  coins: number;
  cosmetics: string[];
  titles: string[];
  boosts: number;
}

/** Récompenses cumulées en passant de `fromLevel` à `toLevel` (exclus → inclus). */
export function levelUpRewards(fromLevel: number, toLevel: number): LevelUpRewards {
  const out: LevelUpRewards = { levels: [], coins: 0, cosmetics: [], titles: [], boosts: 0 };
  for (let L = fromLevel + 1; L <= toLevel; L++) {
    out.levels.push(L);
    out.coins += coinsRewardForLevel(L);
    const m = LEVEL_MILESTONES[L];
    if (m?.cosmeticId) out.cosmetics.push(m.cosmeticId);
    if (m?.title) out.titles.push(m.title);
    if (m?.boosts) out.boosts += m.boosts;
  }
  return out;
}

// ---------------------------------------------------------------- Roue

/** Tire un segment de la roue selon les poids. `rand` ∈ [0,1). */
export function spinWheel(rand: number): WheelSegment {
  const total = WHEEL_SEGMENTS.reduce((s, seg) => s + seg.weight, 0);
  let x = rand * total;
  for (const seg of WHEEL_SEGMENTS) {
    if (x < seg.weight) return seg;
    x -= seg.weight;
  }
  return WHEEL_SEGMENTS[WHEEL_SEGMENTS.length - 1];
}

// -------------------------------------------------------- Bonus quotidien

/** Numéro de jour (UTC) d'un timestamp ms. */
export function dayNumber(ms: number): number {
  return Math.floor(ms / (24 * 60 * 60 * 1000));
}

export interface DailyClaim {
  canClaim: boolean;
  newStreak: number;
  amount: number;
}

/**
 * Calcule le bonus quotidien. `lastClaimDay` = -1 si jamais réclamé.
 * Série +1 si réclamé la veille, remise à 1 si un jour manqué.
 */
export function computeDailyBonus(
  lastClaimDay: number,
  currentStreak: number,
  nowMs: number,
): DailyClaim {
  const today = dayNumber(nowMs);
  if (lastClaimDay === today) {
    return { canClaim: false, newStreak: currentStreak, amount: 0 };
  }
  const newStreak = lastClaimDay === today - 1 ? currentStreak + 1 : 1;
  return { canClaim: true, newStreak, amount: dailyBonusForStreak(newStreak) };
}

// ---------------------------------------------------------------- Tables

export function canAfford(balance: number, entry: number): boolean {
  return balance >= entry;
}

/**
 * Résultat financier d'une partie EN LIGNE (pot commun).
 * pot = entry × nbJoueurs. Le vainqueur emporte le pot ; si `refundSecond`,
 * le 2ᵉ récupère sa mise.
 */
export function onlinePayout(
  entry: number,
  playerCount: number,
  rank: number, // 1 = vainqueur, 2 = deuxième, ...
  refundSecond: boolean,
): number {
  const pot = entry * playerCount;
  if (rank === 1) return pot;
  if (rank === 2 && refundSecond) return entry;
  return 0;
}
