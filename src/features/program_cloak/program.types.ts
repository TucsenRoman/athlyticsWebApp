// src/features/program_cloak/program.types.ts

export type ProgramId = number;

export interface Program {
  id: ProgramId;
  name: string;
  organization_id?: number | null;
  created_at?: string;
}

/* LOADING STATUS */
export type ProgramStatus =
  | "idle"
  | "loading"
  | "ready"
  | "error";
