// src/features/schedule/services/schedule.service.ts
import { supabase } from "@/integrations/supabase/client";

import type {
  DbScheduleWeek,
  DbScheduleSlot,
  DbScheduleSubslot,
} from "../types/schedule.types";

import { compileScheduleWeek } from "../utils/scheduleCompiler";
import type { UiCompiledWeek } from "../utils/scheduleCompiler";

/* -------------------------------------------------------------------------- */
/*  WEEK                                                                      */
/* -------------------------------------------------------------------------- */

export async function fetchScheduleWeek(
  programId: number,
  weekIndex: number,
): Promise<DbScheduleWeek | null> {
  const { data, error } = await supabase
    .from("schedule_weeks")
    .select("*")
    .eq("program_id", programId)
    .eq("index", weekIndex)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createScheduleWeek(
  programId: number,
  weekIndex: number,
): Promise<DbScheduleWeek> {
  const { data, error } = await supabase
    .from("schedule_weeks")
    .insert({
      program_id: programId,
      index: weekIndex,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

/* -------------------------------------------------------------------------- */
/*  MAIN SLOTS                                                                */
/* -------------------------------------------------------------------------- */

export async function fetchScheduleSlots(
  weekId: string,
): Promise<DbScheduleSlot[]> {
  const { data, error } = await supabase
    .from("schedule_slots")
    .select("*")
    .eq("week_id", weekId)
    .order("day", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createScheduleSlot(input: {
  program_id: number;
  week_id: string;
  day: number;
  title: string;
  start_time: number;
  end_time: number | null;
  color?: string | null;
}): Promise<DbScheduleSlot> {
  const { data, error } = await supabase
    .from("schedule_slots")
    .insert({
      program_id: input.program_id,
      week_id: input.week_id,
      day: input.day,
      title: input.title,
      start_time: input.start_time,
      end_time: input.end_time,
      color: input.color ?? null,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function updateScheduleSlot(
  id: string,
  updates: {
    title?: string;
    day?: number;
    start_time?: number;
    end_time?: number | null;
    color?: string | null;
    icon?: string | null;
    location?: string | null;
    attachment?: string | null;
  },
): Promise<DbScheduleSlot> {
  const { data, error } = await supabase
    .from("schedule_slots")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function deleteScheduleSlot(id: string): Promise<void> {
  const { error } = await supabase
    .from("schedule_slots")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

/* -------------------------------------------------------------------------- */
/*  SUBSLOTS                                                                  */
/* -------------------------------------------------------------------------- */

export async function fetchSubslotsForSlots(
  slotIds: string[],
): Promise<DbScheduleSubslot[]> {
  if (slotIds.length === 0) return [];

  const { data, error } = await supabase
    .from("schedule_subslots")
    .select("*")
    .in("slot_id", slotIds);

  if (error) throw error;
  return data ?? [];
}

export async function createScheduleSubslot(input: {
  slot_id: string;
  title: string;
}): Promise<DbScheduleSubslot> {
  const { data, error } = await supabase
    .from("schedule_subslots")
    .insert({
      slot_id: input.slot_id,
      title: input.title,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function updateScheduleSubslot(input: {
  id: string;
  title: string;
}): Promise<DbScheduleSubslot> {
  const { data, error } = await supabase
    .from("schedule_subslots")
    .update({ title: input.title })
    .eq("id", input.id)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function deleteScheduleSubslot(id: string): Promise<void> {
  const { error } = await supabase
    .from("schedule_subslots")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

/* -------------------------------------------------------------------------- */
/*  READ-ONLY ORCHESTRATION                                                   */
/* -------------------------------------------------------------------------- */

export async function loadScheduleWeekReadOnly({
  programId,
  scheduleWeekIndex,
}: {
  programId: number;
  scheduleWeekIndex: number;
}): Promise<{
  week: DbScheduleWeek | null;
  slots: DbScheduleSlot[];
  subslots: DbScheduleSubslot[];
  compiled: UiCompiledWeek | null;
}> {
  const week = await fetchScheduleWeek(programId, scheduleWeekIndex);

  if (!week) {
    return {
      week: null,
      slots: [],
      subslots: [],
      compiled: null,
    };
  }

  const slots = await fetchScheduleSlots(week.id);
  const subslots = await fetchSubslotsForSlots(slots.map(s => s.id));
  const compiled = compileScheduleWeek(week, slots, subslots);

  return {
    week,
    slots,
    subslots,
    compiled,
  };
}
