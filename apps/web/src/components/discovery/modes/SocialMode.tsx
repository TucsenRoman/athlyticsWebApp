/* eslint-disable */

import { useMemo } from "react";
import {
  Users,
  LayoutTemplate,
  Package,
  MessageCircle,
  Crown,
  Download,
  GitBranch,
} from "lucide-react";
import { motion } from "framer-motion";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type CommunityMode = "discover" | "social" | "following";

interface SocialItem {
  id: string;
  name: string;
  description: string;
  type: "template" | "package";
  installs: number;
  comments: number;
  forks: number;
  createdAt: string;
  badge?: string;
  isOfficial?: boolean;
}

/* -------------------------------------------------------------------------- */
/* Mock Data                                                                  */
/* -------------------------------------------------------------------------- */

const SOCIAL_SHARED: SocialItem[] = [
  {
    id: "my-template-1",
    name: "Sprint Session Template",
    description: "Warmup, accel, maxV, and speed endurance blocks with autofill.",
    type: "template",
    installs: 91,
    comments: 5,
    forks: 3,
    createdAt: "2025-06-11",
    badge: "Starter",
  },
  {
    id: "my-package-1",
    name: "HS Speed Development Package",
    description: "Testing, load monitoring, and weekly speed cycle templates linked.",
    type: "package",
    installs: 147,
    comments: 12,
    forks: 6,
    createdAt: "2025-05-29",
  },
];

const SOCIAL_FOLLOWERS = [
  { id: "coach-a", name: "Coach Adams", role: "XC/Track" },
  { id: "coach-b", name: "Coach Nguyen", role: "Basketball" },
];

const SOCIAL_FOLLOWING = [
  { id: "coach-lee", name: "Coach Lee", role: "Sprints · HS" },
  { id: "coach-rivera", name: "Coach Rivera", role: "Performance" },
];

/* -------------------------------------------------------------------------- */
/* Main Component                                                             */
/* -------------------------------------------------------------------------- */

export default function SocialMode({
  mode,
  query,
}: {
  mode: CommunityMode;
  query: string;
}) {
  const filteredShared = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SOCIAL_SHARED;
    return SOCIAL_SHARED.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="space-y-12">
      {/* NETWORK OVERVIEW --------------------------------------------------- */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-secondary tracking-wide">
          Network Overview
        </h2>

        <div
          className="
            flex flex-col gap-4 rounded-3xl bg-card p-5 
            border border-[hsl(var(--border))]
            shadow-sm
          "
        >
          <div className="flex items-center justify-between text-sm">
            <NetworkStat label="Followers" value={SOCIAL_FOLLOWERS.length} />
            <div className="h-10 w-px bg-border/80" />
            <NetworkStat label="Following" value={SOCIAL_FOLLOWING.length} />
          </div>

          <div className="text-xs text-muted-foreground">
            Connected coaches influence what you see in Social mode—
            recommendations, template shares, and updates.
          </div>
        </div>
      </section>

      {/* SHARED ITEMS ------------------------------------------------------- */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-secondary tracking-wide">
            Your Shared Items
          </h2>
          <span className="text-xs text-muted-foreground">
            {filteredShared.length} item{filteredShared.length !== 1 && "s"}
          </span>
        </div>

        {filteredShared.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredShared.map((item) => (
              <SocialCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Subcomponents                                                              */
/* -------------------------------------------------------------------------- */

function NetworkStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center w-full">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-xl font-bold">{value}</span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center gap-3">
      <Package className="h-7 w-7 text-secondary" />
      <p className="text-sm text-muted-foreground">
        No shared items match your search.
      </p>
      <p className="text-xs text-muted-foreground max-w-xs">
        Try adjusting your keywords or clearing your search input.
      </p>
    </div>
  );
}

function SocialCard({ item }: { item: SocialItem }) {
  const isTemplate = item.type === "template";

  const bgClasses = isTemplate
    ? "bg-primary/10 text-primary"
    : "bg-secondary/15 text-secondary";

  const Icon = isTemplate ? LayoutTemplate : Package;

  return (
    <motion.button
      type="button"
      whileHover={{ y: -3 }}
      transition={{ duration: 0.18 }}
      className="
        group text-left rounded-3xl p-5 
        bg-card border border-[hsl(var(--border))]
        shadow-sm hover:shadow-[0_6px_20px_rgba(20,30,60,0.18)]
        flex flex-col gap-3
      "
    >
      {/* TOP ROW ------------------------------------------------------------ */}
      <div className="flex items-start gap-3">
        <div
          className={`
            h-10 w-10 rounded-2xl flex items-center justify-center
            ${bgClasses}
          `}
        >
          <Icon className="h-4 w-4" />
        </div>

        <div className="flex-1 space-y-1">
          <p className="font-semibold leading-snug line-clamp-1">
            {item.name}
          </p>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {item.description}
          </p>
        </div>
      </div>

      {/* BADGES ------------------------------------------------------------- */}
      {item.badge || item.isOfficial ? (
        <div className="flex gap-2 mt-1">
          {item.badge && (
            <span className="text-[10px] px-2 py-[2px] rounded-full bg-primary/10 text-primary font-medium">
              {item.badge}
            </span>
          )}
          {item.isOfficial && (
            <span className="text-[10px] px-2 py-[2px] rounded-full bg-secondary/15 text-secondary font-medium inline-flex items-center gap-1">
              <Crown className="h-3 w-3" />
              Official
            </span>
          )}
        </div>
      ) : null}

      {/* STATS -------------------------------------------------------------- */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-2">
        <IconWithText icon={Download} text={item.installs} />
        <IconWithText icon={MessageCircle} text={item.comments} />
        <IconWithText icon={GitBranch} text={item.forks} />
      </div>
    </motion.button>
  );
}

function IconWithText({
  icon: Icon,
  text,
}: {
  icon: any;
  text: number;
}) {
  return (
    <span className="inline-flex items-center gap-1">
      <Icon className="h-3 w-3" />
      {text}
    </span>
  );
}
