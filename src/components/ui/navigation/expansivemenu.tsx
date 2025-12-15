"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/actions/button";
import { ChevronLeft } from "lucide-react";

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

export type ExpansionType = "line" | "circle" | "arch" | "layeredArch";
export type ExpansionDirection = "up" | "down" | "left" | "right";
export type DefaultState = "open" | "closed" | "adapt";

export type Flavor =
  | "blue"
  | "purple"
  | "yellow"
  | "coral"
  | "green"
  | "indigo"
  | "red"
  | "teal"
  | "slate";

export interface ExpansiveMenuItem {
  id?: string;
  label: string;
  icon: React.ReactNode;
  action?: () => void;
  destructive?: boolean;
  flavor?: Flavor;
  children?: ExpansiveMenuItem[];
}

export interface LayeredArchConfig {
  originGap?: number;
  startRadius?: number;
  layerGap?: number;
  itemsPerLayer?: number;
}

export interface ExpansiveMenuMobileOverrides {
  expand?: ExpansionType;
  direction?: ExpansionDirection;
  spacing?: number;
  radius?: number;
  mainRotate?: number;
  mainSize?: number;
  offsetX?: number;
  offsetY?: number;
}

export interface ExpansiveMenuProps {
  items: ExpansiveMenuItem[];

  expand?: ExpansionType;
  direction?: ExpansionDirection;

  spacing?: number;
  radius?: number;

  offsetX?: number;
  offsetY?: number;

  mobile?: ExpansiveMenuMobileOverrides;

  variant?: "solid" | "panel" | "inset" | "rainbow" | "ghost";

  mainIcon?: React.ReactNode;
  mainRotate?: number;

  defaultState?: DefaultState;

  open?: boolean;
  setOpen?: (v: boolean) => void;

  layeredArch?: LayeredArchConfig;
  mainSize?: number;
}

/* ========================================================================== */
/* UTILITIES                                                                  */
/* ========================================================================== */

function isMobileViewport() {
  if (typeof window === "undefined") return false;
  return !window.matchMedia("(min-width: 768px)").matches;
}

function getFlavorVars(flavor?: Flavor) {
  if (!flavor) return null;
  return {
    base: `var(--fvr-${flavor}-lt)`,
    hover: `var(--fvr-${flavor}-md)`,
    text: `var(--fvr-${flavor})`,
  };
}

function getAdaptiveDefault() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(min-width: 768px)").matches;
}

/* ========================================================================== */
/* COMPONENT                                                                  */
/* ========================================================================== */

export default function ExpansiveMenu({
  items,

  expand = "arch",
  direction = "up",

  spacing = 42,
  radius = 56,

  offsetX = 0,
  offsetY = 0,

  layeredArch,
  mobile,

  variant = "solid",

  mainIcon,
  mainRotate = 0,
  mainSize = 32,

  defaultState = "closed",

  open: controlledOpen,
  setOpen: controlledSetOpen,
}: ExpansiveMenuProps) {
  const isMobile = isMobileViewport();

  /* -------------------- RESOLVED CONFIG -------------------- */

  const effectiveExpand = isMobile && mobile?.expand ? mobile.expand : expand;
  const effectiveDirection =
    isMobile && mobile?.direction ? mobile.direction : direction;
  const effectiveSpacing =
    isMobile && mobile?.spacing !== undefined ? mobile.spacing : spacing;
  const effectiveRadius =
    isMobile && mobile?.radius !== undefined ? mobile.radius : radius;
  const effectiveRotation =
    isMobile && mobile?.mainRotate !== undefined
      ? mobile.mainRotate
      : mainRotate;
  const effectiveMainSize =
    isMobile && mobile?.mainSize !== undefined ? mobile.mainSize : mainSize;

  const iconScale = effectiveMainSize / 32;

  /* -------------------- OPEN STATE -------------------- */

  const [internalOpen, setInternalOpen] = useState(() => {
    if (defaultState === "open") return true;
    if (defaultState === "closed") return false;
    return getAdaptiveDefault();
  });

  const open = controlledOpen ?? internalOpen;
  const setOpen = controlledSetOpen ?? setInternalOpen;

  /* -------------------- NESTING STATE -------------------- */

  const [activeNestKey, setActiveNestKey] = useState<string | null>(null);

  const activeNestItem = useMemo(() => {
    if (!activeNestKey) return null;
    return (
      items.find(
        (it, idx) => (it.id ?? `${it.label}-${idx}`) === activeNestKey
      ) ?? null
    );
  }, [activeNestKey, items]);

  const displayedItems = activeNestKey
    ? activeNestItem?.children ?? []
    : items;

  const isNested = !!activeNestKey;

  /* -------------------- POSITION CALC -------------------- */

  const positions = useMemo(() => {
    const list = displayedItems;

    if (effectiveExpand === "line") {
      return list.map((_, i) => {
        const d = (i + 1) * effectiveSpacing;
        return {
          up: { x: 0, y: -d },
          down: { x: 0, y: d },
          left: { x: -d, y: 0 },
          right: { x: d, y: 0 },
        }[effectiveDirection];
      });
    }

    if (effectiveExpand === "circle") {
      return list.map((_, i) => {
        const angle = (2 * Math.PI * i) / Math.max(list.length, 1);
        return {
          x: Math.cos(angle) * effectiveRadius,
          y: Math.sin(angle) * effectiveRadius,
        };
      });
    }

    if (effectiveExpand === "layeredArch") {
      const {
        originGap = 0,
        startRadius = effectiveRadius,
        layerGap = effectiveSpacing,
        itemsPerLayer = 4,
      } = layeredArch ?? {};

      return list.map((_, i) => {
        const layer = Math.floor(i / itemsPerLayer);
        const index = i % itemsPerLayer;

        const layerRadius =
          originGap + startRadius + layer * layerGap;

        const arc = Math.PI / 2;
        const baseAngle =
          itemsPerLayer === 1
            ? 0
            : -arc / 2 +
              (index / Math.max(itemsPerLayer - 1, 1)) * arc;

        const offset =
          effectiveDirection === "left"
            ? Math.PI
            : effectiveDirection === "down"
            ? Math.PI / 2
            : effectiveDirection === "right"
            ? -Math.PI / 2
            : 0;

        const angle = baseAngle + offset;

        return {
          x: Math.cos(angle) * layerRadius,
          y: Math.sin(angle) * layerRadius,
        };
      });
    }

    // default: arch
    return list.map((_, i) => {
      const arc = Math.PI / 2;
      const base =
        list.length === 1
          ? 0
          : -arc / 2 +
            (i / Math.max(list.length - 1, 1)) * arc;

      const offset =
        effectiveDirection === "left"
          ? Math.PI
          : effectiveDirection === "down"
          ? Math.PI / 2
          : effectiveDirection === "right"
          ? -Math.PI / 2
          : 0;

      const angle = base + offset;

      return {
        x: Math.cos(angle) * effectiveRadius,
        y: Math.sin(angle) * effectiveRadius,
      };
    });
  }, [
    displayedItems,
    effectiveExpand,
    effectiveDirection,
    effectiveSpacing,
    effectiveRadius,
    layeredArch,
  ]);

  /* -------------------- MAIN ORB CLICK -------------------- */

  function handleMainClick() {
    if (activeNestKey) {
      setActiveNestKey(null);
      return;
    }
    const next = !open;
    setOpen(next);
    if (!next) setActiveNestKey(null);
  }

  /* -------------------- BUTTON RENDER -------------------- */

  function renderButton(item: ExpansiveMenuItem, i: number) {
    const flavor = getFlavorVars(item.flavor);
    const hasChildren = !!item.children?.length;

    return (
      <Button
        title={item.label}
        onClick={() => {
          if (!activeNestKey && hasChildren) {
            const rootIndex = items.findIndex((it) => it === item);
            setActiveNestKey(item.id ?? `${item.label}-${rootIndex}`);
            return;
          }

          item.action?.();
          setOpen(false);
          setActiveNestKey(null);
        }}
        style={
          variant === "rainbow" && flavor
            ? { backgroundColor: flavor.base }
            : undefined
        }
        className="h-7 w-7 p-0 rounded-full shadow-md transition-colors"
        onMouseEnter={(e) => {
          if (variant === "rainbow" && flavor) {
            e.currentTarget.style.backgroundColor = flavor.hover;
          }
        }}
        onMouseLeave={(e) => {
          if (variant === "rainbow" && flavor) {
            e.currentTarget.style.backgroundColor = flavor.base;
          }
        }}
      >
        <span
          style={
            variant === "rainbow" && flavor
              ? { color: flavor.text }
              : undefined
          }
        >
          {item.icon}
        </span>
      </Button>
    );
  }

  /* -------------------- RENDER -------------------- */

  return (
    <div
      className={`
        relative flex items-center justify-center
        h-8 w-8 overflow-visible rounded-full transition-all
        ${open ? "shadow-lg" : "shadow-none"}
      `}
    >
      {/* MAIN ORB */}
      <Button
        variant="none"
        onClick={handleMainClick}
        className={`
          h-full w-full rounded-full transition-all bg-[var(--gray-100)]
          ${open
            ? "hover:bg-[var(--accent-bg)] text-[var(--accent)]"
            : "text-[var(--text)] hover:text-[var(--text-accent)]"}
        `}
      >
        <motion.div
          animate={{ rotate: isNested ? 0 : open ? effectiveRotation : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="flex items-center justify-center h-full w-full"
        >
          <span
            style={{
              transform: `scale(${iconScale})`,
              width: effectiveMainSize,
              height: effectiveMainSize,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isNested ? <ChevronLeft className="h-5 w-5" /> : mainIcon}
          </span>
        </motion.div>
      </Button>

      {/* ITEMS */}
      {open &&
        (isNested ? (
          // NESTED — NO ANIMATION
          displayedItems.map((item, i) => {
            const pos = positions[i] ?? { x: 0, y: 0 };
            return (
              <div
                key={`nest-${item.id ?? i}`}
                className="absolute z-[9999] pointer-events-auto"
                style={{
                  transform: `translate(${pos.x}px, ${pos.y}px)`,
                }}
              >
                {renderButton(item, i)}
              </div>
            );
          })
        ) : (
          // ROOT — ANIMATED
          <AnimatePresence>
            {displayedItems.map((item, i) => {
              const pos = positions[i];
              return (
                <motion.div
                  key={`root-${item.id ?? i}`}
                  initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    x: pos.x,
                    y: pos.y,
                  }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.05 }}
                  className="absolute z-[9999] pointer-events-auto"
                >
                  {renderButton(item, i)}
                </motion.div>
              );
            })}
          </AnimatePresence>
        ))}
    </div>
  );
}
