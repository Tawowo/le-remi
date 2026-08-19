"use client";

import { useEffect, useState } from "react";
import type { Game } from "@/lib/types";
import type { RoundResult } from "@/lib/scoring";
import { Confetti } from "./Confetti";
import { loadSettings } from "@/lib/storage";

/** Petit « bip » discret optionnel (WebAudio, aucun asset). */
function playChime() {
  try {
    if (!loadSettings().sound) return;
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const notes = [660, 880, 1180];
    notes.forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = f;
      o.type = "sine";
      o.connect(g);
      g.connect(ctx.destination);
      const start = ctx.currentTime + i * 0.09;
      g.gain.setValueAtTime(0.0001, start);
      g.gain.exponentialRampToValueAtTime(0.12, start + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, start + 0.28);
      o.start(start);
      o.stop(start + 0.3);
    });
    setTimeout(() => ctx.close(), 900);
  } catch {
    /* audio best-effort */
  }
}

export function ResultReveal({
  game,
  result,
  poserIndex,
  points,
  onValidate,
  onBack,
}: {
  game: Game;
  result: RoundResult;
  poserIndex: number;
  points: number[];
  onValidate: () => void;
  onBack: () => void;
}) {
  const players = game.players;
  const isRemiSec = result.kind === "remi-sec" || result.breakdown.some((b) => b.bonus > 0);
  const isContre = result.kind === "contre" || result.kind === "contre-egalite";
  const celebrate = result.kind === "remi-sec";

  const [flipDone, setFlipDone] = useState(!isContre);

  useEffect(() => {
    if (isContre) {
      const t = setTimeout(() => setFlipDone(true), 900);
      return () => clearTimeout(t);
    }
  }, [isContre]);

  useEffect(() => {
    if (celebrate) playChime();
  }, [celebrate]);

  // Ligne additive du pot : points de tous les joueurs (poseur en tête).
  const orderForSum = [poserIndex, ...players.map((_, i) => i).filter((i) => i !== poserIndex)];
  const sumParts = orderForSum.map((i) => points[i]);
  const sumString = sumParts.join(" + ") + " = " + result.roundTotal;

  const title = (() => {
    switch (result.kind) {
      case "remi-sec":
        return "RÉMI SEC !";
      case "contre":
      case "contre-egalite":
        return "CONTRE !";
      case "egalite":
        return "Égalité au plus bas";
      default:
        return "Manche remportée";
    }
  })();

  const headline = (() => {
    const w = result.winners.map((i) => players[i].name);
    switch (result.kind) {
      case "remi-sec":
        return `${players[poserIndex].name} pose à 0 !`;
      case "contre":
        return `${w[0]} avait moins que ${players[poserIndex].name} !`;
      case "contre-egalite":
        return `${w.join(" et ")} raflent la manche !`;
      case "egalite":
        return `${w.join(" et ")} à égalité — partage`;
      default:
        return `${players[poserIndex].name} rafle la manche`;
    }
  })();

  return (
    <div className="flex flex-col">
      <Confetti active={celebrate} />

      <div
        className={[
          "rounded-3xl p-5 text-center",
          isContre ? "bg-contre text-white" : "",
          celebrate ? "bg-gold text-felt-deep" : "",
          !isContre && !celebrate ? "panel" : "",
        ].join(" ")}
      >
        <div
          className={[
            "text-3xl font-display font-black",
            isContre ? "animate-flip-in" : "animate-pop-gold",
          ].join(" ")}
          style={isContre ? { animationIterationCount: 1 } : undefined}
        >
          {title}
        </div>
        <p className={`mt-1 text-base ${isContre ? "text-white/90" : celebrate ? "text-felt-deep/80" : "text-[color:var(--text-soft)]"}`}>
          {flipDone ? headline : "…"}
        </p>
      </div>

      {/* Détail du calcul — d'où vient chaque nombre */}
      <div className="mt-4 rounded-2xl panel p-4">
        <h3 className="mb-2 text-sm font-semibold text-[color:var(--text-soft)]">Le détail du calcul</h3>

        <div className="rounded-xl panel-soft p-3">
          <div className="text-xs text-[color:var(--text-soft)]">
            Pot de la manche (cartes isolées, brelans &amp; suites = 0)
          </div>
          <div className="mt-1 text-xl font-bold tnum">{sumString}</div>
        </div>

        <ul className="mt-3 flex flex-col gap-1.5 text-sm">
          {result.breakdown.map((b) => (
            <li key={b.index} className="flex items-center justify-between">
              <span className="font-medium">{players[b.index].name} rafle</span>
              <span className="tnum font-semibold">
                {result.winners.length > 1 && (
                  <span className="text-[color:var(--text-soft)]">
                    {result.roundTotal} ÷ {result.winners.length} →{" "}
                  </span>
                )}
                {b.base}
                {b.bonus > 0 && <span className="text-gold"> + {b.bonus} Rémi sec</span>}
                {" = "}
                <span className="text-gold">+{b.total}</span>
              </span>
            </li>
          ))}
          {result.poserPenalty !== 0 && (
            <li className="flex items-center justify-between">
              <span className="font-medium">{players[poserIndex].name} (coiffé)</span>
              <span className="tnum font-semibold text-contre">{result.poserPenalty}</span>
            </li>
          )}
        </ul>

        {result.winners.length > 1 && (
          <p className="mt-2 text-xs text-[color:var(--text-soft)]">
            Partage arrondi au supérieur pour chaque ex æquo.
          </p>
        )}
        {isRemiSec && (
          <p className="mt-2 text-xs text-gold">
            Bonus Rémi sec : 10 × {game.players.length} joueurs = {result.remiSecBonus} points.
          </p>
        )}
      </div>

      <div className="mt-5 flex gap-3">
        <button onClick={onBack} className="tap flex-1 rounded-2xl panel-soft py-3.5 font-semibold active:scale-[0.98] transition-transform">
          Corriger
        </button>
        <button
          onClick={onValidate}
          className="tap flex-[2] rounded-2xl bg-gold py-3.5 font-bold text-felt-deep shadow-glow active:scale-[0.98] transition-transform"
        >
          Valider la manche
        </button>
      </div>
    </div>
  );
}
