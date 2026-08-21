"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { loadSettings, saveSettings } from "@/lib/storage";
import type { Settings, Theme } from "@/lib/types";

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  const update = (patch: Partial<Settings>) => {
    setSettings((s) => {
      const next = { ...(s as Settings), ...patch };
      saveSettings(next);
      if (patch.theme) document.documentElement.setAttribute("data-theme", patch.theme);
      if (patch.animations) document.documentElement.setAttribute("data-anim", patch.animations);
      return next;
    });
  };

  if (!settings) return null;

  return (
    <main className="mx-auto min-h-app max-w-md px-5 safe-top safe-bottom pt-2">
      <header className="mb-4 flex items-center gap-3">
        <Link href="/" className="tap flex items-center rounded-full panel px-3 text-lg" aria-label="Retour">
          ←
        </Link>
        <h1 className="text-2xl font-display font-bold">Réglages</h1>
      </header>

      <div className="flex flex-col gap-3">
        <Row label="Thème">
          <Segmented
            value={settings.theme}
            options={[["dark", "Sombre"], ["light", "Clair"]]}
            onChange={(v) => update({ theme: v as Theme })}
          />
        </Row>
        <Toggle label="Sons" desc="Carillons discrets aux moments clés" value={settings.sound} onChange={(v) => update({ sound: v })} />
        <Toggle label="Vibrations" desc="Retour haptique sur mobile" value={settings.vibration} onChange={(v) => update({ vibration: v })} />
        <Row label="Animations">
          <Segmented
            value={settings.animations}
            options={[["full", "Complètes"], ["reduced", "Réduites"]]}
            onChange={(v) => update({ animations: v as "full" | "reduced" })}
          />
        </Row>
      </div>

      <p className="mt-6 text-center text-xs text-[color:var(--text-soft)]">
        Le mode « animations réduites » économise la batterie et respecte les préférences système.
      </p>
    </main>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-2xl panel p-4">
      <span className="font-semibold">{label}</span>
      {children}
    </div>
  );
}

function Toggle({ label, desc, value, onChange }: { label: string; desc: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} className="tap flex items-center justify-between rounded-2xl panel p-4 text-left">
      <span>
        <span className="block font-semibold">{label}</span>
        <span className="block text-xs text-[color:var(--text-soft)]">{desc}</span>
      </span>
      <span className={`flex h-7 w-12 items-center rounded-full p-1 transition-colors ${value ? "bg-gold" : "panel-soft"}`}>
        <span className={`h-5 w-5 rounded-full bg-ivory transition-transform ${value ? "translate-x-5" : ""}`} />
      </span>
    </button>
  );
}

function Segmented({ value, options, onChange }: { value: string; options: [string, string][]; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-1 rounded-full panel-soft p-1">
      {options.map(([v, label]) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`tap rounded-full px-3 py-1.5 text-sm font-semibold ${value === v ? "bg-gold text-felt-deep" : ""}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
