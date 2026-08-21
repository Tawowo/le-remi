"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TableGame } from "@/components/table/TableGame";
import { loadCurrentPlay, type PlaySession } from "@/lib/playStore";

export default function TablePage() {
  const router = useRouter();
  const [session, setSession] = useState<PlaySession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSession(loadCurrentPlay());
    setReady(true);
  }, []);

  if (ready && !session) {
    return (
      <main className="mx-auto flex min-h-app max-w-md flex-col items-center justify-center px-5 text-center safe-top safe-bottom">
        <p className="mb-4 text-lg">Aucune partie jouable en cours.</p>
        <button
          onClick={() => router.push("/jouer")}
          className="tap rounded-2xl bg-gold px-6 py-3 font-bold text-felt-deep"
        >
          Jouer contre l'ordinateur
        </button>
      </main>
    );
  }

  if (!session) return null;
  return <TableGame session={session} />;
}
