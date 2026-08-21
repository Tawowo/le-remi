import type { Game, Player, RoundRecord } from "./types";
import { scoreRound, defaultTarget, evaluateGameEnd } from "./scoring";
import { dealerIndexForRound } from "./rotation";
import { newId } from "./storage";

/** Palette d'avatars auto (assez contrastée sur feutrine sombre et claire). */
export const AVATAR_COLORS = [
  "#d4af37", // or
  "#e0524d", // rouge corail
  "#4aa8d8", // bleu
  "#5cba7d", // vert
  "#b57edc", // violet
  "#e8934a", // orange
];

export function makePlayers(names: string[]): Player[] {
  return names.map((name, i) => ({
    id: newId(),
    name: name.trim() || `Joueur ${i + 1}`,
    color: AVATAR_COLORS[i % AVATAR_COLORS.length],
  }));
}

export function createGame(names: string[], target?: number): Game {
  const players = makePlayers(names);
  return {
    id: newId(),
    players,
    target: target ?? defaultTarget(players.length),
    rounds: [],
    createdAt: Date.now(),
    finishedAt: null,
    winnerIndex: null,
  };
}

/** Totaux cumulés de chaque joueur. */
export function totals(game: Game): number[] {
  const t = new Array<number>(game.players.length).fill(0);
  for (const round of game.rounds) {
    round.result.deltas.forEach((d, i) => {
      t[i] += d;
    });
  }
  return t;
}

/** Variation apportée par la dernière manche (pour les flèches). */
export function lastRoundDeltas(game: Game): number[] | null {
  if (game.rounds.length === 0) return null;
  return game.rounds[game.rounds.length - 1].result.deltas;
}

export function nextRoundNumber(game: Game): number {
  return game.rounds.length + 1;
}

/**
 * Applique une manche (points déjà saisis) et renvoie la nouvelle partie
 * (immutable). Détermine la fin de partie et le gagnant le cas échéant.
 */
export function commitRound(
  game: Game,
  poserIndex: number,
  points: number[],
): Game {
  const roundNumber = nextRoundNumber(game);
  const dealerIndex = dealerIndexForRound(roundNumber, game.players.length);
  const result = scoreRound({
    playerCount: game.players.length,
    poserIndex,
    points,
  });

  const record: RoundRecord = {
    number: roundNumber,
    dealerIndex,
    poserIndex,
    points,
    result,
    kind: result.kind,
    at: Date.now(),
  };

  const rounds = [...game.rounds, record];
  const nextGame: Game = { ...game, rounds };

  const cumulative = totals(nextGame);
  const { finished, podium } = evaluateGameEnd(cumulative, game.target);
  if (finished) {
    nextGame.finishedAt = Date.now();
    nextGame.winnerIndex = podium[0];
  }

  return nextGame;
}

/** Annule la dernière manche (garde-fou « corriger la dernière manche »). */
export function undoLastRound(game: Game): Game {
  if (game.rounds.length === 0) return game;
  const rounds = game.rounds.slice(0, -1);
  return { ...game, rounds, finishedAt: null, winnerIndex: null };
}

// ---------- Statistiques de fin de partie ----------

export interface GameStats {
  bestRound: { playerIndex: number; value: number; roundNumber: number } | null;
  remiSecCount: number;
  contreKing: { playerIndex: number; count: number } | null;
}

export function computeStats(game: Game): GameStats {
  let bestRound: GameStats["bestRound"] = null;
  let remiSecCount = 0;
  const contreWins = new Array<number>(game.players.length).fill(0);

  for (const round of game.rounds) {
    round.result.deltas.forEach((d, i) => {
      if (d > 0 && (!bestRound || d > bestRound.value)) {
        bestRound = { playerIndex: i, value: d, roundNumber: round.number };
      }
    });
    if (round.kind === "remi-sec") remiSecCount++;
    if (round.kind === "contre" || round.kind === "contre-egalite") {
      round.result.winners.forEach((w) => {
        contreWins[w]++;
      });
    }
  }

  let contreKing: GameStats["contreKing"] = null;
  contreWins.forEach((count, playerIndex) => {
    if (count > 0 && (!contreKing || count > contreKing.count)) {
      contreKing = { playerIndex, count };
    }
  });

  return { bestRound, remiSecCount, contreKing };
}

/** Revanche : mêmes joueurs, ordre décalé d'un cran (rotation du donneur). */
export function rematch(game: Game): Game {
  const rotated = [...game.players.slice(1), game.players[0]].map((p) => ({
    ...p,
    id: newId(),
  }));
  return {
    id: newId(),
    players: rotated,
    target: game.target,
    rounds: [],
    createdAt: Date.now(),
    finishedAt: null,
    winnerIndex: null,
  };
}
