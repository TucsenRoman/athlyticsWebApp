// src/components/ledgercontent/community.tsx

import { useState } from "react";
import {
  Search,
  ThumbsUp,
  Download,
  User,
  Share2,
  Sparkles,
  Filter,
  SortAsc,
  Star,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/* Mock Data (visual only)                                                    */
/* -------------------------------------------------------------------------- */

const COMMUNITY_ITEMS = [
  {
    id: "xc-attendance-pro",
    name: "XC Attendance Pro",
    author: "Coach Ramirez",
    description:
      "A fully color-coded attendance ledger with auto-status flags and athlete grouping.",
    likes: 328,
    installs: 1421,
    sport: "cross_country",
    badge: "Trending",
  },
  {
    id: "tf-meet-manager",
    name: "Track Meet Manager",
    author: "Coach Williams",
    description:
      "Handles entries, relays, lane assignments, and scoring templates.",
    likes: 712,
    installs: 2093,
    sport: "track",
    badge: "Top Rated",
  },
  {
    id: "basketball-practice-blocks",
    name: "BBall Practice Blocks",
    author: "Coach Lee",
    description:
      "Warmups, drills, shooting ladders, conditioning, and team period templates.",
    likes: 220,
    installs: 874,
    sport: "basketball",
    badge: "New",
  },
];

/* -------------------------------------------------------------------------- */
/* Component                                                                   */
/* -------------------------------------------------------------------------- */

export default function Community() {
  const [search, setSearch] = useState("");
  const [activeSort, setActiveSort] = useState("trending");

  const FILTERS = ["All", "Cross Country", "Track", "Basketball", "Football", "Multi-Sport"];

  return (
    <div className="h-full w-full overflow-hidden bg-neutral-50 dark:bg-neutral-900">
      <div className="h-full overflow-y-auto px-8 py-6 space-y-10">

        {/* ------------------------------------------------------------------ */}
        {/* Header                                                             */}
        {/* ------------------------------------------------------------------ */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-semibold">Community Hub</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              See what other coaches are building — and share your own.
            </p>
          </div>

          <button
            type="button"
            className="
              flex items-center gap-2 rounded-xl bg-primary text-white
              px-4 py-2 text-sm font-medium
              hover:bg-primary/90 transition
            "
          >
            <Share2 className="h-4 w-4" />
            Share Template
          </button>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Search + Filters + Sort                                            */}
        {/* ------------------------------------------------------------------ */}
        <div className="space-y-4">

          {/* Search */}
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search community templates and packages…"
              className="
                w-full h-10 rounded-full border border-neutral-200
                bg-white dark:bg-neutral-950
                pl-10 pr-4 text-sm placeholder:text-neutral-400
                focus:ring-2 focus:ring-primary/40 focus:border-primary
                transition
              "
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f, i) => (
              <button
                key={i}
                className="
                  rounded-full border border-neutral-300 bg-white dark:bg-neutral-950
                  px-3 py-1 text-xs text-neutral-700 dark:text-neutral-300
                  hover:border-primary/40 hover:bg-primary/5 transition
                "
              >
                {f}
              </button>
            ))}
          </div>

          {/* Trending / Top Rated / New */}
          <div className="flex items-center gap-3">
            {[
              { id: "trending", label: "Trending" },
              { id: "new", label: "New" },
              { id: "top", label: "Top Rated" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSort(tab.id)}
                className={`
                  px-3 py-1.5 text-xs rounded-full transition
                  ${
                    activeSort === tab.id
                      ? "bg-primary text-white"
                      : "bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                  }
                `}
              >
                {tab.label}
              </button>
            ))}

            {/* Sort dropdown fake button */}
            <button
              className="
                ml-auto flex items-center gap-1 rounded-full bg-neutral-200 dark:bg-neutral-800
                px-3 py-1 text-xs text-neutral-700 dark:text-neutral-300
              "
            >
              <SortAsc className="h-3.5 w-3.5" />
              Sort
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Grid of Community Cards                                            */}
        {/* ------------------------------------------------------------------ */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 pb-10">
          {COMMUNITY_ITEMS.map((item) => (
            <CommunityCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Card Component                                                              */
/* -------------------------------------------------------------------------- */

function CommunityCard({ item }: any) {
  return (
    <div
      className="
        group flex flex-col rounded-2xl border border-neutral-200
        dark:border-neutral-800 bg-white dark:bg-neutral-950
        p-4 shadow-sm hover:shadow-md transition
      "
    >
      {/* Badge */}
      {item.badge && (
        <span className="
          mb-2 inline-block w-fit rounded-full bg-primary/10 text-primary
          px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide
        ">
          {item.badge}
        </span>
      )}

      {/* Title + Description */}
      <div className="space-y-1 flex-1">
        <p className="text-sm font-semibold line-clamp-1">{item.name}</p>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {item.description}
        </p>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between">

        {/* Author */}
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center">
            <User className="h-3.5 w-3.5 text-neutral-600 dark:text-neutral-400" />
          </div>
          <span className="text-xs text-neutral-600 dark:text-neutral-300">
            {item.author}
          </span>
        </div>

        {/* Likes + Installs */}
        <div className="flex items-center gap-4 text-xs text-neutral-500">
          <span className="flex items-center gap-1">
            <ThumbsUp className="h-3.5 w-3.5" />
            {item.likes}
          </span>
          <span className="flex items-center gap-1">
            <Download className="h-3.5 w-3.5" />
            {item.installs}
          </span>
        </div>
      </div>
    </div>
  );
}
