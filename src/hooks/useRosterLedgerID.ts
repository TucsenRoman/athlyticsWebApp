import { supabase } from "@/integrations/supabase/client"

export async function resolveRosterLedgerId(programId: number) {
  const { data, error } = await supabase
    .from("files")
    .select("id, name, program_id")
    .eq("program_id", programId)
    .eq("type", "table")

  if (error) throw error

  const roster = (data ?? []).find(
    (f) => (f.name ?? "").toLowerCase().trim() === "roster"
  )

  return roster?.id ?? null
}
