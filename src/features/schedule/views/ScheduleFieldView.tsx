// src/features/schedule/views/ScheduleFieldView.tsx
"use client";

import { useEffect, useState } from "react";
import CardFormatter from "@/components/cards/CardFormatter";
import { CalendarDays, Clock } from "lucide-react";

import { useProgramContext } from "@/features/program-cloak/useProgramContext";

import {
  fetchScheduleWeek,
  fetchScheduleSlots,
  type DbScheduleSlot,
} from "@/features/schedule";

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

type Flavor = "blue" | "green" | "purple" | "slate" | "red";

interface DailyEvent {
  id: string;
  title: string;
  timeLabel: string;
  color: Flavor;
}

/* -------------------------------------------------------------------------- */
/* COLOR MAP                                                                  */
/* -------------------------------------------------------------------------- */

const COLOR_MAP: Record<Flavor, string> = {
  blue: "bg-[var(--fvr-blue-lt)] text-[var(--fvr-blue)]",
  green: "bg-[var(--fvr-green-lt)] text-[var(--fvr-green)]",
  purple: "bg-[var(--fvr-purple-lt)] text-[var(--fvr-purple)]",
  slate: "bg-[var(--fvr-slate-lt)] text-[var(--fvr-slate)]",
  red: "bg-[var(--fvr-red-lt)] text-[var(--fvr-red)]",
};

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

function minutesToLabel(min: number | null) {
  if (min == null) return "All Day";

  let h = Math.floor(min / 60);
  const m = min % 60;
  const period = h >= 12 ? "PM" : "AM";

  if (h === 0) h = 12;
  if (h > 12) h -= 12;

  return `${h}:${m.toString().padStart(2, "0")} ${period}`;
}

function normalizeColor(raw?: string | null): Flavor {
  if (!raw) return "slate";
  return raw in COLOR_MAP ? (raw as Flavor) : "slate";
}

/* -------------------------------------------------------------------------- */
/* COMPONENT                                                                  */
/* -------------------------------------------------------------------------- */

export default function ScheduleCard() {
  const { selectedProgramId } = useProgramContext();

  const [events, setEvents] = useState<DailyEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * IMPORTANT:
   * Field is VIEW ONLY.
   * We do NOT create weeks here.
   * Workspace owns mutations.
   */
  const weekIndex = 1; // DB-aligned, 1-based

  /* ---------------------------------------------------------------------- */
  /* LOAD                                                                    */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!selectedProgramId) {
      console.warn("[ScheduleCard] No program selected");
      setEvents([]);
      return;
    }

    async function load() {
      console.log("[ScheduleCard] LOAD START", {
        programId: selectedProgramId,
        weekIndex,
      });

      setLoading(true);
      setError(null);

      try {
        const week = await fetchScheduleWeek(selectedProgramId, weekIndex);

        if (!week) {
          console.warn("[ScheduleCard] No schedule week found");
          setEvents([]);
          return;
        }

        const slots: DbScheduleSlot[] = await fetchScheduleSlots(week.id);

        const jsDay = new Date().getDay(); // 0 = Sunday
        const scheduleDayIndex = jsDay === 0 ? 6 : jsDay - 1;

        const todaySlots = slots.filter(
          (slot) => slot.day === scheduleDayIndex
        );

        const mapped: DailyEvent[] = todaySlots.map((slot) => ({
          id: slot.id,
          title: slot.title,
          timeLabel:
            slot.end_time != null
              ? `${minutesToLabel(slot.start_time)} – ${minutesToLabel(slot.end_time)}`
              : minutesToLabel(slot.start_time),
          color: normalizeColor(slot.color),
        }));

        setEvents(mapped);
      } catch (err) {
        console.error("[ScheduleCard] LOAD ERROR", err);
        setError("Failed to load schedule");
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [selectedProgramId]);

  /* ---------------------------------------------------------------------- */
  /* RENDER                                                                  */
  /* ---------------------------------------------------------------------- */

  return (
    <CardFormatter title="Today" icon={CalendarDays}>
      <div className="flex flex-col gap-3 text-sm">

        {/* SUBTITLE */}
        <div className="text-xs text-muted-foreground">
          Today’s schedule
        </div>

        {/* LOADING */}
        {loading && (
          <div className="italic text-muted-foreground">
            Loading schedule…
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="italic text-red-600">
            {error}
          </div>
        )}

        {/* EMPTY */}
        {!loading && !error && events.length === 0 && (
          <div className="italic text-muted-foreground">
            No events scheduled today.
          </div>
        )}

        {/* EVENTS */}
        {!loading &&
          events.map((event) => (
            <div
              key={event.id}
              className={`rounded-md px-3 py-2 ${COLOR_MAP[event.color]}`}
            >
              <div className="font-medium truncate">
                {event.title}
              </div>

              <div className="flex items-center gap-1 text-xs opacity-80">
                <Clock className="w-3 h-3" />
                {event.timeLabel}
              </div>
            </div>
          ))}
      </div>
    </CardFormatter>
  );
}
