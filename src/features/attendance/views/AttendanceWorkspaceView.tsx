// src/features/attendance/views/AttendanceWorkspaceView.tsx
"use client";

import { useState, useEffect } from "react";

import {
  AttendanceRosterList,
  fetchAttendance,
  markPresent,
  markException,
  markAllPresent,
  deleteAllPresent,
  buildAttendanceMaps,
  fetchRoster,
  type UiAttendanceStatus,
} from "@/features/attendance";

import { useProgramContext } from "@/features/program_cloak/useProgramContext";

/* -------------------------------------------------------------------------- */
/* PROPS                                                                       */
/* -------------------------------------------------------------------------- */

interface AttendanceViewProps {
  attendanceDate: string;

  attendanceHasSession: boolean;
  setAttendanceHasSession: (v: boolean) => void;

  attendanceIsDirty: boolean;
  setAttendanceIsDirty: (v: boolean) => void;

  attendanceExceptionCount: number;
  setAttendanceExceptionCount: (v: number) => void;

  attendanceSaveFailed: boolean;
  setAttendanceSaveFailed: (v: boolean) => void;

  onSubmitAttendance: () => void;
}

/* -------------------------------------------------------------------------- */
/* COMPONENT                                                                   */
/* -------------------------------------------------------------------------- */

export default function AttendanceView({
  attendanceDate,
  attendanceHasSession,
  setAttendanceHasSession,
  attendanceIsDirty,
  setAttendanceIsDirty,
  attendanceExceptionCount,
  setAttendanceExceptionCount,
  attendanceSaveFailed,
  setAttendanceSaveFailed,
}: AttendanceViewProps) {
  const { selectedProgramId: programId } = useProgramContext();

  const [roster, setRoster] = useState<any[]>([]);
  const [statusMap, setStatusMap] =
    useState<Record<string, UiAttendanceStatus | null>>({});
  const [noteMap, setNoteMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  /* -------------------------------------------------------------------------- */
  /* LOAD ROSTER (ONCE PER PROGRAM)                                             */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    if (!programId) return;

    async function loadRoster() {
      const r = await fetchRoster(programId);

      const cleaned = (r || []).filter((ath) => {
        if (!ath) return false;

        const name = String(ath.name ?? "").trim();
        if (!name) return false;
        if (name === "null" || name === "undefined") return false;
        if (name.startsWith("row_")) return false;

        return name.length >= 2;
      });

      setRoster(cleaned);
    }

    loadRoster();
  }, [programId]);

  /* -------------------------------------------------------------------------- */
  /* LOAD ATTENDANCE FOR SELECTED DATE                                          */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    if (!programId || roster.length === 0) return;

    let alive = true;

    async function loadAttendance() {
      setLoading(true);
      const { data } = await fetchAttendance(programId, attendanceDate);
      if (!alive) return;

      const hasRows = !!(data && data.length > 0);

      setAttendanceHasSession(hasRows);

      if (!hasRows) {
        const blankStatus: Record<string, UiAttendanceStatus | null> = {};
        const blankNotes: Record<string, string> = {};

        for (const a of roster) {
          blankStatus[a.key] = null;
          blankNotes[a.key] = "";
        }

        setStatusMap(blankStatus);
        setNoteMap(blankNotes);

        setAttendanceExceptionCount(0);
        setAttendanceIsDirty(false);
        setAttendanceSaveFailed(false);

        setLoading(false);
        return;
      }

      const { statusMap: sMap, noteMap: nMap } =
        buildAttendanceMaps(roster, data);

      setStatusMap(sMap);
      setNoteMap(nMap);

      const exceptions = Object.values(sMap).filter((v) => v !== null).length;

      setAttendanceExceptionCount(exceptions);
      setAttendanceIsDirty(false);
      setAttendanceSaveFailed(false);

      setLoading(false);
    }

    loadAttendance();
    return () => {
      alive = false;
    };
  }, [programId, roster, attendanceDate]);

  /* -------------------------------------------------------------------------- */
  /* STATUS CHANGE (AUTO-SAVE)                                                  */
  /* -------------------------------------------------------------------------- */
  async function handleStatusChange(
    athleteKey: string,
    newStatus: UiAttendanceStatus
  ) {
    if (!programId) return;

    setAttendanceIsDirty(true);
    setAttendanceSaveFailed(false);

    const isPresent = newStatus === "present";

    const optimistic = {
      ...statusMap,
      [athleteKey]: isPresent ? null : newStatus,
    };

    setStatusMap(optimistic);

    const prevExceptions = Object.values(statusMap).filter((v) => v !== null)
      .length;
    const nextExceptions = Object.values(optimistic).filter((v) => v !== null)
      .length;

    try {
      if (prevExceptions === 0 && nextExceptions > 0) {
        await deleteAllPresent(programId, attendanceDate);
      }

      if (isPresent) {
        await markPresent(programId, attendanceDate, athleteKey);
      } else {
        await markException(
          programId,
          attendanceDate,
          athleteKey,
          newStatus,
          noteMap[athleteKey] ?? null
        );
      }

      if (nextExceptions === 0) {
        await markAllPresent(programId, attendanceDate);
        setAttendanceIsDirty(false);
      }

      setAttendanceSaveFailed(false);
    } catch (err) {
      console.error("❌ Attendance save failed:", err);
      setAttendanceSaveFailed(true);
    }

    setAttendanceExceptionCount(nextExceptions);
  }

  /* -------------------------------------------------------------------------- */
  /* NOTE CHANGE (AUTO-SAVE)                                                    */
  /* -------------------------------------------------------------------------- */
  async function handleNoteChange(athleteKey: string, note: string) {
    if (!programId) return;

    const status = statusMap[athleteKey];
    if (!status || status === "present") return;

    setAttendanceIsDirty(true);
    setAttendanceSaveFailed(false);

    setNoteMap((prev) => ({ ...prev, [athleteKey]: note }));

    try {
      await deleteAllPresent(programId, attendanceDate);
      await markException(programId, attendanceDate, athleteKey, status, note);
      setAttendanceSaveFailed(false);
    } catch (err) {
      console.error("❌ Attendance save failed:", err);
      setAttendanceSaveFailed(true);
    }
  }

  /* -------------------------------------------------------------------------- */
  /* RENDER                                                                     */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="p-6 space-y-4 overflow-clip">
      {loading ? (
        <p className="text-sm text-[var(--text)]">Loading…</p>
      ) : (
        <AttendanceRosterList
          roster={roster}
          statusMap={statusMap}
          noteMap={noteMap}
          onStatusChange={handleStatusChange}
          onNoteChange={handleNoteChange}
        />
      )}
    </div>
  );
}
