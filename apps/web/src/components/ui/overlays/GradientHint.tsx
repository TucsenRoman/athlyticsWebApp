"use client"

import { cn } from "@/utils/utils"

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

type GradientDirection = "top" | "bottom" | "left" | "right"

type GradientRadius =
  | "none"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "full"

type GradientHintProps = {
  direction?: GradientDirection
  extent?: string              // "200px", "12rem", "40%", etc
  radius?: GradientRadius
  fromColor?: string           // CSS color or var()
  className?: string
  debug?: boolean
}

/* ========================================================================== */
/* CONSTANTS                                                                  */
/* ========================================================================== */

const DIRECTION_POSITION_MAP: Record<GradientDirection, string> = {
  bottom: "absolute bottom-0 left-0 right-0",
  top: "absolute top-0 left-0 right-0",
  left: "absolute top-0 bottom-0 left-0",
  right: "absolute top-0 bottom-0 right-0",
}

const DIRECTION_GRADIENT_MAP: Record<GradientDirection, string> = {
  bottom: "to top",
  top: "to bottom",
  left: "to right",
  right: "to left",
}

const RADIUS_MAP: Record<GradientRadius, string> = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  full: "rounded-full",
}

/* ========================================================================== */
/* COMPONENT                                                                  */
/* ========================================================================== */

export function GradientHint({
  direction = "bottom",
  extent = "200px",
  radius = "none",
  fromColor = "var(--gray-3)",
  className,
  debug = false,
}: GradientHintProps) {
  const isVertical = direction === "top" || direction === "bottom"

  return (
    <div
      style={{
        ...(isVertical ? { height: extent } : { width: extent }),
        backgroundImage: debug
          ? undefined
          : `linear-gradient(${DIRECTION_GRADIENT_MAP[direction]}, ${fromColor}, transparent)`,
      }}
      className={cn(
        `
        pointer-events-none
        z-10
        ${DIRECTION_POSITION_MAP[direction]}
        ${RADIUS_MAP[radius]}
        ${debug ? "bg-gradient-to-t from-red-500 to-transparent" : ""}
        `,
        className
      )}
    />
  )
}
