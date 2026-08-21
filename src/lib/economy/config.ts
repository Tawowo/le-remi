/**
 * ÉCONOMIE & PROGRESSION — configuration centralisée.
 * TOUS les montants, probabilités et paliers sont ici : ajustables en une
 * ligne. Voir ECONOMY.md pour la documentation d'équilibrage.
 *
 * PRINCIPE ABSOLU : monnaie 100 % virtuelle (« pièces »). Aucun achat réel,
 * nulle part. Ce n'est pas un casino.
 */

export const STARTING_COINS = 500;

/** Bonus quotidien de connexion, par jour de série (jour 1 → 7+). */
export const DAILY_BONUS_BY_STREAK = [100, 120, 150, 180, 220, 260, 300] as const;
export function dailyBonusForStreak(streak: number): number {
  const i = Math.min(Math.max(streak, 1), DAILY_BONUS_BY_STREAK.length) - 1;
  return DAILY_BONUS_BY_STREAK[i];
}

/** ------------------------------------------------------------------ Roue */

export type WheelKind = "coins" | "boost" | "spin";

export interface WheelSegment {
  id: string;
  label: string;
  kind: WheelKind;
  /** Montant de pièces (kind=coins), nb de parties de boost (kind=boost), ou tours (kind=spin). */
  amount: number;
  /** Poids = probabilité en % (la somme fait 100). */
  weight: number;
  color: string;
}

/**
 * Segments de la roue. NB : le cahier V3 listait des probabilités sommant à
 * 80 % ; on porte le segment « 50 pièces » à 50 % pour un total de 100 %, et
 * on AFFICHE les probabilités réelles à côté de la roue (équité assumée).
 */
export const WHEEL_SEGMENTS: WheelSegment[] = [
  { id: "c50", label: "50", kind: "coins", amount: 50, weight: 50, color: "#5cba7d" },
  { id: "c100", label: "100", kind: "coins", amount: 100, weight: 25, color: "#4aa8d8" },
  { id: "c200", label: "200", kind: "coins", amount: 200, weight: 10, color: "#b57edc" },
  { id: "boost", label: "Boost XP ×2", kind: "boost", amount: 3, weight: 5, color: "#e8934a" },
  { id: "c500", label: "500", kind: "coins", amount: 500, weight: 4, color: "#e0524d" },
  { id: "spin", label: "Tour bonus", kind: "spin", amount: 1, weight: 3, color: "#8bd" },
  { id: "c1000", label: "1000", kind: "coins", amount: 1000, weight: 2, color: "#d4af37" },
  { id: "jackpot", label: "JACKPOT 5000", kind: "coins", amount: 5000, weight: 1, color: "#f4d670" },
];

export const WHEEL_COOLDOWN_MS = 24 * 60 * 60 * 1000;

/** ---------------------------------------------------------------- Tables */

export type TableTier = "decouverte" | "bistrot" | "bronze" | "argent" | "or" | "prestige";
export type BotDifficulty = "facile" | "moyen" | "difficile";

export interface TableDef {
  tier: TableTier;
  label: string;
  entry: number;
  /** Gain fixe à la victoire en solo vs bots. */
  soloWin: number;
  /** À partir de cette table, le 2ᵉ récupère sa mise (multijoueur). */
  refundSecond: boolean;
  botDifficulty: BotDifficulty;
  /** Ambiance visuelle (classe de tapis). */
  felt: string;
}

export const TABLES: TableDef[] = [
  { tier: "decouverte", label: "Découverte", entry: 0, soloWin: 30, refundSecond: false, botDifficulty: "facile", felt: "felt-decouverte" },
  { tier: "bistrot", label: "Bistrot", entry: 100, soloWin: 150, refundSecond: false, botDifficulty: "facile", felt: "felt-bistrot" },
  { tier: "bronze", label: "Bronze", entry: 500, soloWin: 800, refundSecond: false, botDifficulty: "moyen", felt: "felt-bronze" },
  { tier: "argent", label: "Argent", entry: 2000, soloWin: 3200, refundSecond: true, botDifficulty: "moyen", felt: "felt-argent" },
  { tier: "or", label: "Or", entry: 10000, soloWin: 16000, refundSecond: true, botDifficulty: "difficile", felt: "felt-or" },
  { tier: "prestige", label: "Prestige", entry: 50000, soloWin: 80000, refundSecond: true, botDifficulty: "difficile", felt: "felt-prestige" },
];

export function tableByTier(tier: TableTier): TableDef {
  return TABLES.find((t) => t.tier === tier) ?? TABLES[0];
}

/** ------------------------------------------------------------- XP & niveaux */

export const XP_EVENTS = {
  roundPlayed: 10,
  roundWon: 25,
  gameWon: 60,
  brelanPosed: 5,
  suite4: 8,
  remiSec: 40,
  contreInflicted: 30,
  firstGameOfDay: 20,
  onlineWinBonus: 30,
  dailyChallenge: 50,
} as const;

/** XP cumulée pour atteindre le niveau N : round(100 × N^1.5). */
export function xpToReachLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.round(100 * Math.pow(level, 1.5));
}

export const MAX_LEVEL = 100;

/** Niveau correspondant à une XP cumulée. */
export function levelForXp(xp: number): number {
  let level = 1;
  while (level < MAX_LEVEL && xpToReachLevel(level + 1) <= xp) level++;
  return level;
}

/** Récompense de pièces à l'obtention d'un niveau : 100 × niveau. */
export function coinsRewardForLevel(level: number): number {
  return 100 * level;
}

export interface MilestoneReward {
  cosmeticId?: string;
  title?: string;
  boosts?: number;
}
/** Cosmétiques/titres exclusifs aux paliers marquants (ids du catalogue). */
export const LEVEL_MILESTONES: Record<number, MilestoneReward> = {
  5: { cosmeticId: "back-artdeco" },
  10: { cosmeticId: "back-dragon" },
  15: { cosmeticId: "frame-or" },
  20: { cosmeticId: "deck-royaume" },
  25: { title: "Maître du Carré" },
};

/* La boutique et les cosmétiques vivent désormais dans src/lib/cosmetics/. */

/** ------------------------------------------------------------- Titres */

export const TITLES = [
  "Apprenti du Rémi",
  "Joueur de Bistrot",
  "Main d'Or",
  "Serial contreur",
  "Roi du Rémi sec",
  "Maître du Carré",
] as const;
