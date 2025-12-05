// src/components/workspace/attendance/AttendanceView.tsx
"use client";

import { useState, useEffect } from "react";
import {
  fetchAttendance,
  markAllPresent,
  markException,
  markPresent,
} from "@/components/attendance/useAttendance";
import { AttendanceStatusBanner } from "./AttendanceStatusBanner";
import { AttendanceRosterList } from "./AttendanceRosterList";
import type { RosterAthlete } from "./AttendanceRosterRow";
import type { StatusOption } from "./StatusSelector";
import { useProgramContext } from "@/hooks/useProgramContext";
import { getRoster } from "@/components/attendance/getRoster";

type AttendanceRow = {
  id: string;
  athlete_key: string | null;
  status: string;
};

export default function AttendanceView() {
  const { selectedProgramId: programId } = useProgramContext();

  const [date, setDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });

  const [roster, setRoster] = useState<RosterAthlete[]>([]);
  const [rows, setRows] = useState<AttendanceRow[]>([]);
  const [statusMap, setStatusMap] = useState<
    Record<string, StatusOption | null>
  >({});
  const [isDirty, setIsDirty] = useState(false);

  /* ------------------------------- LOAD ROSTER ------------------------------- */
  useEffect(() => {
    if (!programId) return;
    getRoster(programId).then(setRoster);
  }, [programId]);

  /* ---------------------------- LOAD ATTENDANCE ---------------------------- */
  async function loadAttendance() {
    if (!programId) return;
    const { data } = await fetchAttendance(programId, date);
    setRows((data as AttendanceRow[]) || []);
  }

  useEffect(() => {
    if (!programId) return;
    setIsDirty(false); // new date/program → reset dirty state
    loadAttendance();
  }, [programId, date]);

  /* ------------------------- BUILD STATUS MAP FROM DB ------------------------ */
  useEffect(() => {
    if (!roster.length) {
      setStatusMap({});
      return;
    }

    const map: Record<string, StatusOption | null> = {};
    roster.forEach((a) => {
      map[a.key] = null; // default = present
    });

    rows.forEach((row) => {
      if (!row.athlete_key) return;

      // DB stores: absent | tardy | excused | other | all_present
      if (
        row.status === "absent" ||
        row.status === "tardy" ||
        row.status === "excused" ||
        row.status === "other"
      ) {
        map[row.athlete_key] = row.status;
      }
    });

    setStatusMap(map);
  }, [rows, roster]);

  const hasSession = rows.length > 0;
  const exceptionsCount = roster.reduce((count, athlete) => {
    const s = statusMap[athlete.key];
    return s && s !== "present" ? count + 1 : count;
  }, 0);

  const bannerMode: "none" | "clean" | "dirty" = !hasSession
    ? "none"
    : isDirty
    ? "dirty"
    : "clean";

  /* --------------------------- STATUS CHANGE HANDLER ------------------------- */
  async function handleStatusChange(
    athleteKey: string,
    newStatus: StatusOption | null
  ) {
    if (!programId) return;

    // UI "present" = null = remove exception row
    if (newStatus === null || newStatus === "present") {
      await markPresent(programId, date, athleteKey);
    } else {
      await markException(programId, date, athleteKey, newStatus);
    }

    setIsDirty(true);
    await loadAttendance();
  }

  /* ------------------------------ SUBMIT HANDLER ----------------------------- */
  async function handleSubmit() {
    if (!programId) return;

    // if there are NO exceptions at submit time:
    // record an explicit all_present row so the session exists historically
    const exceptions = Object.values(statusMap).filter(
      (s) => s && s !== "present"
    );

    if (exceptions.length === 0) {
      await markAllPresent(programId, date);
      await loadAttendance();
    }

    setIsDirty(false);
  }

  /* ----------------------------------- UI ------------------------------------ */
  return (
    <div className="p-6 space-y-4">
      <AttendanceStatusBanner mode={bannerMode} exceptionsCount={exceptionsCount} />

      <AttendanceRosterList
        roster={roster}
        statusMap={statusMap}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
