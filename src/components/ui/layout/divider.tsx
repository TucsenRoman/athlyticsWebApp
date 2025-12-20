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
  className?: string;
}

/* ========================================================================== */
/* STYLE MAPS                                                                 */
/* ========================================================================== */

const ORIENTATION_STYLES: Record<DividerOrientation, string> = {
  horizontal: "w-full h-px",
  vertical: "h-full w-px",
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
  className,
}: DividerProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "shrink-0 m-[2px]",
        ORIENTATION_STYLES[orientation],
        TONE_STYLES[tone],
        className
      )}
    />
  );
}
