// src/features/workspace/modes/manager/subsections/FilesManager.tsx
"use client"

import * as React from "react"
import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

import { cn } from "@/utils/utils"

// DB
import { supabase } from "@/integrations/supabase/client"
import type { Tables, Enums } from "@/types/supabase"

// UI
import {
  FileSpreadsheet,
  Search,
  Clock,
  X,
  Trash2,
  Archive,
  RotateCcw,
  AArrowDown,
  RotateCw,
  MoreVertical,
  Palette,
  Star,
  Layers,
  Plus,
  LayoutGrid,
  List,
  Pin,
  PinOff,
} from "lucide-react"
import { Button, Divider } from "@/components/ui"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/navigation/tabs"
import { Input } from "@/components/ui/forms/input"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/overlays/dropdown-menu"

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

type FileStatus = Enums<"file_status">
type FileType = Enums<"file_type">
type FileRow = Tables<"files">

export type SortMode = "recent" | "alpha_asc"
export type ViewMode = "list" | "grid"

type FilesListRow = Pick<
  FileRow,
  "id" | "name" | "status" | "type" | "created_at" | "updated_at"
> & {
  pinned?: boolean
  favorite?: boolean
  color?: string | null
}

type ManagerItem = {
  id: string
  name: string
  updatedAt: string
  status: FileStatus
  type: FileType
  pinned: boolean
  favorite: boolean
  color?: string
}

type FilterMode = "all" | "tables" | "forms" | "favorites" | "archived" | "deleted"

export type FilesManagerHeaderProps = {
  query: string
  onQueryChange: (next: string) => void
  sortMode: SortMode
  onSortChange: (next: SortMode) => void
}

export type FilesManagerProps = {
  programId: number
  query: string
  sortMode: SortMode
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

      <span className="text-white/35">
        <RotateCw className="h-5 w-5 opacity-0" />
      </span>
    </button>
  )
}

/* -------------------------------------------------------------------------- */
/* ACTIONS (ONLY ELLIPSIS)                                                    */
/* -------------------------------------------------------------------------- */

function ActionIconButton({
  title,
  onClick,
  children,
}: {
  title: string
  onClick: (e: React.MouseEvent) => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-9 w-9 rounded-full",
        "bg-white/4 hover:bg-white/8",
        "text-white/60 hover:text-white/90",
        "inline-flex items-center justify-center transition"
      )}
      title={title}
      aria-label={title}
    >
      {children}
    </button>
  )
}

function MoreMenu({
  item,
  onTogglePinned,
  onToggleFavorite,
  onSetColor,
  onSetStatus,
}: {
  item: ManagerItem
  onTogglePinned: () => void
  onToggleFavorite: () => void
  onSetColor: (color: string | null) => void
  onSetStatus: (status: FileStatus) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          // stop the row/card click, but DO NOT block the dropdown trigger
          onPointerDown={(e) => e.stopPropagation()}
          className={cn(
            "h-9 w-9 rounded-full",
            "bg-white/4 hover:bg-white/8",
            "text-white/60 hover:text-white/90",
            "inline-flex items-center justify-center transition"
          )}
          title="More"
          aria-label="More"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={onToggleFavorite} className="cursor-pointer">
          <Star className={cn("w-4 h-4 mr-2", item.favorite ? "fill-current" : "")} />
          {item.favorite ? "Unfavorite" : "Add to favorites"}
        </DropdownMenuItem>

        <DropdownMenuItem onClick={onTogglePinned} className="cursor-pointer">
          {item.pinned ? <PinOff className="w-4 h-4 mr-2" /> : <Pin className="w-4 h-4 mr-2" />}
          {item.pinned ? "Unpin" : "Pin"}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="cursor-pointer">
            <Palette className="w-4 h-4 mr-2" /> Color
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-48">
            {[
              { label: "Blue", value: "var(--fvr-blue-md)" },
              { label: "Green", value: "var(--fvr-green-md)" },
              { label: "Amber", value: "var(--fvr-yellow-md)" },
              { label: "Clear", value: null },
            ].map((c) => (
              <DropdownMenuItem
                key={c.label}
                onClick={() => onSetColor(c.value)}
                className="cursor-pointer"
              >
                <span
                  className="mr-2 inline-block h-3 w-3 rounded-full"
                  style={{ backgroundColor: c.value ?? "transparent" }}
                />
                {c.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => onSetStatus("archived")} className="cursor-pointer">
          <Archive className="w-4 h-4 mr-2" /> Archive
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => onSetStatus("deleted")}
          className="cursor-pointer text-[var(--danger)]"
        >
          <Trash2 className="w-4 h-4 mr-2" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/* -------------------------------------------------------------------------- */
/* LIST ROW                                                                   */
/* -------------------------------------------------------------------------- */

function ItemRow({
  title,
  metaLeft,
  badge,
  actions,
  onClick,
  color,
  pinned,
  favorite,
}: {
  title: string
  metaLeft?: string
  badge?: React.ReactNode
  actions?: React.ReactNode
  onClick?: () => void
  color?: string
  pinned?: boolean
  favorite?: boolean
}) {
  return (
    <div
      className={cn(
        "relative",
        "flex items-center gap-3",
        "rounded-2xl border border-[var(--gray-18)]",
        "bg-[var(--gray-19)] hover:bg-[var(--gray-18)] transition-colors",
        "px-4 py-3 h-14"
      )}
    >
      <div
        className="h-6 w-[3px] rounded-full shrink-0"
        style={{ backgroundColor: color ?? "transparent" }}
      />

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

        {favorite ? (
          <Star className="h-3.5 w-3.5 shrink-0 text-[var(--fvr-yellow-md)] fill-current" />
        ) : null}

        {badge ? <div className="shrink-0">{badge}</div> : null}
      </div>

        {metaLeft ? (
          <div className="mt-0.5 flex items-center justify-between gap-3 text-xs text-white/40">
            <div className="truncate">{metaLeft}</div>
            <div className="shrink-0" />
          </div>
        ) : null}
      </button>

      {actions ? (
        <div className="shrink-0 flex items-center gap-1">
          {actions}
        </div>
      ) : null}
      <div>
        {pinned ? <Pin className="absolute top-[6px] right-[6px] h-3.5 w-3.5 text-[var(--fvr-slate)] fill-current rotate-45" /> : null}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* GRID CARD                                                                  */
/* -------------------------------------------------------------------------- */

function ItemCard({
  title,
  metaLeft,
  badge,
  actions,
  onClick,
  color,
  pinned,
  favorite,
}: {
  title: string
  metaLeft?: string
  badge?: React.ReactNode
  actions?: React.ReactNode
  onClick?: () => void
  color?: string
  pinned?: boolean
  favorite?: boolean
}) {
  const showIndicators = !!pinned || !!favorite

  return (
    <div
      className={cn(
        "relative",
        "rounded-2xl border border-[var(--gray-18)]",
        "bg-[var(--gray-19)] hover:bg-[var(--gray-18)] transition-colors",
        "h-[100px] p-3"
      )}
    >
      {/* TOP-LEFT: pin + star indicators */}
      {showIndicators ? (
        <div className="absolute left-2 top-2 flex items-center gap-2">
          {pinned ? <Pin className="h-3 w-3 text-[var(--fvr-slate)] fill-current rotate-45" /> : null}
          {favorite ? <Star className="h-3 w-3 text-[var(--fvr-yellow-md)] fill-current" /> : null}
        </div>
      ) : null}

      {/* TOP-RIGHT: ellipsis menu */}
      <div className="absolute right-2 top-2 z-10">{actions}</div>

      {/* content grid: middle + bottom */}
      <button
        type="button"
        onClick={onClick}
        className={cn("w-full h-full text-left", "grid grid-rows-[1fr_auto]")}
        title={title}
      >
        {/* center row */}
        <div className="flex items-center justify-center gap-3 min-w-0">
          <div
            className="h-6 w-[4px] rounded-full shrink-0"
            style={{ backgroundColor: color ?? "transparent" }}
          />
          <div className="text-white/75 shrink-0">
            <FileSpreadsheet className="h-5 w-5" />
          </div>
          <div className="truncate font-semibold text-[var(--text-lt)] min-w-0 max-w-[220px]">
            {title}
          </div>
        </div>

        {/* bottom row */}
        <div className="text-[11px] text-white/45 truncate w-full text-center leading-tight">
          {metaLeft ?? ""}
        </div>
      </button>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* HEADER (exported for ManagerView)                                          */
/* -------------------------------------------------------------------------- */

export function FilesManagerHeader({
  query,
  onQueryChange,
  sortMode,
  onSortChange,
}: FilesManagerHeaderProps) {
  return (
    <div className="flex items-center gap-2">
      {/* SEARCH */}
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
          placeholder="Search files..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
      </div>

      {/* SORT */}
      <div
        className="flex items-center gap-1 mr-1 h-8 rounded-full border border-[var(--gray-18)] p-1 shadow-inner"
        title="Sort"
      >
        <button
          type="button"
          onClick={() => onSortChange("recent")}
          className={[
            "h-6 w-8 rounded-full grid place-items-center transition-all duration-300",
            sortMode === "recent"
              ? "bg-[var(--gray-18)] text-[var(--text-lt)]"
              : "hover:bg-[var(--gray-17)] text-[var(--text)] hover:text-[var(--text-lt)]",
          ].join(" ")}
          aria-pressed={sortMode === "recent"}
          title="Recent"
        >
          <Clock className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => onSortChange("alpha_asc")}
          className={[
            "h-6 w-8 rounded-full grid place-items-center transition-all duration-300",
            sortMode === "alpha_asc"
              ? "bg-[var(--gray-18)] text-[var(--text-lt)]"
              : "hover:bg-[var(--gray-17)] text-[var(--text)] hover:text-[var(--text-lt)]",
          ].join(" ")}
          aria-pressed={sortMode === "alpha_asc"}
          title="Alphabetical"
        >
          <AArrowDown className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* MAIN                                                                       */
/* -------------------------------------------------------------------------- */

export default function FilesManager({ programId, query, sortMode }: FilesManagerProps) {
  const [filter, setFilter] = useState<FilterMode>("all")
  const [addOpen, setAddOpen] = useState(false)

  const [items, setItems] = useState<ManagerItem[]>([])
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [viewMode, setViewMode] = useState<ViewMode>("list")

  const navigate = useNavigate()

  const normalizeStatus = (s: FileRow["status"]): FileStatus => ((s ?? "active") as FileStatus)
  const normalizeUpdatedAt = (updatedAt: FileRow["updated_at"], createdAt: FileRow["created_at"]) =>
    updatedAt ?? createdAt

  const formatUpdatedMeta = (iso: string) => {
    const d = new Date(iso)
    const date = d.toLocaleDateString()
    const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    return `Updated ${date} • ${time}`
  }

  async function togglePinned(fileId: string, next: boolean) {
    setErrorMsg(null)
    setItems((prev) => prev.map((x) => (x.id === fileId ? { ...x, pinned: next } : x)))

    const { error } = await supabase
      .from("files")
      .update({ pinned: next, updated_at: new Date().toISOString() })
      .eq("id", fileId)

    if (error) {
      setItems((prev) => prev.map((x) => (x.id === fileId ? { ...x, pinned: !next } : x)))
      setErrorMsg(error.message)
    }
  }

  async function toggleFavorite(fileId: string, next: boolean) {
    setErrorMsg(null)
    setItems((prev) => prev.map((x) => (x.id === fileId ? { ...x, favorite: next } : x)))

    const { error } = await supabase
      .from("files")
      .update({ favorite: next, updated_at: new Date().toISOString() })
      .eq("id", fileId)

    if (error) {
      setItems((prev) => prev.map((x) => (x.id === fileId ? { ...x, favorite: !next } : x)))
      setErrorMsg(error.message)
    }
  }

  async function setColor(fileId: string, color: string | null) {
    setErrorMsg(null)
    setItems((prev) => prev.map((x) => (x.id === fileId ? { ...x, color: color ?? undefined } : x)))

    const { error } = await supabase
      .from("files")
      .update({ color, updated_at: new Date().toISOString() })
      .eq("id", fileId)

    if (error) {
      setErrorMsg(error.message)
      fetchFiles()
    }
  }

  async function setStatus(fileId: string, status: FileStatus) {
    setErrorMsg(null)
    setItems((prev) => prev.map((x) => (x.id === fileId ? { ...x, status } : x)))

    const { error } = await supabase
      .from("files")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", fileId)

    if (error) {
      setErrorMsg(error.message)
      fetchFiles()
    }
  }

  async function fetchFiles() {
    setLoading(true)
    setErrorMsg(null)

    try {
      const { data, error } = await supabase
        .from("files")
        .select("id, name, status, type, created_at, updated_at, pinned, favorite, color")
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
        pinned: !!r.pinned,
        favorite: !!r.favorite,
        color: r.color ?? undefined,
      }))

      setItems(mapped)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFiles()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programId])

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
      .select("id, name, status, type, created_at, updated_at, pinned, favorite, color")
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

    if (colsErr) setErrorMsg(colsErr.message)

    setItems((prev) => [
      {
        id: created.id,
        name: (created.name ?? "").trim() || "Untitled table",
        updatedAt: normalizeUpdatedAt(created.updated_at, created.created_at),
        status: normalizeStatus(created.status),
        type: created.type,
        pinned: !!created.pinned,
        favorite: !!created.favorite,
        color: (created as any).color ?? undefined,
      },
      ...prev,
    ])

    setAddOpen(false)
    setFilter("all")
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = items.slice()

    list = list.filter((x) => {
      if (filter === "archived") return x.status === "archived"
      if (filter === "deleted") return x.status === "deleted"

      if (x.status !== "active") return false

      if (filter === "favorites") return x.favorite
      if (filter === "tables") return x.type === "table"
      if (filter === "forms") return x.type === ("form" as any)
      return true
    })

    if (q) list = list.filter((x) => x.name.toLowerCase().includes(q))

    const timeKey = (x: ManagerItem) => new Date(x.updatedAt).getTime()
    const nameKey = (x: ManagerItem) => x.name.toLowerCase()

    list.sort((a, b) => {
      const pinApplies = filter !== "archived" && filter !== "deleted"
      if (pinApplies) {
        const ap = a.status === "active" && a.pinned
        const bp = b.status === "active" && b.pinned
        if (ap !== bp) return ap ? -1 : 1
      }

      if (sortMode === "alpha_asc") return nameKey(a).localeCompare(nameKey(b))
      return timeKey(b) - timeKey(a)
    })

    return list
  }, [query, filter, sortMode, items])

  type FilterTab = {
    value: FilterMode
    label: string
    icon: React.ElementType
    dividerLeft?: boolean
  }

  const FILTER_TABS: FilterTab[] = [
    { value: "all", label: "All", icon: Layers },
    { value: "favorites", label: "Favorites", icon: Star, dividerLeft: true },
    { value: "archived", label: "Archived", icon: Archive },
    { value: "deleted", label: "Deleted", icon: Trash2 },
  ]

  const tabClass =
    "inline-flex items-center gap-2 px-4 text-xs rounded-full " +
    "data-[state=active]:bg-[var(--gray-18)] data-[state=active]:text-[var(--text-lt)] " +
    "data-[state=inactive]:text-[var(--text)] data-[state=inactive]:hover:text-[var(--text-lt)] data-[state=inactive]:hover:bg-[var(--gray-17)]"

  const statusBadge = (s: FileStatus) => {
    if (s === "archived") return <Badge tone="warn">Archived</Badge>
    if (s === "deleted") return <Badge tone="danger">Deleted</Badge>
    return null
  }

  return (
    <>
      {/* TABS (inside card) */}
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

        {/* right-side tools: view toggle + refresh */}
        <div className="shrink-0 p-2 flex items-center gap-1">
          <div
            className="flex items-center gap-1 h-8 rounded-full border border-[var(--gray-18)] p-1 shadow-inner"
            title="View"
          >
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={[
                "h-6 w-8 rounded-full grid place-items-center transition-all duration-300",
                viewMode === "list"
                  ? "bg-[var(--gray-18)] text-[var(--text-lt)]"
                  : "hover:bg-[var(--gray-17)] text-[var(--text)] hover:text-[var(--text-lt)]",
              ].join(" ")}
              aria-pressed={viewMode === "list"}
              title="List"
            >
              <List className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={[
                "h-6 w-8 rounded-full grid place-items-center transition-all duration-300",
                viewMode === "grid"
                  ? "bg-[var(--gray-18)] text-[var(--text-lt)]"
                  : "hover:bg-[var(--gray-17)] text-[var(--text)] hover:text-[var(--text-lt)]",
              ].join(" ")}
              aria-pressed={viewMode === "grid"}
              title="Grid"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>

          <button onClick={fetchFiles} title="Refresh" aria-label="Refresh" className="ml-1">
            <RotateCw
              size={16}
              className="text-[var(--text-dk)] hover:text-[var(--text)] transition-all duration-300"
            />
          </button>
        </div>
      </div>

      <Divider color="var(--gray-18)" inset={5} />

      {/* LIST / GRID */}
      <div className="mt-1 mr-1 p-4 pb-[100px] h-full min-h-0 overflow-y-auto scrollbar">
        {errorMsg ? <div className="p-3 text-sm text-red-200/80">{errorMsg}</div> : null}

        {loading ? (
          <div className="p-3 text-sm text-[var(--text)]">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-3 text-sm text-[var(--text)]">No matches</div>
        ) : viewMode === "grid" ? (
          <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((item) => {
              const updatedMeta = formatUpdatedMeta(item.updatedAt)

              const actions =
                item.status === "active" ? (
                  <MoreMenu
                    item={item}
                    onTogglePinned={() => togglePinned(item.id, !item.pinned)}
                    onToggleFavorite={() => toggleFavorite(item.id, !item.favorite)}
                    onSetColor={(c) => setColor(item.id, c)}
                    onSetStatus={(s) => setStatus(item.id, s)}
                  />
                ) : (
                  <div className="flex items-center gap-1">
                    <ActionIconButton
                      title="Restore"
                      onClick={(e) => {
                        e.stopPropagation()
                        setStatus(item.id, "active")
                      }}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </ActionIconButton>

                    {item.status !== "deleted" ? (
                      <ActionIconButton
                        title="Delete"
                        onClick={(e) => {
                          e.stopPropagation()
                          setStatus(item.id, "deleted")
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </ActionIconButton>
                    ) : null}
                  </div>
                )

              return (
                <ItemCard
                  key={item.id}
                  title={item.name}
                  metaLeft={updatedMeta}
                  badge={statusBadge(item.status)}
                  actions={actions}
                  color={item.color}
                  pinned={item.pinned}
                  favorite={item.favorite}
                  onClick={() => navigate(`/program/editor/${item.id}`)}
                />
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((item) => {
              const updatedMeta = formatUpdatedMeta(item.updatedAt)

              const actions =
                item.status === "active" ? (
                  <MoreMenu
                    item={item}
                    onTogglePinned={() => togglePinned(item.id, !item.pinned)}
                    onToggleFavorite={() => toggleFavorite(item.id, !item.favorite)}
                    onSetColor={(c) => setColor(item.id, c)}
                    onSetStatus={(s) => setStatus(item.id, s)}
                  />
                ) : (
                  <div className="flex items-center gap-1">
                    <ActionIconButton
                      title="Restore"
                      onClick={(e) => {
                        e.stopPropagation()
                        setStatus(item.id, "active")
                      }}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </ActionIconButton>

                    {item.status !== "deleted" ? (
                      <ActionIconButton
                        title="Delete"
                        onClick={(e) => {
                          e.stopPropagation()
                          setStatus(item.id, "deleted")
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </ActionIconButton>
                    ) : null}
                  </div>
                )

              return (
                <ItemRow
                  key={item.id}
                  title={item.name}
                  metaLeft={updatedMeta}
                  badge={statusBadge(item.status)}
                  actions={actions}
                  color={item.color}
                  pinned={item.pinned}
                  favorite={item.favorite}
                  onClick={() => navigate(`/program/editor/${item.id}`)}
                />
              )
            })}
          </div>
        )}
      </div>

      {/* FLOAT ADD */}
      <div className="absolute right-4 bottom-0 z-50 flex items-end gap-2 p-4">
        <Button
          type="button"
          variant="float"
          regular="lg"
          iconSize="lg"
          className="bg-[var(--acc-dk)] hover:bg-[var(--acc-md)] text-[var(--gray-10)]"
          onClick={() => setAddOpen(true)}
          title="Add"
        >
          <Plus />
        </Button>
      </div>

      {/* ADD MODAL */}
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
