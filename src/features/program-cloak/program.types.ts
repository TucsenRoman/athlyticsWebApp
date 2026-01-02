// src/features/program/program.types.ts
export type ProgramState = "active" | "archived" | "deleted"

export type ProgramId = number | `demo-${string}`;

export interface Program {
  id: ProgramId
  school: string
  sport: string
  year: string
  gender: string
  level: string
  state: ProgramState
  season_start?: string | null
  season_end?: string | null
  created_at?: string
}

/* LOADING STATUS */
export type ProgramStatus =
  | "idle"
  | "loading"
  | "ready"
  | "error";
