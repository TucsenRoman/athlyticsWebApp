// src/components/workspace/attendance/AttendanceView.tsx
"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";

import AttendanceCover from "@/components/attendance/AttendanceCover";
import { AttendanceRosterList } from "./AttendanceRosterList";

import {
  fetchAttendance,
  markPresent,
  markException,
  deleteAllPresent,
  markAllPresent,
  buildAttendanceMaps,
} from "@/components/attendance/useAttendance";

import type { UiAttendanceStatus } from "@/components/attendance/attendanceTypes";
import { useProgramContext } from "@/hooks/useProgramContext";
import { getRoster } from "@/components/attendance/getRoster";

export default function AttendanceView() {
  const { selectedProgramId: programId } = useProgramContext();

  const [date] = useState(() => format(new Date(), "yyyy-MM-dd"));

  const [sessionActive, setSessionActive] = useState(false);

  const [roster, setRoster] = useState<any[]>([]);
  const [statusMap, setStatusMap] =
    useState<Record<string, UiAttendanceStatus | null>>({});
  const [noteMap, setNoteMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const [lastStats, setLastStats] = useState({
    percentPresent: null as number | null,
    lastTakenDate: null as string | null,
  });

  /* -------------------------------------------------------------------------- */
  /*  LOAD ROSTER                                                               */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    if (!programId) return;

    async function loadRoster() {
      const r = await getRoster(programId);

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
  /*  LOAD STATS FOR COVER                                                      */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    if (!programId || roster.length === 0) return;

    async function preload() {
      const { data } = await fetchAttendance(programId, date);

      if (!data?.length) {
        setLastStats({ percentPresent: null, lastTakenDate: null });
        return;
      }

      const hasAllPresent = data.some((r) => r.status === "all_present");

      let percentPresent = 100;

      if (!hasAllPresent) {
        const exceptions = data.filter((r) => r.athlete_key).length;
        percentPresent =
          roster.length > 0
            ? Math.round(((roster.length - exceptions) / roster.length) * 100)
            : 0;
      }

      setLastStats({
        percentPresent,
        lastTakenDate: date,
      });
    }

    preload();
  }, [programId, roster.length, date]);

  /* -------------------------------------------------------------------------- */
  /*  LOAD ATTENDANCE (ONLY WHEN SESSION STARTS)                                */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    if (!sessionActive || !programId) return;

    async function load() {
      setLoading(true);
      const { data } = await fetchAttendance(programId, date);

      const { statusMap: sMap, noteMap: nMap } =
        buildAttendanceMaps(roster, data || []);

      setStatusMap(sMap);
      setNoteMap(nMap);
      setLoading(false);
    }

    load();
  }, [sessionActive, programId, roster, date]);

  /* -------------------------------------------------------------------------- */
  /*  START SESSION — AUTO CREATE ALL_PRESENT                                   */
  /* -------------------------------------------------------------------------- */

  async function startSession() {
    if (!programId) return;
    setSessionActive(true);

    await markAllPresent(programId, date);
  }

  /* -------------------------------------------------------------------------- */
  /*  STATUS CHANGE (NO UI RELOAD)                                              */
  /* -------------------------------------------------------------------------- */

  async function handleStatusChange(
    athleteKey: string,
    newStatus: UiAttendanceStatus | null
  ) {
    if (!programId) return;

    const oldStatus = statusMap[athleteKey];

    // Update UI immediately
    setStatusMap((prev) => ({
      ...prev,
      [athleteKey]: newStatus === "present" ? null : newStatus,
    }));

    // If this is the FIRST exception → delete all_present
    const hadNoExceptions =
      Object.values(statusMap).every((s) => !s || s === "present");

    if (hadNoExceptions && newStatus !== "present") {
      await deleteAllPresent(programId, date);
    }

    // DB mutation
    if (newStatus === "present" || newStatus === null) {
      await markPresent(programId, date, athleteKey);
    } else {
      await markException(
        programId,
        date,
        athleteKey,
        newStatus,
        noteMap[athleteKey] ?? null
      );
    }

    // If EVERYONE is present → rebuild to all_present
    const everyonePresent =
      roster.every((a) =>
        a.key === athleteKey ? newStatus === "present" : !statusMap[a.key]
      );

    if (everyonePresent) {
      await markAllPresent(programId, date);
    }
  }

  /* -------------------------------------------------------------------------- */
  /*  NOTE CHANGE                                                               */
  /* -------------------------------------------------------------------------- */

  async function handleNoteChange(athleteKey: string, note: string) {
    if (!programId) return;

    const current = statusMap[athleteKey];
    if (!current || current === "present") return;

    // Update UI
    setNoteMap((prev) => ({ ...prev, [athleteKey]: note }));

    await deleteAllPresent(programId, date);
    await markException(programId, date, athleteKey, current, note);
  }

  /* -------------------------------------------------------------------------- */
  /*  RENDER                                                                    */
  /* -------------------------------------------------------------------------- */

  if (!sessionActive) {
    return (
      <div className="p-6">
        <AttendanceCover
          date={date}
          rosterCount={roster.length}
          lastSessionStats={lastStats}
          onStart={startSession}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
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
