// src/components/workspace/schedule/ScheduleEditSlot.tsx
"use client";

import { useEffect, useState } from "react";
import { TimeRangeSelector } from "@/components/ui/TimeSelector";
import {
  Check,
  Star,
  Flag,
  Trophy,
  Dumbbell,
  MapPin,
  Paperclip,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/* CONSTANTS                                                                  */
/* -------------------------------------------------------------------------- */

const COLORS = [
  { id: "blue", cn: "bg-[var(--fvr-blue-md)]" },
  { id: "slate", cn: "bg-[var(--fvr-slate-md)]" },
  { id: "purple", cn: "bg-[var(--fvr-purple-md)]" },
  { id: "yellow", cn: "bg-[var(--fvr-yellow-md)]" },
  { id: "red", cn: "bg-[var(--fvr-red-md)]" },
  { id: "coral", cn: "bg-[var(--fvr-coral-md)]" },
  { id: "teal", cn: "bg-[var(--fvr-teal-md)]" },
  { id: "green", cn: "bg-[var(--fvr-green-md)]" },
];

const ICONS = [
  { id: "star", icon: <Star className="w-4 h-4" /> },
  { id: "flag", icon: <Flag className="w-4 h-4" /> },
  { id: "trophy", icon: <Trophy className="w-4 h-4" /> },
  { id: "dumbbell", icon: <Dumbbell className="w-4 h-4" /> },
];

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

type TimeMode = "none" | "allDay" | null;

interface ScheduleEditSlotProps {
  initialTitle: string;
  initialStart: string | null;
  initialEnd: string | null;
  initialColor: string;
  initialIcon: string;
  initialLocation?: string | null;
  initialAttachment?: string | null;
  initialAllDay?: boolean;
  initialNoEnd?: boolean;

  selectedDays: number[];
  repeatEnabled: boolean;

  onClose: () => void;
  onSave: (slot: {
    title: string;
    start: string | null;
    end: string | null;
    color: string;
    icon: string;
    location: string | null;
    attachment: string | null;
    allDay: boolean;
    noEnd: boolean;
    selectedDays: number[];
    repeatEnabled: boolean;
  }) => void;
  onDelete: () => void;
}

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

function parseTime(str: string | null): number {
  if (!str) return NaN;
  const [hm, period] = str.split(" ");
  if (!hm || !period) return NaN;

  const [h, m] = hm.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return NaN;

  let hour = h;
  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;

  return hour * 60 + m;
}

/* -------------------------------------------------------------------------- */
/* COMPONENT                                                                  */
/* -------------------------------------------------------------------------- */

export default function ScheduleEditSlot({
  initialTitle,
  initialStart,
  initialEnd,
  initialColor,
  initialIcon,
  initialLocation,
  initialAttachment,
  initialAllDay = false,
  initialNoEnd = false,
  selectedDays,
  repeatEnabled,
  onClose,
  onSave,
  onDelete,
}: ScheduleEditSlotProps) {
  const [title, setTitle] = useState(initialTitle);
  const [start, setStart] = useState(initialStart ?? "6:00 AM");
  const [end, setEnd] = useState(initialEnd ?? "7:00 AM");

  const [timeMode, setTimeMode] = useState<TimeMode>(
    initialAllDay ? "allDay" : initialNoEnd ? "none" : null
  );

  const [color, setColor] = useState(initialColor || "blue");
  const [icon, setIcon] = useState(initialIcon || "star");
  const [location, setLocation] = useState(initialLocation ?? "");
  const [attachment, setAttachment] = useState(initialAttachment ?? "");

  /* ---------------------------------------------------------------------- */
  /* SETTLING BUFFER (prevents wheel thrash bugs)                            */
  /* ---------------------------------------------------------------------- */

  const [isSettling, setIsSettling] = useState(false);

  useEffect(() => {
    setIsSettling(true);
    const t = setTimeout(() => setIsSettling(false), 200);
    return () => clearTimeout(t);
  }, [start, end, timeMode]);

  /* ---------------------------------------------------------------------- */
  /* VALIDATION                                                             */
  /* ---------------------------------------------------------------------- */

  const hasTitle = title.trim().length > 0;
  const startMinutes = parseTime(start);
  const endMinutes = parseTime(end);

  const isValid =
    hasTitle &&
    !Number.isNaN(startMinutes) &&
    (
      timeMode === "allDay" ||
      timeMode === "none" ||
      (
        !!end &&
        !Number.isNaN(endMinutes) &&
        startMinutes < endMinutes
      )
    );

  let validationMessage: string | null = null;

  if (!hasTitle) {
    validationMessage = "Title is required.";
  } else if (Number.isNaN(startMinutes)) {
    validationMessage = "Start time is invalid.";
  } else if (
    timeMode !== "allDay" &&
    timeMode !== "none" &&
    (Number.isNaN(endMinutes) || startMinutes >= endMinutes)
  ) {
    validationMessage = "End time must be after start time.";
  }

  const showValidation = !isSettling && !isValid && validationMessage;

  /* ---------------------------------------------------------------------- */
  /* ACTIONS                                                                */
  /* ---------------------------------------------------------------------- */

  function handleSave() {
    if (!isValid || isSettling) return;

    const allDay = timeMode === "allDay";
    const noEnd = timeMode === "none";

    onSave({
      title: title.trim(),
      start,
      end: noEnd || allDay ? null : end,
      color,
      icon,
      location: location || null,
      attachment: attachment || null,
      allDay,
      noEnd,
      selectedDays,
      repeatEnabled,
    });
  }

  /* ---------------------------------------------------------------------- */
  /* RENDER                                                                 */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl w-[90vw] sm:w-[60vw] max-h-[90vh] flex flex-col">

        {/* SCROLL CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 pb-28 flex flex-col gap-6">

          {/* HEADER */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <h2 className="text-base font-semibold">Edit Slot</h2>
            <button
              onClick={onDelete}
              className="text-xs px-3 py-1.5 rounded-md border border-red-200 text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          </div>

          {/* TITLE */}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add title"
            className="w-full text-xl font-medium border-b border-gray-300 pb-1 focus:outline-none focus:border-blue-600"
          />

          {/* TIME */}
          <TimeRangeSelector
            start={start}
            end={end}
            onChangeStart={setStart}
            onChangeEnd={setEnd}
          />

          {/* TOGGLES */}
          <div className="flex gap-3">
            <ToggleButton
              active={timeMode === "none"}
              label="No End"
              onClick={() => setTimeMode(timeMode === "none" ? null : "none")}
            />
            <ToggleButton
              active={timeMode === "allDay"}
              label="All Day"
              onClick={() => setTimeMode(timeMode === "allDay" ? null : "allDay")}
            />
          </div>

          {/* INLINE VALIDATION */}
          {showValidation && (
            <div className="text-xs text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-md">
              {validationMessage}
            </div>
          )}

          {/* ICON */}
          <Picker label="Icon">
            {ICONS.map((ic) => (
              <IconButton
                key={ic.id}
                selected={icon === ic.id}
                onClick={() => setIcon(ic.id)}
              >
                {ic.icon}
              </IconButton>
            ))}
          </Picker>

          {/* COLOR */}
          <Picker label="Color">
            {COLORS.map((c) => (
              <ColorButton
                key={c.id}
                selected={color === c.id}
                className={c.cn}
                onClick={() => setColor(c.id)}
              />
            ))}
          </Picker>

          {/* LOCATION */}
          <LabeledInput
            icon={<MapPin className="w-5 h-5 text-gray-600" />}
            value={location}
            placeholder="Add location"
            onChange={setLocation}
          />

          {/* ATTACHMENT */}
          <LabeledInput
            icon={<Paperclip className="w-5 h-5 text-gray-600" />}
            value={attachment}
            placeholder="Add description or attachment"
            onChange={setAttachment}
          />
        </div>

        {/* FOOTER */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-end gap-3">
          <button onClick={onClose} className="text-sm text-gray-600">
            Cancel
          </button>
          <button
            disabled={!isValid || isSettling}
            onClick={handleSave}
            className={`text-sm px-4 py-1.5 rounded-md ${
              isValid && !isSettling
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* UI HELPERS                                                                */
/* -------------------------------------------------------------------------- */

function ToggleButton({ active, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs rounded-md border ${
        active
          ? "border-blue-600 bg-blue-50 text-blue-700"
          : "border-gray-300 text-gray-700 hover:bg-gray-100"
      }`}
    >
      {label}
    </button>
  );
}

function Picker({ label, children }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium text-gray-600">{label}</label>
      <div className="flex gap-2 flex-wrap">{children}</div>
    </div>
  );
}

function IconButton({ selected, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-10 h-10 rounded-lg border flex items-center justify-center ${
        selected
          ? "border-blue-600 bg-blue-50"
          : "border-gray-300 hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );
}

function ColorButton({ selected, className, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-7 h-7 rounded-full flex items-center justify-center ${className}`}
    >
      {selected && <Check className="w-4 h-4 text-white" />}
    </button>
  );
}

function LabeledInput({ icon, value, placeholder, onChange }) {
  return (
    <div className="flex items-center gap-3">
      {icon}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 py-1.5 text-sm border-b border-gray-300 focus:border-blue-600"
      />
    </div>
  );
}
