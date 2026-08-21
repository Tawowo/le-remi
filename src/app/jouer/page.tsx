"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useProfile } from "@/components/economy/ProfileProvider";
import { CoinBalance } from "@/components/economy/CoinBalance";
import { createSoloPlayers, type ProfileMix } from "@/lib/game/setup";
import { startGame } from "@/lib/game/engine";
import { defaultTarget } from "@/lib/scoring";
import { debit } from "@/lib/economy/profileStore";
import { saveCurrentPlay } from "@/lib/playStore";
import { TABLES, type TableDef, type BotDifficulty } from "@/lib/economy/config";

const DIFF_TO_MIX: Record<BotDifficulty, ProfileMix> = {
  facile: "prudent",
  moyen: "aleatoire",
  difficile: "audacieux",
};

export default function OfflineSetupPage() {
  const router = useRouter();
  const { profile, mutate } = useProfile();
  const [tier, setTier] = useState<TableDef>(TABLES[0]);
  const [bots, setBots] = useState(2);
  const [confirming, setConfirming] = useState(false);

  const total = bots + 1;
  const affordable = profile.coins >= tier.entry;
  const missing = Math.max(0, tier.entry - profile.coins);

  const start = () => {
    if (!affordable) return;
    if (tier.entry > 0 && !confirming) {
      setConfirming(true);
      return;
    }
    const players = createSoloPlayers(profile.pseudo || "Moi", bots, DIFF_TO_MIX[tier.botDifficulty]);
    // le premier joueur = l'humain, on lui met son avatar/couleur
    players[0] = { ...players[0], name: profile.pseudo || "Moi", color: profile.color };
    const state = startGame(players, { target: defaultTarget(total), dealerIndex: 0 });

    if (tier.entry > 0) mutate((p) => debit(p, tier.entry, `Mise ${tier.label}`));

    saveCurrentPlay({
      id: `solo-${Date.now()}`,
      mode: "solo",
      state,
      createdAt: Date.now(),
      table: { tier: tier.tier, label: tier.label, entry: tier.entry, soloWin: tier.soloWin, felt: tier.felt },
    });
    router.push("/table");
  };

  return (
    <main className="mx-auto min-h-app max-w-md px-5 safe-top safe-bottom pt-2">
      <header className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="tap flex items-center rounded-full panel px-3 text-lg" aria-label="Retour">
            ←
          </Link>
          <h1 className="text-2xl font-display font-bold">Les Tables</h1>
        </div>
        <CoinBalance coins={profile.coins} size="sm" />
      </header>

      <p className="mb-3 text-sm text-[color:var(--text-soft)]">
        Choisis une table : mise à l'entrée, gain fixe à la victoire contre les bots.
      </p>

      <div className="flex flex-col gap-2.5">
        {TABLES.map((t) => {
          const locked = profile.coins < t.entry;
          const selected = tier.tier === t.tier;
          return (
            <button
              key={t.tier}
              onClick={() => {
                setTier(t);
                setConfirming(false);
              }}
              disabled={locked}
              className={`tap flex items-center justify-between rounded-2xl border px-4 py-3 text-left ${
                selected ? "border-gold bg-gold/10" : "panel"
              } ${locked ? "opacity-45" : ""}`}
            >
              <span>
                <span className="block font-bold">{t.label}</span>
                <span className="block text-xs text-[color:var(--text-soft)]">
                  bots {t.botDifficulty} · victoire +{t.soloWin} 🪙
                </span>
              </span>
              <span className="text-right">
                {t.entry === 0 ? (
                  <span className="rounded-full bg-gold px-2 py-1 text-xs font-bold text-felt-deep">Gratuit</span>
                ) : locked ? (
                  <span className="text-xs text-contre">manque {t.entry - profile.coins} 🪙</span>
                ) : (
                  <span className="tnum text-sm font-bold">🪙 {t.entry}</span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-5 rounded-2xl panel p-4">
        <div className="flex items-center justify-between">
          <span className="font-semibold">Adversaires</span>
          <span className="text-lg font-bold tnum text-gold">{bots}</span>
        </div>
        <div className="mt-3 grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => setBots(n)}
              className={`tap h-12 rounded-xl border text-lg font-bold tnum ${
                bots === n ? "bg-gold text-felt-deep border-gold" : "panel-soft"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-[color:var(--text-soft)]">Partie à {total} joueurs.</p>
      </div>

      {!affordable ? (
        <div className="mt-6 rounded-2xl panel-soft p-4 text-center text-sm text-contre">
          Il te manque {missing} 🪙 pour cette table. Récupère ton bonus quotidien ou joue la Découverte (gratuite).
        </div>
      ) : (
        <button
          onClick={start}
          className="mt-6 mb-4 tap w-full rounded-2xl bg-gold py-4 text-lg font-bold text-felt-deep shadow-glow active:scale-[0.98] transition-transform"
        >
          {tier.entry === 0
            ? `Distribuer — ${total} joueurs`
            : confirming
              ? `Confirmer : miser ${tier.entry} 🪙`
              : `Miser ${tier.entry} 🪙 et jouer`}
        </button>
      )}
    </main>
  );
}
