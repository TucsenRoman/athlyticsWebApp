// src/features/attendance/views/workspace/AttendanceRosterRow.tsx

"use client";

import { cn } from "@/utils/utils";
import { StatusSelector, type UiAttendanceStatus } from "@/features/attendance";

export interface RosterAthlete {
  key: string;
  name: string;
}

export interface AttendanceRosterRowProps {
  athlete: RosterAthlete;
  status: UiAttendanceStatus | null;
  note: string | null;
  onStatusChange: (status: UiAttendanceStatus | null) => void;
  onNoteChange: (note: string) => void;
  className?: string;
}

export default function AttendanceRosterRow({
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
        text-[var(--text-dk)]
        min-w-0
        hover:bg-[var(--dom-bg)]
      `,
        className
      )}
    >
      <div className="flex flex-col min-w-0 leading-tight">
        <span className="font-medium truncate">{first}</span>
        {last && (
          <span className="text-xs text-[var(--text)] truncate">{last}</span>
        )}
      </div>

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
