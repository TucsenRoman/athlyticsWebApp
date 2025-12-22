// src/contexts/DemoContext.tsx
"use client";

import { createContext, useContext, ReactNode, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface DemoContextType {
  demoMode: boolean;
}

const DemoContext = createContext<DemoContextType>({ demoMode: false });

export function DemoProvider({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  const demoMode = useMemo(() => {
    // demo = NOT logged in
    return !loading && !user;
  }, [loading, user]);

  return (
    <DemoContext.Provider value={{ demoMode }}>
      {children}
    </DemoContext.Provider>
  );
}

export const useDemo = () => useContext(DemoContext);
