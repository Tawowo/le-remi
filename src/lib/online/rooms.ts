/**
 * Accès à la table `rooms` (Supabase) — création/lecture/màj d'un salon et
 * abonnement Realtime. Utilise EXACTEMENT les identifiants de `schema.ts`
 * (donc de `supabase/schema.sql`). Tout est no-op si le mode en ligne n'est
 * pas configuré (aucune clé) → l'app ne plante jamais.
 */

import type { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { getSupabase } from "./client";
import {
  ROOMS_TABLE,
  roomChannelName,
  type RoomRow,
  type RoomConfig,
  type LobbyPlayer,
  type RoomStatus,
} from "./schema";

/** Crée un salon. Renvoie la ligne créée, ou null si non configuré/erreur. */
export async function createRoom(
  code: string,
  hostId: string,
  config: RoomConfig,
  players: LobbyPlayer[],
): Promise<RoomRow | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb
    .from(ROOMS_TABLE)
    .insert({ code: code.toUpperCase(), host_id: hostId, status: "lobby", config, players })
    .select()
    .single();
  if (error) return null;
  return data as RoomRow;
}

/** Récupère un salon par code (pour rejoindre / reconnecter). */
export async function fetchRoom(code: string): Promise<RoomRow | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb
    .from(ROOMS_TABLE)
    .select()
    .eq("code", code.toUpperCase())
    .maybeSingle();
  if (error) return null;
  return (data as RoomRow) ?? null;
}

/** Met à jour le salon (roster, statut, snapshot d'état). */
export async function updateRoom(
  code: string,
  patch: Partial<Pick<RoomRow, "players" | "status" | "state" | "config">>,
): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb.from(ROOMS_TABLE).update(patch).eq("code", code.toUpperCase());
  return !error;
}

export async function setRoomStatus(code: string, status: RoomStatus): Promise<boolean> {
  return updateRoom(code, { status });
}

/** Canal Realtime (broadcast + presence) du salon. */
export function openRoomChannel(code: string): RealtimeChannel | null {
  const sb = getSupabase();
  if (!sb) return null;
  return sb.channel(roomChannelName(code), {
    config: { broadcast: { self: false }, presence: { key: "" } },
  });
}

/** S'abonne aux changements de la ligne `rooms` (reconnexion / màj lobby). */
export function subscribeRoomChanges(
  code: string,
  onChange: (row: RoomRow) => void,
): RealtimeChannel | null {
  const sb = getSupabase();
  if (!sb) return null;
  const channel = sb
    .channel(`${roomChannelName(code)}-db`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: ROOMS_TABLE, filter: `code=eq.${code.toUpperCase()}` },
      (payload: RealtimePostgresChangesPayload<RoomRow>) => {
        const row = payload.new as RoomRow | undefined;
        if (row && row.code) onChange(row);
      },
    )
    .subscribe();
  return channel;
}
