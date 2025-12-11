"use client";

import { Button } from "@/components/ui/button";
import {
  Package,
  Copy,
  Star,
  Brush,
  BarChart3,
  Map,
} from "lucide-react";

interface ManagerToolsProps {
  onOpenPackageHub?: () => void;
  onDuplicateLedger?: () => void;
  onFavoriteLedger?: () => void;
  onBulkTools?: () => void;
  onOpenInsights?: () => void;
  onOpenMap?: () => void;
}

export default function ManagerTools({
  onOpenPackageHub,
  onDuplicateLedger,
  onFavoriteLedger,
  onBulkTools,
  onOpenInsights,
  onOpenMap,
}: ManagerToolsProps) {
  return (
    <div className="flex items-center justify-between gap-6 w-full">

      {/* LEFT — STATUS OR CONTEXT LABEL */}
      <div>
        <span
          className="
            h-6 px-3 flex items-center
            text-xs font-medium rounded-full
            bg-[var(--gray-100)]
            text-[var(--text)]
            border border-[var(--border)]
            shadow-sm
          "
        >
          Manager Tools
        </span>
      </div>

      {/* RIGHT — ICON BUTTONS */}
      <div className="flex items-center gap-1">

        {/* PACKAGE HUB */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenPackageHub}
          title="Package Hub"
          className="
            h-7 w-7 rounded-full
            text-[var(--text)]
            hover:text-[var(--fvr-blue)]
            hover:bg-[var(--fvr-blue-bg)]
          "
        >
          <Package className="h-4 w-4" />
        </Button>

        {/* DUPLICATE LEDGER */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onDuplicateLedger}
          title="Duplicate Ledger"
          className="
            h-7 w-7 rounded-full
            text-[var(--text)]
            hover:text-[var(--fvr-purple)]
            hover:bg-[var(--fvr-purple-bg)]
          "
        >
          <Copy className="h-4 w-4" />
        </Button>

        {/* FAVORITE */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onFavoriteLedger}
          title="Favorite Ledger"
          className="
            h-7 w-7 rounded-full
            text-[var(--text)]
            hover:text-[var(--fvr-yellow)]
            hover:bg-[var(--fvr-yellow-bg)]
          "
        >
          <Star className="h-4 w-4" />
        </Button>

        {/* BULK TOOLS */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onBulkTools}
          title="Bulk Edit Tools"
          className="
            h-7 w-7 rounded-full
            text-[var(--text)]
            hover:text-[var(--fvr-coral)]
            hover:bg-[var(--fvr-coral-bg)]
          "
        >
          <Brush className="h-4 w-4" />
        </Button>

        {/* INSIGHTS */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenInsights}
          title="Data Insights"
          className="
            h-7 w-7 rounded-full
            text-[var(--text)]
            hover:text-[var(--fvr-green)]
            hover:bg-[var(--fvr-green-bg)]
          "
        >
          <BarChart3 className="h-4 w-4" />
        </Button>

        {/* MAP */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenMap}
          title="Athlete Map"
          className="
            h-7 w-7 rounded-full
            text-[var(--text)]
            hover:text-[var(--fvr-indigo)]
            hover:bg-[var(--fvr-indigo-bg)]
          "
        >
          <Map className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
