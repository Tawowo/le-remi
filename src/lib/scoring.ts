/**
 * MOTEUR DE SCORE — LE RÉMI
 * -------------------------------------------------------------------------
 * Fonctions pures, sans effet de bord, entièrement couvertes par des tests
 * unitaires (scoring.test.ts). Source de vérité du calcul de score.
 *
 * Règles (voir §1 du cahier des charges / page Règles) :
 *  - Combinaisons (brelans/suites) = 0 point. On ne saisit que les cartes
 *    isolées de chaque joueur.
 *  - Le total de la manche T = somme des points restants de TOUS les joueurs.
 *  - Cas normal : le poseur est seul au plus bas → il marque T (+ bonus Rémi
 *    sec si ses points restants valent 0).
 *  - Rémi sec : poser à 0 → bonus = 10 × nombre de joueurs.
 *  - Contre : un adversaire a STRICTEMENT moins de points que le poseur →
 *    le poseur perd 10 × nombre de joueurs ; le(s) joueur(s) au plus bas
 *    total raflent T (réparti et arrondi au supérieur en cas d'égalité,
 *    + bonus Rémi sec si à 0).
 *  - Égalité au plus bas (avec ou sans le poseur) : T réparti à parts égales
 *    entre les ex æquo, arrondi AU SUPÉRIEUR pour chacun.
 */

export const BASE_BONUS = 10; // multiplié par le nombre de joueurs

export type RoundKind =
  | "normal" // le poseur rafle, sans Rémi sec
  | "remi-sec" // le poseur rafle en ayant posé à 0
  | "egalite" // égalité au plus bas incluant le poseur (pas de contre)
  | "contre" // un adversaire strictement en dessous : le poseur est coiffé
  | "contre-egalite"; // contre avec plusieurs adversaires ex æquo au plus bas

export interface RoundInput {
  /** Nombre de joueurs de la partie (2 à 6). */
  playerCount: number;
  /** Index (0-based) du joueur qui a posé. */
  poserIndex: number;
  /** Points de cartes ISOLÉES de chaque joueur (brelans/suites = 0). */
  points: number[];
}

export interface WinnerBreakdown {
  /** Index du joueur qui rafle (ou l'un des ex æquo). */
  index: number;
  /** Part de base attribuée (avant bonus), arrondie au supérieur si partage. */
  base: number;
  /** Bonus Rémi sec appliqué à ce joueur (0 si aucun). */
  bonus: number;
  /** Total marqué par ce joueur cette manche (base + bonus). */
  total: number;
}

export interface RoundResult {
  kind: RoundKind;
  /** Variation de score de chaque joueur pour cette manche (longueur = playerCount). */
  deltas: number[];
  /** Somme des points restants de tous les joueurs (le « pot » de la manche). */
  roundTotal: number;
  /** Bonus Rémi sec unitaire de la partie (10 × nombre de joueurs). */
  remiSecBonus: number;
  /** Index des joueurs qui raflent la manche (1 ou plusieurs si égalité). */
  winners: number[];
  /** Détail par gagnant (pour l'affichage « d'où vient chaque nombre »). */
  breakdown: WinnerBreakdown[];
  /** Malus infligé au poseur en cas de contre (négatif), 0 sinon. */
  poserPenalty: number;
}

/** Somme entière, tolérante aux entrées non finies. */
function sum(values: number[]): number {
  return values.reduce((acc, v) => acc + (Number.isFinite(v) ? v : 0), 0);
}

/** Arrondi au supérieur d'une division entière positive. */
function ceilDiv(numerator: number, denominator: number): number {
  return Math.ceil(numerator / denominator);
}

/**
 * Calcule le résultat d'une manche à partir des points restants saisis.
 * Fonction pure : mêmes entrées → mêmes sorties.
 */
export function scoreRound(input: RoundInput): RoundResult {
  const { playerCount, poserIndex, points } = input;

  if (points.length !== playerCount) {
    throw new Error(
      `scoreRound: ${points.length} points fournis pour ${playerCount} joueurs.`,
    );
  }
  if (poserIndex < 0 || poserIndex >= playerCount) {
    throw new Error(`scoreRound: poserIndex ${poserIndex} hors limites.`);
  }

  const remiSecBonus = BASE_BONUS * playerCount;
  const roundTotal = sum(points);
  const min = Math.min(...points);
  const poserValue = points[poserIndex];

  // Joueurs au plus bas total.
  const lowest: number[] = [];
  points.forEach((v, i) => {
    if (v === min) lowest.push(i);
  });

  const deltas = new Array<number>(playerCount).fill(0);

  // Cas CONTRE : un adversaire est STRICTEMENT en dessous du poseur.
  if (poserValue > min) {
    const poserPenalty = -remiSecBonus;
    deltas[poserIndex] = poserPenalty;

    // Les ex æquo au plus bas raflent le pot (le poseur n'en fait pas partie).
    const winners = lowest; // par construction, ne contient pas le poseur
    const share = ceilDiv(roundTotal, winners.length);
    const breakdown: WinnerBreakdown[] = winners.map((index) => {
      const bonus = points[index] === 0 ? remiSecBonus : 0;
      const total = share + bonus;
      deltas[index] += total;
      return { index, base: share, bonus, total };
    });

    return {
      kind: winners.length > 1 ? "contre-egalite" : "contre",
      deltas,
      roundTotal,
      remiSecBonus,
      winners,
      breakdown,
      poserPenalty,
    };
  }

  // Le poseur est au plus bas (poserValue === min).
  // Cas ÉGALITÉ : plusieurs joueurs ex æquo au plus bas (dont le poseur).
  if (lowest.length > 1) {
    const winners = lowest;
    const share = ceilDiv(roundTotal, winners.length);
    const breakdown: WinnerBreakdown[] = winners.map((index) => {
      const bonus = points[index] === 0 ? remiSecBonus : 0;
      const total = share + bonus;
      deltas[index] += total;
      return { index, base: share, bonus, total };
    });

    return {
      kind: "egalite",
      deltas,
      roundTotal,
      remiSecBonus,
      winners,
      breakdown,
      poserPenalty: 0,
    };
  }

  // Cas NORMAL : le poseur est seul au plus bas, il rafle tout le pot.
  const isRemiSec = poserValue === 0;
  const bonus = isRemiSec ? remiSecBonus : 0;
  const total = roundTotal + bonus;
  deltas[poserIndex] = total;

  return {
    kind: isRemiSec ? "remi-sec" : "normal",
    deltas,
    roundTotal,
    remiSecBonus,
    winners: [poserIndex],
    breakdown: [{ index: poserIndex, base: roundTotal, bonus, total }],
    poserPenalty: 0,
  };
}

/**
 * Objectif par défaut de fin de partie : 100 × nombre de joueurs.
 */
export function defaultTarget(playerCount: number): number {
  return 100 * playerCount;
}

/**
 * Détermine si la partie est terminée (un joueur a atteint l'objectif) et,
 * le cas échéant, l'ordre du podium (score décroissant).
 */
export function evaluateGameEnd(
  totals: number[],
  target: number,
): { finished: boolean; podium: number[] } {
  const finished = totals.some((t) => t >= target);
  const podium = totals
    .map((total, index) => ({ total, index }))
    .sort((a, b) => b.total - a.total)
    .map((e) => e.index);
  return { finished, podium };
}
