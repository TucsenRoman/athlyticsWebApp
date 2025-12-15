// src/pages/WorkspacePage.tsx
"use client";

import { useState } from "react";
import { useProgramContext } from "@/features/program-cloak/useProgramContext";

import {
  WorkspaceToolbar,
  WorkspaceModeOutlet,
  type WorkspaceMode,
  useWorkspaceLedger,
  useWorkspacePath,
  useWorkspaceSchedule,
  useWorkspaceAttendance,
} from "@/features/workspace";

/* -------------------------------------------------------------------------- */
/* PAGE                                                                       */
/* -------------------------------------------------------------------------- */

export default function WorkspacePage() {
  const { selectedProgramId } = useProgramContext();

  /* ---------------------------------------------------------------------- */
  /* MODE                                                                   */
  /* ---------------------------------------------------------------------- */

  const [mode, setMode] = useState<WorkspaceMode>("manager");

  /* ---------------------------------------------------------------------- */
  /* LEDGER (MANAGER / EDITOR)                                               */
  /* ---------------------------------------------------------------------- */

  const {
    ledgerId,
    setLedgerId,
    searchQuery,
    setSearchQuery,
  } = useWorkspaceLedger(selectedProgramId);

  /* ---------------------------------------------------------------------- */
  /* SCHEDULE                                                               */
  /* ---------------------------------------------------------------------- */

  const {
    scheduleWeekIndex,
    setScheduleWeekIndex,
    showAddSlot,
    setShowAddSlot,
  } = useWorkspaceSchedule();

  /* ---------------------------------------------------------------------- */
  /* ATTENDANCE                                                             */
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
  } = useWorkspaceAttendance(selectedProgramId);

  /* ---------------------------------------------------------------------- */
  /* BREADCRUMB PATH                                                        */
  /* ---------------------------------------------------------------------- */

  const path = useWorkspacePath({
    programId: selectedProgramId,
    mode,
    ledgerId,
  });

  /* ---------------------------------------------------------------------- */
  /* RENDER                                                                 */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full">
      <WorkspaceToolbar
        mode={mode}
        setMode={setMode}
        path={path}
        onEditorSearch={setSearchQuery}

        /* ATTENDANCE */
        attendanceDate={attendanceDate}
        setAttendanceDate={setAttendanceDate}
        attendanceHasSession={attendanceHasSession}
        attendanceIsDirty={attendanceIsDirty}
        attendanceExceptionCount={attendanceExceptionCount}
        attendanceSaveFailed={attendanceSaveFailed}
        onSubmitAttendance={submitAttendance}
        onResetAttendance={resetAttendance}

        /* SCHEDULE */
        scheduleWeekIndex={scheduleWeekIndex}
        setScheduleWeekIndex={setScheduleWeekIndex}
        onScheduleAdd={() => setShowAddSlot(true)}
      />

      <WorkspaceModeOutlet
        mode={mode}
        programId={selectedProgramId}

        /* MANAGER */

        /* EDITOR */
        ledgerId={ledgerId}
        setLedgerId={setLedgerId}
        searchQuery={searchQuery}

        /* SCHEDULE */
        scheduleWeekIndex={scheduleWeekIndex}
        setScheduleWeekIndex={setScheduleWeekIndex}
        showAddSlot={showAddSlot}
        setShowAddSlot={setShowAddSlot}

        /* ATTENDANCE */
        attendanceDate={attendanceDate}
        attendanceHasSession={attendanceHasSession}
        setAttendanceHasSession={setAttendanceHasSession}
        attendanceIsDirty={attendanceIsDirty}
        setAttendanceIsDirty={setAttendanceIsDirty}
        attendanceExceptionCount={attendanceExceptionCount}
        setAttendanceExceptionCount={setAttendanceExceptionCount}
        attendanceSaveFailed={attendanceSaveFailed}
        setAttendanceSaveFailed={setAttendanceSaveFailed}
        onSubmitAttendance={submitAttendance}
      />
    </div>
  );
}
