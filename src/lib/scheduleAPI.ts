// src/lib/scheduleAPI.ts
"use client";

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

/* -------------------------------------------------------------------------- */
/*  DB TYPES                                                                  */
/* -------------------------------------------------------------------------- */

export type DbScheduleWeek =
  Database["public"]["Tables"]["schedule_weeks"]["Row"];

export type DbScheduleSlot =
  Database["public"]["Tables"]["schedule_slots"]["Row"];

export type DbScheduleSubslot =
  Database["public"]["Tables"]["schedule_subslots"]["Row"];

/* -------------------------------------------------------------------------- */
/*  WEEK QUERIES                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Fetch week by program + index.
 */
export async function fetchScheduleWeek(
  programId: number,
  weekIndex: number,
): Promise<DbScheduleWeek | null> {
  console.log("[fetchScheduleWeek] program:", programId, "index:", weekIndex);

  const { data, error } = await supabase
    .from("schedule_weeks")
    .select("*")
    .eq("program_id", programId)
    .eq("index", weekIndex)
    .maybeSingle();

  if (error) {
    console.error("[fetchScheduleWeek] ERROR:", error);
    throw error;
  }

  console.log("[fetchScheduleWeek] result:", data);
  return data;
}

/**
 * Create a new week.
 */
export async function createScheduleWeek(
  programId: number,
  weekIndex: number,
): Promise<DbScheduleWeek> {
  console.log("[createScheduleWeek] Creating week", weekIndex);

  const { data, error } = await supabase
    .from("schedule_weeks")
    .insert({
      program_id: programId,
      index: weekIndex,
    })
    .select("*")
    .single();

  if (error) {
    console.error("[createScheduleWeek] ERROR:", error);
    throw error;
  }

  console.log("[createScheduleWeek] created:", data);
  return data;
}

/* -------------------------------------------------------------------------- */
/*  MAIN SLOT QUERIES                                                        */
/* -------------------------------------------------------------------------- */

export async function fetchScheduleSlots(
  weekId: string,
): Promise<DbScheduleSlot[]> {
  console.log("[fetchScheduleSlots] weekId:", weekId);

  const { data, error } = await supabase
    .from("schedule_slots")
    .select("*")
    .eq("week_id", weekId)
    .order("day", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    console.error("[fetchScheduleSlots] ERROR:", error);
    throw error;
  }

  console.log("[fetchScheduleSlots] count:", data?.length ?? 0);
  return data ?? [];
}

export interface CreateScheduleSlotInput {
  program_id: number;
  week_id: string;
  day: number;
  title: string;
  start_time: number;
  end_time: number;
  color?: string | null;
}

export async function createScheduleSlot(input: CreateScheduleSlotInput) {
  console.log("[createScheduleSlot] inserting", input);

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
    .select("*");

  console.log("[createScheduleSlot] result:", { data, error });

  if (error) throw error;
  return data?.[0] ?? null;
}

/* -------------------------------------------------------------------------- */
/*  SLOT UPDATE / DELETE                                                      */
/* -------------------------------------------------------------------------- */

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
  }
): Promise<DbScheduleSlot> {
  console.log("[updateScheduleSlot] Updating:", id, updates);

  const { data, error } = await supabase
    .from("schedule_slots")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error("[updateScheduleSlot] ERROR:", error);
    throw error;
  }

  console.log("[updateScheduleSlot] updated:", data);
  return data;
}

export async function deleteScheduleSlot(id: string): Promise<void> {
  console.log("[deleteScheduleSlot] Deleting:", id);

  const { error } = await supabase
    .from("schedule_slots")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[deleteScheduleSlot] ERROR:", error);
    throw error;
  }

  console.log("[deleteScheduleSlot] success");
}

/* -------------------------------------------------------------------------- */
/*  SUBSLOTS                                                                  */
/* -------------------------------------------------------------------------- */

export async function fetchSubslotsForSlots(
  slotIds: string[],
): Promise<DbScheduleSubslot[]> {
  if (slotIds.length === 0) return [];

  console.log("[fetchSubslotsForSlots] slotIds:", slotIds);

  const { data, error } = await supabase
    .from("schedule_subslots")
    .select("*")
    .in("slot_id", slotIds);

  if (error) {
    console.error("[fetchSubslotsForSlots] ERROR:", error);
    throw error;
  }

  console.log("[fetchSubslotsForSlots] count:", data?.length ?? 0);
  return data ?? [];
}

export async function createScheduleSubslot(input: {
  slot_id: string;
  title: string;
}): Promise<DbScheduleSubslot> {
  console.log("[createScheduleSubslot] INSERT:", input);

  const { data, error } = await supabase
    .from("schedule_subslots")
    .insert({
      slot_id: input.slot_id,
      title: input.title,
    })
    .select("*")
    .single();

  if (error) {
    console.error("[createScheduleSubslot] ERROR:", error);
    throw error;
  }

  console.log("[createScheduleSubslot] created:", data);
  return data;
}

export async function updateScheduleSubslot(input: {
  id: string;
  title: string;
}): Promise<DbScheduleSubslot> {
  console.log("[updateScheduleSubslot] Updating:", input.id);

  const { data, error } = await supabase
    .from("schedule_subslots")
    .update({ title: input.title })
    .eq("id", input.id)
    .select("*")
    .single();

  if (error) {
    console.error("[updateScheduleSubslot] ERROR:", error);
    throw error;
  }

  console.log("[updateScheduleSubslot] updated:", data);
  return data;
}

export async function deleteScheduleSubslot(id: string): Promise<void> {
  console.log("[deleteScheduleSubslot] Deleting:", id);

  const { error } = await supabase
    .from("schedule_subslots")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[deleteScheduleSubslot] ERROR:", error);
    throw error;
  }

  console.log("[deleteScheduleSubslot] deleted");
}
