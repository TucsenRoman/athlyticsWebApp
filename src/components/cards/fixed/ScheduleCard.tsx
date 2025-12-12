"use client";

import { useEffect, useState } from "react";
import CardFormatter from "@/components/cards/CardFormatter";
import { CalendarDays, Clock } from "lucide-react";

import {
  fetchScheduleWeek,
  createScheduleWeek,
  fetchScheduleSlots,
  type DbScheduleSlot,
} from "@/lib/scheduleAPI";

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

type Flavor =
  | "blue"
  | "green"
  | "purple"
  | "slate"
  | "red";

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
  if (raw in COLOR_MAP) return raw as Flavor;
  return "slate";
}

/* -------------------------------------------------------------------------- */
/* COMPONENT                                                                  */
/* -------------------------------------------------------------------------- */

export default function ScheduleCard() {
  const [events, setEvents] = useState<DailyEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // TODO: replace with real context later
  const programId = 1;
  const weekIndex = 0;

  /* ---------------------------------------------------------------------- */
  /* LOAD                                                                    */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    async function load() {
      console.log("[ScheduleCard] LOAD START");
      console.log("programId:", programId);
      console.log("weekIndex:", weekIndex);

      setLoading(true);

      try {
        let week = await fetchScheduleWeek(programId, weekIndex);
        console.log("[ScheduleCard] week result:", week);

        // ✅ OPT A — lazy create
        if (!week) {
          console.warn("[ScheduleCard] No week found — creating");
          week = await createScheduleWeek(programId, weekIndex);
          console.log("[ScheduleCard] week created:", week);
        }

        const slots: DbScheduleSlot[] = await fetchScheduleSlots(week.id);
        console.log("[ScheduleCard] Raw slots:", slots);

        /* -------------------------------------------------------------- */
        /* FILTER FOR TODAY                                               */
        /* -------------------------------------------------------------- */

        const jsDay = new Date().getDay(); // 0 = Sun
        const scheduleDayIndex = jsDay === 0 ? 6 : jsDay - 1;

        console.log("[ScheduleCard] JS day:", jsDay);
        console.log("[ScheduleCard] Schedule day index:", scheduleDayIndex);

        const todaySlots = slots.filter(
          (s) => s.day === scheduleDayIndex
        );

        console.log("[ScheduleCard] Slots for today:", todaySlots);

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
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  /* ---------------------------------------------------------------------- */
  /* RENDER                                                                 */
  /* ---------------------------------------------------------------------- */

  return (
    <CardFormatter
      title="Today"
      icon={CalendarDays}
    >
      <div className="flex flex-col gap-3 text-sm">

        {/* SUBTITLE */}
        <div className="text-xs text-muted-foreground">
          Upcoming events
        </div>

        {/* STATES */}
        {loading && (
          <div className="italic text-muted-foreground">
            Loading schedule…
          </div>
        )}

        {!loading && events.length === 0 && (
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
