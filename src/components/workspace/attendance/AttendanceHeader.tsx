// src/components/workspace/attendance/AttendanceHeader.tsx

export function AttendanceHeader({ date, setDate, onAllPresent }) {
  return (
    <div className="flex items-center justify-between py-2">
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="
          border border-[hsl(var(--gray-300))]
          rounded-md px-2 py-1
          bg-[hsl(var(--gray-50))]
        "
      />
    </div>
  );
}
