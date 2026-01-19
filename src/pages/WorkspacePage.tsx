// src/pages/WorkspacePage.tsx
"use client";

import { useState } from "react";
import { useProgramContext } from "@/features/program-cloak/useProgramContext";
import { useDemo } from "@/contexts/DemoContext";

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
/* CONSTANTS                                                                  */
/* -------------------------------------------------------------------------- */

// Stable fake program id for demo users
const DEMO_PROGRAM_ID = -1;

/* -------------------------------------------------------------------------- */
/* PAGE                                                                       */
/* -------------------------------------------------------------------------- */

export default function WorkspacePage() {
  const { selectedProgramId } = useProgramContext();
  const { demoMode } = useDemo();

  /* ---------------------------------------------------------------------- */
  /* EFFECTIVE PROGRAM CONTEXT                                              */
  /* ---------------------------------------------------------------------- */

  // Demo users always get a fake program
  const effectiveProgramId = demoMode
    ? DEMO_PROGRAM_ID
    : selectedProgramId;

  /* ---------------------------------------------------------------------- */
  /* MODE                                                                   */
  /* ---------------------------------------------------------------------- */

  const [mode, setMode] = useState<WorkspaceMode>("drive");

  /* ---------------------------------------------------------------------- */
  /* LEDGER (DRIVE / EDITOR)                                               */
  /* ---------------------------------------------------------------------- */

  const {
    ledgerId,
    setLedgerId,
    searchQuery,
    setSearchQuery,
  } = useWorkspaceLedger(effectiveProgramId);

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
  } = useWorkspaceAttendance(effectiveProgramId);

  /* ---------------------------------------------------------------------- */
  /* BREADCRUMB PATH                                                        */
  /* ---------------------------------------------------------------------- */

  const path = useWorkspacePath({
    programId: effectiveProgramId,
    mode,
    ledgerId,
  });

  /* ---------------------------------------------------------------------- */
  /* DEMO-SAFE ACTION WRAPPERS                                              */
  /* ---------------------------------------------------------------------- */

  const safeSubmitAttendance = () => {
    if (demoMode) return;
    submitAttendance();
  };

  const safeResetAttendance = () => {
    if (demoMode) return;
    resetAttendance();
  };

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
        onSubmitAttendance={safeSubmitAttendance}
        onResetAttendance={safeResetAttendance}

        /* SCHEDULE */
        scheduleWeekIndex={scheduleWeekIndex}
        setScheduleWeekIndex={setScheduleWeekIndex}
        onScheduleAdd={() => {
          if (demoMode) return;
          setShowAddSlot(true);
        }}
      />

      <WorkspaceModeOutlet
        mode={mode}
        programId={effectiveProgramId}

        /* DRIVE */

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
        onSubmitAttendance={safeSubmitAttendance}
      />
    </div>
  );
}
