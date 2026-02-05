// src/pages/WorkspacePage.tsx
"use client"

import { useEffect, useMemo } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { useProgramContext, type ProgramId } from "@/features/program-cloak/useProgramContext"
import { useDemo } from "@/contexts/DemoContext"

import {
  WorkspaceModeOutlet,
  type WorkspaceMode,
  useWorkspaceFile,
  useWorkspacePath,
  useWorkspaceSchedule,
  useWorkspaceAttendance,
} from "@/features/workspace"

import { Divider } from "@/components/ui"

/* -------------------------------------------------------------------------- */
/* CONSTANTS                                                                  */
/* -------------------------------------------------------------------------- */

const DEMO_PROGRAM_ID = -1

function toWorkspaceProgramId(id: ProgramId | null): number {
  return typeof id === "number" ? id : DEMO_PROGRAM_ID
}

/* -------------------------------------------------------------------------- */
/* ROUTE <-> MODE MAP                                                         */
/* -------------------------------------------------------------------------- */

function modeFromPathname(pathname: string): WorkspaceMode {
  if (pathname.startsWith("/program/manager")) return "manager"
  if (pathname.startsWith("/program/workspace")) return "manager"
  if (pathname.includes("/editor")) return "editor"
  if (pathname.startsWith("/program/analyzer")) return "analyzer"
  if (pathname.startsWith("/program/attendance")) return "attendance"
  if (pathname.startsWith("/program/calendar")) return "schedule"
  return "manager"
}

/* -------------------------------------------------------------------------- */
/* PAGE                                                                       */
/* -------------------------------------------------------------------------- */

export default function WorkspacePage() {
  const { selectedProgramId } = useProgramContext()
  const { demoMode } = useDemo()

  const location = useLocation()
  const navigate = useNavigate()

  // URL params (supports /program/editor/:fileId and /program/:programId/editor/:fileId)
  const params = useParams<{ programId?: string; fileId?: string }>()
  const routeFileId = params.fileId ?? ""

  const effectiveProgramId: number = demoMode
    ? DEMO_PROGRAM_ID
    : toWorkspaceProgramId(selectedProgramId)

  const mode = useMemo<WorkspaceMode>(
    () => modeFromPathname(location.pathname),
    [location.pathname]
  )

  /* ---------------------------------------------------------------------- */
  /* FILE (MANAGER / EDITOR)                                                 */
  /* ---------------------------------------------------------------------- */

  const { fileId, setFileId, searchQuery, setSearchQuery } =
    useWorkspaceFile(effectiveProgramId)

  // When URL has :fileId, make it the current file (editor only)
  useEffect(() => {
    if (mode !== "editor") return
    if (!routeFileId) return
    if (routeFileId === fileId) return
    setFileId(routeFileId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, routeFileId])

  // Tab click updates URL (URL is the source of truth)
  const setMode = (next: WorkspaceMode) => {
    if (next === "manager") {
      if (location.pathname.startsWith("/program/manager")) return
      navigate("/program/manager")
      return
    }

    if (next === "analyzer") {
      if (location.pathname.startsWith("/program/analyzer")) return
      navigate("/program/analyzer")
      return
    }

    if (next === "attendance") {
      if (location.pathname.startsWith("/program/attendance")) return
      navigate("/program/attendance")
      return
    }

    if (next === "schedule") {
      if (location.pathname.startsWith("/program/calendar")) return
      navigate("/program/calendar")
      return
    }

    if (next === "editor") {
      if (fileId) {
        const nextPath = demoMode
          ? `/program/editor/${fileId}`
          : `/program/${effectiveProgramId}/editor/${fileId}`

        if (location.pathname === nextPath) return
        navigate(nextPath)
        return
      }

      // fallback (only works if you have /program/editor route)
      if (location.pathname.startsWith("/program/editor")) return
      navigate("/program/editor")
      return
    }
  }

  /* ---------------------------------------------------------------------- */
  /* SCHEDULE                                                                 */
  /* ---------------------------------------------------------------------- */

  const {
    scheduleWeekIndex,
    setScheduleWeekIndex,
    showAddSlot,
    setShowAddSlot,
  } = useWorkspaceSchedule()

  /* ---------------------------------------------------------------------- */
  /* ATTENDANCE                                                               */
  /* ---------------------------------------------------------------------- */

  const {
    attendanceDate,
    setAttendanceDate,
    attendanceHasSession,
    setAttendanceHasSession,
    attendanceIsDirty,
    setAttendanceIsDirty,
    attendanceExceptionCount,
    setAttendanceExceptionCount,
    attendanceSaveFailed,
    setAttendanceSaveFailed,
    submitAttendance,
    resetAttendance,
  } = useWorkspaceAttendance(effectiveProgramId)

  const safeSubmitAttendance = () => {
    if (demoMode) return
    submitAttendance()
  }

  const safeResetAttendance = () => {
    if (demoMode) return
    resetAttendance()
  }

  /* ---------------------------------------------------------------------- */
  /* BREADCRUMB PATH                                                          */
  /* ---------------------------------------------------------------------- */

  const path = useWorkspacePath({
    programId: effectiveProgramId,
    mode,
    fileId,
  })

  /* ---------------------------------------------------------------------- */
  /* RENDER                                                                   */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full">
      <div className="hidden">
        <Divider color="var(--gray-18)" inset={5} />
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <WorkspaceModeOutlet
          mode={mode}
          setMode={setMode}
          path={path}
          programId={effectiveProgramId}
          demoMode={demoMode}
          fileId={fileId}
          setFileId={setFileId}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          scheduleWeekIndex={scheduleWeekIndex}
          setScheduleWeekIndex={setScheduleWeekIndex}
          showAddSlot={showAddSlot}
          setShowAddSlot={setShowAddSlot}
          attendanceDate={attendanceDate}
          setAttendanceDate={setAttendanceDate}
          attendanceHasSession={attendanceHasSession}
          setAttendanceHasSession={setAttendanceHasSession}
          attendanceIsDirty={attendanceIsDirty}
          setAttendanceIsDirty={setAttendanceIsDirty}
          attendanceExceptionCount={attendanceExceptionCount}
          setAttendanceExceptionCount={setAttendanceExceptionCount}
          attendanceSaveFailed={attendanceSaveFailed}
          setAttendanceSaveFailed={setAttendanceSaveFailed}
          onSubmitAttendance={safeSubmitAttendance}
          onResetAttendance={safeResetAttendance}
        />
      </div>
    </div>
  )
}
