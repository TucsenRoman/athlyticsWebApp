// src/features/attendance/views/AttendanceFieldView.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { format } from "date-fns";

import {
  fetchRoster,
  fetchAttendance,
  markPresent,
  buildAttendanceMaps,
  UiAttendanceStatus,
} from "@/features/attendance";

import {
  markException,
  markAllPresent,
  deleteAllPresent,
} from "@/features/attendance/services/attendance.service";

import AttendanceCover from "@/features/attendance/components/AttendanceCover";
import StatusSelector from "@/features/attendance/components/StatusSelector";

import CardFormatter from "@/components/cards/CardFormatter";
import { useProgramContext } from "@/features/program_cloak/useProgramContext";

import {
  BadgeCheck,
  BadgeX,
  BadgeAlert,
  BadgeHelp,
  UsersRound,
  CalendarDays,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  COMPONENT                                                                  */
/* -------------------------------------------------------------------------- */

export default function AttendanceFieldView() {
  const { selectedProgramId } = useProgramContext();

  const today = format(new Date(), "yyyy-MM-dd");

  const [sessionActive, setSessionActive] = useState(false);

  const [loading, setLoading] = useState(true);
  const [roster, setRoster] = useState<any[]>([]);

  // null/undefined = present; non-null = exception
  const [statusMap, setStatusMap] =
    useState<Record<string, UiAttendanceStatus | null>>({});
  const [noteMap, setNoteMap] = useState<Record<string, string>>({});

  const [lastStats, setLastStats] = useState<{
    percentPresent: number | null;
    lastTakenDate: string | null;
  }>({
    percentPresent: null,
    lastTakenDate: null,
  });

  /* ------------------------------------------------------------------------ */
  /*  LOAD ROSTER                                                             */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!selectedProgramId) return;

    async function loadRoster() {
      const raw = await fetchRoster(selectedProgramId);

      const cleaned = (raw || []).filter((ath: any) => {
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
  }, [selectedProgramId]);

  /* ------------------------------------------------------------------------ */
  /*  PRELOAD LAST SESSION STATS (FOR COVER)                                  */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!selectedProgramId || roster.length === 0) return;

    async function loadStats() {
      const { data } = await fetchAttendance(selectedProgramId, today);

      if (!data?.length) {
        setLastStats({
          percentPresent: null,
          lastTakenDate: null,
        });
        return;
      }

      const hasAllPresent = data.some((r) => r.status === "all_present");

      if (hasAllPresent) {
        setLastStats({
          percentPresent: 100,
          lastTakenDate: today,
        });
        return;
      }

      const total = roster.length;
      const exceptions = data.filter((r) => r.athlete_key).length;
      const present = total - exceptions;

      setLastStats({
        percentPresent:
          total > 0 ? Math.round((present / total) * 100) : null,
        lastTakenDate: today,
      });
    }

    loadStats();
  }, [selectedProgramId, roster.length, today]);

  /* ------------------------------------------------------------------------ */
  /*  LOAD ATTENDANCE AFTER SESSION START                                     */
  /* ------------------------------------------------------------------------ */

  async function loadAttendanceRows() {
    if (!selectedProgramId) return;

    setLoading(true);

    const { data } = await fetchAttendance(selectedProgramId, today);

    const { statusMap: sMap, noteMap: nMap } = buildAttendanceMaps(
      roster,
      data || []
    );

    setStatusMap(sMap);
    setNoteMap(nMap);
    setLoading(false);
  }

  /* ------------------------------------------------------------------------ */
  /*  START SESSION → AUTO LOG ALL PRESENT                                    */
  /* ------------------------------------------------------------------------ */

  async function startSession() {
    if (!selectedProgramId) return;

    // Create clean all_present marker for today
    await markAllPresent(selectedProgramId, today);

    setSessionActive(true);
    await loadAttendanceRows();
  }

  /* ------------------------------------------------------------------------ */
  /*  STATUS CHANGE                                                            */
  /* ------------------------------------------------------------------------ */

  async function updateStatus(
    athleteKey: string,
    newStatus: UiAttendanceStatus
  ) {
    if (!selectedProgramId) return;

    const previousStatus = statusMap[athleteKey];

    // "No exceptions" baseline = everyone is present (null/undefined)
    const hadNoExceptionsBefore = Object.values(statusMap).every(
      (s) => !s || s === "present"
    );

    // Local UI update first
    const nextMap: Record<string, UiAttendanceStatus | null> = {
      ...statusMap,
      [athleteKey]: newStatus === "present" ? null : newStatus,
    };
    setStatusMap(nextMap);

    // If this is the *first* exception of the day → remove all_present row
    if (hadNoExceptionsBefore && newStatus !== "present") {
      await deleteAllPresent(selectedProgramId, today);
    }

    // DB mutation for this athlete
    if (newStatus === "present") {
      await markPresent(selectedProgramId, today, athleteKey);
    } else {
      await markException(
        selectedProgramId,
        today,
        athleteKey,
        newStatus,
        noteMap[athleteKey] ?? null
      );
    }

    // If everyone is present again → rebuild single all_present marker
    const everyonePresent = roster.every((ath: any) => {
      const k = ath.key;
      const s = k === athleteKey ? nextMap[k] : statusMap[k];
      return !s || s === "present";
    });

    if (everyonePresent) {
      await markAllPresent(selectedProgramId, today);
    }
  }

  /* ------------------------------------------------------------------------ */
  /*  NOTE CHANGE                                                              */
  /* ------------------------------------------------------------------------ */

  async function updateNote(athleteKey: string, note: string) {
    if (!selectedProgramId) return;

    const current = statusMap[athleteKey];
    if (!current || current === "present") {
      console.warn("Cannot attach notes to present athletes.");
      return;
    }

    // Local UI note update
    setNoteMap((prev) => ({ ...prev, [athleteKey]: note }));

    // Any note on an exception means this date is no longer a pure all_present
    await deleteAllPresent(selectedProgramId, today);

    // Upsert exception with note
    await markException(
      selectedProgramId,
      today,
      athleteKey,
      current,
      note
    );
  }

  /* ------------------------------------------------------------------------ */
  /*  SUMMARY FOR CARD                                                         */
  /* ------------------------------------------------------------------------ */

  const info = useMemo(() => {
    const total = roster.length;

    const present = roster.reduce((count, ath: any) => {
      const s = statusMap[ath.key];
      return !s || s === "present" ? count + 1 : count;
    }, 0);

    const absent = Object.values(statusMap).filter(
      (s) => s === "absent"
    ).length;
    const tardy = Object.values(statusMap).filter(
      (s) => s === "tardy"
    ).length;
    const other = Object.values(statusMap).filter(
      (s) => s === "other"
    ).length;

    return { total, present, absent, tardy, other };
  }, [statusMap, roster]);

  /* ------------------------------------------------------------------------ */
  /*  COVER FIRST (INSIDE CARD CAROUSEL)                                      */
  /* ------------------------------------------------------------------------ */

  if (!sessionActive) {
    return (
      <CardFormatter
        title="Attendance"
        icon={UsersRound}
        actions={
          <div className="flex items-center gap-2 text-sm text-[var(--text)]">
            <CalendarDays size={16} />
            <span>{format(new Date(), "MMM d, yyyy")}</span>
          </div>
        }
      >
        <div className="p-4">
          <AttendanceCover
            date={today}
            rosterCount={roster.length}
            lastSessionStats={lastStats}
            onStart={startSession}
          />
        </div>
      </CardFormatter>
    );
  }

  /* ------------------------------------------------------------------------ */
  /*  FULL ATTENDANCE CARD                                                     */
  /* ------------------------------------------------------------------------ */

  const attendanceInfoContent = (
    <div className="space-y-2 text-sm text-[var(--text-dark)]">
      <div className="flex items-center gap-2 pb-1 border-b border-[var(--border)]">
        <UsersRound size={14} />
        <span>Total: {info.total}</span>
      </div>

      <div className="flex items-center gap-2">
        <BadgeCheck size={14} className="text-[var(--fvr-green)]" />
        <span>Present: {info.present}</span>
      </div>

      <div className="flex items-center gap-2">
        <BadgeX size={14} className="text-[var(--fvr-red)]" />
        <span>Absent: {info.absent}</span>
      </div>

      <div className="flex items-center gap-2">
        <BadgeAlert size={14} className="text-[var(--fvr-yellow)]" />
        <span>Tardy: {info.tardy}</span>
      </div>

      <div className="flex items-center gap-2">
        <BadgeHelp size={14} className="text-[var(--fvr-indigo)]" />
        <span>Other: {info.other}</span>
      </div>
    </div>
  );

  return (
    <CardFormatter
      title="Attendance"
      icon={UsersRound}
      infoContent={attendanceInfoContent}
      actions={
        <div className="flex items-center gap-2 text-sm text-[var(--text)]">
          <CalendarDays size={16} />
          <span>{format(new Date(), "MMM d, yyyy")}</span>
        </div>
      }
    >
      {loading ? (
        <p className="text-sm text-[var(--text)]">Loading…</p>
      ) : (
        <div className="flex flex-col h-full overflow-y-auto rounded-sm">
          {roster.map((athlete: any, i: number) => {
            const full = athlete.name.trim();
            const key = athlete.key;

            const status = (statusMap[key] ?? "present") as UiAttendanceStatus;
            const note = noteMap[key] ?? "";

            return (
              <div
                key={key}
                className={`
                  flex items-center justify-between
                  px-3 py-2 h-14
                  border-b border-[var(--border)]
                  ${i % 2 === 0 ? "bg-[var(--gray-50)]" : "bg-[var(--gray-200)]"}
                `}
              >
                <div className="flex flex-col min-w-0 leading-tight">
                  <span className="font-medium text-[var(--text-dark)] truncate">
                    {full.split(" ")[0]}
                  </span>
                  <span className="text-xs text-[var(--text)] truncate">
                    {full.split(" ").slice(1).join(" ")}
                  </span>
                </div>

                <StatusSelector
                  value={status}
                  hasNote={note.length > 0}
                  noteValue={note}
                  onChange={(v) => updateStatus(key, v)}
                  onNoteSave={(n) => updateNote(key, n)}
                />
              </div>
            );
          })}
        </div>
      )}
    </CardFormatter>
  );
}
