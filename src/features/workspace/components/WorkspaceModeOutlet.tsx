// src/features/workspace/components/WorkspaceModeOutlet.tsx
"use client"

import type { WorkspaceMode } from "@/features/workspace/types/workspace.types"

import ManagerView from "@/features/workspace/modes/manager/ManagerView"
import EditorView from "@/features/workspace/modes/editor/EditorView"
import AnalyzerView from "@/features/workspace/modes/analyzer/AnalyzerView"

import { AttendanceWorkspaceView } from "@/features/attendance"
import { ScheduleWorkspaceView } from "@/features/schedule"

interface Props {
  mode: WorkspaceMode
  setMode: (next: WorkspaceMode) => void
  path: string[]
  programId: number | null
  demoMode: boolean

  // editor
  fileId: string
  setFileId: (id: string) => void
  searchQuery: string
  setSearchQuery: (q: string) => void

  // schedule
  scheduleWeekIndex: number
  setScheduleWeekIndex: (n: number) => void
  showAddSlot: boolean
  setShowAddSlot: (v: boolean) => void

  // attendance
  attendanceDate: string
  setAttendanceDate: (v: string) => void
  attendanceHasSession: boolean
  setAttendanceHasSession: (v: boolean) => void
  attendanceIsDirty: boolean
  setAttendanceIsDirty: (v: boolean) => void
  attendanceExceptionCount: number
  setAttendanceExceptionCount: (n: number) => void
  attendanceSaveFailed: boolean
  setAttendanceSaveFailed: (v: boolean) => void
  onSubmitAttendance: () => void
  onResetAttendance: () => void
}

export default function WorkspaceModeOutlet(props: Props) {
  const {
    mode,
    programId,
    demoMode,

    fileId,
    setFileId,
    searchQuery,
    setSearchQuery,

    scheduleWeekIndex,
    setScheduleWeekIndex,
    showAddSlot,
    setShowAddSlot,

    attendanceDate,
    attendanceHasSession,
    setAttendanceHasSession,
    attendanceIsDirty,
    setAttendanceIsDirty,
    attendanceExceptionCount,
    setAttendanceExceptionCount,
    attendanceSaveFailed,
    setAttendanceSaveFailed,
    onSubmitAttendance,
    onResetAttendance,
  } = props

  if (!programId) return null

  return (
    <div className="flex-1 min-h-0 overflow-hidden">
      {mode === "manager" ? (
        <ManagerView programId={programId} />
      ) : mode === "editor" ? (
        <EditorView
          programId={programId}
          fileId={fileId}
          setFileId={setFileId}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      ) : mode === "analyzer" ? (
        <AnalyzerView programId={programId} demoMode={demoMode} />
      ) : mode === "attendance" ? (
        <AttendanceWorkspaceView
          attendanceDate={attendanceDate}
          attendanceHasSession={attendanceHasSession}
          setAttendanceHasSession={setAttendanceHasSession}
          attendanceIsDirty={attendanceIsDirty}
          setAttendanceIsDirty={setAttendanceIsDirty}
          attendanceExceptionCount={attendanceExceptionCount}
          setAttendanceExceptionCount={setAttendanceExceptionCount}
          attendanceSaveFailed={attendanceSaveFailed}
          setAttendanceSaveFailed={setAttendanceSaveFailed}
          onSubmitAttendance={onSubmitAttendance}
        />
      ) : mode === "schedule" ? (
        <ScheduleWorkspaceView
          programId={programId}
          scheduleWeekIndex={scheduleWeekIndex}
          setScheduleWeekIndex={setScheduleWeekIndex}
          triggerAddSlot={showAddSlot}
          setTriggerAddSlot={setShowAddSlot}
        />
      ) : null}
    </div>
  )
}