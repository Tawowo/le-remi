"use client";

import { PlayingCard } from "@/components/PlayingCard";
import type { EnginePlayer } from "@/lib/game/engine";

/** Adversaires en arc : avatar, éventail de dos, indicateur de tour. */
export function OpponentArc({
  opponents,
  activeId,
  thinkingId,
}: {
  opponents: { player: EnginePlayer; index: number }[];
  activeId: string | null;
  thinkingId: string | null;
}) {
  return (
    <div className="flex flex-wrap items-start justify-center gap-3 px-2">
      {opponents.map(({ player }) => {
        const active = activeId === player.id;
        const thinking = thinkingId === player.id;
        const backs = Math.min(player.hand.length, 7);
        return (
          <div
            key={player.id}
            className={`flex flex-col items-center rounded-2xl px-2.5 py-2 transition-shadow ${
              active ? "panel ring-2 ring-gold shadow-glow" : "panel-soft"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span
                className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-felt-deep"
                style={{ background: player.color }}
              >
                {player.name.slice(0, 1).toUpperCase()}
              </span>
              <span className="max-w-[72px] truncate text-sm font-semibold">{player.name}</span>
            </div>
            <div className="relative mt-1 flex h-8 items-center justify-center" style={{ paddingLeft: 10 }}>
              {Array.from({ length: backs }).map((_, i) => (
                <span key={i} style={{ marginLeft: -10, zIndex: i }}>
                  <PlayingCard rank="A" suit="spades" width={20} faceDown />
                </span>
              ))}
            </div>
            <div className="mt-0.5 text-[0.7rem] tnum text-[color:var(--text-soft)]">
              {thinking ? (
                <span className="text-gold animate-pulse">réfléchit…</span>
              ) : (
                `${player.hand.length} cartes`
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
