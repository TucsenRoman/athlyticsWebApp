// src/components/workspace/attendance/AttendanceRosterRow.tsx

"use client";

import { cn } from "@/lib/utils";
import StatusSelector from "../../attendance/StatusSelector";
import { UiAttendanceStatus } from "@/components/attendance/attendanceTypes";

export interface RosterAthlete {
  key: string;
  name: string;
}

export interface AttendanceRosterRowProps {
  athlete: RosterAthlete;
  status: UiAttendanceStatus | null;
  note: string | null;                    // <-- NEW
  onStatusChange: (status: UiAttendanceStatus | null) => void;
  onNoteChange: (note: string) => void;   // <-- NEW
  className?: string;
}

export function AttendanceRosterRow({
  athlete,
  status,
  note,
  onStatusChange,
  onNoteChange,
  className,
}: AttendanceRosterRowProps) {
  const full = athlete.name.trim();
  const first = full.split(" ")[0] ?? "";
  const last = full.split(" ").slice(1).join(" ");

  return (
    <div
      className={cn(
        `
        flex items-center justify-between
        px-4 py-2 h-14
        border-b border-[var(--border)]
        bg-[var(--gray-50)]
        text-[var(--text-dark)]
        min-w-0
      `,
        className
      )}
    >
      {/* Athlete Name */}
      <div className="flex flex-col min-w-0 leading-tight">
        <span className="font-medium truncate">{first}</span>
        {last && (
          <span className="text-xs text-[var(--text)] truncate">{last}</span>
        )}
      </div>

      {/* Status Selector */}
      <StatusSelector
        value={(status ?? "present") as UiAttendanceStatus}
        hasNote={Boolean(note)}
        noteValue={note ?? ""}
        onChange={onStatusChange}
        onNoteSave={onNoteChange}
      />
    </div>
  );
}
