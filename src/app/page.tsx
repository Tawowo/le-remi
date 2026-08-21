"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getCurrentGame, loadGames } from "@/lib/storage";
import { loadCurrentPlay } from "@/lib/playStore";
import type { Game } from "@/lib/types";

interface Resume {
  href: string;
  label: string;
  detail: string;
}

export default function HomePage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const list: Resume[] = [];
    const play = loadCurrentPlay();
    if (play && play.state.phase !== "gameEnd") {
      list.push({
        href: "/table",
        label: "Reprendre la partie contre l'ordinateur",
        detail: `${play.state.players.length} joueurs · manche ${play.state.roundNumber}`,
      });
    }
    const table: Game | null = getCurrentGame();
    if (table && !table.finishedAt) {
      list.push({
        href: "/partie",
        label: "Reprendre la partie sur table",
        detail: `${table.players.length} joueurs · manche ${table.rounds.length + 1}`,
      });
    }
    setResumes(list);
    void loadGames();
    setReady(true);
  }, []);

  return (
    <main className="mx-auto flex min-h-app max-w-md flex-col px-5 safe-top safe-bottom pt-2">
      <div className="flex justify-end">
        <ThemeToggle />
      </div>

      <div className="mt-4">
        <Logo />
      </div>

      {ready && resumes.length > 0 && (
        <div className="mt-8 flex flex-col gap-2">
          {resumes.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className="tap flex items-center justify-between rounded-2xl border border-gold/60 panel px-5 py-3.5 active:scale-[0.98] transition-transform"
            >
              <span className="font-semibold">{r.label}</span>
              <span className="text-xs text-[color:var(--text-soft)]">{r.detail}</span>
            </Link>
          ))}
        </div>
      )}

      <nav className="mt-8 flex flex-col gap-3">
        <Tile href="/jouer" primary icon="🤖" title="Jouer contre l'ordinateur" sub="1 à 5 bots, profils réglables" />
        <Tile href="/en-ligne" icon="🌐" title="Jouer en ligne" sub="Créer ou rejoindre par code" />
        <Tile href="/nouvelle-partie" icon="🃏" title="Partie sur table" sub="Compteur de score autour d'une table" />
        <div className="grid grid-cols-2 gap-3">
          <Tile href="/stats" icon="📊" title="Statistiques" sub="Par pseudo" compact />
          <Tile href="/regles" icon="📖" title="Les règles" sub="Apprendre" compact />
        </div>
      </nav>

      <p className="mt-auto pt-8 text-center text-xs text-[color:var(--text-soft)]">
        100 % hors-ligne (sauf le mode en ligne) · aucune inscription
      </p>
    </main>
  );
}

function Tile({
  href,
  title,
  sub,
  icon,
  primary = false,
  compact = false,
}: {
  href: string;
  title: string;
  sub: string;
  icon: string;
  primary?: boolean;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      className={[
        "tap flex items-center gap-3 rounded-2xl px-5 active:scale-[0.98] transition-transform",
        compact ? "flex-col items-start py-3" : "py-4",
        primary ? "bg-gold text-felt-deep shadow-glow" : "panel",
      ].join(" ")}
    >
      <span className="text-2xl">{icon}</span>
      <span className="min-w-0">
        <span className="block font-bold leading-tight">{title}</span>
        <span className={`block text-xs ${primary ? "text-felt-deep/70" : "text-[color:var(--text-soft)]"}`}>{sub}</span>
      </span>
    </Link>
  );
}
