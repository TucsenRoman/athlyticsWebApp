// src/components/workspace/attendance/AttendanceRosterList.tsx

import { AttendanceRosterRow, RosterAthlete } from "./AttendanceRosterRow";
import type { StatusOption } from "./StatusSelector";

interface AttendanceRosterListProps {
  roster: RosterAthlete[];
  statusMap: Record<string, StatusOption | null>;
  onStatusChange: (athleteKey: string, status: StatusOption | null) => void;
}

export function AttendanceRosterList({
  roster,
  statusMap,
  onStatusChange,
}: AttendanceRosterListProps) {
  if (!roster.length) {
    return (
      <div className="text-sm text-[var(--gray-600)] px-4 py-6">
        No athletes found in this roster.
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-lg overflow-hidden border border-[var(--border)] bg-[var(--white)]">
      {roster.map((athlete) => (
        <AttendanceRosterRow
          key={athlete.key}
          athlete={athlete}
          status={statusMap[athlete.key] ?? null}
          onChange={(status) => onStatusChange(athlete.key, status)}
        />
      ))}
    </div>
  );
}
