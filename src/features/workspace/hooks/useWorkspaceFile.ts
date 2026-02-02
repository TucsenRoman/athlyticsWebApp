// src/features/workspace/hooks/useWorkspaceFile.ts
"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"

export function useWorkspaceFile(programId: number | null) {
  const [fileId, setFileId] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (!programId) {
      setFileId("")
      return
    }

    let alive = true

    async function loadFirstFile() {
      const { data, error } = await supabase
        .from("files")
        .select("id")
        .eq("program_id", programId)
        .eq("type", "table")
        .eq("status", "active")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle()

      if (!alive) return

      if (error) {
        console.error("useWorkspaceFile: failed to load first file:", error)
        setFileId("")
        return
      }

      setFileId(data?.id ?? "")
    }

    loadFirstFile()

    return () => {
      alive = false
    }
  }, [programId])

  return {
    fileId,
    setFileId,
    searchQuery,
    setSearchQuery,
  }
}
