"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { loadRecords, computeProfiles, type GameRecord, type ProfileStats } from "@/lib/profiles";
import { Odometer } from "@/components/Odometer";

export default function StatsPage() {
  const [records, setRecords] = useState<GameRecord[]>([]);

  useEffect(() => {
    setRecords(loadRecords());
  }, []);

  const profiles = useMemo(() => computeProfiles(records), [records]);

  return (
    <main className="mx-auto min-h-app max-w-md px-5 safe-top safe-bottom pt-2">
      <header className="mb-5 flex items-center gap-3">
        <Link href="/" className="tap flex items-center rounded-full panel px-3 text-lg" aria-label="Retour">
          ←
        </Link>
        <h1 className="text-2xl font-display font-bold">Statistiques</h1>
      </header>

      {profiles.length === 0 && (
        <p className="rounded-2xl panel-soft p-6 text-center text-[color:var(--text-soft)]">
          Aucune statistique pour l'instant. Jouez une partie (solo, en ligne ou sur table) et vos stats s'accumulent
          ici automatiquement.
        </p>
      )}

      <div className="flex flex-col gap-4">
        {profiles.map((p) => (
          <ProfileCard key={p.name} p={p} />
        ))}
      </div>

      {profiles.length >= 2 && <Comparison profiles={profiles} />}

      <div className="mt-6">
        <RecentGames records={records} />
      </div>
    </main>
  );
}

function ProfileCard({ p }: { p: ProfileStats }) {
  return (
    <div className="rounded-2xl panel p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-display font-bold">{p.name}</h2>
        <span className="text-sm text-[color:var(--text-soft)]">
          {p.wins}/{p.games} · {p.winRate}%
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <Metric label="Parties" value={p.games} />
        <Metric label="Victoires" value={p.wins} />
        <Metric label="% victoire" value={p.winRate} suffix="%" />
        <Metric label="Rémi secs" value={p.remiSecs} gold />
        <Metric label="Contres infligés" value={p.contresInflicted} />
        <Metric label="Contres subis" value={p.contresSuffered} />
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        {p.currentStreak > 0 && (
          <span className="rounded-full bg-gold/20 px-2 py-1 font-semibold text-gold">
            🔥 série de {p.currentStreak}
          </span>
        )}
        {p.favoriteOpponent && (
          <span className="rounded-full panel-soft px-2 py-1">Adversaire favori : {p.favoriteOpponent}</span>
        )}
      </div>

      {p.badges.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {p.badges.map((b) => (
            <span key={b} className="rounded-full bg-gold px-3 py-1 text-xs font-bold text-felt-deep">
              🏅 {b}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function Metric({ label, value, suffix, gold }: { label: string; value: number; suffix?: string; gold?: boolean }) {
  return (
    <div className="rounded-xl panel-soft p-2">
      <div className={`text-xl font-black tnum ${gold ? "text-gold" : ""}`}>
        <Odometer value={value} />
        {suffix}
      </div>
      <div className="text-[0.65rem] text-[color:var(--text-soft)]">{label}</div>
    </div>
  );
}

function Comparison({ profiles }: { profiles: ProfileStats[] }) {
  const [a, setA] = useState(profiles[0].name);
  const [b, setB] = useState(profiles[1].name);
  const pa = profiles.find((p) => p.name === a)!;
  const pb = profiles.find((p) => p.name === b)!;
  const rows: [string, number, number][] = [
    ["Victoires", pa.wins, pb.wins],
    ["% victoire", pa.winRate, pb.winRate],
    ["Rémi secs", pa.remiSecs, pb.remiSecs],
    ["Contres infligés", pa.contresInflicted, pb.contresInflicted],
    ["Meilleure manche", pa.bestRound, pb.bestRound],
  ];

  return (
    <div className="mt-6 rounded-2xl panel p-4">
      <h2 className="mb-3 text-lg font-display font-bold">Comparer</h2>
      <div className="mb-3 grid grid-cols-2 gap-2">
        <select value={a} onChange={(e) => setA(e.target.value)} className="rounded-xl panel-soft px-3 py-2">
          {profiles.map((p) => (
            <option key={p.name} value={p.name}>{p.name}</option>
          ))}
        </select>
        <select value={b} onChange={(e) => setB(e.target.value)} className="rounded-xl panel-soft px-3 py-2">
          {profiles.map((p) => (
            <option key={p.name} value={p.name}>{p.name}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-2">
        {rows.map(([label, va, vb]) => {
          const max = Math.max(va, vb, 1);
          return (
            <div key={label}>
              <div className="flex justify-between text-xs text-[color:var(--text-soft)]">
                <span className="tnum">{va}</span>
                <span>{label}</span>
                <span className="tnum">{vb}</span>
              </div>
              <div className="mt-1 flex items-center gap-1">
                <div className="flex flex-1 justify-end">
                  <div className="h-2 rounded-full bg-gold" style={{ width: `${(va / max) * 100}%` }} />
                </div>
                <div className="flex flex-1 justify-start">
                  <div className="h-2 rounded-full bg-ivory/70" style={{ width: `${(vb / max) * 100}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RecentGames({ records }: { records: GameRecord[] }) {
  const MODE_LABEL: Record<string, string> = { table: "Table", solo: "Solo", online: "En ligne" };
  if (records.length === 0) return null;
  return (
    <div className="rounded-2xl panel p-4">
      <h2 className="mb-3 text-lg font-display font-bold">Parties récentes</h2>
      <ul className="flex flex-col gap-2 text-sm">
        {records.slice(0, 12).map((r) => (
          <li key={r.id} className="flex items-center justify-between border-t border-[color:var(--border)] pt-2 first:border-0 first:pt-0">
            <span>
              <span className="rounded-full panel-soft px-2 py-0.5 text-xs">{MODE_LABEL[r.mode]}</span>{" "}
              <span className="font-semibold">🏆 {r.winnerName}</span>
            </span>
            <span className="text-xs text-[color:var(--text-soft)]">
              {r.players.length} j · {r.rounds} manches
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
