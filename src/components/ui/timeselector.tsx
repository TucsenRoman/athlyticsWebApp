// src/components/TimeSelector.tsx
"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect, useRef } from "react";

/* -------------------------------------------------------------------------- */
/*  TYPES                                                                     */
/* -------------------------------------------------------------------------- */

export type Period = "AM" | "PM";

export interface TimeSelectorProps {
  value?: string | null;
  onChange: (formatted: string) => void;
}

/* -------------------------------------------------------------------------- */
/*  HELPERS                                                                   */
/* -------------------------------------------------------------------------- */

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

/* -------------------------------------------------------------------------- */
/*  COMPONENT                                                                  */
/* -------------------------------------------------------------------------- */

export default function TimeSelector({ value, onChange }: TimeSelectorProps) {
  const parsed = parseTime(value);

  const [hour, setHour] = useState(parsed.hour);
  const [minute, setMinute] = useState(parsed.minute);
  const [period, setPeriod] = useState<Period>(parsed.period);

  useEffect(() => {
    const formatted = `${hour}:${pad(minute)} ${period}`;
    onChange(formatted);
  }, [hour, minute, period, onChange]);

  return (
    <div className="flex items-center gap-3">

      {/* HOURS ---------------------------------------------------------------- */}
      <Wheel<number>
        values={HOURS}
        selected={hour}
        onSelect={setHour}
        formatter={(v) => v.toString()}
      />

      <span className="text-sm opacity-60">:</span>

      {/* MINUTES -------------------------------------------------------------- */}
      <Wheel<number>
        values={MINUTES}
        selected={minute}
        onSelect={setMinute}
        formatter={(v) => pad(v)}
      />

      {/* PERIOD (“AM” | “PM”) ------------------------------------------------- */}
      <Wheel<Period>
        values={["AM", "PM"]}
        selected={period}
        onSelect={setPeriod}
        formatter={(v) => v}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  WHEEL UI (UI/UX ONLY — NO LOGIC)                                          */
/* -------------------------------------------------------------------------- */

interface WheelProps<T extends number | string> {
  values: readonly T[];
  selected: T;
  onSelect: (v: T) => void;
  formatter?: (v: T) => string;
}

function Wheel<T extends number | string>({
  values,
  selected,
  onSelect,
  formatter = (v) => String(v),
}: WheelProps<T>) {

  const ref = useRef<HTMLDivElement>(null);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  // Automatic selection when scrolling stops
  const handleScroll = () => {
    if (!ref.current) return;

    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);

    scrollTimeout.current = setTimeout(() => {
      const container = ref.current;

      const containerRect = container.getBoundingClientRect();
      const centerY = containerRect.top + containerRect.height / 2;

      let closestValue: T | null = null;
      let closestDistance = Infinity;

      const children = Array.from(container.children) as HTMLElement[];

      children.forEach((child, index) => {
        const rect = child.getBoundingClientRect();
        const itemCenter = rect.top + rect.height / 2;
        const distance = Math.abs(itemCenter - centerY);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestValue = values[index];
        }
      });

      if (closestValue !== null && closestValue !== selected) {
        onSelect(closestValue);
      }
    }, 80);
  };

  // Scroll to next/previous item when chevrons pressed
  const scrollByStep = (direction: "up" | "down") => {
    if (!ref.current) return;

    const container = ref.current;
    const child = container.children[0] as HTMLElement | undefined;
    if (!child) return;

    const itemHeight = child.getBoundingClientRect().height;

    container.scrollBy({
      top: direction === "up" ? -itemHeight : itemHeight,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative group w-12 h-10 overflow-hidden border rounded-lg bg-[var(--gray-50)] select-none">

      {/* TOP CHEVRON */}
      {/* <button
        onClick={() => scrollByStep("up")}
        className="
          absolute right-0 top-1 z-50          
          opacity-0 group-hover:opacity-100 transition-opacity
          text-[var(--gray-500)] hover:text-[var(--accent)]
        "
      >
        <ChevronUp className="w-4 h-4" />
      </button> */}

      {/* Scroll container */}
      <div
        ref={ref}
        onScroll={handleScroll}
        className="flex flex-col h-full overflow-y-scroll snap-y snap-mandatory text-center text-sm py-3 scrollbar-none"
      >
        {values.map((v) => (
          <div
            key={String(v)}
            className={`
              snap-center cursor-pointer py-0 leading-tight
              ${
                v === selected
                  ? "text-[var(--accent)]"
                  : "text-[var(--gray-600)]"
              }
            `}
          >
            {formatter(v)}
          </div>
        ))}
      </div>

      {/* BOTTOM CHEVRON */}
      {/* <button
        onClick={() => scrollByStep("down")}
        className="
          absolute right-0 bottom-1 z-50
          opacity-0 group-hover:opacity-100 transition-opacity
          text-[var(--gray-500)] hover:text-[var(--accent)]
        "
      >
        <ChevronDown className="w-4 h-4" />
      </button> */}

      {/* Fades */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-white to-transparent"></div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-white to-transparent"></div>

      {/* Center marker */}
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
    const [timePart, periodPartRaw] = input.split(" ");
    const [h, m] = timePart.split(":");

    return {
      hour: clampHour(Number(h)),
      minute: clampMinute(Number(m)),
      period: periodPartRaw === "PM" ? "PM" : "AM",
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
