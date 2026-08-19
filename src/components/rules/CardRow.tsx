"use client";

import { PlayingCard, type Rank, type Suit } from "@/components/PlayingCard";

export interface CardSpec {
  rank: Rank;
  suit: Suit;
  dim?: boolean;
}

/** Rangée de cartes avec entrée « deal-in » décalée. */
export function CardRow({
  cards,
  width = 58,
  overlap = 18,
  animate = true,
}: {
  cards: CardSpec[];
  width?: number;
  overlap?: number;
  animate?: boolean;
}) {
  return (
    <div className="flex items-center" style={{ paddingLeft: overlap }}>
      {cards.map((c, i) => (
        <div
          key={i}
          className={animate ? "animate-deal-in" : ""}
          style={{ marginLeft: -overlap, animationDelay: `${i * 110}ms`, zIndex: i }}
        >
          <PlayingCard rank={c.rank} suit={c.suit} width={width} dim={c.dim} className="drop-shadow-lg" />
        </div>
      ))}
    </div>
  );
}
