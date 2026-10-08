// src/components/demo/BezelWrapper.tsx
"use client";

import React from "react";

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

export type DemoDevice = "mobile" | "tablet" | "desktop";

interface BezelWrapperProps {
  device: DemoDevice;
  wrapperClass: string;
  children: React.ReactNode;
}

/* -------------------------------------------------------------------------- */
/* COMPONENT                                                                  */
/* -------------------------------------------------------------------------- */

export default function BezelWrapper({
  device,
  wrapperClass,
  children,
}: BezelWrapperProps) {
  const AddressBar = (
    <div className="flex items-center h-10 bg-neutral-800 px-4 border-b border-neutral-700">
      <div className="flex-1 h-6 rounded-md bg-neutral-700/70 text-xs px-3 text-neutral-300 flex items-center">
        https://athlytics.app/demo
      </div>
    </div>
  );

  if (device === "mobile") {
    return (
      <div
        className={`relative bg-black p-5 rounded-[3rem] shadow-2xl ${wrapperClass}`}
      >
        <span className="text-white">TRY IN REAL VIEW</span>
        {AddressBar}
        <div className="rounded-b-[2rem] overflow-hidden bg-neutral-900 border border-black border-t-0">
          {children}
        </div>
      </div>
    );
  }

  if (device === "tablet") {
    return (
      <div
        className={`relative bg-black p-4 rounded-[2.5rem] shadow-2xl ${wrapperClass}`}
      >
        {AddressBar}
        <div className="rounded-b-[2rem] overflow-hidden bg-neutral-900 border border-black border-t-0">
          {children}
        </div>
      </div>
    );
  }

  // desktop
  return (
    <div
      className={`rounded-xl bg-neutral-900 shadow-2xl border border-neutral-700 overflow-hidden ${wrapperClass}`}
    >
      {AddressBar}
      <div className="bg-black">{children}</div>
    </div>
  );
}
