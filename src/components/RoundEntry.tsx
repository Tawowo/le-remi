"use client";

import { useMemo, useState } from "react";
import type { Game } from "@/lib/types";
import { scoreRound } from "@/lib/scoring";
import { TenKeypad, DigitKeypad } from "./Keypad";
import { ResultReveal } from "./ResultReveal";

type Step =
  | { name: "poser" }
  | { name: "poserPoints" }
  | { name: "opponent"; oppOrder: number }
  | { name: "result" };

export function RoundEntry({
  game,
  roundNumber,
  onCommit,
  onCancel,
}: {
  game: Game;
  roundNumber: number;
  onCommit: (poserIndex: number, points: number[]) => void;
  onCancel: () => void;
}) {
  const players = game.players;
  const n = players.length;

  const [poserIndex, setPoserIndex] = useState<number | null>(null);
  const [points, setPoints] = useState<number[]>(() => new Array(n).fill(0));
  const [step, setStep] = useState<Step>({ name: "poser" });
  const [confirmBig, setConfirmBig] = useState(false);

  // Ordre des adversaires (tous sauf le poseur).
  const opponents = useMemo(
    () => players.map((_, i) => i).filter((i) => i !== poserIndex),
    [players, poserIndex],
  );

  const setPoint = (index: number, v: number) =>
    setPoints((prev) => {
      const copy = [...prev];
      copy[index] = v;
      return copy;
    });

  const result = useMemo(() => {
    if (poserIndex == null) return null;
    return scoreRound({ playerCount: n, poserIndex, points });
  }, [poserIndex, points, n]);

  // ---- rendu par étape ----

  if (step.name === "poser") {
    return (
      <Shell title={`Manche ${roundNumber}`} subtitle="Qui a posé ?" onCancel={onCancel}>
        <div className="grid grid-cols-1 gap-2.5">
          {players.map((p, i) => (
            <button
              key={p.id}
              onClick={() => {
                setPoserIndex(i);
                setPoints(new Array(n).fill(0));
                setStep({ name: "poserPoints" });
              }}
              className="tap flex items-center gap-3 rounded-2xl panel px-4 py-3.5 text-left text-lg font-semibold active:scale-[0.98] transition-transform"
            >
              <span
                className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-felt-deep"
                style={{ background: p.color }}
              >
                {p.name.slice(0, 1).toUpperCase()}
              </span>
              {p.name}
            </button>
          ))}
        </div>
      </Shell>
    );
  }

  if (step.name === "poserPoints" && poserIndex != null) {
    return (
      <Shell
        title={players[poserIndex].name}
        subtitle="Ses points restants ?"
        onCancel={onCancel}
        onBack={() => setStep({ name: "poser" })}
      >
        <div className="animate-slide-in-right">
          <TenKeypad value={points[poserIndex]} onSelect={(v) => setPoint(poserIndex, v)} />
          <p className="mt-3 text-center text-xs text-[color:var(--text-soft)]">
            Cartes isolées uniquement — brelans &amp; suites = 0.
          </p>
          <button
            onClick={() =>
              setStep(opponents.length ? { name: "opponent", oppOrder: 0 } : { name: "result" })
            }
            className="mt-5 tap w-full rounded-2xl bg-gold py-3.5 font-bold text-felt-deep active:scale-[0.98] transition-transform"
          >
            Continuer
          </button>
        </div>
      </Shell>
    );
  }

  if (step.name === "opponent" && poserIndex != null) {
    const oppOrder = step.oppOrder;
    const playerIndex = opponents[oppOrder];
    const value = points[playerIndex];
    const isLast = oppOrder === opponents.length - 1;
    const bigWarn = value > 60;

    const goNext = () => {
      if (bigWarn && !confirmBig) {
        setConfirmBig(true);
        return;
      }
      setConfirmBig(false);
      if (isLast) setStep({ name: "result" });
      else setStep({ name: "opponent", oppOrder: oppOrder + 1 });
    };

    return (
      <Shell
        title={players[playerIndex].name}
        subtitle={`Points restants — adversaire ${oppOrder + 1}/${opponents.length}`}
        onCancel={onCancel}
        onBack={() =>
          setStep(
            oppOrder === 0
              ? { name: "poserPoints" }
              : { name: "opponent", oppOrder: oppOrder - 1 },
          )
        }
      >
        <div key={playerIndex} className="animate-slide-in-right">
          <DigitKeypad value={value} onChange={(v) => setPoint(playerIndex, v)} />
          <p className="mt-3 text-center text-xs text-[color:var(--text-soft)]">
            Rappel : brelans &amp; suites = 0, on ne compte que les cartes isolées.
          </p>
          {bigWarn && confirmBig && (
            <p className="mt-2 text-center text-sm font-semibold text-gold">
              {value} points isolés, c'est beaucoup — vous confirmez ? Appuyez à nouveau.
            </p>
          )}
          <button
            onClick={goNext}
            className="mt-5 tap w-full rounded-2xl bg-gold py-3.5 font-bold text-felt-deep active:scale-[0.98] transition-transform"
          >
            {isLast ? "Voir le résultat" : "Adversaire suivant"}
          </button>
        </div>
      </Shell>
    );
  }

  if (step.name === "result" && poserIndex != null && result) {
    return (
      <Shell title={`Manche ${roundNumber}`} subtitle="Résultat" onCancel={onCancel}>
        <ResultReveal
          game={game}
          result={result}
          poserIndex={poserIndex}
          points={points}
          onValidate={() => onCommit(poserIndex, points)}
          onBack={() =>
            setStep(
              opponents.length
                ? { name: "opponent", oppOrder: opponents.length - 1 }
                : { name: "poserPoints" },
            )
          }
        />
      </Shell>
    );
  }

  return null;
}

function Shell({
  title,
  subtitle,
  children,
  onCancel,
  onBack,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  onCancel: () => void;
  onBack?: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 flex h-app flex-col bg-[color:var(--bg)]/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 safe-top safe-bottom pt-2">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onBack && (
              <button onClick={onBack} className="tap rounded-full panel px-3 text-lg" aria-label="Étape précédente">
                ←
              </button>
            )}
            <div>
              <div className="text-xs uppercase tracking-widest text-[color:var(--text-soft)]">{title}</div>
              <div className="text-xl font-display font-bold">{subtitle}</div>
            </div>
          </div>
          <button onClick={onCancel} className="tap rounded-full panel px-3 text-lg" aria-label="Annuler la saisie">
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto pb-6">{children}</div>
      </div>
    </div>
  );
}
