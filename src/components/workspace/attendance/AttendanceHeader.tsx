// src/components/workspace/attendance/AttendanceHeader.tsx

interface AttendanceHeaderProps {
  date: string;
  setDate: (value: string) => void;
  onSubmit: () => void;
  isDirty: boolean;
  hasSession: boolean;
}

export function AttendanceHeader({
  date,
  setDate,
  onSubmit,
  isDirty,
  hasSession,
}: AttendanceHeaderProps) {
  const showSubmittedState = hasSession && !isDirty;

  return (
    <div className="flex items-center justify-between mb-4">
      {/* LEFT: Title + Date */}
      <div className="flex items-center gap-3">
        <h2 className="text-[var(--text-dark)] text-xl font-medium">
          Attendance
        </h2>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="
            border border-[var(--border)]
            rounded-md px-3 h-9
            bg-[var(--gray-50)]
            text-[var(--text-dark)]
            text-sm
          "
        />
      </div>

      {/* RIGHT: Submit / Submitted state */}
      <div className="flex items-center gap-2">
        {showSubmittedState && (
          <span
            className="
              px-3 py-1 rounded-full
              text-xs font-medium
              bg-[var(--accent-bg)]
              text-[var(--accent)]
              border border-[var(--accent)]
            "
          >
            Attendance submitted
          </span>
        )}

        <button
          type="button"
          onClick={onSubmit}
          disabled={!isDirty && hasSession}
          className={`
            px-4 py-2 rounded-md text-sm font-medium
            transition-colors
            ${
              !isDirty && hasSession
                ? "bg-[var(--gray-100)] text-[var(--gray-500)] cursor-default"
                : "bg-[var(--accent)] text-white hover:bg-[color-mix(in_srgb,var(--accent)_85%,black_15%)] cursor-pointer"
            }
          `}
        >
          Submit Attendance
        </button>
      </div>
    </div>
  );
}
