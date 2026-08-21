"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { TopBar } from "@/components/economy/TopBar";
import { Onboarding } from "@/components/economy/Onboarding";
import { useProfile } from "@/components/economy/ProfileProvider";
import { getCurrentGame } from "@/lib/storage";
import { loadCurrentPlay } from "@/lib/playStore";
import { computeDailyBonus } from "@/lib/economy/progression";
import { WHEEL_COOLDOWN_MS } from "@/lib/economy/config";

export default function HomePage() {
  const { profile, ready } = useProfile();
  const [resume, setResume] = useState<{ href: string; label: string } | null>(null);
  const [rewardDot, setRewardDot] = useState(false);

  useEffect(() => {
    const play = loadCurrentPlay();
    if (play && play.state.phase !== "gameEnd") {
      setResume({ href: "/table", label: "Reprendre la partie en cours" });
    } else {
      const table = getCurrentGame();
      if (table && !table.finishedAt) setResume({ href: "/partie", label: "Reprendre le compteur de table" });
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    const now = Date.now();
    const daily = computeDailyBonus(profile.lastDailyDay, profile.dailyStreak, now).canClaim;
    const wheel = now - profile.lastWheelMs >= WHEEL_COOLDOWN_MS;
    setRewardDot(daily || wheel);
  }, [ready, profile.lastDailyDay, profile.dailyStreak, profile.lastWheelMs]);

  if (!ready) return null;
  if (!profile.onboarded) return <Onboarding onDone={() => {}} />;

  return (
    <main className="mx-auto flex min-h-app max-w-md flex-col px-5 safe-top safe-bottom pt-2">
      <TopBar />

      <div className="mt-3">
        <Logo size={64} />
      </div>

      {resume && (
        <Link
          href={resume.href}
          className="mt-6 tap flex items-center justify-center rounded-2xl border border-gold/60 panel px-5 py-3 font-semibold active:scale-[0.98] transition-transform"
        >
          {resume.label}
        </Link>
      )}

      <nav className="mt-6 flex flex-col gap-3">
        <Door href="/en-ligne" icon="🌐" title="Jouer en ligne" sub="Créer / rejoindre · Les Tables" />
        <Door href="/jouer" icon="🤖" title="Jouer hors ligne" sub="Contre les bots · Les Tables" primary />
        <Door href="/nouvelle-partie" icon="🃏" title="Compteur de table" sub="Score avec de vraies cartes" />
      </nav>

      <div className="mt-5 grid grid-cols-5 gap-2">
        <Mini href="/profil" icon="👤" label="Profil" />
        <Mini href="/boutique" icon="🛍️" label="Boutique" />
        <Mini href="/recompenses" icon="🎁" label="Cadeaux" dot={rewardDot} />
        <Mini href="/regles" icon="📖" label="Règles" />
        <Mini href="/reglages" icon="⚙️" label="Réglages" />
      </div>

      <p className="mt-auto pt-6 text-center text-xs text-[color:var(--text-soft)]">
        Pièces 100 % virtuelles · aucun achat réel · c'est un jeu
      </p>
    </main>
  );
}

function Door({
  href,
  title,
  sub,
  icon,
  primary = false,
}: {
  href: string;
  title: string;
  sub: string;
  icon: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={[
        "tap flex items-center gap-3 rounded-2xl px-5 py-4 active:scale-[0.98] transition-transform",
        primary ? "bg-gold text-felt-deep shadow-glow" : "panel",
      ].join(" ")}
    >
      <span className="text-2xl">{icon}</span>
      <span className="min-w-0">
        <span className="block font-bold leading-tight">{title}</span>
        <span className={`block text-xs ${primary ? "text-felt-deep/70" : "text-[color:var(--text-soft)]"}`}>{sub}</span>
      </span>
    </Link>
  );
}

function Mini({ href, icon, label, dot }: { href: string; icon: string; label: string; dot?: boolean }) {
  return (
    <Link href={href} className="tap relative flex flex-col items-center gap-1 rounded-2xl panel py-2.5 text-center">
      {dot && <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-contre" />}
      <span className="text-xl">{icon}</span>
      <span className="text-[0.65rem] font-semibold">{label}</span>
    </Link>
  );
}
