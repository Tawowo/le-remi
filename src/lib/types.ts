import type { RoundKind, RoundResult } from "./scoring";

export interface Player {
  id: string;
  name: string;
  /** Couleur d'avatar (hex). */
  color: string;
}

export interface RoundRecord {
  /** Numéro de manche (1-based) tel qu'affiché. */
  number: number;
  /** Index du donneur de la manche. */
  dealerIndex: number;
  /** Index du joueur qui a posé. */
  poserIndex: number;
  /** Points isolés saisis pour chaque joueur. */
  points: number[];
  /** Résultat calculé (deltas, type, détail...). */
  result: RoundResult;
  kind: RoundKind;
  /** Horodatage (ms) — sérialisable. */
  at: number;
}

export interface Game {
  id: string;
  players: Player[];
  /** Objectif de fin de partie (points). */
  target: number;
  rounds: RoundRecord[];
  createdAt: number;
  finishedAt: number | null;
  /** Index du gagnant une fois la partie terminée. */
  winnerIndex: number | null;
}

export type Theme = "dark" | "light";

export interface Settings {
  theme: Theme;
  sound: boolean;
}
