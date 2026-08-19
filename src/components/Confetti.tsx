"use client";

import { useEffect, useState } from "react";

interface Piece {
  left: number;
  delay: number;
  duration: number;
  rotate: number;
  color: string;
  size: number;
  drift: number;
}

const COLORS = ["#d4af37", "#f4d670", "#e0524d", "#4aa8d8", "#5cba7d", "#ffffff"];

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Confettis légers (transform/opacity uniquement). Respecte reduced-motion.
 * `active` déclenche une salve ; `count` = nombre de pièces.
 */
export function Confetti({ active, count = 90 }: { active: boolean; count?: number }) {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    if (!active || prefersReducedMotion()) {
      setPieces([]);
      return;
    }
    const next: Piece[] = Array.from({ length: count }).map(() => ({
      left: Math.random() * 100,
      delay: Math.random() * 0.4,
      duration: 1.6 + Math.random() * 1.4,
      rotate: Math.random() * 360,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 7 + Math.random() * 8,
      drift: (Math.random() - 0.5) * 120,
    }));
    setPieces(next);
    const t = setTimeout(() => setPieces([]), 3400);
    return () => clearTimeout(t);
  }, [active, count]);

  if (pieces.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden>
      {pieces.map((p, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            top: "-5%",
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.6,
            background: p.color,
            borderRadius: 2,
            transform: `rotate(${p.rotate}deg)`,
            animation: `confetti-fall ${p.duration}s cubic-bezier(0.3,0.6,0.4,1) ${p.delay}s forwards`,
            ["--drift" as string]: `${p.drift}px`,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(108vh) translateX(var(--drift)) rotate(720deg); opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}
