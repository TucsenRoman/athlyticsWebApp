"use client";

import {
  LayoutDashboard,
  Edit3,
  Star,
  Filter,
  Layers,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

interface ToolbarProps {
  mode: "manager" | "editor";
  setMode: React.Dispatch<React.SetStateAction<"manager" | "editor">>;
  path: string[];

  /** Manager mode: search the page */
  onManagerSearch?: (query: string) => void;

  /** Editor mode: search inside the active ledger rows/columns */
  onEditorSearch?: (query: string) => void;
}

/* -------------------------------------------------------------------------- */
/* MODE TAB                                                                   */
/* -------------------------------------------------------------------------- */

function ModeTab({
  label,
  active,
  onClick,
  icon,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-1 px-3 py-1 rounded-full transition
        ${
          active
            ? "bg-[hsl(var(--accent))]/20 text-[hsl(var(--accent))]"
            : "text-[hsl(var(--gray-600))] hover:bg-[hsl(var(--gray-200))]"
        }
      `}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* TOOLBAR                                                                    */
/* -------------------------------------------------------------------------- */

export default function LedgerToolbar({
  mode,
  setMode,
  path,
  onManagerSearch,
  onEditorSearch,
}: ToolbarProps) {
  const [query, setQuery] = useState("");

  // context-aware search
  const handleSearch = (value: string) => {
    setQuery(value);
    if (mode === "manager") onManagerSearch?.(value);
    if (mode === "editor") onEditorSearch?.(value);
  };

  return (
    <div
      className="
        sticky top-0 z-40 h-10 px-2
        flex items-center justify-between
        backdrop-blur bg-white/80
        border-b border-border/60 shadow-sm
        select-none
      "
    >
      {/* LEFT SECTION ----------------------------------------------------- */}
      <div className="flex items-center gap-3">
        {/* MODE TOGGLE */}
        <div
          className="
            flex items-center gap-1 px-1 py-[3px]
            dark:bg-[hsl(var(--gray-800))] rounded-full
          "
        >
          <ModeTab
            label="Manager"
            active={mode === "manager"}
            onClick={() => setMode("manager")}
            icon={<LayoutDashboard className="h-3 w-3" />}
          />
          <ModeTab
            label="Editor"
            active={mode === "editor"}
            onClick={() => setMode("editor")}
            icon={<Edit3 className="h-3 w-3" />}
          />
        </div>
      </div>

      {/* CENTER SECTION — BREADCRUMB ------------------------------------- */}
      <div className="flex-1 flex items-center justify-center pointer-events-none">
        <div className="flex items-center gap-1 text-sm text-gray-700 font-medium">
          <div className="flex-1 flex items-center justify-center">
            {path.length === 0 ? null : (
              <div className="flex items-center gap-1 text-sm text-gray-700 font-medium">

                {path.length === 1 ? (
                  // Single segment: either orphan ledger OR "No Path"
                  <span
                    className={
                      path[0] === "No Path"
                        ? "text-gray-400 italic"
                        : "text-gray-700" // orphan ledger = normal styling
                    }
                  >
                    {path[0]}
                  </span>
                ) : (
                  // Multi-segment: Package › Ledger
                  path.map((segment, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <span>{segment}</span>
                      {i < path.length - 1 && (
                        <span className="text-gray-400">›</span>
                      )}
                    </div>
                  ))
                )}

              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT SECTION ---------------------------------------------------- */}
      <div className="flex items-center gap-2">
        {/* SEARCH BAR — CONTEXT AWARE */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={
              mode === "manager"
                ? "Search this page…"
                : "Search ledger…"
            }
            className="
              pl-8 h-8 w-48 text-sm rounded-full
              bg-[hsl(var(--gray-100))] hover:bg-[hsl(var(--gray-200))]
              transition
            "
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="
            h-8 w-8 rounded-full
            text-gray-600 hover:text-yellow-500
            hover:bg-yellow-500/10
          "
        >
          <Star className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="
            h-8 w-8 rounded-full
            text-gray-600 hover:text-[hsl(var(--primary))]
            hover:bg-primary/20
          "
        >
          <Filter className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="
            h-8 w-8 rounded-full
            text-gray-600 hover:text-[hsl(var(--primary))]
            hover:bg-primary/20
          "
        >
          <Layers className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
