"use client"

import { cn } from "@/utils/utils"

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

type DividerOrientation = "horizontal" | "vertical"

interface DividerProps {
  orientation?: DividerOrientation
  inset?: number            // px
  color?: string            // CSS var(), rgba, hex
  thickness?: string        // "1px", "2px", etc
  className?: string
  debug?: boolean
}

/* ========================================================================== */
/* CONSTANTS                                                                  */
/* ========================================================================== */

const ORIENTATION_SIZE_MAP: Record<DividerOrientation, string> = {
  horizontal: "w-full",
  vertical: "h-full",
}

/* ========================================================================== */
/* COMPONENT                                                                  */
/* ========================================================================== */

export function Divider({
  orientation = "horizontal",
  inset = 0,
  color = "var(--border)",
  thickness = "1px",
  className,
  debug = false,
}: DividerProps) {
  const isHorizontal = orientation === "horizontal"

  const style: React.CSSProperties = {
    backgroundColor: debug ? "red" : color,
    ...(isHorizontal
      ? {
          height: thickness,
          width: `calc(100% - ${inset * 2}px)`,
          marginLeft: `${inset}px`,
          marginRight: `${inset}px`,
        }
      : {
          width: thickness,
          height: `calc(100% - ${inset * 2}px)`,
          marginTop: `${inset}px`,
          marginBottom: `${inset}px`,
        }),
  }

  return (
    <div
      aria-hidden
      style={style}
      className={cn(
        "shrink-0",
        ORIENTATION_SIZE_MAP[orientation],
        className
      )}
    />
  )
}
