"use client";

import React from "react";
import { Flame, Users, Download, MessageCircle } from "lucide-react";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type CommunityMode = "discover" | "social";

export type DiscoverFilter = "for_you" | "following";
export type SocialFilter = "posts" | "followers" | "installs";

export type FilterId = DiscoverFilter | SocialFilter;

/* -------------------------------------------------------------------------- */
/* Filter Configs                                                             */
/* -------------------------------------------------------------------------- */

const DISCOVER_FILTERS: { id: DiscoverFilter; label: string; icon?: any }[] = [
  { id: "for_you", label: "For You", icon: Flame },
  { id: "following", label: "Following", icon: Users },
];

const SOCIAL_FILTERS: { id: SocialFilter; label: string; icon?: any }[] = [
  { id: "posts", label: "Posts", icon: MessageCircle },
  { id: "followers", label: "Followers", icon: Users },
  { id: "installs", label: "Installs", icon: Download },
];

/* -------------------------------------------------------------------------- */
/* Component: DiscoveryFilters                                                */
/* -------------------------------------------------------------------------- */

export default function DiscoveryFilters({
  mode,
  active,
  setActive,
}: {
  mode: CommunityMode;
  active: FilterId;
  setActive: (id: FilterId) => void;
}) {
  const filters = mode === "discover" ? DISCOVER_FILTERS : SOCIAL_FILTERS;

  return (
    <div
      className="
        inline-flex items-center gap-1 px-1 py-1 rounded-full
        bg-[hsl(var(--gray-100))]
        dark:bg-[hsl(var(--gray-800))]
        text-sm
      "
    >
      {filters.map((f) => {
        const Icon = f.icon;

        return (
          <button
            key={f.id}
            onClick={() => setActive(f.id)}
            className={`
              px-3 py-1 rounded-full flex items-center gap-1 transition
              ${
                active === f.id
                  ? "bg-[hsl(var(--gray-300))] text-[hsl(var(--accent))] shadow-sm font-medium"
                  : "text-[hsl(var(--gray-600))] hover:bg-[hsl(var(--gray-200))]"
              }
            `}
          >
            {Icon && <Icon className="h-3 w-3" />}
            {f.label}
          </button>
        );
      })}
    </div>
  );
}
