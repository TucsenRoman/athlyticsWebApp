"use client";

import { createContext, useContext, useState } from "react";

interface PushPanelContextValue {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const PushPanelContext = createContext<PushPanelContextValue | null>(null);

export function PushPanelProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <PushPanelContext.Provider value={{ open, setOpen }}>
      {children}
    </PushPanelContext.Provider>
  );
}

export function usePushPanel() {
  const ctx = useContext(PushPanelContext);
  if (!ctx) {
    throw new Error("usePushPanel must be used within PushPanelProvider");
  }
  return ctx;
}
