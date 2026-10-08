// src/components/workspace/workspacetoolbar.tsx
"use client"

import React, { useEffect, useMemo, useState } from "react"
import {
  Edit3,
  CalendarFold,
  UsersRound,
  FolderCog,
  // CalendarDays,
  // Maximize,
  // Minimize,
  // Settings,
  // CalendarCog,
  // Dumbbell,
  // Box,
  // Folders,
  // FolderCog2,
} from "lucide-react"

import { cn } from "@/utils/utils"
import { Button } from "@/components/ui/actions/button"

// VIEW IMPORTS
import { AttendanceTools } from "@/features/attendance"
import { ScheduleTools } from "@/features/schedule"
import { ManagerTools, EditorTools, type WorkspaceMode } from "@/features/workspace"

import BatonTrigger from "@/components/baton/BatonTrigger"
import TabToggler from "@/components/ui/navigation/tabtoggler"

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

export interface ToolbarProps {
  mode: WorkspaceMode
  setMode: React.Dispatch<React.SetStateAction<WorkspaceMode>>
  path: string[]

  onManagerSearch?: (query: string) => void
  onEditorSearch?: (query: string) => void

  // ATTENDANCE
  attendanceDate: string
  setAttendanceDate: (v: string) => void
  attendanceHasSession: boolean
  attendanceIsDirty: boolean
  attendanceExceptionCount: number
  onSubmitAttendance: () => void
  onResetAttendance?: () => void
  attendanceSaveFailed: boolean

  // SCHEDULE
  scheduleWeekIndex?: number
  setScheduleWeekIndex?: React.Dispatch<React.SetStateAction<number>>
  onScheduleAdd?: () => void
}

/* -------------------------------------------------------------------------- */
/* MODE TAB                                                                   */
/* -------------------------------------------------------------------------- */

const ACCENT_BLUE = "#394650" // AppNavPanel active-pill blue

interface ModeTabProps {
  label: string
  icon: React.ReactNode
  active?: boolean
  onClick?: () => void
}

export function ModeTab({ label, icon, active, onClick }: ModeTabProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1 h-7 px-2.5 rounded-full transition-colors",
        "ring-1 ring-white/10",
        active
          ? "bg-[#394650] text-white/85"
          : "bg-[var(--gray-19)] text-white/60 hover:bg-[var(--gray-18)] hover:text-white/80"
      )}
    >
      {/* ICON */}
      <span className="flex items-center justify-center">
        <span className="block md:hidden scale-125">{icon}</span>
        <span className="hidden md:block scale-100">{icon}</span>
      </span>

      {/* LABEL */}
      <span
        className={cn(
          "text-xs font-medium tracking-wide",
          active ? "inline md:inline" : "hidden md:inline"
        )}
      >
        {label}
      </span>
    </button>
  )
}

/* -------------------------------------------------------------------------- */
/* TOOLBAR                                                                    */
/* -------------------------------------------------------------------------- */

export default function WorkspaceToolbar({
  mode,
  setMode,
  path,
  onManagerSearch,
  onEditorSearch,

  attendanceDate,
  setAttendanceDate,
  attendanceHasSession,
  attendanceIsDirty,
  attendanceExceptionCount,
  onSubmitAttendance,
  onResetAttendance,
  attendanceSaveFailed,

  scheduleWeekIndex,
  setScheduleWeekIndex,
  onScheduleAdd,
}: ToolbarProps) {
  const [query, setQuery] = useState("")
  const [headerCollapsed, setHeaderCollapsed] = useState(false)

  useEffect(() => {
    const sync = () => setHeaderCollapsed((prev) => !prev)
    window.addEventListener("toggle-header", sync)
    return () => window.removeEventListener("toggle-header", sync)
  }, [])

  const handleSearch = (value: string) => {
    setQuery(value)
    if (mode === "manager") onManagerSearch?.(value)
    if (mode === "editor") onEditorSearch?.(value)
  }

  const modeTabs = useMemo<
    ReadonlyArray<{
      value: WorkspaceMode
      label: string
      icon: React.ReactNode
    }>
  >(
    () => [
      { value: "manager", label: "Manager", icon: <FolderCog className="h-4 w-4" /> },
      { value: "editor", label: "Editor", icon: <Edit3 className="h-4 w-4" /> },
      { value: "attendance", label: "Attendance", icon: <UsersRound className="h-4 w-4" /> },
      { value: "schedule", label: "Schedule", icon: <CalendarFold className="h-4 w-4" /> },
    ],
    []
  )

  return (
    <div className="w-full h-[64px] select-none">
      {/* <div className="flex flex-col md:flex-row gap-1 w-full min-w-0"> */}

      <div
        className={cn(
          "flex items-start md:items-center justify-between gap-6",
          "px-4 py-2 w-full h-full",
          // "border-b border-[var(--gray-18)]",
        )}
      >
        {/* LEFT SECTION */}
        <div className="min-w-0 flex items-center">
          <div
            className={cn(
              "inline-flex items-center gap-3",
              "rounded-full",
            )}
          >
            {modeTabs.map((t) => (
              <ModeTab
                key={t.value}
                label={t.label}
                icon={t.icon}
                active={mode === t.value}
                onClick={() => setMode(t.value)}
              />
            ))}


            {/* kept import / old control for reference */}
            {/* <TabToggler<WorkspaceMode> value={mode} onChange={setMode} items={modeTabs} /> */}
          </div>
        </div>

        {/* RIGHT SECTION ---------------------------------------------------- */}
        <div className="h-auto md:h-8 flex items-center">
          <div
            className={cn(
              "inline-flex items-center",
              "rounded-full",
              "border border-[var(--gray-18)]",
              "bg-white/0",
              "p-1"
            )}
          >
            {mode === "manager" && <ManagerTools />}

            {mode === "editor" && (
              <EditorTools
                onFind={() => {
                  alert("Use Ctrl + F. Its better lol")
                }}
                onSearch={handleSearch}
              />
            )}

            {mode === "attendance" && (
              <AttendanceTools
                attendanceDate={attendanceDate}
                setAttendanceDate={setAttendanceDate}
                attendanceHasSession={attendanceHasSession}
                attendanceIsDirty={attendanceIsDirty}
                attendanceExceptionCount={attendanceExceptionCount}
                onSubmitAttendance={onSubmitAttendance}
                onResetAttendance={onResetAttendance}
              />
            )}

            {mode === "schedule" && (
              <ScheduleTools
                onAddEvent={onScheduleAdd}
                onOpenFilter={() => {
                  console.log("open schedule filters")
                }}
                onOpenTemplateMenu={() => {
                  console.log("open schedule templates")
                }}
                onPrint={() => {
                  console.log("print schedule")
                }}
                onExport={() => {
                  console.log("export schedule")
                }}
              />
            )}
          </div>
        </div>

        {/* </div> */}
      </div>

      {/* <BatonTrigger /> */}

      {/* MAX / MIN BUTTON ---------------------------------------------- */}
      {/* <Button
        variant="stick"
        title={headerCollapsed ? "Minimize" : "Maximize"}
        onClick={() => {
          window.dispatchEvent(new CustomEvent("toggle-header"))
          setHeaderCollapsed((prev) => !prev)
        }}
      >
        {headerCollapsed ? (
          <Minimize className="h-4 w-4 text-[var(--dom-dk)]" />
        ) : (
          <Maximize className="h-4 w-4 text-[var(--text)]" />
        )}
      </Button> */}
    </div>
  )
}
