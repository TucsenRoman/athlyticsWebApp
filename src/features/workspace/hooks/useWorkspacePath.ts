// src/features/workspace/hooks/useWorkspacePath.ts
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { WorkspaceMode } from "../types/workspace.types";

interface Params {
  mode: WorkspaceMode;
  programId: number | null;
  ledgerId: string;
}

export function useWorkspacePath({ mode, programId, ledgerId }: Params) {
  const [path, setPath] = useState<string[]>([]);

  useEffect(() => {
    if (!programId) {
      setPath([]);
      return;
    }

    async function load() {
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
    }

    load();
  }, [mode, programId, ledgerId]);

  return path;
}
