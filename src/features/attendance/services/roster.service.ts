// src/features/attendance/services/roster.service.ts

import { supabase } from "@/integrations/supabase/client";
import { resolveRosterLedgerId } from "@/hooks/useRosterLedgerID";
import type { ProgramId } from "@/features/program-cloak/useProgramContext";

export interface RosterAthlete {
  key: string;
  name: string;
  raw: any;
}

export async function fetchRoster(programId: ProgramId): Promise<RosterAthlete[]> {
  const rosterLedgerId = await resolveRosterLedgerId(programId);
  if (!rosterLedgerId) return [];

  const { data, error } = await supabase
    .from("ledger_entries")
    .select("id, values, entity_key")
    .eq("ledger_id", rosterLedgerId);

  if (error || !data) {
    console.error("fetchRoster error", error);
    return [];
  }

  const rows = data as any[];

  return rows.map((entry) => {
    const values = (entry.values || {}) as Record<string, unknown>;

    // Grab the first non-empty cell as the display name for now
    const nonEmpty = Object.values(values).find(
      (v) => typeof v === "string" && v.trim() !== ""
    ) as string | undefined;

    const name =
      nonEmpty ||
      (entry.entity_key as string | undefined) ||
      "Unnamed Athlete";

    const key =
      (entry.entity_key as string | undefined) ||
      (entry.id as string | undefined) ||
      name;

    return {
      key,
      name,
      raw: entry,
    };
  });
}
