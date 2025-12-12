// src/pages/WorkspacePage.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useProgramContext } from "@/hooks/useProgramContext";

import WorkspaceToolbar from "@/components/workspace/workspacetoolbar/WorkspaceToolbar";
import ProjectManager from "@/components/workspace/manager/ProjectManager";
import ProjectEditor from "@/components/workspace/editor/ProjectEditor";
import AttendanceView from "@/features/attendance/views/AttendanceWorkspaceView";
import ScheduleView from "@/components/workspace/schedule/ScheduleView";

/* -------------------------------------------------------------------------- */
/* COMPONENT                                                                  */
/* -------------------------------------------------------------------------- */

export default function WorkspacePage() {
  const { selectedProgramId } = useProgramContext();

  /* ---------------------------------------------------------------------- */
  /* MODE                                                                   */
  /* ---------------------------------------------------------------------- */

  const [mode, setMode] = useState<
    "manager" | "editor" | "attendance" | "schedule"
  >("manager");

  /* ---------------------------------------------------------------------- */
  /* MANAGER / EDITOR SHARED STATE                                          */
  /* ---------------------------------------------------------------------- */

  const [searchQuery, setSearchQuery] = useState("");
  const [ledgerId, setLedgerId] = useState<string>("");
  const [path, setPath] = useState<string[]>([]);

  /* ---------------------------------------------------------------------- */
  /* SCHEDULE                                                               */
  /* ---------------------------------------------------------------------- */

  // Start at week 1 (and we clamp navigation so it can't go below 1)
  const [scheduleWeekIndex, setScheduleWeekIndex] = useState(1);
  const [showAddSlot, setShowAddSlot] = useState(false);

  /* ---------------------------------------------------------------------- */
  /* ATTENDANCE                                                             */
  /* ---------------------------------------------------------------------- */

  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [attendanceHasSession, setAttendanceHasSession] = useState(false);
  const [attendanceIsDirty, setAttendanceIsDirty] = useState(false);
  const [attendanceExceptionCount, setAttendanceExceptionCount] = useState(0);
  const [attendanceSaveFailed, setAttendanceSaveFailed] = useState(false);

  /* ---------------------------------------------------------------------- */
  /* LOAD FIRST LEDGER                                                      */
  /* ---------------------------------------------------------------------- */

  const loadFirstLedger = useCallback(async () => {
    if (!selectedProgramId) return;

    const { data } = await supabase
      .from("ledgers")
      .select("id")
      .eq("program_id", selectedProgramId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    setLedgerId(data?.id ?? "");
  }, [selectedProgramId]);

  useEffect(() => {
    loadFirstLedger();
  }, [loadFirstLedger]);

  /* ---------------------------------------------------------------------- */
  /* BREADCRUMB PATH                                                        */
  /* ---------------------------------------------------------------------- */

  const loadPath = useCallback(async () => {
    switch (mode) {
      case "manager":
        setPath([]);
        return;

      case "attendance":
        setPath(["Attendance"]);
        return;

      case "schedule":
        setPath(["Schedule"]);
        return;

      case "editor": {
        if (!ledgerId) {
          setPath(["No Path"]);
          return;
        }

        const { data: ledger } = await supabase
          .from("ledgers")
          .select("name")
          .eq("id", ledgerId)
          .maybeSingle();

        if (!ledger) {
          setPath(["No Path"]);
          return;
        }

        const { data: link } = await supabase
          .from("package_items")
          .select("package_id")
          .eq("ledger_id", ledgerId)
          .maybeSingle();

        if (!link?.package_id) {
          setPath([ledger.name ?? "Ledger"]);
          return;
        }

        const { data: pkg } = await supabase
          .from("packages")
          .select("name")
          .eq("id", link.package_id)
          .maybeSingle();

        setPath([pkg?.name ?? "", ledger.name ?? "Ledger"]);
        return;
      }
    }
  }, [mode, ledgerId]);

  useEffect(() => {
    loadPath();
  }, [loadPath]);

  /* ---------------------------------------------------------------------- */
  /* GLOBAL PROGRAM UPDATED LISTENER                                        */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    function handler() {
      console.log("🔄 program-updated → refreshing UI");
      loadFirstLedger();
      loadPath();
    }

    window.addEventListener("program-updated", handler);
    return () => window.removeEventListener("program-updated", handler);
  }, [loadFirstLedger, loadPath]);

  /* ---------------------------------------------------------------------- */
  /* ATTENDANCE ACTIONS                                                     */
  /* ---------------------------------------------------------------------- */

  function handleSubmitAttendance() {
    setAttendanceIsDirty(false);
    setAttendanceSaveFailed(false);
  }

  async function handleResetAttendance() {
    if (!selectedProgramId) return;

    await supabase
      .from("attendance")
      .delete()
      .eq("program_id", selectedProgramId)
      .eq("date", attendanceDate);

    setAttendanceIsDirty(false);
    setAttendanceExceptionCount(0);
    setAttendanceHasSession(false);
    setAttendanceSaveFailed(false);

    // Re-trigger AttendanceView reload for same date
    setAttendanceDate(attendanceDate);
  }

  /* ---------------------------------------------------------------------- */
  /* RENDER                                                                  */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full">
      <WorkspaceToolbar
        mode={mode}
        setMode={setMode}
        path={path}
        onEditorSearch={setSearchQuery}
        // ATTENDANCE
        attendanceDate={attendanceDate}
        setAttendanceDate={setAttendanceDate}
        attendanceHasSession={attendanceHasSession}
        attendanceIsDirty={attendanceIsDirty}
        attendanceExceptionCount={attendanceExceptionCount}
        onSubmitAttendance={handleSubmitAttendance}
        onResetAttendance={handleResetAttendance}
        attendanceSaveFailed={attendanceSaveFailed}
        // SCHEDULE
        scheduleWeekIndex={scheduleWeekIndex}
        setScheduleWeekIndex={setScheduleWeekIndex}
        onScheduleAdd={() => setShowAddSlot(true)}
      />

      {/* MANAGER ---------------------------------------------------------- */}
      {mode === "manager" && selectedProgramId && (
        <div className="flex flex-col flex-1 min-h-0">
          <ProjectManager programId={selectedProgramId} />
        </div>
      )}

      {/* EDITOR ----------------------------------------------------------- */}
      {mode === "editor" && selectedProgramId && (
        <div className="flex flex-col flex-1 min-h-0">
          <ProjectEditor
            programId={selectedProgramId}
            ledgerId={ledgerId}
            setLedgerId={setLedgerId}
            searchQuery={searchQuery}
          />
        </div>
      )}

      {/* ATTENDANCE ------------------------------------------------------- */}
      {mode === "attendance" && selectedProgramId && (
        <div className="flex flex-col flex-1 min-h-0">
          <AttendanceView
            attendanceDate={attendanceDate}
            attendanceHasSession={attendanceHasSession}
            setAttendanceHasSession={setAttendanceHasSession}
            attendanceIsDirty={attendanceIsDirty}
            setAttendanceIsDirty={setAttendanceIsDirty}
            attendanceExceptionCount={attendanceExceptionCount}
            setAttendanceExceptionCount={setAttendanceExceptionCount}
            attendanceSaveFailed={attendanceSaveFailed}
            setAttendanceSaveFailed={setAttendanceSaveFailed}
            onSubmitAttendance={handleSubmitAttendance}
          />
        </div>
      )}

      {/* SCHEDULE --------------------------------------------------------- */}
      {mode === "schedule" && selectedProgramId && (
        <div className="flex flex-col flex-1 min-h-0">
          <ScheduleView
            programId={selectedProgramId}
            scheduleWeekIndex={scheduleWeekIndex}
            setScheduleWeekIndex={setScheduleWeekIndex}
            triggerAddSlot={showAddSlot}
            setTriggerAddSlot={setShowAddSlot}
          />
        </div>
      )}
    </div>
  );
}
