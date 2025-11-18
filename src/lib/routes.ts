import { supabase } from "@/integrations/supabase/client";

export async function fetchRoutes(ledgerId: string) {
  return supabase
    .from("ledger_routes")
    .select(`
      id,
      source_ledger_id,
      source_column_id,
      target_ledger_id,
      target_column_id,
      binding_group_id,
      active,
      priority,
      route_permissions (*),
      route_sync_state (*)
    `)
    .or(`source_ledger_id.eq.${ledgerId},target_ledger_id.eq.${ledgerId}`)
    .order("priority", { ascending: true });
}
