"use client";

import React from "react";
import { useCapabilities } from "@/hooks/useCapabilities";
import MobileNav from "@/components/navigation/MobileNav";
import AppHeader from "@/components/navigation/AppHeader";
import { Divider } from "../ui";

interface PageShellProps {
  children: React.ReactNode;
}

export default function PageShell({ children }: PageShellProps) {
  const { isDemo } = useCapabilities();

  return (
    <div
      className="
        relative flex flex-col overflow-hidden
        min-h-[100dvh]

        /* layout tokens */
        [--app-header-h:56px]
        [--mobile-nav-h:60px]

        bg-[var(--gray-5)]
      "
    >
      {/* {isDemo && (
        <div className="absolute w-20 z-50 px-4 py-2 text-xs text-center bg-(--warning-bg) text-(--text)]">
          Explore Mode — sign in to make changes.
        </div>
      )} */}

      <AppHeader />

      <Divider thickness="1.5px" color="var(--gray-8)" inset={1}/>

      <div
        id="app-scroll-container"
        className="
          w-full overflow-hidden
          bg-[var(--gray-5)]

          /* remaining viewport after header + nav */
          h-[calc(100dvh-var(--app-header-h)-var(--mobile-nav-h))]
          md:h-[calc(100dvh-var(--app-header-h))]
        "
      >
        {children}
      </div>

      <MobileNav />
    </div>
  );
}
