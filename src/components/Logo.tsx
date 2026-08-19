"use client";

import { PlayingCard, type Rank, type Suit } from "./PlayingCard";

// Cartes du logo : un petit éventail qui s'ouvre à l'arrivée.
const CARDS: { rank: Rank; suit: Suit; rot: number; x: number; y: number }[] = [
  { rank: "A", suit: "spades", rot: -28, x: -78, y: 20 },
  { rank: "K", suit: "hearts", rot: -14, x: -40, y: 6 },
  { rank: "Q", suit: "clubs", rot: 0, x: 0, y: 0 },
  { rank: "J", suit: "diamonds", rot: 14, x: 40, y: 6 },
  { rank: "10", suit: "spades", rot: 28, x: 78, y: 20 },
];

/** Logo animé : les cartes s'éventaillent à l'ouverture. */
export function Logo({ size = 84 }: { size?: number }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-32 w-full flex items-end justify-center" aria-hidden>
        {CARDS.map((c, i) => (
          <div
            key={i}
            className="absolute bottom-0 animate-fan-out"
            style={{
              ["--fan-transform" as string]: `translateX(${c.x}px) translateY(${c.y}px) rotate(${c.rot}deg)`,
              transform: `translateX(${c.x}px) translateY(${c.y}px) rotate(${c.rot}deg)`,
              animationDelay: `${i * 90}ms`,
              zIndex: i,
            }}
          >
            <PlayingCard rank={c.rank} suit={c.suit} width={size} className="drop-shadow-xl" />
          </div>
        ))}
      </div>
      <h1 className="mt-4 text-5xl font-display font-black tracking-tight">
        <span className="gold-shimmer">LE RÉMI</span>
      </h1>
      <p className="mt-1 text-sm text-[color:var(--text-soft)] tracking-wide">
        Compteur de score intelligent
      </p>
    </div>
  );
}
