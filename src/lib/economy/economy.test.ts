import { describe, it, expect } from "vitest";
import {
  xpToReachLevel,
  levelForXp,
  coinsRewardForLevel,
  dailyBonusForStreak,
  WHEEL_SEGMENTS,
  TABLES,
  STARTING_COINS,
} from "./config";
import {
  xpProgress,
  levelUpRewards,
  spinWheel,
  computeDailyBonus,
  dayNumber,
  onlinePayout,
  canAfford,
} from "./progression";
import { mulberry32 } from "../game/cards";

describe("courbe d'XP (100 × N^1.5)", () => {
  it("niveaux repères ~283 / ~1118 / ~3162", () => {
    expect(xpToReachLevel(2)).toBe(283);
    expect(xpToReachLevel(5)).toBe(1118);
    expect(xpToReachLevel(10)).toBe(3162);
  });

  it("levelForXp respecte les seuils", () => {
    expect(levelForXp(0)).toBe(1);
    expect(levelForXp(282)).toBe(1);
    expect(levelForXp(283)).toBe(2);
    expect(levelForXp(1117)).toBe(4);
    expect(levelForXp(1118)).toBe(5);
    expect(levelForXp(3162)).toBe(10);
  });

  it("xpProgress reste borné 0..1", () => {
    const p = xpProgress(400);
    expect(p.level).toBe(2);
    expect(p.pct).toBeGreaterThanOrEqual(0);
    expect(p.pct).toBeLessThanOrEqual(1);
  });

  it("récompense de niveau = 100 × niveau, cumulée au passage de plusieurs niveaux", () => {
    expect(coinsRewardForLevel(3)).toBe(300);
    const r = levelUpRewards(1, 3); // niveaux 2 (+200) et 3 (+300)
    expect(r.levels).toEqual([2, 3]);
    expect(r.coins).toBe(500);
  });

  it("les paliers marquants octroient des cosmétiques/titres", () => {
    const r = levelUpRewards(4, 5);
    expect(r.cosmetics).toContain("back-artdeco");
  });
});

describe("roue quotidienne — distribution honnête (100 000 tirages)", () => {
  it("respecte les probabilités affichées à ±0,6 %", () => {
    const rand = mulberry32(123456);
    const N = 100000;
    const counts: Record<string, number> = {};
    for (let i = 0; i < N; i++) {
      const seg = spinWheel(rand());
      counts[seg.id] = (counts[seg.id] ?? 0) + 1;
    }
    const totalWeight = WHEEL_SEGMENTS.reduce((s, x) => s + x.weight, 0);
    expect(totalWeight).toBe(100); // les probabilités affichées somment à 100 %
    for (const seg of WHEEL_SEGMENTS) {
      const observed = (counts[seg.id] ?? 0) / N;
      const expected = seg.weight / 100;
      expect(Math.abs(observed - expected)).toBeLessThan(0.006);
    }
  });

  it("le jackpot (1 %) sort, mais rarement", () => {
    const rand = mulberry32(42);
    let jackpot = 0;
    for (let i = 0; i < 100000; i++) if (spinWheel(rand()).id === "jackpot") jackpot++;
    expect(jackpot).toBeGreaterThan(600);
    expect(jackpot).toBeLessThan(1400);
  });
});

describe("bonus quotidien & série", () => {
  const DAY = 24 * 60 * 60 * 1000;
  it("premier bonus : série 1 → 100 pièces", () => {
    const c = computeDailyBonus(-1, 0, 10 * DAY);
    expect(c.canClaim).toBe(true);
    expect(c.newStreak).toBe(1);
    expect(c.amount).toBe(100);
  });

  it("jour consécutif : la série monte", () => {
    const c = computeDailyBonus(dayNumber(10 * DAY), 1, 11 * DAY);
    expect(c.newStreak).toBe(2);
    expect(c.amount).toBe(120);
  });

  it("déjà réclamé aujourd'hui : impossible", () => {
    const c = computeDailyBonus(dayNumber(11 * DAY), 2, 11 * DAY + 3600_000);
    expect(c.canClaim).toBe(false);
    expect(c.amount).toBe(0);
  });

  it("jour manqué : la série retombe à 1", () => {
    const c = computeDailyBonus(dayNumber(10 * DAY), 5, 13 * DAY);
    expect(c.newStreak).toBe(1);
    expect(c.amount).toBe(100);
  });

  it("plafond à 300 (jour 7+)", () => {
    expect(dailyBonusForStreak(7)).toBe(300);
    expect(dailyBonusForStreak(20)).toBe(300);
  });
});

describe("tables — mises, gains, filet anti-faillite", () => {
  it("la Découverte est gratuite et toujours accessible", () => {
    const d = TABLES[0];
    expect(d.entry).toBe(0);
    expect(canAfford(0, d.entry)).toBe(true);
    expect(d.soloWin).toBe(30);
  });

  it("solde de départ = 500", () => {
    expect(STARTING_COINS).toBe(500);
  });

  it("table verrouillée si solde insuffisant", () => {
    const bronze = TABLES.find((t) => t.tier === "bronze")!;
    expect(canAfford(499, bronze.entry)).toBe(false);
    expect(canAfford(500, bronze.entry)).toBe(true);
  });

  it("pot multijoueur : vainqueur emporte entrée × joueurs", () => {
    // Bistrot 100, 4 joueurs → pot 400
    expect(onlinePayout(100, 4, 1, false)).toBe(400);
    expect(onlinePayout(100, 4, 2, false)).toBe(0);
  });

  it("à partir d'Argent, le 2ᵉ récupère sa mise", () => {
    const argent = TABLES.find((t) => t.tier === "argent")!;
    expect(argent.refundSecond).toBe(true);
    expect(onlinePayout(argent.entry, 3, 2, argent.refundSecond)).toBe(2000);
    expect(onlinePayout(argent.entry, 3, 1, argent.refundSecond)).toBe(6000);
    expect(onlinePayout(argent.entry, 3, 3, argent.refundSecond)).toBe(0);
  });
});
