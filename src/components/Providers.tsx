"use client";

import { ProfileProvider } from "./economy/ProfileProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return <ProfileProvider>{children}</ProfileProvider>;
}
