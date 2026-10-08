// src/utils/schedule/buildScheduleSlots.ts

/* -------------------------------------------------------------------------- */
/*  TYPES                                                                      */
/* -------------------------------------------------------------------------- */

export interface BaseSlotInput {
  title: string;
  icon: string;
  color: string;
  start: string;   // "6:00 PM"
  end: string | null; // null if "No End"
}

export interface BuildScheduleOptions {
  selectedDays: number[];         // e.g. [1,3,5]
  repeatEnabled: boolean;
  seasonEndDate: string | null;   // ISO string
  base: BaseSlotInput;            // Metadata for each slot
}

export interface BuiltSlot {
  day: number;             // 0–6
  title: string;
  icon: string;
  color: string;
  start: string;
  end: string | null;
  repeat: boolean;
  repeatUntil: string | null;
}

/* -------------------------------------------------------------------------- */
/*  MAIN FUNCTION                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Expand a user’s schedule selection (day pills + repeat mode)
 * into an array of fully-formed slot objects.
 *
 * This ALWAYS returns an array, even if a single day is selected.
 */
export function buildScheduleSlots({
  selectedDays,
  repeatEnabled,
  seasonEndDate,
  base,
}: BuildScheduleOptions): BuiltSlot[] {
  if (!selectedDays || selectedDays.length === 0) {
    return [];
  }

  return selectedDays.map((day) => ({
    day,
    title: base.title.trim(),
    icon: base.icon,
    color: base.color,
    start: base.start,
    end: base.end,
    repeat: repeatEnabled,
    repeatUntil: repeatEnabled ? seasonEndDate : null,
  }));
}
