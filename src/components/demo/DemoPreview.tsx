"use client";

import { useEffect, useState } from "react";
import {
  Smartphone,
  Tablet,
  Monitor,
  MapPinned,
  PencilRuler,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

import { DemoContext } from "@/contexts/DemoContext";

import FieldPage from "@/pages/FieldPage";
import WorkspacePage from "@/pages/WorkspacePage";
import DiscoveryPage from "@/pages/DiscoveryPage";

import BezelWrapper, { DemoDevice } from "./BezelWrapper";

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

type DemoTab = "field" | "workspace" | "discovery";

/* -------------------------------------------------------------------------- */
/* CONSTANTS                                                                  */
/* -------------------------------------------------------------------------- */

const DEVICE_STYLES: Record<
  DemoDevice,
  { wrapper: string; screen: string }
> = {
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

const TABS: {
  key: DemoTab;
  label: string;
  icon: any;
  component: JSX.Element;
}[] = [
  { key: "field", label: "Field", icon: MapPinned, component: <FieldPage /> },
  {
    key: "workspace",
    label: "Workspace",
    icon: PencilRuler,
    component: <WorkspacePage />,
  },
  {
    key: "discovery",
    label: "Discovery",
    icon: Sparkles,
    component: <DiscoveryPage />,
  },
];

/* -------------------------------------------------------------------------- */
/* GENERIC SELECTOR                                                           */
/* -------------------------------------------------------------------------- */

function Selector<T extends string>({
  items,
  active,
  onChange,
  renderIcon,
  renderLabel,
}: {
  items: readonly T[];
  active: T;
  onChange: (v: T) => void;
  renderIcon: (v: T) => any;
  renderLabel?: (v: T) => string;
}) {
  return (
    <div className="relative flex gap-2 overflow-hidden rounded-full">
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
        className="absolute inset-y-0 rounded-full bg-neutral-900/10 dark:bg-neutral-600/30"
        style={{
          width: `${100 / items.length}%`,
          left: `${(100 / items.length) * items.indexOf(active)}%`,
        }}
      />

      {items.map((item) => {
        const Icon = renderIcon(item);
        return (
          <button
            key={item}
            onClick={() => onChange(item)}
            className={`z-10 py-1 px-2 rounded-full flex items-center gap-2 transition-colors ${
              item === active
                ? "text-neutral-900 dark:text-white"
                : "text-neutral-600 dark:text-neutral-300"
            }`}
          >
            <Icon size={16} />
            {renderLabel && renderLabel(item)}
          </button>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* DEMO PREVIEW                                                              */
/* -------------------------------------------------------------------------- */

export default function DemoPreview() {
  const [tab, setTab] = useState<DemoTab>("field");
  const [device, setDevice] = useState<DemoDevice>("mobile");
  const [viewport, setViewport] = useState<DemoDevice>("desktop");

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
  const allowedDevices: DemoDevice[] =
    viewport === "mobile"
      ? ["mobile"]
      : viewport === "tablet"
      ? ["mobile", "tablet"]
      : ["mobile", "tablet", "desktop"];

  /* Clamp active device */
  useEffect(() => {
    if (!allowedDevices.includes(device)) {
      setDevice(allowedDevices[allowedDevices.length - 1]);
    }
  }, [viewport]);

  const { wrapper, screen } = DEVICE_STYLES[device];

  return (
    <DemoContext.Provider value={{ demoMode: true }}>
      <div className="flex flex-col items-center gap-6">
        {/* TOP BAR */}
        <div className="flex items-center gap-6 bg-white/90 dark:bg-neutral-800/80 backdrop-blur-md border border-neutral-300 dark:border-neutral-700 rounded-full shadow-sm px-6 py-2 text-sm font-medium">
          <Selector
            items={allowedDevices}
            active={device}
            onChange={setDevice}
            renderIcon={(d) =>
              d === "mobile" ? Smartphone : d === "tablet" ? Tablet : Monitor
            }
            renderLabel={(d) => d[0].toUpperCase() + d.slice(1)}
          />

          <div className="w-px h-6 bg-neutral-300 dark:bg-neutral-700" />

          <Selector
            items={TABS.map((t) => t.key)}
            active={tab}
            onChange={setTab}
            renderIcon={(key) => TABS.find((t) => t.key === key)!.icon}
            renderLabel={(key) =>
              TABS.find((t) => t.key === key)!.label
            }
          />
        </div>

        {/* PREVIEW */}
        <BezelWrapper device={device} wrapperClass={wrapper}>
          <div
            className={`${screen} bg-neutral-100 dark:bg-neutral-900 flex flex-col overflow-hidden`}
          >
            <div className="flex-1 overflow-auto">
              {TABS.find((t) => t.key === tab)?.component}
            </div>
          </div>
        </BezelWrapper>
      </div>
    </DemoContext.Provider>
  );
}
