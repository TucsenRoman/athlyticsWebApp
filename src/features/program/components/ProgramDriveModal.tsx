"use client"

import { useMemo, useState, useEffect } from "react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  Settings2,
  ArrowUpRight,
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
import { useProgram } from "../useProgram"
import ExpansiveMenu, { type ExpansiveMenuItem } from "@/components/ui/navigation/expansivemenu";
/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

interface ProgramDriveModalProps {
  open: boolean
  selectedProgramId: ProgramId | null
  onSelect: (id: ProgramId | null) => void
  onArchive: (id: ProgramId) => void | Promise<void>
  onRestore: (id: ProgramId) => void | Promise<void>
  onSoftDelete: (id: ProgramId) => void | Promise<void>
  onClose: () => void
}

/* ========================================================================== */
/* COMPONENT                                                                  */
/* ========================================================================== */

export default function ProgramDriveModal({
  open,
  selectedProgramId,
  onSelect,
  onArchive,
  onRestore,
  onSoftDelete,
  onClose,
}: ProgramDriveModalProps) {
  const { programs, refresh } = useProgram()

  const [focusedProgramId, setFocusedProgramId] =
    useState<ProgramId | null>(null)
  const [hoveredProgramId, setHoveredProgramId] =
    useState<ProgramId | null>(null)

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
    await refresh()
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
    await refresh()
    setConfigOpen(false)
  }

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
  const activePrograms = useMemo(
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
        className="gap-0 max-w-3xl p-0 overflow-hidden bg-[var(--gray-5)] border-0"
      >
        {/* HEADER */}
        <div className="flex justify-between gap-2 h-12 py-2 px-4">
          {/* TITLE */}
          <div className="flex items-center text-xl text-[var(--text-dk)] font-bold">
            Drive
          </div>
          
          <div className="flex items-center gap-2">
            {/* SEARCH */}
            <div className="flex items-center gap-2 px-2 w-full max-w-[200px] h-8 rounded-full border border-transparent focus-within:border-[var(--border-dk)] bg-[var(--gray-7)] text-xs text-[var(--text-lt)] focus-within:text-[var(--text)] shadow-inner transition-colors">
              <Search className="h-4 w-4" />
              <Input
                tabIndex={-1}
                className="p-0 pb-[2px] border-0 bg-transparent text-sm truncate"
                placeholder="Search programs"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            {/* SORT */}
            <div
              className="flex items-center gap-1 mr-7 h-8 rounded-full border border-[var(--border)] bg-[var(--gray-7)] p-1 shadow-inner"
              title="Sort"
            >
              <button
                type="button"
                onClick={() => setSortMode("recent_use")}
                className={[
                  "h-6 w-8 rounded-full grid place-items-center transition",
                  sortMode === "recent_use"
                    ? "bg-[var(--dom-glass)] text-[var(--dom-dk)]"
                    : "text-[var(--text)] hover:bg-[var(--gray-5)]",
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
                  "h-6 w-8 rounded-full grid place-items-center transition",
                  sortMode === "alpha_asc"
                    ? "bg-[var(--dom-glass)] text-[var(--dom-dk)]"
                    : "text-[var(--text)] hover:bg-[var(--gray-5)]",
                ].join(" ")}
                aria-pressed={sortMode === "alpha_asc"}
                title="Alphabetical"
              >
                <AArrowDown className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="relative m-1 mt-0 rounded-lg border border-[var(--border)] bg-[var(--gray-8)] overflow-hidden shadow-inner">
          {/* TABS */}
          <Tabs defaultValue="active">
            <TabsList className="flex justify-between h-10 min-w-[250px] w-full border-0 bg-0">
              <div className="flex gap-2">
                <TabsTrigger
                  value="active"
                  className="
                    px-4 text-xs
                    data-[state=active]:bg-[var(--gray-3)]
                    data-[state=inactive]:text-[var(--text-lt)]
                    data-[state=active]:text-[var(--text)]
                  "
                >
                  Active
                  {/* ~Alternate wording: Live. */}
                </TabsTrigger>
                <TabsTrigger
                  value="archived"
                  className="
                    px-4 text-xs
                    data-[state=active]:bg-[var(--archive-bg)]
                    data-[state=inactive]:text-[var(--text-lt)]
                    data-[state=active]:text-[var(--archive-txt)]
                  "
                >
                  Archived
                </TabsTrigger>
                <TabsTrigger
                  value="deleted"
                  className="
                    px-4 text-xs
                    data-[state=active]:bg-[var(--danger-bg)]
                    data-[state=inactive]:text-[var(--text-lt)]
                    data-[state=active]:text-[var(--danger)]
                  "
                >
                  Deleted
                </TabsTrigger>
              </div>
            </TabsList>

            <Divider color="var(--border-dk)" inset={1} />

            <div className="px-6 pt-4 pb-[100px] h-[50vh] overflow-y-auto">
              <TabsContent value="active" className="flex flex-col">
                <ProgramList
                  programs={activePrograms}
                  selectedProgramId={selectedProgramId}
                  focusedProgramId={focusedProgramId}
                  hoveredProgramId={hoveredProgramId}
                  setFocusedProgramId={setFocusedProgramId}
                  setHoveredProgramId={setHoveredProgramId}
                  onOpen={async (id) => {
                    // mark as used
                    await supabase
                      .from("programs")
                      .update({ last_used_at: new Date().toISOString() })
                      .eq("id", Number(id))

                    await refresh()
                    
                    // then proceed
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
              </TabsContent>

              <TabsContent value="archived">
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
              </TabsContent>

              <TabsContent value="deleted">
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
              </TabsContent>

              <TabsContent value="shared">
                <EmptyState
                  icon={Users}
                  label="Shared programs will appear here"
                />
              </TabsContent>

              <GradientHint fromColor="var(--gray-8)" extent="100px" radius="lg" />
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
              // if not ok, keep modal open so user can retry,
              // and check console for the error/warn
            }}
          />

          <div className="absolute btm-0 right-0 z-50 bottom-0 flex justify-between items-end gap-2 !p-4">
            {/* EXTRA BTN */}
            {/* <Button
              variant="float"
              regular="xs"
              iconSize="md"
              className="!bg-transparent"
              onClick={() => {
                setConfigMode("add")
                setConfigProgram(null)
                setConfigOpen(true)
              }}
              title="Add Program"
            >
              <CircleQuestionMark />
            </Button> */}

            {/* ADD PROGRAM */}
            {/* ~Later use expansive menu for template, blank, etc. */}
            <Button
              variant="float"
              regular="md"
              iconSize="lg"
              className="bg-[var(--acc-lt)] hover:bg-[var(--acc-bg)] text-[var(--acc-dk)]"
              onClick={() => {
                setConfigMode("add")
                setConfigProgram(null)
                setConfigOpen(true)
              }}
              title="Add Program"
            >
              {/* <div className="pb-[3px] text-lg font-semibold">New</div> */}
              <Plus/>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* PROGRAM LIST COMPONENT */
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
  if (programs.length === 0) {
    return (
      <div className="flex justify-center items-center h-16 rounded-lg border border-dashed border-[var(--border-dk)] text-center text-sm text-[var(--text)] font-semibold">
        No programs found
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 min-h-16 overflow-x-visible">
      {programs.map((p) => {
        const isFocused = focusedProgramId === p.id
        const isHovered = hoveredProgramId === p.id
        const showActions = isFocused || isHovered
        const isActive = selectedProgramId === p.id

        const actions = [
          ...(onEdit
            ? [{
                label: "Edit",
                icon: <Pencil className="h-4 w-4" />,
                flavor: "blue",
                action: () => onEdit(p),
              } satisfies ExpansiveMenuItem]
            : []),

          ...(onArchive && p.state === "active"
            ? [{
                label: "Archive",
                icon: <Archive className="h-4 w-4" />,
                flavor: "yellow",
                action: () => onArchive(p.id),
              } satisfies ExpansiveMenuItem]
            : []),

          ...(onRestore && (p.state === "archived" || p.state === "deleted")
            ? [{
                label: "Restore",
                icon: <RotateCcw className="h-4 w-4" />,
                flavor: "slate",
                action: () => onRestore(p.id),
              } satisfies ExpansiveMenuItem]
            : []),

          ...(onDelete && p.state !== "deleted"
            ? [{
                label: "Delete",
                icon: <Trash2 className="h-4 w-4" />,
                flavor: "red",
                destructive: true,
                action: () => onDelete(p),
              } satisfies ExpansiveMenuItem]
            : []),

          ...(danger && p.state === "deleted"
            ? [{
                label: "Delete Forever",
                icon: <Trash2 className="h-4 w-4" />,
                flavor: "red",
                destructive: true,
                action: () => onDelete(p),
              } satisfies ExpansiveMenuItem]
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
            className="relative flex flex-wrap justify-between items-center gap-2 px-4 py-3 cursor-pointer rounded-lg border-2 border-transparent hover:border-[var(--gray-9)] bg-[var(--gray-3)]"
          >
            {/* ACTIVE LEFT ACCENT */}
            {isActive && (
              <div className="absolute left-1 top-1/2 -translate-y-1/2 h-6 w-1 rounded-full bg-[var(--dom-md)]" />
            )}
            <div className="flex flex-col">
              <div className="flex items-start gap-2 h-6 text-sm font-medium">
                {p.sport} • {p.year}

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
                          "rounded-full border border-transparent",
                          "bg-[var(--acc-bg)] hover:bg-[var(--acc-lt)]",
                          "text-[var(--acc-dk)]",
                          "transition",
                        ].join(" ")}
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-[var(--text-lt)] truncate">
                {p.school && <span>{p.school}</span>}
                {/* <span>•</span> */}
                <span className="opacity-60">#{shortId(p.id)}</span>
              </div>
            </div>

            {/* INLINE ACTIONS -------------------------------------------- */}
            {showActions && (
              <div
                className="shrink-0 w-fit h-fit"
                onClick={(e) => e.stopPropagation()}
              >
                <ExpansiveMenu
                  variant="rainbow"
                  // direction="left"
                  // expand="line"
                  // spacing={42}
                  expand="arch"
                  radius={40}
                  mainRotate={90}
                  mainSize={32}
                  mainIcon={<Settings2 />}
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
/* EMPTY STATE                                                               */
/* ========================================================================== */

function EmptyState({
  icon: Icon,
  label,
}: {
  icon: React.ElementType
  label: string
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-10 text-sm text-[var(--text-lt)]">
      <Icon className="h-6 w-6 opacity-60" />
      {label}
    </div>
  )
}
