// src/features/attendance/types/attendance.dates.ts

import { format, addDays, parseISO, isValid } from "date-fns";

/* -------------------------------------------------------------------------- */
/*  GET TODAY (YYYY-MM-DD)                                                    */
/* -------------------------------------------------------------------------- */
export function todayISO(): string {
  return new Date().toISOString().substring(0, 10);
}

/* -------------------------------------------------------------------------- */
/*  FORMAT DATE FOR UI                                                        */
/* -------------------------------------------------------------------------- */
export function formatAttendanceDate(date: string): string {
  try {
    const parsed = parseISO(date);
    if (!isValid(parsed)) return date;
    return format(parsed, "EEE, MMM d");
  } catch {
    return date;
  }
}

/* -------------------------------------------------------------------------- */
/*  MOVE DATE BY X DAYS                                                       */
/* -------------------------------------------------------------------------- */
export function shiftAttendanceDate(date: string, days: number): string {
  try {
    const parsed = parseISO(date);
    if (!isValid(parsed)) return todayISO();

    const next = addDays(parsed, days);
    return next.toISOString().substring(0, 10);
  } catch {
    return todayISO();
  }
}

/* -------------------------------------------------------------------------- */
/*  CLEAN DATE FROM INPUTS (VALIDATE USER TYPING)                              */
/* -------------------------------------------------------------------------- */
export function normalizeAttendanceDate(input: string): string {
  try {
    const parsed = parseISO(input);
    return isValid(parsed)
      ? parsed.toISOString().substring(0, 10)
      : todayISO();
  } catch {
    return todayISO();
  }
}
