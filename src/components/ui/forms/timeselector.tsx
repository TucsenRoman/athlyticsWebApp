// src/components/TimeSelector.tsx
"use client";

import { useState, useEffect, useRef } from "react";

/* -------------------------------------------------------------------------- */
/*  TYPES                                                                     */
/* -------------------------------------------------------------------------- */

export type Period = "AM" | "PM";

export interface TimeSelectorProps {
  value?: string | null;
  onChange: (formatted: string) => void;
}

export interface TimeRangeSelectorProps {
  start: string | null;
  end: string | null;
  onChangeStart: (v: string) => void;
  onChangeEnd: (v: string) => void;
}

/* -------------------------------------------------------------------------- */
/*  CONSTANTS                                                                 */
/* -------------------------------------------------------------------------- */

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

/* -------------------------------------------------------------------------- */
/*  MAIN TIME SELECTOR                                                        */
/* -------------------------------------------------------------------------- */

export default function TimeSelector({ value, onChange }: TimeSelectorProps) {
  const parsed = parseTime(value);

  const [hour, setHour] = useState(parsed.hour);
  const [minute, setMinute] = useState(parsed.minute);
  const [period, setPeriod] = useState<Period>(parsed.period);

  // Sync when parent value changes
  useEffect(() => {
    const next = parseTime(value);
    setHour(next.hour);
    setMinute(next.minute);
    setPeriod(next.period);
  }, [value]);

  // Emit time changes upward
  useEffect(() => {
    onChange(`${hour}:${pad(minute)} ${period}`);
  }, [hour, minute, period]);

  return (
    <div className="flex items-center gap-1">
      <Wheel<number>
        label="HOURS"
        values={HOURS}
        selected={hour}
        onSelect={setHour}
        formatter={(v) => v.toString()}
      />

      <span className="text-sm opacity-60">:</span>

      <Wheel<number>
        label="MINUTES"
        values={MINUTES}
        selected={minute}
        onSelect={setMinute}
        formatter={(v) => pad(v)}
      />

      <Wheel<Period>
        label="PERIOD"
        values={["AM", "PM"]}
        selected={period}
        onSelect={setPeriod}
        formatter={(v) => v}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  TIME RANGE SELECTOR (START + END)                                         */
/* -------------------------------------------------------------------------- */

export function TimeRangeSelector({
  start,
  end,
  onChangeStart,
  onChangeEnd,
}: TimeRangeSelectorProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
      {/* START */}
      <div className="flex flex-col">
        <label className="text-xs font-medium text-[var(--gray-600)]">Start</label>
        <div className="flex flex-col items-center gap-1 p-1 bg-[var(--gray-100)] rounded-lg">
          <TimeSelector value={start} onChange={onChangeStart} />
        </div>
      </div>

      {/* DIVIDER */}
      <div className="hidden sm:block sm:h-6 sm:w-px sm:mt-4 sm:bg-[var(--gray-200)]"></div>

      {/* END */}
      <div className="flex flex-col">
        <label className="text-xs font-medium text-[var(--gray-600)]">End</label>
        <div className="flex flex-col items-center gap-1 p-1 bg-[var(--gray-100)] rounded-lg">
          <TimeSelector value={end} onChange={onChangeEnd} />
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  WHEEL (AUTO-SCROLL + SNAP SELECT)                                         */
/* -------------------------------------------------------------------------- */

interface WheelProps<T extends number | string> {
  label: string;
  values: readonly T[];
  selected: T;
  onSelect: (v: T) => void;
  formatter?: (v: T) => string;
}

function Wheel<T extends number | string>({
  label,
  values,
  selected,
  onSelect,
  formatter = (v) => String(v),
}: WheelProps<T>) {
  const ref = useRef<HTMLDivElement>(null);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  /* Auto-scroll to selected item on mount & when selected changes */
  useEffect(() => {
    if (!ref.current) return;
    const container = ref.current;

    const index = values.indexOf(selected);
    if (index === -1) return;

    const child = container.children[index] as HTMLElement | undefined;
    if (!child) return;

    const top =
      child.offsetTop - container.clientHeight / 2 + child.clientHeight / 2;

    container.scrollTo({ top, behavior: "instant" });
  }, [selected, values]);

  /* Auto-select nearest item when scrolling stops */
  const handleScroll = () => {
    if (!ref.current) return;

    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      const container = ref.current!;
      const rect = container.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;

      let best: T | null = null;
      let dist = Infinity;

      const children = Array.from(container.children) as HTMLElement[];

      children.forEach((child, idx) => {
        const childCenter = child.getBoundingClientRect().top + child.clientHeight / 2;
        const d = Math.abs(childCenter - centerY);

        if (d < dist) {
          dist = d;
          best = values[idx];
        }
      });

      if (best !== null && best !== selected) {
        onSelect(best);
      }
    }, 80);
  };

  return (
    <div className="relative group w-12 h-10 overflow-hidden border rounded-lg bg-[var(--gray-50)] select-none">
      <div
        ref={ref}
        onScroll={handleScroll}
        className="flex flex-col h-full overflow-y-scroll snap-y snap-mandatory text-center text-sm py-3 scrollbar-none"
      >
        {values.map((v) => (
          <div
            key={String(v)}
            className={`snap-center cursor-pointer py-0 leading-tight ${
              v === selected ? "text-[var(--accent)]" : "text-[var(--gray-600)]"
            }`}
          >
            {formatter(v)}
          </div>
        ))}
      </div>

      {/* Fades */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-white to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-white to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-[var(--accent-light)]" />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  PARSER                                                                    */
/* -------------------------------------------------------------------------- */

function parseTime(input?: string | null): {
  hour: number;
  minute: number;
  period: Period;
} {
  if (!input) return { hour: 6, minute: 0, period: "AM" };

  try {
    const [timePart, periodRaw] = input.split(" ");
    const [h, m] = timePart.split(":").map(Number);

    return {
      hour: clampHour(h),
      minute: clampMinute(m),
      period: periodRaw === "PM" ? "PM" : "AM",
    };
  } catch {
    return { hour: 6, minute: 0, period: "AM" };
  }
}

function clampHour(n: number) {
  return isNaN(n) || n < 1 || n > 12 ? 6 : n;
}

function clampMinute(n: number) {
  return isNaN(n) || n < 0 || n > 59 ? 0 : n;
}
