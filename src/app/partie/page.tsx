"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Game } from "@/lib/types";
import { getCurrentGame, upsertGame, setCurrentGame } from "@/lib/storage";
import { commitRound, undoLastRound, nextRoundNumber, rematch } from "@/lib/table";
import { makeRecord, recordGame } from "@/lib/profiles";
import { roundHeading, cardsPerPlayer } from "@/lib/rotation";
import { RankingBoard } from "@/components/RankingBoard";
import { RoundEntry } from "@/components/RoundEntry";
import { RoundHistory } from "@/components/RoundHistory";
import { RulesPanel } from "@/components/RulesPanel";
import { VictoryScreen } from "@/components/VictoryScreen";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function GamePage() {
  const router = useRouter();
  const [game, setGame] = useState<Game | null>(null);
  const [ready, setReady] = useState(false);
  const [entryOpen, setEntryOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);

  useEffect(() => {
    const g = getCurrentGame();
    setGame(g);
    setReady(true);
  }, []);

  const persist = (g: Game) => {
    upsertGame(g);
    setGame(g);
  };

  if (ready && !game) {
    return (
      <main className="mx-auto flex min-h-app max-w-md flex-col items-center justify-center px-5 text-center safe-top safe-bottom">
        <p className="mb-4 text-lg">Aucune partie en cours.</p>
        <button
          onClick={() => router.push("/nouvelle-partie")}
          className="tap rounded-2xl bg-gold px-6 py-3 font-bold text-felt-deep"
        >
          Nouvelle partie
        </button>
      </main>
    );
  }

  if (!game) return null;

  // Écran de victoire
  if (game.finishedAt) {
    return (
      <VictoryScreen
        game={game}
        onRematch={() => {
          const g = rematch(game);
          upsertGame(g);
          setCurrentGame(g.id);
          setGame(g);
        }}
        onHome={() => router.push("/")}
      />
    );
  }

  const roundNumber = nextRoundNumber(game);
  const heading = roundHeading(game.players, roundNumber);

  return (
    <main className="mx-auto min-h-app max-w-md px-5 safe-top safe-bottom pt-2">
      <header className="mb-4 flex items-center justify-between">
        <button onClick={() => router.push("/")} className="tap rounded-full panel px-3 text-lg" aria-label="Accueil">
          ⌂
        </button>
        <h1 className="text-lg font-display font-bold">Le Rémi</h1>
        <div className="flex gap-2">
          <button onClick={() => setRulesOpen(true)} className="tap rounded-full panel px-3 text-lg" aria-label="Règles">
            ?
          </button>
          <ThemeToggle />
        </div>
      </header>

      {/* Bandeau de manche */}
      <div className="mb-4 rounded-2xl panel p-4">
        <div className="text-sm uppercase tracking-widest text-[color:var(--text-soft)]">Manche {roundNumber}</div>
        <div className="mt-1 flex items-center gap-2 text-[15px]">
          <span className="text-xl">🂠</span>
          <span>
            <strong style={{ color: heading.dealer.color }}>{heading.dealer.name}</strong> distribue,{" "}
            <strong style={{ color: heading.starter.color }}>{heading.starter.name}</strong> commence
          </span>
        </div>
        <div className="mt-1 text-xs text-[color:var(--text-soft)]">
          {cardsPerPlayer(game.players.length)} cartes/joueur · objectif {game.target} pts
        </div>
      </div>

      <RankingBoard game={game} />

      <button
        onClick={() => setEntryOpen(true)}
        className="mt-5 tap w-full rounded-2xl bg-gold py-5 text-xl font-bold text-felt-deep shadow-glow active:scale-[0.98] transition-transform"
      >
        Fin de manche
      </button>

      <div className="mt-3 flex gap-3">
        <button
          onClick={() => setHistoryOpen((v) => !v)}
          className="tap flex-1 rounded-2xl panel py-3 text-sm font-semibold"
        >
          {historyOpen ? "Masquer" : "Historique"} des manches
        </button>
        <button
          onClick={() => {
            if (game.rounds.length === 0) return;
            if (confirm("Annuler et corriger la dernière manche ?")) {
              persist(undoLastRound(game));
            }
          }}
          disabled={game.rounds.length === 0}
          className="tap flex-1 rounded-2xl panel py-3 text-sm font-semibold disabled:opacity-40"
        >
          Corriger la dernière
        </button>
      </div>

      {historyOpen && (
        <div className="mt-4">
          <RoundHistory game={game} />
        </div>
      )}

      <div className="h-8" />

      {entryOpen && (
        <RoundEntry
          game={game}
          roundNumber={roundNumber}
          onCancel={() => setEntryOpen(false)}
          onCommit={(poserIndex, points) => {
            const next = commitRound(game, poserIndex, points);
            persist(next);
            setEntryOpen(false);
            if (next.finishedAt) {
              recordGame(
                makeRecord(
                  "table",
                  next.players.map((p) => ({ name: p.name, isBot: false })),
                  next.target,
                  next.rounds.map((r) => ({ poserIndex: r.poserIndex, result: r.result })),
                ),
              );
            }
          }}
        />
      )}

      {rulesOpen && <RulesPanel onClose={() => setRulesOpen(false)} />}
    </main>
  );
}
