"use client";

import {
  Pencil,
  Save,
  ChevronDown,
  MoreVertical,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function WorkspaceMenu({ menuOpen, setMenuOpen }) {
  const [editMode, setEditMode] = useState(false);

  // close on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setMenuOpen]);

  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/* GLOBAL DIALOG OVERLAY                                              */}
      {/* ------------------------------------------------------------------ */}
      {menuOpen && (
        <div
          className="
            fixed inset-0 z-[9999]
            bg-black/40 backdrop-blur-sm
            flex items-center justify-center
          "
          onClick={() => setMenuOpen(false)}
        >
          {/* STOP BUBBLE */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="
              w-full max-w-sm
              rounded-2xl
              bg-[hsl(var(--gray-300))] border border-[--border]
              shadow-[0_20px_60px_-10px_rgba(0,0,0,0.35)]
              p-6
            "
          >
            <div className="text-lg font-semibold mb-4 text-[--text-strong]">
              Ledger Actions
            </div>

            <div className="flex flex-col gap-2">
              {[
                "Open Ledger",
                "Create New Ledger",
                "Close Ledger",
                "Delete Ledger",
                "Style",
              ].map((action) => (
                <button
                  key={action}
                  className="
                    w-full text-left px-4 py-3
                    rounded-xl
                    bg-[--surface-2] hover:bg-[--surface-3]
                    border border-[--border]
                    text-[--text-strong]
                    transition
                  "
                  onClick={() => {
                    console.log(`Action: ${action}`);
                    setMenuOpen(false);
                  }}
                >
                  {action}
                </button>
              ))}
            </div>

            {/* Close */}
            <button
              onClick={() => setMenuOpen(false)}
              className="
                mt-4 w-full py-2 rounded-xl
                bg-[--surface-2] hover:bg-[--surface-3]
                text-[--text-muted] hover:text-[--text-strong]
              "
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
