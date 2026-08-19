"use client";

import { useEffect, useState } from "react";
import { loadSettings, saveSettings } from "@/lib/storage";
import type { Theme } from "@/lib/types";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    setTheme(loadSettings().theme);
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    saveSettings({ ...loadSettings(), theme: next });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={`tap rounded-full panel px-3 text-lg active:scale-95 transition-transform ${className}`}
      aria-label={theme === "dark" ? "Passer en mode clair" : "Passer en mode sombre"}
      title="Changer de thème"
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
