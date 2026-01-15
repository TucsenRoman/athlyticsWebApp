"use client";

import React from "react";
import { useCapabilities } from "@/hooks/useCapabilities";
import TabBar from "@/components/navigation/TabBar";
import MobileHeader from "../navigation/MobileHeader";
import DesktopHeader from "@/components/navigation/DesktopHeader";
// import { UIPrefsProvider } from "@/contexts/UIPrefsContext";

interface PageShellProps {
  children: React.ReactNode;
}

export default function PageShell({ children }: PageShellProps) {
  const { isDemo } = useCapabilities();

  return (
    // <UIPrefsProvider>
      <div
        className="
          relative flex flex-col overflow-x-hidden
          min-h-[100dvh]
          [--app-header-h:60px]
          [--tab-bar-h:60px]
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
            w-full h-[calc(100dvh-var(--app-header-h))]
          "
          // h-[calc(100dvh-var(--app-header-h)-var(--tab-bar-h))]
          //   md:
        >
          {children}
        </div>

        <TabBar />
      </div>
    // </UIPrefsProvider>
  );
}
