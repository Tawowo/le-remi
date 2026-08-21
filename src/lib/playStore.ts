import type { GameState } from "./game/engine";
import type { RoundLike } from "./profiles";

/**
 * Persistance locale de la partie jouable en cours (mode solo).
 * Préfixe `remi:` comme le reste. Tolérant au SSR.
 */

const KEY_CURRENT = "remi:play:current";

export interface PlayTable {
  tier: string;
  label: string;
  entry: number;
  soloWin: number;
  felt: string;
}

export interface PlaySession {
  id: string;
  mode: "solo" | "online";
  state: GameState;
  createdAt: number;
  /** Journal des manches terminées (pour les stats de fin de partie). */
  roundsLog?: RoundLike[];
  /** Table d'enjeu (mise/gain) si la partie est misée. */
  table?: PlayTable;
}

function hasWindow(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

export function saveCurrentPlay(session: PlaySession): void {
  if (!hasWindow()) return;
  try {
    window.localStorage.setItem(KEY_CURRENT, JSON.stringify(session));
  } catch {
    /* quota / privé */
  }
}

export function loadCurrentPlay(): PlaySession | null {
  if (!hasWindow()) return null;
  try {
    const raw = window.localStorage.getItem(KEY_CURRENT);
    return raw ? (JSON.parse(raw) as PlaySession) : null;
  } catch {
    return null;
  }
}

export function clearCurrentPlay(): void {
  if (!hasWindow()) return;
  window.localStorage.removeItem(KEY_CURRENT);
}
