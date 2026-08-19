import { describe, it, expect } from "vitest";
import {
  scoreRound,
  defaultTarget,
  evaluateGameEnd,
  BASE_BONUS,
} from "./scoring";

describe("scoreRound — cas normal", () => {
  it("le poseur marque ses points + ceux des adversaires (7 + 15 + 26 = 48)", () => {
    const r = scoreRound({ playerCount: 3, poserIndex: 0, points: [7, 15, 26] });
    expect(r.kind).toBe("normal");
    expect(r.roundTotal).toBe(48);
    expect(r.deltas).toEqual([48, 0, 0]);
    expect(r.winners).toEqual([0]);
    expect(r.breakdown[0]).toMatchObject({ index: 0, base: 48, bonus: 0, total: 48 });
  });

  it("fonctionne à 2 joueurs", () => {
    const r = scoreRound({ playerCount: 2, poserIndex: 1, points: [22, 4] });
    expect(r.kind).toBe("normal");
    expect(r.deltas).toEqual([0, 26]);
  });
});

describe("scoreRound — Rémi sec (poser à 0)", () => {
  it("ajoute un bonus de 10 × nombre de joueurs", () => {
    const r = scoreRound({ playerCount: 3, poserIndex: 0, points: [0, 15, 26] });
    expect(r.kind).toBe("remi-sec");
    expect(r.remiSecBonus).toBe(30);
    // 0 + 15 + 26 = 41, + 30 de bonus = 71
    expect(r.deltas).toEqual([71, 0, 0]);
    expect(r.breakdown[0]).toMatchObject({ base: 41, bonus: 30, total: 71 });
  });

  it("le bonus vaut 10 × N pour toutes les tailles", () => {
    for (let n = 2; n <= 6; n++) {
      const points = new Array(n).fill(5);
      points[0] = 0;
      const r = scoreRound({ playerCount: n, poserIndex: 0, points });
      expect(r.remiSecBonus).toBe(BASE_BONUS * n);
      expect(r.kind).toBe("remi-sec");
    }
  });
});

describe("scoreRound — contre (le poseur se fait coiffer)", () => {
  it("poseur à 7, adversaires à 5 et 3 → le joueur à 3 rafle tout", () => {
    const r = scoreRound({ playerCount: 3, poserIndex: 0, points: [7, 5, 3] });
    expect(r.kind).toBe("contre");
    expect(r.poserPenalty).toBe(-30);
    // Le joueur à 3 rafle le pot (7 + 5 + 3 = 15), l'autre adversaire marque 0.
    expect(r.roundTotal).toBe(15);
    expect(r.deltas).toEqual([-30, 0, 15]);
    expect(r.winners).toEqual([2]);
  });

  it("le poseur perd 10 × N même si le pot est faible", () => {
    const r = scoreRound({ playerCount: 4, poserIndex: 0, points: [9, 2, 30, 30] });
    expect(r.kind).toBe("contre");
    expect(r.deltas[0]).toBe(-40);
    // joueur 1 (2 pts) rafle 9+2+30+30 = 71
    expect(r.deltas[1]).toBe(71);
    expect(r.deltas[2]).toBe(0);
    expect(r.deltas[3]).toBe(0);
  });

  it("contre où le joueur au plus bas est à 0 → il touche aussi le Rémi sec", () => {
    const r = scoreRound({ playerCount: 3, poserIndex: 0, points: [5, 0, 7] });
    expect(r.kind).toBe("contre");
    expect(r.poserPenalty).toBe(-30);
    // pot = 12, gagnant à 0 → +30 de bonus = 42
    expect(r.deltas).toEqual([-30, 42, 0]);
  });
});

describe("scoreRound — contre avec égalité entre adversaires", () => {
  it("deux adversaires ex æquo au plus bas se partagent le pot arrondi au supérieur", () => {
    const r = scoreRound({ playerCount: 3, poserIndex: 0, points: [8, 3, 3] });
    expect(r.kind).toBe("contre-egalite");
    expect(r.poserPenalty).toBe(-30);
    // pot = 14, réparti sur 2 → ceil(14/2) = 7 chacun
    expect(r.deltas).toEqual([-30, 7, 7]);
    expect(r.winners).toEqual([1, 2]);
  });
});

describe("scoreRound — égalité au plus bas (avec le poseur, sans contre)", () => {
  it("égalité 3-3-8 → répartition arrondie au supérieur", () => {
    // poseur à 3, un adversaire à 3, un à 8 : pas de contre (personne en dessous).
    const r = scoreRound({ playerCount: 3, poserIndex: 0, points: [3, 3, 8] });
    expect(r.kind).toBe("egalite");
    // pot = 14, réparti sur 2 ex æquo → 7 chacun
    expect(r.deltas).toEqual([7, 7, 0]);
    expect(r.poserPenalty).toBe(0);
  });

  it("47 ÷ 2 → 24 chacun (arrondi au supérieur)", () => {
    // poseur à 4, adversaire à 4, adversaire à 39 → pot = 47
    const r = scoreRound({ playerCount: 3, poserIndex: 0, points: [4, 4, 39] });
    expect(r.roundTotal).toBe(47);
    expect(r.kind).toBe("egalite");
    // ceil(47/2) = 24
    expect(r.deltas).toEqual([24, 24, 0]);
  });

  it("égalité à 0 → chacun touche le bonus Rémi sec", () => {
    // poseur à 0, adversaire à 0, adversaire à 8
    const r = scoreRound({ playerCount: 3, poserIndex: 0, points: [0, 0, 8] });
    expect(r.kind).toBe("egalite");
    // pot = 8, ceil(8/2) = 4, + bonus 30 chacun pour les ex æquo à 0
    expect(r.deltas).toEqual([34, 34, 0]);
  });

  it("égalité à trois ex æquo répartit sur les trois", () => {
    const r = scoreRound({ playerCount: 4, poserIndex: 0, points: [2, 2, 2, 20] });
    // pot = 26, ceil(26/3) = 9
    expect(r.deltas).toEqual([9, 9, 9, 0]);
    expect(r.winners).toEqual([0, 1, 2]);
  });
});

describe("scoreRound — validations", () => {
  it("rejette un nombre de points incohérent", () => {
    expect(() => scoreRound({ playerCount: 3, poserIndex: 0, points: [1, 2] })).toThrow();
  });
  it("rejette un poserIndex hors limites", () => {
    expect(() => scoreRound({ playerCount: 2, poserIndex: 5, points: [1, 2] })).toThrow();
  });
});

describe("defaultTarget & evaluateGameEnd", () => {
  it("objectif = 100 × nombre de joueurs", () => {
    expect(defaultTarget(5)).toBe(500);
    expect(defaultTarget(2)).toBe(200);
  });

  it("détecte la fin de partie et ordonne le podium", () => {
    const res = evaluateGameEnd([120, 500, 340, 90], 500);
    expect(res.finished).toBe(true);
    expect(res.podium).toEqual([1, 2, 0, 3]);
  });

  it("partie non terminée si personne n'atteint l'objectif", () => {
    const res = evaluateGameEnd([120, 300, 340, 90], 500);
    expect(res.finished).toBe(false);
  });
});
