/**
 * Moteur du jeu jouable — état + transitions pures (aucun effet de bord).
 * Le décompte s'appuie sur `scoring.ts` (source de vérité unique).
 */

import type { Card } from "./cards";
import { freshDeck, shuffle, mulberry32 } from "./cards";
import { bestDecomposition, isolatedPoints, canLayDown, type Decomposition } from "./combinations";
import { scoreRound, evaluateGameEnd, type RoundResult } from "../scoring";

export type BotProfile = "prudent" | "equilibre" | "audacieux";
export type Phase = "draw" | "discard" | "roundEnd" | "gameEnd";
export type DrawSource = "stock" | "discard";

export interface EnginePlayer {
  id: string;
  name: string;
  color: string;
  isBot: boolean;
  profile?: BotProfile;
  hand: Card[];
  /** Déconnecté (multijoueur) — un bot prend le relais. */
  disconnected?: boolean;
}

export interface RoundOutcome {
  poserIndex: number;
  points: number[];
  result: RoundResult;
  decompositions: Decomposition[];
}

export interface GameState {
  players: EnginePlayer[];
  stock: Card[]; // dessus = index 0
  discard: Card[]; // dessus = dernier élément
  turn: number;
  phase: Phase;
  dealerIndex: number;
  roundNumber: number;
  target: number;
  scores: number[];
  seed: number;
  outcome: RoundOutcome | null;
  winnerIndex: number | null;
}

export interface NewGameConfig {
  target: number;
  dealerIndex?: number;
  seed?: number;
}

function cardsPerPlayer(count: number): number {
  return count === 2 ? 10 : 7;
}

/** Distribue une manche : renvoie stock, défausse, mains, premier joueur. */
function deal(
  players: EnginePlayer[],
  dealerIndex: number,
  seed: number,
): Pick<GameState, "players" | "stock" | "discard" | "turn" | "phase"> {
  const n = players.length;
  const deck = shuffle(freshDeck(), mulberry32(seed));
  const per = cardsPerPlayer(n);

  const dealt: EnginePlayer[] = players.map((p) => ({ ...p, hand: [] }));
  let idx = 0;
  for (let r = 0; r < per; r++) {
    for (let p = 0; p < n; p++) {
      dealt[p].hand.push(deck[idx++]);
    }
  }
  const discard: Card[] = [deck[idx++]]; // carte retournée
  const stock = deck.slice(idx);
  const turn = (dealerIndex + 1) % n; // gauche du donneur commence

  return { players: dealt, stock, discard, turn, phase: "draw" };
}

export function startGame(players: EnginePlayer[], config: NewGameConfig): GameState {
  const dealerIndex = config.dealerIndex ?? 0;
  const seed = (config.seed ?? Math.floor(Math.random() * 2 ** 31)) >>> 0;
  const round = deal(players, dealerIndex, seed);
  return {
    ...round,
    dealerIndex,
    roundNumber: 1,
    target: config.target,
    scores: new Array(players.length).fill(0),
    seed,
    outcome: null,
    winnerIndex: null,
  };
}

export function currentPlayer(state: GameState): EnginePlayer {
  return state.players[state.turn];
}

export function topDiscard(state: GameState): Card | null {
  return state.discard.length ? state.discard[state.discard.length - 1] : null;
}

/** Pioche : reforme le stock depuis la défausse si nécessaire (coupe, sans mélange). */
function ensureStock(state: GameState): GameState {
  if (state.stock.length > 0) return state;
  if (state.discard.length <= 1) return state; // rien à faire (cas extrême)
  const top = state.discard[state.discard.length - 1];
  const rest = state.discard.slice(0, -1);
  // « coupe » : on retourne le paquet sans mélanger
  const newStock = [...rest].reverse();
  return { ...state, stock: newStock, discard: [top] };
}

export function drawCard(state: GameState, source: DrawSource): GameState {
  if (state.phase !== "draw") return state;
  const players = state.players.map((p) => ({ ...p, hand: [...p.hand] }));

  if (source === "discard") {
    if (state.discard.length === 0) return state;
    const discard = [...state.discard];
    const card = discard.pop()!;
    players[state.turn].hand.push(card);
    return { ...state, players, discard, phase: "discard" };
  }

  // source stock
  let s = ensureStock(state);
  if (s.stock.length === 0) return s;
  const stock = [...s.stock];
  const card = stock.shift()!;
  const ps = s.players.map((p) => ({ ...p, hand: [...p.hand] }));
  ps[s.turn].hand.push(card);
  return { ...s, players: ps, stock, phase: "discard" };
}

export function discardCard(state: GameState, cardId: string): GameState {
  if (state.phase !== "discard") return state;
  const players = state.players.map((p) => ({ ...p, hand: [...p.hand] }));
  const hand = players[state.turn].hand;
  const i = hand.findIndex((c) => c.id === cardId);
  if (i < 0) return state;
  const [card] = hand.splice(i, 1);
  const discard = [...state.discard, card];
  const turn = (state.turn + 1) % state.players.length;
  return { ...state, players, discard, turn, phase: "draw" };
}

/** Le joueur courant pose : défausse `cardId` puis, si isolés ≤ 10, clôt la manche. */
export function layDown(state: GameState, cardId: string): GameState {
  if (state.phase !== "discard") return state;
  const players = state.players.map((p) => ({ ...p, hand: [...p.hand] }));
  const poser = players[state.turn];
  const i = poser.hand.findIndex((c) => c.id === cardId);
  if (i < 0) return state;
  const [card] = poser.hand.splice(i, 1);
  const discard = [...state.discard, card];

  if (!canLayDown(poser.hand)) {
    // pose invalide : on refuse (l'UI ne doit pas proposer ce cas)
    return state;
  }

  return finishRound({ ...state, players, discard }, state.turn);
}

/** Clôt la manche : décompte via scoring.ts, cumul, détection de fin de partie. */
function finishRound(state: GameState, poserIndex: number): GameState {
  const decompositions = state.players.map((p) => bestDecomposition(p.hand));
  const points = decompositions.map((d) => d.isolatedPoints);

  const result = scoreRound({
    playerCount: state.players.length,
    poserIndex,
    points,
  });

  const scores = state.scores.map((s, i) => s + result.deltas[i]);
  const { finished, podium } = evaluateGameEnd(scores, state.target);

  return {
    ...state,
    scores,
    outcome: { poserIndex, points, result, decompositions },
    phase: finished ? "gameEnd" : "roundEnd",
    winnerIndex: finished ? podium[0] : null,
  };
}

/** Passe à la manche suivante (donneur tournant horaire). */
export function nextRound(state: GameState): GameState {
  if (state.phase !== "roundEnd") return state;
  const dealerIndex = (state.dealerIndex + 1) % state.players.length;
  const seed = (state.seed + state.roundNumber * 2654435761) >>> 0;
  const round = deal(state.players, dealerIndex, seed);
  return {
    ...state,
    ...round,
    dealerIndex,
    roundNumber: state.roundNumber + 1,
    seed,
    outcome: null,
  };
}

/** Points isolés de la main courante (aide UI). */
export function handIsolatedPoints(hand: Card[]): number {
  return isolatedPoints(hand);
}
