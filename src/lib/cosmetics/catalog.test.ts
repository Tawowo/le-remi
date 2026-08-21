import { describe, it, expect } from "vitest";
import { FELTS, BACKS, DECKS, AVATARS, FRAMES, allCosmetics, DEFAULT_OWNED, cosmetic, isUnlockedByLevel } from "./catalog";
import { priceFor } from "./types";

describe("catalogue des collections", () => {
  it("compte les cosmétiques attendus", () => {
    expect(FELTS).toHaveLength(24);
    expect(BACKS).toHaveLength(12);
    expect(DECKS).toHaveLength(6);
    expect(AVATARS).toHaveLength(36);
    expect(FRAMES).toHaveLength(12);
  });

  it("aucun id dupliqué", () => {
    const ids = allCosmetics().map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("le prix correspond à la rareté et à la catégorie", () => {
    for (const c of allCosmetics()) {
      expect(c.price).toBe(priceFor(c.category, c.rarity));
    }
  });

  it("les tapis Légende sont verrouillés (niveau ou exploit)", () => {
    const legende = FELTS.filter((f) => f.collection === "legende");
    expect(legende.length).toBeGreaterThan(0);
    for (const f of legende) {
      expect(f.unlock?.level || f.unlock?.exploit).toBeTruthy();
    }
  });

  it("les cosmétiques offerts par défaut existent tous", () => {
    for (const id of DEFAULT_OWNED) expect(cosmetic(id)).toBeDefined();
  });

  it("le verrouillage par niveau fonctionne", () => {
    const dragon = cosmetic("felt-dragon")!;
    expect(isUnlockedByLevel(dragon, 14)).toBe(false);
    expect(isUnlockedByLevel(dragon, 15)).toBe(true);
  });

  it("les prix respectent les fourchettes du cahier", () => {
    for (const f of FELTS) expect(f.price).toBeGreaterThanOrEqual(500);
    for (const d of DECKS.filter((x) => x.rarity !== "commun")) {
      expect(d.price).toBeGreaterThanOrEqual(2000);
      expect(d.price).toBeLessThanOrEqual(6000);
    }
    for (const a of AVATARS) {
      expect(a.price).toBeGreaterThanOrEqual(250);
      expect(a.price).toBeLessThanOrEqual(2500);
    }
  });
});
