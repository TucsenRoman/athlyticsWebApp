// src/components/workspace/attendance/AttendanceRosterRow.tsx

import StatusSelector, { StatusOption } from "./StatusSelector";

export interface RosterAthlete {
  key: string;
  name: string;
}

interface AttendanceRosterRowProps {
  athlete: RosterAthlete;
  status: StatusOption | null;
  onChange: (status: StatusOption | null) => void;
}

export function AttendanceRosterRow({
  athlete,
  status,
  onChange,
}: AttendanceRosterRowProps) {
  return (
    <div
      className="
        flex items-center justify-between
        px-4 py-3
        border-b border-[var(--border)]
        bg-[var(--white)]
      "
    >
      <div className="text-sm font-medium text-[var(--text-dark)]">
        {athlete.name}
      </div>

      <StatusSelector current={status} onChange={onChange} />
    </div>
  );
}
