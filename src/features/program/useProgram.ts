"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/integrations/supabase/client"
import type { ProgramId } from "@/features/program-cloak/useProgramContext"

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

export type ProgramRecord = {
  id: ProgramId
  sport: string
  year: string
  school: string | null
  state: "active" | "archived" | "deleted" | string
  created_at: string
  last_used_at: string | null
}

/* ========================================================================== */
/* HOOK                                                                       */
/* ========================================================================== */

export function useProgram() {
  const [programs, setPrograms] = useState<ProgramRecord[]>([])
  const [loading, setLoading] = useState(true)

  /* ---------------------------------------------------------------------- */
  /* CORE LOADER (single source of truth)                                    */
  /* ---------------------------------------------------------------------- */

  const loadPrograms = useCallback(async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from("programs")
      .select("id, sport, year, school, state, created_at, last_used_at")
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Failed to load programs:", error)
      setPrograms([])
    } else {
      setPrograms(data ?? [])
    }

    setLoading(false)
  }, [])

  /* ---------------------------------------------------------------------- */
  /* INITIAL LOAD                                                            */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    loadPrograms()
  }, [loadPrograms])

  /* ---------------------------------------------------------------------- */
  /* MUTATIONS                                                               */
  /* ---------------------------------------------------------------------- */

  async function updateProgramState(
    programId: ProgramId,
    state: "active" | "archived" | "deleted",
  ) {
    // 🚨 demo programs never touch DB
    if (typeof programId !== "number") {
      console.warn("Skipping DB update for demo program:", programId)
      return
    }

    const { error } = await supabase
      .from("programs")
      .update({
        state,
        state_at: new Date().toISOString(),
      })
      .eq("id", programId)

    if (error) {
      console.error("Failed to update program state:", error)
      return
    }

    // ✅ re-sync after mutation
    await loadPrograms()
  }

  const archiveProgram = (id: ProgramId) =>
    updateProgramState(id, "archived")

  const restoreProgram = (id: ProgramId) =>
    updateProgramState(id, "active")

  const deleteProgram = (id: ProgramId) =>
    updateProgramState(id, "deleted")

  /* ---------------------------------------------------------------------- */
  /* API                                                                     */
  /* ---------------------------------------------------------------------- */

  return {
    programs,
    loading,

    // mutations
    archiveProgram,
    restoreProgram,
    deleteProgram,

    // explicit refresh for creates / external mutations
    refresh: loadPrograms,
  }
}
