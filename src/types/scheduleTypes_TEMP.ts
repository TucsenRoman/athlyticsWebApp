// src/types/scheduleTypes.ts

/* -------------------------------------------------------------------------- */
/*  WEEK ROW (Option B — NO JSON days)                                        */
/* -------------------------------------------------------------------------- */
/**
 * Represents a single week row in schedule_weeks.
 * No embedded day/slot metadata.
 */
export interface DbWeek {
  id: string;
  program_id: number;
  index: number;           // week_index in DB
  created_at?: string;
}

/* -------------------------------------------------------------------------- */
/*  MAIN SLOT ROW (schedule_slots)                                            */
/* -------------------------------------------------------------------------- */
/**
 * A single scheduled item (practice, lift, meeting, etc.)
 * One row = one event.
 *
 * Stored in schedule_slots:
 *  - id: uuid
 *  - program_id: number
 *  - week_index: number
 *  - day: number (0 = Monday)
 *  - title: string
 *  - start_time: number | null (minutes since midnight)
 *  - color: string | null
 */
export interface DbMainSlot {
  id: string;
  program_id: number;
  week_index: number;
  day: number;               // 0–6 (Mon–Sun)
  title: string;
  start_time: number | null; // stored as minutes (24h)
  color?: string | null;
}

/* -------------------------------------------------------------------------- */
/*  SUBSLOT ROW (schedule_subslots)                                           */
/* -------------------------------------------------------------------------- */
/**
 * Subslots attached to a main slot.
 * Example: Sprint → Blocks, Starts, Strides
 */
export interface DbSubSlot {
  id: string;
  slot_id: string;
  program_id: number;
  title: string;
  start_time?: number | null;
  color?: string | null;
}

/* -------------------------------------------------------------------------- */
/*  UI TYPES (what ScheduleView consumes)                                     */
/* -------------------------------------------------------------------------- */
/**
 * Subslot displayed in ScheduleView.
 */
export interface UiSubSlot {
  id: string;
  title: string;
  time?: string | null;      // UI formatted ("6:30 AM")
  color?: string | null;
}

/**
 * Compiled slot = main slot + merged subslots.
 */
export interface UiCompiledSlot {
  id: string;
  title: string;
  time?: string | null;      // formatted for UI
  color?: string | null;
  subslots: UiSubSlot[];
}
