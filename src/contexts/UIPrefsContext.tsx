"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type DockSide = "left" | "right";

type UIPrefsValue = {
  dockSide: DockSide;
  setDockSide: (side: DockSide) => void;
  toggleDockSide: () => void;
};

const UIPrefsContext = createContext<UIPrefsValue | null>(null);

const STORAGE_KEY = "athlytics:ui:dockSide";

export function UIPrefsProvider({ children }: { children: React.ReactNode }) {
  const [dockSide, setDockSide] = useState<DockSide>(() => {
    // default to "right" (current behavior)
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw === "left" || raw === "right" ? raw : "right";
    } catch {
      return "right";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, dockSide);
    } catch {
      /* ignore */
    }
  }, [dockSide]);

  const value = useMemo<UIPrefsValue>(() => {
    return {
      dockSide,
      setDockSide,
      toggleDockSide: () => setDockSide((s) => (s === "right" ? "left" : "right")),
    };
  }, [dockSide]);

  return <UIPrefsContext.Provider value={value}>{children}</UIPrefsContext.Provider>;
}

export function useUIPrefs() {
  const ctx = useContext(UIPrefsContext);
  if (!ctx) throw new Error("useUIPrefs must be used within UIPrefsProvider");
  return ctx;
}
