// components/layout/MarketingShell.tsx
"use client";

import React from "react";
import AppHeader from "@/components/navigation/AppHeader";
import MobileNav from "@/components/navigation/MobileNav";
import { Divider } from "@/components/ui";

export default function MarketingPageShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-[100dvh] flex flex-col bg-[var(--gray-5)]">
      <AppHeader />
      <Divider thickness="1.5px" color="var(--gray-8)" inset={5} />

      {/* DOCUMENT FLOW — body scrolls naturally */}
      <main className="flex-1 pb-[60px] md:pb-0">
        {children}
      </main>

      {/* ~For testing. */}
      {/* <MobileNav /> */}
    </div>
  );
}
