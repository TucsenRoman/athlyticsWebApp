// src/components/workspace/attendance/AttendanceView.tsx

"use client";

import { useState, useEffect } from "react";
import {
  fetchAttendance,
  markAllPresent,
  markException,
  markPresent,
} from "./useAttendance";
import { AttendanceHeader } from "./AttendanceHeader";
import { AttendanceStatusBanner } from "./AttendanceStatusBanner";
import { useProgramContext } from "@/hooks/useProgramContext";
import { getRoster } from "./getRoster";
import StatusSelector from "./StatusSelector";

export default function AttendanceView() {
  const { selectedProgramId: programId } = useProgramContext();

  const [roster, setRoster] = useState([]);
  const [rows, setRows] = useState([]);
  const [map, setMap] = useState({});
  const [type, setType] = useState("none");

  const [date, setDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });

  /* ---------------------------------- ROSTER ---------------------------------- */
  useEffect(() => {
    if (!programId) return;
    getRoster(programId).then(setRoster);
  }, [programId]);

  /* ----------------------------- ATTENDANCE ROWS ------------------------------ */
  async function loadAttendance() {
    if (!programId) return;
    const { data } = await fetchAttendance(programId, date);
    setRows(data || []);
  }

  useEffect(() => {
    loadAttendance();
  }, [programId, date]);

  /* --------------------------- BUILD ATTENDANCE MAP --------------------------- */
  useEffect(() => {
    if (!roster.length) return;

    if (rows.length === 0) {
      setType("none");
      setMap({});
      return;
    }

    const allPresent = rows.some((r) => r.status === "all_present");

    if (allPresent) {
      setType("all_present");

      const mp = {};
      roster.forEach((a) => (mp[a.key] = null)); // default = present

      rows.forEach((r) => {
        if (r.athlete_key && r.status !== "all_present") {
          mp[r.athlete_key] = r.status;
        }
      });

      setMap(mp);
      return;
    }

    // exception mode
    setType("exceptions");

    const mp = {};
    roster.forEach((a) => (mp[a.key] = null)); // default = present

    rows.forEach((r) => {
      if (r.athlete_key) {
        mp[r.athlete_key] = r.status;
      }
    });

    setMap(mp);
  }, [rows, roster]);

  /* ---------------------------- STATUS CHANGE LOGIC --------------------------- */
  async function handleStatusChange(athleteKey, newStatus) {
    // UI "present" = null = remove exception
    if (newStatus === null || newStatus === "present") {
      await markPresent(programId, date, athleteKey);
    } else {
      // allowed: absent | tardy | excused | other
      await markException(programId, date, athleteKey, newStatus);
    }

    await loadAttendance();
  }

  /* ------------------------------ ALL PRESENT btn ----------------------------- */
  async function handleAllPresent() {
    await markAllPresent(programId, date);
    await loadAttendance();
  }

  /* ----------------------------------- UI ------------------------------------ */
  return (
    <div className="p-4 space-y-4">
      <AttendanceHeader
        date={date}
        setDate={setDate}
        onAllPresent={handleAllPresent}
      />

      <AttendanceStatusBanner type={type} />

      <div className="space-y-2">
        {roster.map((ath) => {
          const current = map[ath.key] ?? null; // null = default present

          return (
            <div
              key={ath.key}
              className="flex items-center justify-between px-3 py-2 border-b border-[hsl(var(--gray-200))]"
            >
              <div className="text-sm">{ath.name}</div>

              <StatusSelector
                current={current}
                onChange={(status) => handleStatusChange(ath.key, status)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
