// src/features/program-cloak/RequireProgram.tsx
"use client";

import { ReactNode } from "react";
import { useProgramContext } from "./useProgramContext";
import { useDemo } from "@/contexts/DemoContext";

export default function RequireProgram({
  children,
}: {
  children: ReactNode;
}) {
  const { selectedProgramId, programs } = useProgramContext();
  const { demoMode } = useDemo();

  // Program selected → allow
  if (selectedProgramId) {
    return <>{children}</>;
  }

  // DEMO MODE:
  // Allow route to render, but block inner content
  if (demoMode) {
    return (
      <div className="flex h-full w-full items-center justify-center text-sm text-[var(--muted-foreground)]">
        Select a program to continue
      </div>
    );
  }

  // REAL MODE:
  // User is authenticated but has no program selected
  return (
    <div className="flex h-full w-full items-center justify-center text-sm text-[var(--muted-foreground)]">
      No program selected
    </div>
  );
}
