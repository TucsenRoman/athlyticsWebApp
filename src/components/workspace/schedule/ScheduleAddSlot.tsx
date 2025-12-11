// src/components/workspace/schedule/ScheduleAddSlot.tsx
"use client";

import { useState } from "react";
import TimePicker from "@/components/ui/TimeSelector";

const DAY_OPTIONS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

interface ScheduleAddSlotProps {
  onClose: () => void;
  onSubmit: (slot: {
    day: number;
    title: string;
    time: string | null;
    color: string | null;
  }) => void;
}

export default function ScheduleAddSlot({
  onClose,
  onSubmit,
}: ScheduleAddSlotProps) {
  const [day, setDay] = useState(0);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState<string | null>("6:00 PM");
  const [color, setColor] = useState("blue");

  const isValid = title.trim().length > 0 && !!time;

  function handleAdd() {
    if (!isValid) return;
    onSubmit({
      day,
      title: title.trim(),
      time,
      color,
    });
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 shadow-lg w-[320px] space-y-4">
        <h2 className="text-lg font-semibold text-[var(--text-dark)]">
          Add Schedule Slot
        </h2>

        {/* Day */}
        <div>
          <label className="text-xs font-medium text-[var(--text-muted)]">
            Day
          </label>
          <select
            className="w-full border rounded px-2 py-1 text-sm mt-1"
            value={day}
            onChange={(e) => setDay(Number(e.target.value))}
          >
            {DAY_OPTIONS.map((d, i) => (
              <option key={i} value={i}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="text-xs font-medium text-[var(--text-muted)]">
            Title
          </label>
          <input
            className="w-full border rounded px-2 py-1 text-sm mt-1"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Practice"
          />
        </div>

        {/* Time (12-hour, scroll-ish selects) */}
        <TimePicker
          value={time}
          onChange={(v) => setTime(v)}
        />

        {/* Color */}
        <div>
          <label className="text-xs font-medium text-[var(--text-muted)]">
            Color
          </label>
          <select
            className="w-full border rounded px-2 py-1 text-sm mt-1"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          >
            <option value="blue">Blue</option>
            <option value="green">Green</option>
            <option value="purple">Purple</option>
            <option value="red">Red</option>
            <option value="gray">Gray</option>
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            className="px-3 py-1 text-sm text-[var(--text-muted)]"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className={`
              px-3 py-1 text-sm rounded 
              ${isValid
                ? "bg-[var(--fvr-blue)] text-white hover:opacity-90"
                : "bg-[var(--gray-200)] text-[var(--text-muted)] cursor-not-allowed"}
            `}
            onClick={handleAdd}
            disabled={!isValid}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
