"use client"

import { cn } from "@/utils/utils"

interface PillProps {
  children: React.ReactNode
  className?: string
  title?: string
}

/* ========================================================================== */
/* COMPONENT                                                                  */
/* ========================================================================== */

export function Pill({
  children,
  className,
  title,
}: PillProps) {
  return (
    <div
      title={title}
      className={cn(
        "flex items-center gap-1 h-8 rounded-full",
        "border border-[var(--border)]",
        "bg-[var(--gray-7)] p-1 shadow-inner",
        className
      )}
    >
      {children}
    </div>
  )
}
