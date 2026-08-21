/**
 * Système de cosmétiques « Collections ». Tout est généré par le code
 * (SVG/CSS), aucun fichier externe. Prix centralisés par rareté et catégorie.
 */

export type Rarity = "commun" | "rare" | "epique" | "legendaire";

export type Collection =
  | "classique"
  | "prestige"
  | "cosmos"
  | "neon"
  | "nature"
  | "legende";

export type Mood = "calme" | "anime" | "sombre" | "clair";

export type CosmeticCategory = "felt" | "back" | "deck" | "avatar" | "frame";

export interface CosmeticBase {
  id: string;
  name: string;
  category: CosmeticCategory;
  rarity: Rarity;
  price: number;
  /** Déblocage conditionnel (niveau requis ou exploit). */
  unlock?: { level?: number; exploit?: string };
}

export interface FeltDef extends CosmeticBase {
  category: "felt";
  collection: Collection;
  moods: Mood[];
  animated: boolean;
}

export interface BackDef extends CosmeticBase {
  category: "back";
  collection: Collection;
}

export interface DeckDef extends CosmeticBase {
  category: "deck";
}

export interface AvatarDef extends CosmeticBase {
  category: "avatar";
  series: string;
}

export interface FrameDef extends CosmeticBase {
  category: "frame";
  color: string;
}

export const RARITY_LABEL: Record<Rarity, string> = {
  commun: "Commun",
  rare: "Rare",
  epique: "Épique",
  legendaire: "Légendaire",
};

export const RARITY_COLOR: Record<Rarity, string> = {
  commun: "#8aa0b5",
  rare: "#4aa8d8",
  epique: "#b57edc",
  legendaire: "#d4af37",
};

export const COLLECTION_LABEL: Record<Collection, string> = {
  classique: "Classique",
  prestige: "Prestige",
  cosmos: "Cosmos",
  neon: "Néon",
  nature: "Nature",
  legende: "Légende",
};

/** Grille de prix par rareté et catégorie (centralisée — voir ECONOMY.md). */
export const PRICE_TABLE: Record<CosmeticCategory, Record<Rarity, number>> = {
  felt: { commun: 500, rare: 1500, epique: 4000, legendaire: 10000 },
  back: { commun: 300, rare: 800, epique: 1500, legendaire: 2000 },
  deck: { commun: 0, rare: 2000, epique: 4000, legendaire: 6000 },
  avatar: { commun: 250, rare: 800, epique: 1500, legendaire: 2500 },
  frame: { commun: 400, rare: 700, epique: 1100, legendaire: 1500 },
};

export function priceFor(category: CosmeticCategory, rarity: Rarity): number {
  return PRICE_TABLE[category][rarity];
}
