"use client";

import { createPortal } from "react-dom";
import { cn } from "@/utils/utils";

interface OverlayShellProps {
  children: React.ReactNode;

  position?: "center" | "bottom-right" | "bottom" | "right";

  /** Container styling */
  containerClassName?: string;

  /** Backdrop controls */
  backdrop?: boolean;
  backdropClassName?: string;
}

export function OverlayShell({
  children,
  position = "center",
  containerClassName,
  backdrop = true,
  backdropClassName,
}: OverlayShellProps) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] pointer-events-none">
      {/* BACKDROP */}
      {backdrop && (
        <div
          className={cn(
            `
            absolute inset-0
            bg-black/40
            backdrop-blur-sm
            `,
            backdropClassName
          )}
        />
      )}

      {/* POSITIONER */}
      <div
        className={cn(
          "absolute inset-0 flex",

          position === "center" && "items-center justify-center",
          position === "bottom" && "items-end justify-center",
          position === "bottom-right" && "items-end justify-end",
          position === "right" && "items-center justify-end"
        )}
      >
        {/* CONTAINER */}
        <div
          className={cn(
            `
            pointer-events-auto
            bg-[var(--bg)]
            border border-[var(--border)]
            shadow-xl
            rounded-xl
            `,
            position === "bottom" && "rounded-b-none w-full",
            position === "bottom-right" && "mb-4 mr-4",
            position === "right" && "mr-4",
            containerClassName
          )}
        >
          {children}
        </div>
      </div>
    </div>,
    document.getElementById("overlay-root")!
  );
}
