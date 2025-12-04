import { supabase } from "@/integrations/supabase/client";

export async function getRosterLedgerId(programId: number) {
  const { data, error } = await supabase
    .from("ledgers")
    .select("id, name, program_id")
    .eq("program_id", programId);

  if (error) throw error;

  const roster = data.find((l) =>
    l.name.toLowerCase().trim() === "roster"
  );

  return roster?.id ?? null;
}
