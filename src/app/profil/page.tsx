"use client";

import Link from "next/link";
import { useProfile } from "@/components/economy/ProfileProvider";
import { Avatar } from "@/components/economy/Avatar";
import { CoinBalance } from "@/components/economy/CoinBalance";
import { xpProgress } from "@/lib/economy/progression";

export default function ProfilePage() {
  const { profile, mutate } = useProfile();
  const prog = xpProgress(profile.xp);

  return (
    <main className="mx-auto min-h-app max-w-md px-5 safe-top safe-bottom pt-2">
      <header className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="tap flex items-center rounded-full panel px-3 text-lg" aria-label="Retour">
            ←
          </Link>
          <h1 className="text-2xl font-display font-bold">Profil</h1>
        </div>
        <CoinBalance coins={profile.coins} size="sm" />
      </header>

      <div className="flex items-center gap-4 rounded-2xl panel p-4">
        <Avatar avatar={profile.avatar} color={profile.color} frame={profile.equipped.frame} size={72} level={prog.level} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-xl font-display font-bold">{profile.pseudo || "Joueur"}</div>
          <div className="text-sm text-gold">{profile.title}</div>
          <div className="mt-2 flex items-center gap-2 text-xs text-[color:var(--text-soft)]">
            <span>Niv. {prog.level}</span>
            <span className="h-1.5 flex-1 overflow-hidden rounded-full progress-track">
              <span className="block h-full rounded-full bg-gold" style={{ width: `${prog.pct * 100}%` }} />
            </span>
            <span className="tnum">{prog.into}/{prog.span}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <Box label="Pièces" value={`${profile.coins}`} />
        <Box label="Boosts XP" value={`${profile.boosts}`} />
        <Box label="Cosmétiques" value={`${profile.owned.length}`} />
      </div>

      {/* Titres */}
      <div className="mt-4 rounded-2xl panel p-4">
        <h2 className="mb-2 font-display text-lg font-bold">Titre affiché</h2>
        <div className="flex flex-wrap gap-2">
          {profile.titlesUnlocked.map((t) => (
            <button
              key={t}
              onClick={() => mutate((p) => ({ ...p, title: t }))}
              className={`tap rounded-full px-3 py-1.5 text-sm ${profile.title === t ? "bg-gold text-felt-deep font-bold" : "panel-soft"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        <Link href="/stats" className="tap flex-1 rounded-2xl panel py-3 text-center font-semibold">📊 Statistiques</Link>
        <Link href="/boutique" className="tap flex-1 rounded-2xl panel py-3 text-center font-semibold">🛍️ Boutique</Link>
      </div>

      {/* Portefeuille */}
      <div className="mt-4 rounded-2xl panel p-4">
        <h2 className="mb-2 font-display text-lg font-bold">Portefeuille</h2>
        {profile.wallet.length === 0 ? (
          <p className="text-sm text-[color:var(--text-soft)]">Aucun mouvement pour l'instant.</p>
        ) : (
          <ul className="flex flex-col gap-1.5 text-sm">
            {profile.wallet.slice(0, 15).map((w, i) => (
              <li key={i} className="flex items-center justify-between border-t border-[color:var(--border)] pt-1.5 first:border-0 first:pt-0">
                <span className="truncate text-[color:var(--text-soft)]">{w.reason}</span>
                <span className={`tnum font-semibold ${w.delta >= 0 ? "text-gold" : "text-contre"}`}>
                  {w.delta >= 0 ? "+" : ""}
                  {w.delta}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

function Box({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl panel p-3">
      <div className="text-xl font-black tnum text-gold">{value}</div>
      <div className="text-[0.65rem] text-[color:var(--text-soft)]">{label}</div>
    </div>
  );
}
