"use client"

import { useMemo, useState, useEffect } from "react"

import {
  Dialog,
  DialogContent,
} from "@/components/ui/overlays/dialog"

import { Button } from "@/components/ui/actions/button"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/navigation/tabs"
import { Input } from "@/components/ui/forms/input"

import {
  Archive,
  Trash2,
  Users,
  Search,
  Pencil,
  Plus,
  Clock,
  AArrowDown,
  RotateCcw,
  ArrowUpRight,
  Ellipsis,
  UserRound,
  Tags,
  UsersRound,
  Box,
  Boxes,
} from "lucide-react"

import type { ProgramLite } from "../programLite.types"
import type { ProgramId } from "@/features/program-cloak/useProgramContext"

import { getActivePrograms } from "../selectors/getActivePrograms"
import { getArchivedPrograms } from "../selectors/getArchivedPrograms"
import { getDeletedPrograms } from "../selectors/getDeletedPrograms"
import { Divider, GradientHint } from "@/components/ui"
import ProgramDeleteModal from "./ProgramDeleteModal"
import ProgramConfigModal from "./ProgramConfigModal"
import { supabase } from "@/integrations/supabase/client"
import ExpansiveMenu, {
  type ExpansiveMenuItem,
} from "@/components/ui/navigation/expansivemenu"

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

interface ProgramDriveModalProps {
  open: boolean
  programs: ProgramLite[]
  selectedProgramId: ProgramId | null
  onSelect: (id: ProgramId | null) => void
  onArchive: (id: ProgramId) => Promise<void>
  onRestore: (id: ProgramId) => Promise<void>
  onSoftDelete: (id: ProgramId) => Promise<void>
  onClose: () => void
  refreshPrograms: () => Promise<void>
}

/* ========================================================================== */
/* COMPONENT                                                                  */
/* ========================================================================== */

export default function ProgramDriveModal({
  open,
  programs,
  selectedProgramId,
  onSelect,
  onArchive,
  onRestore,
  onSoftDelete,
  onClose,
  refreshPrograms,
}: ProgramDriveModalProps) {
  const [focusedProgramId, setFocusedProgramId] = useState<ProgramId | null>(
    null,
  )
  const [hoveredProgramId, setHoveredProgramId] = useState<ProgramId | null>(
    null,
  )

  const [activeTab, setActiveTab] = useState<TabKey>("yours")

  // AUTO-DESELECT
  const deselectIfSelected = (id: ProgramId) => {
    if (selectedProgramId === id) onSelect(null)
  }

  useEffect(() => {
    if (selectedProgramId == null) return
    const selected = programs.find((p) => p.id === selectedProgramId)
    if (selected && selected.state !== "active") onSelect(null)
  }, [programs, selectedProgramId, onSelect])

  /* REFRESH AFTER MUTATIONS */
  const afterMutation = async () => {
    await refreshPrograms()
    setFocusedProgramId(null)
  }

  const handleRestore = async (id: ProgramId) => {
    await onRestore(id)
    await afterMutation()
  }

  /* REFRESH-WRAPPED MUTATIONS */
  const handleArchive = async (id: ProgramId) => {
    deselectIfSelected(id)
    await onArchive(id)
    await afterMutation()
  }

  const handleSoftDelete = async (id: ProgramId) => {
    deselectIfSelected(id)
    await onSoftDelete(id)
    await afterMutation()
  }

  const handleHardDelete = async (id: ProgramId) => {
    deselectIfSelected(id)

    const idFilter = Number(id)
    if (!Number.isFinite(idFilter)) {
      console.error("HARD DELETE PROGRAM FAILED: id is not a number", { id })
      return false
    }

    const { error, count } = await supabase
      .from("programs")
      .delete({ count: "exact" })
      .eq("id", idFilter)

    if (error) {
      console.error("HARD DELETE PROGRAM FAILED:", error)
      return false
    }

    if (!count) {
      console.warn("HARD DELETE: 0 rows affected (id mismatch or RLS blocked)", {
        id,
        idFilter,
      })
      return false
    }

    await afterMutation()
    return true
  }

  useEffect(() => {
    if (!open) setFocusedProgramId(null)
  }, [open])

  const [configOpen, setConfigOpen] = useState(false)
  const [configMode, setConfigMode] = useState<"add" | "edit">("add")
  const [configProgram, setConfigProgram] = useState<any | null>(null)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteProgram, setDeleteProgram] = useState<any | null>(null)

  // REFRESH HANDLER
  const handleProgramSaved = async (_programId: ProgramId) => {
    await refreshPrograms()
    setConfigOpen(false)
  }

  // TABS
  type DriveTab = {
    value: "yours" | "shared" | "assigned" | "archived" | "deleted"
    label: string
    icon: React.ElementType
  }

  const DRIVE_TABS: DriveTab[] = [
    { value: "yours", label: "Yours", icon: UserRound },
    { value: "shared", label: "Shared", icon: UsersRound },
    { value: "assigned", label: "Assigned", icon: Tags },
    { value: "archived", label: "Archived", icon: Archive },
    { value: "deleted", label: "Deleted", icon: Trash2 },
  ]

  type TabKey = "yours" | "shared" | "assigned" | "archived" | "deleted"

  type TabDef = {
    value: TabKey
    label: string
    icon: React.ElementType
    emptyLabel: string
    render: () => React.ReactNode
  }

  const tabDefs: TabDef[] = [
    {
      value: "yours",
      label: "Yours",
      icon: UserRound,
      emptyLabel: "Your programs will appear here",
      render: () =>
        yourPrograms.length > 0 ? (
          <ProgramList
            programs={yourPrograms}
            selectedProgramId={selectedProgramId}
            focusedProgramId={focusedProgramId}
            hoveredProgramId={hoveredProgramId}
            setFocusedProgramId={setFocusedProgramId}
            setHoveredProgramId={setHoveredProgramId}
            onOpen={async (id) => {
              await supabase
                .from("programs")
                .update({ last_used_at: new Date().toISOString() })
                .eq("id", Number(id))

              await refreshPrograms()

              onSelect(id)
              onClose()
            }}
            onEdit={(program) => {
              setConfigMode("edit")
              setConfigProgram(program)
              setConfigOpen(true)
            }}
            onDelete={(program) => handleSoftDelete(program.id)}
            onArchive={handleArchive}
          />
        ) : null,
    },
    {
      value: "shared",
      label: "Shared",
      icon: UsersRound,
      emptyLabel: "Shared programs will appear here",
      render: () => null,
    },
    {
      value: "assigned",
      label: "Assigned",
      icon: Tags,
      emptyLabel: "Assigned programs will appear here",
      render: () => null,
    },
    {
      value: "archived",
      label: "Archived",
      icon: Archive,
      emptyLabel: "Your archived programs will appear here",
      render: () =>
        archivedPrograms.length > 0 ? (
          <ProgramList
            programs={archivedPrograms}
            selectedProgramId={selectedProgramId}
            focusedProgramId={focusedProgramId}
            hoveredProgramId={hoveredProgramId}
            setFocusedProgramId={setFocusedProgramId}
            setHoveredProgramId={setHoveredProgramId}
            onRestore={handleRestore}
            onDelete={(program) => handleSoftDelete(program.id)}
          />
        ) : null,
    },
    {
      value: "deleted",
      label: "Deleted",
      icon: Trash2,
      emptyLabel: "Your recently deleted programs will appear here",
      render: () =>
        deletedPrograms.length > 0 ? (
          <ProgramList
            programs={deletedPrograms}
            selectedProgramId={selectedProgramId}
            focusedProgramId={focusedProgramId}
            hoveredProgramId={hoveredProgramId}
            setFocusedProgramId={setFocusedProgramId}
            setHoveredProgramId={setHoveredProgramId}
            onRestore={handleRestore}
            onDelete={(program) => {
              setDeleteProgram({
                id: program.id,
                school: program.school ?? "",
                sport: program.sport ?? "",
                season_year: program.year ?? "",
              })
              setDeleteOpen(true)
            }}
            danger
          />
        ) : null,
    },
  ]

  /* FILTER + SEARCH */
  const [query, setQuery] = useState("")

  /* SORT */
  type SortMode = "recent_use" | "alpha_asc"
  const [sortMode, setSortMode] = useState<SortMode>("recent_use")

  const filterAndSort = (list: ProgramLite[]) => {
    let out = list

    // FILTER: text search
    if (query.trim()) {
      const q = query.toLowerCase()
      out = out.filter((p) =>
        [p.sport, p.year, p.school, String(p.id)].some(
          (v) => v && v.toLowerCase().includes(q),
        ),
      )
    }

    // SORT helpers
    const alphaKey = (p: ProgramLite) =>
      `${p.sport ?? ""} ${p.year ?? ""} ${p.school ?? ""}`.toLowerCase()

    const timeKey = (p: any) => {
      // True "recent use"
      if (p.last_used_at) return new Date(p.last_used_at).getTime()

      // Next best fallbacks
      if (p.updated_at) return new Date(p.updated_at).getTime()
      if (p.created_at) return new Date(p.created_at).getTime()

      // Final fallback
      const y = Number(String(p.year ?? "").slice(0, 4))
      return Number.isFinite(y) ? y : 0
    }

    out = [...out].sort((a: any, b: any) => {
      switch (sortMode) {
        case "alpha_asc":
          return alphaKey(a).localeCompare(alphaKey(b))
        case "recent_use":
        default:
          return timeKey(b) - timeKey(a)
      }
    })

    return out
  }

  /* DERIVED LISTS */
  const yourPrograms = useMemo(
    () => filterAndSort(getActivePrograms(programs)),
    [programs, query, sortMode],
  )

  const archivedPrograms = useMemo(
    () => filterAndSort(getArchivedPrograms(programs)),
    [programs, query, sortMode],
  )

  const deletedPrograms = useMemo(
    () => filterAndSort(getDeletedPrograms(programs)),
    [programs, query, sortMode],
  )

  /* RENDER */
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose()
      }}
    >
      <DialogContent
        onPointerDownOutside={(e) => {
          if (configOpen || deleteOpen) e.preventDefault()
        }}
        onEscapeKeyDown={(e) => {
          if (configOpen || deleteOpen) e.preventDefault()
        }}
        className="
          gap-0 p-0 overflow-hidden
          flex flex-col

          /* OVERRIDE RADIX CENTERING */
          translate-x-0 translate-y-0
          transform-none

          /*  MOBILE: bottom sheet  */
          fixed top-auto bottom-0 left-0 right-0
          m-0 pb-[env(safe-area-inset-bottom)]
          w-full h-[calc(100dvh-70px)]

          rounded-t-xl rounded-b-none
          bg-[#181818]
          border-0
          shadow-2xl
          animate-slide-up-btm

          /* DESKTOP: centered modal */
          md:fixed
          md:top-1/2
          md:left-1/2
          md:-translate-x-1/2
          md:-translate-y-1/2
          md:h-auto
          md:max-w-3xl
          md:rounded-xl
          md:animate-none
        "
      >
        {/* HEADER */}
        <div className="flex justify-between gap-2 h-12 py-2 px-4">
          {/* TITLE */}
          <div className="flex items-center gap-2 text-xl text-[var(--text-lt)] font-semibold">
            {/* <Boxes size={18} strokeWidth={1.5} className="mt-0.5" /> */}
            <span>Drive</span>
          </div>

          <div className="flex items-center gap-2 mr-8">
            {/* SEARCH */}
            <div 
              className="
                flex items-center gap-2
                px-2 w-full max-w-[220px] h-8 
                rounded-full border border-[var(--gray-18)] focus-within:border-[var(--gray-17)] 
                text-xs text-[var(--text-dk)] focus-within:text-[var(--text)] hover:text-[var(--text)]
                shadow-inner transition-all duration-300
              "
            >
              <Search className="h-4 w-4" />
              <Input
                tabIndex={-1}
                className="p-0 pb-[2px] border-0 bg-transparent text-sm truncate focus-visible:ring-0"
                placeholder="Search programs"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            {/* SORT */}
            <div
              className="flex items-center gap-1 mr-1 h-8 rounded-full border border-[var(--gray-18)] p-1 shadow-inner"
              title="Sort"
            >
              <button
                type="button"
                onClick={() => setSortMode("recent_use")}
                className={[
                  "h-6 w-8 rounded-full grid place-items-center transition-all duration-300",
                  sortMode === "recent_use"
                    ? "bg-[var(--gray-18)] text-[var(--text-lt)]"
                    : "hover:bg-[var(--gray-17)] text-[var(--text)] hover:text-[var(--text-lt)]",
                ].join(" ")}
                aria-pressed={sortMode === "recent_use"}
                title="Recent Use"
              >
                <Clock className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => setSortMode("alpha_asc")}
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
        </div>

        {/* <Divider color="var(--gray-18)" inset={5} /> */}

        <div className="relative mx-3 mb-3 flex-1 min-h-0 flex flex-col rounded-xl border border-[var(--gray-18)] bg-[#181818] overflow-hidden shadow-inner">
          {/* TABS */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabKey)} defaultValue="yours" className="flex-1 min-h-0 flex flex-col">
            <TabsList
              className="
                relative flex h-10 w-full min-w-[250px]
                gap-2 pl-3 pr-[100px]
                overflow-x-auto md:overflow-x-hidden
                border-0 bg-transparent
              "
            >
              {tabDefs.map((t) => (
                <TabsTrigger
                  key={t.value}
                  value={t.value}
                  className="
                    inline-flex items-center gap-2
                    px-4 text-xs rounded-full
                    data-[state=active]:bg-[var(--gray-18)]
                    data-[state=active]:text-[var(--text-lt)]
                    data-[state=inactive]:text-[var(--text)]
                    data-[state=inactive]:hover:text-[var(--text-lt)]
                    data-[state=inactive]:hover:bg-[var(--gray-17)]
                  "
                >
                  <t.icon className="h-4 w-4 opacity-80" />
                  <span>{t.label}</span>
                  {t.value === "assigned" && activeTab !== "assigned" && (
                    <div className="absolute top-[3px] right-[14px] w-1.5 h-1.5 rounded-full border-[0.5px] border-[var(--gray-19)] bg-[#596f7e]" />
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            <Divider color="var(--gray-18)" inset={5} />

            <div className="my-1 p-4 pb-[200px] flex-1 min-h-0 overflow-y-auto scrollbar">
              {tabDefs.map((t) => {
                const content = t.render()
                return (
                  <TabsContent key={t.value} value={t.value} className="flex flex-col">
                    {content ?? <EmptyState icon={t.icon} label={t.emptyLabel} />}
                  </TabsContent>
                )
              })}
            </div>
          </Tabs>

          <ProgramConfigModal
            mode={configMode}
            open={configOpen}
            program={configProgram}
            onClose={() => setConfigOpen(false)}
            onSubmit={async (data) => {
              if (configMode === "edit" && !data.id) {
                throw new Error("Edit mode submit without program id")
              }

              const {
                data: { user },
              } = await supabase.auth.getUser()

              if (!user) {
                console.error("No authenticated user")
                return null
              }

              // ==============================
              // EDIT → UPDATE
              // ==============================
              if (data.id) {
                const { data: updated, error } = await supabase
                  .from("programs")
                  .update({
                    school: data.school,
                    sport: data.sport,
                    level: data.levels.join(", "),
                    gender: data.gender,
                    year: data.year,
                    season_start: data.seasonStart ?? null,
                    season_end: data.seasonEnd ?? null,
                  })
                  .eq("id", Number(data.id))
                  .select()
                  .single()

                if (error) {
                  console.error("UPDATE PROGRAM FAILED:", error)
                  return null
                }

                await handleProgramSaved(updated.id)
                return updated.id
              }

              // ==============================
              // ADD → INSERT
              // ==============================
              const { data: created, error } = await supabase
                .from("programs")
                .insert({
                  user_id: user.id,
                  school: data.school,
                  sport: data.sport,
                  level: data.levels.join(", "),
                  gender: data.gender,
                  year: data.year,
                  season_start: data.seasonStart ?? null,
                  season_end: data.seasonEnd ?? null,
                  state: "active",
                })
                .select()
                .single()

              if (error) {
                console.error("CREATE PROGRAM FAILED:", error)
                return null
              }

              await handleProgramSaved(created.id)
              return created.id
            }}
          />

          <ProgramDeleteModal
            open={deleteOpen}
            program={deleteProgram}
            onClose={() => setDeleteOpen(false)}
            onConfirm={async () => {
              const id = deleteProgram?.id
              if (!id) return

              const ok = await handleHardDelete(id)

              if (ok) {
                setDeleteOpen(false)
                setDeleteProgram(null)
              }
            }}
          />

          <div className="absolute right-0 bottom-0 z-50 flex items-end gap-2 p-4">
            <Button
              type="button"
              variant="float"
              regular="md"
              iconSize="lg"
              className="bg-[#394650] hover:bg-[#596f7e] text-[var(--gray-10)]"
              onClick={() => {
                setConfigMode("add")
                setConfigProgram(null)
                setConfigOpen(true)
              }}
              title="Add Program"
            >
              <Plus />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ========================================================================== */
/* PROGRAM LIST COMPONENT                                                     */
/* ========================================================================== */

const PROGRAM_ID_PREVIEW_LENGTH = 6

function shortId(id: ProgramId) {
  return id ? String(id).slice(0, PROGRAM_ID_PREVIEW_LENGTH) : "—"
}

function ProgramList({
  programs,
  selectedProgramId,
  focusedProgramId,
  hoveredProgramId,
  setFocusedProgramId,
  setHoveredProgramId,

  onOpen,
  onEdit,
  onArchive,
  onRestore,
  onDelete,
  danger,
}: {
  programs: ProgramLite[]
  selectedProgramId: ProgramId | null
  focusedProgramId: ProgramId | null
  hoveredProgramId: ProgramId | null
  setFocusedProgramId: (id: ProgramId | null) => void
  setHoveredProgramId: (id: ProgramId | null) => void

  onOpen?: (id: ProgramId) => void
  onArchive?: (id: ProgramId) => void
  onRestore?: (id: ProgramId) => void
  onEdit?: (program: ProgramLite) => void
  onDelete?: (program: ProgramLite) => void
  danger?: boolean
}) {
  return (
    <div className="flex flex-col gap-2 min-h-16 overflow-x-visible">
      {programs.map((p) => {
        const isFocused = focusedProgramId === p.id
        const isHovered = hoveredProgramId === p.id
        const showActions = isFocused || isHovered
        const isActive = selectedProgramId === p.id

        const actions = [
          ...(onEdit
            ? ([
                {
                  label: "Edit",
                  icon: <Pencil className="h-4 w-4" />,
                  flavor: "blue",
                  action: () => onEdit(p),
                } satisfies ExpansiveMenuItem,
              ] as const)
            : []),

          ...(onArchive && p.state === "active"
            ? ([
                {
                  label: "Archive",
                  icon: <Archive className="h-4 w-4" />,
                  flavor: "yellow",
                  action: () => onArchive(p.id),
                } satisfies ExpansiveMenuItem,
              ] as const)
            : []),

          ...(onRestore && (p.state === "archived" || p.state === "deleted")
            ? ([
                {
                  label: "Restore",
                  icon: <RotateCcw className="h-4 w-4" />,
                  flavor: "slate",
                  action: () => onRestore(p.id),
                } satisfies ExpansiveMenuItem,
              ] as const)
            : []),

          ...(onDelete && p.state !== "deleted"
            ? ([
                {
                  label: "Delete",
                  icon: <Trash2 className="h-4 w-4" />,
                  flavor: "red",
                  destructive: true,
                  action: () => onDelete(p),
                } satisfies ExpansiveMenuItem,
              ] as const)
            : []),

          ...(danger && p.state === "deleted"
            ? ([
                {
                  label: "Delete Forever",
                  icon: <Trash2 className="h-4 w-4" />,
                  flavor: "red",
                  destructive: true,
                  action: () => onDelete(p),
                } satisfies ExpansiveMenuItem,
              ] as const)
            : []),
        ]

        return (
          <div
            key={p.id}
            onClick={() => {
              if (focusedProgramId === p.id) {
                if (onOpen) onOpen(p.id)
              } else {
                setFocusedProgramId(p.id)
              }
            }}
            onMouseEnter={() => {
              setHoveredProgramId(p.id)
              if (focusedProgramId !== p.id) {
                setFocusedProgramId(p.id)
              }
            }}
            onMouseLeave={() => setHoveredProgramId(null)}
            className="relative flex flex-wrap justify-between items-center gap-2 px-4 py-3 cursor-pointer rounded-xl border border-white/10 hover:border-white/15 bg-white/5"
          >
            {/* ACTIVE LEFT ACCENT */}
            {isActive && (
              <div className="absolute left-1 top-1/2 -translate-y-1/2 h-6 w-1 rounded-full bg-[#596f7e] shadow-inner" />
            )}

            <div className="flex flex-col min-w-0">
              <div className="flex items-start gap-2 h-6 text-sm font-medium text-white/85">
                <span className="truncate">
                  {p.gender} {p.sport} • {p.year}
                </span>

                {showActions && (
                  <div
                    className="flex items-center gap-2 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* OPEN / SELECT */}
                    {onOpen && !isActive && (
                      <button
                        type="button"
                        onClick={() => onOpen(p.id)}
                        title="Open program"
                        className={[
                          "flex justify-center items-center",
                          "h-6 w-8",
                          "rounded-full border border-white/10",
                          "bg-white/8 hover:bg-white/12",
                          "text-white/85",
                          "transition",
                        ].join(" ")}
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-white/55 truncate">
                {p.school && <span className="truncate">{p.school}</span>}
                <span className="opacity-60">#{shortId(p.id)}</span>
              </div>
            </div>

            {/* INLINE ACTIONS */}
            {showActions && (
              <div
                className="absolute top-[25%] right-[10px] shrink-0 w-fit h-fit"
                onClick={(e) => e.stopPropagation()}
              >
                <ExpansiveMenu
                  variant="rainbow"
                  direction="left"
                  expand="arch"
                  radius={48}
                  mainRotate={90}
                  mainSize={32}
                  mainIconSize={18}
                  mainIcon={<Ellipsis />}
                  items={actions}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ========================================================================== */
/* EMPTY STATE                                                                */
/* ========================================================================== */

function EmptyState({
  icon: Icon,
  label,
}: {
  icon: React.ElementType
  label: string
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-white/15 p-10 text-sm text-white/55">
      <Icon className="h-6 w-6 opacity-60" />
      {label}
    </div>
  )
}
