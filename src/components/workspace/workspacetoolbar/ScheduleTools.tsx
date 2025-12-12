"use client";

import { Button } from "@/components/ui/button";
import {
  Plus,
  CalendarRange,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ArrowUpCircle,
  LayoutGrid,
  List,
  Calendar1,
  Filter,
  Sparkles,
  Printer,
  Download,
} from "lucide-react";

/* -----------------------------------------------------------------------------
   PROPS
----------------------------------------------------------------------------- */

interface ScheduleToolsProps {
  // Core actions
  onAddEvent?: () => void;
  onJumpToToday?: () => void;
  onViewRange?: () => void;

  // Navigation
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
  onJumpToWeekZero?: () => void;

  // View modes
  onViewWeek?: () => void;
  onViewList?: () => void;
  onViewDay?: () => void;

  // Filters + Templates
  onOpenFilter?: () => void;
  onOpenTemplateMenu?: () => void;

  // Exporting
  onPrint?: () => void;
  onExport?: () => void;

  // Layout size toggle
  compact?: boolean;
  onToggleCompact?: () => void;

  // UI label text
  weekLabel?: string;
}

/* -----------------------------------------------------------------------------
   COMPONENT
----------------------------------------------------------------------------- */

export default function ScheduleTools({
  // Core
  onAddEvent,
  onJumpToToday,
  onViewRange,

  // Navigation
  onPrevWeek,
  onNextWeek,
  onJumpToWeekZero,

  // Mode switches
  onViewWeek,
  onViewList,
  onViewDay,

  // Filters + Templates
  onOpenFilter,
  onOpenTemplateMenu,

  // Exporting
  onPrint,
  onExport,

  // Compact toggle
  compact,
  onToggleCompact,

  // UI label
  weekLabel = "Week — (dates)",
}: ScheduleToolsProps) {
  return (
    <div className="flex items-center justify-between w-full gap-6">
      {/* ------------------------------------------------------------------ */}
      {/* RIGHT — TOOLBAR BUTTONS                                           */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex items-center gap-1">

        {/* ------------------------- */}
        {/* WEEK NAVIGATION & LABEL   */}
        {/* ------------------------- */}
        {onPrevWeek && (
          <Button
            variant="ghost"
            size="icon"
            title="Previous Week"
            onClick={onPrevWeek}
            className="
              h-7 w-7 rounded-full
              hover:text-[var(--accent)]
              hover:bg-[var(--accent-bg)]
            "
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}

        <span
          className="
            h-6 px-3 flex items-center
            text-xs font-medium rounded-full
            bg-[var(--gray-100)]
            border border-[var(--border)]
            text-[var(--text)]
            shadow-sm
          "
        >
          {weekLabel}
        </span>
        
        <Button
          variant="ghost"
          size="icon"
          title="Next Week"
          onClick={onNextWeek}
          className="
            h-7 w-7 rounded-full
            hover:text-[var(--accent)]
            hover:bg-[var(--accent-bg)]
          "
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          title="Jump to Week 0"
          onClick={onJumpToWeekZero}
          className="
            h-7 w-7 rounded-full
            hover:text-[var(--fvr-blue)]
            hover:bg-[var(--fvr-blue-bg)]
          "
        >
          <ArrowUpCircle className="h-4 w-4" />
        </Button>

        {/* ------------------------- */}
        {/* CORE ACTIONS               */}
        {/* ------------------------- */}
        <Button
          variant="ghost"
          size="icon"
          title="Add Event"
          onClick={onAddEvent}
          className="
            h-7 w-7 rounded-full
            hover:text-[var(--accent)]
            hover:bg-[var(--accent-bg)]
          "
        >
          <Plus className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          title="Jump to Today"
          onClick={onJumpToToday}
          className="
            h-7 w-7 rounded-full
            hover:text-[var(--fvr-blue)]
            hover:bg-[var(--fvr-blue-bg)]
          "
        >
          <CalendarDays className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          title="View Date Range"
          onClick={onViewRange}
          className="
            h-7 w-7 rounded-full
            hover:text-[var(--fvr-green)]
            hover:bg-[var(--fvr-green-bg)]
          "
        >
          <CalendarRange className="h-4 w-4" />
        </Button>

        {/* ------------------------- */}
        {/* VIEW MODES                */}
        {/* ------------------------- */}
        <Button
          variant="ghost"
          size="icon"
          title="Week View"
          onClick={onViewWeek}
          className="h-7 w-7 rounded-full hover:bg-[var(--gray-200)]"
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          title="List View"
          onClick={onViewList}
          className="h-7 w-7 rounded-full hover:bg-[var(--gray-200)]"
        >
          <List className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          title="Day View"
          onClick={onViewDay}
          className="h-7 w-7 rounded-full hover:bg-[var(--gray-200)]"
        >
          <Calendar1 className="h-4 w-4" />
        </Button>

        {/* ------------------------- */}
        {/* FILTERS + TEMPLATES       */}
        {/* ------------------------- */}
        <Button
          variant="ghost"
          size="icon"
          title="Filters"
          onClick={onOpenFilter}
          className="
            h-7 w-7 rounded-full
            hover:text-[var(--fvr-purple)]
            hover:bg-[var(--fvr-purple-bg)]
          "
        >
          <Filter className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          title="Templates"
          onClick={onOpenTemplateMenu}
          className="
            h-7 w-7 rounded-full
            hover:text-[var(--fvr-yellow)]
            hover:bg-[var(--fvr-yellow-bg)]
          "
        >
          <Sparkles className="h-4 w-4" />
        </Button>

        {/* ------------------------- */}
        {/* EXPORTING                */}
        {/* ------------------------- */}
        <Button
          variant="ghost"
          size="icon"
          title="Print"
          onClick={onPrint}
          className="h-7 w-7 rounded-full hover:bg-[var(--gray-200)]"
        >
          <Printer className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          title="Export"
          onClick={onExport}
          className="h-7 w-7 rounded-full hover:bg-[var(--gray-200)]"
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
