/**
 * Profil local du joueur : pièces, XP/niveau, série quotidienne, cosmétiques,
 * boosts, portefeuille. localStorage versionné (migrations propres).
 * Le solde/niveau seront répliqués côté Supabase en ligne (affichage aux autres).
 */

import { STARTING_COINS, MAX_LEVEL, levelForXp } from "./config";
import { DEFAULT_OWNED, DEFAULT_EQUIPPED, cosmetic } from "../cosmetics/catalog";
import { levelUpRewards, type LevelUpRewards } from "./progression";

const KEY = "remi:profile";
const VERSION = 1;

export interface WalletEntry {
  at: number;
  delta: number;
  reason: string;
  balanceAfter: number;
}

export interface Equipped {
  back: string;
  felt: string;
  deck: string;
  frame: string | null;
}

export interface Profile {
  version: number;
  onboarded: boolean;
  pseudo: string;
  avatar: string; // emoji, id de galerie, ou data:URL (photo)
  color: string;
  title: string;
  coins: number;
  xp: number;
  level: number;
  dailyStreak: number;
  lastDailyDay: number; // -1 = jamais
  lastWheelMs: number; // 0 = jamais
  owned: string[];
  equipped: Equipped;
  boosts: number; // charges de boost XP ×2 (par partie)
  titlesUnlocked: string[];
  wallet: WalletEntry[];
  lastPlayDay: number; // pour l'XP « première partie du jour »
}

export const AVATAR_GALLERY = ["🦊", "🐼", "🦉", "🐺", "🦁", "🐯", "🐨", "🐸", "🦖", "🐙", "🦄", "🐝"];

export function defaultProfile(): Profile {
  return {
    version: VERSION,
    onboarded: false,
    pseudo: "",
    avatar: "av-chat",
    color: "#d4af37",
    title: "Apprenti du Rémi",
    coins: STARTING_COINS,
    xp: 0,
    level: 1,
    dailyStreak: 0,
    lastDailyDay: -1,
    lastWheelMs: 0,
    owned: [...DEFAULT_OWNED],
    equipped: { ...DEFAULT_EQUIPPED },
    boosts: 0,
    titlesUnlocked: ["Apprenti du Rémi"],
    wallet: [],
    lastPlayDay: -1,
  };
}

function hasWindow(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

function migrate(raw: unknown): Profile {
  const base = defaultProfile();
  if (!raw || typeof raw !== "object") return base;
  const p = raw as Partial<Profile>;
  // Migration des anciens ids de cosmétiques (V3 → Collections).
  const remapFelt = (id?: string) => (id && id.startsWith("felt-") && !id.startsWith("felt-emeraude") && LEGACY_FELT[id]) || id;
  const eqIn: Partial<Equipped> = p.equipped ?? {};
  const equipped: Equipped = {
    back: BY_ID_HAS(eqIn.back) ? eqIn.back! : "back-classique",
    felt: BY_ID_HAS(remapFelt(eqIn.felt)) ? (remapFelt(eqIn.felt) as string) : "felt-emeraude",
    deck: BY_ID_HAS(eqIn.deck) ? (eqIn.deck as string) : "deck-classique",
    frame: eqIn.frame && BY_ID_HAS(eqIn.frame) ? eqIn.frame : null,
  };

  const merged: Profile = {
    ...base,
    ...p,
    version: VERSION,
    equipped,
    owned: Array.isArray(p.owned) ? Array.from(new Set([...DEFAULT_OWNED, ...p.owned])) : base.owned,
    titlesUnlocked: Array.isArray(p.titlesUnlocked) ? p.titlesUnlocked : base.titlesUnlocked,
    wallet: Array.isArray(p.wallet) ? p.wallet : [],
  };
  merged.level = levelForXp(merged.xp);
  return merged;
}

const LEGACY_FELT: Record<string, string> = {
  "felt-vert": "felt-emeraude",
  "felt-bois": "felt-noyer",
  "felt-minuit": "felt-velours",
  "felt-or": "felt-trone",
};
function BY_ID_HAS(id?: string): boolean {
  return !!id && !!cosmetic(id);
}

export function loadProfile(): Profile {
  if (!hasWindow()) return defaultProfile();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return defaultProfile();
    return migrate(JSON.parse(raw));
  } catch {
    return defaultProfile();
  }
}

export function saveProfile(p: Profile): void {
  if (!hasWindow()) return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* quota / privé */
  }
}

// ---------------------------------------------------------------- mutations

function pushWallet(p: Profile, delta: number, reason: string): Profile {
  const coins = Math.max(0, p.coins + delta);
  const entry: WalletEntry = { at: Date.now(), delta, reason, balanceAfter: coins };
  return { ...p, coins, wallet: [entry, ...p.wallet].slice(0, 300) };
}

export function credit(p: Profile, amount: number, reason: string): Profile {
  if (amount <= 0) return p;
  return pushWallet(p, amount, reason);
}

export function debit(p: Profile, amount: number, reason: string): Profile {
  if (amount <= 0) return p;
  return pushWallet(p, -Math.min(amount, p.coins), reason);
}

export interface XpResult {
  profile: Profile;
  gained: number;
  levelUp: LevelUpRewards | null;
}

/** Ajoute de l'XP (× boost si actif), applique les récompenses de niveau. */
export function addXp(p: Profile, baseAmount: number, boosted = false): XpResult {
  if (baseAmount <= 0) return { profile: p, gained: 0, levelUp: null };
  const gained = boosted ? baseAmount * 2 : baseAmount;
  const fromLevel = p.level;
  const xp = p.xp + gained;
  const toLevel = levelForXp(xp);

  let next: Profile = { ...p, xp, level: toLevel };
  let levelUp: LevelUpRewards | null = null;

  if (toLevel > fromLevel && fromLevel < MAX_LEVEL) {
    levelUp = levelUpRewards(fromLevel, toLevel);
    next = credit(next, levelUp.coins, `Niveau ${toLevel}`);
    if (levelUp.cosmetics.length) {
      next = { ...next, owned: Array.from(new Set([...next.owned, ...levelUp.cosmetics])) };
    }
    if (levelUp.titles.length) {
      next = { ...next, titlesUnlocked: Array.from(new Set([...next.titlesUnlocked, ...levelUp.titles])) };
    }
    if (levelUp.boosts) next = { ...next, boosts: next.boosts + levelUp.boosts };
  }

  return { profile: next, gained, levelUp };
}

export function grantCosmetic(p: Profile, id: string): Profile {
  if (p.owned.includes(id)) return p;
  return { ...p, owned: [...p.owned, id] };
}

export function equip(p: Profile, type: "back" | "felt" | "deck" | "frame", id: string | null): Profile {
  return { ...p, equipped: { ...p.equipped, [type]: id } };
}

export function setAvatar(p: Profile, avatar: string): Profile {
  return { ...p, avatar };
}
