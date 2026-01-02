import type { ProgramLite } from "../programLite.types"

export function getArchivedPrograms(programs: ProgramLite[]) {
  return programs.filter(p => p.state === "archived")
}
