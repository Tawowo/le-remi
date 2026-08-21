"use client";

import { useRef, useState } from "react";
import { useProfile } from "./ProfileProvider";
import { Avatar } from "./Avatar";
import { AvatarArt } from "@/components/cosmetics/AvatarArt";
import { AVATAR_GALLERY } from "@/lib/economy/profileStore";
import { DEFAULT_OWNED } from "@/lib/cosmetics/catalog";
import { AVATAR_COLORS } from "@/lib/table";

const FREE_AVATARS = DEFAULT_OWNED.filter((id) => id.startsWith("av-"));
import { STARTING_COINS } from "@/lib/economy/config";
import { Confetti } from "@/components/Confetti";

/** Onboarding première ouverture : pseudo → avatar → 500 pièces de bienvenue. */
export function Onboarding({ onDone }: { onDone: () => void }) {
  const { mutate } = useProfile();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [pseudo, setPseudo] = useState("");
  const [avatar, setAvatar] = useState(FREE_AVATARS[0] ?? AVATAR_GALLERY[0]);
  const [color, setColor] = useState(AVATAR_COLORS[0]);
  const fileRef = useRef<HTMLInputElement>(null);

  const importPhoto = async (file: File) => {
    try {
      const url = await downscaleImage(file, 128, 0.7);
      setAvatar(url);
    } catch {
      /* ignore */
    }
  };

  const finish = () => {
    mutate((p) => ({ ...p, onboarded: true, pseudo: pseudo.trim() || "Joueur", avatar, color }));
    onDone();
  };

  return (
    <div className="fixed inset-0 z-50 flex h-app flex-col bg-[color:var(--bg)]">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 safe-top safe-bottom">
        {step === 0 && (
          <div className="animate-slide-in-right">
            <h1 className="text-3xl font-display font-black">Bienvenue au Rémi 🂠</h1>
            <p className="mt-2 text-[color:var(--text-soft)]">Comment veux-tu qu'on t'appelle ?</p>
            <input
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              placeholder="Ton pseudo"
              maxLength={16}
              className="mt-4 w-full rounded-2xl panel px-4 py-4 text-xl outline-none"
              autoFocus
            />
            <button
              onClick={() => setStep(1)}
              disabled={!pseudo.trim()}
              className="mt-5 tap w-full rounded-2xl bg-gold py-4 text-lg font-bold text-felt-deep disabled:opacity-40"
            >
              Continuer
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="animate-slide-in-right">
            <h1 className="text-2xl font-display font-black">Choisis ton avatar</h1>
            <div className="mt-4 flex justify-center">
              <Avatar avatar={avatar} color={color} size={96} />
            </div>

            <div className="mt-4 grid grid-cols-4 gap-2">
              {FREE_AVATARS.map((id) => (
                <button
                  key={id}
                  onClick={() => setAvatar(id)}
                  className={`tap overflow-hidden rounded-xl ${avatar === id ? "ring-2 ring-gold" : ""}`}
                >
                  <AvatarArt id={id} size={64} />
                </button>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-6 gap-2">
              {AVATAR_GALLERY.map((a) => (
                <button
                  key={a}
                  onClick={() => setAvatar(a)}
                  className={`tap flex h-10 items-center justify-center rounded-xl text-xl ${
                    avatar === a ? "bg-gold" : "panel-soft"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
            <p className="mt-2 text-center text-xs text-[color:var(--text-soft)]">
              Débloque 30+ portraits illustrés dans la boutique.
            </p>

            <div className="mt-3 flex items-center gap-2">
              {AVATAR_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`h-8 w-8 rounded-full ${color === c ? "ring-2 ring-ivory" : ""}`}
                  style={{ background: c }}
                  aria-label="couleur"
                />
              ))}
            </div>

            <button
              onClick={() => fileRef.current?.click()}
              className="mt-3 tap w-full rounded-2xl panel-soft py-3 text-sm font-semibold"
            >
              📷 Importer une photo
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && importPhoto(e.target.files[0])}
            />

            <button
              onClick={() => setStep(2)}
              className="mt-4 tap w-full rounded-2xl bg-gold py-4 text-lg font-bold text-felt-deep"
            >
              C'est moi !
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-pop-gold text-center">
            <Confetti active count={120} />
            <div className="flex justify-center">
              <Avatar avatar={avatar} color={color} size={110} level={1} />
            </div>
            <h1 className="mt-4 text-2xl font-display font-black">Enchanté, {pseudo || "Joueur"} !</h1>
            <div className="mt-4 rounded-2xl bg-gold px-6 py-5 text-felt-deep">
              <div className="text-sm font-semibold">Cadeau de bienvenue</div>
              <div className="text-4xl font-black tnum">🪙 {STARTING_COINS}</div>
              <div className="text-sm">pièces pour commencer</div>
            </div>
            <button
              onClick={finish}
              className="mt-6 tap w-full rounded-2xl bg-gold py-4 text-lg font-bold text-felt-deep shadow-glow"
            >
              Jouer !
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/** Réduit et recadre (carré centré) une image en data:URL JPEG léger (≤ ~60 Ko). */
function downscaleImage(file: File, size: number, quality: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("no ctx"));
        const min = Math.min(img.width, img.height);
        const sx = (img.width - min) / 2;
        const sy = (img.height - min) / 2;
        ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
