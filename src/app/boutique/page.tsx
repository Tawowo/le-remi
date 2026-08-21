"use client";

import Link from "next/link";
import { useState } from "react";
import { useProfile } from "@/components/economy/ProfileProvider";
import { CoinBalance } from "@/components/economy/CoinBalance";
import { Avatar } from "@/components/economy/Avatar";
import { Felt } from "@/components/cosmetics/Felt";
import { AvatarArt } from "@/components/cosmetics/AvatarArt";
import { PlayingCard } from "@/components/PlayingCard";
import {
  FELTS, BACKS, DECKS, AVATARS, FRAMES,
  AVATAR_SERIES_LABELS, isUnlockedByLevel,
} from "@/lib/cosmetics/catalog";
import {
  COLLECTION_LABEL, RARITY_LABEL, RARITY_COLOR,
  type Collection, type Mood, type Rarity,
} from "@/lib/cosmetics/types";
import { debit, grantCosmetic, equip, setAvatar } from "@/lib/economy/profileStore";
import type { FeltDef } from "@/lib/cosmetics/types";

type Rayon = "felt" | "avatar" | "back" | "deck" | "frame";
const RAYONS: [Rayon, string][] = [
  ["felt", "Tapis"],
  ["avatar", "Avatars"],
  ["back", "Dos"],
  ["deck", "Jeux"],
  ["frame", "Cadres"],
];

export default function ShopPage() {
  const { profile, mutate } = useProfile();
  const [rayon, setRayon] = useState<Rayon>("felt");
  const [previewFelt, setPreviewFelt] = useState<FeltDef | null>(null);

  const owns = (id: string) => profile.owned.includes(id);

  const buy = (id: string, price: number) => {
    if (owns(id) || profile.coins < price) return;
    mutate((p) => grantCosmetic(debit(p, price, `Boutique : ${id}`), id));
  };
  const equipCosmetic = (type: "back" | "felt" | "deck" | "frame", id: string) => mutate((p) => equip(p, type, id));
  const equipAvatar = (id: string) => mutate((p) => setAvatar(p, id));

  const total = { felt: FELTS.length, avatar: AVATARS.length, back: BACKS.length, deck: DECKS.length, frame: FRAMES.length };
  const ownedCount = (cat: Rayon) => {
    const list = cat === "felt" ? FELTS : cat === "avatar" ? AVATARS : cat === "back" ? BACKS : cat === "deck" ? DECKS : FRAMES;
    return list.filter((c) => owns(c.id)).length;
  };

  return (
    <main className="mx-auto min-h-app max-w-md px-4 safe-top safe-bottom pt-2">
      <header className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="tap flex items-center rounded-full panel px-3 text-lg" aria-label="Retour">←</Link>
          <h1 className="text-2xl font-display font-bold">Boutique</h1>
        </div>
        <CoinBalance coins={profile.coins} size="sm" />
      </header>

      {/* Rayons */}
      <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1">
        {RAYONS.map(([r, label]) => (
          <button
            key={r}
            onClick={() => setRayon(r)}
            className={`tap shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold ${rayon === r ? "bg-gold text-felt-deep" : "panel"}`}
          >
            {label} <span className="opacity-70">{ownedCount(r)}/{total[r]}</span>
          </button>
        ))}
      </div>

      {rayon === "felt" && (
        <FeltRayon
          profile={profile}
          owns={owns}
          onPreview={setPreviewFelt}
        />
      )}

      {rayon === "avatar" && (
        <div className="grid grid-cols-3 gap-2.5">
          {AVATARS.map((a) => (
            <Tile
              key={a.id}
              name={a.name}
              rarity={a.rarity}
              price={a.price}
              owned={owns(a.id)}
              equipped={profile.avatar === a.id}
              locked={!isUnlockedByLevel(a, profile.level)}
              lockLabel={a.unlock?.level ? `Niv. ${a.unlock.level}` : undefined}
              affordable={profile.coins >= a.price}
              onBuy={() => buy(a.id, a.price)}
              onEquip={() => equipAvatar(a.id)}
              thumb={<div className="overflow-hidden rounded-lg"><AvatarArt id={a.id} size={92} /></div>}
              subtitle={AVATAR_SERIES_LABELS[a.series]}
            />
          ))}
        </div>
      )}

      {rayon === "back" && (
        <div className="grid grid-cols-3 gap-2.5">
          {BACKS.map((b) => (
            <Tile
              key={b.id}
              name={b.name}
              rarity={b.rarity}
              price={b.price}
              owned={owns(b.id)}
              equipped={profile.equipped.back === b.id}
              locked={!isUnlockedByLevel(b, profile.level)}
              lockLabel={b.unlock?.level ? `Niv. ${b.unlock.level}` : undefined}
              affordable={profile.coins >= b.price}
              onBuy={() => buy(b.id, b.price)}
              onEquip={() => equipCosmetic("back", b.id)}
              thumb={<div className="flex justify-center"><PlayingCard rank="A" suit="spades" width={54} faceDown backId={b.id} /></div>}
              subtitle={COLLECTION_LABEL[b.collection]}
            />
          ))}
        </div>
      )}

      {rayon === "deck" && (
        <div className="grid grid-cols-2 gap-2.5">
          {DECKS.map((d) => (
            <Tile
              key={d.id}
              name={d.name}
              rarity={d.rarity}
              price={d.price}
              owned={owns(d.id)}
              equipped={profile.equipped.deck === d.id}
              locked={!isUnlockedByLevel(d, profile.level)}
              lockLabel={d.unlock?.level ? `Niv. ${d.unlock.level}` : undefined}
              affordable={profile.coins >= d.price}
              onBuy={() => buy(d.id, d.price)}
              onEquip={() => equipCosmetic("deck", d.id)}
              thumb={
                <div className="flex justify-center gap-1">
                  <PlayingCard rank="K" suit="hearts" width={44} deck={d.id} />
                  <PlayingCard rank="7" suit="spades" width={44} deck={d.id} />
                </div>
              }
              subtitle="Lisibilité garantie"
            />
          ))}
        </div>
      )}

      {rayon === "frame" && (
        <div className="grid grid-cols-3 gap-2.5">
          {FRAMES.map((f) => (
            <Tile
              key={f.id}
              name={f.name}
              rarity={f.rarity}
              price={f.price}
              owned={owns(f.id)}
              equipped={profile.equipped.frame === f.id}
              locked={!isUnlockedByLevel(f, profile.level)}
              lockLabel={f.unlock?.level ? `Niv. ${f.unlock.level}` : undefined}
              affordable={profile.coins >= f.price}
              onBuy={() => buy(f.id, f.price)}
              onEquip={() => equipCosmetic("frame", f.id)}
              thumb={<div className="flex justify-center py-1"><Avatar avatar={profile.avatar} color={profile.color} frame={f.id} size={64} /></div>}
            />
          ))}
        </div>
      )}

      {previewFelt && (
        <FeltPreview
          felt={previewFelt}
          profile={profile}
          owned={owns(previewFelt.id)}
          equipped={profile.equipped.felt === previewFelt.id}
          locked={!isUnlockedByLevel(previewFelt, profile.level) || !!previewFelt.unlock?.exploit}
          onBuy={() => buy(previewFelt.id, previewFelt.price)}
          onEquip={() => { equipCosmetic("felt", previewFelt.id); setPreviewFelt(null); }}
          onClose={() => setPreviewFelt(null)}
        />
      )}
    </main>
  );
}

function FeltRayon({
  profile,
  owns,
  onPreview,
}: {
  profile: { level: number; equipped: { felt: string } };
  owns: (id: string) => boolean;
  onPreview: (f: FeltDef) => void;
}) {
  const [collection, setCollection] = useState<Collection | "toutes">("toutes");
  const [mood, setMood] = useState<Mood | "tous">("tous");

  const collections: (Collection | "toutes")[] = ["toutes", "classique", "prestige", "cosmos", "neon", "nature", "legende"];
  const moods: (Mood | "tous")[] = ["tous", "calme", "anime", "sombre", "clair"];

  const list = FELTS.filter(
    (f) => (collection === "toutes" || f.collection === collection) && (mood === "tous" || f.moods.includes(mood)),
  );

  return (
    <div>
      <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1">
        {collections.map((c) => (
          <button key={c} onClick={() => setCollection(c)} className={`tap shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${collection === c ? "bg-gold text-felt-deep" : "panel-soft"}`}>
            {c === "toutes" ? "Toutes" : COLLECTION_LABEL[c]}
          </button>
        ))}
      </div>
      <div className="mb-3 flex gap-1.5">
        {moods.map((m) => (
          <button key={m} onClick={() => setMood(m)} className={`tap rounded-full px-3 py-1 text-xs ${mood === m ? "bg-ivory/20 font-semibold" : "panel-soft"}`}>
            {m === "tous" ? "Tous" : m[0].toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {list.map((f) => {
          const locked = !isUnlockedByLevel(f, profile.level) || !!f.unlock?.exploit;
          return (
            <button key={f.id} onClick={() => onPreview(f)} className="rounded-2xl panel p-2 text-left">
              <div className="relative h-24 w-full overflow-hidden rounded-xl">
                <Felt id={f.id} />
                <span className="absolute right-1 top-1 rounded-full px-1.5 py-0.5 text-[0.6rem] font-bold" style={{ background: RARITY_COLOR[f.rarity], color: "#0a1a12" }}>
                  {RARITY_LABEL[f.rarity]}
                </span>
                {profile.equipped.felt === f.id && (
                  <span className="absolute left-1 top-1 rounded-full bg-gold px-1.5 py-0.5 text-[0.6rem] font-bold text-felt-deep">Équipé</span>
                )}
              </div>
              <div className="mt-1.5 flex items-center justify-between">
                <span className="truncate text-sm font-semibold">{f.name}</span>
              </div>
              <div className="text-xs text-[color:var(--text-soft)]">
                {owns(f.id) ? "Possédé" : locked ? (f.unlock?.exploit ? "Exploit" : `Niv. ${f.unlock?.level}`) : `🪙 ${f.price}`}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FeltPreview({
  felt, profile, owned, equipped, locked, onBuy, onEquip, onClose,
}: {
  felt: FeltDef;
  profile: { coins: number; avatar: string; color: string; equipped: { deck: string; back: string } };
  owned: boolean;
  equipped: boolean;
  locked: boolean;
  onBuy: () => void;
  onEquip: () => void;
  onClose: () => void;
}) {
  const affordable = profile.coins >= felt.price;
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[color:var(--bg)]/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 safe-top safe-bottom pt-2">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-display font-bold">{felt.name}</h2>
          <button onClick={onClose} className="tap rounded-full panel px-3 text-lg" aria-label="Fermer">✕</button>
        </div>

        {/* Aperçu EN SITUATION : vraie mini-table avec cartes posées */}
        <div className="relative flex-1 overflow-hidden rounded-2xl">
          <Felt id={felt.id} />
          <div className="relative z-10 flex h-full flex-col items-center justify-between p-4">
            <div className="flex items-center gap-2 self-start rounded-full bg-black/30 px-2 py-1">
              <Avatar avatar={profile.avatar} color={profile.color} size={28} />
              <span className="text-sm text-ivory">Aperçu</span>
            </div>
            <div className="flex items-center gap-3">
              <PlayingCard rank="A" suit="spades" width={54} faceDown backId={profile.equipped.back} />
              <PlayingCard rank="K" suit="hearts" width={54} deck={profile.equipped.deck} />
            </div>
            <div className="flex items-end justify-center" style={{ paddingLeft: 22 }}>
              {(["7", "8", "9", "Q"] as const).map((r, i) => (
                <span key={r} style={{ marginLeft: -22, zIndex: i }}>
                  <PlayingCard rank={r} suit={i % 2 ? "hearts" : "spades"} width={46} deck={profile.equipped.deck} />
                </span>
              ))}
            </div>
          </div>
          <span className="absolute right-2 top-2 z-10 rounded-full px-2 py-0.5 text-xs font-bold" style={{ background: RARITY_COLOR[felt.rarity], color: "#0a1a12" }}>
            {RARITY_LABEL[felt.rarity]}
          </span>
        </div>

        <div className="mt-3">
          {owned ? (
            <button onClick={onEquip} className={`tap w-full rounded-2xl py-3.5 font-bold ${equipped ? "panel-soft" : "bg-gold text-felt-deep"}`}>
              {equipped ? "Équipé ✓" : "Équiper"}
            </button>
          ) : locked ? (
            <div className="rounded-2xl panel-soft py-3.5 text-center text-sm text-[color:var(--text-soft)]">
              {felt.unlock?.exploit ? `🔒 ${felt.unlock.exploit}` : `🔒 Niveau ${felt.unlock?.level} requis`}
            </div>
          ) : (
            <button onClick={onBuy} disabled={!affordable} className="tap w-full rounded-2xl bg-gold py-3.5 font-bold text-felt-deep disabled:opacity-40">
              {affordable ? `Acheter — 🪙 ${felt.price}` : `Il te manque ${felt.price - profile.coins} 🪙`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Tile({
  name, subtitle, rarity, price, owned, equipped, locked, lockLabel, affordable, onBuy, onEquip, thumb,
}: {
  name: string;
  subtitle?: string;
  rarity: Rarity;
  price: number;
  owned: boolean;
  equipped: boolean;
  locked: boolean;
  lockLabel?: string;
  affordable: boolean;
  onBuy: () => void;
  onEquip: () => void;
  thumb: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl panel p-2">
      <div className="relative">
        {thumb}
        <span className="absolute right-0 top-0 rounded-full px-1.5 py-0.5 text-[0.55rem] font-bold" style={{ background: RARITY_COLOR[rarity], color: "#0a1a12" }}>
          {RARITY_LABEL[rarity]}
        </span>
      </div>
      <div className="mt-1.5 truncate text-sm font-semibold">{name}</div>
      {subtitle && <div className="truncate text-[0.65rem] text-[color:var(--text-soft)]">{subtitle}</div>}
      <div className="mt-1.5">
        {owned ? (
          <button onClick={onEquip} className={`tap w-full rounded-lg py-1.5 text-xs font-semibold ${equipped ? "bg-gold text-felt-deep" : "panel-soft"}`}>
            {equipped ? "Équipé ✓" : "Équiper"}
          </button>
        ) : locked ? (
          <div className="rounded-lg panel-soft py-1.5 text-center text-[0.65rem] text-[color:var(--text-soft)]">🔒 {lockLabel}</div>
        ) : (
          <button onClick={onBuy} disabled={!affordable} className="tap w-full rounded-lg bg-gold py-1.5 text-xs font-bold text-felt-deep disabled:opacity-40">
            {price === 0 ? "Gratuit" : `🪙 ${price}`}
          </button>
        )}
      </div>
    </div>
  );
}
