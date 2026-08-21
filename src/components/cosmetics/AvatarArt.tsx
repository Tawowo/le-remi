"use client";

import React from "react";

/**
 * Portraits d'avatars en SVG vectoriel généré (aucun asset externe, net à
 * toute taille). Style flat illustré : dégradés + silhouettes caractérisées
 * par série. Chaque id a sa propre combinaison (couleurs + accessoire).
 */

type Spec =
  | { kind: "person"; bg: [string, string]; skin: string; hair: string; accent: string; acc: Acc }
  | { kind: "animal"; bg: [string, string]; fur: string; ear: Ear; accent: string; acc: Acc }
  | { kind: "orb"; bg: [string, string]; c1: string; c2: string; ring?: boolean; comet?: boolean }
  | { kind: "emblem"; bg: [string, string]; color: string; glyph: string; crown?: boolean };

type Acc = "none" | "hat" | "glasses" | "goldglasses" | "mustache" | "monocle" | "scarf" | "hood" | "bandana" | "visor";
type Ear = "fox" | "round" | "cat" | "panda" | "beak" | "mane";

const SPECS: Record<string, Spec> = {
  // Joueurs
  "av-chapeau": { kind: "person", bg: ["#3a2a5a", "#1a1030"], skin: "#e8b894", hair: "#3a2418", accent: "#d4af37", acc: "hat" },
  "av-briscard": { kind: "person", bg: ["#3a3320", "#181405"], skin: "#d9a877", hair: "#c9c2b6", accent: "#8a6d2f", acc: "mustache" },
  "av-stratege": { kind: "person", bg: ["#123a52", "#06141f"], skin: "#e8c0a0", hair: "#241a12", accent: "#d4af37", acc: "goldglasses" },
  "av-dandy": { kind: "person", bg: ["#2a1030", "#12061a"], skin: "#e0b090", hair: "#1a1410", accent: "#e0524d", acc: "scarf" },
  "av-gitane": { kind: "person", bg: ["#5a1030", "#1a0610"], skin: "#d99f70", hair: "#2a0f18", accent: "#f4d670", acc: "bandana" },
  "av-capitaine": { kind: "person", bg: ["#0a3550", "#04141f"], skin: "#dca77a", hair: "#2a2018", accent: "#e8e2d0", acc: "hat" },
  // Animaux
  "av-renard": { kind: "animal", bg: ["#5a2e10", "#1f0f04"], fur: "#e0742a", ear: "fox", accent: "#1c2230", acc: "scarf" },
  "av-chouette": { kind: "animal", bg: ["#2a2a3a", "#101018"], fur: "#8a6d4a", ear: "round", accent: "#d4af37", acc: "monocle" },
  "av-chat": { kind: "animal", bg: ["#3a3550", "#161425"], fur: "#5a5a66", ear: "cat", accent: "#e8934a", acc: "none" },
  "av-panda": { kind: "animal", bg: ["#2a3a2a", "#0f180f"], fur: "#f0f0f0", ear: "panda", accent: "#1c2230", acc: "none" },
  "av-corbeau": { kind: "animal", bg: ["#1a1a24", "#08080c"], fur: "#20202a", ear: "beak", accent: "#d4af37", acc: "none" },
  "av-lionne": { kind: "animal", bg: ["#4a3510", "#1a1205"], fur: "#d9a35a", ear: "mane", accent: "#d4af37", acc: "none" },
  // Cosmos
  "av-astronaute": { kind: "person", bg: ["#0a1030", "#04060f"], skin: "#e8c0a0", hair: "#111", accent: "#8fd3e8", acc: "visor" },
  "av-comete": { kind: "orb", bg: ["#0a1030", "#04060f"], c1: "#f4d670", c2: "#e0524d", comet: true },
  "av-constellation": { kind: "emblem", bg: ["#0d1030", "#04060f"], color: "#d4af37", glyph: "✦" },
  "av-lune": { kind: "orb", bg: ["#101430", "#05060f"], c1: "#dfe6ff", c2: "#8a90b5" },
  "av-soleil": { kind: "orb", bg: ["#2a1a05", "#0f0a02"], c1: "#ffd24a", c2: "#ff7a18", ring: true },
  "av-trounoir": { kind: "orb", bg: ["#05050a", "#000"], c1: "#b57edc", c2: "#111", ring: true },
  // Légendes
  "av-roicoeur": { kind: "emblem", bg: ["#5a1020", "#1a060c"], color: "#e0524d", glyph: "♥", crown: true },
  "av-damepique": { kind: "emblem", bg: ["#1a1a2a", "#0a0a12"], color: "#e6ecff", glyph: "♠", crown: true },
  "av-joker": { kind: "emblem", bg: ["#2a1030", "#12061a"], color: "#5cba7d", glyph: "🃏" },
  "av-chevalier": { kind: "emblem", bg: ["#2a3040", "#10141c"], color: "#c0c8d8", glyph: "⚔" },
  "av-alchimiste": { kind: "emblem", bg: ["#141a24", "#070a10"], color: "#7fe3c0", glyph: "⚗" },
  "av-pirate": { kind: "emblem", bg: ["#1a1410", "#0a0806"], color: "#e8e2d0", glyph: "☠" },
  // Néon
  "av-cyber1": { kind: "person", bg: ["#1a0b2e", "#0a0416"], skin: "#e0b090", hair: "#22d3ee", accent: "#e0447f", acc: "visor" },
  "av-cyber2": { kind: "person", bg: ["#0a1a2e", "#04060f"], skin: "#d9a877", hair: "#e0447f", accent: "#22d3ee", acc: "glasses" },
  "av-cyber3": { kind: "orb", bg: ["#0a1a2e", "#04060f"], c1: "#22d3ee", c2: "#b57edc", ring: true },
  "av-cyber4": { kind: "person", bg: ["#2a0b2e", "#12061a"], skin: "#e8c0a0", hair: "#ff7a18", accent: "#22d3ee", acc: "none" },
  "av-cyber5": { kind: "emblem", bg: ["#0a0a1e", "#050510"], color: "#22d3ee", glyph: "⚡" },
  "av-cyber6": { kind: "orb", bg: ["#1a0b2e", "#0a0416"], c1: "#e0447f", c2: "#22d3ee" },
  // Mystiques
  "av-kitsune": { kind: "animal", bg: ["#3a1020", "#160610"], fur: "#f0e6d8", ear: "fox", accent: "#e0524d", acc: "none" },
  "av-esprit": { kind: "orb", bg: ["#0c2416", "#05130c"], c1: "#a8e063", c2: "#3ecf8e" },
  "av-phenix": { kind: "emblem", bg: ["#3a1005", "#160602"], color: "#ff7a18", glyph: "🔥", crown: true },
  "av-golem": { kind: "emblem", bg: ["#2a2420", "#12100c"], color: "#a3937a", glyph: "⬡" },
  "av-ondine": { kind: "orb", bg: ["#0a3550", "#04141f"], c1: "#8fd3e8", c2: "#4aa8d8" },
  "av-sorciere": { kind: "person", bg: ["#1a0b2e", "#0a0416"], skin: "#d9c0d0", hair: "#2a0f28", accent: "#b57edc", acc: "hood" },
};

export function AvatarArt({ id, size = 96 }: { id: string; size?: number }) {
  const spec = SPECS[id];
  const gid = `avbg-${id}`;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className="block" role="img" aria-label="avatar">
      <defs>
        <radialGradient id={gid} cx="50%" cy="38%" r="75%">
          <stop offset="0%" stopColor={spec ? spec.bg[0] : "#334"} />
          <stop offset="100%" stopColor={spec ? spec.bg[1] : "#112"} />
        </radialGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#${gid})`} />
      {spec ? renderSpec(spec) : <text x="50" y="66" fontSize="46" textAnchor="middle">🙂</text>}
    </svg>
  );
}

function renderSpec(s: Spec): React.ReactNode {
  switch (s.kind) {
    case "person":
      return <Person s={s} />;
    case "animal":
      return <Animal s={s} />;
    case "orb":
      return <Orb s={s} />;
    case "emblem":
      return <Emblem s={s} />;
  }
}

function Person({ s }: { s: Extract<Spec, { kind: "person" }> }) {
  return (
    <g>
      {/* épaules */}
      <path d="M18 100 Q50 70 82 100 Z" fill={s.accent} opacity="0.9" />
      {/* cou + tête */}
      <rect x="45" y="58" width="10" height="12" fill={s.skin} />
      <circle cx="50" cy="46" r="20" fill={s.skin} />
      {/* cheveux */}
      {s.acc !== "visor" && <path d="M30 44 Q30 22 50 22 Q70 22 70 44 Q62 32 50 32 Q38 32 30 44Z" fill={s.hair} />}
      {/* yeux */}
      <circle cx="43" cy="46" r="2" fill="#1c2230" />
      <circle cx="57" cy="46" r="2" fill="#1c2230" />
      {s.acc === "mustache" && <path d="M42 54 Q50 60 58 54" stroke={s.hair} strokeWidth="3" fill="none" strokeLinecap="round" />}
      {s.acc === "glasses" && (
        <g stroke={s.accent} strokeWidth="1.5" fill="none">
          <circle cx="43" cy="46" r="5" /><circle cx="57" cy="46" r="5" /><line x1="48" y1="46" x2="52" y2="46" />
        </g>
      )}
      {s.acc === "goldglasses" && (
        <g stroke="#d4af37" strokeWidth="2" fill="none">
          <rect x="37" y="42" width="10" height="8" rx="2" /><rect x="53" y="42" width="10" height="8" rx="2" /><line x1="47" y1="46" x2="53" y2="46" />
        </g>
      )}
      {s.acc === "monocle" && <circle cx="57" cy="46" r="6" stroke="#d4af37" strokeWidth="2" fill="none" />}
      {s.acc === "hat" && <path d="M26 30 H74 L68 20 H32 Z" fill={s.accent} />}
      {s.acc === "bandana" && <path d="M30 34 Q50 26 70 34 L70 40 Q50 34 30 40 Z" fill={s.accent} />}
      {s.acc === "hood" && <path d="M26 48 Q26 18 50 18 Q74 18 74 48 Q60 38 50 38 Q40 38 26 48Z" fill={s.accent} opacity="0.85" />}
      {s.acc === "scarf" && <path d="M36 66 Q50 74 64 66 L64 74 Q50 80 36 74Z" fill={s.accent} />}
      {s.acc === "visor" && (
        <g>
          <circle cx="50" cy="46" r="22" fill="none" stroke="#c0c8d8" strokeWidth="3" />
          <path d="M34 44 Q50 34 66 44 Q50 52 34 44Z" fill={s.accent} opacity="0.85" />
        </g>
      )}
    </g>
  );
}

function Animal({ s }: { s: Extract<Spec, { kind: "animal" }> }) {
  return (
    <g>
      {/* oreilles */}
      {s.ear === "fox" && (
        <g fill={s.fur}>
          <path d="M28 40 L24 18 L44 32 Z" /><path d="M72 40 L76 18 L56 32 Z" />
        </g>
      )}
      {s.ear === "cat" && (
        <g fill={s.fur}>
          <path d="M30 38 L26 20 L46 32 Z" /><path d="M70 38 L74 20 L54 32 Z" />
        </g>
      )}
      {s.ear === "round" && (
        <g fill={s.fur}>
          <circle cx="32" cy="30" r="10" /><circle cx="68" cy="30" r="10" />
        </g>
      )}
      {s.ear === "panda" && (
        <g fill="#1c2230">
          <circle cx="32" cy="30" r="9" /><circle cx="68" cy="30" r="9" />
        </g>
      )}
      {s.ear === "mane" && <circle cx="50" cy="52" r="34" fill={s.accent} opacity="0.5" />}
      {s.ear === "beak" && null}
      {/* tête */}
      <circle cx="50" cy="52" r="26" fill={s.fur} />
      {/* museau clair */}
      {s.ear !== "beak" && <ellipse cx="50" cy="60" rx="14" ry="12" fill="#fff" opacity="0.25" />}
      {/* yeux */}
      {s.ear === "panda" ? (
        <g fill="#1c2230">
          <ellipse cx="42" cy="50" rx="6" ry="8" /><ellipse cx="58" cy="50" rx="6" ry="8" />
        </g>
      ) : (
        <g fill="#1c2230">
          <circle cx="42" cy="50" r="3" /><circle cx="58" cy="50" r="3" />
        </g>
      )}
      {/* museau / bec */}
      {s.ear === "beak" ? (
        <path d="M44 56 L50 70 L56 56 Z" fill={s.accent} />
      ) : (
        <path d="M46 60 L54 60 L50 66 Z" fill="#1c2230" />
      )}
      {s.acc === "scarf" && <path d="M34 76 Q50 84 66 76 L66 84 Q50 90 34 84Z" fill={s.accent} />}
      {s.acc === "monocle" && <circle cx="58" cy="50" r="7" stroke={s.accent} strokeWidth="2" fill="none" />}
    </g>
  );
}

function Orb({ s }: { s: Extract<Spec, { kind: "orb" }> }) {
  return (
    <g>
      {s.ring && <ellipse cx="50" cy="50" rx="40" ry="14" fill="none" stroke={s.c1} strokeWidth="2" opacity="0.7" transform="rotate(-20 50 50)" />}
      {s.comet && <path d="M20 78 L54 44" stroke={s.c1} strokeWidth="6" strokeLinecap="round" opacity="0.7" />}
      <circle cx="54" cy="44" r="22" fill={s.c2} />
      <circle cx="54" cy="44" r="22" fill="none" />
      <circle cx="47" cy="37" r="9" fill={s.c1} opacity="0.85" />
    </g>
  );
}

function Emblem({ s }: { s: Extract<Spec, { kind: "emblem" }> }) {
  return (
    <g>
      {s.crown && (
        <path d="M32 30 L40 20 L50 28 L60 20 L68 30 L64 40 L36 40 Z" fill="#d4af37" opacity="0.9" />
      )}
      <text x="50" y={s.crown ? 74 : 68} fontSize="44" textAnchor="middle" fill={s.color} fontFamily="Georgia, serif">
        {s.glyph}
      </text>
    </g>
  );
}
