import type { ProgramLite } from "../programLite.types"

export function getAllPrograms(programs: ProgramLite[]) {
  return programs.filter(p => p.state === "active")
}
