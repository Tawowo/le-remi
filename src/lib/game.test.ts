import { describe, it, expect } from "vitest";
import { createGame, commitRound, undoLastRound, totals, rematch, computeStats } from "./game";
import { roundHeading, dealerIndexForRound, starterIndexForRound, cardsPerPlayer } from "./rotation";

describe("rotation du donneur", () => {
  it("le premier donneur est le premier joueur, le suivant commence", () => {
    const g = createGame(["A", "B", "C"]);
    const h = roundHeading(g.players, 1);
    expect(h.dealer.name).toBe("A");
    expect(h.starter.name).toBe("B");
  });

  it("avance d'un cran à chaque manche (sens horaire)", () => {
    expect(dealerIndexForRound(1, 3)).toBe(0);
    expect(starterIndexForRound(1, 3)).toBe(1);
    expect(dealerIndexForRound(2, 3)).toBe(1);
    expect(starterIndexForRound(2, 3)).toBe(2);
    expect(dealerIndexForRound(3, 3)).toBe(2);
    expect(starterIndexForRound(3, 3)).toBe(0);
    // ça boucle
    expect(dealerIndexForRound(4, 3)).toBe(0);
  });

  it("distribue 10 cartes à 2 joueurs, 7 à 3+", () => {
    expect(cardsPerPlayer(2)).toBe(10);
    expect(cardsPerPlayer(3)).toBe(7);
    expect(cardsPerPlayer(6)).toBe(7);
  });
});

describe("déroulé d'une partie", () => {
  it("cumule les scores et détecte la fin de partie", () => {
    const g = createGame(["A", "B", "C"], 60);
    const g1 = commitRound(g, 0, [7, 15, 26]); // A marque 48
    expect(totals(g1)).toEqual([48, 0, 0]);
    expect(g1.finishedAt).toBeNull();

    const g2 = commitRound(g1, 0, [5, 20, 20]); // A marque 45 → 93 ≥ 60
    expect(totals(g2)[0]).toBe(93);
    expect(g2.finishedAt).not.toBeNull();
    expect(g2.winnerIndex).toBe(0);
  });

  it("annule proprement la dernière manche", () => {
    const g = createGame(["A", "B"], 200);
    const g1 = commitRound(g, 0, [4, 30]);
    const g2 = undoLastRound(g1);
    expect(g2.rounds).toHaveLength(0);
    expect(totals(g2)).toEqual([0, 0]);
  });

  it("la revanche garde les joueurs mais décale l'ordre d'un cran", () => {
    const g = createGame(["A", "B", "C"]);
    const r = rematch(g);
    expect(r.players.map((p) => p.name)).toEqual(["B", "C", "A"]);
    expect(r.rounds).toHaveLength(0);
  });

  it("calcule les statistiques de fin de partie", () => {
    const g = createGame(["A", "B", "C"], 500);
    let cur = commitRound(g, 0, [0, 10, 12]); // Rémi sec de A
    cur = commitRound(cur, 1, [8, 3, 3]); // contre : C et... non, B pose à 3, A à 8 -> B seul min? A=8,B=3,C=3 -> B et C ex aequo, mais B est poseur -> égalité
    const stats = computeStats(cur);
    expect(stats.remiSecCount).toBe(1);
    expect(stats.bestRound).not.toBeNull();
  });
});
