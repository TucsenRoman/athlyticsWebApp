import type { ProgramLite } from "../programLite.types"

export function getActivePrograms(programs: ProgramLite[]) {
  return programs.filter(p => p.state === "active")
}
