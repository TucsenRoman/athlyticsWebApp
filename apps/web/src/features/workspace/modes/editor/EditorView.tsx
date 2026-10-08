// src/features/workspace/modes/editor/EditorView.tsx
"use client"

import * as React from "react"
import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/integrations/supabase/client"

import EditorFooter from "./EditorFooter"

// Keep your existing sheet import for now (you can rename the folder/module later)
import TableSheet from "@/features/ledger/sheet/TableSheet"

import type { Tables } from "@/types/supabase"

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

type FileRow = Tables<"files">
type TableColumnRow = Tables<"table_columns">
type TableRowRow = Tables<"table_rows">
type TableRouteRow = Tables<"table_routes">

type FileTab = { id: string; name: string }

type EditorViewProps = {
  programId: number
  fileId: string
  setFileId: (id: string) => void
  searchQuery: string
  setSearchQuery: (q: string) => void
}

/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT                                                             */
/* -------------------------------------------------------------------------- */

export default function EditorView({
  programId,
  fileId,
  setFileId,
  searchQuery,
  setSearchQuery: _setSearchQuery,
}: EditorViewProps) {
  const [fileRow, setFileRow] = useState<FileRow | null>(null)
  const [headers, setHeaders] = useState<TableColumnRow[]>([])
  const [entries, setEntries] = useState<TableRowRow[]>([])
  const [routes, setRoutes] = useState<TableRouteRow[]>([])
  const [loading, setLoading] = useState(false)

  // All files for this program
  const [allFiles, setAllFiles] = useState<FileTab[]>([])

  // UI: open tabs
  const [openFiles, setOpenFiles] = useState<FileTab[]>([])

  /* ---------------------------------------------------------------------- */
  /* LOAD ALL FILES FOR PROGRAM                                             */
  /* ---------------------------------------------------------------------- */
  useEffect(() => {
    let mounted = true
    if (!programId) return

    ;(async () => {
      const { data, error } = await supabase
        .from("files")
        .select("id, name")
        .eq("program_id", programId)
        .order("created_at", { ascending: true })

      if (!mounted) return

      if (error) {
        console.error("Editor: failed to load files:", error)
        setAllFiles([])
        return
      }

      setAllFiles(
        (data ?? []).map((r) => ({
          id: r.id,
          name: r.name ?? "Untitled",
        }))
      )
    })()

    return () => {
      mounted = false
    }
  }, [programId])

  /* ---------------------------------------------------------------------- */
  /* SYNC ACTIVE FILE → OPEN TABS                                            */
  /* ---------------------------------------------------------------------- */
  useEffect(() => {
    if (!fileId) return
    const found = allFiles.find((f) => f.id === fileId)
    if (!found) return

    setOpenFiles((prev) => (prev.some((x) => x.id === found.id) ? prev : [...prev, found]))
  }, [fileId, allFiles])

  /* ---------------------------------------------------------------------- */
  /* ROUTES                                                                  */
  /* ---------------------------------------------------------------------- */
  const loadRoutes = useCallback(async () => {
    if (!fileId) return

    const { data, error } = await supabase
      .from("table_routes")
      .select("*")
      .or(`source_file_id.eq.${fileId},target_file_id.eq.${fileId}`)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Editor: failed to load routes:", error)
      setRoutes([])
      return
    }

    setRoutes((data ?? []) as any)
  }, [fileId])

  /* ---------------------------------------------------------------------- */
  /* LOAD ACTIVE FILE DATA                                                   */
  /* ---------------------------------------------------------------------- */
  useEffect(() => {
    let mounted = true

    if (!fileId) {
      setFileRow(null)
      setHeaders([])
      setEntries([])
      setRoutes([])
      return
    }

    ;(async () => {
      setLoading(true)

      // file
      const { data: fileData, error: fileErr } = await supabase
        .from("files")
        .select("*")
        .eq("id", fileId)
        .maybeSingle()

      if (!mounted) return

      if (fileErr) console.error("Editor: files lookup failed:", fileErr)
      setFileRow((fileData as any) ?? null)

      // columns (headers)
      const { data: headerData, error: headerErr } = await supabase
        .from("table_columns")
        .select("*")
        .eq("file_id", fileId)
        .order("order_index", { ascending: true })

      if (!mounted) return

      if (headerErr) {
        console.error("Editor: failed to load headers:", headerErr)
        setHeaders([])
      } else {
        setHeaders((headerData ?? []) as any)
      }

      // rows (entries)
      const { data: entryData, error: entryErr } = await supabase
        .from("table_rows")
        .select("*")
        .eq("file_id", fileId)
        .order("created_at", { ascending: true })

      if (!mounted) return

      if (entryErr) {
        console.error("Editor: failed to load entries:", entryErr)
        setEntries([])
      } else {
        setEntries((entryData ?? []) as any)
      }

      await loadRoutes()

      if (!mounted) return
      setLoading(false)
    })()

    return () => {
      mounted = false
    }
  }, [fileId, loadRoutes])

  /* ---------------------------------------------------------------------- */
  /* CRUD HELPERS                                                            */
  /* ---------------------------------------------------------------------- */

  const reloadHeaders = useCallback(async () => {
    if (!fileId) return

    const { data, error } = await supabase
      .from("table_columns")
      .select("*")
      .eq("file_id", fileId)
      .order("order_index", { ascending: true })

    if (error) {
      console.error("Editor: reloadHeaders failed:", error)
      return
    }

    setHeaders((data ?? []) as any)
  }, [fileId])

  const reloadEntries = useCallback(async () => {
    if (!fileId) return

    const { data, error } = await supabase
      .from("table_rows")
      .select("*")
      .eq("file_id", fileId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Editor: reloadEntries failed:", error)
      return
    }

    setEntries((data ?? []) as any)
  }, [fileId])

  const handleCreateFile = useCallback(async () => {
    if (!programId) return

    const newName = `New File ${allFiles.length + 1}`

    const { data, error } = await supabase
      .from("files")
      .insert({
        name: newName,
        program_id: programId,
        type: "table",
      })
      .select("id, name")
      .maybeSingle()

    if (error) {
      console.error("Editor: create file failed:", error)
      return
    }

    const created: FileTab = { id: data!.id, name: data!.name ?? newName }
    setAllFiles((prev) => [...prev, created])
    setOpenFiles((prev) => [...prev, created])
    setFileId(created.id)
  }, [programId, allFiles.length, setFileId])

  const handleDeleteFile = useCallback(
    async (id: string) => {
      if (!id) return

      const { error } = await supabase.from("files").delete().eq("id", id)
      if (error) {
        console.error("Editor: delete file failed:", error)
        return
      }

      const remaining = allFiles.filter((f) => f.id !== id)
      setAllFiles(remaining)
      setOpenFiles((prev) => prev.filter((f) => f.id !== id))

      if (fileId === id) {
        const next = remaining[remaining.length - 1]
        setFileId(next?.id ?? "")
      }
    },
    [allFiles, fileId, setFileId]
  )

  const handleCloseTab = useCallback(
    (id: string) => {
      setOpenFiles((prev) => {
        const filtered = prev.filter((f) => f.id !== id)

        if (fileId === id) {
          const next = filtered[filtered.length - 1]
          setFileId(next?.id ?? "")
        }

        return filtered
      })
    },
    [fileId, setFileId]
  )

  /* ---------------------------------------------------------------------- */
  /* UI FLAGS                                                                */
  /* ---------------------------------------------------------------------- */

  const noFileSelected = !fileId
  const fileMissing = !!fileId && !fileRow && !loading

  /* ---------------------------------------------------------------------- */
  /* RENDER                                                                  */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="flex flex-col flex-1 h-[calc(100dvh)] min-h-0 w-full">
      {/* MAIN AREA */}
      <div className="flex-1 min-h-0 overflow-hidden pl-6 pr-1 pt-2">
        {noFileSelected ? (
          <div className="flex items-center justify-center h-full text-[var(--text)]">
            No file selected.
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center h-full text-[var(--text)]">
            Loading...
          </div>
        ) : fileMissing ? (
          <div className="flex items-center justify-center h-full text-[var(--text)]">
            File not found.
          </div>
        ) : (
          <div className="h-full min-h-0 overflow-hidden rounded-2xl border border-[var(--gray-18)] bg-[var(--gray-20)]">
            <TableSheet
              tableId={fileId}
              headers={headers as any}
              entries={entries as any}
              setEntries={setEntries as any}
              reloadHeaders={reloadHeaders}
              reloadEntries={reloadEntries}
              routes={routes as any}
              reloadRoutes={loadRoutes}
              searchQuery={searchQuery}
            />
          </div>
        )}
      </div>

      <div className="px-6">
        {/* FOOTER */}
        <EditorFooter
          programId={programId}
          openFiles={openFiles}
          activeFileId={fileId}
          setActiveFileId={(id) => setFileId(id)}
          onCreateFile={handleCreateFile}
          onSelectFile={(id) => setFileId(id)}
          onCloseTab={handleCloseTab}
          onManageRoutes={() => console.log("manage routes")}
          onSettings={() => console.log("settings")}
          onDeleteFile={handleDeleteFile}
        />
      </div>
    </div>
  )
}
