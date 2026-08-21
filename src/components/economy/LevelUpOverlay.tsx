"use client";

import { Confetti } from "@/components/Confetti";
import { cosmeticById } from "@/lib/economy/config";
import type { LevelUpRewards } from "@/lib/economy/progression";

/** Écran de level-up : médaillon forgé + récompenses révélées. */
export function LevelUpOverlay({
  level,
  rewards,
  onClose,
}: {
  level: number;
  rewards: LevelUpRewards;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-felt-deep/95 px-6 text-center" onClick={onClose}>
      <Confetti active count={120} />
      <div className="text-sm uppercase tracking-[0.3em] text-gold">Niveau supérieur</div>
      <div className="mt-3 flex h-28 w-28 animate-pop-gold items-center justify-center rounded-full bg-gold text-5xl font-black text-felt-deep shadow-glow">
        {level}
      </div>
      <h2 className="mt-4 text-2xl font-display font-black text-ivory">Niveau {level} !</h2>

      <div className="mt-4 rounded-2xl bg-gold/15 px-5 py-3 text-ivory">
        {rewards.coins > 0 && <div className="text-lg font-bold">+{rewards.coins} 🪙</div>}
        {rewards.cosmetics.map((c) => (
          <div key={c} className="text-sm text-gold">🎁 {cosmeticById(c)?.label ?? c} débloqué</div>
        ))}
        {rewards.titles.map((t) => (
          <div key={t} className="text-sm text-gold">🏷️ Titre « {t} »</div>
        ))}
        {rewards.boosts > 0 && <div className="text-sm text-gold">⚡ {rewards.boosts} Boost XP ×2</div>}
      </div>

      <button className="mt-6 tap rounded-2xl bg-gold px-8 py-3 font-bold text-felt-deep">Continuer</button>
    </div>
  );
}
