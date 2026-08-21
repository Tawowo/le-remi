/**
 * Bots — adversaires crédibles. Ils ne voient QUE leur main et la défausse
 * visible (aucune triche). Décisions basées sur l'utilité réelle des cartes.
 */

import type { Card } from "./cards";
import { cardValue } from "./cards";
import { bestDecomposition, isolatedPoints } from "./combinations";
import type { BotProfile, DrawSource, GameState } from "./engine";
import { topDiscard } from "./engine";

export const PROFILES: Record<
  BotProfile,
  { label: string; blurb: string; poseThreshold: number }
> = {
  prudent: { label: "Prudent", blurb: "Pose dès que possible, garde les petites cartes.", poseThreshold: 10 },
  equilibre: { label: "Équilibré", blurb: "Joue la carte du milieu, ni trop tôt ni trop tard.", poseThreshold: 7 },
  audacieux: { label: "Audacieux", blurb: "Retarde pour viser le Rémi sec, prend des risques.", poseThreshold: 3 },
};

export const BOT_NAMES = [
  "Léo", "Nina", "Sacha", "Jade", "Malo", "Zoé", "Tom", "Lila", "Noé", "Manon",
];

export function pickProfile(rand: () => number = Math.random): BotProfile {
  const keys = Object.keys(PROFILES) as BotProfile[];
  return keys[Math.floor(rand() * keys.length)];
}

/**
 * Meilleure carte à défausser dans une main sur-dimensionnée (per + 1 cartes) :
 * on cherche la défausse qui minimise les points isolés restants.
 * Tie-break : jeter la carte isolée de plus forte valeur (utilité potentielle
 * la plus faible), en évitant les cartes déjà engagées dans une combinaison.
 */
export function bestDiscard(hand: Card[]): { cardId: string; isolated: number } {
  let best: { cardId: string; isolated: number; tieValue: number } | null = null;

  for (const c of hand) {
    const rest = hand.filter((x) => x.id !== c.id);
    const iso = isolatedPoints(rest);
    // la carte jetée est-elle potentiellement utile (voisine / paire) ?
    const potential = cardPotential(c, rest);
    // on préfère jeter une carte à forte valeur ET faible potentiel
    const tieValue = cardValue(c) - potential * 4;
    if (
      best === null ||
      iso < best.isolated ||
      (iso === best.isolated && tieValue > best.tieValue)
    ) {
      best = { cardId: c.id, isolated: iso, tieValue };
    }
  }
  return { cardId: best!.cardId, isolated: best!.isolated };
}

/** Potentiel d'une carte : paires (→ brelan) et voisins même famille (→ suite). */
function cardPotential(card: Card, others: Card[]): number {
  let score = 0;
  for (const o of others) {
    if (o.rank === card.rank) score += 2; // paire → brelan possible
    if (o.suit === card.suit && Math.abs(o.rank - card.rank) <= 2) score += 1; // voisin → suite
  }
  return score;
}

/** Le bot doit-il piocher au stock ou prendre la défausse visible ? */
export function botDraw(state: GameState): DrawSource {
  const hand = state.players[state.turn].hand;
  const top = topDiscard(state);
  if (!top) return "stock";

  const base = bestDiscard([...hand, ...pseudoStockCard(hand)]).isolated;
  const withDiscard = bestDiscard([...hand, top]).isolated;

  // Prendre la défausse si elle améliore réellement la main.
  return withDiscard < base ? "discard" : "stock";
}

/**
 * Approxime l'effet d'une pioche « inconnue » : on estime que la carte piochée
 * ne sert en moyenne pas ce tour-ci → on garde la main telle quelle comme base.
 * (On renvoie une main vide additionnelle : bestDiscard sur `hand` seul.)
 */
function pseudoStockCard(_hand: Card[]): Card[] {
  return [];
}

export interface BotPlan {
  cardId: string;
  pose: boolean;
}

/** Après avoir pioché (main = per + 1), choisir la défausse et décider de poser. */
export function botDiscardAndMaybePose(state: GameState): BotPlan {
  const player = state.players[state.turn];
  const profile: BotProfile = player.profile ?? "equilibre";
  const { cardId, isolated } = bestDiscard(player.hand);

  const threshold = PROFILES[profile].poseThreshold;
  const stockLow = state.stock.length < state.players.length;

  let pose = false;
  if (isolated <= 10) {
    if (isolated === 0) pose = true; // Rémi sec : toujours tentant
    else if (isolated <= threshold) pose = true;
    else if (stockLow) pose = true; // fin de pioche : on sécurise
  }

  return { cardId, pose };
}

/** Délai de réflexion crédible (ms), plus long sur les décisions difficiles. */
export function botThinkingDelay(state: GameState, rand: () => number = Math.random): number {
  const hand = state.players[state.turn].hand;
  const iso = isolatedPoints(hand);
  const hard = iso <= 12 ? 1 : 0; // proche de pouvoir poser → réfléchit plus
  const base = 800 + rand() * 1200;
  return Math.round(base + hard * (400 + rand() * 900));
}

/** Combinaisons détectées d'une main (pour d'éventuels indicateurs). */
export function describeHand(hand: Card[]) {
  return bestDecomposition(hand);
}
