import type { BotProfile, EnginePlayer } from "./engine";
import { BOT_NAMES, pickProfile } from "./bots";
import { AVATAR_COLORS } from "../table";

export type ProfileMix = "aleatoire" | BotProfile;

/** Construit les joueurs d'une partie solo : 1 humain + N bots. */
export function createSoloPlayers(
  pseudo: string,
  botCount: number,
  mix: ProfileMix = "aleatoire",
): EnginePlayer[] {
  const human: EnginePlayer = {
    id: "me",
    name: pseudo.trim() || "Moi",
    color: AVATAR_COLORS[0],
    isBot: false,
    hand: [],
  };

  const names = [...BOT_NAMES].sort(() => Math.random() - 0.5);
  const bots: EnginePlayer[] = Array.from({ length: botCount }, (_, i) => ({
    id: `bot-${i}`,
    name: names[i % names.length],
    color: AVATAR_COLORS[(i + 1) % AVATAR_COLORS.length],
    isBot: true,
    profile: mix === "aleatoire" ? pickProfile() : mix,
    hand: [],
  }));

  return [human, ...bots];
}
