"use client";

import { cn } from "@/utils/utils";
import { PanelLeft, PanelLeftClose, PanelRightClose } from "lucide-react";

interface PushPanelProps {
  /** Main page content */
  children: React.ReactNode;

  /** Panel body content */
  panel: React.ReactNode;

  /** Controlled open state */
  open: boolean;

  /** Panel width */
  width?: string;

  /** Panel title */
  title?: string;

  /** Optional title icon */
  titleIcon?: React.ReactNode;

  /** Close handler */
  onClose?: () => void;

  /** Optional class overrides */
  panelClassName?: string;
  contentClassName?: string;
}

export function PushPanel({
  children,
  panel,
  open,
  width = "320px",
  title,
  titleIcon,
  onClose,
  panelClassName,
  contentClassName,
}: PushPanelProps) {
  return (
    <div className="relative w-full flex-1 min-h-0 flex overflow-auto">
      {/* MAIN CONTENT */}
      <main
        className={cn(
          "flex-1 min-w-0 transition-[margin] duration-200 ease-out",
          contentClassName
        )}
        style={{
          marginRight: open ? width : undefined,
        }}
      >
        {children}
      </main>

      {/* PANEL */}
      {open && (
        <aside
          className={cn(
            `
            flex-shrink-0
            h-full
            bg-[var(--bg)]
            border-l border-[var(--border)]
            shadow-lg
            z-50
            flex flex-col
            `,
            panelClassName
          )}
          style={{ width }}
        >
          {/* PANEL HEADER */}
          <header
            className="
              h-10
              px-3
              flex items-center justify-start gap-10
              border-b border-[var(--border)]
              bg-[var(--gray-50)]
              flex-shrink-0
            "
          >
            {onClose && (
              <button
                onClick={onClose}
                aria-label="Close panel"
                className="
                  h-7 w-7
                  rounded-md
                  flex items-center justify-center
                  hover:bg-[var(--dom-bg)]
                  transition-colors
                "
              >
                <PanelRightClose className="h-4 w-4 text-[var(--text)]" />
              </button>
            )}
            
            <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-dk)]">
              {titleIcon && (
                <span className="flex items-center justify-center">
                  {titleIcon}
                </span>
              )}
              {title}
            </div>
          </header>

          {/* PANEL BODY */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            {panel}
          </div>
        </aside>
      )}
    </div>
  );
}
