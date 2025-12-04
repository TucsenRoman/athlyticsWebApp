// src/components/workspace/attendance/AttendanceRosterList.tsx

import { AttendanceRosterRow } from "./AttendanceRosterRow";

export function AttendanceRosterList({ roster, map, onToggle }) {
  return (
    <div className="flex flex-col gap-1">
      {roster.map((athlete) => (
        <AttendanceRosterRow
          key={athlete.key}
          athlete={athlete}
          status={map[athlete.key]}
          onToggle={() => onToggle(athlete.key)}
        />
      ))}
    </div>
  );
}
