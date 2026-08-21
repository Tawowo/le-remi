"use client";

import { Odometer } from "@/components/Odometer";

export function CoinBalance({ coins, size = "md" }: { coins: number; size?: "sm" | "md" }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full panel px-3 ${
        size === "sm" ? "py-1 text-sm" : "py-1.5"
      }`}
    >
      <span className="text-gold">🪙</span>
      <span className="font-bold tnum text-gold">
        <Odometer value={coins} />
      </span>
    </span>
  );
}
