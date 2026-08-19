"use client";

import { useState } from "react";

/**
 * Pavé 0→10 pour les points du poseur (tap unique).
 * Le 0 affiche « RÉMI SEC ! » en doré.
 */
export function TenKeypad({
  value,
  onSelect,
}: {
  value: number | null;
  onSelect: (v: number) => void;
}) {
  const keys = Array.from({ length: 11 }, (_, i) => i); // 0..10
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {keys.map((k) => {
        const selected = value === k;
        const isRemi = k === 0;
        return (
          <button
            key={k}
            type="button"
            onClick={() => onSelect(k)}
            className={[
              "tap rounded-2xl text-2xl font-bold tnum transition-transform active:scale-95",
              "flex items-center justify-center h-16 border",
              selected
                ? isRemi
                  ? "bg-gold text-felt-deep border-gold shadow-glow"
                  : "bg-gold text-felt-deep border-gold"
                : "panel hover:border-gold/60",
              isRemi && !selected ? "text-gold border-gold/50" : "",
              k === 10 ? "col-span-3" : "",
            ].join(" ")}
          >
            {isRemi ? (
              <span className="flex flex-col leading-none">
                <span className="text-3xl">0</span>
                <span className="text-[0.65rem] tracking-widest mt-0.5">RÉMI SEC !</span>
              </span>
            ) : (
              k
            )}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Pavé numérique « constructeur » pour les adversaires (0 → 99+).
 * Grand affichage, chiffres géants, effacement.
 */
export function DigitKeypad({
  value,
  onChange,
  max = 200,
}: {
  value: number;
  onChange: (v: number) => void;
  max?: number;
}) {
  const [raw, setRaw] = useState<string>(value ? String(value) : "");

  const push = (digit: string) => {
    const next = (raw === "0" ? "" : raw) + digit;
    const num = Number(next);
    if (num > max) return;
    setRaw(next);
    onChange(num);
  };
  const back = () => {
    const next = raw.slice(0, -1);
    setRaw(next);
    onChange(next ? Number(next) : 0);
  };
  const clear = () => {
    setRaw("");
    onChange(0);
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-center">
        <span className="text-5xl font-bold tnum text-gold">{raw === "" ? 0 : raw}</span>
        <span className="ml-2 text-sm text-[color:var(--text-soft)]">pts</span>
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => push(d)}
            className="tap h-14 rounded-2xl panel text-2xl font-bold tnum active:scale-95 transition-transform hover:border-gold/60 border"
          >
            {d}
          </button>
        ))}
        <button
          type="button"
          onClick={clear}
          className="tap h-14 rounded-2xl panel-soft text-base font-semibold active:scale-95 transition-transform border"
          aria-label="Effacer"
        >
          C
        </button>
        <button
          type="button"
          onClick={() => push("0")}
          className="tap h-14 rounded-2xl panel text-2xl font-bold tnum active:scale-95 transition-transform hover:border-gold/60 border"
        >
          0
        </button>
        <button
          type="button"
          onClick={back}
          className="tap h-14 rounded-2xl panel-soft text-xl active:scale-95 transition-transform border"
          aria-label="Retour arrière"
        >
          ⌫
        </button>
      </div>
    </div>
  );
}
