// src/utils/schedule/scheduleCompiler.ts

import type { Database } from "@/integrations/supabase/types";

/* -------------------------------------------------------------------------- */
/*  DB ROW TYPES                                                              */
/* -------------------------------------------------------------------------- */

export type DbScheduleWeek =
  Database["public"]["Tables"]["schedule_weeks"]["Row"];

export type DbScheduleSlot =
  Database["public"]["Tables"]["schedule_slots"]["Row"];

export type DbScheduleSubslot =
  Database["public"]["Tables"]["schedule_subslots"]["Row"];

/* -------------------------------------------------------------------------- */
/*  UI TYPES                                                                  */
/* -------------------------------------------------------------------------- */

export interface UiScheduleSubslot {
  id: string;
  title: string;
}

export interface UiScheduleSlot {
  id: string;
  day: number;               // 0–6
  title: string;

  startMinutes: number;
  endMinutes: number;

  startLabel: string;
  endLabel: string;

  color: string | null;
  subslots: UiScheduleSubslot[];

  // ⭐ NEW FIELDS (for edit modal + details modal)
  location: string | null;
  icon: string | null;
  attachment: string | null;

  allDay: boolean;
  noEnd: boolean;
}

export interface UiScheduleDay {
  day: number;
  slots: UiScheduleSlot[];
}

export interface UiCompiledWeek {
  id: string;
  index: number;
  days: UiScheduleDay[];
}

/* -------------------------------------------------------------------------- */
/*  DEBUG TOGGLE                                                              */
/* -------------------------------------------------------------------------- */

const DEBUG = true;

function dlog(...args: any[]) {
  if (DEBUG) console.log("[scheduleCompiler]", ...args);
}

/* -------------------------------------------------------------------------- */
/*  HELPERS                                                                   */
/* -------------------------------------------------------------------------- */

function formatMinutesToLabel(totalMinutes: number | null): string {
  if (totalMinutes == null || typeof totalMinutes !== "number") {
    return "";
  }

  const clamped = Math.max(0, Math.floor(totalMinutes));
  const hours24 = Math.floor(clamped / 60);
  const minutes = clamped % 60;

  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;

  const minuteStr = minutes.toString().padStart(2, "0");

  return `${hours12}:${minuteStr} ${period}`;
}

/* -------------------------------------------------------------------------- */
/*  COMPILER                                                                  */
/* -------------------------------------------------------------------------- */

export function compileScheduleWeek(
  week: DbScheduleWeek,
  slots: DbScheduleSlot[],
  subslots: DbScheduleSubslot[],
): UiCompiledWeek {

  // dlog("Raw Week:", week);
  // dlog("Raw Slots:", slots);
  // dlog("Raw Subslots:", subslots);

  /* ---------------------------------------------------------------------- */
  /*  SUBSLOT MAPPING                                                       */
  /* ---------------------------------------------------------------------- */

  const subslotMap = new Map<string, UiScheduleSubslot[]>();

  for (const sub of subslots) {
    if (!sub.slot_id) {
      // dlog("WARNING: subslot missing slot_id:", sub);
      continue;
    }

    const list = subslotMap.get(sub.slot_id) ?? [];
    list.push({ id: sub.id, title: sub.title });
    subslotMap.set(sub.slot_id, list);
  }

  /* ---------------------------------------------------------------------- */
  /*  BUILD UI SLOTS                                                        */
  /* ---------------------------------------------------------------------- */

  const uiSlots: UiScheduleSlot[] = slots.map((slot) => {
    if (slot.day < 0 || slot.day > 6) {
      dlog("ERROR: Slot has invalid day:", slot);
    }

    const slotSubslots = subslotMap.get(slot.id) ?? [];

    const startMinutes = slot.start_time ?? 0;
    const endMinutes = slot.end_time ?? startMinutes;

    return {
      id: slot.id,
      day: slot.day,

      title: slot.title ?? "(untitled)",

      startMinutes,
      endMinutes,

      startLabel: formatMinutesToLabel(startMinutes),
      endLabel: formatMinutesToLabel(endMinutes),

      color: slot.color,
      subslots: slotSubslots,

      location: (slot as any).location ?? null,
      icon: (slot as any).icon ?? null,
      attachment: (slot as any).attachment ?? null,

      allDay: Boolean((slot as any).all_day),
      noEnd: Boolean((slot as any).no_end),
    };
  });

  // dlog("Built UiSlots:", uiSlots);

  /* ---------------------------------------------------------------------- */
  /*  GROUP BY DAY                                                          */
  /* ---------------------------------------------------------------------- */

  const days: UiScheduleDay[] = [];

  for (let d = 0; d < 7; d++) {
    const daySlots = uiSlots
      .filter((s) => s.day === d)
      .sort((a, b) => {
        if (a.startMinutes !== b.startMinutes) {
          return a.startMinutes - b.startMinutes;
        }
        return a.endMinutes - b.endMinutes;
      });

    // dlog(`Day ${d}:`, daySlots);

    days.push({ day: d, slots: daySlots });
  }

  const compiled: UiCompiledWeek = {
    id: week.id,
    index: week.index,
    days,
  };

  // dlog("FINAL COMPILED WEEK:", compiled);

  return compiled;
}
