/**
 * Contrat de schéma du mode en ligne — DOIT rester synchronisé avec
 * `supabase/schema.sql`. Ces constantes sont les seuls noms de table/colonnes
 * utilisés par le code : c'est la correspondance exacte code ⇄ SQL.
 */

export const ROOMS_TABLE = "rooms";

export const ROOM_COLUMNS = {
  code: "code",
  hostId: "host_id",
  status: "status",
  config: "config",
  players: "players",
  state: "state",
  createdAt: "created_at",
  updatedAt: "updated_at",
} as const;

export type RoomStatus = "lobby" | "playing" | "finished";

export interface LobbyPlayer {
  id: string;
  name: string;
  isBot: boolean;
  color: string;
}

export interface RoomConfig {
  hostName: string;
  target: number;
  maxPlayers: number;
}

/** Une ligne de la table `rooms` (état persistant d'un salon/partie). */
export interface RoomRow {
  code: string;
  host_id: string;
  status: RoomStatus;
  config: RoomConfig;
  players: LobbyPlayer[];
  /** Snapshot public de l'état de partie (pour la reconnexion). Jamais les mains adverses. */
  state: unknown | null;
  created_at: string;
  updated_at: string;
}

/** Nom du canal Realtime (broadcast + presence) d'un salon. */
export function roomChannelName(code: string): string {
  return `remi-room-${code.toUpperCase()}`;
}
