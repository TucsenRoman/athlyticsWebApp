"use client";

import React from "react";
import MobilePageNav from "@/components/navigation/MobilePageNav";
import { useCapabilities } from "@/hooks/useCapabilities";

interface PageShellProps {
  children: React.ReactNode;
}

export default function PageShell({ children }: PageShellProps) {
  const { isDemo } = useCapabilities();

  return (
    <div className="flex flex-col h-screen">
      {/* Preview banner at top so it's immediately visible */}
      {isDemo && (
        <div className="w-full px-4 py-2 text-xs text-center bg-[var(--accent-bg)] text-[var(--accent)]">
          Preview mode — sign in to make changes
        </div>
      )}

      {/* Main scrollable content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {children}
      </div>

      {/* Mobile navigation stays fixed at bottom */}
      <MobilePageNav />
    </div>
  );
}
