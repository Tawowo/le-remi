"use client";

import { useMemo, useState } from "react";
import { WHEEL_SEGMENTS } from "@/lib/economy/config";
import { spinWheel } from "@/lib/economy/progression";
import type { WheelSegment } from "@/lib/economy/config";

/**
 * Roue à secteurs PROPORTIONNELS aux probabilités (équité visible). Le tirage
 * utilise le RNG honnête `spinWheel` ; l'aiguille s'arrête réellement dessus.
 */
export function Wheel({
  canSpin,
  onResult,
}: {
  canSpin: boolean;
  onResult: (seg: WheelSegment) => void;
}) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);

  // Secteurs : angles cumulés (départ 12 h, sens horaire).
  const wedges = useMemo(() => {
    const total = WHEEL_SEGMENTS.reduce((s, x) => s + x.weight, 0);
    let acc = 0;
    return WHEEL_SEGMENTS.map((seg) => {
      const start = (acc / total) * 360;
      acc += seg.weight;
      const end = (acc / total) * 360;
      return { seg, start, end, mid: (start + end) / 2 };
    });
  }, []);

  const gradient = useMemo(() => {
    const stops = wedges.map((w) => `${w.seg.color} ${w.start}deg ${w.end}deg`).join(", ");
    return `conic-gradient(${stops})`;
  }, [wedges]);

  const spin = () => {
    if (spinning || !canSpin) return;
    setSpinning(true);
    const seg = spinWheel(Math.random());
    const w = wedges.find((x) => x.seg.id === seg.id)!;
    const wedgeSpan = w.end - w.start;
    const jitter = (Math.random() - 0.5) * wedgeSpan * 0.6;
    // amener le milieu du secteur sous l'aiguille (en haut) + plusieurs tours
    const target = 360 * 6 - w.mid + jitter;
    // repartir de la position normalisée courante pour toujours tourner en avant
    setRotation((prev) => prev - (prev % 360) + target);
    window.setTimeout(() => {
      setSpinning(false);
      onResult(seg);
    }, 4200);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: 260, height: 260 }}>
        {/* aiguille */}
        <div
          className="absolute left-1/2 top-[-6px] z-10 -translate-x-1/2"
          style={{ width: 0, height: 0, borderLeft: "12px solid transparent", borderRight: "12px solid transparent", borderTop: "22px solid #f6f1e3" }}
        />
        <div
          className="h-full w-full rounded-full border-4 border-ivory shadow-card"
          style={{
            background: gradient,
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? "transform 4.1s cubic-bezier(0.15,0.85,0.2,1)" : "none",
          }}
        />
        {/* moyeu */}
        <div className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-felt-deep text-2xl shadow-card ring-2 ring-ivory">
          🂠
        </div>
      </div>

      <button
        onClick={spin}
        disabled={!canSpin || spinning}
        className="mt-5 tap w-full rounded-2xl bg-gold py-3.5 text-lg font-bold text-felt-deep shadow-glow disabled:opacity-40 active:scale-[0.98] transition-transform"
      >
        {spinning ? "La roue tourne…" : canSpin ? "Tourner la roue" : "Revenez demain"}
      </button>
    </div>
  );
}
