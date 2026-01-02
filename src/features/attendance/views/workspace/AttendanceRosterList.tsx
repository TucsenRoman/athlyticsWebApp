// src/features/attendance/views/workspace/AttendanceRosterList.tsx

import AttendanceRosterRow from "./AttendanceRosterRow";
import type { UiAttendanceStatus } from "@/features/attendance";

import type { RosterAthlete } from "./AttendanceRosterRow";

interface AttendanceRosterListProps {
  roster: RosterAthlete[];
  statusMap: Record<string, UiAttendanceStatus | null>;
  noteMap: Record<string, string>;
  onStatusChange: (athleteKey: string, status: UiAttendanceStatus | null) => void;
  onNoteChange: (athleteKey: string, note: string) => void;
}

export default function AttendanceRosterList({
  roster,
  statusMap,
  noteMap,
  onStatusChange,
  onNoteChange,
}: AttendanceRosterListProps) {
  if (!roster.length) {
    return (
      <div className="text-sm text-[var(--text)] px-4 py-6 text-center">
        No athletes found in this roster.
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-lg overflow-hidden border border-[var(--border-dk)] bg-[var(--bg)]">
      {roster.map((athlete, i) => {
        const status = statusMap[athlete.key] ?? "present";
        const note = noteMap[athlete.key] ?? "";

        return (
          <AttendanceRosterRow
            key={athlete.key}
            athlete={athlete}
            status={status}
            note={note}
            onStatusChange={(newStatus) =>
              onStatusChange(athlete.key, newStatus)
            }
            onNoteChange={(newNote) =>
              onNoteChange(athlete.key, newNote)
            }
            className={
              i % 2 === 0
                ? "bg-[var(--gray-50)]"
                : "bg-[var(--gray-200)]"
            }
          />
        );
      })}
    </div>
  );
}
