// src/features/workspace/hooks/useWorkspacePath.ts
"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import type { WorkspaceMode } from "../types/workspace.types"

interface Params {
  mode: WorkspaceMode
  programId: number | null
  fileId: string
}

export function useWorkspacePath({ mode, programId, fileId }: Params) {
  const [path, setPath] = useState<string[]>([])

  useEffect(() => {
    let mounted = true

    async function load() {
      if (!programId) {
        if (mounted) setPath([])
        return
      }

      // ✅ Fast sync paths for non-editor modes
      if (mode === "manager") {
        if (mounted) setPath([])
        return
      }

      if (mode === "attendance") {
        if (mounted) setPath(["Attendance"])
        return
      }

      if (mode === "schedule") {
        if (mounted) setPath(["Schedule"])
        return
      }

      // ✅ Editor path: [Package?, File]
      if (mode === "editor") {
        if (!fileId) {
          if (mounted) setPath(["No File"])
          return
        }

        // 1) file name (guard: ensure it belongs to this program)
        const { data: fileRow, error: fileErr } = await supabase
          .from("files")
          .select("name, program_id")
          .eq("id", fileId)
          .maybeSingle()

        if (fileErr) console.error("useWorkspacePath: files lookup failed:", fileErr)

        const validProgram =
          fileRow?.program_id == null ? true : Number(fileRow.program_id) === Number(programId)

        const fileName = (fileRow?.name ?? "").trim() || "Table"

        if (!fileRow || !validProgram) {
          if (mounted) setPath(["No File"])
          return
        }

        // 2) find package via package_items (DB still uses ledger_id currently)
        const { data: link, error: linkErr } = await supabase
          .from("package_items")
          .select("package_id")
          .eq("ledger_id", fileId)
          .maybeSingle()

        if (linkErr) console.error("useWorkspacePath: package_items lookup failed:", linkErr)

        if (!link?.package_id) {
          if (mounted) setPath([fileName])
          return
        }

        // 3) package name
        const { data: pkg, error: pkgErr } = await supabase
          .from("packages")
          .select("name, program_id")
          .eq("id", link.package_id)
          .maybeSingle()

        if (pkgErr) console.error("useWorkspacePath: packages lookup failed:", pkgErr)

        const pkgName = (pkg?.name ?? "").trim()

        // guard package belongs to this program
        const pkgValidProgram =
          pkg?.program_id == null ? true : Number(pkg.program_id) === Number(programId)

        if (!pkgName || !pkgValidProgram) {
          if (mounted) setPath([fileName])
          return
        }

        if (mounted) setPath([pkgName, fileName])
        return
      }

      // fallback
      if (mounted) setPath([])
    }

    load()

    return () => {
      mounted = false
    }
  }, [mode, programId, fileId])

  return path
}
