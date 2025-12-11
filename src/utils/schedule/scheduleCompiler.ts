// src/utils/scheduleCompiler.ts
"use client";

import type { DbMainSlot, DbSubSlot, UiCompiledSlot } from "@/types/scheduleTypes_TEMP";

/* -------------------------------------------------------------------------- */
/*  COMPILE DAY SCHEDULE (Option B)                                           */
/* -------------------------------------------------------------------------- */
/**
 * Given:
 *  - day (0–6)
 *  - all main slots for the week
 *  - all subslots for the week
 *
 * Produces:
 *  - UiCompiledSlot[] sorted by start_time
 */
export function compileDaySchedule({
  day,
  main,
  subs,
}: {
  day: number;
  main: DbMainSlot[];
  subs: DbSubSlot[];
}): UiCompiledSlot[] {

  // 1) filter slots belonging to this day
  const daySlots = main.filter((slot) => slot.day === day);

  // 2) sort by start_time (null → last)
  const sorted = [...daySlots].sort((a, b) => {
    const aTime = a.start_time ?? Number.MAX_SAFE_INTEGER;
    const bTime = b.start_time ?? Number.MAX_SAFE_INTEGER;
    return aTime - bTime;
  });

  // 3) attach subslots
  return sorted.map((slot) => ({
    id: slot.id,
    title: slot.title,
    color: slot.color ?? null,
    time: slot.start_time !== null ? minutesToUi(slot.start_time) : null,
    subslots: subs
      .filter((s) => s.slot_id === slot.id)
      .map((s) => ({
        id: s.id,
        title: s.title,
        color: s.color ?? null,
        time: s.start_time !== null ? minutesToUi(s.start_time) : null,
      })),
  }));
}

/* -------------------------------------------------------------------------- */
/*  HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

function minutesToUi(mins: number): string {
  const h24 = Math.floor(mins / 60);
  const m = mins % 60;

  const period = h24 >= 12 ? "PM" : "AM";
  const h12 = ((h24 + 11) % 12) + 1;

  return `${h12}:${m.toString().padStart(2, "0")} ${period}`;
}
