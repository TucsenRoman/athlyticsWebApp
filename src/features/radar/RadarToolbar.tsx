// src/features/radar/components/RadarToolbar.tsx

"use client";

import { X, Search, SlidersHorizontal, CloudOff, RotateCcw } from "lucide-react";
import GlobalSearch from "./GlobalSearch";

/* -------------------------------------------------------------------------- */
/* TYPES */
/* -------------------------------------------------------------------------- */

interface RadarToolbarProps {
  query: string;
  onQueryChange: (val: string) => void;
}

/* -------------------------------------------------------------------------- */
/* MAIN TOOLBAR */
/* -------------------------------------------------------------------------- */

export default function RadarToolbar({
  query,
  onQueryChange,
}: RadarToolbarProps) {
  return (
    <div
      className="
        flex items-center gap-2
        w-full px-4
        bg-[var(--bg)]
      "
    >
        {/* CENTER: SEARCH */}
        <div className="flex-1">
            <GlobalSearch
            query={query}
            onChange={onQueryChange}
            />
        </div>

        {/* RIGHT: INDICATORS */}
        <div className="flex items-center gap-2 shrink-0">
            <button
            className="
                flex items-center justify-center
                bg-none
                transition
            "
            >
            <CloudOff className="w-4 h-4 text-[var(--warning)]" />
            </button>
            <button
            className="
                flex items-center justify-center
                bg-none
                transition
            "
            >
            <RotateCcw className="w-4 h-4 text-[var(--warning)]" />
            </button>
        </div>
    </div>
  );
}
