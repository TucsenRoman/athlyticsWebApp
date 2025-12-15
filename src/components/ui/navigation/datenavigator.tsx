"use client";

import { useState } from "react";
import { Button } from "@/components/ui/actions/button";
import {
  Calendar1,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/overlays/dialog";

import { Calendar } from "@/components/ui/forms/calendar";

/* -------------------------------------------------------------------------- */
/* PROPS                                                                      */
/* -------------------------------------------------------------------------- */

interface DateNavigatorProps {
  value: string; // ISO date yyyy-mm-dd
  onChange: (iso: string) => void;

  onPrev?: () => void;
  onNext?: () => void;
  onToday?: () => void;

  formatDisplay?: (iso: string) => string;
}

/* -------------------------------------------------------------------------- */
/* UTIL                                                                       */
/* -------------------------------------------------------------------------- */

function parseLocalDate(str: string) {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function defaultFormat(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${m}/${d}/${y}`;
}

/* -------------------------------------------------------------------------- */
/* COMPONENT                                                                  */
/* -------------------------------------------------------------------------- */

export default function DateNavigator({
  value,
  onChange,
  onPrev,
  onNext,
  onToday,
  formatDisplay = defaultFormat,
}: DateNavigatorProps) {
  const [open, setOpen] = useState(false);
  const asDateObj = parseLocalDate(value);

  return (
    <div
      className="
        flex items-center gap-[1px]
        h-8 p-1
        bg-[var(--gray-100)]
        border border-[var(--border)]
        rounded-full shadow-sm
      "
    >
      {/* TODAY */}
      {onToday && (
        <Button
          variant="ghost"
          size="icon"
          title="Today"
          onClick={onToday}
        >
          <Calendar1 className="h-4 w-4" />
        </Button>
      )}

      {/* PREV */}
      {onPrev && (
        <Button
          variant="ghost"
          size="icon"
          title="Previous"
          onClick={onPrev}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}

      {/* DATE LABEL */}
      <span className="px-1 text-sm font-medium w-[80px] text-center">
        {formatDisplay(value)}
      </span>

      {/* NEXT */}
      {onNext && (
        <Button
          variant="ghost"
          size="icon"
          title="Next"
          onClick={onNext}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}

      {/* CALENDAR PICKER */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" title="Pick Date">
            <CalendarDays className="h-4 w-4" />
          </Button>
        </DialogTrigger>

        <DialogContent className="p-4">
          <DialogHeader>
            <DialogTitle>Select a Date</DialogTitle>
          </DialogHeader>

          <Calendar
            mode="single"
            selected={asDateObj}
            onSelect={(d) => {
              if (d) onChange(d.toISOString().slice(0, 10));
              setOpen(false);
            }}
            className="rounded-md border border-[var(--border)]"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
