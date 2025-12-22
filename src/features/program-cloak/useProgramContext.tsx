"use client";

/*
  useProgramContext.tsx

  PURPOSE
  -------
  This file defines the ProgramContext, which is the SINGLE SOURCE OF TRUTH
  for "what program is currently selected" and (in demo mode) what programs exist.

  CRITICAL DESIGN RULE
  --------------------
  - In demo mode:
      • Programs exist ONLY in memory
      • Users can add / edit / delete programs freely
      • Nothing is ever written to the database
      • State persists across route changes
      • State resets on page refresh

  - In authenticated (real) mode:
      • This context ONLY tracks selectedProgramId
      • Real program loading & persistence happens elsewhere
*/

import { createContext, useContext, useState, ReactNode } from "react";

/* -------------------------------------------------------------------------- */
/* DEMO MODE                                                                  */
/* -------------------------------------------------------------------------- */

import { useDemo } from "@/contexts/DemoContext";
import { demoPrograms } from "@/demo/demoPrograms";

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

/*
  ProgramId
  ---------
  - Real programs use numeric IDs (from the database)
  - Demo programs use string IDs (to guarantee no collision)
*/
export type ProgramId = number | string;

/*
  Program
  -------
  Minimal shape required by ProgramSelector and headers.
  This intentionally avoids database-specific fields.
*/
export interface Program {
  id: ProgramId;
  school: string | null;
  sport: string | null;
  year: string | null;
}

/*
  ProgramContextType
  ------------------
  Everything the rest of the app is allowed to know or do
  with programs.
*/
interface ProgramContextType {
  /* Currently selected program */
  selectedProgramId: ProgramId | null;
  setSelectedProgramId: (id: ProgramId | null) => void;

  /* Program list (demo only) */
  programs: Program[];

  /* Mutations (demo only) */
  addProgram: (program: Program) => void;
  updateProgram: (program: Program) => void;
  deleteProgram: (id: ProgramId) => void;
}

/* -------------------------------------------------------------------------- */
/* CONTEXT                                                                    */
/* -------------------------------------------------------------------------- */

const ProgramContext = createContext<ProgramContextType | undefined>(undefined);

/* -------------------------------------------------------------------------- */
/* PROVIDER                                                                   */
/* -------------------------------------------------------------------------- */

export function ProgramProvider({ children }: { children: ReactNode }) {
  /*
    demoMode
    --------
    True when the app is intentionally in preview / demo mode.
  */
  const { demoMode } = useDemo();

  /* ---------------------------------------------------------------------- */
  /* DEMO PROGRAM STATE (IN-MEMORY ONLY)                                     */
  /* ---------------------------------------------------------------------- */

  /*
    demoProgramState
    ----------------
    Holds the list of programs visible in demo mode.
    This lives entirely in memory and is reset on refresh.
  */
  const [demoProgramState, setDemoProgramState] =
    useState<Program[]>(demoPrograms);

  /*
    selectedProgramId
    -----------------
    Tracks the currently selected program for BOTH demo and real users.

    In demo mode:
      - Automatically initialize to the first demo program (if any)
    In real mode:
      - Starts as null and is set via ProgramSelector
  */
  const [selectedProgramId, setSelectedProgramId] =
    useState<ProgramId | null>(
      demoMode ? demoPrograms[0]?.id ?? null : null
    );

  /* ---------------------------------------------------------------------- */
  /* DEMO MUTATION HANDLERS                                                   */
  /* ---------------------------------------------------------------------- */

  /*
    addProgram (demo only)
    ---------------------
    Adds a new program to the in-memory demo list.
  */
  const addProgram = (program: Program) => {
    if (!demoMode) return;

    setDemoProgramState((prev) => [...prev, program]);
    setSelectedProgramId(program.id);
  };

  /*
    updateProgram (demo only)
    ------------------------
    Updates an existing demo program.
  */
  const updateProgram = (program: Program) => {
    if (!demoMode) return;

    setDemoProgramState((prev) =>
      prev.map((p) => (p.id === program.id ? program : p))
    );
  };

  /*
    deleteProgram (demo only)
    ------------------------
    Removes a demo program from memory.
  */
  const deleteProgram = (id: ProgramId) => {
    if (!demoMode) return;

    setDemoProgramState((prev) => prev.filter((p) => p.id !== id));

    if (selectedProgramId === id) {
      setSelectedProgramId(null);
    }
  };

  /* ---------------------------------------------------------------------- */
  /* CONTEXT VALUE                                                           */
  /* ---------------------------------------------------------------------- */

  /*
    IMPORTANT:
    ----------
    - In demo mode → expose demo programs
    - In real mode → expose empty array (real programs are loaded elsewhere)
  */
  const value: ProgramContextType = {
    selectedProgramId,
    setSelectedProgramId,

    programs: demoMode ? demoProgramState : [],

    addProgram,
    updateProgram,
    deleteProgram,
  };

  return (
    <ProgramContext.Provider value={value}>
      {children}
    </ProgramContext.Provider>
  );
}

/* -------------------------------------------------------------------------- */
/* HOOK                                                                       */
/* -------------------------------------------------------------------------- */

export function useProgramContext() {
  const context = useContext(ProgramContext);

  if (context === undefined) {
    throw new Error(
      "useProgramContext must be used within a ProgramProvider"
    );
  }

  return context;
}
