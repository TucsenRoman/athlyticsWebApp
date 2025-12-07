"use client";

import { Button } from "@/components/ui/button";
import { Plus, CalendarRange, CalendarDays, Clock } from "lucide-react";

interface ScheduleToolsProps {
  onAddEvent?: () => void;
  onJumpToToday?: () => void;
  onViewRange?: () => void;
}

export default function ScheduleTools({
  onAddEvent,
  onJumpToToday,
  onViewRange,
}: ScheduleToolsProps) {
  return (
    <div className="flex items-center justify-between gap-6 w-full">

      {/* LEFT — STATUS LABEL */}
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
        Schedule Tools
      </span>

      {/* RIGHT — Controls */}
      <div className="flex items-center gap-1">

        {/* Add Event */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onAddEvent}
          title="Add Event"
          className="
            h-7 w-7 rounded-full
            text-[var(--text)]
            hover:text-[var(--accent)]
            hover:bg-[var(--accent-bg)]
          "
        >
          <Plus className="h-4 w-4" />
        </Button>

        {/* Today */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onJumpToToday}
          title="Jump to Today"
          className="
            h-7 w-7 rounded-full
            text-[var(--text)]
            hover:text-[var(--fvr-blue)]
            hover:bg-[var(--fvr-blue-bg)]
          "
        >
          <CalendarDays className="h-4 w-4" />
        </Button>

        {/* Date Range */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onViewRange}
          title="View Date Range"
          className="
            h-7 w-7 rounded-full
            text-[var(--text)]
            hover:text-[var(--fvr-green)]
            hover:bg-[var(--fvr-green-bg)]
          "
        >
          <CalendarRange className="h-4 w-4" />
        </Button>

      </div>
    </div>
  );
}
