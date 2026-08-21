/**
 * Configuration du mode en ligne. Les variables NEXT_PUBLIC_* sont injectées
 * au build. Absentes → le mode en ligne s'affiche « bientôt disponible » et
 * l'app ne plante jamais.
 */
export interface OnlineConfig {
  url: string;
  anonKey: string;
}

export function onlineConfig(): OnlineConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && anonKey) return { url, anonKey };
  return null;
}

export function isOnlineConfigured(): boolean {
  return onlineConfig() !== null;
}

/** Génère un code de partie court et facile à dicter (5 lettres, sans I/O/0/1). */
export function generateRoomCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}
