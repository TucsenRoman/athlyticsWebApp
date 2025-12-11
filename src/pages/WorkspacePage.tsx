"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useProgramContext } from "@/hooks/useProgramContext";

import WorkspaceToolbar from "@/components/workspace/workspacetoolbar/WorkspaceToolbar";
import ProjectManager from "@/components/workspace/manager/ProjectManager";
import ProjectEditor from "@/components/workspace/editor/ProjectEditor";
import AttendanceView from "@/components/workspace/attendance/AttendanceView";
import ScheduleView from "@/components/workspace/schedule/ScheduleView";

export default function WorkspacePage() {
  const { selectedProgramId } = useProgramContext();

  /* -------------------------------------------------------------------------- */
  /* WORKSPACE MODE                                                             */
  /* -------------------------------------------------------------------------- */
  const [mode, setMode] = useState<
    "manager" | "editor" | "attendance" | "schedule"
  >("manager");

  const [searchQuery, setSearchQuery] = useState("");
  const [ledgerId, setLedgerId] = useState<string>("");
  const [path, setPath] = useState<string[]>([]);

  /* -------------------------------------------------------------------------- */
  /* 1. Load FIRST ledger                                                      */
  /* -------------------------------------------------------------------------- */
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

  /* -------------------------------------------------------------------------- */
  /* 2. Breadcrumb Path                                                         */
  /* -------------------------------------------------------------------------- */
  const loadPath = useCallback(async () => {
    if (mode === "manager") {
      setPath([]);
      return;
    }

    if (mode === "attendance") {
      setPath(["Attendance"]);
      return;
    }

    if (mode === "schedule") {
      setPath(["Schedule"]);
      return;
    }

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

    if (!pkg) {
      setPath([ledger.name ?? "Ledger"]);
      return;
    }

    setPath([pkg.name, ledger.name ?? "Ledger"]);
  }, [mode, ledgerId]);

  useEffect(() => {
    loadPath();
  }, [loadPath]);

  /* -------------------------------------------------------------------------- */
  /* 3. GLOBAL EVENT LISTENER                                                   */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    const handler = () => {
      console.log("🔄 WorkspacePage: program-updated → refreshing UI");
      loadFirstLedger();
      loadPath();
    };

    window.addEventListener("program-updated", handler);
    return () => window.removeEventListener("program-updated", handler);
  }, [loadFirstLedger, loadPath]);

  /* -------------------------------------------------------------------------- */
  /* ATTENDANCE STATE (shared across toolbar + view)                            */
  /* -------------------------------------------------------------------------- */

  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().substring(0, 10)
  );

  const [attendanceHasSession, setAttendanceHasSession] = useState(false);
  const [attendanceIsDirty, setAttendanceIsDirty] = useState(false);
  const [attendanceExceptionCount, setAttendanceExceptionCount] = useState(0);

  const [scheduleWeekIndex, setScheduleWeekIndex] = useState(0);

  // offline / save failure flag
  const [attendanceSaveFailed, setAttendanceSaveFailed] = useState(false);

  function handleSubmitAttendance() {
    // If you ever add a manual "Save" flow, reset flags here
    setAttendanceIsDirty(false);
    setAttendanceSaveFailed(false);
  }

  /* -------------------------------------------------------------------------- */
  /* RESET ATTENDANCE FOR CURRENT DATE                                          */
  /* -------------------------------------------------------------------------- */
  async function handleResetAttendance() {
    if (!selectedProgramId) return;

    await supabase
      .from("attendance")
      .delete()
      .eq("program_id", selectedProgramId)
      .eq("date", attendanceDate);

    // Reset UI
    setAttendanceIsDirty(false);
    setAttendanceExceptionCount(0);
    setAttendanceHasSession(false);
    setAttendanceSaveFailed(false);

    // Force reload in AttendanceView for this same date
    setAttendanceDate(attendanceDate);
  }

  /* -------------------------------------------------------------------------- */
  /* RENDER                                                                     */
  /* -------------------------------------------------------------------------- */

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full">
      <WorkspaceToolbar
        mode={mode}
        setMode={setMode}
        path={path}
        onEditorSearch={setSearchQuery}
        attendanceDate={attendanceDate}
        setAttendanceDate={setAttendanceDate}
        attendanceHasSession={attendanceHasSession}
        attendanceIsDirty={attendanceIsDirty}
        attendanceExceptionCount={attendanceExceptionCount}
        onSubmitAttendance={handleSubmitAttendance}
        onResetAttendance={handleResetAttendance}
        attendanceSaveFailed={attendanceSaveFailed}
        scheduleWeekIndex={scheduleWeekIndex}
        setScheduleWeekIndex={setScheduleWeekIndex}
      />

      {/* MANAGER VIEW */}
      {mode === "manager" && selectedProgramId && (
        <div className="flex flex-col flex-1 min-h-0">
          <ProjectManager programId={selectedProgramId} />
        </div>
      )}

      {/* EDITOR VIEW */}
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

      {/* ATTENDANCE VIEW */}
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

      {/* SCHEDULE VIEW */}
      {mode === "schedule" && (
        <ScheduleView
          scheduleWeekIndex={scheduleWeekIndex}
          setScheduleWeekIndex={setScheduleWeekIndex}
        />
      )}
    </div>
  );
}
