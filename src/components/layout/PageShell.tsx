"use client";

import React from "react";
import { useCapabilities } from "@/hooks/useCapabilities";
import MobileNav from "@/components/navigation/MobileNav";
import AppHeader from "@/components/navigation/AppHeader";

interface PageShellProps {
  children: React.ReactNode;
}

export default function PageShell({ children }: PageShellProps) {
  const { isDemo } = useCapabilities();

  return (
    <div className="relative flex flex-col h-screen">
      {/* {isDemo && (
        <div className="absolute w-20 z-50 px-4 py-2 text-xs text-center bg-(--warning-bg) text-(--text)]">
          Explore Mode — sign in to make changes.
        </div>
      )} */}

      <AppHeader />

      <div id="app-scroll-container" className="flex-1 w-full min-h-0 overflow-y-auto overflow-x-hidden">
        {children}
      </div>

      <MobileNav />
    </div>
  );
}
