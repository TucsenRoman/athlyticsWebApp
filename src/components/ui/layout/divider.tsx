"use client";

import { cn } from "@/utils/utils";

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

type DividerOrientation = "horizontal" | "vertical";
type DividerTone = "light" | "medium" | "dark" | "bold";

interface DividerProps {
  orientation?: DividerOrientation;
  tone?: DividerTone;
  inset?: number; // percentage (0–50)
  className?: string;
}

/* ========================================================================== */
/* STYLE MAPS                                                                 */
/* ========================================================================== */

const ORIENTATION_STYLES: Record<DividerOrientation, string> = {
  horizontal: "h-px",
  vertical: "w-px",
};

const TONE_STYLES: Record<DividerTone, string> = {
  light: "bg-[var(--border-light)]",
  medium: "bg-[var(--border)]",
  dark: "bg-[var(--border-dark)]",
  bold: "bg-[var(--border-strong)]",
};

/* ========================================================================== */
/* COMPONENT                                                                  */
/* ========================================================================== */

export function Divider({
  orientation = "horizontal",
  tone = "medium",
  inset = 0,
  className,
}: DividerProps) {
  const style =
    orientation === "horizontal"
      ? {
          width: `calc(100% - ${inset * 2}%)`,
          marginLeft: `${inset}%`,
          marginRight: `${inset}%`,
        }
      : {
          height: `calc(100% - ${inset * 2}%)`,
          marginTop: `${inset}%`,
          marginBottom: `${inset}%`,
        };

  return (
    <div
      aria-hidden
      style={style}
      className={cn(
        "shrink-0",
        ORIENTATION_STYLES[orientation],
        TONE_STYLES[tone],
        className
      )}
    />
  );
}
