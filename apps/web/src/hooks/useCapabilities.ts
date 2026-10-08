/*
  useCapabilities.ts

  PURPOSE
  -------
  This hook centralizes all permission / capability logic for the app.

  Components should NEVER ask:
    - "is the user logged in?"
    - "is this demo mode?"

  Instead, they ask:
    - "canWrite?"
    - "canInstall?"
    - "isDemo?"

  This prevents logic drift and accidental privilege leaks.
*/

import { useAuth } from "@/contexts/AuthContext";
import { useDemo } from "@/contexts/DemoContext";

/* -------------------------------------------------------------------------- */
/* HOOK                                                                       */
/* -------------------------------------------------------------------------- */

export function useCapabilities() {
  /*
    user
    ----
    Represents an authenticated user.
    If null → guest.
  */
  const { user } = useAuth();

  /*
    demoMode
    --------
    True when the app is intentionally showing a preview / demo experience.
    Demo is ALWAYS read-only.
  */
  const { demoMode } = useDemo();

  /*
    Derived identity states
    -----------------------
    These are INTERNAL helpers.
    UI should not rely on them directly.
  */
  const isAuthed = !!user;
  const isDemo = demoMode && !user;

  /*
    Capability rules
    ----------------
    These rules define WHAT the user is allowed to do,
    not WHO they are.
  */
  return {
    /* Identity (safe to expose for UI hints) */
    isAuthed,
    isDemo,

    /* Capabilities */
    canRead: true,                 // Everyone can read
    canWrite: isAuthed,             // Writes require auth
    canInstall: isAuthed,           // Installing packages requires auth
    canComment: isAuthed,           // Social actions require auth
  };
}
