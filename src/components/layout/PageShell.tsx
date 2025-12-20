"use client";

import React from "react";
import MainHeader from "@/components/navigation/MainHeader";
import MobilePageNav from "@/components/navigation/MobilePageNav";

interface PageShellProps {
  children: React.ReactNode;
}

export default function PageShell({ children }: PageShellProps) {
  return (
    <div className="flex flex-col h-screen">
      {/* <MainHeader /> */}

      <div className="min-h-0">
        {children}
      </div>

      <MobilePageNav />
    </div>
  );
}
