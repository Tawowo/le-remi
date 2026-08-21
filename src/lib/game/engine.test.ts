import { describe, it, expect } from "vitest";
import { makeCard, type Card } from "./cards";
import {
  startGame,
  drawCard,
  discardCard,
  layDown,
  nextRound,
  topDiscard,
  type EnginePlayer,
  type GameState,
} from "./engine";
import { botDraw, botDiscardAndMaybePose } from "./bots";

function players(names: string[], bots: boolean[] = []): EnginePlayer[] {
  return names.map((name, i) => ({
    id: `p${i}`,
    name,
    color: "#fff",
    isBot: bots[i] ?? false,
    profile: bots[i] ? "equilibre" : undefined,
    hand: [],
  }));
}

const card = (suit: string, rank: number): Card => makeCard(suit as never, rank);

describe("distribution", () => {
  it("distribue 7 cartes à 3 joueurs, défausse retournée, gauche du donneur commence", () => {
    const s = startGame(players(["A", "B", "C"]), { target: 300, dealerIndex: 0, seed: 42 });
    expect(s.players.every((p) => p.hand.length === 7)).toBe(true);
    expect(s.discard).toHaveLength(1);
    expect(s.turn).toBe(1); // gauche du donneur
    expect(s.phase).toBe("draw");
    // 52 - 21 - 1 = 30 cartes en pioche
    expect(s.stock).toHaveLength(30);
  });

  it("distribue 10 cartes à 2 joueurs", () => {
    const s = startGame(players(["A", "B"]), { target: 200, seed: 7 });
    expect(s.players.every((p) => p.hand.length === 10)).toBe(true);
  });

  it("mélange reproductible pour un même seed", () => {
    const a = startGame(players(["A", "B", "C"]), { target: 300, seed: 123 });
    const b = startGame(players(["A", "B", "C"]), { target: 300, seed: 123 });
    expect(a.players[0].hand.map((c) => c.id)).toEqual(b.players[0].hand.map((c) => c.id));
  });
});

describe("tour de jeu", () => {
  it("piocher puis jeter fait avancer le tour", () => {
    let s = startGame(players(["A", "B", "C"]), { target: 300, seed: 1 });
    const start = s.turn;
    s = drawCard(s, "stock");
    expect(s.phase).toBe("discard");
    expect(s.players[start].hand).toHaveLength(8);
    const toDiscard = s.players[start].hand[0].id;
    s = discardCard(s, toDiscard);
    expect(s.phase).toBe("draw");
    expect(s.turn).toBe((start + 1) % 3);
    expect(topDiscard(s)!.id).toBe(toDiscard);
  });

  it("prendre la défausse retire bien la carte visible", () => {
    let s = startGame(players(["A", "B"]), { target: 200, seed: 9 });
    const top = topDiscard(s)!;
    s = drawCard(s, "discard");
    expect(s.players[s.turn].hand.some((c) => c.id === top.id)).toBe(true);
    expect(s.discard).toHaveLength(0);
  });
});

describe("pose et décompte (intégration scoring.ts)", () => {
  it("un Rémi sec marque le pot + bonus 10 × joueurs", () => {
    // Main construite : le poseur a un brelan + une suite = 0 isolé après défausse.
    const st = players(["Poseur", "Adv1", "Adv2"]);
    // Poseur : 5♠5♥5♦ (brelan) + 7♣8♣9♣ (suite) + un Roi à défausser
    st[0].hand = [
      card("spades", 5), card("hearts", 5), card("diamonds", 5),
      card("clubs", 7), card("clubs", 8), card("clubs", 9),
      card("clubs", 13),
    ];
    st[1].hand = [card("spades", 13), card("hearts", 12)]; // 20 isolés
    st[2].hand = [card("diamonds", 4), card("clubs", 3)]; // 7 isolés

    const s: GameState = {
      players: st, stock: [card("hearts", 2)], discard: [card("spades", 2)],
      turn: 0, phase: "discard", dealerIndex: 2, roundNumber: 1, target: 300,
      scores: [0, 0, 0], seed: 1, outcome: null, winnerIndex: null,
    };

    const after = layDown(s, "clubs-13"); // défausse le Roi → main à 0 isolé
    expect(after.phase).toBe("roundEnd");
    expect(after.outcome!.result.kind).toBe("remi-sec");
    // pot = 0 + 20 + 7 = 27, + bonus 30 = 57
    expect(after.scores[0]).toBe(57);
    expect(after.outcome!.points).toEqual([0, 20, 7]);
  });

  it("refuse la pose si les points isolés restent > 10", () => {
    const st = players(["A", "B"]);
    st[0].hand = [card("spades", 13), card("hearts", 13), card("clubs", 9)];
    st[1].hand = [card("diamonds", 2)];
    const s: GameState = {
      players: st, stock: [], discard: [card("spades", 2)],
      turn: 0, phase: "discard", dealerIndex: 1, roundNumber: 1, target: 300,
      scores: [0, 0], seed: 1, outcome: null, winnerIndex: null,
    };
    // défausser le 9 laisse deux Rois = 20 isolés > 10 → pose refusée
    const after = layDown(s, "clubs-9");
    expect(after.phase).toBe("discard"); // inchangé
  });
});

describe("pioche épuisée", () => {
  it("reforme le stock depuis la défausse (coupe, sans mélange) en gardant le dessus", () => {
    const st = players(["A", "B"]);
    st[0].hand = [card("spades", 5)];
    st[1].hand = [card("spades", 6)];
    const s: GameState = {
      players: st, stock: [],
      discard: [card("hearts", 2), card("hearts", 3), card("hearts", 4)], // dessus = 4
      turn: 0, phase: "draw", dealerIndex: 1, roundNumber: 1, target: 300,
      scores: [0, 0], seed: 1, outcome: null, winnerIndex: null,
    };
    const after = drawCard(s, "stock");
    // le 4 reste la défausse, le reste [2,3] retourné devient la pioche → on pioche une carte
    expect(topDiscard(after)!.rank).toBe(4);
    expect(after.players[0].hand).toHaveLength(2);
  });
});

describe("bots", () => {
  it("un bot produit toujours une défausse valide et une décision de pose booléenne", () => {
    let s = startGame(players(["Moi", "Bot"], [false, true]), { target: 300, seed: 55 });
    // avancer jusqu'au tour du bot (index 1), quel que soit le premier joueur
    let guard = 0;
    while (s.turn !== 1 && guard++ < 4) {
      s = drawCard(s, "stock");
      s = discardCard(s, s.players[s.turn].hand[0].id);
    }
    expect(s.turn).toBe(1);
    const src = botDraw(s);
    expect(["stock", "discard"]).toContain(src);
    s = drawCard(s, src);
    const plan = botDiscardAndMaybePose(s);
    expect(s.players[1].hand.some((c) => c.id === plan.cardId)).toBe(true);
    expect(typeof plan.pose).toBe("boolean");
  });
});

describe("manche suivante", () => {
  it("nextRound fait tourner le donneur et redistribue", () => {
    const st = players(["A", "B", "C"]);
    const s: GameState = {
      players: st.map((p) => ({ ...p, hand: [card("spades", 2)] })),
      stock: [], discard: [card("spades", 3)], turn: 0, phase: "roundEnd",
      dealerIndex: 0, roundNumber: 1, target: 300, scores: [10, 5, 0],
      seed: 99, outcome: null, winnerIndex: null,
    };
    const next = nextRound(s);
    expect(next.dealerIndex).toBe(1);
    expect(next.roundNumber).toBe(2);
    expect(next.turn).toBe(2); // gauche du nouveau donneur
    expect(next.players.every((p) => p.hand.length === 7)).toBe(true);
    expect(next.scores).toEqual([10, 5, 0]); // cumul conservé
  });
});
