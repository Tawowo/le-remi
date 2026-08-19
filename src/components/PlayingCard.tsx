import React from "react";

export type Suit = "spades" | "hearts" | "diamonds" | "clubs";
export type Rank =
  | "A"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "J"
  | "Q"
  | "K";

const SUIT_GLYPH: Record<Suit, string> = {
  spades: "♠",
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
};

export function suitColor(suit: Suit): string {
  return suit === "hearts" || suit === "diamonds" ? "#b3271e" : "#1c2230";
}

export interface PlayingCardProps {
  rank: Rank;
  suit: Suit;
  /** Largeur en px (le ratio 5:7 est conservé). */
  width?: number;
  /** Carte face cachée (dos). */
  faceDown?: boolean;
  className?: string;
  style?: React.CSSProperties;
  /** Estompée (ex. carte « interdite »). */
  dim?: boolean;
}

/**
 * Carte à jouer en SVG maison — aucune image externe.
 * Coins arrondis ivoire, index dans les coins, grand symbole central.
 */
export function PlayingCard({
  rank,
  suit,
  width = 72,
  faceDown = false,
  className = "",
  style,
  dim = false,
}: PlayingCardProps) {
  const height = Math.round((width * 7) / 5);
  const color = suitColor(suit);
  const glyph = SUIT_GLYPH[suit];

  return (
    <svg
      viewBox="0 0 100 140"
      width={width}
      height={height}
      role="img"
      aria-label={faceDown ? "carte face cachée" : `${rank} de ${suitLabel(suit)}`}
      className={`select-none ${dim ? "opacity-45 grayscale" : ""} ${className}`}
      style={style}
    >
      <defs>
        <linearGradient id="cardFace" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fffdf7" />
          <stop offset="100%" stopColor="#f2ebd8" />
        </linearGradient>
        <linearGradient id="cardBack" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#14402f" />
          <stop offset="100%" stopColor="#0a241a" />
        </linearGradient>
      </defs>

      <rect
        x="1.5"
        y="1.5"
        width="97"
        height="137"
        rx="12"
        ry="12"
        fill={faceDown ? "url(#cardBack)" : "url(#cardFace)"}
        stroke={faceDown ? "#0a2019" : "#d8cfba"}
        strokeWidth="2"
      />

      {faceDown ? (
        <g>
          <rect x="10" y="10" width="80" height="120" rx="8" fill="none" stroke="#d4af37" strokeWidth="1.5" opacity="0.7" />
          <g fill="#d4af37" opacity="0.55">
            {Array.from({ length: 6 }).map((_, r) =>
              Array.from({ length: 4 }).map((_, c) => (
                <circle key={`${r}-${c}`} cx={20 + c * 20} cy={22 + r * 20} r="2.4" />
              )),
            )}
          </g>
        </g>
      ) : (
        <g fill={color}>
          {/* Coin haut-gauche */}
          <text x="11" y="26" fontSize="20" fontWeight="700" textAnchor="middle" fontFamily="Georgia, serif">
            {rank}
          </text>
          <text x="11" y="42" fontSize="16" textAnchor="middle">
            {glyph}
          </text>
          {/* Coin bas-droite (renversé) */}
          <g transform="rotate(180 89 114)">
            <text x="89" y="114" fontSize="20" fontWeight="700" textAnchor="middle" fontFamily="Georgia, serif">
              {rank}
            </text>
            <text x="89" y="130" fontSize="16" textAnchor="middle">
              {glyph}
            </text>
          </g>
          {/* Grand symbole central */}
          <text x="50" y="86" fontSize="54" textAnchor="middle">
            {isFace(rank) ? rank : glyph}
          </text>
        </g>
      )}
    </svg>
  );
}

function isFace(rank: Rank): boolean {
  return rank === "J" || rank === "Q" || rank === "K";
}

function suitLabel(suit: Suit): string {
  return { spades: "pique", hearts: "cœur", diamonds: "carreau", clubs: "trèfle" }[suit];
}
