// src/features/workspace/components/WorkspaceModeOutlet.tsx
"use client"

import ProjectManager from "@/features/workspace/views/manager/ProjectManager"
import ProjectEditor from "@/features/workspace/views/editor/ProjectEditor"
import { AttendanceWorkspaceView } from "@/features/attendance"
import { ScheduleWorkspaceView } from "@/features/schedule"

import type { WorkspaceMode } from "@/features/workspace/types/workspace.types"

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
  } = props

  if (!programId) return null

  switch (mode) {
    case "manager":
      return (
        <div className="flex-1 min-h-0 overflow-hidden">
          <ProjectManager programId={programId} />
        </div>
      )

    case "editor":
      return (
        <ProjectEditor
          programId={programId}
          fileId={fileId}
          setFileId={setFileId}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      )

    case "attendance":
      return (
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
      )

    case "schedule":
      return (
        <ScheduleWorkspaceView
          programId={programId}
          scheduleWeekIndex={scheduleWeekIndex}
          setScheduleWeekIndex={setScheduleWeekIndex}
          triggerAddSlot={showAddSlot}
          setTriggerAddSlot={setShowAddSlot}
        />
      )

    default:
      return null
  }
}
