// src/features/workspace/hooks/useWorkspaceLedger.ts
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useWorkspaceLedger(programId: number | null) {
  const [ledgerId, setLedgerId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!programId) return;

    async function loadFirstLedger() {
      const { data } = await supabase
        .from("ledgers")
        .select("id")
        .eq("program_id", programId)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      setLedgerId(data?.id ?? "");
    }

    loadFirstLedger();
  }, [programId]);

  return {
    ledgerId,
    setLedgerId,
    searchQuery,
    setSearchQuery,
  };
}
