"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useProgramContext } from "@/hooks/useProgramContext";

import LedgerToolbar from "@/components/workspace/Toolbar";
import ProjectManager from "@/components/workspace/manager/ProjectManager";
import ProjectEditor from "@/components/workspace/editor/ProjectEditor";

import AttendanceView from "@/components/workspace/attendance/AttendanceView"

export default function WorkspacePage() {
  const { selectedProgramId } = useProgramContext();

  const [mode, setMode] = useState<
    "manager" | "editor" | "attendance" | "schedule"
  >("manager");

  const [searchQuery, setSearchQuery] = useState("");
  const [ledgerId, setLedgerId] = useState<string>("");
  const [path, setPath] = useState<string[]>([]);

  /* ========================================================================== */
  /* 1) Load FIRST ledger — reusable + callable (needed for event refresh)      */
  /* ========================================================================== */
  const loadFirstLedger = useCallback(async () => {
    if (!selectedProgramId) return;

    const { data } = await supabase
      .from("ledgers")
      .select("id")
      .eq("program_id", selectedProgramId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (data?.id) setLedgerId(data.id);
    else setLedgerId("");
  }, [selectedProgramId]);

  useEffect(() => {
    loadFirstLedger();
  }, [loadFirstLedger]);

  /* ========================================================================== */
  /* 2) Load breadcrumb path                                                    */
  /* ========================================================================== */
  const loadPath = useCallback(async () => {
    if (mode === "manager") {
      setPath([]);
      return;
    }

    if (mode === "attendance" || mode === "schedule") {
      setPath([mode === "attendance" ? "Attendance" : "Schedule"]);
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

  /* ========================================================================== */
  /* 3) GLOBAL EVENT LISTENER: refresh UI after installer finishes              */
  /* ========================================================================== */
  useEffect(() => {
    const handler = () => {
      console.log("🔄 WorkspacePage: program-updated → refreshing UI");
      loadFirstLedger();
      loadPath();
      setMode((m) => m);
      setLedgerId((id) => id);
    };

    window.addEventListener("program-updated", handler);
    return () => window.removeEventListener("program-updated", handler);
  }, [loadFirstLedger, loadPath]);

  /* ========================================================================== */
  /* RENDER                                                                     */
  /* ========================================================================== */
  return (
    <div className="flex flex-col flex-1 min-h-0 w-full">
      <LedgerToolbar
        mode={mode}
        setMode={setMode}
        path={path}
        onEditorSearch={setSearchQuery}
      />

      {/* Manager View */}
      <div className={mode === "manager" ? "flex flex-col flex-1 min-h-0" : "hidden"}>
        {selectedProgramId && <ProjectManager programId={selectedProgramId} />}
      </div>

      {/* Editor View */}
      <div className={mode === "editor" ? "flex flex-col flex-1 min-h-0" : "hidden"}>
        {selectedProgramId && (
          <ProjectEditor
            programId={selectedProgramId}
            ledgerId={ledgerId}
            setLedgerId={setLedgerId}
            searchQuery={searchQuery}
          />
        )}
      </div>

      {/* Attendance View */}
      <div className={mode === "attendance" ? "flex flex-col flex-1 min-h-0" : "hidden"}>
        {selectedProgramId && <AttendanceView />}
      </div>

      {/* Schedule View */}
      <div className={mode === "schedule" ? "flex flex-col flex-1 min-h-0" : "hidden"}>
        {/* {selectedProgramId && <ProgramSchedule programId={selectedProgramId} />} */}
      </div>
    </div>
  );
}
