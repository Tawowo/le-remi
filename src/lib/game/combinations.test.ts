import { describe, it, expect } from "vitest";
import { makeCard, type Card } from "./cards";
import { bestDecomposition, isolatedPoints, canLayDown } from "./combinations";

const h = (specs: [string, number][]): Card[] =>
  specs.map(([s, r]) => makeCard(s as never, r));

describe("brelans", () => {
  it("3 cartes de même valeur = brelan (0 point isolé)", () => {
    const d = bestDecomposition(h([["spades", 7], ["hearts", 7], ["diamonds", 7]]));
    expect(d.isolatedPoints).toBe(0);
    expect(d.melds).toHaveLength(1);
    expect(d.melds[0].kind).toBe("brelan");
  });

  it("4 cartes de même valeur = carré (0 point)", () => {
    const d = bestDecomposition(
      h([["spades", 8], ["hearts", 8], ["diamonds", 8], ["clubs", 8]]),
    );
    expect(d.isolatedPoints).toBe(0);
    expect(d.melds[0].cardIds).toHaveLength(4);
  });
});

describe("suites", () => {
  it("suite simple dans la même famille", () => {
    const d = bestDecomposition(h([["spades", 5], ["spades", 6], ["spades", 7]]));
    expect(d.isolatedPoints).toBe(0);
    expect(d.melds[0].kind).toBe("suite");
  });

  it("As en bas : A-2-3", () => {
    const d = bestDecomposition(h([["hearts", 1], ["hearts", 2], ["hearts", 3]]));
    expect(d.isolatedPoints).toBe(0);
  });

  it("As en haut : Dame-Roi-As", () => {
    const d = bestDecomposition(h([["spades", 12], ["spades", 13], ["spades", 1]]));
    expect(d.isolatedPoints).toBe(0);
  });

  it("Roi-As-2 REFUSÉ (l'As ne chevauche pas)", () => {
    const d = bestDecomposition(h([["clubs", 13], ["clubs", 1], ["clubs", 2]]));
    // aucune suite valide → tout isolé : 10 (R) + 1 (A) + 2 = 13
    expect(d.melds).toHaveLength(0);
    expect(d.isolatedPoints).toBe(13);
  });
});

describe("décompositions vicieuses (carte partagée)", () => {
  it("un 7 partagé entre carré et suite → 0 point isolé", () => {
    // 7♥7♦7♣ (brelan) + 5♠6♠7♠ (suite) : les 6 cartes combinées
    const d = bestDecomposition(
      h([
        ["hearts", 7],
        ["diamonds", 7],
        ["clubs", 7],
        ["spades", 7],
        ["spades", 5],
        ["spades", 6],
      ]),
    );
    expect(d.isolatedPoints).toBe(0);
    expect(d.melds).toHaveLength(2);
  });

  it("As utilisable en haut OU en bas → on choisit le moindre isolé", () => {
    // A♠2♠3♠ + Q♠K♠ : soit A23 (isole Q,K=20), soit QKA (isole 2,3=5) → 5
    const d = bestDecomposition(
      h([
        ["spades", 1],
        ["spades", 2],
        ["spades", 3],
        ["spades", 12],
        ["spades", 13],
      ]),
    );
    expect(d.isolatedPoints).toBe(5);
  });
});

describe("points isolés & pose", () => {
  it("additionne correctement les cartes isolées", () => {
    // brelan de 5 + un Roi (10) + un 4 isolés
    const d = bestDecomposition(
      h([["spades", 5], ["hearts", 5], ["diamonds", 5], ["clubs", 13], ["clubs", 4]]),
    );
    expect(d.isolatedPoints).toBe(14);
  });

  it("canLayDown vrai si ≤ 10", () => {
    expect(canLayDown(h([["spades", 5], ["hearts", 5], ["diamonds", 5], ["clubs", 4]]))).toBe(true);
    expect(isolatedPoints(h([["clubs", 13], ["hearts", 13]]))).toBe(20);
    expect(canLayDown(h([["clubs", 13], ["hearts", 13]]))).toBe(false);
  });
});
