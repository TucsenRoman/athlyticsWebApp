"use client";

import {
  Sparkles,
  Package,
  Users,
  Search,
  PanelRightClose,
  PanelLeftClose,
  X,
  ChevronDown,
  Flame,
  Star,
  Crown,
  LayoutTemplate,
  Tag,
  Send,
} from "lucide-react";

import React, { useState } from "react";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type CommunityMode = "discover" | "social" | "following";
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
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const SPORTS = [
  { id: "all", label: "All sports" },
  { id: "cross_country", label: "Cross Country" },
  { id: "track", label: "Track & Field" },
  { id: "basketball", label: "Basketball" },
  { id: "football", label: "Football" },
  { id: "multi", label: "Multi-sport" },
] as const;

const SORT_TABS = [
  { id: "trending", label: "Trending" },
  { id: "new", label: "Newest" },
  { id: "top", label: "Top rated" },
] as const;

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
}: {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;

  mode: CommunityMode;
  setMode: (m: CommunityMode) => void;

  query: string;
  setQuery: (v: string) => void;
}) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);

  const [activeSport, setActiveSport] = useState<SportId>("all");
  const [activeType, setActiveType] = useState<"all" | ItemType>("all");
  const [sort, setSort] = useState<SortId>("trending");
  const [sportsOpen, setSportsOpen] = useState(false);

  const modeLabel = {
    discover: "Discover",
    social: "Social",
    following: "Following",
  }[mode];

  const activeSportLabel =
    SPORTS.find((s) => s.id === activeSport)?.label || "All sports";

  return (
    <div className="h-10 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl px-4 flex items-center justify-between">
      
      {/* LEFT — Collapse + Mode Pills */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-md hover:bg-muted/40 transition"
        >
          {collapsed ? (
            <PanelRightClose className="w-5 h-5 relative top-[1px]" />
          ) : (
            <PanelLeftClose className="w-5 h-5 relative top-[1px]" />
          )}
        </button>

        <div className="flex items-center bg-secondary/10 px-1 py-1 rounded-full text-xs shadow-sm gap-1">
          <ModeTab
            label="Discover"
            active={mode === "discover"}
            onClick={() => setMode("discover")}
            icon={<Sparkles className="h-3 w-3" />}
          />
          <ModeTab
            label="Social"
            active={mode === "social"}
            onClick={() => setMode("social")}
            icon={<Send className="h-3 w-3" />}
          />
          <ModeTab
            label="Following"
            active={mode === "following"}
            onClick={() => setMode("following")}
            icon={<Users className="h-3 w-3" />}
          />
        </div>
      </div>

      {/* CENTER — SEARCH (separate island) */}
      <div className="hidden md:flex items-center">
        <div className="relative w-40 sm:w-56 lg:w-64">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sports, tags, users..."
            className="
              w-full h-8 pl-9 pr-3 text-sm rounded-full
              bg-card/60 border border-border/60 placeholder:text-muted-foreground/70
              focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-secondary
              transition
            "
          />
          <Search className="absolute left-3 top-2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {/* RIGHT — Filter pill */}
      <div className="hidden md:flex items-center">
        <div className="inline-flex items-center h-8 rounded-full bg-secondary/10 px-1 py-1 text-[11px]">
          {SORT_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSort(tab.id as SortId)}
              className={`
                px-3 py-1 rounded-full flex items-center gap-1 transition
                ${
                  sort === tab.id
                    ? "bg-secondary/20 text-secondary shadow-sm"
                    : "text-muted-foreground hover:bg-secondary/10"
                }
              `}
            >
              {tab.id === "trending" && <Flame className="h-3 w-3 text-primary" />}
              {tab.id === "new" && <Star className="h-3 w-3 text-primary" />}
              {tab.id === "top" && <Crown className="h-3 w-3 text-primary" />}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* MOBILE — expanding search */}
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
                bg-card border border-border placeholder:text-muted-foreground/70
                focus-visible:ring-2 focus-visible:ring-primary transition
              "
            />
            <button
              className="absolute right-3 top-2.5"
              onClick={() => setMobileSearchOpen(false)}
            >
              <X className="w-4 h-4 text-muted-foreground" />
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
        inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] transition
        ${
          active
            ? "bg-secondary text-primary shadow-sm font-bold"
            : "text-muted-foreground hover:bg-secondary/10 font-medium"
        }
      `}
    >
      {icon}
      {label}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Dropdown Item                                                               */
/* -------------------------------------------------------------------------- */

function DropdownItem({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`
        w-full text-left px-3 py-2 text-sm transition
        ${
          active
            ? "bg-secondary/20 text-secondary font-medium"
            : "text-muted-foreground hover:bg-secondary/10"
        }
      `}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
