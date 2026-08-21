"use client";

import { PlayingCard, type Rank } from "@/components/PlayingCard";
import type { Card } from "@/lib/game/cards";
import { rankLabel } from "@/lib/game/cards";

/** Ma main en éventail tactile : tap pour sélectionner, combinaisons dorées. */
export function HandFan({
  cards,
  meldedIds,
  selectedId,
  onSelect,
  disabled = false,
}: {
  cards: Card[];
  meldedIds: Set<string>;
  selectedId: string | null;
  onSelect: (id: string) => void;
  disabled?: boolean;
}) {
  const n = cards.length;
  const spread = Math.min(4, 28 / Math.max(1, n)); // degrés par carte
  const mid = (n - 1) / 2;
  const overlap = n > 8 ? 30 : 22;

  return (
    <div className="flex justify-center pt-6" style={{ minHeight: 132 }}>
      <div className="flex items-end" style={{ paddingLeft: overlap }}>
        {cards.map((c, i) => {
          const rot = (i - mid) * spread;
          const selected = selectedId === c.id;
          const melded = meldedIds.has(c.id);
          return (
            <button
              key={c.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(c.id)}
              className="relative origin-bottom transition-transform"
              style={{
                marginLeft: -overlap,
                transform: `rotate(${rot}deg) translateY(${selected ? -18 : 0}px)`,
                zIndex: selected ? 100 : i,
              }}
              aria-label={`${rankLabel(c.rank)} — ${selected ? "sélectionnée" : "sélectionner"}`}
            >
              <span
                className={[
                  "block rounded-[10px]",
                  melded ? "ring-2 ring-gold shadow-glow" : "",
                  selected ? "ring-2 ring-ivory" : "",
                ].join(" ")}
              >
                <PlayingCard rank={rankLabel(c.rank) as Rank} suit={c.suit} width={54} />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
