import React from "react";

export type Suit = "spades" | "hearts" | "diamonds" | "clubs";
export type Rank =
  | "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";

const SUIT_GLYPH: Record<Suit, string> = {
  spades: "♠",
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
};

function isRed(suit: Suit): boolean {
  return suit === "hearts" || suit === "diamonds";
}

/** Couleur d'un signe selon le jeu de cartes (rouge/noir toujours différenciables). */
export function suitColor(suit: Suit, deck = "deck-classique"): string {
  switch (deck) {
    case "deck-neon":
      return isRed(suit) ? "#ff5e7a" : "#7fe6ff";
    case "deck-celeste":
      return isRed(suit) ? "#ff9bb0" : "#e6ecff";
    default:
      return isRed(suit) ? "#b3271e" : "#1c2230";
  }
}

interface DeckStyle {
  faceFrom: string;
  faceTo: string;
  serif: boolean;
  /** Cadre intérieur (couleur) ou null. */
  frame: string | null;
  /** Fond sombre → contours clairs. */
  dark: boolean;
  /** Lueur (néon). */
  glow: boolean;
}

function deckStyle(deck: string): DeckStyle {
  switch (deck) {
    case "deck-artdeco":
      return { faceFrom: "#fffdf7", faceTo: "#f2ead2", serif: true, frame: "#c8a13a", dark: false, glow: false };
    case "deck-minimal":
      return { faceFrom: "#ffffff", faceTo: "#f4f4f4", serif: false, frame: null, dark: false, glow: false };
    case "deck-neon":
      return { faceFrom: "#16161f", faceTo: "#0e0e16", serif: false, frame: "#2a2a3a", dark: true, glow: true };
    case "deck-royaume":
      return { faceFrom: "#f3ead2", faceTo: "#e4d3aa", serif: true, frame: "#8a6d2f", dark: false, glow: false };
    case "deck-celeste":
      return { faceFrom: "#161a4a", faceTo: "#0d1030", serif: true, frame: "#3a4090", dark: true, glow: false };
    default:
      return { faceFrom: "#fffdf7", faceTo: "#f2ebd8", serif: true, frame: null, dark: false, glow: false };
  }
}

export interface PlayingCardProps {
  rank: Rank;
  suit: Suit;
  width?: number;
  faceDown?: boolean;
  className?: string;
  style?: React.CSSProperties;
  dim?: boolean;
  /** Jeu de cartes (design des faces). */
  deck?: string;
  /** Dos de cartes. */
  backId?: string;
}

export function PlayingCard({
  rank,
  suit,
  width = 72,
  faceDown = false,
  className = "",
  style,
  dim = false,
  deck = "deck-classique",
  backId = "back-classique",
}: PlayingCardProps) {
  const height = Math.round((width * 7) / 5);
  const glyph = SUIT_GLYPH[suit];
  const ds = deckStyle(deck);
  const color = suitColor(suit, deck);
  const uid = `${deck}-${backId}`;

  const faceId = `face-${uid}`;
  const centerFace = isFace(rank);
  const serifFont = ds.serif ? "Georgia, serif" : "Inter, system-ui, sans-serif";
  const glowStyle = ds.glow ? { filter: `drop-shadow(0 0 3px ${color})` } : undefined;

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
        <linearGradient id={faceId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={ds.faceFrom} />
          <stop offset="100%" stopColor={ds.faceTo} />
        </linearGradient>
      </defs>

      <rect
        x="1.5"
        y="1.5"
        width="97"
        height="137"
        rx="12"
        ry="12"
        fill={faceDown ? "#0a2019" : `url(#${faceId})`}
        stroke={faceDown ? "#0a2019" : ds.dark ? "#2a2a3a" : "#d8cfba"}
        strokeWidth="2"
      />

      {faceDown ? (
        renderBack(backId)
      ) : (
        <g fill={color} style={glowStyle}>
          {ds.frame && (
            <rect x="7" y="7" width="86" height="126" rx="8" fill="none" stroke={ds.frame} strokeWidth="1.6" opacity="0.9" />
          )}
          {/* index coins */}
          <text x="12" y="27" fontSize={deck === "deck-minimal" ? 24 : 20} fontWeight="700" textAnchor="middle" fontFamily={serifFont}>
            {rank}
          </text>
          <text x="12" y="43" fontSize="15" textAnchor="middle">
            {glyph}
          </text>
          <g transform="rotate(180 88 113)">
            <text x="88" y="113" fontSize={deck === "deck-minimal" ? 24 : 20} fontWeight="700" textAnchor="middle" fontFamily={serifFont}>
              {rank}
            </text>
            <text x="88" y="129" fontSize="15" textAnchor="middle">
              {glyph}
            </text>
          </g>

          {/* centre */}
          {deck === "deck-minimal" ? (
            <text x="50" y="88" fontSize="46" fontWeight="800" textAnchor="middle" fontFamily={serifFont}>
              {centerFace ? rank : glyph}
            </text>
          ) : centerFace ? (
            <FaceCenter deck={deck} rank={rank} color={color} />
          ) : (
            <text x="50" y="86" fontSize="52" textAnchor="middle">
              {glyph}
            </text>
          )}
        </g>
      )}
    </svg>
  );
}

/** Centre des figures (V/D/R) — stylisé selon le jeu, toujours lisible. */
function FaceCenter({ deck, rank, color }: { deck: string; rank: Rank; color: string }) {
  const serif = "Georgia, serif";
  return (
    <g>
      {deck === "deck-royaume" && (
        <path d="M35 52 L42 44 L50 52 L58 44 L65 52 L62 72 L38 72 Z" fill="none" stroke={color} strokeWidth="1.6" opacity="0.8" />
      )}
      {deck === "deck-celeste" &&
        [
          [34, 56], [66, 52], [50, 40], [40, 78], [62, 76],
        ].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.6" fill={color} />)}
      {deck === "deck-artdeco" && (
        <g stroke={color} strokeWidth="1.2" fill="none" opacity="0.7">
          <path d="M50 44 L62 60 L50 76 L38 60 Z" />
        </g>
      )}
      <text x="50" y="82" fontSize="44" fontWeight="800" textAnchor="middle" fontFamily={serif}>
        {rank}
      </text>
    </g>
  );
}

/** Dos de cartes (12 motifs). */
function renderBack(backId: string): React.ReactNode {
  const gold = "#d4af37";
  switch (backId) {
    case "back-bordeaux":
      return (
        <g>
          <rect x="8" y="8" width="84" height="124" rx="8" fill="#5a1622" />
          <rect x="8" y="8" width="84" height="124" rx="8" fill="none" stroke={gold} strokeWidth="1.2" opacity="0.6" />
          <g stroke="#e0b0b8" strokeWidth="0.8" opacity="0.5">
            {tile((x, y) => <path key={`${x}-${y}`} d={`M${x} ${y - 6} L${x + 6} ${y} L${x} ${y + 6} L${x - 6} ${y} Z`} />)}
          </g>
        </g>
      );
    case "back-artdeco":
      return (
        <g>
          <rect x="8" y="8" width="84" height="124" rx="8" fill="#0f2e24" />
          <g stroke={gold} strokeWidth="1" fill="none" opacity="0.8">
            <path d="M50 16 L84 68 L50 124 L16 68 Z" />
            <path d="M50 34 L70 68 L50 106 L30 68 Z" />
            <line x1="50" y1="16" x2="50" y2="124" />
          </g>
        </g>
      );
    case "back-royal":
      return (
        <g>
          <rect x="8" y="8" width="84" height="124" rx="8" fill="#132a6b" />
          <rect x="8" y="8" width="84" height="124" rx="8" fill="none" stroke={gold} strokeWidth="1.4" />
          <text x="50" y="82" fontSize="46" textAnchor="middle" fill={gold} opacity="0.85" fontFamily="Georgia, serif">♛</text>
        </g>
      );
    case "back-seigaiha":
      return (
        <g>
          <rect x="8" y="8" width="84" height="124" rx="8" fill="#123a52" />
          <g stroke="#8fd3e8" strokeWidth="0.7" fill="none" opacity="0.6">
            {[30, 55, 80, 105].map((y) =>
              [20, 40, 60, 80].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="10" />),
            )}
          </g>
        </g>
      );
    case "back-foret":
      return (
        <g>
          <rect x="8" y="8" width="84" height="124" rx="8" fill="#0c2416" />
          <g fill="#a8e063" opacity="0.8">
            {tile((x, y, i) => <circle key={i} cx={x} cy={y} r="1.4" />)}
          </g>
        </g>
      );
    case "back-nebuleuse":
      return (
        <g>
          <rect x="8" y="8" width="84" height="124" rx="8" fill="#160c2e" />
          <ellipse cx="42" cy="55" rx="26" ry="18" fill="#7a40dc" opacity="0.5" />
          <ellipse cx="60" cy="85" rx="24" ry="16" fill="#4078dc" opacity="0.45" />
          <g fill="#fff" opacity="0.8">{tile((x, y, i) => <circle key={i} cx={x} cy={y} r="0.9" />)}</g>
        </g>
      );
    case "back-etoiles":
      return (
        <g>
          <rect x="8" y="8" width="84" height="124" rx="8" fill="#0d1030" />
          <g fill={gold} opacity="0.8">{tile((x, y, i) => <circle key={i} cx={x} cy={y} r="1.1" />)}</g>
        </g>
      );
    case "back-neon":
      return (
        <g>
          <rect x="8" y="8" width="84" height="124" rx="8" fill="#0a0a1e" />
          <g stroke="#22d3ee" strokeWidth="1" fill="none" opacity="0.8">
            <path d="M16 124 L50 16 L84 124" />
            <path d="M28 124 L50 46 L72 124" />
            <line x1="16" y1="96" x2="84" y2="96" />
          </g>
        </g>
      );
    case "back-circuit":
      return (
        <g>
          <rect x="8" y="8" width="84" height="124" rx="8" fill="#06251f" />
          <g stroke="#22d3ee" strokeWidth="1" fill="none" opacity="0.7">
            <path d="M18 20 H50 V50 H80" />
            <path d="M82 34 V70 H55 V110" />
            <circle cx="50" cy="50" r="2.5" fill="#22d3ee" />
            <circle cx="80" cy="70" r="2.5" fill="#22d3ee" />
          </g>
        </g>
      );
    case "back-dragon":
      return (
        <g>
          <rect x="8" y="8" width="84" height="124" rx="8" fill="#2a0d0d" />
          <path d="M24 100 q20 -20 34 -6 q6 -24 22 -18 q-3 -14 12 -18 q0 14 12 12 q-14 6 -12 22 q16 8 8 26 q-20 -14 -34 -2 q-14 -14 -30 12z" fill="none" stroke="#e0524d" strokeWidth="1.2" opacity="0.7" />
        </g>
      );
    case "back-or":
      return (
        <g>
          <rect x="8" y="8" width="84" height="124" rx="8" fill="#3a2e0a" />
          <rect x="8" y="8" width="84" height="124" rx="8" fill="none" stroke={gold} strokeWidth="2" />
          <text x="50" y="84" fontSize="44" textAnchor="middle" fill={gold} fontFamily="Georgia, serif">🂠</text>
        </g>
      );
    default: // back-classique
      return (
        <g>
          <rect x="10" y="10" width="80" height="120" rx="8" fill="none" stroke={gold} strokeWidth="1.5" opacity="0.7" />
          <g fill={gold} opacity="0.55">{tile((x, y, i) => <circle key={i} cx={x} cy={y} r="2.4" />)}</g>
        </g>
      );
  }
}

/** Grille de points/motifs répétés dans la zone du dos. */
function tile(fn: (x: number, y: number, i: number) => React.ReactNode): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let i = 0;
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 4; c++) {
      out.push(fn(22 + c * 18, 24 + r * 18, i++));
    }
  }
  return out;
}

function isFace(rank: Rank): boolean {
  return rank === "J" || rank === "Q" || rank === "K";
}
function suitLabel(suit: Suit): string {
  return { spades: "pique", hearts: "cœur", diamonds: "carreau", clubs: "trèfle" }[suit];
}
