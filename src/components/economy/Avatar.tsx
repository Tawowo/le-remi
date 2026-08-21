"use client";

import { cosmeticById } from "@/lib/economy/config";

/** Avatar rond : emoji de galerie OU photo (data:URL), avec cadre équipé. */
export function Avatar({
  avatar,
  color,
  frame,
  size = 40,
  level,
}: {
  avatar: string;
  color: string;
  frame?: string | null;
  size?: number;
  level?: number;
}) {
  const isPhoto = avatar.startsWith("data:");
  const frameColor = frame ? cosmeticById(frame)?.swatch ?? "transparent" : "transparent";
  const ring = frame ? 3 : 0;

  return (
    <div className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      <div
        className="flex h-full w-full items-center justify-center overflow-hidden rounded-full"
        style={{
          background: isPhoto ? "#000" : color,
          boxShadow: ring ? `0 0 0 ${ring}px ${frameColor}` : undefined,
          fontSize: size * 0.55,
        }}
      >
        {isPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatar} alt="avatar" className="h-full w-full object-cover" />
        ) : (
          <span>{avatar}</span>
        )}
      </div>
      {level != null && (
        <span
          className="absolute -bottom-1 -right-1 flex items-center justify-center rounded-full bg-gold text-felt-deep font-bold"
          style={{ width: size * 0.42, height: size * 0.42, fontSize: size * 0.24 }}
        >
          {level}
        </span>
      )}
    </div>
  );
}
