// src/components/ledgers/LedgerMarketplaceShell.tsx
import { useMemo, useState } from "react";
import {
  Search,
  Sparkles,
  Star,
  LayoutTemplate,
  Package,
  Flame,
  Tag,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/* Types & Mock Data                                                          */
/* -------------------------------------------------------------------------- */

type SportId = "all" | "cross_country" | "track" | "basketball" | "football" | "multi";
type ItemType = "template" | "package";

interface MarketplaceItem {
  id: string;
  name: string;
  description: string;
  sport: Exclude<SportId, "all">;
  type: ItemType;
  badge?: string;
  isFeatured?: boolean;
}

const SPORTS: { id: SportId; label: string }[] = [
  { id: "all", label: "All sports" },
  { id: "cross_country", label: "Cross Country" },
  { id: "track", label: "Track & Field" },
  { id: "basketball", label: "Basketball" },
  { id: "football", label: "Football" },
  { id: "multi", label: "Multi-sport" },
];

const TYPE_TABS: { id: "all" | ItemType; label: string }[] = [
  { id: "all", label: "All" },
  { id: "template", label: "Templates" },
  { id: "package", label: "Packages" },
];

// Purely visual mock items – tweak names/labels later
const MOCK_ITEMS: MarketplaceItem[] = [
  {
    id: "xc-roster-template",
    name: "XC Roster + Eligibility Template",
    description: "Pre-built roster ledger with grade, eligibility, and contact columns for distance squads.",
    sport: "cross_country",
    type: "template",
    badge: "Starter",
    isFeatured: true,
  },
  {
    id: "track-meet-package",
    name: "Track Meet Day Package",
    description: "Attendance, event entries, relay cards, and results ledgers bundled together.",
    sport: "track",
    type: "package",
    badge: "Popular",
    isFeatured: true,
  },
  {
    id: "basketball-practice-template",
    name: "Basketball Practice Plan Template",
    description: "Blocks for warm-up, skill blocks, small-sided games, and scrimmage tracking.",
    sport: "basketball",
    type: "template",
  },
  {
    id: "football-install-package",
    name: "Football Install Package",
    description: "Practice scripts, install checklists, and position group attendance.",
    sport: "football",
    type: "package",
  },
  {
    id: "multi-performance-package",
    name: "Performance Tracking Package",
    description: "Universal PR/SB, testing, and progression ledgers for any sport.",
    sport: "multi",
    type: "package",
    badge: "Multi-sport",
  },
  {
    id: "notes-comments-template",
    name: "Notes & Comments Template",
    description: "Coach notes, athlete reflections, and follow-up flags wired for any roster.",
    sport: "multi",
    type: "template",
  },
];

/* -------------------------------------------------------------------------- */
/* Shell Component                                                            */
/* -------------------------------------------------------------------------- */

export default function LedgerMarketplaceShell() {
  const [query, setQuery] = useState("");
  const [activeSport, setActiveSport] = useState<SportId>("all");
  const [activeType, setActiveType] = useState<"all" | ItemType>("all");

  const filteredItems = useMemo(() => {
    return MOCK_ITEMS.filter((item) => {
      if (activeSport !== "all" && item.sport !== activeSport) return false;
      if (activeType !== "all" && item.type !== activeType) return false;

      if (!query.trim()) return true;

      const q = query.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      );
    });
  }, [activeSport, activeType, query]);

  const featured = filteredItems.filter((i) => i.isFeatured);
  const templates = filteredItems.filter((i) => i.type === "template");
  const packages = filteredItems.filter((i) => i.type === "package");

  return (
    <div className="h-full w-full overflow-hidden bg-neutral-50/80 dark:bg-neutral-900/80">
      <div className="h-full w-full overflow-y-auto px-8 py-6 space-y-8">
        {/* Header / Hero ----------------------------------------------------- */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h1 className="text-xl font-semibold tracking-tight">
                  Athlytics Marketplace
                </h1>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Browse starter templates, ledger packages, and sport-specific setups.
              </p>
            </div>

            <div className="hidden md:flex items-center gap-3 text-xs text-muted-foreground">
              <Flame className="h-4 w-4 text-primary" />
              <span>Early preview shell – visuals only.</span>
            </div>
          </div>

          {/* Subtle hero card */}
          <div className="rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-amber-100/40 dark:from-primary/20 dark:via-primary/10 dark:to-neutral-800 border border-primary/10 px-6 py-4 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-primary">
                Featured
              </p>
              <p className="text-sm font-semibold">
                Essentials package for new programs
              </p>
              <p className="text-xs text-muted-foreground max-w-md">
                Start with a roster, attendance, meet-day, and notes ledgers pre-wired
                for high school coaches.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs">
              <Star className="h-4 w-4 fill-primary text-primary" />
              <span className="text-muted-foreground">Most coaches start here</span>
            </div>
          </div>
        </div>

        {/* Search + Filters -------------------------------------------------- */}
        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative max-w-xl">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
              <Search className="h-4 w-4 text-muted-foreground" />
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search templates, packages, or sports…"
              className="
                w-full h-10 rounded-full border border-neutral-200
                bg-white/80 dark:bg-neutral-950/80
                pl-9 pr-4 text-sm
                placeholder:text-neutral-400
                focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-primary/40 focus-visible:border-primary/50
                transition
              "
            />
          </div>

          {/* Sport filters */}
          <div className="flex flex-wrap items-center gap-2">
            {SPORTS.map((sport) => (
              <button
                key={sport.id}
                type="button"
                onClick={() => setActiveSport(sport.id)}
                className={`
                  inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs
                  transition
                  ${
                    activeSport === sport.id
                      ? "border-primary/80 bg-primary/10 text-primary"
                      : "border-neutral-200 bg-white/60 text-neutral-700 hover:border-primary/30 hover:bg-primary/5"
                  }
                `}
              >
                <span>{sport.label}</span>
              </button>
            ))}
          </div>

          {/* Type tabs (All / Templates / Packages) */}
          <div className="inline-flex items-center rounded-full bg-neutral-100/80 dark:bg-neutral-800/80 p-1 text-xs">
            {TYPE_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveType(tab.id)}
                className={`
                  inline-flex items-center gap-1 rounded-full px-3 py-1 transition
                  ${
                    activeType === tab.id
                      ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-950 dark:text-white"
                      : "text-neutral-600 dark:text-neutral-300"
                  }
                `}
              >
                {tab.id === "template" && (
                  <LayoutTemplate className="h-3 w-3" />
                )}
                {tab.id === "package" && <Package className="h-3 w-3" />}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Featured Row ------------------------------------------------------ */}
        {featured.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold tracking-tight">
                Featured for your filters
              </h2>
              <span className="text-xs text-muted-foreground">
                {featured.length} item{featured.length !== 1 && "s"}
              </span>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {featured.map((item) => (
                <MarketplaceCard key={item.id} item={item} accent="featured" />
              ))}
            </div>
          </section>
        )}

        {/* Templates Section ------------------------------------------------- */}
        {templates.length > 0 && (
          <section className="space-y-3">
            <SectionHeader
              title="Templates"
              subtitle="Pre-built layouts for ledgers, tabs, and comments."
            />
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {templates.map((item) => (
                <MarketplaceCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}

        {/* Packages Section -------------------------------------------------- */}
        {packages.length > 0 && (
          <section className="space-y-3 pb-10">
            <SectionHeader
              title="Packages"
              subtitle="Bundles of ledgers, routes, and automations that work together."
            />
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {packages.map((item) => (
                <MarketplaceCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}

        {/* Empty state if nothing matches ----------------------------------- */}
        {filteredItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center text-sm text-muted-foreground gap-2">
            <Tag className="h-6 w-6 text-primary/70" />
            <p>No items match that combo yet.</p>
            <p className="text-xs">
              Try clearing the search or switching sports/types.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Subcomponents                                                              */
/* -------------------------------------------------------------------------- */

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
      <p className="text-xs text-muted-foreground max-w-md">{subtitle}</p>
    </div>
  );
}

function MarketplaceCard({
  item,
  accent,
}: {
  item: MarketplaceItem;
  accent?: "featured";
}) {
  const isTemplate = item.type === "template";

  return (
    <button
      type="button"
      className={`
        group relative flex w-full flex-col items-stretch gap-2 rounded-2xl border
        bg-white/90 dark:bg-neutral-950/90
        px-4 py-3 text-left shadow-sm/5
        hover:shadow-md hover:border-primary/40 hover:-translate-y-[1px]
        transition
        ${accent === "featured" ? "border-primary/40" : "border-neutral-200"}
      `}
    >
      {/* Icon + Title row */}
      <div className="flex items-start gap-3">
        <div
          className={`
            flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl
            text-primary
            ${
              isTemplate
                ? "bg-primary/10"
                : "bg-amber-100/80 dark:bg-amber-900/40"
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
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold leading-snug line-clamp-1">
              {item.name}
            </p>
            {item.badge && (
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                {item.badge}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {item.description}
          </p>
        </div>
      </div>

      {/* Footer row */}
      <div className="mt-1 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 dark:bg-neutral-800">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="capitalize">
              {item.sport.replace("_", " ")}
            </span>
          </span>
          <span className="hidden sm:inline text-[10px] uppercase tracking-wide">
            {item.type === "template" ? "Template" : "Package"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {accent === "featured" && (
            <div className="flex items-center gap-1 text-[11px] text-primary">
              <Star className="h-3 w-3 fill-primary" />
              <span>Recommended</span>
            </div>
          )}
          <span
            className="
              inline-flex items-center justify-center rounded-full
              border border-primary/60 bg-primary/10 px-3 py-1
              text-[11px] font-medium text-primary
              group-hover:bg-primary group-hover:text-white group-hover:border-primary
              transition
            "
          >
            Add
          </span>
        </div>
      </div>
    </button>
  );
}
