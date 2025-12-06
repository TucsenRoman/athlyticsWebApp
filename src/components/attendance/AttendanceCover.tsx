// src/components/workspace/attendance/AttendanceCover.tsx
"use client";

import { useMemo } from "react";
import { UsersRound, CalendarDays, Clock } from "lucide-react";

interface AttendanceCoverProps {
  date: string; // yyyy-MM-dd
  rosterCount: number;
  lastSessionStats?: {
    percentPresent: number | null;
    lastTakenDate: string | null;
  };
  onStart: () => void;
}

export default function AttendanceCover({
  date,
  rosterCount,
  lastSessionStats,
  onStart,
}: AttendanceCoverProps) {
  /* -------------------------------------------------------------------------- */
  /*  DERIVED DISPLAY VALUES                                                    */
  /* -------------------------------------------------------------------------- */

  const todayPretty = useMemo(() => {
    try {
      return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return date;
    }
  }, [date]);

  const percentText =
    lastSessionStats?.percentPresent != null
      ? `${lastSessionStats.percentPresent}%`
      : "—";

  const lastTaken =
    lastSessionStats?.lastTakenDate != null
      ? new Date(lastSessionStats.lastTakenDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      : "No recent attendance";

  /* -------------------------------------------------------------------------- */
  /*  UI                                                                        */
  /* -------------------------------------------------------------------------- */

  return (
    <div
      className="
        border border-[var(--border-dark)]
        rounded-2xl bg-[var(--bg)]
        px-6 py-8
        shadow-lg
        flex flex-col gap-6
      "
    >
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[var(--text-dark)]">
          Attendance Overview
        </h2>

        <div className="flex gap-2 items-center text-[var(--text)] text-sm">
          <CalendarDays size={16} />
          {todayPretty}
        </div>
      </div>

      {/* STATS BLOCK */}
      <div
        className="
          grid grid-cols-3 gap-4
          text-center
        "
      >
        <div
          className="
            flex flex-col items-center
            p-4 rounded-lg
            bg-[var(--gray-50)]
            border border-[var(--border)]
          "
        >
          <UsersRound size={20} className="text-[var(--text-dark)] mb-1" />
          <span className="text-xl font-semibold text-[var(--text-dark)]">
            {rosterCount}
          </span>
          <span className="text-xs text-[var(--text)]">Athletes</span>
        </div>

        <div
          className="
            flex flex-col items-center
            p-4 rounded-lg
            bg-[var(--gray-50)]
            border border-[var(--border)]
          "
        >
          <Clock size={20} className="text-[var(--text-dark)] mb-1" />
          <span className="text-xl font-semibold text-[var(--text-dark)]">
            {percentText}
          </span>
          <span className="text-xs text-[var(--text)]">
            Last Session Present
          </span>
        </div>

        <div
          className="
            flex flex-col items-center
            p-4 rounded-lg
            bg-[var(--gray-50)]
            border border-[var(--border)]
          "
        >
          <CalendarDays size={20} className="text-[var(--text-dark)] mb-1" />
          <span className="text-xs text-[var(--text)]">
            {lastTaken}
          </span>
          <span className="text-xs text-[var(--text)]">Last Logged</span>
        </div>
      </div>

      {/* START BUTTON */}
      <div className="flex justify-center">
        <button
          onClick={onStart}
          className="
            px-6 py-3
            rounded-full
            bg-[var(--accent)]
            text-white font-semibold
            hover:bg-[var(--accent-dark)]
            transition
            shadow-md
          "
        >
          Start Attendance
        </button>
      </div>

      {/* FOOTER INFO */}
      <p className="text-xs text-center text-[var(--text)] opacity-70">
        Attendance is not logged until a session is started.
      </p>
    </div>
  );
}
