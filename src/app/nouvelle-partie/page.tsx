"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { AVATAR_COLORS, createGame } from "@/lib/game";
import { defaultTarget } from "@/lib/scoring";
import { upsertGame, setCurrentGame } from "@/lib/storage";

interface Row {
  key: number;
  name: string;
}

export default function NewGamePage() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([
    { key: 1, name: "" },
    { key: 2, name: "" },
  ]);
  const [nextKey, setNextKey] = useState(3);
  const [customTarget, setCustomTarget] = useState<string>("");

  const count = rows.length;
  const target = customTarget ? Number(customTarget) : defaultTarget(count);

  const setName = (key: number, name: string) =>
    setRows((r) => r.map((row) => (row.key === key ? { ...row, name } : row)));

  const addPlayer = () => {
    if (count >= 6) return;
    setRows((r) => [...r, { key: nextKey, name: "" }]);
    setNextKey((k) => k + 1);
  };

  const removePlayer = (key: number) => {
    if (count <= 2) return;
    setRows((r) => r.filter((row) => row.key !== key));
  };

  const move = (index: number, dir: -1 | 1) => {
    const j = index + dir;
    if (j < 0 || j >= rows.length) return;
    setRows((r) => {
      const copy = [...r];
      [copy[index], copy[j]] = [copy[j], copy[index]];
      return copy;
    });
  };

  const start = () => {
    const names = rows.map((r, i) => r.name.trim() || `Joueur ${i + 1}`);
    const game = createGame(names, target > 0 ? target : defaultTarget(count));
    upsertGame(game);
    setCurrentGame(game.id);
    router.push("/partie");
  };

  return (
    <main className="mx-auto min-h-screen max-w-md px-5 pt-6 safe-bottom">
      <header className="mb-5 flex items-center gap-3">
        <Link href="/" className="tap flex items-center rounded-full panel px-3 text-lg" aria-label="Retour">
          ←
        </Link>
        <h1 className="text-2xl font-display font-bold">Nouvelle partie</h1>
      </header>

      <div className="mb-4 rounded-2xl panel-soft p-4 text-sm text-[color:var(--text-soft)]">
        Entrez les joueurs <strong className="text-[color:var(--text)]">dans le sens des aiguilles d'une montre</strong>, en commençant par le premier donneur.
      </div>

      <ul className="flex flex-col gap-2.5">
        {rows.map((row, i) => (
          <li key={row.key} className="flex items-center gap-2 rounded-2xl panel p-2">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-felt-deep"
              style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
            >
              {i + 1}
            </span>
            <input
              value={row.name}
              onChange={(e) => setName(row.key, e.target.value)}
              placeholder={`Joueur ${i + 1}`}
              maxLength={16}
              className="min-w-0 flex-1 bg-transparent px-1 py-2 text-lg outline-none placeholder:text-[color:var(--text-soft)]"
              autoComplete="off"
            />
            <div className="flex items-center gap-1">
              <button onClick={() => move(i, -1)} disabled={i === 0} className="tap h-9 w-9 rounded-lg panel-soft disabled:opacity-30" aria-label="Monter">
                ↑
              </button>
              <button onClick={() => move(i, 1)} disabled={i === rows.length - 1} className="tap h-9 w-9 rounded-lg panel-soft disabled:opacity-30" aria-label="Descendre">
                ↓
              </button>
              <button onClick={() => removePlayer(row.key)} disabled={count <= 2} className="tap h-9 w-9 rounded-lg panel-soft text-contre disabled:opacity-30" aria-label="Retirer">
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>

      <button
        onClick={addPlayer}
        disabled={count >= 6}
        className="mt-3 tap w-full rounded-2xl panel-soft py-3 text-base font-semibold disabled:opacity-40"
      >
        + Ajouter un joueur {count >= 6 && "(max 6)"}
      </button>

      <div className="mt-6 rounded-2xl panel p-4">
        <label className="flex items-center justify-between">
          <span className="font-semibold">Objectif (fin de partie)</span>
          <span className="text-sm text-[color:var(--text-soft)]">défaut {defaultTarget(count)}</span>
        </label>
        <div className="mt-2 flex items-center gap-2">
          <input
            inputMode="numeric"
            pattern="[0-9]*"
            value={customTarget}
            onChange={(e) => setCustomTarget(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder={String(defaultTarget(count))}
            className="w-28 rounded-xl panel-soft px-3 py-2 text-lg tnum outline-none"
          />
          <span className="text-sm text-[color:var(--text-soft)]">points — 100 × {count} joueurs</span>
        </div>
      </div>

      <button
        onClick={start}
        className="mt-6 mb-4 tap w-full rounded-2xl bg-gold py-4 text-lg font-bold text-felt-deep shadow-glow active:scale-[0.98] transition-transform"
      >
        C'est parti — {count} joueurs
      </button>
    </main>
  );
}
