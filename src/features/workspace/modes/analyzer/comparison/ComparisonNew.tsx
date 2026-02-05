// src/features/workspace/modes/analyzer/comparison/ComparisonNew.tsx
"use client"

import * as React from "react"
import { useEffect, useMemo, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { cn } from "@/utils/utils"
import { Button, Divider } from "@/components/ui"
import { Input } from "@/components/ui/forms/input"

import {
  X,
  Plus,
  Search,
  RotateCw,
  Scale,
  FileSpreadsheet,
  FileText,
  FileCheck,
  Boxes,
  ArrowLeft,
} from "lucide-react"

import type { Tables, Enums } from "@/types/supabase"

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

type FileRow = Tables<"files">
type FileType = Enums<"file_type">
type FileStatus = Enums<"file_status">

type ComparisonNewProps = {
  programId: number
  demoMode: boolean
  className?: string
}

type DatasetRef = {
  id: string
  name: string
  type: FileType
  status: FileStatus
  created_at: string
  updated_at: string | null
}

type DatasetKind = "any" | "table" | "form" | "doc" | "pdf" | "other"

/* -------------------------------------------------------------------------- */
/* SMALL UI                                                                   */
/* -------------------------------------------------------------------------- */

function Pill({
  icon,
  label,
  onClick,
  title,
}: {
  icon: React.ReactNode
  label: string
  onClick?: () => void
  title?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "h-8 px-3 rounded-full",
        "border border-[var(--gray-18)] hover:border-[var(--gray-17)]",
        "bg-white/0 hover:bg-white/5",
        "inline-flex items-center gap-2",
        "text-xs text-[var(--text)] hover:text-[var(--text-lt)]",
        "transition"
      )}
    >
      {icon}
      <span className="font-semibold">{label}</span>
    </button>
  )
}

function Chip({
  label,
  onRemove,
}: {
  label: string
  onRemove: () => void
}) {
  return (
    <div
      className={cn(
        "h-7 px-3 rounded-full",
        "bg-white/6 border border-white/10",
        "text-xs text-white/75",
        "inline-flex items-center gap-2"
      )}
      title={label}
    >
      <span className="max-w-[180px] truncate">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        className="text-white/60 hover:text-white/90 transition"
        aria-label="Remove"
        title="Remove"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

function datasetIcon(type: FileType) {
  // Keep this conservative: map common ones, otherwise generic.
  if (type === "table") return <FileSpreadsheet className="h-4 w-4" />
  if (type === "form") return <FileCheck className="h-4 w-4" />
  if (type === "doc") return <FileText className="h-4 w-4" />
  if (type === "pdf") return <FileText className="h-4 w-4" />
  return <Boxes className="h-4 w-4" />
}

function prettyType(type: FileType) {
  if (type === "table") return "Table"
  if (type === "form") return "Form"
  if (type === "doc") return "Doc"
  if (type === "pdf") return "PDF"
  return "Dataset"
}

function fmtUpdated(ds: DatasetRef) {
  const t = ds.updated_at ?? ds.created_at
  const ms = new Date(t).getTime()
  if (!Number.isFinite(ms)) return ""
  return `Updated ${new Date(ms).toLocaleDateString()}`
}

/* -------------------------------------------------------------------------- */
/* MAIN                                                                       */
/* -------------------------------------------------------------------------- */

export default function ComparisonNew({
  programId,
  demoMode,
  className,
}: ComparisonNewProps) {
  void demoMode

  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [allDatasets, setAllDatasets] = useState<DatasetRef[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // picker controls
  const [query, setQuery] = useState("")
  const [kind, setKind] = useState<DatasetKind>("any")
  const [hideArchived, setHideArchived] = useState(true)
  const [hideDeleted, setHideDeleted] = useState(true)

  const canCompare = selectedIds.length >= 2

  const fetchDatasets = useCallback(async () => {
    setLoading(true)
    setErrorMsg(null)

    try {
      const { data, error } = await supabase
        .from("files")
        .select("id, name, type, status, created_at, updated_at")
        .eq("program_id", programId)
        .order("updated_at", { ascending: false })

      if (error) {
        setErrorMsg(error.message)
        setAllDatasets([])
        return
      }

      const rows = (data ?? []) as FileRow[]

      const mapped: DatasetRef[] = rows.map((r) => ({
        id: r.id,
        name: (r.name ?? "").trim() || "Untitled dataset",
        type: (r.type ?? "table") as FileType,
        status: ((r.status ?? "active") as unknown) as FileStatus,
        created_at: (r.created_at ?? new Date().toISOString()) as string,
        updated_at: (r.updated_at ?? null) as string | null,
      }))

      setAllDatasets(mapped)
    } finally {
      setLoading(false)
    }
  }, [programId])

  useEffect(() => {
    fetchDatasets()
  }, [fetchDatasets])

  const addDataset = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
  }

  const removeDataset = (id: string) => {
    setSelectedIds((prev) => prev.filter((x) => x !== id))
  }

  const clearAll = () => setSelectedIds([])

  const selectedDatasets = useMemo(() => {
    const map = new Map(allDatasets.map((d) => [d.id, d]))
    return selectedIds.map((id) => map.get(id)).filter(Boolean) as DatasetRef[]
  }, [allDatasets, selectedIds])

  const filteredAvailable = useMemo(() => {
    const q = query.trim().toLowerCase()

    return allDatasets
      .filter((d) => !selectedIds.includes(d.id))
      .filter((d) => {
        if (hideArchived && d.status === "archived") return false
        if (hideDeleted && d.status === "deleted") return false
        return true
      })
      .filter((d) => {
        if (kind === "any") return true
        if (kind === "other") {
          return d.type !== "table" && d.type !== "form" && d.type !== "doc" && d.type !== "pdf"
        }
        return d.type === kind
      })
      .filter((d) => (q ? d.name.toLowerCase().includes(q) : true))
      .sort((a, b) => {
        const ta = new Date(a.updated_at ?? a.created_at).getTime()
        const tb = new Date(b.updated_at ?? b.created_at).getTime()
        return tb - ta
      })
  }, [allDatasets, selectedIds, query, kind, hideArchived, hideDeleted])

  // Non-interactive preview for now (structure/sample placeholders)
  const renderDatasetPreview = (ds: DatasetRef) => {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs text-white/40">{prettyType(ds.type)}</div>
          <div className="text-xs text-white/40">{fmtUpdated(ds)}</div>
        </div>

        <div className="rounded-2xl border border-[var(--gray-18)] bg-white/0 overflow-hidden">
          <div className="px-3 py-2 border-b border-white/10 text-xs text-white/50">
            Structure (preview)
          </div>
          <div className="p-3 text-sm text-[var(--text)]">
            <div className="text-white/40">
              Coming next: show fields/questions for this dataset type.
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--gray-18)] bg-white/0 overflow-hidden">
          <div className="px-3 py-2 border-b border-white/10 text-xs text-white/50">
            Sample (preview)
          </div>
          <div className="p-3 text-sm text-[var(--text)]">
            <div className="text-white/40">
              Coming next: show first ~10 records/responses read-only.
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("w-full h-full min-h-0 flex flex-col gap-4", className)}>
      {/* TOP ROW */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            irregular="sm"
            onClick={() => navigate("/program/analyzer/comparisons")}
            className="rounded-2xl"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="text-[16px] font-semibold tracking-wide text-[var(--text-lt)]">
            New Comparison
          </div>

          <div className="hidden md:flex text-xs text-white/35 pl-1">
            Select 2+ datasets and view them side by side.
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchDatasets}
            className="shrink-0 p-2"
            aria-label="Refresh"
            title="Refresh"
          >
            <RotateCw
              size={16}
              className="text-[var(--text-dk)] hover:text-[var(--text)] transition-all duration-300"
            />
          </button>
        </div>
      </div>

      {/* SELECTED CHIPS */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          {selectedDatasets.map((ds) => (
            <Chip
              key={ds.id}
              label={ds.name}
              onRemove={() => removeDataset(ds.id)}
            />
          ))}

          {selectedIds.length === 0 ? (
            <div className="text-xs text-white/35">No datasets selected yet.</div>
          ) : null}
        </div>

        {selectedIds.length > 0 ? (
          <button
            type="button"
            onClick={clearAll}
            className="h-7 px-3 rounded-full border border-white/10 text-xs text-white/60 hover:text-white/85 hover:bg-white/5 transition shrink-0"
          >
            Clear
          </button>
        ) : null}
      </div>

      <Divider color="var(--gray-18)" inset={0} />

      {/* MAIN SPLIT */}
      <div className="flex-1 min-h-0 flex gap-4 overflow-hidden">
        {/* LEFT: PICKER */}
        <div
          className={cn(
            "w-[360px] shrink-0 min-h-0 overflow-hidden",
            "rounded-2xl border border-[var(--gray-18)] bg-[var(--gray-20)]"
          )}
        >
          {/* picker header */}
          <div className="px-3 py-3 border-b border-white/10 flex items-center justify-between gap-2">
            <div className="text-sm font-semibold text-[var(--text-lt)]">
              Datasets
            </div>

            <div
              className={cn(
                "flex items-center gap-2",
                "px-2 h-8 w-full max-w-[210px]",
                "rounded-full border border-[var(--gray-18)] focus-within:border-[var(--gray-17)]",
                "text-xs text-[var(--text-dk)] hover:text-[var(--text)] focus-within:text-[var(--text)]",
                "shadow-inner transition-all duration-300"
              )}
            >
              <Search className="h-4 w-4" />
              <Input
                tabIndex={-1}
                className="p-0 pb-[2px] border-0 bg-transparent text-sm truncate focus-visible:ring-0"
                placeholder="Search datasets..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          {/* picker controls */}
          <div className="px-3 py-3 flex flex-col gap-2 border-b border-white/10">
            <div className="flex items-center gap-2 flex-wrap">
              <Pill
                icon={<Boxes className="h-4 w-4 opacity-80" />}
                label={kind === "any" ? "Any" : "Any"}
                onClick={() => setKind("any")}
                title="Any type"
              />
              <Pill
                icon={<FileSpreadsheet className="h-4 w-4 opacity-80" />}
                label="Tables"
                onClick={() => setKind("table")}
                title="Tables"
              />
              <Pill
                icon={<FileCheck className="h-4 w-4 opacity-80" />}
                label="Forms"
                onClick={() => setKind("form")}
                title="Forms"
              />
              <Pill
                icon={<FileText className="h-4 w-4 opacity-80" />}
                label="Docs"
                onClick={() => setKind("doc")}
                title="Docs"
              />
              <Pill
                icon={<FileText className="h-4 w-4 opacity-80" />}
                label="PDFs"
                onClick={() => setKind("pdf")}
                title="PDFs"
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-white/45">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hideArchived}
                  onChange={(e) => setHideArchived(e.target.checked)}
                />
                Hide archived
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hideDeleted}
                  onChange={(e) => setHideDeleted(e.target.checked)}
                />
                Hide deleted
              </label>
            </div>
          </div>

          {/* picker list */}
          <div className="min-h-0 overflow-y-auto p-3 pb-4 scrollbar">
            {errorMsg ? (
              <div className="p-3 text-sm text-red-200/80">{errorMsg}</div>
            ) : null}

            {loading ? (
              <div className="p-3 text-sm text-[var(--text)]">Loading…</div>
            ) : filteredAvailable.length === 0 ? (
              <div className="p-3 text-sm text-white/45">No matches</div>
            ) : (
              <div className="flex flex-col gap-2">
                {filteredAvailable.map((ds) => (
                  <div
                    key={ds.id}
                    className={cn(
                      "rounded-2xl border border-[var(--gray-18)]",
                      "bg-white/0 hover:bg-white/5 transition-colors",
                      "px-3 py-2",
                      "flex items-center gap-3"
                    )}
                  >
                    <div className="shrink-0 text-white/70">
                      {datasetIcon(ds.type)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold text-[var(--text-lt)]">
                        {ds.name}
                      </div>
                      <div className="mt-0.5 flex items-center justify-between gap-3 text-xs text-white/40">
                        <div className="truncate">{prettyType(ds.type)}</div>
                        <div className="shrink-0">{fmtUpdated(ds)}</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => addDataset(ds.id)}
                      className={cn(
                        "h-9 w-9 rounded-full",
                        "bg-white/4 hover:bg-white/8",
                        "border border-white/10",
                        "text-white/60 hover:text-white/90",
                        "inline-flex items-center justify-center transition"
                      )}
                      aria-label="Add dataset"
                      title="Add"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: PREVIEW STRIP */}
        <div className="flex-1 min-h-0 overflow-hidden rounded-2xl border border-[var(--gray-18)] bg-[var(--gray-20)]">
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="text-sm font-semibold text-[var(--text-lt)]">
                Preview
              </div>
              <div className="text-xs text-white/40">
                {canCompare
                  ? `${selectedIds.length} datasets selected`
                  : "Select at least 2 datasets"}
              </div>
            </div>

            <div className="shrink-0 inline-flex items-center gap-2 text-xs text-white/45">
              <Scale className="h-4 w-4 opacity-80" />
              Side-by-side (read-only)
            </div>
          </div>

          <div className="min-h-0 h-full overflow-hidden">
            {!canCompare ? (
              <div className="p-6 text-sm text-white/45">
                Pick <span className="text-white/70 font-semibold">2 or more</span> datasets from the left.
              </div>
            ) : (
              <div className="h-full min-h-0 overflow-x-auto overflow-y-auto pr-2">
                <div className="p-4 min-w-max">
                  <div className="flex gap-3 items-start">
                    {selectedDatasets.map((ds) => (
                      <div
                        key={ds.id}
                        className={cn(
                          "w-[420px] shrink-0 overflow-hidden",
                          "rounded-2xl border border-[var(--gray-18)] bg-white/0"
                        )}
                      >
                        {/* card header */}
                        <div className="px-4 py-3 flex items-center justify-between border-b border-white/10">
                          <div className="min-w-0">
                            <div className="truncate font-semibold text-[var(--text-lt)]">
                              {ds.name}
                            </div>
                            <div className="text-xs text-white/40">
                              {prettyType(ds.type)} • {fmtUpdated(ds)}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeDataset(ds.id)}
                            className={cn(
                              "h-9 w-9 rounded-full",
                              "bg-white/4 hover:bg-white/8",
                              "border border-white/10",
                              "text-white/70 hover:text-white/90",
                              "inline-flex items-center justify-center transition"
                            )}
                            aria-label="Remove dataset"
                            title="Remove"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>

                        {/* card body */}
                        <div className="p-4">{renderDatasetPreview(ds)}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 text-xs text-white/35">
                    Next step: compute “diff” views (field match, missing fields, summary stats) once dataset readers are added per type.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
