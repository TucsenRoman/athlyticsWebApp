// src/types/scheduleTypes.ts

import type { Database } from "@/integrations/supabase/types";

export type DbScheduleWeek =
  Database["public"]["Tables"]["schedule_weeks"]["Row"];
export type DbScheduleSlot =
  Database["public"]["Tables"]["schedule_slots"]["Row"];
export type DbScheduleSubslot =
  Database["public"]["Tables"]["schedule_subslots"]["Row"];

/* -------------------------------------------------------------------------- */
/*  WEEK ROW (schedule_weeks)                                                 */
/* -------------------------------------------------------------------------- */
/**
 * A week contains NO slot metadata in Option B.
 * All slots live in schedule_slots and are fetched by week_index.
 */
export interface DbWeek {
  id: string;
  program_id: number;
  index: number;       // week_index in DB
  created_at?: string;
}

/* -------------------------------------------------------------------------- */
/*  MAIN SLOT ROW (schedule_slots)                                            */
/* -------------------------------------------------------------------------- */
/**
 * One scheduled event.
 * Stored as minutes-since-midnight (24h), never "6:30 AM".
 */
export interface DbMainSlot {
  id: string;
  program_id: number;
  week_index: number;
  day: number;              // 0–6 (Monday–Sunday)
  title: string;
  start_time: number | null;
  color?: string | null;
}

/* -------------------------------------------------------------------------- */
/*  SUBSLOT ROW (schedule_subslots)                                           */
/* -------------------------------------------------------------------------- */
export interface DbSubSlot {
  id: string;
  slot_id: string;
  program_id: number;
  title: string;
  start_time?: number | null;
  color?: string | null;
}

/* -------------------------------------------------------------------------- */
/*  UI TYPES (ScheduleView consumes these — NOT DB raw types)                 */
/* -------------------------------------------------------------------------- */
/**
 * UI representation of a subslot.
 * `time` is formatted (e.g. "6:30 AM") — derived from start_time.
 */
export interface UiSubSlot {
  id: string;
  title: string;
  time?: string | null;      // formatted for UI
  color?: string | null;
}

/**
 * A compiled slot = main slot merged with all attached subslots.
 * Both main + sub slots should already have UI-formatted times at this level.
 */
export interface UiCompiledSlot {
  id: string;
  title: string;
  time?: string | null;      // formatted for UI
  color?: string | null;
  subslots: UiSubSlot[];
}
