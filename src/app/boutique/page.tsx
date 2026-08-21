"use client";

import Link from "next/link";
import { useState } from "react";
import { useProfile } from "@/components/economy/ProfileProvider";
import { CoinBalance } from "@/components/economy/CoinBalance";
import { SHOP, cosmeticById, type Cosmetic, type CosmeticType } from "@/lib/economy/config";
import { debit, grantCosmetic, equip } from "@/lib/economy/profileStore";

const TYPE_LABEL: Record<CosmeticType, string> = {
  back: "Dos de cartes",
  felt: "Tapis",
  frame: "Cadres d'avatar",
  avatarpack: "Packs d'avatars",
};

export default function ShopPage() {
  const { profile, mutate } = useProfile();
  const [preview, setPreview] = useState<Cosmetic | null>(null);

  const buy = (c: Cosmetic) => {
    if (profile.owned.includes(c.id) || profile.coins < c.price) return;
    mutate((p) => {
      const debited = debit(p, c.price, `Boutique : ${c.label}`);
      return grantCosmetic(debited, c.id);
    });
  };

  const doEquip = (c: Cosmetic) => {
    if (c.type === "avatarpack") return;
    const type = c.type; // 'back' | 'felt' | 'frame'
    mutate((p) => equip(p, type, c.id));
  };

  const equippedBack = cosmeticById(profile.equipped.back);
  const equippedFelt = cosmeticById(profile.equipped.felt);
  const shown = preview ?? null;

  const byType = (t: CosmeticType) => SHOP.filter((c) => c.type === t);

  return (
    <main className="mx-auto min-h-app max-w-md px-5 safe-top safe-bottom pt-2">
      <header className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="tap flex items-center rounded-full panel px-3 text-lg" aria-label="Retour">
            ←
          </Link>
          <h1 className="text-2xl font-display font-bold">Boutique</h1>
        </div>
        <CoinBalance coins={profile.coins} size="sm" />
      </header>

      {/* Aperçu mini-table */}
      <div
        className="mb-5 flex h-28 items-center justify-center rounded-2xl border border-[color:var(--border)]"
        style={{ background: (shown?.type === "felt" ? shown.swatch : equippedFelt?.swatch) ?? "#0f2e24" }}
      >
        <div
          className="h-20 w-14 rounded-lg shadow-card ring-1 ring-black/30"
          style={{ background: (shown?.type === "back" ? shown.swatch : equippedBack?.swatch) ?? "#14402f" }}
        />
        <div className="ml-3 text-xs text-ivory/80">
          {shown ? `Aperçu : ${shown.label}` : "Aperçu de ta table"}
        </div>
      </div>

      {(Object.keys(TYPE_LABEL) as CosmeticType[]).map((t) => (
        <section key={t} className="mb-5">
          <h2 className="mb-2 font-display text-lg font-bold">{TYPE_LABEL[t]}</h2>
          <div className="grid grid-cols-2 gap-2.5">
            {byType(t).map((c) => {
              const owned = profile.owned.includes(c.id);
              const equipped =
                (c.type === "back" && profile.equipped.back === c.id) ||
                (c.type === "felt" && profile.equipped.felt === c.id) ||
                (c.type === "frame" && profile.equipped.frame === c.id);
              const affordable = profile.coins >= c.price;
              return (
                <div
                  key={c.id}
                  onMouseEnter={() => setPreview(c)}
                  onClick={() => setPreview(c)}
                  className="rounded-2xl panel p-2.5"
                >
                  <div className="h-16 w-full rounded-lg" style={{ background: c.swatch }} />
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-semibold">{c.label}</span>
                  </div>
                  <div className="mt-1">
                    {owned ? (
                      c.type === "avatarpack" ? (
                        <span className="block rounded-lg panel-soft py-1.5 text-center text-xs text-gold">Possédé</span>
                      ) : (
                        <button
                          onClick={() => doEquip(c)}
                          className={`tap w-full rounded-lg py-1.5 text-center text-xs font-semibold ${
                            equipped ? "bg-gold text-felt-deep" : "panel-soft"
                          }`}
                        >
                          {equipped ? "Équipé ✓" : "Équiper"}
                        </button>
                      )
                    ) : (
                      <button
                        onClick={() => buy(c)}
                        disabled={!affordable}
                        className="tap w-full rounded-lg bg-gold py-1.5 text-center text-xs font-bold text-felt-deep disabled:opacity-40"
                      >
                        {c.price === 0 ? "Gratuit" : `🪙 ${c.price}`}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </main>
  );
}
