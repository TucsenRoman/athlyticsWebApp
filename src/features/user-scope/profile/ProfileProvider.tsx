"use client";

import { createContext, useContext } from "react";
import { useProfile } from "./useProfile";

/* ========================================================================== */
/* CONTEXT                                                                    */
/* ========================================================================== */

const ProfileContext = createContext<ReturnType<typeof useProfile> | null>(null);

/* ========================================================================== */
/* PROVIDER                                                                   */
/* ========================================================================== */

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const profileState = useProfile();

  return (
    <ProfileContext.Provider value={profileState}>
      {children}
    </ProfileContext.Provider>
  );
}

/* ========================================================================== */
/* CONSUMER HOOK                                                              */
/* ========================================================================== */

export function useProfileContext() {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error("useProfileContext must be used inside ProfileProvider");
  }
  return ctx;
}
