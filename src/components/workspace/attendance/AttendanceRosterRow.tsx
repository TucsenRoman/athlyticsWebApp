// src/components/workspace/attendance/AttendanceRosterRow.tsx

import React from "react";
import { AttendanceStatus } from "./attendanceTypes";

const STATUS_STYLES: Record<AttendanceStatus, string> = {
  present: "bg-[hsl(var(--gray-200))] text-[hsl(var(--gray-700))]",
  absent: "bg-red-600 text-white",
  tardy: "bg-yellow-500 text-black",
  sick: "bg-blue-600 text-white",
  other: "bg-[hsl(var(--gray-400))] text-black",
};

export function AttendanceRosterRow({ athlete, status, onToggle }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[hsl(var(--gray-300))]">
      <span>{athlete.name}</span>
      <button
        onClick={onToggle}
        className={`px-3 py-1 rounded-md text-sm ${STATUS_STYLES[status]}`}
      >
        {status}
      </button>
    </div>
  );
}
