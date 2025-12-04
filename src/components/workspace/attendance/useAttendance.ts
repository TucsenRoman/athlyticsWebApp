// src/components/workspace/attendance/useAttendance.ts

import { supabase } from "@/integrations/supabase/client";

/* -------------------------------------------------------------
   TYPES
------------------------------------------------------------- */

export type UiStatus =
  | "absent"
  | "tardy"
  | "excused"
  | "other";

export type DbStatus =
  | "absent"
  | "tardy"
  | "excused"
  | "other"
  | "all_present";

/* -------------------------------------------------------------
   INTERNAL SHORTCUT
------------------------------------------------------------- */
const attendanceTable = () => (supabase as any).from("attendance");

/* -------------------------------------------------------------
   FETCH
------------------------------------------------------------- */
export async function fetchAttendance(programId: number, date: string) {
  return attendanceTable()
    .select("*")
    .eq("program_id", programId)
    .eq("date", date);
}

/* -------------------------------------------------------------
   MARK ALL PRESENT
------------------------------------------------------------- */
export async function markAllPresent(programId: number, date: string) {
  // Remove all rows for that date/program
  await attendanceTable()
    .delete()
    .eq("program_id", programId)
    .eq("date", date);

  // Insert all_present row
  return attendanceTable().insert({
    program_id: programId,
    date,
    athlete_key: null,
    status: "all_present",
    notes: null,
  });
}

/* -------------------------------------------------------------
   MARK EXCEPTION
   (absent / tardy / excused / other)
------------------------------------------------------------- */
export async function markException(
  programId: number,
  date: string,
  athleteKey: string,
  status: UiStatus
) {
  // Any exception overrides all_present → remove it
  await attendanceTable()
    .delete()
    .eq("program_id", programId)
    .eq("date", date)
    .eq("status", "all_present");

  return attendanceTable().upsert(
    {
      program_id: programId,
      date,
      athlete_key: athleteKey,
      status,       // DIRECT — DB now matches UI exactly
      notes: null,
    },
    { onConflict: "program_id,date,athlete_key" }
  );
}

/* -------------------------------------------------------------
   MARK PRESENT
   (delete exception row)
------------------------------------------------------------- */
export async function markPresent(
  programId: number,
  date: string,
  athleteKey: string
) {
  return attendanceTable()
    .delete()
    .eq("program_id", programId)
    .eq("date", date)
    .eq("athlete_key", athleteKey);
}
