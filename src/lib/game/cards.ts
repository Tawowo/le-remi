/**
 * Cartes du jeu jouable — modèle pur, aucune dépendance UI.
 * rank : 1 = As, 2..10 = valeur faciale, 11 = Valet, 12 = Dame, 13 = Roi.
 */

export type Suit = "spades" | "hearts" | "diamonds" | "clubs";
export const SUITS: Suit[] = ["spades", "hearts", "diamonds", "clubs"];

export interface Card {
  /** Identifiant stable : `${suit}-${rank}` (jeu simple de 52 cartes). */
  id: string;
  suit: Suit;
  /** 1..13 (1 = As, 11 = V, 12 = D, 13 = R). */
  rank: number;
}

/** Valeur au décompte : As = 1, 2..10 = faciale, V/D/R = 10. */
export function cardValue(card: Card): number {
  if (card.rank >= 11) return 10;
  return card.rank; // As = 1, 2..10 = faciale
}

/** Libellé court d'un rang pour l'affichage ('A','2'..'10','J','Q','K'). */
export function rankLabel(rank: number): string {
  switch (rank) {
    case 1:
      return "A";
    case 11:
      return "J";
    case 12:
      return "Q";
    case 13:
      return "K";
    default:
      return String(rank);
  }
}

export function makeCard(suit: Suit, rank: number): Card {
  return { id: `${suit}-${rank}`, suit, rank };
}

/** Jeu de 52 cartes ordonné. */
export function freshDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (let rank = 1; rank <= 13; rank++) {
      deck.push(makeCard(suit, rank));
    }
  }
  return deck;
}

/**
 * PRNG déterministe (mulberry32) — permet des mélanges reproductibles pour
 * les tests. Renvoie une fonction () => [0,1).
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Mélange Fisher-Yates. `rand` optionnel (par défaut Math.random pour le jeu
 * réel ; passer un mulberry32(seed) pour des tests reproductibles).
 */
export function shuffle<T>(items: T[], rand: () => number = Math.random): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
