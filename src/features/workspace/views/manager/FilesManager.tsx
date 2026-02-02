"use client"

import * as React from "react"
import { useEffect, useMemo, useState } from "react"
import { cn } from "@/utils/utils"
import { supabase } from "@/integrations/supabase/client"

import { Button, Divider } from "@/components/ui"
import type { Tables, Enums } from "@/types/supabase"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/navigation/tabs"
import { Input } from "@/components/ui/forms/input"

import {
  FileSpreadsheet,
  Search,
  Clock,
  Plus,
  X,
  Trash2,
  Archive,
  RotateCcw,
  RefreshCw,
  AArrowDown,
  RotateCw,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

type FileStatus = Enums<"file_status">
type FileType = Enums<"file_type">
type FileRow = Tables<"files">

type FilesListRow = Pick<
  FileRow,
  "id" | "name" | "status" | "type" | "created_at" | "updated_at"
>

type FilterMode = "recent" | "alpha_desc" | "tables" | "archived" | "deleted"

type ManagerItem = {
  id: string
  name: string
  updatedAt: string
  status: FileStatus
  type: FileType
}

type FilesManagerHeaderProps = {
  query: string
  onQueryChange: (next: string) => void
}

type FilesManagerProps = {
  programId: number
  query: string
}

/* -------------------------------------------------------------------------- */
/* SMALL UI (local to Files Manager)                                          */
/* -------------------------------------------------------------------------- */

function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode
  tone?: "neutral" | "warn" | "danger"
}) {
  const toneClass =
    tone === "danger"
      ? "bg-red-500/10 border-red-500/20 text-red-200/80"
      : tone === "warn"
        ? "bg-amber-500/10 border-amber-500/20 text-amber-200/80"
        : "bg-white/6 border-white/10 text-white/70"

  return (
    <div
      className={cn(
        "h-6 px-2 rounded-full",
        "border",
        "text-xs",
        "inline-flex items-center",
        toneClass
      )}
    >
      {children}
    </div>
  )
}

function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean
  title: string
  children: React.ReactNode
  onClose: () => void
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[80]">
      <button
        type="button"
        className="absolute inset-0 bg-black/55"
        onClick={onClose}
        aria-label="Close dialog"
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          className={cn(
            "w-full max-w-[520px]",
            "rounded-2xl border border-[var(--gray-18)]",
            "bg-[#141414]",
            "shadow-[0_20px_60px_rgba(0,0,0,0.55)]",
            "overflow-hidden"
          )}
        >
          <div className="px-5 py-4 flex items-center justify-between border-b border-white/10">
            <div className="text-sm font-semibold text-[var(--text-lt)]">{title}</div>
            <button
              type="button"
              onClick={onClose}
              className={cn(
                "h-9 w-9 rounded-full",
                "bg-white/4 hover:bg-white/8",
                "border border-white/10",
                "text-white/70 hover:text-white/90",
                "transition inline-flex items-center justify-center"
              )}
              aria-label="Close"
              title="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-5">{children}</div>
        </div>
      </div>
    </div>
  )
}

function ChoiceTile({
  icon,
  title,
  subtitle,
  onClick,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left",
        "rounded-2xl border border-[var(--gray-18)]",
        "bg-white/0 hover:bg-white/5 transition-colors",
        "px-4 py-3",
        "flex items-center gap-3"
      )}
    >
      <div
        className={cn(
          "h-10 w-10 rounded-2xl",
          "bg-white/6 border border-white/10",
          "flex items-center justify-center",
          "text-white/75"
        )}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <div className="font-semibold text-[var(--text-lt)]">{title}</div>
        <div className="mt-0.5 text-xs text-white/40">{subtitle}</div>
      </div>

      <Plus className="h-5 w-5 text-white/35" />
    </button>
  )
}

function ItemRow({
  title,
  metaLeft,
  metaRight,
  badge,
  actions,
  onClick,
}: {
  title: string
  metaLeft?: string
  metaRight?: string
  badge?: React.ReactNode
  actions?: React.ReactNode
  onClick?: () => void
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3",
        "rounded-2xl border border-[var(--gray-18)]",
        "bg-white/0 hover:bg-white/5 transition-colors",
        "px-4 py-3"
      )}
    >
      <div className="shrink-0 text-white/70">
        <FileSpreadsheet className="h-5 w-5" />
      </div>

      <button
        type="button"
        onClick={onClick}
        className="min-w-0 flex-1 text-left"
        title={title}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="truncate font-semibold text-[var(--text-lt)]">{title}</div>
          {badge ? <div className="shrink-0">{badge}</div> : null}
        </div>

        {(metaLeft || metaRight) && (
          <div className="mt-0.5 flex items-center justify-between gap-3 text-xs text-white/40">
            <div className="truncate">{metaLeft ?? ""}</div>
            <div className="shrink-0">{metaRight ?? ""}</div>
          </div>
        )}
      </button>

      {actions ? <div className="shrink-0 flex items-center gap-1">{actions}</div> : null}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* EXPORTS                                                                    */
/* -------------------------------------------------------------------------- */

export function FilesManagerHeader({ query, onQueryChange }: FilesManagerHeaderProps) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="
          flex items-center gap-2
          px-2 w-full max-w-[220px] h-8
          rounded-full border border-[var(--gray-18)] focus-within:border-[var(--gray-17)]
          text-xs text-[var(--text-dk)] hover:text-[var(--text)] focus-within:text-[var(--text)]
          shadow-inner transition-all duration-300
        "
      >
        <Search className="h-4 w-4" />
        <Input
          tabIndex={-1}
          className="p-0 pb-[2px] border-0 bg-transparent text-sm truncate focus-visible:ring-0"
          placeholder="Search tables..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
      </div>
    </div>
  )
}

export default function FilesManager({ programId, query }: FilesManagerProps) {
  const [filter, setFilter] = useState<FilterMode>("recent")
  const [addOpen, setAddOpen] = useState(false)

  const [items, setItems] = useState<ManagerItem[]>([])
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const navigate = useNavigate()

  const RECENT_DAYS = 14
  const isRecent = (updatedAt: string) => {
    const t = new Date(updatedAt).getTime()
    if (!Number.isFinite(t)) return false
    const ms = RECENT_DAYS * 24 * 60 * 60 * 1000
    return Date.now() - t <= ms
  }

  const normalizeStatus = (s: FileRow["status"]): FileStatus =>
    ((s ?? "active") as FileStatus)

  const normalizeUpdatedAt = (updatedAt: FileRow["updated_at"], createdAt: FileRow["created_at"]) =>
    updatedAt ?? createdAt

  async function fetchTables() {
    setLoading(true)
    setErrorMsg(null)

    try {
      const { data, error } = await supabase
        .from("files")
        .select("id, name, status, type, created_at, updated_at")
        .eq("program_id", programId)
        .eq("type", "table")
        .order("updated_at", { ascending: false })

      if (error) {
        setErrorMsg(error.message)
        return
      }

      const rows = (data ?? []) as FilesListRow[]

      const mapped: ManagerItem[] = rows.map((r) => ({
        id: r.id,
        name: (r.name ?? "").trim() || "Untitled table",
        updatedAt: normalizeUpdatedAt(r.updated_at, r.created_at),
        status: normalizeStatus(r.status),
        type: r.type,
      }))

      setItems(mapped)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTables()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programId])

  async function setStatus(fileId: string, status: FileStatus) {
    setErrorMsg(null)

    const { error } = await supabase
      .from("files")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", fileId)

    if (error) {
      setErrorMsg(error.message)
      return
    }

    fetchTables()
  }

  async function createTable() {
    setErrorMsg(null)

    const { data: created, error: createErr } = await supabase
      .from("files")
      .insert({
        program_id: programId,
        type: "table",
        status: "active",
        name: "Untitled table",
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single()

    if (createErr || !created?.id) {
      setErrorMsg(createErr?.message ?? "Failed to create table.")
      return
    }

    const fileId = created.id as string

    const { error: colsErr } = await supabase.from("table_columns").insert([
      { file_id: fileId, name: "Name", type: "text", order_index: 0 },
      { file_id: fileId, name: "Notes", type: "text", order_index: 1 },
    ])

    if (colsErr) {
      setErrorMsg(colsErr.message)
    }

    setAddOpen(false)
    setFilter("recent")
    fetchTables()
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = items.slice()

    // FILTER (tabs)
    list = list.filter((x) => {
      if (filter === "recent") return x.status === "active"
      if (filter === "alpha_desc") return x.status === "active"
      if (filter === "archived") return x.status === "archived"
      if (filter === "deleted") return x.status === "deleted"
      return true
    })


    if (q) list = list.filter((x) => x.name.toLowerCase().includes(q))

    // SORT
    const timeKey = (x: ManagerItem) => new Date(x.updatedAt).getTime()
    const nameKey = (x: ManagerItem) => x.name.toLowerCase()

    list.sort((a, b) => {
      const ta = timeKey(a)
      const tb = timeKey(b)

      // Alphabetical tab (Z → A)
      if (filter === "alpha_desc") return nameKey(a).localeCompare(nameKey(b))

      // Everything else (Recent / Archived / Deleted) = last updated
      return tb - ta
    })

    return list
  }, [query, filter, items])

  type FilterTab = {
    value: FilterMode
    label: string
    icon: React.ElementType
    dividerLeft?: boolean
  }

  const FILTER_TABS: FilterTab[] = [
    { value: "recent", label: "Recent", icon: Clock },
    { value: "alpha_desc", label: "Alphabetical", icon: AArrowDown },
    // { value: "tables", label: "Tables", icon: FileSpreadsheet, dividerLeft: true },
    // { value: "forms", label: "Forms", icon: FileCheckCorner },
    // { value: "docs", label: "Docs", icon: FileText },
    // { value: "shared", label: "Shared", icon: UsersRound, dividerLeft: true },
    // { value: "assigned", label: "Assigned", icon: Tags },
    { value: "archived", label: "Archived", icon: Archive, dividerLeft: true },
    { value: "deleted", label: "Deleted", icon: Trash2 },
  ]

  const tabClass =
    "inline-flex items-center gap-2 px-4 text-xs rounded-full " +
    "data-[state=active]:bg-[var(--gray-18)] data-[state=active]:text-[var(--text-lt)] " +
    "data-[state=inactive]:text-[var(--text)] data-[state=inactive]:hover:text-[var(--text-lt)] data-[state=inactive]:hover:bg-[var(--gray-17)]"

  const statusBadge = (s: FileStatus) => {
    if (s === "archived") return <Badge tone="warn">Archived</Badge>
    if (s === "deleted") return <Badge tone="danger">Deleted</Badge>
    return <Badge>Table</Badge>
  }

  return (
    <>
      <div className="flex justify-between px-3">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterMode)}>
          <TabsList
            className="
              relative flex gap-2
              p-0 h-10 w-full
              overflow-x-auto md:overflow-x-hidden scrollbar-hide
              border-0 bg-transparent
            "
          >
            {FILTER_TABS.map((t) => {
              const Icon = t.icon
              return (
                <React.Fragment key={t.value}>
                  {t.dividerLeft ? (
                    <div className="mx-2 h-6 w-px bg-[var(--gray-17)] shrink-0" />
                  ) : null}

                  <TabsTrigger value={t.value} title={t.label} className={tabClass}>
                    <Icon className="h-4 w-4 opacity-80" />
                    <span>{t.label}</span>
                  </TabsTrigger>
                </React.Fragment>
              )
            })}
          </TabsList>
        </Tabs>

        <div className="shrink-0 p-2">
          <button onClick={fetchTables}>
            <RotateCw size={16} className="text-[var(--text-dk)] hover:text-[var(--text)] transition-all duration-300" />
          </button>
        </div>
      </div>

      <Divider color="var(--gray-18)" inset={5} />

      <div className="mt-1 mr-1 p-4 pb-[100px] h-full min-h-0 overflow-y-auto scrollbar">
        {errorMsg ? <div className="p-3 text-sm text-red-200/80">{errorMsg}</div> : null}

        {loading ? (
          <div className="p-3 text-sm text-[var(--text)]">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-3 text-sm text-[var(--text)]">No matches</div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((item) => {
              const updatedLabel = `Updated ${new Date(item.updatedAt).toLocaleDateString()}`

              const actions =
                item.status === "active" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setStatus(item.id, "archived")}
                      className={cn(
                        "h-9 w-9 rounded-full",
                        "bg-white/4 hover:bg-white/8",
                        "border border-white/10",
                        "text-white/60 hover:text-white/90",
                        "inline-flex items-center justify-center transition"
                      )}
                      title="Archive"
                      aria-label="Archive"
                    >
                      <Archive className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setStatus(item.id, "deleted")}
                      className={cn(
                        "h-9 w-9 rounded-full",
                        "bg-white/4 hover:bg-white/8",
                        "border border-white/10",
                        "text-white/60 hover:text-white/90",
                        "inline-flex items-center justify-center transition"
                      )}
                      title="Delete"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setStatus(item.id, "active")}
                      className={cn(
                        "h-9 w-9 rounded-full",
                        "bg-white/4 hover:bg-white/8",
                        "border border-white/10",
                        "text-white/60 hover:text-white/90",
                        "inline-flex items-center justify-center transition"
                      )}
                      title="Restore"
                      aria-label="Restore"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>

                    {item.status !== "deleted" ? (
                      <button
                        type="button"
                        onClick={() => setStatus(item.id, "deleted")}
                        className={cn(
                          "h-9 w-9 rounded-full",
                          "bg-white/4 hover:bg-white/8",
                          "border border-white/10",
                          "text-white/60 hover:text-white/90",
                          "inline-flex items-center justify-center transition"
                        )}
                        title="Delete"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : null}
                  </>
                )

              return (
                <ItemRow
                  key={item.id}
                  title={item.name}
                  metaLeft="Table"
                  metaRight={updatedLabel}
                  badge={statusBadge(item.status)}
                  actions={actions}
                  onClick={() => {
                    navigate(`/program/editor/${item.id}`)
                  }}
                />
              )
            })}
          </div>
        )}
      </div>

      <div className="absolute right-4 bottom-0 z-50 flex items-end gap-2 p-4">
        <Button
          type="button"
          variant="float"
          regular="lg"
          iconSize="lg"
          className="bg-[#394650] hover:bg-[#596f7e] text-[var(--gray-10)]"
          onClick={() => setAddOpen(true)}
          title="Add"
        >
          <Plus />
        </Button>
      </div>

      <Modal open={addOpen} title="Add table" onClose={() => setAddOpen(false)}>
        <div className="flex flex-col gap-2">
          <ChoiceTile
            icon={<FileSpreadsheet className="h-5 w-5" />}
            title="Table"
            subtitle="Spreadsheet-style table"
            onClick={createTable}
          />
        </div>
      </Modal>
    </>
  )
}
