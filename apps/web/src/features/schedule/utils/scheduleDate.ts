// src/lib/scheduleDate.ts
"use client";

import { addDays, addWeeks, startOfWeek } from "date-fns";

/* -------------------------------------------------------------------------- */
/*  TYPES                                                                      */
/* -------------------------------------------------------------------------- */

export interface WeekDateRange {
  weekIndex: number;
  days: Array<{
    date: Date;
    label: string; // "Monday", etc.
    index: number; // 0–6
  }>;
}

/* -------------------------------------------------------------------------- */
/*  CONSTANTS                                                                  */
/* -------------------------------------------------------------------------- */

const DAY_LABELS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

/* -------------------------------------------------------------------------- */
/*  CORE DATE HELPERS                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Compute actual calendar dates for a schedule week.
 * 
 * weekIndex:
 *   0 = week of the season start date (aligned to Monday)
 *   1 = next week
 *  -1 = previous week
 */
export function getWeekDates(
  seasonStartDate: Date,
  weekIndex: number
): WeekDateRange {
  // Align season start to Monday
  const anchorMonday = startOfWeek(seasonStartDate, { weekStartsOn: 1 });

  // Move by weekIndex
  const weekStart = addWeeks(anchorMonday, weekIndex);

  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    return {
      date,
      label: DAY_LABELS[i],
      index: i,
    };
  });

  return { weekIndex, days };
}

/* -------------------------------------------------------------------------- */
/*  FIND WHICH WEEK ANY DATE BELONGS TO                                        */
/* -------------------------------------------------------------------------- */

export function getWeekIndexForDate(
  seasonStartDate: Date,
  date: Date
): number {
  const anchorMonday = startOfWeek(seasonStartDate, { weekStartsOn: 1 });

  const diffMs = date.getTime() - anchorMonday.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return Math.floor(diffDays / 7);
}

/* -------------------------------------------------------------------------- */
/*  GET DAY INDEX (MON–SUN)                                                    */
/* -------------------------------------------------------------------------- */
/**
 * Convert JS day-of-week to Athlytics day index:
 * 
 * JS: Sun=0 ... Sat=6
 * Ours: Mon=0 ... Sun=6
 */
export function getDayIndex(date: Date): number {
  const js = date.getDay(); // 0=Sun,1=Mon,...6=Sat
  return js === 0 ? 6 : js - 1;
}
