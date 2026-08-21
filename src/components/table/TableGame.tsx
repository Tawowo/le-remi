"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PlayingCard } from "@/components/PlayingCard";
import { HandFan } from "./HandFan";
import { OpponentArc } from "./OpponentArc";
import { RoundReveal } from "./RoundReveal";
import { PlayVictory } from "./PlayVictory";
import {
  drawCard,
  discardCard,
  layDown,
  nextRound,
  startGame,
  topDiscard,
  type GameState,
} from "@/lib/game/engine";
import { bestDecomposition, isolatedPoints } from "@/lib/game/combinations";
import { botDraw, botDiscardAndMaybePose, botThinkingDelay } from "@/lib/game/bots";
import { rankLabel } from "@/lib/game/cards";
import { saveCurrentPlay, clearCurrentPlay, type PlaySession } from "@/lib/playStore";
import { makeRecord, recordGame, type RoundLike } from "@/lib/profiles";
import { useProfile } from "@/components/economy/ProfileProvider";
import { addXp, credit, type Profile } from "@/lib/economy/profileStore";
import { XP_EVENTS, cosmeticById } from "@/lib/economy/config";
import { dayNumber, type LevelUpRewards } from "@/lib/economy/progression";
import { LevelUpOverlay } from "@/components/economy/LevelUpOverlay";
import type { RoundOutcome } from "@/lib/game/engine";

/** XP gagnée par l'humain sur une manche terminée. */
function roundXpForHuman(outcome: RoundOutcome, meIndex: number): number {
  let xp = XP_EVENTS.roundPlayed;
  const won = outcome.result.winners.includes(meIndex);
  if (won) xp += XP_EVENTS.roundWon;
  if (outcome.result.kind === "remi-sec" && outcome.poserIndex === meIndex) xp += XP_EVENTS.remiSec;
  if ((outcome.result.kind === "contre" || outcome.result.kind === "contre-egalite") && won) {
    xp += XP_EVENTS.contreInflicted;
  }
  // combinaisons de MA main révélée
  const myDecomp = outcome.decompositions[meIndex];
  if (myDecomp) {
    for (const m of myDecomp.melds) {
      if (m.kind === "brelan") xp += XP_EVENTS.brelanPosed;
      else if (m.kind === "suite" && m.cardIds.length >= 4) xp += XP_EVENTS.suite4;
    }
  }
  return xp;
}

export function TableGame({ session }: { session: PlaySession }) {
  const router = useRouter();
  const { profile, mutate } = useProfile();
  const [state, setState] = useState<GameState>(session.state);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [thinkingId, setThinkingId] = useState<string | null>(null);
  const [xpToast, setXpToast] = useState<string | null>(null);
  const [levelUp, setLevelUp] = useState<{ level: number; rewards: LevelUpRewards } | null>(null);

  const roundsLogRef = useRef<RoundLike[]>(session.roundsLog ?? []);
  const loggedRoundRef = useRef<number>(session.roundsLog?.length ?? 0);
  const recordedRef = useRef(false);
  const xpRoundRef = useRef<number>(session.roundsLog?.length ?? 0);
  const coinsWonRef = useRef(0);
  // boost XP consommé pour cette partie (si disponible)
  const boostedRef = useRef(false);
  const boostInitRef = useRef(false);

  const equippedFelt = cosmeticById(profile.equipped.felt)?.swatch ?? "#0f2e24";

  // consomme un boost au démarrage si le joueur en a
  useEffect(() => {
    if (boostInitRef.current) return;
    boostInitRef.current = true;
    if (profile.boosts > 0) {
      boostedRef.current = true;
      mutate((p) => ({ ...p, boosts: p.boosts - 1 }));
    }
  }, [profile.boosts, mutate]);

  // ref synchronisée sur le profil committé (pour des calculs sûrs hors render)
  const profileRef = useRef<Profile>(profile);
  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  const flashXp = (amount: number) => {
    if (amount <= 0) return;
    setXpToast(`+${amount} XP`);
    window.setTimeout(() => setXpToast(null), 1400);
  };

  /** Applique de l'XP (+ éventuel crédit de pièces) en UNE mutation, remonte le level-up. */
  const applyProfile = (build: (p: Profile) => { profile: Profile; levelUp: LevelUpRewards | null; gained: number }) => {
    const res = build(profileRef.current);
    profileRef.current = res.profile;
    mutate(() => res.profile);
    if (res.levelUp) setLevelUp({ level: res.profile.level, rewards: res.levelUp });
    flashXp(res.gained);
  };

  const meIndex = state.players.findIndex((p) => !p.isBot);
  const me = state.players[meIndex];
  const myTurn = state.turn === meIndex && (state.phase === "draw" || state.phase === "discard");

  // --- persistance continue ---
  useEffect(() => {
    if (state.phase !== "gameEnd") {
      saveCurrentPlay({ ...session, state, roundsLog: roundsLogRef.current });
    }
  }, [state, session]);

  // --- journalise chaque manche terminée (pour les stats) ---
  useEffect(() => {
    if (
      (state.phase === "roundEnd" || state.phase === "gameEnd") &&
      state.outcome &&
      loggedRoundRef.current < state.roundNumber
    ) {
      loggedRoundRef.current = state.roundNumber;
      roundsLogRef.current = [
        ...roundsLogRef.current,
        { poserIndex: state.outcome.poserIndex, result: state.outcome.result },
      ];
    }
    // XP de manche (uniquement quand la manche s'arrête sans finir la partie ;
    // le dernier tour est traité avec les récompenses de fin de partie).
    if (state.phase === "roundEnd" && state.outcome && xpRoundRef.current < state.roundNumber) {
      xpRoundRef.current = state.roundNumber;
      const outcome = state.outcome;
      applyProfile((p) => addXp(p, roundXpForHuman(outcome, meIndex), boostedRef.current));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase, state.roundNumber, state.outcome]);

  // --- enregistre la partie terminée + récompenses (pièces + XP) ---
  useEffect(() => {
    if (state.phase !== "gameEnd" || recordedRef.current) return;
    recordedRef.current = true;

    const won = state.winnerIndex === meIndex;
    const table = session.table;
    const finalOutcome = state.outcome;
    const today = dayNumber(Date.now());

    applyProfile((p0) => {
      let np = p0;
      let xp = 0;
      // dernière manche (elle a fini la partie → pas passée par roundEnd)
      if (finalOutcome && xpRoundRef.current < state.roundNumber) {
        xpRoundRef.current = state.roundNumber;
        xp += roundXpForHuman(finalOutcome, meIndex);
      }
      // première partie du jour
      if (p0.lastPlayDay !== today) {
        xp += XP_EVENTS.firstGameOfDay;
        np = { ...np, lastPlayDay: today };
      }
      // victoire : gain de la table + XP
      if (won) {
        xp += XP_EVENTS.gameWon;
        if (table && table.soloWin > 0) {
          np = credit(np, table.soloWin, `Victoire ${table.label}`);
          coinsWonRef.current = table.soloWin;
        }
      }
      return addXp(np, xp, boostedRef.current);
    });

    recordGame(
      makeRecord(
        "solo",
        state.players.map((p) => ({ name: p.name, isBot: p.isBot })),
        state.target,
        roundsLogRef.current,
      ),
    );
    clearCurrentPlay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase, state.winnerIndex]);

  // --- pilote les bots ---
  useEffect(() => {
    if (state.phase !== "draw" && state.phase !== "discard") return;
    const cur = state.players[state.turn];
    if (!cur.isBot) return;

    setThinkingId(cur.id);
    const delay = botThinkingDelay(state);
    const t = setTimeout(() => {
      setState((prev) => {
        const p = prev.players[prev.turn];
        if (!p.isBot) return prev;
        if (prev.phase === "draw") return drawCard(prev, botDraw(prev));
        if (prev.phase === "discard") {
          const plan = botDiscardAndMaybePose(prev);
          return plan.pose ? layDown(prev, plan.cardId) : discardCard(prev, plan.cardId);
        }
        return prev;
      });
      setThinkingId(null);
    }, delay);

    return () => {
      clearTimeout(t);
      setThinkingId(null);
    };
  }, [state]);

  // --- décomposition de ma main (combinaisons dorées + points isolés) ---
  const myDecomp = useMemo(() => bestDecomposition(me?.hand ?? []), [me?.hand]);
  const meldedIds = useMemo(
    () => new Set(myDecomp.melds.flatMap((m) => m.cardIds)),
    [myDecomp],
  );
  const myIsolated = myDecomp.isolatedPoints;

  // points isolés si je jette la carte sélectionnée
  const isolatedAfterDiscard = useMemo(() => {
    if (!selectedId || !me) return null;
    return isolatedPoints(me.hand.filter((c) => c.id !== selectedId));
  }, [selectedId, me]);

  const canPose =
    state.phase === "discard" && myTurn && selectedId != null && (isolatedAfterDiscard ?? 99) <= 10;

  // --- actions humaines ---
  const doDraw = (source: "stock" | "discard") => {
    if (!myTurn || state.phase !== "draw") return;
    setState((s) => drawCard(s, source));
    setSelectedId(null);
  };
  const doDiscard = () => {
    if (!myTurn || state.phase !== "discard" || !selectedId) return;
    setState((s) => discardCard(s, selectedId));
    setSelectedId(null);
  };
  const doPose = () => {
    if (!canPose || !selectedId) return;
    setState((s) => layDown(s, selectedId));
    setSelectedId(null);
  };

  const goNextRound = useCallback(() => {
    setState((s) => nextRound(s));
    setSelectedId(null);
  }, []);

  const rematch = () => {
    const rotated = [...state.players.slice(1), state.players[0]].map((p) => ({ ...p, hand: [] }));
    const fresh = startGame(rotated, { target: state.target, dealerIndex: 0 });
    roundsLogRef.current = [];
    loggedRoundRef.current = 0;
    recordedRef.current = false;
    saveCurrentPlay({ ...session, state: fresh, roundsLog: [] });
    setState(fresh);
  };

  if (!me) return null;

  const opponents = state.players
    .map((player, index) => ({ player, index }))
    .filter((e) => e.index !== meIndex);

  const activeId = state.players[state.turn]?.id ?? null;
  const top = topDiscard(state);

  const overlays = (
    <>
      {xpToast && (
        <div className="pointer-events-none fixed left-1/2 top-24 z-[55] -translate-x-1/2 animate-pop-gold rounded-full bg-gold px-4 py-1.5 text-sm font-bold text-felt-deep shadow-glow">
          {xpToast}
          {boostedRef.current && " ×2 ⚡"}
        </div>
      )}
      {levelUp && (
        <LevelUpOverlay level={levelUp.level} rewards={levelUp.rewards} onClose={() => setLevelUp(null)} />
      )}
    </>
  );

  // --- écrans de fin ---
  if (state.phase === "gameEnd") {
    return (
      <>
        {overlays}
        <PlayVictory
          players={state.players}
          scores={state.scores}
          rounds={roundsLogRef.current}
          coinsWon={coinsWonRef.current}
          won={state.winnerIndex === meIndex}
          tableLabel={session.table?.label ?? null}
          onRematch={rematch}
          onHome={() => router.push("/")}
        />
      </>
    );
  }

  return (
    <main
      className="mx-auto flex h-app max-w-md flex-col px-3 safe-top safe-bottom pt-2"
      style={{ background: equippedFelt }}
    >
      {overlays}
      <header className="flex items-center justify-between px-1">
        <button onClick={() => router.push("/")} className="tap rounded-full panel px-3 text-lg" aria-label="Accueil">
          ⌂
        </button>
        <div className="text-center">
          <div className="text-[0.7rem] uppercase tracking-widest text-[color:var(--text-soft)]">
            Manche {state.roundNumber} · objectif {state.target}
          </div>
        </div>
        <div className="w-10" />
      </header>

      {/* Adversaires */}
      <div className="mt-2">
        <OpponentArc opponents={opponents} activeId={activeId} thinkingId={thinkingId} />
      </div>

      {/* Centre : pioche + défausse */}
      <div className="flex flex-1 flex-col items-center justify-center gap-3">
        <div className="flex items-center gap-6">
          <button
            onClick={() => doDraw("stock")}
            disabled={!myTurn || state.phase !== "draw"}
            className={`flex flex-col items-center gap-1 rounded-xl p-1 ${
              myTurn && state.phase === "draw" ? "ring-2 ring-gold shadow-glow" : ""
            }`}
            aria-label="Piocher au talon"
          >
            <PlayingCard rank="A" suit="spades" width={62} faceDown />
            <span className="text-[0.7rem] text-[color:var(--text-soft)]">pioche ({state.stock.length})</span>
          </button>

          <button
            onClick={() => doDraw("discard")}
            disabled={!myTurn || state.phase !== "draw" || !top}
            className={`flex flex-col items-center gap-1 rounded-xl p-1 ${
              myTurn && state.phase === "draw" && top ? "ring-2 ring-gold shadow-glow" : ""
            }`}
            aria-label="Prendre la défausse"
          >
            {top ? (
              <PlayingCard rank={rankLabel(top.rank) as never} suit={top.suit} width={62} />
            ) : (
              <span className="flex h-[87px] w-[62px] items-center justify-center rounded-lg panel-soft text-xs text-[color:var(--text-soft)]">
                vide
              </span>
            )}
            <span className="text-[0.7rem] text-[color:var(--text-soft)]">défausse</span>
          </button>
        </div>

        <StatusMessage
          myTurn={myTurn}
          phase={state.phase}
          activeName={state.players[state.turn]?.name ?? ""}
          thinking={thinkingId != null}
        />
      </div>

      {/* Ma main */}
      <div>
        <div className="mb-1 flex items-center justify-center gap-2 text-sm">
          <span className="text-[color:var(--text-soft)]">points isolés :</span>
          <span className={`tnum text-lg font-bold ${myIsolated === 0 ? "text-gold" : ""}`}>{myIsolated}</span>
          {selectedId && isolatedAfterDiscard != null && (
            <span className="text-xs text-[color:var(--text-soft)]">
              (après défausse : <span className="tnum">{isolatedAfterDiscard}</span>)
            </span>
          )}
        </div>

        <HandFan
          cards={me.hand}
          meldedIds={meldedIds}
          selectedId={selectedId}
          onSelect={(id) => setSelectedId((s) => (s === id ? null : id))}
          disabled={!myTurn}
        />

        {/* Barre d'action */}
        <div className="mt-2 flex gap-2">
          {state.phase === "discard" && myTurn ? (
            <>
              <button
                onClick={doDiscard}
                disabled={!selectedId}
                className="tap flex-1 rounded-2xl panel py-3.5 font-semibold disabled:opacity-40 active:scale-[0.98] transition-transform"
              >
                Jeter{selectedId ? "" : " (choisir)"}
              </button>
              <button
                onClick={doPose}
                disabled={!canPose}
                className={`tap flex-1 rounded-2xl py-3.5 font-bold transition-transform active:scale-[0.98] ${
                  canPose
                    ? isolatedAfterDiscard === 0
                      ? "bg-gold text-felt-deep shadow-glow"
                      : "bg-gold text-felt-deep"
                    : "panel-soft opacity-40"
                }`}
              >
                {isolatedAfterDiscard === 0 ? "RÉMI SEC !" : "POSER"}
              </button>
            </>
          ) : (
            <div className="flex-1 rounded-2xl panel-soft py-3.5 text-center text-sm text-[color:var(--text-soft)]">
              {myTurn ? "Touchez la pioche ou la défausse" : `Au tour de ${state.players[state.turn]?.name}`}
            </div>
          )}
        </div>
      </div>

      {/* Révélation de fin de manche */}
      {state.phase === "roundEnd" && state.outcome && (
        <RoundReveal
          players={state.players}
          outcome={state.outcome}
          scores={state.scores}
          isGameEnd={false}
          onNext={goNextRound}
        />
      )}
    </main>
  );
}

function StatusMessage({
  myTurn,
  phase,
  activeName,
  thinking,
}: {
  myTurn: boolean;
  phase: GameState["phase"];
  activeName: string;
  thinking: boolean;
}) {
  let msg: string;
  if (myTurn && phase === "draw") msg = "À vous — piochez une carte";
  else if (myTurn && phase === "discard") msg = "Jetez une carte, ou posez si ≤ 10";
  else if (thinking) msg = `${activeName} réfléchit…`;
  else msg = `Au tour de ${activeName}`;
  return <div className="rounded-full panel-soft px-4 py-1.5 text-sm">{msg}</div>;
}
