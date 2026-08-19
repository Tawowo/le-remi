import type { Player } from "./types";

/**
 * Rotation horaire du donneur.
 * Le premier donneur est le premier joueur saisi (index 0). À chaque manche
 * on avance d'un cran dans le sens des aiguilles d'une montre.
 * Le joueur À GAUCHE du donneur (le suivant) commence la manche.
 */
export function dealerIndexForRound(roundNumber: number, playerCount: number): number {
  // roundNumber est 1-based.
  return (roundNumber - 1) % playerCount;
}

export function starterIndexForRound(roundNumber: number, playerCount: number): number {
  return roundNumber % playerCount;
}

export interface RoundHeading {
  roundNumber: number;
  dealer: Player;
  starter: Player;
  dealerIndex: number;
  starterIndex: number;
}

export function roundHeading(players: Player[], roundNumber: number): RoundHeading {
  const n = players.length;
  const dealerIndex = dealerIndexForRound(roundNumber, n);
  const starterIndex = starterIndexForRound(roundNumber, n);
  return {
    roundNumber,
    dealer: players[dealerIndex],
    starter: players[starterIndex],
    dealerIndex,
    starterIndex,
  };
}

/**
 * Nombre de cartes distribuées par joueur : 10 à 2 joueurs, 7 à 3+.
 */
export function cardsPerPlayer(playerCount: number): number {
  return playerCount === 2 ? 10 : 7;
}
