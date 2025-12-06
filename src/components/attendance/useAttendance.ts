// src/components/attendance/useAttendance.ts

import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import type { UiAttendanceStatus } from "@/components/attendance/attendanceTypes";

/* -------------------------------------------------------------------------- */
/*  TYPES — GENERATED + ATTENDANCE-SPECIFIC                                   */
/* -------------------------------------------------------------------------- */

export type DbAttendanceRow = Tables<"attendance">;
export type DbAttendanceStatus = DbAttendanceRow["status"];

/* -------------------------------------------------------------------------- */
/*  INTERNAL HELPERS                                                          */
/* -------------------------------------------------------------------------- */

function logAttendanceError(context: string, error: unknown) {
  if (!error) return;
  // Centralized logging to keep noise consistent
  // eslint-disable-next-line no-console
  console.error(`[attendance:${context}]`, error);
}

/* -------------------------------------------------------------------------- */
/*  UI <-> DB STATUS MAPPERS                                                  */
/* -------------------------------------------------------------------------- */

export function fromDbStatus(
  status: DbAttendanceStatus
): UiAttendanceStatus | null {
  switch (status) {
    case "absent":
    case "tardy":
    case "other":
      return status;
    case "all_present":
      // Session-level marker → not a per-athlete UI status
      return null;
    default:
      return null;
  }
}

export function toDbStatus(
  status: UiAttendanceStatus
): Exclude<DbAttendanceStatus, "all_present"> | null {
  switch (status) {
    case "absent":
    case "tardy":
    case "other":
      return status;
    case "present":
    default:
      // "present" is represented by *deleting* the exception row
      return null;
  }
}

/* -------------------------------------------------------------------------- */
/*  FETCH ATTENDANCE — SINGLE SESSION (PROGRAM + DATE)                        */
/* -------------------------------------------------------------------------- */

export async function fetchAttendance(programId: number, date: string) {
  const { data, error } = await supabase
    .from("attendance")
    .select("*")
    .eq("program_id", programId)
    .eq("date", date)
    .order("created_at", { ascending: true });

  if (error) {
    logAttendanceError("fetchAttendance", error);
    return { data: [] as DbAttendanceRow[], error };
  }

  return { data: (data as DbAttendanceRow[]) ?? [], error: null };
}

/* -------------------------------------------------------------------------- */
/*  MARK PRESENT — REMOVE EXCEPTION ROW                                       */
/* -------------------------------------------------------------------------- */

export async function markPresent(
  programId: number,
  date: string,
  athleteKey: string
) {
  const { error } = await supabase
    .from("attendance")
    .delete()
    .eq("program_id", programId)
    .eq("date", date)
    .eq("athlete_key", athleteKey);

  if (error) logAttendanceError("markPresent", error);
  return { error };
}

/* -------------------------------------------------------------------------- */
/*  MARK EXCEPTION — ABSENT / TARDY / OTHER                                   */
/*  - Also clears any all_present marker for that session                     */
/* -------------------------------------------------------------------------- */

export async function markException(
  programId: number,
  date: string,
  athleteKey: string,
  status: UiAttendanceStatus,
  note?: string | null
) {
  const dbStatus = toDbStatus(status);
  if (!dbStatus) {
    // present / invalid → nothing to write
    return { error: null };
  }

  // 1) Remove any all_present marker for this program+date
  const { error: delAllPresentError } = await supabase
    .from("attendance")
    .delete()
    .eq("program_id", programId)
    .eq("date", date)
    .is("athlete_key", null); // only the session marker row

  if (delAllPresentError) {
    logAttendanceError("markException.deleteAllPresent", delAllPresentError);
    // We still try to upsert the exception row even if this fails
  }

  // 2) Upsert the athlete-specific exception row
  const { error } = await supabase.from("attendance").upsert(
    {
      program_id: programId,
      date,
      athlete_key: athleteKey,
      status: dbStatus,
      note: note ?? null,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "program_id,date,athlete_key",
    }
  );

  if (error) logAttendanceError("markException.upsert", error);
  return { error };
}

/* -------------------------------------------------------------------------- */
/*  UPDATE NOTE ONLY                                                          */
/* -------------------------------------------------------------------------- */

export async function updateNote(
  programId: number,
  date: string,
  athleteKey: string,
  note: string
) {
  // 1) Check if an exception row already exists for this athlete/date
  const { data, error: fetchErr } = await supabase
    .from("attendance")
    .select("*")
    .eq("program_id", programId)
    .eq("date", date)
    .eq("athlete_key", athleteKey)
    .maybeSingle();

  if (fetchErr) {
    logAttendanceError("updateNote.fetch", fetchErr);
    return { error: fetchErr };
  }

  // 2) If no row exists → treat as "other" exception with note
  if (!data) {
    return markException(programId, date, athleteKey, "other", note);
  }

  // 3) Otherwise just update the note
  const { error } = await supabase
    .from("attendance")
    .update({
      note: note || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", data.id);

  if (error) logAttendanceError("updateNote.update", error);
  return { error };
}

/* --------------------------------------------------------------------------
   MARK ALL PRESENT — SAFE VERSION
   Only inserts all_present if NO rows exist for the session.
-------------------------------------------------------------------------- */
export async function markAllPresent(programId: number, date: string) {
  // 1️⃣ Check if any attendance rows already exist for this date/program
  const { data: existing, error: fetchErr } = await supabase
    .from("attendance")
    .select("id")
    .eq("program_id", programId)
    .eq("date", date);

  if (fetchErr) {
    console.error("[markAllPresent] fetch error", fetchErr);
    return { error: fetchErr };
  }

  // 2️⃣ If ANY rows exist → DO NOT overwrite anything
  if (existing && existing.length > 0) {
    console.log("[markAllPresent] skipped — attendance already exists");
    return { error: null, skipped: true };
  }

  // 3️⃣ Otherwise → insert a clean all_present baseline
  const { error } = await supabase.from("attendance").insert({
    program_id: programId,
    date,
    athlete_key: null,
    status: "all_present",
    note: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (error) console.error("[markAllPresent] insert error", error);
  return { error };
}

/* -------------------------------------------------------------------------- */
/*  DELETE all_present SESSION MARKER ONLY                                    */
/* -------------------------------------------------------------------------- */

export async function deleteAllPresent(programId: number, date: string) {
  const { error } = await supabase
    .from("attendance")
    .delete()
    .eq("program_id", programId)
    .eq("date", date)
    .is("athlete_key", null); // only the session marker row

  if (error) logAttendanceError("deleteAllPresent", error);
  return { error };
}

/* -------------------------------------------------------------------------- */
/*  OPTIONAL: GROUPED SERVICE EXPORT (NON-BREAKING)                           */
/* -------------------------------------------------------------------------- */

export const AttendanceService = {
  fetchAttendance,
  markPresent,
  markException,
  updateNote,
  markAllPresent,
  deleteAllPresent,
  fromDbStatus,
  toDbStatus,
};

/* -------------------------------------------------------------------------- */
/*  BUILD statusMap + noteMap FROM ROSTER + DB ROWS                            */
/* -------------------------------------------------------------------------- */

export function buildAttendanceMaps(
  roster: { key: string }[],
  rows: DbAttendanceRow[]
): {
  statusMap: Record<string, UiAttendanceStatus | null>;
  noteMap: Record<string, string>;
} {
  const statusMap: Record<string, UiAttendanceStatus | null> = {};
  const noteMap: Record<string, string> = {};

  // Default: everyone is present, no notes
  roster.forEach((ath) => {
    statusMap[ath.key] = null;
    noteMap[ath.key] = "";
  });

  if (!rows || rows.length === 0) {
    return { statusMap, noteMap };
  }

  // Detect all_present session
  const hasAllPresent = rows.some(
    (r) => r.status === "all_present" && r.athlete_key === null
  );

  // If all_present marker exists → we return default “everyone present”
  if (hasAllPresent) {
    return { statusMap, noteMap };
  }

  // Otherwise load exceptions + notes
  for (const row of rows) {
    if (!row.athlete_key) continue;

    const ui = fromDbStatus(row.status);
    if (ui) {
      statusMap[row.athlete_key] = ui;
    }

    if (row.note) {
      noteMap[row.athlete_key] = row.note;
    }
  }

  return { statusMap, noteMap };
}
