"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Game } from "@/lib/types";
import { loadGames, deleteGame, setCurrentGame } from "@/lib/storage";
import { totals } from "@/lib/game";

function fmtDate(ms: number): string {
  return new Date(ms).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function HistoryPage() {
  const router = useRouter();
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    setGames(loadGames());
  }, []);

  const remove = (id: string) => {
    if (!confirm("Supprimer cette partie ?")) return;
    deleteGame(id);
    setGames(loadGames());
  };

  const resume = (g: Game) => {
    setCurrentGame(g.id);
    router.push("/partie");
  };

  return (
    <main className="mx-auto min-h-screen max-w-md px-5 pt-6 safe-bottom">
      <header className="mb-5 flex items-center gap-3">
        <Link href="/" className="tap flex items-center rounded-full panel px-3 text-lg" aria-label="Retour">
          ←
        </Link>
        <h1 className="text-2xl font-display font-bold">Historique</h1>
      </header>

      {games.length === 0 && (
        <p className="rounded-2xl panel-soft p-6 text-center text-[color:var(--text-soft)]">
          Aucune partie enregistrée pour l'instant.
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {games.map((g) => {
          const t = totals(g);
          const podium = g.players
            .map((p, i) => ({ player: p, total: t[i] }))
            .sort((a, b) => b.total - a.total);
          const finished = !!g.finishedAt;
          return (
            <li key={g.id} className="rounded-2xl panel p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-display text-lg font-bold">
                    {finished ? (
                      <span>
                        🏆 {podium[0].player.name}
                      </span>
                    ) : (
                      <span className="text-[color:var(--text-soft)]">Partie en cours</span>
                    )}
                  </div>
                  <div className="text-xs text-[color:var(--text-soft)]">
                    {fmtDate(g.createdAt)} · {g.players.length} joueurs · {g.rounds.length} manches
                  </div>
                </div>
                <button onClick={() => remove(g.id)} className="tap rounded-lg panel-soft px-2 text-contre" aria-label="Supprimer">
                  🗑
                </button>
              </div>

              <ol className="mt-3 flex flex-col gap-1 text-sm">
                {podium.map((e, rank) => (
                  <li key={e.player.id} className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="w-4 text-[color:var(--text-soft)]">{rank + 1}.</span>
                      <span
                        className="flex h-5 w-5 items-center justify-center rounded-full text-[0.6rem] font-bold text-felt-deep"
                        style={{ background: e.player.color }}
                      >
                        {e.player.name.slice(0, 1).toUpperCase()}
                      </span>
                      {e.player.name}
                    </span>
                    <span className="tnum font-semibold">{e.total}</span>
                  </li>
                ))}
              </ol>

              {!finished && (
                <button
                  onClick={() => resume(g)}
                  className="mt-3 tap w-full rounded-xl bg-gold py-2.5 text-sm font-bold text-felt-deep"
                >
                  Reprendre
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </main>
  );
}
