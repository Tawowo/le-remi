"use client";

import { Confetti } from "@/components/Confetti";
import type { EnginePlayer } from "@/lib/game/engine";
import { makeRecord, type RoundLike } from "@/lib/profiles";

const MEDALS = ["🥇", "🥈", "🥉"];

/** Écran de victoire du mode jouable : podium, stats, revanche. */
export function PlayVictory({
  players,
  scores,
  rounds,
  onRematch,
  onHome,
}: {
  players: EnginePlayer[];
  scores: number[];
  rounds: RoundLike[];
  onRematch: () => void;
  onHome: () => void;
}) {
  const podium = players
    .map((p, i) => ({ p, total: scores[i] }))
    .sort((a, b) => b.total - a.total);

  const rec = makeRecord(
    "solo",
    players.map((p) => ({ name: p.name, isBot: p.isBot })),
    0,
    rounds,
  );
  const bestRoundPlayer = rec.players.reduce((a, b) => (b.bestRound > a.bestRound ? b : a), rec.players[0]);
  const remiSecTotal = rec.players.reduce((s, p) => s + p.remiSecs, 0);

  return (
    <main className="mx-auto min-h-app max-w-md px-5 safe-top safe-bottom pt-4">
      <Confetti active count={140} />
      <div className="text-center">
        <div className="text-sm uppercase tracking-[0.3em] text-[color:var(--text-soft)]">Partie terminée</div>
        <h1 className="mt-2 text-4xl font-display font-black">
          <span className="gold-shimmer">{podium[0].p.name} gagne !</span>
        </h1>
      </div>

      <ol className="mt-8 flex flex-col gap-2.5">
        {podium.map((entry, rank) => (
          <li
            key={entry.p.id}
            className={`flex items-center gap-3 rounded-2xl p-4 ${rank === 0 ? "bg-gold text-felt-deep shadow-glow" : "panel"}`}
            style={{ animation: `pop-gold 0.5s ${rank * 0.1}s both` }}
          >
            <span className="text-2xl">{MEDALS[rank] ?? `${rank + 1}.`}</span>
            <span
              className="flex h-10 w-10 items-center justify-center rounded-full text-base font-bold text-felt-deep"
              style={{ background: entry.p.color }}
            >
              {entry.p.name.slice(0, 1).toUpperCase()}
            </span>
            <span className="flex-1 truncate text-lg font-bold">
              {entry.p.name}
              {entry.p.isBot && <span className="ml-1 text-xs opacity-70">bot</span>}
            </span>
            <span className="text-2xl font-black tnum">{entry.total}</span>
          </li>
        ))}
      </ol>

      <div className="mt-6 grid grid-cols-2 gap-2.5">
        <Stat label="Meilleure manche" value={`+${bestRoundPlayer?.bestRound ?? 0}`} sub={bestRoundPlayer?.name ?? ""} />
        <Stat label="Rémi secs" value={String(remiSecTotal)} sub="dans la partie" />
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <button
          onClick={onRematch}
          className="tap w-full rounded-2xl bg-gold py-4 text-lg font-bold text-felt-deep shadow-glow active:scale-[0.98] transition-transform"
        >
          Revanche
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
