import { describe, it, expect } from "vitest";
import {
  startGame,
  drawCard,
  discardCard,
  layDown,
  nextRound,
  type EnginePlayer,
  type BotProfile,
} from "./engine";
import { botDraw, botDiscardAndMaybePose } from "./bots";
import { isolatedPoints } from "./combinations";

function bots(profiles: BotProfile[]): EnginePlayer[] {
  return profiles.map((profile, i) => ({
    id: `b${i}`,
    name: `Bot${i}`,
    color: "#fff",
    isBot: true,
    profile,
    hand: [],
  }));
}

/** Joue une partie entièrement automatique (tous bots) jusqu'à la fin. */
function autoPlay(players: EnginePlayer[], target: number, seed: number) {
  let s = startGame(players, { target, seed, dealerIndex: 0 });
  let turns = 0;
  const MAX = 20000;
  while (s.phase !== "gameEnd" && turns++ < MAX) {
    if (s.phase === "roundEnd") {
      s = nextRound(s);
      continue;
    }
    if (s.phase === "draw") {
      s = drawCard(s, botDraw(s));
    } else if (s.phase === "discard") {
      const plan = botDiscardAndMaybePose(s);
      s = plan.pose ? layDown(s, plan.cardId) : discardCard(s, plan.cardId);
    }
  }
  return { state: s, turns };
}

describe("simulation de parties complètes", () => {
  it("une partie 3 bots atteint la fin et un gagnant dépasse l'objectif", () => {
    const { state } = autoPlay(bots(["prudent", "equilibre", "audacieux"]), 100, 2024);
    expect(state.phase).toBe("gameEnd");
    expect(state.winnerIndex).not.toBeNull();
    expect(Math.max(...state.scores)).toBeGreaterThanOrEqual(100);
  });

  it("une partie 2 joueurs se termine aussi", () => {
    const { state } = autoPlay(bots(["prudent", "prudent"]), 80, 777);
    expect(state.phase).toBe("gameEnd");
  });

  it("plusieurs seeds : toujours terminales, jamais bloquées", () => {
    for (const seed of [1, 2, 3, 42, 100, 2500]) {
      const { state, turns } = autoPlay(bots(["equilibre", "equilibre", "audacieux", "prudent"]), 100, seed);
      expect(state.phase).toBe("gameEnd");
      expect(turns).toBeLessThan(20000);
    }
  });

  it("le poseur a toujours des points isolés ≤ 10 au moment de poser", () => {
    // rejoue une partie et vérifie l'invariant à chaque pose
    let s = startGame(bots(["prudent", "equilibre"]), { target: 60, seed: 55, dealerIndex: 0 });
    let guard = 0;
    while (s.phase !== "gameEnd" && guard++ < 20000) {
      if (s.phase === "roundEnd") {
        s = nextRound(s);
        continue;
      }
      if (s.phase === "draw") {
        s = drawCard(s, botDraw(s));
      } else {
        const plan = botDiscardAndMaybePose(s);
        if (plan.pose) {
          const poser = s.players[s.turn];
          const remaining = poser.hand.filter((c) => c.id !== plan.cardId);
          expect(isolatedPoints(remaining)).toBeLessThanOrEqual(10);
          s = layDown(s, plan.cardId);
        } else {
          s = discardCard(s, plan.cardId);
        }
      }
    }
    expect(s.phase).toBe("gameEnd");
  });
});
