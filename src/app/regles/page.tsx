"use client";

import Link from "next/link";
import { RulesContent, RULES_SECTIONS } from "@/components/rules/RulesContent";

export default function RulesPage() {
  return (
    <main className="mx-auto min-h-app max-w-md px-5 safe-top safe-bottom pt-2">
      <header className="mb-4 flex items-center gap-3">
        <Link href="/" className="tap flex items-center rounded-full panel px-3 text-lg" aria-label="Retour">
          ←
        </Link>
        <h1 className="text-2xl font-display font-bold">Les règles du Rémi</h1>
      </header>

      {/* Sommaire collant */}
      <nav className="sticky top-0 z-10 -mx-5 mb-2 bg-[color:var(--bg)]/90 px-5 py-2 backdrop-blur">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {RULES_SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="tap flex shrink-0 items-center whitespace-nowrap rounded-full panel px-3 text-xs font-semibold"
            >
              {s.title}
            </a>
          ))}
        </div>
      </nav>

      <RulesContent />

      <div className="py-8 text-center">
        <Link
          href="/nouvelle-partie"
          className="tap inline-flex rounded-2xl bg-gold px-6 py-3 font-bold text-felt-deep shadow-glow"
        >
          Lancer une partie
        </Link>
      </div>
    </main>
  );
}
