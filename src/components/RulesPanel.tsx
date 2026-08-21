"use client";

import { RulesContent } from "./rules/RulesContent";

/** Panneau de règles ouvert en cours de partie, sans quitter la table. */
export function RulesPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 flex h-app flex-col bg-[color:var(--bg)]/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col overflow-hidden px-5 safe-top safe-bottom pt-2">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xl font-display font-bold">Les règles</h2>
          <button onClick={onClose} className="tap rounded-full panel px-3 text-lg" aria-label="Fermer les règles">
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto pb-8">
          <RulesContent />
        </div>
      </div>
    </div>
  );
}
