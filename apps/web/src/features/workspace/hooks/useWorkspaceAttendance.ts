// src/features/workspace/hooks/useWorkspaceAttendance.ts
"use client";

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useWorkspaceAttendance(programId: number | null) {
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [attendanceHasSession, setAttendanceHasSession] = useState(false);
  const [attendanceIsDirty, setAttendanceIsDirty] = useState(false);
  const [attendanceExceptionCount, setAttendanceExceptionCount] = useState(0);
  const [attendanceSaveFailed, setAttendanceSaveFailed] = useState(false);

  function submitAttendance() {
    setAttendanceIsDirty(false);
    setAttendanceSaveFailed(false);
  }

  async function resetAttendance() {
    if (!programId) return;

    await supabase
      .from("attendance")
      .delete()
      .eq("program_id", programId)
      .eq("date", attendanceDate);

    setAttendanceIsDirty(false);
    setAttendanceExceptionCount(0);
    setAttendanceHasSession(false);
    setAttendanceSaveFailed(false);

    setAttendanceDate(attendanceDate);
  }

  return {
    attendanceDate,
    setAttendanceDate,

    attendanceHasSession,
    setAttendanceHasSession,

    attendanceIsDirty,
    setAttendanceIsDirty,

    attendanceExceptionCount,
    setAttendanceExceptionCount,

    attendanceSaveFailed,
    setAttendanceSaveFailed,

    submitAttendance,
    resetAttendance,
  };
}
