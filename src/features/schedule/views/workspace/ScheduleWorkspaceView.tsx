// src/features/schedule/views/workspace/CalendarWorkspaceView.tsx
"use client"

import * as React from "react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { cn } from "@/utils/utils"
import { Divider } from "@/components/ui"

import {
  // services (aliased to "Calendar")
  fetchScheduleWeek as fetchCalendarWeek,
  createScheduleWeek as createCalendarWeek,
  createScheduleSlot as createCalendarEvent,
  updateScheduleSlot as updateCalendarEvent,
  deleteScheduleSlot as deleteCalendarEvent,
  loadScheduleWeekReadOnly as loadCalendarWeekReadOnly,

  // modals (aliased to "Calendar")
  ScheduleAddSlot as CalendarAddEvent,
  ScheduleSlotDetails as CalendarEventDetails,
  ScheduleEditSlot as CalendarEditEvent,

  // types (aliased to "Calendar")
  type DbScheduleWeek as DbCalendarWeek,
  type DbScheduleSlot as DbCalendarEvent,
  type DbScheduleSubslot as DbCalendarSubEvent,
  type UiCompiledWeek as UiCompiledCalendarWeek,
} from "@/features/schedule"

import {
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Plus,
  RefreshCcw,
} from "lucide-react"

/* -------------------------------------------------------------------------- */
/* PROPS                                                                      */
/* -------------------------------------------------------------------------- */

interface CalendarWorkspaceViewProps {
  programId: number

  // kept for compatibility with existing callers
  scheduleWeekIndex: number
  setScheduleWeekIndex: React.Dispatch<React.SetStateAction<number>>

  // kept for compatibility with existing callers
  triggerAddSlot: boolean
  setTriggerAddSlot: (v: boolean) => void
}

/* -------------------------------------------------------------------------- */
/* CONSTANTS                                                                  */
/* -------------------------------------------------------------------------- */

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const FULL_DAY_LABELS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]

/* -------------------------------------------------------------------------- */
/* COLOR MAPS (Athlytics flavors)                                             */
/* -------------------------------------------------------------------------- */

const EVENT_ACCENT_MAP: Record<string, string> = {
  gray: "bg-[var(--gray-16)]",

  blue: "bg-[var(--fvr-blue-md)]",
  slate: "bg-[var(--fvr-slate-md)]",
  purple: "bg-[var(--fvr-purple-md)]",
  yellow: "bg-[var(--fvr-yellow-md)]",
  red: "bg-[var(--fvr-red-md)]",
  coral: "bg-[var(--fvr-coral-md)]",
  teal: "bg-[var(--fvr-teal-md)]",
  green: "bg-[var(--fvr-green-md)]",
  indigo: "bg-[var(--fvr-indigo-md)]",
}

const EVENT_BG_MAP: Record<string, string> = {
  gray: "bg-white/4",

  blue: "bg-[var(--fvr-blue-bg)]",
  slate: "bg-[var(--fvr-slate-bg)]",
  purple: "bg-[var(--fvr-purple-bg)]",
  yellow: "bg-[var(--fvr-yellow-bg)]",
  red: "bg-[var(--fvr-red-bg)]",
  coral: "bg-[var(--fvr-coral-bg)]",
  teal: "bg-[var(--fvr-teal-bg)]",
  green: "bg-[var(--fvr-green-bg)]",
  indigo: "bg-[var(--fvr-indigo-bg)]",
}

type ColorKey = keyof typeof EVENT_ACCENT_MAP

function normalizeColorKey(raw?: string | null): ColorKey {
  if (!raw) return "gray"
  const cleaned = raw.replace("slot-", "")
  if (cleaned in EVENT_ACCENT_MAP) return cleaned as ColorKey
  return "gray"
}

/* -------------------------------------------------------------------------- */
/* ADD EVENT PAYLOAD (FROM MODAL)                                             */
/* -------------------------------------------------------------------------- */

interface AddEventFormPayload {
  title: string
  color: string | null
  icon: string

  selectedDays: number[]
  repeatEnabled: boolean

  start: string
  end: string | null

  allDay: boolean
  noEnd: boolean
}

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

function parseTimeString(v: string): number {
  const [hm, period] = v.split(" ")
  const [h, m] = hm.split(":").map(Number)

  let hour = h
  if (period === "PM" && hour !== 12) hour += 12
  if (period === "AM" && hour === 12) hour = 0

  return hour * 60 + m
}

type ViewMode = "grid" | "list"

type SelectedCalendarEvent = {
  id: string
  title: string
  dateLabel: string
  timeLabel: string

  colorKey: ColorKey
  accentClass: string
  bgClass: string

  start: string
  end: string | null
  icon: string
  location: string | null
  attachment: any | null

  selectedDays: number[]
  repeatEnabled: boolean
  allDay: boolean
  noEnd: boolean
}

/* -------------------------------------------------------------------------- */
/* COMPONENT                                                                  */
/* -------------------------------------------------------------------------- */

export default function CalendarWorkspaceView({
  programId,

  // compatibility props (aliased internally)
  scheduleWeekIndex,
  setScheduleWeekIndex,
  triggerAddSlot,
  setTriggerAddSlot,
}: CalendarWorkspaceViewProps) {
  const calendarWeekIndex = scheduleWeekIndex
  const setCalendarWeekIndex = setScheduleWeekIndex
  const triggerAddEvent = triggerAddSlot
  const setTriggerAddEvent = setTriggerAddSlot

  const [week, setWeek] = useState<DbCalendarWeek | null>(null)
  const [events, setEvents] = useState<DbCalendarEvent[]>([])
  const [subevents, setSubevents] = useState<DbCalendarSubEvent[]>([])
  const [compiled, setCompiled] = useState<UiCompiledCalendarWeek | null>(null)

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [showAdd, setShowAdd] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [showEdit, setShowEdit] = useState(false)

  const [selectedEvent, setSelectedEvent] = useState<SelectedCalendarEvent | null>(null)

  const [isMobile, setIsMobile] = useState(false)
  const [viewOverride, setViewOverride] = useState<ViewMode | null>(null)

  const viewMode: ViewMode = useMemo(() => {
    if (viewOverride) return viewOverride
    return isMobile ? "list" : "grid"
  }, [viewOverride, isMobile])

  const DEFAULT_REPEAT_WEEKS = 12

  /* ---------------------------------------------------------------------- */
  /* MOBILE DETECTION                                                        */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (typeof window === "undefined") return

    const mql = window.matchMedia("(max-width: 767px)")
    const apply = (e: MediaQueryList | MediaQueryListEvent) => setIsMobile(e.matches)

    apply(mql)
    mql.addEventListener("change", apply as any)
    return () => mql.removeEventListener("change", apply as any)
  }, [])

  /* ---------------------------------------------------------------------- */
  /* LOADER                                                                  */
  /* ---------------------------------------------------------------------- */

  const loadData = useCallback(async () => {
    if (!programId) return

    setLoading(true)
    setErrorMsg(null)

    try {
      const result = await loadCalendarWeekReadOnly({
        programId,
        scheduleWeekIndex: calendarWeekIndex,
      })

      setWeek(result.week)
      setEvents(result.slots)
      setSubevents(result.subslots)
      setCompiled(result.compiled)
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Failed to load calendar.")
    } finally {
      setLoading(false)
    }
  }, [programId, calendarWeekIndex])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    if (!triggerAddEvent) return
    setShowAdd(true)
    setTriggerAddEvent(false)
  }, [triggerAddEvent, setTriggerAddEvent])

  /* ---------------------------------------------------------------------- */
  /* ADD EVENT                                                               */
  /* ---------------------------------------------------------------------- */

  const handleAddEvent = useCallback(
    async (data: AddEventFormPayload) => {
      const trimmedTitle = data.title.trim()
      if (!trimmedTitle || data.selectedDays.length === 0) {
        setShowAdd(false)
        return
      }

      let baseWeek = week

      if (!baseWeek) {
        baseWeek = await createCalendarWeek(programId, calendarWeekIndex)
        setWeek(baseWeek)
      }

      const resolveTimeRange = () => {
        if (data.allDay) return { start: 0, end: 1440 }

        const startMinutes = parseTimeString(data.start)
        if (data.noEnd || !data.end) return { start: startMinutes, end: startMinutes + 60 }

        const endMinutes = parseTimeString(data.end)
        return { start: startMinutes, end: endMinutes }
      }

      const { start, end } = resolveTimeRange()

      const weekCache = new Map<number, DbCalendarWeek>()

      const ensureWeek = async (weekIndex: number): Promise<DbCalendarWeek> => {
        if (weekIndex === calendarWeekIndex && baseWeek) return baseWeek
        if (weekCache.has(weekIndex)) return weekCache.get(weekIndex)!

        const existing = await fetchCalendarWeek(programId, weekIndex)
        if (existing) {
          weekCache.set(weekIndex, existing)
          return existing
        }

        const created = await createCalendarWeek(programId, weekIndex)
        weekCache.set(weekIndex, created)
        return created
      }

      const weekIndices = data.repeatEnabled
        ? Array.from({ length: DEFAULT_REPEAT_WEEKS }, (_, x) => calendarWeekIndex + x)
        : [calendarWeekIndex]

      for (const weekIndex of weekIndices) {
        const targetWeek = await ensureWeek(weekIndex)

        for (const day of data.selectedDays) {
          await createCalendarEvent({
            program_id: programId,
            week_id: targetWeek.id,
            day,
            title: trimmedTitle,
            start_time: start,
            end_time: end,
            color: data.color,
          })
        }
      }

      setShowAdd(false)
      await loadData()
    },
    [week, programId, calendarWeekIndex, loadData]
  )

  /* ---------------------------------------------------------------------- */
  /* SELECT EVENT                                                            */
  /* ---------------------------------------------------------------------- */

  const openDetailsFor = useCallback((dayIdx: number, slot: any) => {
    const dateLabel = FULL_DAY_LABELS[dayIdx]

    const allDay = Boolean(slot.allDay)
    const noEnd = Boolean(slot.noEnd)

    const timeLabel = allDay
      ? "All day"
      : slot.endLabel
        ? `${slot.startLabel} – ${slot.endLabel}`
        : slot.startLabel

    const colorKey = normalizeColorKey(slot.color)
    const accentClass = EVENT_ACCENT_MAP[colorKey] ?? EVENT_ACCENT_MAP.gray
    const bgClass = EVENT_BG_MAP[colorKey] ?? EVENT_BG_MAP.gray

    setSelectedEvent({
      id: slot.id,
      title: slot.title,
      dateLabel,
      timeLabel,

      colorKey,
      accentClass,
      bgClass,

      start: slot.startLabel,
      end: slot.endLabel ?? null,
      icon: slot.icon ?? "star",
      location: slot.location ?? null,
      attachment: slot.attachment ?? null,

      selectedDays: [dayIdx],
      repeatEnabled: false,
      allDay,
      noEnd,
    })

    setShowDetails(true)
  }, [])

  /* ---------------------------------------------------------------------- */
  /* UI                                                                      */
  /* ---------------------------------------------------------------------- */

  const HeaderPill = ({
    active,
    icon,
    label,
    onClick,
  }: {
    active: boolean
    icon: React.ReactNode
    label: string
    onClick: () => void
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-8 px-3 rounded-full border border-white/10",
        "inline-flex items-center gap-2 text-xs transition",
        active
          ? "bg-white/6 text-[var(--text-lt)]"
          : "bg-white/0 hover:bg-white/5 text-white/60 hover:text-[var(--text-lt)]"
      )}
    >
      {icon}
      <span className="font-semibold">{label}</span>
    </button>
  )

  return (
    <div className="flex flex-col h-full w-full min-h-0">
      {/* TOP BAR */}
      <div className="shrink-0 px-4 pt-4 pb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-[var(--text-lt)]">Calendar</div>
            <div className="mt-0.5 text-xs text-white/45 truncate">
              Week {calendarWeekIndex + 1}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              className={cn(
                "h-8 w-8 rounded-full border border-white/10",
                "bg-white/0 hover:bg-white/5 transition",
                "inline-flex items-center justify-center",
                calendarWeekIndex <= 0 ? "opacity-40 pointer-events-none" : "text-white/70 hover:text-white/90"
              )}
              onClick={() => setCalendarWeekIndex((v) => Math.max(0, v - 1))}
              title="Previous week"
              aria-label="Previous week"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button
              type="button"
              className={cn(
                "h-8 w-8 rounded-full border border-white/10",
                "bg-white/0 hover:bg-white/5 transition",
                "inline-flex items-center justify-center",
                "text-white/70 hover:text-white/90"
              )}
              onClick={() => setCalendarWeekIndex((v) => v + 1)}
              title="Next week"
              aria-label="Next week"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            <div className="mx-1 h-6 w-px bg-white/10" />

            <HeaderPill
              active={viewMode === "grid"}
              icon={<LayoutGrid className="h-4 w-4" />}
              label="Grid"
              onClick={() => setViewOverride("grid")}
            />
            <HeaderPill
              active={viewMode === "list"}
              icon={<List className="h-4 w-4" />}
              label="List"
              onClick={() => setViewOverride("list")}
            />

            <div className="mx-1 h-6 w-px bg-white/10" />

            <button
              type="button"
              className={cn(
                "h-8 w-8 rounded-full border border-white/10",
                "bg-white/0 hover:bg-white/5 transition",
                "inline-flex items-center justify-center",
                "text-white/70 hover:text-white/90"
              )}
              onClick={() => loadData()}
              title="Refresh"
              aria-label="Refresh"
            >
              <RefreshCcw className="h-4 w-4" />
            </button>

            <button
              type="button"
              className={cn(
                "h-8 w-8 rounded-full border border-white/10",
                "bg-white/6 hover:bg-white/10 transition",
                "inline-flex items-center justify-center",
                "text-[var(--text-lt)]"
              )}
              onClick={() => setShowAdd(true)}
              title="Add event"
              aria-label="Add event"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <Divider color="var(--gray-18)" inset={0} className="mt-3" />
      </div>

      {/* BODY */}
      <div className="relative flex-1 min-h-0 overflow-hidden">
        {/* LOADING */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-white/50">
            Loading…
          </div>
        )}

        {/* ERROR */}
        {!loading && errorMsg && (
          <div className="p-4 text-sm text-[var(--danger-700)]">{errorMsg}</div>
        )}

        {/* CONTENT */}
        {!loading && !errorMsg && (
          <div className="absolute inset-0 overflow-y-auto pb-16 md:pb-0">
            {viewMode === "list" ? (
              <div className="flex flex-col">
                {DAY_LABELS.map((_, dayIdx) => {
                  const daySlots = compiled?.days?.[dayIdx]?.slots ?? []

                  return (
                    <div key={dayIdx} className="px-4 py-3">
                      {dayIdx !== 0 ? <Divider color="var(--gray-18)" inset={0} className="mb-3" /> : null}

                      <div className="text-sm font-semibold text-[var(--text-lt)]">
                        {FULL_DAY_LABELS[dayIdx]}
                      </div>

                      {daySlots.length === 0 ? (
                        <div className="mt-2 text-xs text-white/40 italic">No events</div>
                      ) : (
                        <div className="mt-2 flex flex-col gap-2">
                          {daySlots.map((slot: any) => {
                            const colorKey = normalizeColorKey(slot.color)
                            const accentClass = EVENT_ACCENT_MAP[colorKey] ?? EVENT_ACCENT_MAP.gray
                            const bgClass = EVENT_BG_MAP[colorKey] ?? EVENT_BG_MAP.gray

                            const timeLabel = slot.allDay
                              ? "All day"
                              : slot.endLabel
                                ? `${slot.startLabel} – ${slot.endLabel}`
                                : slot.startLabel

                            return (
                              <button
                                key={slot.id}
                                type="button"
                                onClick={() => openDetailsFor(dayIdx, slot)}
                                className={cn(
                                  "w-full text-left",
                                  "rounded-2xl border border-[var(--gray-18)]",
                                  "px-4 py-3",
                                  "transition-colors hover:bg-white/5",
                                  bgClass
                                )}
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <span className={cn("h-2.5 w-2.5 rounded-sm shrink-0", accentClass)} />
                                    <div className="min-w-0">
                                      <div className="font-semibold text-[var(--text-lt)] truncate">
                                        {slot.title}
                                      </div>
                                      <div className="mt-0.5 text-xs text-white/45 truncate">
                                        {timeLabel}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="text-xs text-white/40 shrink-0">
                                    {slot.location ? slot.location : ""}
                                  </div>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="px-4 pb-4">
                <div className="grid grid-cols-7 rounded-2xl overflow-hidden border border-[var(--gray-18)]">
                  {/* HEADER */}
                  {DAY_LABELS.map((label) => (
                    <div
                      key={label}
                      className={cn(
                        "px-2 py-2 text-center text-xs font-semibold",
                        "bg-[#141414]",
                        "border-b border-[var(--gray-18)]",
                        "text-white/70",
                        "sticky top-0 z-10"
                      )}
                    >
                      {label}
                    </div>
                  ))}

                  {/* COLUMNS */}
                  {DAY_LABELS.map((_, dayIdx) => {
                    const daySlots = compiled?.days?.[dayIdx]?.slots ?? []

                    return (
                      <div
                        key={dayIdx}
                        className={cn(
                          "min-h-[520px] p-2",
                          "border-r last:border-r-0 border-[var(--gray-18)]",
                          "bg-[#181818]",
                          "flex flex-col gap-2"
                        )}
                      >
                        {daySlots.length === 0 ? (
                          <div className="px-2 py-1 text-[11px] text-white/35 italic">No events</div>
                        ) : (
                          daySlots.map((slot: any) => {
                            const colorKey = normalizeColorKey(slot.color)
                            const accentClass = EVENT_ACCENT_MAP[colorKey] ?? EVENT_ACCENT_MAP.gray
                            const bgClass = EVENT_BG_MAP[colorKey] ?? EVENT_BG_MAP.gray

                            const timeLabel = slot.allDay
                              ? "All day"
                              : slot.endLabel
                                ? `${slot.startLabel} – ${slot.endLabel}`
                                : slot.startLabel

                            return (
                              <button
                                key={slot.id}
                                type="button"
                                onClick={() => openDetailsFor(dayIdx, slot)}
                                className={cn(
                                  "w-full text-left",
                                  "rounded-2xl border border-[var(--gray-18)]",
                                  "px-4 py-3",
                                  "transition-colors hover:bg-white/5",
                                  bgClass
                                )}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-start gap-3 min-w-0">
                                    <span className={cn("mt-1 h-2.5 w-2.5 rounded-sm shrink-0", accentClass)} />
                                    <div className="min-w-0">
                                      <div className="font-semibold text-[var(--text-lt)] truncate">
                                        {slot.title}
                                      </div>
                                      <div className="mt-0.5 text-xs text-white/45 truncate">
                                        {timeLabel}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="text-[11px] text-white/35 shrink-0">
                                    {slot.location ? slot.location : ""}
                                  </div>
                                </div>

                                {Array.isArray(slot.subslots) && slot.subslots.length > 0 ? (
                                  <div className="mt-2 rounded-xl border border-white/10 bg-white/6 px-3 py-2">
                                    <ul className="list-disc pl-4 space-y-1">
                                      {slot.subslots.map((sub: any) => (
                                        <li key={sub.id} className="text-[11px] text-white/75">
                                          {sub.title}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                ) : null}
                              </button>
                            )
                          })
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ADD EVENT MODAL */}
      {showAdd && (
        <CalendarAddEvent
          onClose={() => setShowAdd(false)}
          onSubmit={handleAddEvent}
        />
      )}

      {/* DETAILS MODAL */}
      {showDetails && selectedEvent && (
        <CalendarEventDetails
          isOpen={showDetails}
          onClose={() => setShowDetails(false)}
          slot={{
            title: selectedEvent.title,
            dateLabel: selectedEvent.dateLabel,
            timeLabel: selectedEvent.timeLabel,
            color: selectedEvent.accentClass, // <-- use the accent class like the old code did
            location: selectedEvent.location ?? undefined,
          }}
          onEdit={() => {
            setShowDetails(false)
            setShowEdit(true)
          }}
          onDelete={async () => {
            if (!selectedEvent?.id) return

            await deleteCalendarEvent(selectedEvent.id)

            setShowEdit(false)
            setShowDetails(false)
            setSelectedEvent(null)

            await loadData()
          }}
        />
      )}

      {/* EDIT MODAL */}
      {showEdit && selectedEvent && (
        <CalendarEditEvent
          initialTitle={selectedEvent.title}
          initialStart={selectedEvent.start}
          initialEnd={selectedEvent.end}
          initialColor={selectedEvent.colorKey}
          initialIcon={selectedEvent.icon}
          initialLocation={selectedEvent.location}
          initialAttachment={selectedEvent.attachment}
          selectedDays={selectedEvent.selectedDays}
          repeatEnabled={selectedEvent.repeatEnabled}
          initialAllDay={selectedEvent.allDay}
          initialNoEnd={selectedEvent.noEnd}
          onClose={() => setShowEdit(false)}
          onSave={async (updated: any) => {
            await updateCalendarEvent(selectedEvent.id, {
              title: updated.title,
              start_time: updated.allDay ? 0 : parseTimeString(updated.start),
              end_time: updated.allDay
                ? 1440
                : updated.noEnd
                  ? null
                  : parseTimeString(updated.end),
              color: updated.color,
              icon: updated.icon,
              location: updated.location,
              attachment: updated.attachment,
            })

            setShowEdit(false)
            await loadData()
          }}
          onDelete={async () => {
            if (!selectedEvent?.id) return
            await deleteCalendarEvent(selectedEvent.id)

            setShowEdit(false)
            setShowDetails(false)
            setSelectedEvent(null)

            await loadData()
          }}
        />
      )}
    </div>
  )
}
