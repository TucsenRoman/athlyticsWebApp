// src/features/workspace/components/WorkspaceModeOutlet.tsx
"use client";

import { ProjectManager, ProjectEditor } from "@/features/workspace";
import { AttendanceWorkspaceView } from "@/features/attendance";
import { ScheduleWorkspaceView } from "@/features/schedule";

import type { WorkspaceMode } from "@/features/workspace";

interface Props {
  mode: WorkspaceMode;
  programId: number | null;

  // editor
  ledgerId: string;
  setLedgerId: (id: string) => void;
  searchQuery: string;

  // schedule
  scheduleWeekIndex: number;
  setScheduleWeekIndex: (n: number) => void;
  showAddSlot: boolean;
  setShowAddSlot: (v: boolean) => void;

  // attendance
  attendanceDate: string;
  attendanceHasSession: boolean;
  setAttendanceHasSession: (v: boolean) => void;
  attendanceIsDirty: boolean;
  setAttendanceIsDirty: (v: boolean) => void;
  attendanceExceptionCount: number;
  setAttendanceExceptionCount: (n: number) => void;
  attendanceSaveFailed: boolean;
  setAttendanceSaveFailed: (v: boolean) => void;
  onSubmitAttendance: () => void;
}

export default function WorkspaceModeOutlet(props: Props) {
  const {
    mode,
    programId,

    ledgerId,
    setLedgerId,
    searchQuery,

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
  } = props;

  if (!programId) return null;

  switch (mode) {
    case "manager":
      return <ProjectManager programId={programId} />;

    case "editor":
      return (
        <ProjectEditor
          programId={programId}
          ledgerId={ledgerId}
          setLedgerId={setLedgerId}
          searchQuery={searchQuery}
        />
      );

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
      );

    case "schedule":
      return (
        <ScheduleWorkspaceView
          programId={programId}
          scheduleWeekIndex={scheduleWeekIndex}
          setScheduleWeekIndex={setScheduleWeekIndex}
          triggerAddSlot={showAddSlot}
          setTriggerAddSlot={setShowAddSlot}
        />
      );

    default:
      return null;
  }
}
