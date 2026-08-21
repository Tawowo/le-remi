"use client";

import Link from "next/link";
import { useProfile } from "./ProfileProvider";
import { Avatar } from "./Avatar";
import { CoinBalance } from "./CoinBalance";
import { xpProgress } from "@/lib/economy/progression";

/** Bandeau persistant : avatar + niveau + XP + solde de pièces. */
export function TopBar() {
  const { profile } = useProfile();
  const prog = xpProgress(profile.xp);

  return (
    <div className="flex items-center justify-between gap-3">
      <Link href="/profil" className="flex min-w-0 items-center gap-2.5">
        <Avatar avatar={profile.avatar} color={profile.color} frame={profile.equipped.frame} size={44} level={prog.level} />
        <span className="min-w-0">
          <span className="block truncate text-sm font-bold leading-tight">{profile.pseudo || "Joueur"}</span>
          <span className="mt-0.5 block h-1.5 w-24 overflow-hidden rounded-full progress-track">
            <span className="block h-full rounded-full bg-gold" style={{ width: `${prog.pct * 100}%` }} />
          </span>
        </span>
      </Link>
      <CoinBalance coins={profile.coins} />
    </div>
  );
}
