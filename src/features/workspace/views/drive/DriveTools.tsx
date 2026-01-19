"use client";

import type { ExpansiveMenuItem } from "@/components/ui/navigation/expansivemenu";
import ExpansiveMenu from "@/components/ui/navigation/expansivemenu";

import {
  Package,
  Copy,
  Star,
  Brush,
  BarChart3,
  Map,
  ToolCase,
} from "lucide-react";

interface DriveToolsProps {
  onOpenPackageHub?: () => void;
  onDuplicateLedger?: () => void;
  onFavoriteLedger?: () => void;
  onBulkTools?: () => void;
  onOpenInsights?: () => void;
  onOpenMap?: () => void;
}

export default function DriveTools({
  onOpenPackageHub,
  onDuplicateLedger,
  onFavoriteLedger,
  onBulkTools,
  onOpenInsights,
  onOpenMap,
}: DriveToolsProps) {
  /* ---------------------------------------------------------------------- */
  /* MENU ITEMS                                                             */
  /* ---------------------------------------------------------------------- */

  const driveMenuItems = [
    {
      label: "Package Hub",
      icon: <Package className="h-4 w-4" />,
      action: onOpenPackageHub,
      flavor: "blue",
    },
    {
      label: "Duplicate Ledger",
      icon: <Copy className="h-4 w-4" />,
      action: onDuplicateLedger,
      flavor: "purple",
    },
    {
      label: "Favorite Ledger",
      icon: <Star className="h-4 w-4" />,
      action: onFavoriteLedger,
      flavor: "yellow",
    },
    {
      label: "Bulk Edit Tools",
      icon: <Brush className="h-4 w-4" />,
      action: onBulkTools,
      flavor: "coral",
    },
    {
      label: "Data Insights",
      icon: <BarChart3 className="h-4 w-4" />,
      action: onOpenInsights,
      flavor: "green",
    },
    {
      label: "Athlete Map",
      icon: <Map className="h-4 w-4" />,
      action: onOpenMap,
      flavor: "indigo",
    },
  ] satisfies ExpansiveMenuItem[];

  /* ---------------------------------------------------------------------- */
  /* RENDER                                                                 */
  /* ---------------------------------------------------------------------- */

  return (
    <div>
      <ExpansiveMenu
        items={driveMenuItems}
        expand="line"
        direction="left"
        spacing={36}
        variant="rainbow"
        mainIcon={<ToolCase />}
        mainRotate={-20}
        // mainSize={32}
        defaultState="open"
        mobile={{
          direction: "right",
          mainRotate: 20,
        }}
      />
    </div>
  );
}
