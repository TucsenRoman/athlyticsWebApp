"use client";

import {
  Sparkles,
  Search,
  PanelRightClose,
  PanelLeftClose,
  X,
  Send,
} from "lucide-react";

import React, { useState } from "react";
import DiscoveryFilters, { FilterId, CommunityMode } from "./DiscoveryFilters";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type SportId =
  | "all"
  | "cross_country"
  | "track"
  | "basketball"
  | "football"
  | "multi";

type ItemType = "template" | "package";
type SortId = "trending" | "new" | "top";

/* -------------------------------------------------------------------------- */
/* Component                                                                   */
/* -------------------------------------------------------------------------- */

export default function DiscoveryHeader({
  collapsed,
  setCollapsed,
  mode,
  setMode,
  query,
  setQuery,
  isPublic,
}: {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mode: CommunityMode;
  setMode: (m: CommunityMode) => void;
  query: string;
  setQuery: (v: string) => void;
  isPublic: boolean;
}) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // New unified filter state (For You, Following OR Posts, Followers, Installs)
  const [activeFilter, setActiveFilter] = useState<FilterId>("for_you");

  return (
    <div
      className="
        w-full px-4 py-2
        bg-[hsl(var(--background))]/80 backdrop-blur-xl
      "
    >
      {/* =============================================================== */}
      {/* TOP ROW — 3-COLUMN BALANCED LAYOUT                              */}
      {/* =============================================================== */}
      <div className="grid grid-cols-3 items-center">

        {/* LEFT ---------------------------------------------------------- */}
        <div className="flex items-center gap-2">

          {/* Collapse Button */}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="
              p-2 rounded-md transition
              text-[hsl(var(--gray-700))]
              hover:bg-[hsl(var(--gray-200))]
            "
          >
            {collapsed ? (
              <PanelRightClose className="w-5 h-5" />
            ) : (
              <PanelLeftClose className="w-5 h-5" />
            )}
          </button>

          {/* Desktop Search */}
          <div className="relative w-40 sm:w-56 lg:w-64 hidden md:block">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search sports, tags, users..."
              className="
                w-full h-8 pl-9 pr-3 text-sm rounded-full transition
                bg-[hsl(var(--card))] border border-[hsl(var(--border))] 
                placeholder:text-[hsl(var(--gray-500))]
                text-[hsl(var(--foreground))]
                focus-visible:outline-none
              "
            />
            <Search className="absolute left-3 top-2 h-4 w-4 text-[hsl(var(--gray-500))]" />
          </div>
        </div>

        {/* CENTER -------------------------------------------------------- */}
        <div className="flex items-center justify-center">
          <div
            className="
              flex items-center gap-1 px-1 py-1 rounded-full
              bg-[hsl(var(--gray-lt))] 
              dark:bg-[hsl(var(--gray-800))]
              text-base font-semibold shadow-lg
            "
          >
            <ModeTab
              label="Discover"
              active={mode === "discover"}
              onClick={() => {
                setMode("discover");
                setActiveFilter("for_you");
              }}
              icon={<Sparkles className="h-3 w-3" />}
            />

            <ModeTab
              label="Social"
              active={mode === "social"}
              onClick={() => {
                setMode("social");
                setActiveFilter("posts");
              }}
              icon={<Send className="h-3 w-3" />}
            />
          </div>
        </div>

        {/* RIGHT (EMPTY for Balanced Centering) -------------------------- */}
        <div />
      </div>

      {/* =============================================================== */}
      {/* FILTER BAR — CENTERED UNDER MODE TABS                           */}
      {/* =============================================================== */}
      <div className="flex justify-start mt-2">
        <DiscoveryFilters
          mode={mode}
          active={activeFilter}
          setActive={setActiveFilter}
        />
      </div>

      {/* =============================================================== */}
      {/* MOBILE SEARCH OVERLAY                                          */}
      {/* =============================================================== */}
      {mobileSearchOpen && (
        <div className="flex md:hidden absolute right-4 inset-y-0 my-auto h-10 w-[70%]">
          <div className="relative w-full">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              autoFocus
              className="
                w-full h-10 pl-4 pr-10 text-sm rounded-full
                bg-[hsl(var(--card))] border border-[hsl(var(--border))]
                text-[hsl(var(--foreground))]
                placeholder:text-[hsl(var(--gray-500))]
                focus-visible:ring-2 focus-visible:ring-[hsl(var(--dom-dk))]
                transition
              "
            />
            <button
              className="absolute right-3 top-2.5 text-[hsl(var(--gray-600))]"
              onClick={() => setMobileSearchOpen(false)}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* ModeTab                                                                    */
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
        inline-flex items-center gap-1 px-3 py-1 rounded-full text-base transition shadow-lg
        ${
          active
            ? "bg-[hsl(var(--dom-dk))]/20 text-[hsl(var(--dom-dk))] font-semibold"
            : "text-[hsl(var(--gray-600))] hover:bg-[hsl(var(--gray-200))]"
        }
      `}
    >
      {icon}
      {label}
    </button>
  );
}
