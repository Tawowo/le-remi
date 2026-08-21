"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { isOnlineConfigured, generateRoomCode } from "@/lib/online/config";

export default function OnlinePage() {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setConfigured(isOnlineConfigured());
  }, []);

  const shareLink = code
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/en-ligne?code=${code}`
    : "";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareLink || code || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard indispo */
    }
  };

  return (
    <main className="mx-auto min-h-app max-w-md px-5 safe-top safe-bottom pt-2">
      <header className="mb-5 flex items-center gap-3">
        <Link href="/" className="tap flex items-center rounded-full panel px-3 text-lg" aria-label="Retour">
          ←
        </Link>
        <h1 className="text-2xl font-display font-bold">Jouer en ligne</h1>
      </header>

      {configured === false && (
        <div className="mb-4 rounded-2xl border border-gold/50 panel p-4">
          <div className="text-lg font-bold text-gold">🌐 Bientôt disponible</div>
          <p className="mt-1 text-sm text-[color:var(--text-soft)]">
            Le jeu en ligne par code a besoin d'un petit serveur Supabase (gratuit). Tant qu'il n'est pas branché, tout
            le reste de l'app fonctionne parfaitement hors-ligne : jouez contre l'ordinateur ou tenez le score sur
            table.
          </p>
          <div className="mt-3 rounded-xl panel-soft p-3 text-sm">
            <div className="font-semibold">Pour l'activer (2 minutes) :</div>
            <ol className="mt-1 list-inside list-decimal space-y-1 text-[color:var(--text-soft)]">
              <li>Créer un projet gratuit sur supabase.com</li>
              <li>
                Copier l'<em>URL</em> et la <em>clé anon</em> dans Vercel :
                <br />
                <code className="text-xs">NEXT_PUBLIC_SUPABASE_URL</code> et{" "}
                <code className="text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
              </li>
              <li>Redéployer — le mode en ligne s'active tout seul.</li>
            </ol>
            <p className="mt-2 text-xs">Guide détaillé (pour Mathéo) dans le README du projet.</p>
          </div>
        </div>
      )}

      {configured && (
        <div className="mb-4 rounded-2xl border border-gold/50 panel-soft p-3 text-sm text-gold">
          ✓ Serveur en ligne configuré.
        </div>
      )}

      {/* Créer une partie */}
      <div className="rounded-2xl panel p-4">
        <h2 className="font-display text-lg font-bold">Créer une partie</h2>
        <p className="text-sm text-[color:var(--text-soft)]">
          Un code court à dicter à vos amis (« REMIX »), plus un lien à partager.
        </p>
        {code ? (
          <div className="mt-3">
            <div className="flex items-center justify-center gap-2 rounded-xl bg-gold py-4 text-felt-deep">
              <span className="text-3xl font-black tracking-[0.3em]">{code}</span>
            </div>
            <button onClick={copy} className="tap mt-2 w-full rounded-xl panel-soft py-2.5 text-sm font-semibold">
              {copied ? "Lien copié ✓" : "Copier le lien de partage"}
            </button>
            <p className="mt-2 text-center text-xs text-[color:var(--text-soft)]">
              {configured
                ? "Partagez ce code, vos amis rejoignent le salon d'attente."
                : "Le salon d'attente s'ouvrira dès que le serveur en ligne sera branché."}
            </p>
          </div>
        ) : (
          <button
            onClick={() => setCode(generateRoomCode())}
            className="mt-3 tap w-full rounded-2xl bg-gold py-3.5 font-bold text-felt-deep shadow-glow active:scale-[0.98] transition-transform"
          >
            Générer un code
          </button>
        )}
      </div>

      {/* Rejoindre */}
      <div className="mt-4 rounded-2xl panel p-4">
        <h2 className="font-display text-lg font-bold">Rejoindre par code</h2>
        <div className="mt-3 flex gap-2">
          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 5))}
            placeholder="REMIX"
            className="flex-1 rounded-xl panel-soft px-3 py-3 text-center text-xl font-bold tracking-[0.3em] outline-none"
            autoComplete="off"
          />
          <button
            disabled={joinCode.length < 5}
            className="tap rounded-xl bg-gold px-5 font-bold text-felt-deep disabled:opacity-40"
          >
            OK
          </button>
        </div>
        {!configured && (
          <p className="mt-2 text-xs text-[color:var(--text-soft)]">
            La connexion en temps réel s'active une fois le serveur branché (voir ci-dessus).
          </p>
        )}
      </div>

      <div className="mt-6 rounded-2xl panel-soft p-4 text-sm text-[color:var(--text-soft)]">
        <div className="font-semibold text-[color:var(--text)]">Comment ça marchera</div>
        <ul className="mt-1 list-inside list-disc space-y-1">
          <li>L'hôte fait tourner la partie et diffuse l'état ; vos cartes restent privées.</li>
          <li>L'hôte peut ajouter des bots pour compléter à 2-6 joueurs.</li>
          <li>Reconnexion automatique ; un bot remplace un joueur déconnecté.</li>
          <li>Petits émojis (👏 😱 ⏳) pour réagir, sans chat texte.</li>
        </ul>
      </div>
    </main>
  );
}
