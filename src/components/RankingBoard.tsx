"use client";

import { useLayoutEffect, useRef } from "react";
import type { Game } from "@/lib/types";
import { totals, lastRoundDeltas } from "@/lib/game";
import { Odometer } from "./Odometer";

/**
 * Classement en direct : cartes joueurs triées par total décroissant,
 * barre de progression vers l'objectif, flèche de variation à la dernière
 * manche. Réordonnancement animé en FLIP (transform only).
 */
export function RankingBoard({ game }: { game: Game }) {
  const t = totals(game);
  const deltas = lastRoundDeltas(game);
  const containerRef = useRef<HTMLUListElement>(null);
  const prevRects = useRef<Map<string, DOMRect>>(new Map());

  const order = game.players
    .map((p, i) => ({ player: p, index: i, total: t[i] }))
    .sort((a, b) => b.total - a.total || a.index - b.index);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const items = Array.from(container.querySelectorAll<HTMLElement>("[data-pid]"));
    items.forEach((el) => {
      const id = el.dataset.pid!;
      const newRect = el.getBoundingClientRect();
      const oldRect = prevRects.current.get(id);
      if (oldRect && !reduce) {
        const dy = oldRect.top - newRect.top;
        if (dy !== 0) {
          el.style.transform = `translateY(${dy}px)`;
          el.style.transition = "transform 0s";
          requestAnimationFrame(() => {
            el.style.transform = "";
            el.style.transition = "transform 0.45s cubic-bezier(0.2,0.8,0.2,1)";
          });
        }
      }
      prevRects.current.set(id, newRect);
    });
  });

  const leader = order[0]?.total ?? 0;

  return (
    <ul ref={containerRef} className="flex flex-col gap-2.5">
      {order.map((entry, rank) => {
        const d = deltas ? deltas[entry.index] : 0;
        const pct = game.target > 0 ? Math.min(100, Math.max(0, (entry.total / game.target) * 100)) : 0;
        const isLeader = rank === 0 && entry.total > 0 && entry.total === leader;
        return (
          <li
            key={entry.player.id}
            data-pid={entry.player.id}
            className={`rounded-2xl panel p-3 ${isLeader ? "ring-2 ring-gold/70" : ""}`}
          >
            <div className="flex items-center gap-3">
              <span className="w-5 text-center text-sm font-bold text-[color:var(--text-soft)]">
                {rank + 1}
              </span>
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-felt-deep"
                style={{ background: entry.player.color }}
              >
                {entry.player.name.slice(0, 1).toUpperCase()}
              </span>
              <span className="min-w-0 flex-1 truncate text-lg font-semibold">
                {entry.player.name}
                {isLeader && <span className="ml-1 text-gold">♛</span>}
              </span>
              <div className="flex items-center gap-2">
                {d !== 0 && (
                  <span
                    className={`text-xs font-bold tnum ${d > 0 ? "text-gold" : "text-contre"}`}
                  >
                    {d > 0 ? "▲" : "▼"}
                    {d > 0 ? "+" : ""}
                    {d}
                  </span>
                )}
                <span className="text-2xl font-bold tnum">
                  <Odometer value={entry.total} />
                </span>
              </div>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full progress-track">
              <div
                className="h-full rounded-full bg-gold transition-[width] duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
