// src/features/schedule/views/workspace/ScheduleWorkspaceView.tsx
"use client";

import { useEffect, useState, useMemo } from "react";

/* -------------------------------------------------------------------------- */
/*  FEATURE API (SCHEDULE)                                                     */
/* -------------------------------------------------------------------------- */

import {
  // services
  fetchScheduleWeek,
  createScheduleWeek,
  fetchScheduleSlots,
  fetchSubslotsForSlots,
  createScheduleSlot,
  updateScheduleSlot,
  deleteScheduleSlot,
  loadScheduleWeekReadOnly,
  ScheduleAddSlot,
  ScheduleSlotDetails,
  ScheduleEditSlot,

  // types
  type DbScheduleWeek,
  type DbScheduleSlot,
  type DbScheduleSubslot,
  type UiCompiledWeek,
} from "@/features/schedule";

/* -------------------------------------------------------------------------- */
/*  PROPS                                                                     */
/* -------------------------------------------------------------------------- */

interface ScheduleViewProps {
  programId: number;
  scheduleWeekIndex: number;
  setScheduleWeekIndex: React.Dispatch<React.SetStateAction<number>>;
  triggerAddSlot: boolean;
  setTriggerAddSlot: (v: boolean) => void;
}

/* -------------------------------------------------------------------------- */

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const FULL_DAY_LABELS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

/* -------------------------------------------------------------------------- */
/*  COLOR MAPS — USING ATHLYTICS FLAVORS                                      */
/* -------------------------------------------------------------------------- */

const SLOT_COLOR_MAP: Record<string, string> = {
  blue:   "bg-[var(--fvr-blue-md)]",
  slate:  "bg-[var(--fvr-slate-md)]",
  purple: "bg-[var(--fvr-purple-md)]",
  yellow: "bg-[var(--fvr-yellow-md)]",
  red:    "bg-[var(--fvr-red-md)]",
  coral:  "bg-[var(--fvr-coral-md)]",
  teal:   "bg-[var(--fvr-teal-md)]",
  green:  "bg-[var(--fvr-green-md)]",
  indigo: "bg-[var(--fvr-indigo-md)]",
};

const SUBSLOT_COLOR_MAP: Record<string, string> = {
  blue:   "bg-[var(--fvr-blue-bg)]",
  slate:  "bg-[var(--fvr-slate-bg)]",
  purple: "bg-[var(--fvr-purple-bg)]",
  yellow: "bg-[var(--fvr-yellow-bg)]",
  red:    "bg-[var(--fvr-red-bg)]",
  coral:  "bg-[var(--fvr-coral-bg)]",
  teal:   "bg-[var(--fvr-teal-bg)]",
  green:  "bg-[var(--fvr-green-bg)]",
  indigo: "bg-[var(--fvr-indigo-bg)]",
};


function normalizeColorKey(raw?: string | null): keyof typeof SLOT_COLOR_MAP {
  if (!raw) return "gray";
  const cleaned = raw.replace("slot-", ""); // supports "blue" & "slot-blue"
  if (cleaned in SLOT_COLOR_MAP) return cleaned as keyof typeof SLOT_COLOR_MAP;
  return "gray";
}

/* -------------------------------------------------------------------------- */
/*  ADD SLOT PAYLOAD (FROM MODAL)                                             */
/* -------------------------------------------------------------------------- */

interface AddSlotFormPayload {
  title: string;
  color: string | null;
  icon: string;

  selectedDays: number[];
  repeatEnabled: boolean;

  start: string;
  end: string | null;

  allDay: boolean;
  noEnd: boolean;
}

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

function parseTimeString(v: string): number {
  const [hm, period] = v.split(" ");
  const [h, m] = hm.split(":").map(Number);

  let hour = h;
  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;

  return hour * 60 + m;
}

/* -------------------------------------------------------------------------- */
/* COMPONENT                                                                   */
/* -------------------------------------------------------------------------- */

export default function ScheduleView({
  programId,
  scheduleWeekIndex,
  setScheduleWeekIndex, // currently unused but kept for future toolbar wiring
  triggerAddSlot,
  setTriggerAddSlot,
}: ScheduleViewProps) {
  const [week, setWeek] = useState<DbScheduleWeek | null>(null);
  const [slots, setSlots] = useState<DbScheduleSlot[]>([]);
  const [subslots, setSubslots] = useState<DbScheduleSubslot[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [showAdd, setShowAdd] = useState(false);

  // DETAILS MODAL
  const [showDetails, setShowDetails] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);

  // EDIT MODAL
  const [showEdit, setShowEdit] = useState(false);

  // LIST VIEW (auto on mobile)
  const [listView, setListView] = useState(false);

  const [compiled, setCompiled] = useState<UiCompiledWeek | null>(null);

  const DEFAULT_REPEAT_WEEKS = 12;

  /* ---------------------------------------------------------------------- */
  /* AUTO LIST VIEW FOR MOBILE                                              */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mql = window.matchMedia("(max-width: 767px)");

    const apply = (e: MediaQueryList | MediaQueryListEvent) => {
      setListView(e.matches);
    };

    apply(mql);
    mql.addEventListener("change", apply as any);

    return () => mql.removeEventListener("change", apply as any);
  }, []);

  /* ---------------------------------------------------------------------- */
  /* LOAD WEEK                                                              */
  /* ---------------------------------------------------------------------- */

  async function loadWeek(): Promise<DbScheduleWeek | null> {
    const existing = await fetchScheduleWeek(programId, scheduleWeekIndex);
    return existing || null;
  }

  /* ---------------------------------------------------------------------- */
  /* LOAD SLOTS + SUBSLOTS                                                  */
  /* ---------------------------------------------------------------------- */

  async function loadSlotsForWeek(w: DbScheduleWeek) {
    const s = await fetchScheduleSlots(w.id);
    const ids = s.map((x) => x.id);

    const sub = await fetchSubslotsForSlots(ids);

    setSlots(s);
    setSubslots(sub);
  }

  /* ---------------------------------------------------------------------- */
  /* MASTER LOADER                                                          */
  /* ---------------------------------------------------------------------- */

  async function loadData() {
    if (!programId) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const result = await loadScheduleWeekReadOnly({
        programId,
        scheduleWeekIndex,
      });

      setWeek(result.week);
      setSlots(result.slots);
      setSubslots(result.subslots);
      setCompiled(result.compiled);
    } catch (err: any) {
      setErrorMsg(err.message ?? "Failed to load schedule.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [programId, scheduleWeekIndex]);

  useEffect(() => {
    if (triggerAddSlot) {
      setShowAdd(true);
      setTriggerAddSlot(false);
    }
  }, [triggerAddSlot, setTriggerAddSlot]);

  /* ---------------------------------------------------------------------- */
  /* ADD SLOT LOGIC                                                         */
  /* ---------------------------------------------------------------------- */

  async function handleAddSlot(data: AddSlotFormPayload) {
    const trimmedTitle = data.title.trim();
    if (!trimmedTitle || data.selectedDays.length === 0) {
      setShowAdd(false);
      return;
    }

    let baseWeek = week;

    if (!baseWeek) {
      baseWeek = await createScheduleWeek(programId, scheduleWeekIndex);
      setWeek(baseWeek);
    }

    function resolveTimeRange() {
      if (data.allDay) return { start: 0, end: 1440 };

      const startMinutes = parseTimeString(data.start);

      if (data.noEnd || !data.end) {
        return { start: startMinutes, end: startMinutes + 60 };
      }

      const endMinutes = parseTimeString(data.end);
      return { start: startMinutes, end: endMinutes };
    }

    const { start, end } = resolveTimeRange();

    const weekCache = new Map<number, DbScheduleWeek>();

    async function ensureWeek(weekIndex: number): Promise<DbScheduleWeek> {
      if (weekIndex === scheduleWeekIndex && baseWeek) return baseWeek;

      if (weekCache.has(weekIndex)) return weekCache.get(weekIndex)!;

      const existing = await fetchScheduleWeek(programId, weekIndex);
      if (existing) {
        weekCache.set(weekIndex, existing);
        return existing;
      }

      const created = await createScheduleWeek(programId, weekIndex);
      weekCache.set(weekIndex, created);
      return created;
    }

    const weekIndices = data.repeatEnabled
      ? Array.from({ length: DEFAULT_REPEAT_WEEKS }, (_, x) => scheduleWeekIndex + x)
      : [scheduleWeekIndex];

    for (const weekIndex of weekIndices) {
      const targetWeek = await ensureWeek(weekIndex);

      for (const day of data.selectedDays) {
        await createScheduleSlot({
          program_id: programId,
          week_id: targetWeek.id,
          day,
          title: trimmedTitle,
          start_time: start,
          end_time: end,
          color: data.color,
        });
      }
    }

    setShowAdd(false);
    await loadData();
  }

  /* ---------------------------------------------------------------------- */
  /* RENDER                                                                 */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* BODY WRAPPER — fixed area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* LOADING */}
        {loading && (
          <div className="flex items-center justify-center h-full text-sm text-[var(--gray-600)]">
            Loading…
          </div>
        )}

        {/* ERROR */}
        {!loading && errorMsg && (
          <div className="p-4 text-sm text-[var(--danger-700)]">{errorMsg}</div>
        )}

        {/* SCROLL REGION */}
        {!loading && !errorMsg && (
          <div className="flex-1 overflow-y-auto min-h-0 pb-[9vh]">
            {/* LIST VIEW (mobile or toggled) */}
            {listView ? (
              <div className="flex flex-col">
                {DAY_LABELS.map((_, dayIdx) => {
                  const daySlots = compiled?.days?.[dayIdx]?.slots ?? [];

                  return (
                    <div
                      key={dayIdx}
                      className="border-t border-[var(--gray-300)] bg-white p-3 flex flex-col gap-2"
                    >
                      <h3 className="text-sm font-semibold">
                        {FULL_DAY_LABELS[dayIdx]}
                      </h3>

                      {daySlots.length === 0 ? (
                        <div className="text-[11px] text-[var(--gray-500)] italic">
                          No events
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {daySlots.map((slot) => {
                            const timeLabel = slot.endLabel
                              ? `${slot.startLabel} – ${slot.endLabel}`
                              : slot.startLabel;

                            const colorKey = normalizeColorKey(slot.color);
                            const colorClass =
                              SLOT_COLOR_MAP[colorKey] ?? SLOT_COLOR_MAP.gray;

                            return (
                              <div
                                key={slot.id}
                                className={`
                                  rounded-md px-2 py-1.5 text-xs
                                  flex justify-between items-center gap-2
                                  cursor-pointer transition
                                  ${colorClass} hover:opacity-90
                                  text-white
                                `}
                                onClick={() => {
                                  const base = slot;
                                  const dateLabel = FULL_DAY_LABELS[dayIdx];

                                  setSelectedSlot({
                                    id: slot.id,
                                    title: slot.title,
                                    dateLabel,
                                    timeLabel,
                                    color: colorClass,
                                    location: base.location ?? null,

                                    // Fields required for edit modal
                                    start: slot.startLabel,
                                    end: slot.endLabel,
                                    colorId: colorKey, // "blue"
                                    icon: slot.icon ?? "star",
                                    attachment: slot.attachment ?? null,
                                    selectedDays: [dayIdx],
                                    repeatEnabled: false,
                                    allDay: slot.allDay ?? false,
                                    noEnd: slot.noEnd ?? false,
                                  });

                                  setShowDetails(true);
                                }}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span
                                    className={`w-2 h-2 rounded-sm ${colorClass}`}
                                  />
                                  <span className="font-medium truncate">
                                    {slot.title}
                                  </span>
                                </div>

                                <span className="text-[10px] text-[var(--gray-500)]">
                                  {timeLabel}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* GRID VIEW (desktop default) */
              <div className="grid grid-cols-7 border border-[var(--gray-300)]">
                {/* HEADER */}
                {DAY_LABELS.map((label) => (
                  <div
                    key={label}
                    className="px-2 py-1 text-center font-medium text-xs bg-[var(--gray-50)] border-b border-[var(--gray-300)] sticky top-0 z-10"
                  >
                    {label}
                  </div>
                ))}

                {/* COLUMNS */}
                {DAY_LABELS.map((_, dayIdx) => {
                  const daySlots = compiled?.days?.[dayIdx]?.slots ?? [];

                  return (
                    <div
                      key={dayIdx}
                      className="min-h-[350px] p-2 border-r last:border-r-0 border-[var(--gray-300)] flex flex-col gap-2"
                    >
                      {daySlots.length === 0 ? (
                        <div className="text-[10px] text-[var(--gray-400)] italic">
                          No events
                        </div>
                      ) : (
                        daySlots.map((slot) => {
                          const timeLabel = slot.endLabel
                            ? `${slot.startLabel} – ${slot.endLabel}`
                            : slot.startLabel;

                          const colorKey = normalizeColorKey(slot.color);
                          const colorClass =
                            SLOT_COLOR_MAP[colorKey] ?? SLOT_COLOR_MAP.gray;
                          const subslotBgClass =
                            SUBSLOT_COLOR_MAP[colorKey] ??
                            SUBSLOT_COLOR_MAP.gray;

                          return (
                            <div
                              key={slot.id}
                              className={`
                                rounded-md p-2 text-xs flex flex-col gap-1
                                cursor-pointer transition
                                ${colorClass} hover:opacity-90
                                text-white
                              `}
                              onClick={() => {
                                const base = slot;
                                const dateLabel = FULL_DAY_LABELS[dayIdx];

                                setSelectedSlot({
                                  id: slot.id,
                                  title: slot.title,
                                  dateLabel,
                                  timeLabel,
                                  color: colorClass,
                                  location: base.location ?? null,

                                  // Fields required for edit modal
                                  start: slot.startLabel,
                                  end: slot.endLabel,
                                  colorId: colorKey,
                                  icon: slot.icon ?? "star",
                                  attachment: slot.attachment ?? null,
                                  selectedDays: [dayIdx],
                                  repeatEnabled: false,
                                  allDay: slot.allDay ?? false,
                                  noEnd: slot.noEnd ?? false,
                                });

                                setShowDetails(true);
                              }}
                            >
                              <div className="flex justify-between items-center gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span
                                    className={`w-2 h-2 rounded-sm ${colorClass}`}
                                  />
                                  <span className="font-medium truncate">
                                    {slot.title}
                                  </span>
                                </div>
                                <span className="text-[10px] text-[var(--gray-500)]">
                                  {slot.startLabel}
                                </span>
                              </div>

                              {slot.subslots.length > 0 && (
                                <div
                                  className={`
                                    mt-1 rounded-sm px-2 py-1 text-[var(--gray-900)]
                                    ${subslotBgClass}
                                  `}
                                >
                                  <ul className="list-disc pl-4 space-y-0.5">
                                    {slot.subslots.map((sub) => (
                                      <li
                                        key={sub.id}
                                        className="text-[10px] text-[var(--gray-800)]"
                                      >
                                        {sub.title}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ADD SLOT MODAL */}
      {showAdd && (
        <ScheduleAddSlot
          onClose={() => setShowAdd(false)}
          onSubmit={handleAddSlot}
        />
      )}

      {/* DETAILS MODAL */}
      {showDetails && selectedSlot && (
        <ScheduleSlotDetails
          isOpen={showDetails}
          onClose={() => setShowDetails(false)}
          slot={selectedSlot}
          onEdit={() => {
            setShowDetails(false);
            setShowEdit(true);
          }}
          onDelete={async () => {
            if (!selectedSlot?.id) return;

            await deleteScheduleSlot(selectedSlot.id);

            setShowEdit(false);
            setShowDetails(false);
            setSelectedSlot(null);

            await loadData();
          }}
        />
      )}

      {/* EDIT MODAL */}
      {showEdit && selectedSlot && (
        <ScheduleEditSlot
          initialTitle={selectedSlot.title}
          initialStart={selectedSlot.start}
          initialEnd={selectedSlot.end}
          initialColor={selectedSlot.colorId}
          initialIcon={selectedSlot.icon}
          initialLocation={selectedSlot.location}
          initialAttachment={selectedSlot.attachment}
          selectedDays={selectedSlot.selectedDays}
          repeatEnabled={selectedSlot.repeatEnabled}
          initialAllDay={selectedSlot.allDay}
          initialNoEnd={selectedSlot.noEnd}
          onClose={() => setShowEdit(false)}
          onSave={async (updated) => {
            await updateScheduleSlot(selectedSlot.id, {
              title: updated.title,
              start_time: updated.allDay ? 0 : parseTimeString(updated.start),
              end_time:
                updated.noEnd || updated.allDay
                  ? null
                  : parseTimeString(updated.end),
              color: updated.color,
              icon: updated.icon,
              location: updated.location,
              attachment: updated.attachment,
            });

            setShowEdit(false);
            await loadData();
          }}

          onDelete={async () => {
            if (!selectedSlot?.id) return;

            await deleteScheduleSlot(selectedSlot.id);

            setShowEdit(false);
            setShowDetails(false);
            setSelectedSlot(null);

            await loadData();
          }}
        />
      )}
    </div>
  );
}
