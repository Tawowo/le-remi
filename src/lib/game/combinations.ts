/**
 * Détection des combinaisons et MEILLEURE décomposition d'une main.
 *
 * Combinaisons valant 0 point :
 *  - Brelan : 3 ou 4 cartes de même valeur (familles différentes).
 *  - Suite  : ≥ 3 cartes qui se suivent dans la MÊME famille. L'As peut être
 *             en bas (A-2-3) OU en haut (D-R-A), jamais à cheval (R-A-2 refusé).
 *
 * Une carte peut appartenir à plusieurs combinaisons potentielles : on choisit
 * l'affectation qui MINIMISE les points isolés (programmation dynamique sur les
 * sous-ensembles de la main).
 */

import type { Card } from "./cards";
import { cardValue } from "./cards";

export type MeldKind = "brelan" | "suite";

export interface Meld {
  kind: MeldKind;
  cardIds: string[];
}

export interface Decomposition {
  melds: Meld[];
  isolated: Card[];
  isolatedPoints: number;
}

interface Candidate {
  mask: number;
  kind: MeldKind;
}

/** Énumère toutes les combinaisons possibles de la main, en masques de bits. */
function enumerateMelds(hand: Card[]): Candidate[] {
  const n = hand.length;
  const seen = new Map<number, MeldKind>();

  // --- Brelans : par valeur (rang), sous-ensembles de taille 3 et 4 ---
  const byRank = new Map<number, number[]>();
  hand.forEach((c, i) => {
    const list = byRank.get(c.rank) ?? [];
    list.push(i);
    byRank.set(c.rank, list);
  });
  for (const indices of byRank.values()) {
    if (indices.length < 3) continue;
    // tous les triplets
    for (let a = 0; a < indices.length; a++) {
      for (let b = a + 1; b < indices.length; b++) {
        for (let c = b + 1; c < indices.length; c++) {
          const mask = (1 << indices[a]) | (1 << indices[b]) | (1 << indices[c]);
          if (!seen.has(mask)) seen.set(mask, "brelan");
        }
      }
    }
    // le carré éventuel
    if (indices.length === 4) {
      const mask = indices.reduce((m, i) => m | (1 << i), 0);
      if (!seen.has(mask)) seen.set(mask, "brelan");
    }
  }

  // --- Suites : par famille, deux univers (As bas / As haut) ---
  const bySuit = new Map<string, number[]>();
  hand.forEach((c, i) => {
    const list = bySuit.get(c.suit) ?? [];
    list.push(i);
    bySuit.set(c.suit, list);
  });

  for (const indices of bySuit.values()) {
    if (indices.length < 3) continue;
    for (const aceHigh of [false, true]) {
      // position de chaque carte dans l'univers courant
      const positioned = indices
        .map((i) => {
          const rank = hand[i].rank;
          const pos = aceHigh && rank === 1 ? 14 : rank;
          return { i, pos };
        })
        .sort((a, b) => a.pos - b.pos);

      // découpe en runs consécutifs (pos = pos précédent + 1)
      let run: { i: number; pos: number }[] = [];
      const flush = () => {
        const L = run.length;
        for (let start = 0; start + 2 < L; start++) {
          for (let end = start + 2; end < L; end++) {
            let mask = 0;
            for (let k = start; k <= end; k++) mask |= 1 << run[k].i;
            if (!seen.has(mask)) seen.set(mask, "suite");
          }
        }
      };
      for (const p of positioned) {
        if (run.length === 0 || p.pos === run[run.length - 1].pos + 1) {
          run.push(p);
        } else {
          flush();
          run = [p];
        }
      }
      flush();
    }
  }

  void n;
  return [...seen.entries()].map(([mask, kind]) => ({ mask, kind }));
}

/**
 * Meilleure décomposition (minimise les points isolés).
 * Complexité : O(2^n × nb_melds), n = taille de la main (≤ 11 en pratique).
 */
export function bestDecomposition(hand: Card[]): Decomposition {
  const n = hand.length;
  if (n === 0) return { melds: [], isolated: [], isolatedPoints: 0 };

  const value = hand.map(cardValue);
  const candidates = enumerateMelds(hand);

  // melds indexés par leur bit de poids faible
  const meldsByLowBit: Candidate[][] = Array.from({ length: n }, () => []);
  for (const cand of candidates) {
    const low = lowestBit(cand.mask);
    meldsByLowBit[low].push(cand);
  }

  const full = (1 << n) - 1;
  const dpPts = new Int32Array(1 << n).fill(0);
  // choix[mask] : -1 = laisser la carte de poids faible isolée, sinon masque du meld utilisé
  const choice = new Int32Array(1 << n).fill(-1);

  for (let mask = 1; mask <= full; mask++) {
    const low = lowestBit(mask);
    // option 1 : carte `low` isolée
    let best = value[low] + dpPts[mask & ~(1 << low)];
    let bestChoice = -1;
    // option 2 : une combinaison contenant `low`
    for (const cand of meldsByLowBit[low]) {
      if ((cand.mask & mask) !== cand.mask) continue; // meld doit être inclus dans mask
      const rest = dpPts[mask & ~cand.mask];
      if (rest < best) {
        best = rest;
        bestChoice = cand.mask;
      }
    }
    dpPts[mask] = best;
    choice[mask] = bestChoice;
  }

  // reconstruction
  const melds: Meld[] = [];
  const isolatedIdx: number[] = [];
  let mask = full;
  const kindOf = new Map(candidates.map((c) => [c.mask, c.kind]));
  while (mask !== 0) {
    const low = lowestBit(mask);
    const ch = choice[mask];
    if (ch === -1) {
      isolatedIdx.push(low);
      mask &= ~(1 << low);
    } else {
      const cardIds: string[] = [];
      for (let i = 0; i < n; i++) if (ch & (1 << i)) cardIds.push(hand[i].id);
      melds.push({ kind: kindOf.get(ch) ?? "suite", cardIds });
      mask &= ~ch;
    }
  }

  const isolated = isolatedIdx.map((i) => hand[i]);
  return { melds, isolated, isolatedPoints: dpPts[full] };
}

function lowestBit(mask: number): number {
  return Math.log2(mask & -mask) | 0;
}

/** Points isolés d'une main (0 si tout est combiné). */
export function isolatedPoints(hand: Card[]): number {
  return bestDecomposition(hand).isolatedPoints;
}

/** Un joueur peut poser si ses points isolés ≤ 10. */
export function canLayDown(hand: Card[]): boolean {
  return isolatedPoints(hand) <= 10;
}
