"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { DemoContext } from "@/contexts/DemoContext";
import FieldViewScreen from "@/components/fieldview/FieldViewScreen";
import LedgerPage from "@/pages/LedgerPage";

/* -------------------------------------------------------------------------- */
/*  DEVICE STYLE MAP                                                          */
/* -------------------------------------------------------------------------- */
const DEVICE_STYLES = {
  mobile: {
    wrapper: "w-[380px] h-[780px]",
    screen: "w-[360px] h-[700px]",
  },
  tablet: {
    wrapper: "w-[820px] h-[1020px]",
    screen: "w-[760px] h-[900px]",
  },
  desktop: {
    wrapper: "w-[1200px] h-[820px]",
    screen: "w-full h-full",
  },
};

/* -------------------------------------------------------------------------- */
/*  BEZEL WRAPPER                                                             */
/* -------------------------------------------------------------------------- */
function BezelWrapper({ device, wrapperClass, children }) {
  if (device === "mobile") {
    return (
      <div className={`relative bg-black p-5 rounded-[3rem] shadow-2xl ${wrapperClass}`}>
        {/* URL BAR */}
        <div className="flex items-center h-10 bg-neutral-800 px-4 border-b border-neutral-700 rounded-t-[2rem]">
          <div className="flex-1 h-6 rounded-md bg-neutral-700/70 text-xs px-3 text-neutral-300 flex items-center">
            https://athlytics.app/demo
          </div>
        </div>

        {/* SCREEN */}
        <div className="rounded-b-[2rem] overflow-hidden bg-neutral-900 border border-black border-t-0">
          {children}
        </div>
      </div>
    );
  }

  if (device === "tablet") {
    return (
      <div className={`relative bg-black p-4 rounded-[2.5rem] shadow-2xl ${wrapperClass}`}>
        {/* URL BAR */}
        <div className="flex items-center h-10 bg-neutral-800 px-4 border-b border-neutral-700 rounded-t-[2rem]">
          <div className="flex-1 h-6 rounded-md bg-neutral-700/70 text-xs px-3 text-neutral-300 flex items-center">
            https://athlytics.app/demo
          </div>
        </div>

        {/* SCREEN */}
        <div className="rounded-b-[2rem] overflow-hidden bg-neutral-900 border border-black border-t-0">
          {children}
        </div>
      </div>
    );
  }

  /* DESKTOP */
  return (
    <div className={`rounded-xl bg-neutral-900 shadow-2xl border border-neutral-700 overflow-hidden ${wrapperClass}`}>
      {/* URL BAR */}
      <div className="flex items-center h-10 bg-neutral-800 px-4 border-b border-neutral-700">
        <div className="flex-1 h-6 rounded-md bg-neutral-700/70 text-xs px-3 text-neutral-300 flex items-center">
          https://athlytics.app/demo
        </div>
      </div>

      <div className="bg-black">{children}</div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  DEMO PREVIEW                                                              */
/* -------------------------------------------------------------------------- */
export default function DemoAppPreview() {
  const [tab, setTab] = useState("fieldview");
  const [device, setDevice] = useState("mobile");
  const [viewport, setViewport] = useState("desktop");

  /* Viewport detection */
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;

      if (w < 768) setViewport("mobile");
      else if (w < 1024) setViewport("tablet");
      else setViewport("desktop");
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  /* Allowed devices */
  let allowedDevices: string[] = [];
  if (viewport === "mobile") allowedDevices = ["mobile"];
  else if (viewport === "tablet") allowedDevices = ["mobile", "tablet"];
  else allowedDevices = ["mobile", "tablet", "desktop"];

  /* Fix invalid selected device */
  useEffect(() => {
    if (!allowedDevices.includes(device)) {
      setDevice(allowedDevices[allowedDevices.length - 1]);
    }
  }, [viewport]);

  const { wrapper, screen } = DEVICE_STYLES[device];

  return (
    <DemoContext.Provider value={{ demoMode: true }}>
      <div className="flex flex-col items-center gap-6">

        {/* ------------------------------------------------------------------ */}
        {/*  TOP CONTROL BAR WITH PERFECT SLIDING PILLS                       */}
        {/* ------------------------------------------------------------------ */}
        <div
          className="
            flex items-center gap-6
            bg-white/90 dark:bg-neutral-800/80
            backdrop-blur-md
            border border-neutral-300 dark:border-neutral-700
            rounded-full shadow-sm
            px-6 py-2
            text-sm font-medium
          "
        >

          {/* ---------------- DEVICE SELECTOR ---------------- */}
          <div className="relative w-[200px]">
            <div className="relative flex w-full overflow-hidden rounded-full">

              {/* Sliding Pill */}
              <motion.div
                layout
                transition={{ type: "spring", stiffness: 260, damping: 26 }}
                className="absolute top-0 bottom-0 rounded-full bg-neutral-900/10 dark:bg-neutral-600/30"
                style={{
                  width: `${100 / allowedDevices.length}%`,
                  left: `${(100 / allowedDevices.length) * allowedDevices.indexOf(device)}%`,
                }}
              />

              {allowedDevices.map((d) => (
                <button
                  key={d}
                  onClick={() => setDevice(d)}
                  className={`
                    flex-1 z-10 py-1 text-center rounded-full transition-colors
                    ${
                      device === d
                        ? "text-neutral-900 dark:text-white"
                        : "text-neutral-600 dark:text-neutral-300"
                    }
                  `}
                >
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-neutral-300 dark:bg-neutral-700" />

          {/* ---------------- TAB SELECTOR ---------------- */}
          <div className="relative w-[160px]">
            <div className="relative flex w-full overflow-hidden rounded-full">

              {/* Sliding Pill */}
              <motion.div
                layout
                transition={{ type: "spring", stiffness: 260, damping: 26 }}
                className="absolute top-0 bottom-0 rounded-full bg-neutral-900/10 dark:bg-neutral-600/30"
                style={{
                  width: "50%",
                  left: tab === "fieldview" ? "0%" : "50%",
                }}
              />

              <button
                onClick={() => setTab("fieldview")}
                className={`
                  flex-1 z-10 py-1 text-center rounded-full
                  ${
                    tab === "fieldview"
                      ? "text-neutral-900 dark:text-white"
                      : "text-neutral-600 dark:text-neutral-300"
                  }
                `}
              >
                FieldView
              </button>

              <button
                onClick={() => setTab("ledger")}
                className={`
                  flex-1 z-10 py-1 text-center rounded-full
                  ${
                    tab === "ledger"
                      ? "text-neutral-900 dark:text-white"
                      : "text-neutral-600 dark:text-neutral-300"
                  }
                `}
              >
                Ledger
              </button>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/*  BEZEL + SCREEN                                                    */}
        {/* ------------------------------------------------------------------ */}
        <BezelWrapper device={device} wrapperClass={wrapper}>
          <div
            className={`${screen} bg-neutral-100 dark:bg-neutral-900 flex flex-col overflow-hidden`}
          >
            <div className="flex-1 overflow-auto">
              {tab === "fieldview" ? <FieldViewScreen /> : <LedgerPage />}
            </div>
          </div>
        </BezelWrapper>
      </div>
    </DemoContext.Provider>
  );
}
