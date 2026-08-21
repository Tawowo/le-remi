import type { Game, Settings } from "./types";

/**
 * Persistance 100 % locale (localStorage), préfixe `remi:`.
 * Aucune inscription, aucun backend. Tolérant au SSR (garde `window`).
 */

const PREFIX = "remi:";
const KEY_CURRENT = `${PREFIX}current`; // partie en cours (id)
const KEY_GAMES = `${PREFIX}games`; // toutes les parties (archivées + en cours)
const KEY_SETTINGS = `${PREFIX}settings`;

function hasWindow(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

function read<T>(key: string, fallback: T): T {
  if (!hasWindow()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  if (!hasWindow()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota / mode privé : on ignore silencieusement */
  }
}

export function newId(): string {
  if (hasWindow() && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  // Repli déterministe-safe (jamais Math.random côté serveur).
  return `id-${Date.now()}-${Math.floor(Math.random() * 1e9).toString(36)}`;
}

// ---------- Parties ----------

export function loadGames(): Game[] {
  const games = read<Game[]>(KEY_GAMES, []);
  return Array.isArray(games) ? games : [];
}

export function saveGames(games: Game[]): void {
  write(KEY_GAMES, games);
}

export function upsertGame(game: Game): void {
  const games = loadGames();
  const idx = games.findIndex((g) => g.id === game.id);
  if (idx >= 0) games[idx] = game;
  else games.unshift(game);
  saveGames(games);
}

export function deleteGame(id: string): void {
  saveGames(loadGames().filter((g) => g.id !== id));
  if (getCurrentGameId() === id) clearCurrentGame();
}

export function getGame(id: string): Game | null {
  return loadGames().find((g) => g.id === id) ?? null;
}

export function getCurrentGameId(): string | null {
  return read<string | null>(KEY_CURRENT, null);
}

export function setCurrentGame(id: string): void {
  write(KEY_CURRENT, id);
}

export function clearCurrentGame(): void {
  if (!hasWindow()) return;
  window.localStorage.removeItem(KEY_CURRENT);
}

export function getCurrentGame(): Game | null {
  const id = getCurrentGameId();
  if (!id) return null;
  return getGame(id);
}

// ---------- Réglages ----------

const DEFAULT_SETTINGS: Settings = { theme: "dark", sound: true, vibration: true, animations: "full" };

export function loadSettings(): Settings {
  return { ...DEFAULT_SETTINGS, ...read<Partial<Settings>>(KEY_SETTINGS, {}) };
}

export function saveSettings(settings: Settings): void {
  write(KEY_SETTINGS, settings);
}
