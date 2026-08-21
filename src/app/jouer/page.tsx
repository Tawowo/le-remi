"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createSoloPlayers, type ProfileMix } from "@/lib/game/setup";
import { startGame } from "@/lib/game/engine";
import { defaultTarget } from "@/lib/scoring";
import { PROFILES } from "@/lib/game/bots";
import { saveCurrentPlay } from "@/lib/playStore";

const MIXES: { key: ProfileMix; label: string }[] = [
  { key: "aleatoire", label: "Mélange aléatoire" },
  { key: "prudent", label: PROFILES.prudent.label },
  { key: "equilibre", label: PROFILES.equilibre.label },
  { key: "audacieux", label: PROFILES.audacieux.label },
];

export default function SoloSetupPage() {
  const router = useRouter();
  const [pseudo, setPseudo] = useState("");
  const [bots, setBots] = useState(2);
  const [mix, setMix] = useState<ProfileMix>("aleatoire");

  const total = bots + 1;

  const start = () => {
    const players = createSoloPlayers(pseudo, bots, mix);
    const state = startGame(players, { target: defaultTarget(total), dealerIndex: 0 });
    saveCurrentPlay({ id: `solo-${Date.now()}`, mode: "solo", state, createdAt: Date.now() });
    router.push("/table");
  };

  return (
    <main className="mx-auto min-h-app max-w-md px-5 safe-top safe-bottom pt-2">
      <header className="mb-5 flex items-center gap-3">
        <Link href="/" className="tap flex items-center rounded-full panel px-3 text-lg" aria-label="Retour">
          ←
        </Link>
        <h1 className="text-2xl font-display font-bold">Jouer contre l'ordinateur</h1>
      </header>

      <div className="rounded-2xl panel p-4">
        <label className="text-sm font-semibold">Votre pseudo</label>
        <input
          value={pseudo}
          onChange={(e) => setPseudo(e.target.value)}
          placeholder="Moi"
          maxLength={16}
          className="mt-2 w-full rounded-xl panel-soft px-3 py-3 text-lg outline-none"
          autoComplete="off"
        />
      </div>

      <div className="mt-4 rounded-2xl panel p-4">
        <div className="flex items-center justify-between">
          <span className="font-semibold">Nombre d'adversaires</span>
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

      <div className="mt-4 rounded-2xl panel p-4">
        <span className="font-semibold">Profils des bots</span>
        <div className="mt-3 flex flex-col gap-2">
          {MIXES.map((m) => (
            <button
              key={m.key}
              onClick={() => setMix(m.key)}
              className={`tap flex items-center justify-between rounded-xl border px-4 py-3 text-left ${
                mix === m.key ? "bg-gold/15 border-gold" : "panel-soft"
              }`}
            >
              <span className="font-semibold">{m.label}</span>
              {m.key !== "aleatoire" && (
                <span className="text-xs text-[color:var(--text-soft)]">{PROFILES[m.key].blurb}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={start}
        className="mt-6 mb-4 tap w-full rounded-2xl bg-gold py-4 text-lg font-bold text-felt-deep shadow-glow active:scale-[0.98] transition-transform"
      >
        Distribuer — {total} joueurs
      </button>
    </main>
  );
}
