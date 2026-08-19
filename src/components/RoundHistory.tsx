"use client";

import type { Game } from "@/lib/types";

const KIND_LABEL: Record<string, string> = {
  normal: "Manche",
  "remi-sec": "Rémi sec",
  egalite: "Égalité",
  contre: "Contre",
  "contre-egalite": "Contre (égalité)",
};

/** Tableau par manche : qui a posé, le type, et le delta de chaque joueur. */
export function RoundHistory({ game }: { game: Game }) {
  if (game.rounds.length === 0) {
    return (
      <p className="rounded-2xl panel-soft p-4 text-center text-sm text-[color:var(--text-soft)]">
        Aucune manche jouée pour l'instant.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl panel">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="text-[color:var(--text-soft)]">
            <th className="p-2 text-left font-semibold">M</th>
            <th className="p-2 text-left font-semibold">Type</th>
            {game.players.map((p) => (
              <th key={p.id} className="p-2 text-center font-semibold">
                <span
                  className="mx-auto flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-felt-deep"
                  style={{ background: p.color }}
                  title={p.name}
                >
                  {p.name.slice(0, 1).toUpperCase()}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {game.rounds.map((r) => (
            <tr key={r.number} className="border-t border-[color:var(--border)]">
              <td className="p-2 font-bold tnum">{r.number}</td>
              <td className="p-2">
                <span className="whitespace-nowrap text-xs text-[color:var(--text-soft)]">
                  {KIND_LABEL[r.kind]}
                  <br />
                  <span className="text-[color:var(--text)]">{game.players[r.poserIndex].name}</span>
                </span>
              </td>
              {r.result.deltas.map((d, i) => (
                <td
                  key={i}
                  className={`p-2 text-center tnum font-semibold ${
                    d > 0 ? "text-gold" : d < 0 ? "text-contre" : "text-[color:var(--text-soft)]"
                  }`}
                >
                  {d > 0 ? "+" : ""}
                  {d}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
