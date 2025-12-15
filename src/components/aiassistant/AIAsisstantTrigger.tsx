"use client";

import { useState } from "react";
import { BotMessageSquare, Sparkles, X } from "lucide-react";

/* ========================================================================== */
/* BATON LAUNCHER                                                             */
/* ========================================================================== */

export default function BatonLauncher() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* TRIGGER ---------------------------------------------------------- */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open Baton assistant"
        className="
          h-8 w-8 aspect-square
          rounded-full
          flex items-center justify-center
          bg-[var(--gray-100)]
          text-[var(--text)]
          hover:text-[var(--text-accent)]
          hover:bg-[var(--accent-bg)]
          transition-colors
          cursor-pointer
        "
      >
        <BotMessageSquare className="h-5 w-5" />
      </button>

      {/* OVERLAY + PANEL -------------------------------------------------- */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          {/* BACKDROP */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />

          {/* PANEL */}
          <div
            className="
              relative z-10
              w-full md:w-[420px]
              h-[72vh] md:h-[520px]
              bg-[var(--bg)]
              border border-[var(--border)]
              rounded-t-xl md:rounded-xl
              shadow-xl
              flex flex-col
            "
          >
            {/* HEADER --------------------------------------------------- */}
            <header
              className="
                flex items-center justify-between
                px-4 py-3
                border-b border-[var(--border)]
              "
            >
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[var(--accent)]" />
                <span className="text-sm font-semibold text-[var(--text-dark)]">
                  Baton
                </span>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="
                  h-8 w-8 rounded-md
                  flex items-center justify-center
                  hover:bg-[var(--gray-200)]
                  transition-colors
                "
                aria-label="Close Baton"
              >
                <X className="h-4 w-4 text-[var(--text)]" />
              </button>
            </header>

            {/* BODY ----------------------------------------------------- */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              <div
                className="
                  max-w-[85%]
                  rounded-lg
                  bg-[var(--gray-100)]
                  px-3 py-2
                  text-sm text-[var(--text-dark)]
                "
              >
                I’m Baton — I can help with data entry, navigation, and questions
                about your program or athletes.
              </div>

              {/* future messages */}
            </div>

            {/* INPUT ---------------------------------------------------- */}
            <div className="border-t border-[var(--border)] px-3 py-2">
              <input
                type="text"
                placeholder="Ask Baton anything…"
                className="
                  w-full
                  rounded-lg
                  border border-[var(--border)]
                  bg-[var(--bg)]
                  px-3 py-2
                  text-sm
                  text-[var(--text-dark)]
                  placeholder:text-[var(--text)]
                  focus:outline-none
                  focus:ring-2 focus:ring-[var(--accent-bg)]
                "
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
