"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useProgramContext } from "@/hooks/useProgramContext";

import LedgerToolbar from "@/components/ledger/LedgerToolbar";
import ProjectManager from "@/components/workspace/manager/ProjectManager";
import ProjectEditor from "@/components/workspace/editor/ProjectEditor";

export default function WorkspacePage() {
  const { selectedProgramId } = useProgramContext();

  const [mode, setMode] = useState<"manager" | "editor">("manager");
  const [ledgerId, setLedgerId] = useState<string>("");
  const [path, setPath] = useState<string[]>([]);

  /* ---------------------------------------------------------------------- */
  /* LOAD FIRST LEDGER ON PROGRAM CHANGE                                    */
  /* ---------------------------------------------------------------------- */
  useEffect(() => {
    if (!selectedProgramId) return;

    const loadFirst = async () => {
      const { data } = await supabase
        .from("ledgers")
        .select("id")
        .eq("program_id", selectedProgramId)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (data?.id) setLedgerId(data.id);
      else setLedgerId("");
    };

    loadFirst();
  }, [selectedProgramId]);

  /* ---------------------------------------------------------------------- */
  /* BREADCRUMB PATH                                                        */
  /* ---------------------------------------------------------------------- */
    useEffect(() => {
    // MANAGER: hide path
    if (mode === "manager") {
      setPath([]);
      return;
    }

    // EDITOR but no ledger selected
    if (!ledgerId) {
      setPath(["No Path"]);
      return;
    }

    const loadPath = async () => {
      // --- Load the ledger ---
      const { data: ledger, error: ledgerErr } = await supabase
        .from("ledgers")
        .select("name")
        .eq("id", ledgerId)
        .maybeSingle();

      if (ledgerErr || !ledger) {
        setPath(["No Path"]);
        return;
      }

      // --- Look for a package_items record linking ledger → package ---
      const { data: link } = await supabase
        .from("package_items")
        .select("package_id")
        .eq("ledger_id", ledgerId)
        .maybeSingle();

      // Orphan ledger → just ledger name
      if (!link?.package_id) {
        setPath([ledger.name ?? "Ledger"]);
        return;
      }

      // --- Load package name ---
      const { data: pkg } = await supabase
        .from("packages")
        .select("name")
        .eq("id", link.package_id)
        .maybeSingle();

      if (!pkg) {
        setPath([ledger.name ?? "Ledger"]);
        return;
      }

      // Package → Ledger
      setPath([pkg.name, ledger.name ?? "Ledger"]);
    };

    loadPath();
  }, [mode, ledgerId]);

  /* ---------------------------------------------------------------------- */
  /* RENDER (PERSISTENT MOUNT — ZERO RELOAD)                                 */
  /* ---------------------------------------------------------------------- */
  return (
    <div className="flex flex-col flex-1 min-h-0 w-full">
      <LedgerToolbar mode={mode} setMode={setMode} path={path} />

      {/* MANAGER stays mounted (hidden when inactive) */}
      <div className={mode === "manager" ? "flex flex-col flex-1 min-h-0" : "hidden"}>
        {selectedProgramId && (
          <ProjectManager programId={selectedProgramId} />
        )}
      </div>

      {/* EDITOR stays mounted (hidden when inactive) */}
      <div className={mode === "editor" ? "flex flex-col flex-1 min-h-0" : "hidden"}>
        {selectedProgramId && (
          <ProjectEditor
            programId={selectedProgramId}
            ledgerId={ledgerId}
            setLedgerId={setLedgerId}
          />
        )}
      </div>
    </div>
  );
}
