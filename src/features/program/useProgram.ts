"use client"

import { useEffect, useState } from "react"
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
}

/* ========================================================================== */
/* HOOK                                                                       */
/* ========================================================================== */

export function useProgram() {
  const [programs, setPrograms] = useState<ProgramRecord[]>([])
  const [loading, setLoading] = useState(true)

  /* ---------------------------------------------------------------------- */
  /* LOAD                                                                    */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    let mounted = true

    const loadPrograms = async () => {
      setLoading(true)

      const { data, error } = await supabase
        .from("programs")
        .select("id, sport, year, school, state")
        .order("created_at", { ascending: true })

      if (!mounted) return

      if (error) {
        console.error("Failed to load programs:", error)
        setPrograms([])
      } else {
        setPrograms(data ?? [])
      }

      setLoading(false)
    }

    loadPrograms()

    return () => {
      mounted = false
    }
  }, [])

  /* ---------------------------------------------------------------------- */
  /* MUTATIONS                                                               */
  /* ---------------------------------------------------------------------- */

  async function updateProgramState(
    programId: ProgramId,
    state: "active" | "archived" | "deleted",
  ) {
    // 🚨 hard guard: demo programs never touch DB
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

    const { data } = await supabase
      .from("programs")
      .select("id, sport, year, school, state")
      .order("created_at", { ascending: true })

    setPrograms(data ?? [])
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
    archiveProgram,
    restoreProgram,
    deleteProgram,
  }
}
