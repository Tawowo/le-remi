"use client";

import { useEffect } from "react";
import { PlayingCard, type Rank } from "@/components/PlayingCard";
import { Confetti } from "@/components/Confetti";
import { rankLabel } from "@/lib/game/cards";
import type { EnginePlayer, RoundOutcome } from "@/lib/game/engine";

/** Décompte pédagogique : mains révélées, combinaisons surlignées, calcul. */
export function RoundReveal({
  players,
  outcome,
  scores,
  isGameEnd,
  onNext,
}: {
  players: EnginePlayer[];
  outcome: RoundOutcome;
  scores: number[];
  isGameEnd: boolean;
  onNext: () => void;
}) {
  const { result, decompositions, poserIndex, points } = outcome;
  const celebrate = result.kind === "remi-sec";
  const isContre = result.kind === "contre" || result.kind === "contre-egalite";

  useEffect(() => {
    if (celebrate && navigator.vibrate) navigator.vibrate(40);
  }, [celebrate]);

  const title = {
    "remi-sec": "RÉMI SEC !",
    contre: "CONTRE !",
    "contre-egalite": "CONTRE !",
    egalite: "Égalité au plus bas",
    normal: "Manche remportée",
  }[result.kind];

  const winners = result.winners.map((i) => players[i].name).join(" & ");

  return (
    <div className="fixed inset-0 z-40 flex h-app flex-col bg-[color:var(--bg)]/97 backdrop-blur">
      <Confetti active={celebrate} />
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col overflow-hidden px-5 safe-top safe-bottom pt-2">
        <div
          className={[
            "mb-3 rounded-2xl p-4 text-center",
            isContre ? "bg-contre text-white" : celebrate ? "bg-gold text-felt-deep" : "panel",
          ].join(" ")}
        >
          <div className="text-2xl font-display font-black">{title}</div>
          <div className="text-sm opacity-90">
            {isContre ? `${winners} avai(en)t moins que ${players[poserIndex].name} !` : `${winners} rafle(nt) la manche`}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Mains révélées */}
          <div className="flex flex-col gap-2.5">
            {players.map((p, i) => {
              const melded = new Set(decompositions[i].melds.flatMap((m) => m.cardIds));
              const d = result.deltas[i];
              return (
                <div key={p.id} className="rounded-2xl panel p-2.5">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm font-semibold">
                      <span
                        className="flex h-6 w-6 items-center justify-center rounded-full text-[0.7rem] font-bold text-felt-deep"
                        style={{ background: p.color }}
                      >
                        {p.name.slice(0, 1).toUpperCase()}
                      </span>
                      {p.name}
                      {i === poserIndex && <span className="text-xs text-[color:var(--text-soft)]">(pose)</span>}
                    </span>
                    <span className="flex items-center gap-2 text-sm">
                      <span className="text-[color:var(--text-soft)]">{points[i]} isolés</span>
                      <span className={`tnum font-bold ${d > 0 ? "text-gold" : d < 0 ? "text-contre" : ""}`}>
                        {d > 0 ? "+" : ""}
                        {d}
                      </span>
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-0.5 gap-y-1">
                    {p.hand.map((c) => {
                      const inMeld = melded.has(c.id);
                      return (
                        <span key={c.id} className={inMeld ? "rounded-[7px] ring-2 ring-gold" : "opacity-90"}>
                          <PlayingCard rank={rankLabel(c.rank) as Rank} suit={c.suit} width={30} />
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Calcul */}
          <div className="mt-3 rounded-2xl panel-soft p-3 text-sm">
            <div className="text-xs text-[color:var(--text-soft)]">Détail du calcul</div>
            <div className="mt-1 tnum">
              Pot = {points.join(" + ")} = <strong>{result.roundTotal}</strong>
            </div>
            {result.breakdown.map((b) => (
              <div key={b.index} className="tnum">
                {players[b.index].name} rafle {b.base}
                {b.bonus > 0 && <span className="text-gold"> + {b.bonus} Rémi sec</span>} ={" "}
                <span className="text-gold">+{b.total}</span>
              </div>
            ))}
            {result.poserPenalty !== 0 && (
              <div className="tnum text-contre">
                {players[poserIndex].name} coiffé : {result.poserPenalty}
              </div>
            )}
          </div>

          {/* Totaux cumulés */}
          <div className="mt-3 rounded-2xl panel p-3">
            <div className="mb-1 text-xs text-[color:var(--text-soft)]">Totaux</div>
            {players
              .map((p, i) => ({ p, total: scores[i] }))
              .sort((a, b) => b.total - a.total)
              .map(({ p, total }) => (
                <div key={p.id} className="flex justify-between text-sm">
                  <span>{p.name}</span>
                  <span className="tnum font-semibold">{total}</span>
                </div>
              ))}
          </div>
        </div>

        <button
          onClick={onNext}
          className="mt-3 tap w-full rounded-2xl bg-gold py-3.5 font-bold text-felt-deep shadow-glow active:scale-[0.98] transition-transform"
        >
          {isGameEnd ? "Voir la victoire" : "Manche suivante"}
        </button>
      </div>
    </div>
  );
}
