import { describe, it, expect } from "vitest";
import { defaultProfile, addXp, credit, debit, equip, grantCosmetic } from "./profileStore";

describe("profil — pièces", () => {
  it("crédit et débit tracent le portefeuille et ne passent jamais sous 0", () => {
    let p = defaultProfile(); // 500 pièces
    p = credit(p, 150, "Gain table");
    expect(p.coins).toBe(650);
    expect(p.wallet[0]).toMatchObject({ delta: 150, balanceAfter: 650 });
    p = debit(p, 1000, "Grosse mise");
    expect(p.coins).toBe(0); // plancher
    expect(p.wallet[0].delta).toBe(-650);
  });
});

describe("profil — XP & montée de niveau", () => {
  it("passer le seuil du niveau 2 octroie 100 × niveau pièces", () => {
    const p = defaultProfile();
    const r = addXp(p, 283); // atteint le niveau 2
    expect(r.profile.level).toBe(2);
    expect(r.levelUp?.levels).toEqual([2]);
    // 500 de départ + 200 (récompense niveau 2)
    expect(r.profile.coins).toBe(700);
  });

  it("un gros gain d'XP peut faire monter plusieurs niveaux d'un coup", () => {
    const p = defaultProfile();
    const r = addXp(p, 1118); // niveau 5
    expect(r.profile.level).toBe(5);
    expect(r.levelUp?.levels).toEqual([2, 3, 4, 5]);
    // le palier 5 débloque le cosmétique back-artdeco
    expect(r.profile.owned).toContain("back-artdeco");
  });

  it("le boost XP ×2 double le gain", () => {
    const p = defaultProfile();
    const r = addXp(p, 200, true);
    expect(r.gained).toBe(400);
  });
});

describe("profil — cosmétiques", () => {
  it("équiper et débloquer", () => {
    let p = defaultProfile();
    p = grantCosmetic(p, "back-royal");
    expect(p.owned).toContain("back-royal");
    p = equip(p, "back", "back-royal");
    expect(p.equipped.back).toBe("back-royal");
  });
});
