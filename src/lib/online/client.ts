import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { onlineConfig } from "./config";

/** Client Supabase paresseux — créé uniquement si le mode en ligne est configuré. */
let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const cfg = onlineConfig();
  if (!cfg) return null;
  if (client) return client;
  client = createClient(cfg.url, cfg.anonKey, {
    realtime: { params: { eventsPerSecond: 20 } },
    auth: { persistSession: false },
  });
  return client;
}
