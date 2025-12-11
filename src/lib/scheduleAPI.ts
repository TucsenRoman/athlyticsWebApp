// src/lib/scheduleAPI.ts
"use client";

import { createClient } from "@supabase/supabase-js";
import { uiTimeToMinutes } from "@/utils/schedule/time";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/* -------------------------------------------------------------------------- */
/* FETCH WEEK (metadata only)                                                 */
/* -------------------------------------------------------------------------- */

export async function fetchScheduleWeek({
  programId,
  weekIndex,
}: {
  programId: number;
  weekIndex: number;
}) {
  const { data, error } = await supabase
    .from("schedule_weeks")
    .select("id, program_id, index")
    .eq("program_id", programId)
    .eq("index", weekIndex)
    .maybeSingle();

  if (error) {
    console.error("fetchScheduleWeek error:", error);
    return null;
  }

  return data;
}

/* -------------------------------------------------------------------------- */
/* FETCH ALL MAIN SLOTS FOR A WEEK                                            */
/* -------------------------------------------------------------------------- */

export async function fetchScheduleMainSlots({
  programId,
  weekIndex,
}: {
  programId: number;
  weekIndex: number;
}) {
  const { data, error } = await supabase
    .from("schedule_slots")
    .select("*")
    .eq("program_id", programId)
    .eq("week_index", weekIndex);

  if (error) {
    console.error("fetchScheduleMainSlots error:", error);
    return [];
  }

  return data;
}

/* -------------------------------------------------------------------------- */
/* FETCH SUBSLOTS                                                             */
/* -------------------------------------------------------------------------- */

export async function fetchScheduleSubslots(slotIds: string[]) {
  if (!slotIds.length) return [];

  const { data, error } = await supabase
    .from("schedule_subslots")
    .select("*")
    .in("slot_id", slotIds);

  if (error) {
    console.error("fetchScheduleSubslots error:", error);
    return [];
  }

  return data;
}

/* -------------------------------------------------------------------------- */
/* ADD MAIN SLOT                                                              */
/* -------------------------------------------------------------------------- */

export async function addMainSlotToWeek({
  programId,
  weekIndex,
  day,
  title,
  time,
  color,
}: {
  programId: number;
  weekIndex: number;
  day: number;
  title: string;
  time: string | null;
  color: string | null;
}) {
  const slotId = crypto.randomUUID();

  const startMinutes = time ? uiTimeToMinutes(time) : null;

  const { error } = await supabase.from("schedule_slots").insert({
    id: slotId,
    program_id: programId,
    week_index: weekIndex,
    day,
    title,
    start_time: startMinutes,
    color,
  });

  if (error) throw error;

  return slotId;
}

/* -------------------------------------------------------------------------- */
/* UPDATE MAIN SLOT                                                           */
/* -------------------------------------------------------------------------- */

export async function updateMainSlot({
  programId,
  slotId,
  day,
  title,
  time,
  color,
}: {
  programId: number;
  slotId: string;
  day: number;
  title: string;
  time: string | null;
  color: string | null;
}) {
  const startMinutes = time ? uiTimeToMinutes(time) : null;

  const { error } = await supabase
    .from("schedule_slots")
    .update({
      title,
      day,
      start_time: startMinutes,
      color,
    })
    .eq("id", slotId)
    .eq("program_id", programId);

  if (error) throw error;
}

/* -------------------------------------------------------------------------- */
/* DELETE MAIN SLOT + CASCADE SUBSLOTS                                        */
/* -------------------------------------------------------------------------- */

export async function deleteMainSlot({
  programId,
  slotId,
}: {
  programId: number;
  slotId: string;
}) {
  // First delete subslots
  const delSubs = await supabase
    .from("schedule_subslots")
    .delete()
    .eq("slot_id", slotId)
    .eq("program_id", programId);

  if (delSubs.error) throw delSubs.error;

  // Then delete main slot
  const delSlot = await supabase
    .from("schedule_slots")
    .delete()
    .eq("id", slotId)
    .eq("program_id", programId);

  if (delSlot.error) throw delSlot.error;
}
