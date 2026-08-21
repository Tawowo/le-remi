"use client";

import Link from "next/link";
import { useState } from "react";
import { useProfile } from "@/components/economy/ProfileProvider";
import { CoinBalance } from "@/components/economy/CoinBalance";
import { Wheel } from "@/components/economy/Wheel";
import { Confetti } from "@/components/Confetti";
import { computeDailyBonus, dayNumber } from "@/lib/economy/progression";
import { credit } from "@/lib/economy/profileStore";
import { WHEEL_SEGMENTS, WHEEL_COOLDOWN_MS, DAILY_BONUS_BY_STREAK } from "@/lib/economy/config";
import type { WheelSegment } from "@/lib/economy/config";

export default function RewardsPage() {
  const { profile, mutate } = useProfile();
  const [extraSpin, setExtraSpin] = useState(false);
  const [wheelResult, setWheelResult] = useState<WheelSegment | null>(null);
  const [celebrate, setCelebrate] = useState(false);

  const now = Date.now();
  const dailyClaim = computeDailyBonus(profile.lastDailyDay, profile.dailyStreak, now);
  const wheelReady = extraSpin || now - profile.lastWheelMs >= WHEEL_COOLDOWN_MS;

  const claimDaily = () => {
    if (!dailyClaim.canClaim) return;
    mutate((p) =>
      credit(
        { ...p, dailyStreak: dailyClaim.newStreak, lastDailyDay: dayNumber(now) },
        dailyClaim.amount,
        "Bonus quotidien",
      ),
    );
    setCelebrate(true);
    setTimeout(() => setCelebrate(false), 2500);
  };

  const applyWheel = (seg: WheelSegment) => {
    setWheelResult(seg);
    mutate((p) => {
      let next = { ...p };
      if (!extraSpin) next.lastWheelMs = Date.now();
      if (seg.kind === "coins") next = credit(next, seg.amount, "Roue quotidienne");
      else if (seg.kind === "boost") next = { ...next, boosts: next.boosts + seg.amount };
      return next;
    });
    setExtraSpin(seg.kind === "spin");
    setCelebrate(true);
    setTimeout(() => setCelebrate(false), 2500);
  };

  return (
    <main className="mx-auto min-h-app max-w-md px-5 safe-top safe-bottom pt-2">
      <Confetti active={celebrate} />
      <header className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="tap flex items-center rounded-full panel px-3 text-lg" aria-label="Retour">
            ←
          </Link>
          <h1 className="text-2xl font-display font-bold">Récompenses</h1>
        </div>
        <CoinBalance coins={profile.coins} size="sm" />
      </header>

      {/* Bonus quotidien */}
      <div className="rounded-2xl panel p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Bonus quotidien</h2>
          <span className="text-sm text-[color:var(--text-soft)]">série : {profile.dailyStreak} j</span>
        </div>
        <div className="mt-3 grid grid-cols-7 gap-1.5">
          {DAILY_BONUS_BY_STREAK.map((amt, i) => {
            const day = i + 1;
            const reached = profile.dailyStreak >= day;
            const isNext = dailyClaim.canClaim && dailyClaim.newStreak === day;
            return (
              <div
                key={day}
                className={`rounded-lg py-2 text-center text-xs ${
                  isNext ? "bg-gold text-felt-deep font-bold" : reached ? "panel-soft text-gold" : "panel-soft text-[color:var(--text-soft)]"
                }`}
              >
                <div className="text-[0.6rem]">J{day}</div>
                <div className="tnum font-semibold">{amt}</div>
              </div>
            );
          })}
        </div>
        <button
          onClick={claimDaily}
          disabled={!dailyClaim.canClaim}
          className="mt-3 tap w-full rounded-2xl bg-gold py-3 font-bold text-felt-deep disabled:opacity-40"
        >
          {dailyClaim.canClaim ? `Récupérer +${dailyClaim.amount} 🪙` : "Déjà récupéré aujourd'hui"}
        </button>
      </div>

      {/* Roue */}
      <div className="mt-5 rounded-2xl panel p-4">
        <h2 className="mb-3 font-display text-lg font-bold">La roue quotidienne</h2>
        <Wheel canSpin={wheelReady} onResult={applyWheel} />

        {wheelResult && (
          <div className="mt-4 rounded-xl bg-gold px-4 py-3 text-center font-bold text-felt-deep">
            {wheelResult.kind === "coins" && `+${wheelResult.amount} 🪙 !`}
            {wheelResult.kind === "boost" && `Boost XP ×2 (${wheelResult.amount} parties) !`}
            {wheelResult.kind === "spin" && "Tour bonus — rejoue !"}
          </div>
        )}

        {/* Probabilités affichées (équité assumée) */}
        <div className="mt-4">
          <div className="mb-1 text-xs font-semibold text-[color:var(--text-soft)]">Probabilités (réelles, testées)</div>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            {WHEEL_SEGMENTS.map((s) => (
              <li key={s.id} className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                  {s.label}
                </span>
                <span className="tnum text-[color:var(--text-soft)]">{s.weight}%</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
