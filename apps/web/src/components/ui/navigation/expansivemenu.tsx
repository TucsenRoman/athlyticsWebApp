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
  action?: () => void | Promise<void>;
  destructive?: boolean;
  flavor?: Flavor;
  children?: ExpansiveMenuItem[];
}

export interface LayeredArchConfig {
  originGap?: number;
  startRadius?: number;
  layerGap?: number;
  itemsPerLayer?: number;
  spacingByLayer?: number[]
  itemsPerLayerByLayer?: number[] 
}

export interface ExpansiveMenuMobileOverrides {
  expand?: ExpansionType;
  direction?: ExpansionDirection;
  directionDeg?: number;
  spacing?: number;
  radius?: number;
  mainRotate?: number;
  mainIconSize?: number;
  mainSize?: number;
  offsetX?: number;
  offsetY?: number;
}

export interface ExpansiveMenuProps {
  items: ExpansiveMenuItem[];

  expand?: ExpansionType;
  direction?: ExpansionDirection;
  directionDeg?: number;

  spacing?: number;
  radius?: number;

  offsetX?: number;
  offsetY?: number;

  mobile?: ExpansiveMenuMobileOverrides;

  variant?: "solid" | "panel" | "inset" | "rainbow" | "ghost";

  mainIcon?: React.ReactNode;
  mainIconSize?: number;
  mainSize?: number;
  mainRotate?: number;

  defaultState?: DefaultState;

  open?: boolean;
  setOpen?: (v: boolean) => void;

  layeredArch?: LayeredArchConfig;

  autoClose?: boolean;
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

function dirToDeg(dir?: ExpansionDirection) {
  switch (dir) {
    case "right":
      return 90
    case "down":
      return 180
    case "left":
      return 270
    case "up":
    default:
      return 0
  }
}

/* ========================================================================== */
/* COMPONENT                                                                  */
/* ========================================================================== */

export default function ExpansiveMenu({
  items,

  expand = "arch",
  direction,
  directionDeg,

  spacing = 42,
  radius = 56,

  offsetX = 0,
  offsetY = 0,

  layeredArch,
  mobile,

  variant = "solid",

  mainIcon,
  mainIconSize = 32,
  mainSize = 32,
  mainRotate = 0,

  defaultState = "closed",

  open: controlledOpen,
  setOpen: controlledSetOpen,

  autoClose = true,
}: ExpansiveMenuProps) {
  const isMobile = isMobileViewport();

  /* -------------------- RESOLVED CONFIG -------------------- */

  const effectiveExpand = isMobile && mobile?.expand ? mobile.expand : expand;
  const effectiveDirectionDeg =
    isMobile && mobile?.directionDeg !== undefined
      ? mobile.directionDeg
      : directionDeg !== undefined
        ? directionDeg
        : dirToDeg(direction) // Legacy Fallback
  const effectiveSpacing =
    isMobile && mobile?.spacing !== undefined ? mobile.spacing : spacing;
  const effectiveRadius =
    isMobile && mobile?.radius !== undefined ? mobile.radius : radius;
  const effectiveRotation =
    isMobile && mobile?.mainRotate !== undefined
      ? mobile.mainRotate
      : mainRotate;
  const effectiveMainIconSize =
    isMobile && mobile?.mainIconSize !== undefined
      ? mobile.mainIconSize
      : mainIconSize

  const effectiveMainSize =
    isMobile && mobile?.mainSize !== undefined
      ? mobile.mainSize
      : mainSize

  const orbPx = Math.max(12, effectiveMainSize)

  const iconScale = effectiveMainIconSize / 32

  /* -------------------- OPEN STATE -------------------- */

  const [internalOpen, setInternalOpen] = useState(() => {
    if (defaultState === "open") return true;
    if (defaultState === "closed") return false;
    return getAdaptiveDefault();
  });

  const isControlled = controlledOpen !== undefined && controlledSetOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? controlledSetOpen : setInternalOpen

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
      const rad = (effectiveDirectionDeg * Math.PI) / 180
      return list.map((_, i) => {
        const d = (i + 1) * effectiveSpacing
        // 0° = up => (x=0, y=-d)
        return {
          x: Math.sin(rad) * d,
          y: -Math.cos(rad) * d,
        }
      })
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

        // fallback (if no by-layer config provided)
        itemsPerLayer = 4,

        itemsPerLayerByLayer,
        spacingByLayer,
      } = layeredArch ?? {}

      // resolve capacity for a given layer
      const capForLayer = (layer: number) =>
        itemsPerLayerByLayer?.[layer] ?? itemsPerLayer

      // map global index -> (layer, indexWithinLayer, countThisLayer)
      const locate = (globalIndex: number) => {
        let layer = 0
        let offset = globalIndex

        while (true) {
          const cap = Math.max(1, capForLayer(layer))
          if (offset < cap) {
            // count remaining items in this layer
            const remaining = list.length - globalIndex + offset
            const countThisLayer = Math.min(cap, remaining)
            return { layer, index: offset, countThisLayer }
          }
          offset -= cap
          layer += 1
        }
      }

      return list.map((_, i) => {
        const { layer, index, countThisLayer } = locate(i)

        const layerRadius = originGap + startRadius + layer * layerGap

        // ✅ per-layer spacing (fallback to global spacing)
        const spacingPx = spacingByLayer?.[layer] ?? effectiveSpacing

        // spacing(px) -> delta angle (radians) at this radius
        const r = Math.max(layerRadius, 1)
        const delta = spacingPx / r

        const totalArc =
          countThisLayer <= 1
            ? 0
            : Math.min(Math.PI * 1.15, delta * (countThisLayer - 1))

        const baseAngle =
          countThisLayer <= 1
            ? 0
            : -totalArc / 2 +
              (index / Math.max(countThisLayer - 1, 1)) * totalArc

        const dirRad = (effectiveDirectionDeg * Math.PI) / 180
        const angle = baseAngle + dirRad

        return {
          x: Math.sin(angle) * layerRadius,
          y: -Math.cos(angle) * layerRadius,
        }
      })
    }
    
    // default: arch
    return list.map((_, i) => {
      const n = Math.max(list.length, 1)

      // spacing(px) -> delta angle (radians)
      const r = Math.max(effectiveRadius, 1)
      const delta = effectiveSpacing / r // radians between neighbors

      // total arc based on desired spacing
      // clamp so it doesn't wrap too far around
      const totalArc = n === 1 ? 0 : Math.min(Math.PI * 1.15, delta * (n - 1))

      const base =
        n === 1
          ? 0
          : -totalArc / 2 + (i / Math.max(n - 1, 1)) * totalArc

      const dirRad = (effectiveDirectionDeg * Math.PI) / 180
      const angle = base + dirRad

      return {
        x: Math.sin(angle) * effectiveRadius,
        y: -Math.cos(angle) * effectiveRadius,
      }
    })
  }, [
    displayedItems,
    effectiveExpand,
    effectiveDirectionDeg,
    effectiveSpacing,
    effectiveRadius,
    layeredArch,
  ]);

  /* -------------------- MAIN ORB CLICK -------------------- */

  function handleMainClick(e?: React.MouseEvent) {
    e?.preventDefault()
    e?.stopPropagation()

    if (activeNestKey) {
      setActiveNestKey(null)
      return
    }

    const next = !open
    setOpen(next)
    if (!next) setActiveNestKey(null)
  }

  /* -------------------- BUTTON RENDER -------------------- */

  function renderButton(item: ExpansiveMenuItem, i: number) {
    const flavor = getFlavorVars(item.flavor);
    const hasChildren = !!item.children?.length;

    return (
      <Button
        type="button"
        variant="float"
        iconSize="sm"
        title={item.label}
        onClick={async (e) => {
          e.preventDefault()
          e.stopPropagation()

          console.log("[ExpansiveMenu] item click:", item.label)

          const hasChildren = !!item.children?.length

          if (!activeNestKey && hasChildren) {
            const rootIndex = items.findIndex((it) => it === item)
            const key = item.id ?? `${item.label}-${rootIndex}`
            console.log("[ExpansiveMenu] enter submenu:", key)
            setActiveNestKey(key)
            return
          }

          try {
            console.log("[ExpansiveMenu] action start:", item.label)
            await item.action?.()
            console.log("[ExpansiveMenu] action done:", item.label)
          } catch (e) {
            console.log("[ExpansiveMenu] action error:", item.label, e)
          } finally {
            if (autoClose) {
              console.log("[ExpansiveMenu] autoClose -> closing:", item.label)
              setOpen(false)
              setActiveNestKey(null)
            }
          }
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
        overflow-visible rounded-full transition-all
        ${open ? "shadow-lg" : "shadow-none"}
      `}
      style={{ width: orbPx, height: orbPx }}
    >
      {/* MAIN ORB */}
      <Button
        type="button"
        variant="stick"
        data-active={open}
        onClick={handleMainClick}
        className="rounded-full p-0"
        style={{ width: orbPx, height: orbPx }}
      >
        <motion.div
          animate={{ rotate: isNested ? 0 : open ? effectiveRotation : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="flex items-center justify-center h-full w-full will-change-transform"
        >
          <span
            style={{
              transform: `scale(${iconScale})`,
              width: effectiveMainIconSize,
              height: effectiveMainIconSize,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isNested ? <ChevronLeft className="h-4 w-4" /> : mainIcon}
          </span>
        </motion.div>
      </Button>

      {/* ITEMS */}
      {open &&
        (isNested ? (
          displayedItems.map((item, i) => {
            const pos = positions[i] ?? { x: 0, y: 0 }
            const x = pos.x + offsetX
            const y = pos.y + offsetY

            return (
              <div
                key={`nest-${item.id ?? i}`}
                className="absolute z-[9999] pointer-events-auto"
                style={{ transform: `translate(${x}px, ${y}px)` }}
              >
                {renderButton(item, i)}
              </div>
            )
          })
        ) : (
          <AnimatePresence>
            {displayedItems.map((item, i) => {
              const pos = positions[i] ?? { x: 0, y: 0 }
              const x = pos.x + offsetX
              const y = pos.y + offsetY

              return (
                <motion.div
                  key={`root-${item.id ?? i}`}
                  initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                  animate={{ opacity: 1, scale: 1, x, y }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.05 }}
                  className="absolute z-[9999] pointer-events-auto"
                >
                  {renderButton(item, i)}
                </motion.div>
              )
            })}
          </AnimatePresence>
        ))}
    </div>
  );
}
