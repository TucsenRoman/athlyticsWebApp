"use client";

import { useState } from "react";
import { Button } from "@/components/ui/actions/button";
import DateNavigator from "@/components/ui/navigation/datenavigator";
import ExpansiveMenu, {
  type ExpansiveMenuItem,
} from "@/components/ui/navigation/expansivemenu";

import {
  Plus,
  CalendarRange,
  LayoutGrid,
  List,
  Calendar1,
  Filter,
  Sparkles,
  Printer,
  Download,
  ToolCase,
  LayoutTemplate,
  Eye,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

type ScheduleView = "day" | "week" | "month";

/* -------------------------------------------------------------------------- */
/* UTIL                                                                       */
/* -------------------------------------------------------------------------- */

function getLocalISODate() {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

function shiftByView(
  iso: string,
  view: ScheduleView,
  direction: -1 | 1
) {
  const d = new Date(iso);
  d.setHours(12); // DST safety

  switch (view) {
    case "day":
      d.setDate(d.getDate() + direction);
      break;
    case "week":
      d.setDate(d.getDate() + direction * 7);
      break;
    case "month":
      d.setMonth(d.getMonth() + direction);
      break;
  }

  return d.toISOString().slice(0, 10);
}

function formatByView(iso: string, view: ScheduleView) {
  const d = new Date(iso);

  if (view === "week") {
    return `Week of ${d.toLocaleDateString()}`;
  }

  if (view === "month") {
    return d.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
  }

  return d.toLocaleDateString();
}

/* -------------------------------------------------------------------------- */
/* PROPS                                                                      */
/* -------------------------------------------------------------------------- */

interface ScheduleToolsProps {
  onAddEvent?: () => void;
  onOpenFilter?: () => void;
  onOpenTemplateMenu?: () => void;
  onPrint?: () => void;
  onExport?: () => void;
}

/* -------------------------------------------------------------------------- */
/* COMPONENT                                                                  */
/* -------------------------------------------------------------------------- */

export default function ScheduleTools({
  onAddEvent,
  onOpenFilter,
  onOpenTemplateMenu,
  onPrint,
  onExport,
}: ScheduleToolsProps) {
  /* -------------------- VIEW + DATE STATE -------------------- */

  const [view, setView] = useState<ScheduleView>("week");
  const [anchorDate, setAnchorDate] = useState(getLocalISODate());

  /* -------------------- DATE HANDLERS -------------------- */

  function handlePrev() {
    setAnchorDate((d) => shiftByView(d, view, -1));
  }

  function handleNext() {
    setAnchorDate((d) => shiftByView(d, view, 1));
  }

  function handleToday() {
    setAnchorDate(getLocalISODate());
  }

  /* -------------------- TOOL MENU -------------------- */
  const toolItems: ExpansiveMenuItem[] = [
    /* -------------------------------------------------- */
    /* ADD EVENT (primary action)                          */
    /* -------------------------------------------------- */
    {
      label: "Add Event",
      icon: <Plus className="h-4 w-4" />,
      flavor: "coral",
      children: [
        {
          label: "Add Event",
          icon: <Plus className="h-4 w-4" />,
          action: onAddEvent,
          flavor: "coral",
        },
        {
          label: "Templates",
          icon: <LayoutTemplate className="h-4 w-4" />,
          action: onOpenTemplateMenu,
          flavor: "indigo",
        },
      ],
    },

    /* -------------------------------------------------- */
    /* VIEW (mode selector)                                */
    /* -------------------------------------------------- */
    {
      id: "view",
      label: "View",
      icon: <Eye className="h-4 w-4" />,
      flavor: "blue",
      children: [
        {
          label: "Day",
          icon: <Calendar1 className="h-4 w-4" />,
          action: () => setView("day"),
          flavor: "teal",
        },
        {
          label: "Week",
          icon: <LayoutGrid className="h-4 w-4" />,
          action: () => setView("week"),
          flavor: "slate",
        },
        {
          label: "Month",
          icon: <CalendarRange className="h-4 w-4" />,
          action: () => setView("month"),
          flavor: "indigo",
        },
      ],
    },

    /* -------------------------------------------------- */
    /* FILTERS                                            */
    /* -------------------------------------------------- */
    {
      label: "Filters",
      icon: <Filter className="h-4 w-4" />,
      action: onOpenFilter,
      flavor: "purple",
    },

    /* -------------------------------------------------- */
    /* EXPORT                                             */
    /* -------------------------------------------------- */
    {
      id: "export",
      label: "Export",
      icon: <Download className="h-4 w-4" />,
      flavor: "green",
      children: [
        {
          label: "Print",
          icon: <Printer className="h-4 w-4" />,
          action: onPrint,
          flavor: "yellow",
        },
        {
          label: "Export File",
          icon: <Download className="h-4 w-4" />,
          action: onExport,
          flavor: "green",
        },
      ],
    },
  ];

  /* -------------------- RENDER -------------------- */
  return (
    <div className="flex items-center justify-between w-full gap-4">
      {/* TOOLS */}
      <ExpansiveMenu
        items={toolItems}
        expand="line"
        direction="left"
        spacing={36}
        variant="rainbow"
        mainIcon={<ToolCase />}
        mainRotate={-20}
        mainSize={42}
        defaultState="open"
        mobile={{
          direction: "right",
          mainRotate: 20,
        }}
      />
      {/* DATE NAVIGATION (view-aware) */}
      <DateNavigator
        value={anchorDate}
        onChange={setAnchorDate}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
        formatDisplay={(iso) => formatByView(iso, view)}
      />
    </div>
  );
}
