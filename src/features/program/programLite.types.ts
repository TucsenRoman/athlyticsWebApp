import type { ProgramId } from "@/features/program-cloak/useProgramContext";

export type ProgramLite = {
  id: ProgramId
  sport: string
  year: string
  school: string | null
  state: "active" | "archived" | "deleted" | string
  created_at: string
  last_used_at: string | null
}
