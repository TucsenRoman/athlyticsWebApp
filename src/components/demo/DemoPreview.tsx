"use client";

import { useEffect, useState } from "react";
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
/*  BEZELS                                                                    */
/* -------------------------------------------------------------------------- */
function BezelWrapper({ device, wrapperClass, children }) {
  if (device === "mobile") {
    return (
      <div className={`relative bg-black p-5 rounded-[3rem] shadow-2xl ${wrapperClass}`}>
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-b-3xl" />
        <div className="rounded-[2rem] overflow-hidden bg-neutral-900 border-[10px] border-black">
          {children}
        </div>
      </div>
    );
  }

  if (device === "tablet") {
    return (
      <div className={`relative bg-black p-4 rounded-[2.5rem] shadow-2xl ${wrapperClass}`}>
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-3 h-3 bg-neutral-700 rounded-full" />
        <div className="rounded-[2rem] overflow-hidden bg-neutral-900 border-[10px] border-black">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl bg-neutral-900 shadow-2xl border border-neutral-700 overflow-hidden ${wrapperClass}`}>
      <div className="flex items-center h-10 bg-neutral-800 px-4 border-b border-neutral-700">
        <div className="flex gap-2 mr-4">
          <div className="w-3 h-3 bg-red-500 rounded-full" />
          <div className="w-3 h-3 bg-yellow-500 rounded-full" />
          <div className="w-3 h-3 bg-green-500 rounded-full" />
        </div>
        <div className="flex-1 h-6 rounded-md bg-neutral-700/70 text-xs px-3 text-neutral-300 flex items-center">
          https://athlytics.app/demo
        </div>
      </div>
      <div className="bg-black">{children}</div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  DEMO PREVIEW COMPONENT                                                    */
/* -------------------------------------------------------------------------- */
export default function DemoAppPreview() {
  const [tab, setTab] = useState("fieldview");
  const [device, setDevice] = useState("mobile");
  const [viewport, setViewport] = useState("desktop");

  /* Detect viewport width */
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
  let allowedDevices = [];
  if (viewport === "mobile") allowedDevices = ["mobile"];
  else if (viewport === "tablet") allowedDevices = ["mobile", "tablet"];
  else allowedDevices = ["mobile", "tablet", "desktop"];

  /* Auto-correct selected device */
  useEffect(() => {
    if (!allowedDevices.includes(device)) {
      setDevice(allowedDevices[allowedDevices.length - 1]);
    }
  }, [viewport]);

  const { wrapper, screen } = DEVICE_STYLES[device];

  return (
    <DemoContext.Provider value={{ demoMode: true }}>
      <div className="flex flex-col items-center gap-6">

        {/* DEVICE SWITCHER — only render if >1 option */}
        {allowedDevices.length > 1 && (
          <div
            className="
              flex items-center
              bg-white/90 dark:bg-neutral-800/80
              backdrop-blur-md
              border border-neutral-300 dark:border-neutral-700
              rounded-full shadow-sm
              px-2 py-1.5
              text-sm font-medium
            "
          >
            {allowedDevices.map((d, i) => (
              <div key={d} className="flex items-center">
                <button
                  onClick={() => setDevice(d)}
                  className={`
                    px-4 py-1.5 rounded-full transition-all
                    ${
                      device === d
                        ? "bg-neutral-900 dark:bg-neutral-700 text-white"
                        : "text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white"
                    }
                  `}
                >
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>

                {i < allowedDevices.length - 1 && (
                  <span className="text-neutral-400 dark:text-neutral-500 mx-1">|</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* BEZEL + SCREEN */}
        <BezelWrapper device={device} wrapperClass={wrapper}>
          <div className={`${screen} overflow-hidden bg-neutral-100 dark:bg-neutral-900 flex flex-col`}>
            {/* Tabs */}
            <div className="flex items-center justify-center gap-6 h-14 bg-neutral-900 text-white font-semibold border-b border-neutral-800">
              <button
                onClick={() => setTab("fieldview")}
                className={`px-3 py-1 rounded-md ${tab === "fieldview" ? "bg-white text-black" : "text-white/70 hover:text-white"}`}
              >
                FieldView
              </button>

              <button
                onClick={() => setTab("ledger")}
                className={`px-3 py-1 rounded-md ${tab === "ledger" ? "bg-white text-black" : "text-white/70 hover:text-white"}`}
              >
                Ledger
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              {tab === "fieldview" ? <FieldViewScreen /> : <LedgerPage />}
            </div>
          </div>
        </BezelWrapper>

      </div>
    </DemoContext.Provider>
  );
}
