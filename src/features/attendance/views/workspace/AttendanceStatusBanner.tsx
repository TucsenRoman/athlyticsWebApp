// src/features/attendance/views/workspace/AttendanceStatusBanner.tsx

export default function AttendanceStatusBanner({
  mode,
  exceptionsCount,
}: {
  mode: "none" | "clean" | "dirty";
  exceptionsCount: number;
}) {
  if (mode === "none") {
    return (
      <div
        className="
          p-4 rounded-lg
          bg-[var(--gray-100)]
          border border-[var(--border)]
          text-[var(--text)]
          text-sm
        "
      >
        <div className="font-medium text-[var(--text-dark)]">
          No attendance recorded for this date.
        </div>
        <div className="text-xs mt-1 text-[var(--gray-600)]">
          Start marking athletes to create a session, then submit when you’re
          done.
        </div>
      </div>
    );
  }

  if (mode === "dirty") {
    return (
      <div
        className="
          p-4 rounded-lg
          bg-[var(--fvr-yellow-bg)]
          border border-[var(--fvr-yellow)]
          text-[var(--text-dark)]
          text-sm
        "
      >
        <div className="font-medium">Taking attendance…</div>
        <div className="text-xs mt-1">
          {exceptionsCount > 0
            ? `${exceptionsCount} exception${
                exceptionsCount === 1 ? "" : "s"
              } recorded.`
            : "Changes not yet submitted."}
        </div>
      </div>
    );
  }

  // clean
  return (
    <div
      className="
        p-4 rounded-lg
        bg-[var(--accent-bg)]
        border border-[var(--accent)]
        text-[var(--text-dark)]
        text-sm
      "
    >
      <div className="font-medium text-[var(--accent)]">
        Attendance submitted for this date.
      </div>
      <div className="text-xs mt-1 text-[var(--gray-700)]">
        {exceptionsCount > 0
          ? `${exceptionsCount} exception${
              exceptionsCount === 1 ? "" : "s"
            } recorded.`
          : "Everyone marked present."}
      </div>
    </div>
  );
}
