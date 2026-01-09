"use client";

import React from "react";
import { useCapabilities } from "@/hooks/useCapabilities";
import TabBar from "@/components/navigation/TabBar";
import MobileHeader from "../navigation/MobileHeader";
import DesktopHeader from "@/components/navigation/DesktopHeader";

interface PageShellProps {
  children: React.ReactNode;
}

export default function PageShell({ children }: PageShellProps) {
  const { isDemo } = useCapabilities();

  return (
    <div
      className="
        relative flex flex-col overflow-x-hidden
        min-h-[100dvh]
        [--app-header-h:60px]
        [--mobile-nav-h:80px]
      "
    >
      {/* {isDemo && (
        <div className="absolute w-20 z-50 px-4 py-2 text-xs text-center bg-(--warning-bg) text-(--text)]">
          Explore Mode — sign in to make changes.
        </div>
      )} */}

      <DesktopHeader />
      <MobileHeader />

      <div
        // id="app-scroll-container"
        className="
          w-full min-h-[calc(100dvh-var(--app-header-h))]
          bg-[#DADADA]
        "
        // -var(--mobile-nav-h)
        // md:h-[calc(100dvh-var(--app-header-h))]
      >
        {/* {children} */}
      </div>

      {/* <TabBar /> */}
    </div>
  );
}
