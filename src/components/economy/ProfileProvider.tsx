"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { defaultProfile, loadProfile, saveProfile, type Profile } from "@/lib/economy/profileStore";

interface Ctx {
  profile: Profile;
  ready: boolean;
  /** Applique un mutateur pur (p) => p, persiste et rafraîchit. */
  mutate: (fn: (p: Profile) => Profile) => Profile;
  reload: () => void;
}

const ProfileContext = createContext<Ctx | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  // Init déterministe (identique au SSR) pour éviter tout mismatch d'hydratation ;
  // le vrai profil est chargé depuis localStorage après le montage.
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setProfile(loadProfile());
    setReady(true);
  }, []);

  const mutate = useCallback((fn: (p: Profile) => Profile) => {
    let updated: Profile;
    setProfile((prev) => {
      updated = fn(prev);
      saveProfile(updated);
      return updated;
    });
    // @ts-expect-error assigné dans le setter synchrone
    return updated;
  }, []);

  const reload = useCallback(() => setProfile(loadProfile()), []);

  return (
    <ProfileContext.Provider value={{ profile, ready, mutate, reload }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile(): Ctx {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile doit être utilisé dans un ProfileProvider");
  return ctx;
}
