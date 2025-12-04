// src/components/workspace/attendance/AttendanceStatusBanner.tsx

export function AttendanceStatusBanner({ type }) {
  if (type === "none") {
    return (
      <div className="p-2 rounded-md bg-[hsl(var(--gray-100))] text-[hsl(var(--gray-700))]">
        No session recorded for this date.
      </div>
    );
  }

  if (type === "all_present") {
    return (
      <div className="p-2 rounded-md bg-[hsl(var(--accent))] text-white">
        All athletes present.
      </div>
    );
  }

  return null; // exceptions → no banner needed
}
