import type { ProgramLite } from "../programLite.types"

export function getDeletedPrograms(programs: ProgramLite[]) {
  return programs.filter(p => p.state === "deleted")
}
