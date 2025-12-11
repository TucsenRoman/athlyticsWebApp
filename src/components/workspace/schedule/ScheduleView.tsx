// src/components/workspace/schedule/ScheduleView.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";

import { compileDaySchedule } from "@/utils/schedule/scheduleCompiler";
import type { DbMainSlot, DbSubSlot, UiCompiledSlot } from "@/types/scheduleTypes_TEMP";

import {
  supabase,
  fetchScheduleSubslots,
  addMainSlotToWeek,
} from "@/lib/scheduleAPI";

import { useProgramContext } from "@/hooks/useProgramContext";
import ScheduleAddSlot from "@/components/workspace/schedule/ScheduleAddSlot";

/* -------------------------------------------------------------------------- */
/* PROPS                                                                       */
/* -------------------------------------------------------------------------- */

interface ScheduleViewProps {
  scheduleWeekIndex: number;
  setScheduleWeekIndex: React.Dispatch<React.SetStateAction<number>>;
}

/* -------------------------------------------------------------------------- */
/* COLOR MAP                                                                   */
/* -------------------------------------------------------------------------- */

const COLOR_MAP: Record<string, string> = {
  blue: "bg-blue-200 border-blue-400",
  "blue-sub": "bg-blue-100 border-blue-300",

  green: "bg-green-200 border-green-400",
  "green-sub": "bg-green-100 border-green-300",

  purple: "bg-purple-200 border-purple-400",
  "purple-sub": "bg-purple-100 border-purple-300",

  red: "bg-red-200 border-red-400",
  "red-sub": "bg-red-100 border-red-300",

  gray: "bg-gray-200 border-gray-400",
  "gray-sub": "bg-gray-100 border-gray-300",
};

/* -------------------------------------------------------------------------- */
/* DAYS                                                                        */
/* -------------------------------------------------------------------------- */

const DAYS = [
  { key: "monday", label: "Monday", index: 0 },
  { key: "tuesday", label: "Tuesday", index: 1 },
  { key: "wednesday", label: "Wednesday", index: 2 },
  { key: "thursday", label: "Thursday", index: 3 },
  { key: "friday", label: "Friday", index: 4 },
  { key: "saturday", label: "Saturday", index: 5 },
  { key: "sunday", label: "Sunday", index: 6 },
];

/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT                                                              */
/* -------------------------------------------------------------------------- */

export default function ScheduleView({
  scheduleWeekIndex,
  setScheduleWeekIndex,
}: ScheduleViewProps) {
  const { selectedProgramId } = useProgramContext();

  const [mainSlots, setMainSlots] = useState<DbMainSlot[]>([]);
  const [subSlots, setSubSlots] = useState<DbSubSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showScheduleAdd, setShowScheduleAdd] = useState(false);

  /* ---------------------------------------------------------------------- */
  /* TOOLBAR EVENT LISTENER                                                 */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    function openAddSlot() {
      setShowScheduleAdd(true);
    }

    window.addEventListener("schedule-open-add", openAddSlot);
    return () => window.removeEventListener("schedule-open-add", openAddSlot);
  }, []);

  /* ---------------------------------------------------------------------- */
  /* LOAD MAIN SLOTS + SUBSLOTS                                             */
  /* ---------------------------------------------------------------------- */

  async function reloadWeek(programId: number, weekIndex: number) {
    setLoading(true);
    setError(null);

    try {
      // 1) Fetch all main slots for this program + week
      const { data: main, error: mainErr } = await supabase
        .from("schedule_slots")
        .select("*")
        .eq("program_id", programId)
        .eq("week_index", weekIndex);

      if (mainErr) throw mainErr;

      const mainList = (main ?? []) as DbMainSlot[];
      setMainSlots(mainList);

      // 2) If there are no main slots, clear subs and bail
      const ids = mainList.map((s) => s.id);
      if (ids.length === 0) {
        setSubSlots([]);
        return;
      }

      // 3) Fetch all subslots for these main slot IDs
      const subs = await fetchScheduleSubslots(ids);
      setSubSlots((subs ?? []) as DbSubSlot[]);
    } catch (err) {
      console.error("Schedule load error:", err);
      setError("Unable to load schedule");
      setMainSlots([]);
      setSubSlots([]);
    } finally {
      setLoading(false);
    }
  }

  /* ---------------------------------------------------------------------- */
  /* LOAD WHEN PROGRAM OR WEEK CHANGES                                      */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!selectedProgramId) return;
    const programId = Number(selectedProgramId);
    reloadWeek(programId, scheduleWeekIndex);
  }, [selectedProgramId, scheduleWeekIndex]);

  /* ---------------------------------------------------------------------- */
  /* SUBMIT NEW SLOT                                                        */
  /* ---------------------------------------------------------------------- */

  async function handleSubmitNewSlot(slotData: {
    day: number;
    title: string;
    time: string;
    color: string;
  }) {
    if (!selectedProgramId) return;

    const programId = Number(selectedProgramId);
    const { day } = slotData;

    const title = slotData.title.trim();
    const time = slotData.time.trim();
    const color = slotData.color.trim();

    if (!title) return;

    try {
      setLoading(true);
      setError(null);

      await addMainSlotToWeek({
        programId,
        weekIndex: scheduleWeekIndex,
        day,
        title,
        time: time || null,
        color: color || null,
      });

      await reloadWeek(programId, scheduleWeekIndex);
      setShowScheduleAdd(false);
    } catch (err) {
      console.error("addMainSlotToWeek error:", err);
      setError("Unable to add schedule slot");
    } finally {
      setLoading(false);
    }
  }

  /* ---------------------------------------------------------------------- */
  /* COMPILE UI                                                             */
  /* ---------------------------------------------------------------------- */

  const compiledByDay: Record<number, UiCompiledSlot[]> = useMemo(() => {
    const bucket: Record<number, UiCompiledSlot[]> = {};
    for (let i = 0; i < 7; i++) {
      bucket[i] = compileDaySchedule({
        day: i,
        main: mainSlots,
        subs: subSlots,
      });
    }
    return bucket;
  }, [mainSlots, subSlots]);

  /* ---------------------------------------------------------------------- */
  /* NO PROGRAM SELECTED                                                    */
  /* ---------------------------------------------------------------------- */

  if (!selectedProgramId) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-[var(--text-muted)]">
        Select a program to view the schedule.
      </div>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* RENDER                                                                 */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="flex flex-col w-full h-full">
      {/* DAY LABELS -------------------------------------------------------- */}
      <div className="flex border-b border-[var(--border)] bg-[var(--gray-50)]">
        <div className="grid grid-cols-7 flex-1">
          {DAYS.map((d) => (
            <div
              key={d.key}
              className="text-center py-3 font-semibold text-[var(--text-dark)] border-r last:border-r-0 border-[var(--border)]"
            >
              {d.label}
            </div>
          ))}
        </div>
      </div>

      {/* MAIN GRID --------------------------------------------------------- */}
      <div className="flex flex-1 min-h-0 overflow-y-auto">
        <div className="grid grid-cols-7 flex-1 min-h-0">
          {DAYS.map((d) => {
            const slots = compiledByDay[d.index];

            return (
              <div
                key={d.key}
                className="border-r last:border-r-0 border-[var(--border)] p-2 space-y-2 min-h-full"
              >
                {slots.length === 0 && !loading && <div className="h-4" />}

                {slots.map((slot) => {
                  const mainColor =
                    COLOR_MAP[slot.color ?? ""] ||
                    "bg-gray-200 border-gray-400";

                  return (
                    <div
                      key={slot.id}
                      className={`rounded-md border p-2 text-sm font-medium ${mainColor} shadow-sm`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{slot.title}</span>
                        {slot.time && (
                          <span className="text-xs opacity-70">
                            {slot.time}
                          </span>
                        )}
                      </div>

                      {slot.subslots.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {slot.subslots.map((sub) => {
                            const subColor =
                              COLOR_MAP[sub.color ?? ""] ||
                              "bg-gray-100 border-gray-300";

                            return (
                              <div
                                key={sub.id}
                                className={`text-xs rounded px-2 py-1 text-center border ${subColor}`}
                              >
                                {sub.title}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL ------------------------------------------------------------- */}
      {showScheduleAdd && (
        <ScheduleAddSlot
          onClose={() => setShowScheduleAdd(false)}
          onSubmit={handleSubmitNewSlot}
        />
      )}
    </div>
  );
}
