/**
 * Catalogue des cosmétiques — SOURCE UNIQUE. Tout est généré par le code.
 * Prix dérivés de la rareté (voir types.ts / ECONOMY.md).
 */

import {
  priceFor,
  type FeltDef,
  type BackDef,
  type DeckDef,
  type AvatarDef,
  type FrameDef,
  type Rarity,
  type Collection,
  type Mood,
} from "./types";

// --------------------------------------------------------------- TAPIS (24)

function felt(
  id: string,
  name: string,
  collection: Collection,
  rarity: Rarity,
  moods: Mood[],
  animated: boolean,
  unlock?: { level?: number; exploit?: string },
): FeltDef {
  return { id, name, category: "felt", collection, rarity, price: priceFor("felt", rarity), moods, animated, unlock };
}

export const FELTS: FeltDef[] = [
  // Classique
  felt("felt-emeraude", "Feutrine émeraude", "classique", "commun", ["calme", "sombre"], false),
  felt("felt-bordeaux", "Feutrine bordeaux", "classique", "commun", ["calme", "sombre"], false),
  felt("felt-noyer", "Bois de noyer", "classique", "rare", ["calme", "sombre"], false),
  felt("felt-cuir", "Cuir cognac", "classique", "rare", ["calme"], false),
  // Prestige
  felt("felt-marbre", "Marbre & or", "prestige", "epique", ["calme", "sombre"], true),
  felt("felt-artdeco", "Art déco", "prestige", "epique", ["anime", "sombre"], true),
  felt("felt-velours", "Velours minuit", "prestige", "rare", ["calme", "sombre"], false),
  felt("felt-laque", "Laque & grues", "prestige", "epique", ["calme", "sombre"], true),
  // Cosmos
  felt("felt-nebuleuse", "Nébuleuse", "cosmos", "epique", ["anime", "sombre"], true),
  felt("felt-aurore", "Aurore boréale", "cosmos", "epique", ["anime", "sombre"], true),
  felt("felt-eclipse", "Éclipse", "cosmos", "legendaire", ["anime", "sombre"], true),
  felt("felt-voielactee", "Voie lactée", "cosmos", "legendaire", ["anime", "sombre"], true),
  // Néon
  felt("felt-cybergrid", "Cyber grid", "neon", "rare", ["anime", "sombre"], true),
  felt("felt-synthwave", "Synthwave", "neon", "epique", ["anime", "sombre"], true),
  felt("felt-hologramme", "Hologramme", "neon", "epique", ["anime", "clair"], true),
  felt("felt-circuit", "Circuit", "neon", "rare", ["anime", "sombre"], true),
  // Nature
  felt("felt-seigaiha", "Vagues Seigaiha", "nature", "rare", ["anime", "clair"], true),
  felt("felt-zen", "Jardin zen", "nature", "rare", ["calme", "clair"], false),
  felt("felt-foret", "Forêt de nuit", "nature", "epique", ["anime", "sombre"], true),
  felt("felt-ocean", "Océan profond", "nature", "epique", ["anime", "sombre"], true),
  // Légende (verrouillées)
  felt("felt-trone", "Trône d'or", "legende", "legendaire", ["anime", "sombre"], true, { level: 15 }),
  felt("felt-dragon", "Dragon", "legende", "legendaire", ["anime", "sombre"], true, { level: 15 }),
  felt("felt-alchimie", "Alchimie", "legende", "legendaire", ["anime", "sombre"], true, { level: 15 }),
  felt("felt-centenaire", "Le Centenaire", "legende", "legendaire", ["calme", "clair"], true, {
    exploit: "Gagner une partie avec 100 points d'écart",
  }),
];

// --------------------------------------------------------------- DOS (12)

function back(id: string, name: string, collection: Collection, rarity: Rarity, unlock?: { level?: number }): BackDef {
  return { id, name, category: "back", collection, rarity, price: priceFor("back", rarity), unlock };
}

export const BACKS: BackDef[] = [
  back("back-classique", "Tressé classique", "classique", "commun"),
  back("back-bordeaux", "Losanges bordeaux", "classique", "commun"),
  back("back-artdeco", "Art déco doré", "prestige", "rare"),
  back("back-royal", "Filigrane royal", "prestige", "epique"),
  back("back-seigaiha", "Vagues japonaises", "nature", "rare"),
  back("back-foret", "Lucioles", "nature", "epique"),
  back("back-nebuleuse", "Nébuleuse", "cosmos", "epique"),
  back("back-etoiles", "Constellations", "cosmos", "rare"),
  back("back-neon", "Néon", "neon", "rare"),
  back("back-circuit", "Circuit", "neon", "epique"),
  back("back-dragon", "Dragon", "legende", "legendaire", { level: 10 }),
  back("back-or", "Or massif", "legende", "legendaire"),
];

// --------------------------------------------------------------- JEUX (6)

function deck(id: string, name: string, rarity: Rarity, unlock?: { level?: number }): DeckDef {
  return { id, name, category: "deck", rarity, price: priceFor("deck", rarity), unlock };
}

export const DECKS: DeckDef[] = [
  deck("deck-classique", "Classique raffiné", "commun"),
  deck("deck-artdeco", "Art déco", "rare"),
  deck("deck-minimal", "Minimal", "rare"),
  deck("deck-neon", "Néon", "epique"),
  deck("deck-royaume", "Royaume", "legendaire", { level: 20 }),
  deck("deck-celeste", "Célestes", "epique"),
];

// --------------------------------------------------------------- AVATARS (36)

const AVATAR_SERIES: { key: string; label: string; ids: [string, string, Rarity][] }[] = [
  {
    key: "joueurs",
    label: "Les Joueurs",
    ids: [
      ["av-chapeau", "La joueuse au chapeau", "rare"],
      ["av-briscard", "Le vieux briscard", "rare"],
      ["av-stratege", "La stratège", "epique"],
      ["av-dandy", "Le dandy", "rare"],
      ["av-gitane", "La diseuse", "epique"],
      ["av-capitaine", "Le capitaine", "commun"],
    ],
  },
  {
    key: "animaux",
    label: "Les Animaux joueurs",
    ids: [
      ["av-renard", "Renard au nœud pap'", "rare"],
      ["av-chouette", "Chouette au monocle", "epique"],
      ["av-chat", "Chat joueur", "commun"],
      ["av-panda", "Panda zen", "commun"],
      ["av-corbeau", "Corbeau élégant", "rare"],
      ["av-lionne", "Lionne couronnée", "epique"],
    ],
  },
  {
    key: "cosmos",
    label: "Cosmos",
    ids: [
      ["av-astronaute", "Astronaute", "epique"],
      ["av-comete", "Comète souriante", "rare"],
      ["av-constellation", "Constellation", "epique"],
      ["av-lune", "Sélène", "rare"],
      ["av-soleil", "Héliaque", "rare"],
      ["av-trounoir", "Singularité", "legendaire"],
    ],
  },
  {
    key: "legendes",
    label: "Légendes",
    ids: [
      ["av-roicoeur", "Roi de cœur", "legendaire"],
      ["av-damepique", "Dame de pique", "legendaire"],
      ["av-joker", "Joker mystérieux", "epique"],
      ["av-chevalier", "Chevalier", "rare"],
      ["av-alchimiste", "Alchimiste", "epique"],
      ["av-pirate", "Pirate", "rare"],
    ],
  },
  {
    key: "neon",
    label: "Néon",
    ids: [
      ["av-cyber1", "Cyber-rôdeuse", "rare"],
      ["av-cyber2", "Netrunner", "epique"],
      ["av-cyber3", "Hologyre", "rare"],
      ["av-cyber4", "Synthwave kid", "commun"],
      ["av-cyber5", "Glitch", "rare"],
      ["av-cyber6", "Overdrive", "epique"],
    ],
  },
  {
    key: "mystiques",
    label: "Mystiques",
    ids: [
      ["av-kitsune", "Renarde kitsune", "epique"],
      ["av-esprit", "Esprit de la forêt", "epique"],
      ["av-phenix", "Phénix", "legendaire"],
      ["av-golem", "Golem", "rare"],
      ["av-ondine", "Ondine", "rare"],
      ["av-sorciere", "Sorcière", "epique"],
    ],
  },
];

export const AVATAR_SERIES_LABELS: Record<string, string> = Object.fromEntries(
  AVATAR_SERIES.map((s) => [s.key, s.label]),
);

export const AVATARS: AvatarDef[] = AVATAR_SERIES.flatMap((s) =>
  s.ids.map(([id, name, rarity]) => ({
    id,
    name,
    category: "avatar" as const,
    series: s.key,
    rarity,
    price: priceFor("avatar", rarity),
  })),
);

// --------------------------------------------------------------- CADRES (12)

function frame(id: string, name: string, rarity: Rarity, color: string, unlock?: { level?: number }): FrameDef {
  return { id, name, category: "frame", rarity, price: priceFor("frame", rarity), color, unlock };
}

export const FRAMES: FrameDef[] = [
  frame("frame-argent", "Argent", "commun", "#c0c0c0"),
  frame("frame-bronze", "Bronze", "commun", "#cd7f32"),
  frame("frame-or", "Or", "rare", "#d4af37", { level: 15 }),
  frame("frame-emeraude", "Émeraude", "rare", "#3ecf8e"),
  frame("frame-rubis", "Rubis", "epique", "#e0524d"),
  frame("frame-saphir", "Saphir", "epique", "#4aa8d8"),
  frame("frame-cosmos", "Cosmos", "epique", "#b57edc"),
  frame("frame-neon", "Néon", "epique", "#22d3ee"),
  frame("frame-laurier", "Laurier", "rare", "#a3b18a"),
  frame("frame-flamme", "Flamme", "legendaire", "#ff7a18"),
  frame("frame-glace", "Givre", "rare", "#a5d8ff"),
  frame("frame-royal", "Royal", "legendaire", "#f4d670"),
];

// --------------------------------------------------------------- helpers

export const DEFAULT_OWNED = [
  "felt-emeraude",
  "back-classique",
  "deck-classique",
  // quelques avatars « commun » offerts pour l'onboarding
  "av-capitaine",
  "av-chat",
  "av-panda",
  "av-cyber4",
];
export const DEFAULT_EQUIPPED = { felt: "felt-emeraude", back: "back-classique", deck: "deck-classique", frame: null as string | null };

export type AnyCosmetic = FeltDef | BackDef | DeckDef | AvatarDef | FrameDef;

const ALL: AnyCosmetic[] = [...FELTS, ...BACKS, ...DECKS, ...AVATARS, ...FRAMES];
const BY_ID = new Map<string, AnyCosmetic>(ALL.map((c) => [c.id, c]));

export function cosmetic(id: string): AnyCosmetic | undefined {
  return BY_ID.get(id);
}
export function cosmeticName(id: string): string {
  return BY_ID.get(id)?.name ?? id;
}
export function frameColor(id: string | null | undefined): string | null {
  if (!id) return null;
  const c = BY_ID.get(id);
  return c && c.category === "frame" ? (c as FrameDef).color : null;
}
export function allCosmetics(): AnyCosmetic[] {
  return ALL;
}

/** Un cosmétique est-il débloqué (niveau atteint) ? Les exploits sont gérés à part. */
export function isUnlockedByLevel(c: AnyCosmetic, level: number): boolean {
  if (!("unlock" in c) || !c.unlock?.level) return true;
  return level >= c.unlock.level;
}
