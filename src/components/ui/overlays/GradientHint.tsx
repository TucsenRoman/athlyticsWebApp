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
  extent?: string // e.g. "200px", "12rem", "40%"
  radius?: GradientRadius
  className?: string
  debug?: boolean
}

/* ========================================================================== */
/* STYLES                                                                     */
/* ========================================================================== */

const DIRECTION_MAP: Record<GradientDirection, string> = {
  bottom: `
    absolute bottom-0 left-0 right-0
    bg-gradient-to-t
  `,
  top: `
    absolute top-0 left-0 right-0
    bg-gradient-to-b
  `,
  left: `
    absolute top-0 bottom-0 left-0
    bg-gradient-to-r
  `,
  right: `
    absolute top-0 bottom-0 right-0
    bg-gradient-to-l
  `,
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
  className,
  debug = false,
}: GradientHintProps) {
  const isVertical = direction === "top" || direction === "bottom"

  return (
    <div
      style={
        isVertical
          ? { height: extent }
          : { width: extent }
      }
      className={cn(
        `
        pointer-events-none
        absolute
        z-10
        ${DIRECTION_MAP[direction]}
        ${RADIUS_MAP[radius]}
        ${debug
          ? "from-red-500"
          : "from-[var(--gray-3)]"
        }
        to-transparent
        `,
        className
      )}
    />
  )
}
