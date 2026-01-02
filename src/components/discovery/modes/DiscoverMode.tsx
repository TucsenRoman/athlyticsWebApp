/* eslint-disable */

import { useMemo, useState } from "react";
import {
  LayoutTemplate,
  Package,
  Tag,
  MessageCircle,
  Download,
  GitBranch,
  Crown,
} from "lucide-react";

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
type CommunityMode = "discover" | "social" | "following";

interface CommunityItem {
  id: string;
  name: string;
  description: string;
  sport: Exclude<SportId, "all">;
  type: ItemType;
  badge?: string;
  isFeatured?: boolean;
  isOfficial?: boolean;
  creator: { id: string; name: string; role: string };
  installs: number;
  comments: number;
  forks: number;
  createdAt: string;
  tags: string[];
}

/* -------------------------------------------------------------------------- */
/* MOCK DATA                                                                  */
/* -------------------------------------------------------------------------- */

const MOCK_ITEMS: CommunityItem[] = [
  {
    id: "xc-roster-template",
    name: "XC Roster + Eligibility Template",
    description:
      "Pre-built roster ledger with grade, eligibility, and contact columns wired for distance squads.",
    sport: "cross_country",
    type: "template",
    badge: "Starter",
    isFeatured: true,
    isOfficial: true,
    creator: { id: "coach-1", name: "Coach Miller", role: "XC / Track · HS" },
    installs: 182,
    comments: 14,
    forks: 7,
    createdAt: "2025-07-01",
    tags: ["roster", "eligibility", "contact"],
  },
  {
    id: "track-meet-package",
    name: "Track Meet Day Package",
    description:
      "Attendance, event entries, relay cards, and results ledgers bundled for fast meet-day operations.",
    sport: "track",
    type: "package",
    badge: "Popular",
    isFeatured: true,
    isOfficial: true,
    creator: { id: "coach-2", name: "Coach Lee", role: "Sprints / Relays" },
    installs: 264,
    comments: 21,
    forks: 11,
    createdAt: "2025-06-20",
    tags: ["meets", "entries", "results"],
  },
];

/* -------------------------------------------------------------------------- */
/* MAIN — DISCOVER MODE                                                       */
/* -------------------------------------------------------------------------- */

export default function DiscoverMode({
  mode,
  query,
}: {
  mode: CommunityMode;
  query: string;
}) {
  const [activeSport] = useState<SportId>("all");
  const [activeType] = useState<"all" | ItemType>("all");
  const [sort] = useState<SortId>("trending");

  const filteredItems = useMemo(() => {
    const base = MOCK_ITEMS.filter((item) => {
      if (activeSport !== "all" && item.sport !== activeSport) return false;
      if (activeType !== "all" && item.type !== activeType) return false;

      if (!query.trim()) return true;
      const q = query.toLowerCase();

      return (
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.creator.name.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q))
      );
    });

    const sorted = [...base].sort((a, b) => {
      if (sort === "new") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }

      if (sort === "top") {
        const scoreA = a.installs + 2 * a.comments + 3 * a.forks;
        const scoreB = b.installs + 2 * b.comments + 3 * b.forks;
        return scoreB - scoreA;
      }

      const trendingA = 2 * a.comments + 3 * a.forks + a.installs * 0.5;
      const trendingB = 2 * b.comments + 3 * b.forks + b.installs * 0.5;
      return trendingB - trendingA;
    });

    return sorted;
  }, [activeSport, activeType, query, sort]);

  const featured = filteredItems.filter((i) => i.isFeatured);
  const templates = filteredItems.filter((i) => i.type === "template");
  const packages = filteredItems.filter((i) => i.type === "package");

  return (
    <div className="h-full w-full bg-[hsl(var(--background))]">
      <div className="h-full w-full overflow-y-auto px-6 lg:px-8 py-6 space-y-10">

        {/* NON-DISCOVER MODES ------------------------------------------------ */}
        {mode !== "discover" && (
          <div className="flex flex-col items-center justify-center py-20 text-sm text-[hsl(var(--gray-500))] gap-3">
            <Package className="h-7 w-7 text-[hsl(var(--gray-400))]" />
            <p className="font-medium">
              {mode === "social"
                ? "Your social hub will appear here."
                : "Templates from coaches you follow will appear here."}
            </p>
            <p className="text-xs max-w-sm text-center text-[hsl(var(--gray-500))]">
              This view uses the same cards and filters as Discover.
            </p>
          </div>
        )}

        {/* DISCOVER MODE ----------------------------------------------------- */}
        {mode === "discover" && (
          <>
            {/* FEATURED ------------------------------------------------------ */}
            {featured.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold text-[hsl(var(--dom-dk))]">
                    Trending for your filters
                  </h2>
                  <span className="text-xs text-[hsl(var(--gray-500))]">
                    {featured.length} item{featured.length !== 1 && "s"}
                  </span>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {featured.map((item) => (
                    <CommunityCard key={item.id} item={item} featured />
                  ))}
                </div>
              </section>
            )}

            {/* TEMPLATES ------------------------------------------------------ */}
            {templates.length > 0 && (
              <section className="space-y-3">
                <SectionHeader
                  title="Templates"
                  subtitle="Pre-built ledgers shared by coaches—install and customize."
                />
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {templates.map((item) => (
                    <CommunityCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            )}

            {/* PACKAGES ------------------------------------------------------- */}
            {packages.length > 0 && (
              <section className="space-y-3 pb-12">
                <SectionHeader
                  title="Packages"
                  subtitle="Bundles of ledgers, routes, and workflows that work together."
                />
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {packages.map((item) => (
                    <CommunityCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            )}

            {/* EMPTY ---------------------------------------------------------- */}
            {filteredItems.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-sm text-[hsl(var(--gray-500))] gap-2">
                <Tag className="h-6 w-6 text-[hsl(var(--gray-400))]" />
                <p>No community items match that combo yet.</p>
                <p className="text-xs max-w-xs text-center text-[hsl(var(--gray-500))]">
                  Try clearing the search or switching filters.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* SECTION HEADER                                                             */
/* -------------------------------------------------------------------------- */

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <h2 className="text-sm font-semibold text-[hsl(var(--dom-dk))]">
        {title}
      </h2>
      <p className="text-xs text-[hsl(var(--gray-500))] max-w-md">{subtitle}</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* COMMUNITY CARD                                                             */
/* -------------------------------------------------------------------------- */

function CommunityCard({
  item,
  featured,
}: {
  item: CommunityItem;
  featured?: boolean;
}) {
  const isTemplate = item.type === "template";

  return (
    <button
      type="button"
      className={`
        group flex flex-col gap-2 rounded-2xl
        bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))]
        px-4 py-3 text-left transition
        border border-[hsl(var(--border))]
        ${featured ? "ring-1 ring-[hsl(var(--dom-dk))]" : "hover:shadow-lg"}
      `}
    >
      {/* TOP ROW */}
      <div className="flex items-start gap-3">
        {/* ICON */}
        <div
          className="
            h-9 w-9 flex items-center justify-center rounded-xl
            bg-[hsl(var(--gray-200))]
            text-[hsl(var(--gray-700))]
          "
        >
          {isTemplate ? (
            <LayoutTemplate className="h-4 w-4" />
          ) : (
            <Package className="h-4 w-4" />
          )}
        </div>

        {/* NAME + METADATA */}
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-[hsl(var(--foreground))] leading-snug line-clamp-1">
              {item.name}
            </p>

            {item.isOfficial && (
              <span
                className="
                  inline-flex items-center gap-1 rounded-full px-2 py-0.5
                  text-[10px] font-medium uppercase tracking-wide
                  bg-[hsl(var(--gray-200))]
                  text-[hsl(var(--gray-700))]
                "
              >
                <Crown className="h-3 w-3" />
                Official
              </span>
            )}

            {item.badge && (
              <span
                className="
                  rounded-full px-2 py-0.5 text-[10px]
                  font-semibold uppercase tracking-wide
                  bg-[hsl(var(--gray-200))]
                  text-[hsl(var(--gray-700))]
                "
              >
                {item.badge}
              </span>
            )}
          </div>

          <p className="text-xs text-[hsl(var(--gray-600))] line-clamp-2">
            {item.description}
          </p>

          {/* CREATOR */}
          <div className="flex items-center gap-2 text-[11px] text-[hsl(var(--gray-600))]">
            <div className="flex items-center gap-1">
              <div
                className="
                  h-5 w-5 rounded-full text-[10px]
                  flex items-center justify-center font-semibold
                  bg-[hsl(var(--gray-200))]
                  text-[hsl(var(--gray-700))]
                "
              >
                {item.creator.name.charAt(0)}
              </div>

              <span className="font-medium text-[hsl(var(--foreground))]">
                {item.creator.name}
              </span>
            </div>

            <span className="text-[10px] line-clamp-1 text-[hsl(var(--gray-600))]">
              {item.creator.role}
            </span>
          </div>
        </div>
      </div>

      {/* TAGS */}
      {item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {item.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="
                inline-flex items-center rounded-full px-2 py-0.5
                text-[10px]
                bg-[hsl(var(--gray-lt))]
                text-[hsl(var(--gray-700))]
              "
            >
              #{tag}
            </span>
          ))}
          {item.tags.length > 3 && (
            <span className="text-[10px] text-[hsl(var(--gray-500))]">
              +{item.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* FOOTER */}
      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-[hsl(var(--gray-600))]">
          <span
            className="
              inline-flex items-center gap-1 rounded-full px-2 py-0.5
              bg-[hsl(var(--gray-200))]
              text-[hsl(var(--gray-700))]
            "
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--gray-700))]" />
            <span className="capitalize">
              {item.sport.replace("_", " ")}
            </span>
          </span>

          <span className="hidden sm:inline text-[10px] uppercase tracking-wide text-[hsl(var(--gray-500))]">
            {item.type === "template" ? "Template" : "Package"}
          </span>
        </div>

        {/* INSTALL */}
        <div className="flex items-center gap-2">
          {/* Stats */}
          <div className="hidden sm:flex items-center gap-2 text-[10px] text-[hsl(var(--gray-500))]">
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

          <span
            className="
              inline-flex items-center justify-center rounded-full px-3 py-1
              text-[11px] font-medium transition
              bg-[hsl(var(--dom-dk))]/20
              text-[hsl(var(--dom-dk))]
              hover:bg-[hsl(var(--dom-dk))]/30
            "
          >
            Install
          </span>
        </div>
      </div>
    </button>
  );
}
