"use client";

import type { Game } from "@/lib/types";
import { totals, computeStats } from "@/lib/game";
import { Confetti } from "./Confetti";

const MEDALS = ["🥇", "🥈", "🥉"];

export function VictoryScreen({
  game,
  onRematch,
  onHome,
}: {
  game: Game;
  onRematch: () => void;
  onHome: () => void;
}) {
  const t = totals(game);
  const stats = computeStats(game);
  const podium = game.players
    .map((p, i) => ({ player: p, index: i, total: t[i] }))
    .sort((a, b) => b.total - a.total);

  return (
    <main className="mx-auto min-h-screen max-w-md px-5 pt-8 safe-bottom">
      <Confetti active count={140} />
      <div className="text-center">
        <div className="text-sm uppercase tracking-[0.3em] text-[color:var(--text-soft)]">Partie terminée</div>
        <h1 className="mt-2 text-4xl font-display font-black">
          <span className="gold-shimmer">{podium[0].player.name} l'emporte !</span>
        </h1>
      </div>

      <ol className="mt-8 flex flex-col gap-2.5">
        {podium.map((entry, rank) => (
          <li
            key={entry.player.id}
            className={`flex items-center gap-3 rounded-2xl p-4 ${
              rank === 0 ? "bg-gold text-felt-deep shadow-glow" : "panel"
            }`}
            style={{ animation: `pop-gold 0.5s ${rank * 0.1}s both` }}
          >
            <span className="text-2xl">{MEDALS[rank] ?? `${rank + 1}.`}</span>
            <span
              className="flex h-10 w-10 items-center justify-center rounded-full text-base font-bold text-felt-deep"
              style={{ background: entry.player.color }}
            >
              {entry.player.name.slice(0, 1).toUpperCase()}
            </span>
            <span className="flex-1 truncate text-lg font-bold">{entry.player.name}</span>
            <span className="text-2xl font-black tnum">{entry.total}</span>
          </li>
        ))}
      </ol>

      <div className="mt-6 grid grid-cols-3 gap-2.5">
        <Stat
          label="Meilleure manche"
          value={stats.bestRound ? `+${stats.bestRound.value}` : "—"}
          sub={stats.bestRound ? game.players[stats.bestRound.playerIndex].name : ""}
        />
        <Stat label="Rémi secs" value={String(stats.remiSecCount)} sub="posés à 0" />
        <Stat
          label="Roi du contre"
          value={stats.contreKing ? String(stats.contreKing.count) : "0"}
          sub={stats.contreKing ? game.players[stats.contreKing.playerIndex].name : "aucun"}
        />
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <button
          onClick={onRematch}
          className="tap w-full rounded-2xl bg-gold py-4 text-lg font-bold text-felt-deep shadow-glow active:scale-[0.98] transition-transform"
        >
          Revanche (ordre décalé)
        </button>
        <button onClick={onHome} className="tap w-full rounded-2xl panel py-3.5 font-semibold active:scale-[0.98] transition-transform">
          Retour à l'accueil
        </button>
      </div>
    </main>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl panel p-3 text-center">
      <div className="text-[0.65rem] uppercase tracking-wide text-[color:var(--text-soft)]">{label}</div>
      <div className="mt-1 text-2xl font-black tnum text-gold">{value}</div>
      <div className="truncate text-xs text-[color:var(--text-soft)]">{sub}</div>
    </div>
  );
}
