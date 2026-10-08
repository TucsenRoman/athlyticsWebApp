/* eslint-disable */

import { useMemo } from "react";
import {
  Users,
  Package,
  LayoutTemplate,
  Download,
  MessageCircle,
  GitBranch,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type CommunityMode = "discover" | "social" | "following";

interface FollowingItem {
  id: string;
  name: string;
  description: string;
  type: "template" | "package";
  creator: { id: string; name: string; role: string };
  installs: number;
  comments: number;
  forks: number;
  badge?: string;
  createdAt: string;
}

/* -------------------------------------------------------------------------- */
/* Mock: Items from coaches you follow                                       */
/* -------------------------------------------------------------------------- */

const MOCK_FOLLOWING_ITEMS: FollowingItem[] = [
  {
    id: "lee-speed-template",
    name: "Speed Session Template",
    description: "Coach Lee’s exact sprint session layout with embedded timing blocks.",
    type: "template",
    creator: { id: "lee", name: "Coach Lee", role: "Sprints · HS" },
    installs: 201,
    comments: 14,
    forks: 6,
    badge: "Popular",
    createdAt: "2025-06-22",
  },
  {
    id: "rivera-performance-package",
    name: "Performance Testing Package",
    description:
      "40y, fly runs, RSI, broad jump, vertical, and milestone tracking cards.",
    type: "package",
    creator: { id: "rivera", name: "Coach Rivera", role: "Performance" },
    installs: 156,
    comments: 9,
    forks: 4,
    createdAt: "2025-06-11",
  },
];

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function FollowingMode({
  mode,
  query,
}: {
  mode: CommunityMode;
  query: string;
}) {
  const filtered = useMemo(() => {
    if (!query.trim()) return MOCK_FOLLOWING_ITEMS;
    const q = query.toLowerCase();
    return MOCK_FOLLOWING_ITEMS.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.creator.name.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="space-y-10">
      {/* SECTION HEADER ------------------------------------------------------ */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[hsl(var(--secondary))]">
          From Coaches You Follow
        </h2>
        <span className="text-xs text-muted-foreground">
          {filtered.length} item{filtered.length !== 1 && "s"}
        </span>
      </div>

      {/* EMPTY STATE --------------------------------------------------------- */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-sm text-muted-foreground gap-2">
          <Users className="h-6 w-6 text-[hsl(var(--secondary))]" />
          <p>No shared templates or packages match your search.</p>
          <p className="text-xs max-w-xs text-center">
            Try clearing the search or check again later.
          </p>
        </div>
      )}

      {/* GRID ---------------------------------------------------------------- */}
      {filtered.length > 0 && (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => (
            <FollowingCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* CARD                                                                       */
/* -------------------------------------------------------------------------- */

function FollowingCard({ item }: { item: FollowingItem }) {
  const isTemplate = item.type === "template";

  return (
    <button
      type="button"
      className="
        group flex flex-col gap-2 rounded-2xl bg-card px-4 py-3 text-left transition
        border border-[hsl(var(--border))]
        shadow-sm hover:shadow-[0_4px_18px_rgba(20,30,60,0.15)]
      "
    >
      <div className="flex items-start gap-3">
        <div
          className={`
            h-9 w-9 flex items-center justify-center rounded-2xl
            ${
              isTemplate
                ? "bg-primary/10 text-primary"
                : "bg-secondary/20 text-secondary"
            }
          `}
        >
          {isTemplate ? (
            <LayoutTemplate className="h-4 w-4" />
          ) : (
            <Package className="h-4 w-4" />
          )}
        </div>

        <div className="flex-1 space-y-1">
          <p className="text-sm font-semibold text-foreground line-clamp-1">
            {item.name}
          </p>

          <p className="text-xs text-muted-foreground line-clamp-2">
            {item.description}
          </p>

          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="font-medium text-foreground">{item.creator.name}</span>
            <span className="text-[10px] line-clamp-1">{item.creator.role}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground mt-1">
        <span className="inline-flex items-center gap-1">
          <Download className="h-3 w-3" />
          {item.installs}
        </span>
        <span className="inline-flex items-center gap-1">
          <MessageCircle className="h-3 w-3" />
          {item.comments}
        </span>
        <span className="inline-flex items-center gap-1">
          <GitBranch className="h-3 w-3" />
          {item.forks}
        </span>
      </div>
    </button>
  );
}
