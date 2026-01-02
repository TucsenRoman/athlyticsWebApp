"use client";

import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  GitBranch,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

type RouteClass = "independent" | "primary" | "secondary";

interface RouteRow {
  id: string;
  name: string;
  updatedAt: string;
  route_class: RouteClass;
}

interface WorkspaceRouteManagerProps {
  activeLedger: {
    id: string;
    name: string;
  } | null;
}

/* -------------------------------------------------------------------------- */
/* MOCK DATA (FOR NOW)                                                        */
/* -------------------------------------------------------------------------- */

const MOCK_ROUTES: RouteRow[] = [
  {
    id: "r1",
    name: "Auto-Fill MaxV Block",
    updatedAt: "2025-11-20T10:00:00.000Z",
    route_class: "primary",
  },
  {
    id: "r2",
    name: "Eligibility Sync",
    updatedAt: "2025-11-18T14:30:00.000Z",
    route_class: "secondary",
  },
  {
    id: "r3",
    name: "Workout Import (CSV)",
    updatedAt: "2025-11-10T08:15:00.000Z",
    route_class: "independent",
  },
];

/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT                                                             */
/* -------------------------------------------------------------------------- */

export default function WorkspaceRouteManager({
  activeLedger,
}: WorkspaceRouteManagerProps) {
  const [routes] = useState<RouteRow[]>(MOCK_ROUTES);
  const [expanded, setExpanded] = useState<Record<RouteClass, boolean>>({
    primary: true,
    secondary: true,
    independent: true,
  });

  /* ---------------------------------------------------------------------- */
  /* HELPERS                                                                */
  /* ---------------------------------------------------------------------- */

  const formatDate = (iso: string) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const grouped: Record<RouteClass, RouteRow[]> = {
    primary: routes.filter((r) => r.route_class === "primary"),
    secondary: routes.filter((r) => r.route_class === "secondary"),
    independent: routes.filter((r) => r.route_class === "independent"),
  };

  const toggleGroup = (key: RouteClass) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderRouteCard = (route: RouteRow) => (
    <div
      key={route.id}
      className="
        flex items-center justify-between
        bg-white border border-[hsl(var(--gray-200))]
        px-4 py-3 rounded-xl shadow-sm
        hover:bg-[hsl(var(--gray-50))]
        transition
      "
    >
      <div>
        <div className="font-medium text-sm">{route.name}</div>
        <div className="text-xs opacity-40">
          Updated {formatDate(route.updatedAt)}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="opacity-50 hover:opacity-100 transition">
          <Pencil className="w-4 h-4" />
        </button>

        <button className="opacity-50 hover:opacity-100 transition">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const renderGroup = (label: string, key: RouteClass) => {
    const list = grouped[key];
    if (!list.length) return null;

    const open = expanded[key];

    return (
      <div className="flex flex-col gap-2">
        {/* Group header */}
        <button
          className="flex items-center justify-between px-1 py-1 select-none"
          onClick={() => toggleGroup(key)}
        >
          <div className="text-xs font-semibold uppercase tracking-wide opacity-60">
            {label}
          </div>

          {open ? (
            <ChevronDown className="h-4 w-4 opacity-60" />
          ) : (
            <ChevronRight className="h-4 w-4 opacity-60" />
          )}
        </button>

        {/* Group list */}
        {open && (
          <div className="flex flex-col gap-2 ml-1">
            {list.map(renderRouteCard)}
          </div>
        )}
      </div>
    );
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full opacity-40 gap-2">
      <GitBranch className="w-8 h-8" />
      <div className="text-sm">No routes yet</div>
    </div>
  );

  /* ---------------------------------------------------------------------- */
  /* RENDER                                                                 */
  /* ---------------------------------------------------------------------- */

  if (!activeLedger) {
    return (
      <div className="flex-1 flex items-center justify-center opacity-40 text-sm">
        Select a ledger to manage routes.
      </div>
    );
  }

  const hasAnyRoutes =
    grouped.primary.length ||
    grouped.secondary.length ||
    grouped.independent.length;

  return (
    <div className="p-8 flex flex-col gap-8">

      {/* TOP BAR */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xl font-semibold">Routes</div>
          <div className="text-sm opacity-50">
            Ledger: {activeLedger.name}
          </div>
        </div>

        <button
          className="
            flex items-center gap-2 px-4 py-2 rounded-lg
            bg-[hsl(var(--dom-dk))] text-white
            hover:brightness-110 active:scale-[0.97]
            transition
          "
        >
          <Plus className="h-4 w-4" />
          New Route
        </button>
      </div>

      {/* GROUPED ROUTES */}
      {!hasAnyRoutes ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col gap-6">
          {renderGroup("Primary", "primary")}
          {renderGroup("Secondary", "secondary")}
          {renderGroup("Independent", "independent")}
        </div>
      )}
    </div>
  );
}
