"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getCurrentGame, loadGames } from "@/lib/storage";
import type { Game } from "@/lib/types";

export default function HomePage() {
  const [current, setCurrent] = useState<Game | null>(null);
  const [hasHistory, setHasHistory] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const cur = getCurrentGame();
    setCurrent(cur && !cur.finishedAt ? cur : null);
    setHasHistory(loadGames().some((g) => g.finishedAt));
    setReady(true);
  }, []);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-5 pt-6 safe-bottom">
      <div className="flex justify-end">
        <ThemeToggle />
      </div>

      <div className="mt-6">
        <Logo />
      </div>

      <nav className="mt-12 flex flex-col gap-3">
        <Link
          href="/nouvelle-partie"
          className="tap flex items-center justify-center rounded-2xl bg-gold px-6 py-4 text-lg font-bold text-felt-deep shadow-glow active:scale-[0.98] transition-transform"
        >
          Nouvelle partie
        </Link>

        {ready && current && (
          <Link
            href="/partie"
            className="tap flex items-center justify-between rounded-2xl panel px-6 py-4 text-lg font-semibold active:scale-[0.98] transition-transform"
          >
            <span>Reprendre la partie</span>
            <span className="text-sm text-[color:var(--text-soft)]">
              {current.players.length} joueurs · manche {current.rounds.length + 1}
            </span>
          </Link>
        )}

        <Link
          href="/historique"
          className="tap flex items-center justify-center rounded-2xl panel px-6 py-4 text-lg font-semibold active:scale-[0.98] transition-transform"
        >
          Historique des parties
          {ready && hasHistory && <span className="ml-2 text-gold">•</span>}
        </Link>

        <Link
          href="/regles"
          className="tap flex items-center justify-center rounded-2xl panel px-6 py-4 text-lg font-semibold active:scale-[0.98] transition-transform"
        >
          Les règles du jeu
        </Link>
      </nav>

      <p className="mt-auto pt-10 text-center text-xs text-[color:var(--text-soft)]">
        100 % hors-ligne · aucune inscription · vos parties restent sur ce téléphone
      </p>
    </main>
  );
}
