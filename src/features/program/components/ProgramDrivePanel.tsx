// src/features/program/components/ProgramDrivePanel.tsx
"use client"

import * as React from "react"
import { useState } from "react"
import { cn } from "@/utils/utils"

import { Button } from "@/components/ui/actions/button"
import { GradientHint, Input, Tag } from "@/components/ui"

import {
  Search,
  SlidersHorizontal,
  Plus,
  AArrowDown,
  Clock,
  Check,
  X,
  UsersRound,
  Tags,
  UserRound,
  ChevronDown,
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/overlays/dialog"

import { useProgramContext } from "@/features/program-cloak/useProgramContext"
import { useProgram } from "@/features/program/useProgram"

import type { ProgramLite } from "../programLite.types"
import type { ProgramId } from "@/features/program-cloak/useProgramContext"
import ProgramConfigModal from "./ProgramConfigModal"
import { supabase } from "@/integrations/supabase/client"


/* ========================================================================== */
/* HELPERS                                                                    */
/* ========================================================================== */

function formatGenderAbbrev(gender: string | null) {
  if (!gender) return null

  switch (gender.toLowerCase()) {
    case "boys":
    case "male":
      return "(B)"
    case "girls":
    case "female":
      return "(G)"
    case "co-ed":
      return null
    default:
      return `(${gender.charAt(0).toUpperCase()})`
  }
}

function safeText(v: string | null | undefined) {
  return v ?? ""
}

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

type ProgramRow = {
  id: ProgramId
  title: string
  tag?: string | null
  meta: string
  selected?: boolean
}

/* ========================================================================== */
/* COMPONENT                                                                  */
/* ========================================================================== */

export default function ProgramDrivePanel({
  className,
}: {
  className?: string
}) {
  const { selectedProgramId, setSelectedProgramId } = useProgramContext()
  const { programs, loading, archiveProgram, deleteProgram, refresh } = useProgram()

  const [yourOpen, setYourOpen] = useState(true)
  const [sharedOpen, setSharedOpen] = useState(true)
  const [assignedOpen, setAssignedOpen] = useState(true)

  const [query, setQuery] = useState("")

  const [filterOpen, setFilterOpen] = useState(false)

  type GenderFilter = "all" | "boys" | "girls" | "co-ed"
  type Filters = {
    gender: GenderFilter
    year: "all" | string
    school: string
  }

  const [filters, setFilters] = useState<Filters>({
    gender: "all",
    year: "all",
    school: "",
  })

  const yearOptions = React.useMemo(() => {
    const years = programs
      .map((p) => (p.year ? String(p.year) : null))
      .filter(Boolean) as string[]
    return Array.from(new Set(years)).sort((a, b) => b.localeCompare(a))
  }, [programs])

  const matchesFilters = React.useCallback(
    (p: ProgramLite) => {
      // gender
      if (filters.gender !== "all") {
        const g = (p.gender ?? "").toLowerCase()
        if (filters.gender === "boys" && !["boys", "male"].includes(g)) return false
        if (filters.gender === "girls" && !["girls", "female"].includes(g)) return false
        if (filters.gender === "co-ed" && g !== "co-ed") return false
      }

      // year
      if (filters.year !== "all") {
        if (String(p.year ?? "") !== filters.year) return false
      }

      // school (contains)
      const s = filters.school.trim().toLowerCase()
      if (s) {
        const school = String(p.school ?? "").toLowerCase()
        if (!school.includes(s)) return false
      }

      return true
    },
    [filters]
  )

  type SortMode = "recent_use" | "alpha_asc"
  const [sortMode, setSortMode] = useState<SortMode>("recent_use")
  const filterAndSort = React.useCallback(
    (list: ProgramLite[]) => {
      let out = list

      // FILTERS
      out = out.filter(matchesFilters)

      // SEARCH
      const q = query.trim().toLowerCase()
      if (q) {
        out = out.filter((p) =>
          [p.sport, p.year, p.school, String(p.id)]
            .filter(Boolean)
            .some((v) => String(v).toLowerCase().includes(q))
        )
      }

      // SORT helpers
      const alphaKey = (p: ProgramLite) =>
        `${p.sport ?? ""} ${p.year ?? ""} ${p.school ?? ""}`.toLowerCase()

      const toTime = (v: unknown) => {
        const t = v ? new Date(String(v)).getTime() : 0
        return Number.isFinite(t) ? t : 0
      }

      const timeKey = (p: any) => toTime(p.last_used_at) // strict “last opened”

      out = [...out].sort((a: any, b: any) => {
        switch (sortMode) {
          case "alpha_asc": {
            const primary = alphaKey(a).localeCompare(alphaKey(b))
            if (primary !== 0) return primary
            return timeKey(b) - timeKey(a)
          }
          case "recent_use":
          default: {
            const primary = timeKey(b) - timeKey(a)
            if (primary !== 0) return primary
            return alphaKey(a).localeCompare(alphaKey(b))
          }
        }
      })

      return out
    },
    [matchesFilters, query, sortMode]
  )

  React.useEffect(() => {
    console.log("sortMode:", sortMode)
    console.log("sample program keys:", programs?.[0] && {
      id: programs[0].id,
      sport: programs[0].sport,
      year: programs[0].year,
      school: programs[0].school,
      last_used_at: (programs[0] as any).last_used_at,
      updated_at: (programs[0] as any).updated_at,
      created_at: (programs[0] as any).created_at,
    })
  }, [sortMode, programs])

  // If you later add a "shared" source, replace this split.
  const activeList = React.useMemo(
    () => programs.filter((p) => p.state === "active"),
    [programs]
  )

  // TODO: replace these when you actually have real data sources
  const sharedList = React.useMemo(() => [] as ProgramLite[], [])
  const assignedList = React.useMemo(() => [] as ProgramLite[], [])

  const yourPrograms = React.useMemo(() => {
    const filtered = filterAndSort(activeList)
    return filtered.map<ProgramRow>((p) => ({
      id: p.id,
      title: p.sport,
      tag: formatGenderAbbrev(p.gender),
      meta: `${p.year} · ${safeText(p.school)}`.trim(),
      selected: selectedProgramId === p.id,
    }))
  }, [activeList, filterAndSort, selectedProgramId])

  const sharedPrograms = React.useMemo(() => {
    const filtered = filterAndSort(sharedList)
    return filtered.map<ProgramRow>((p) => ({
      id: p.id,
      title: p.sport,
      tag: formatGenderAbbrev(p.gender),
      meta: `${p.year} · ${safeText(p.school)}`.trim(),
      selected: selectedProgramId === p.id,
    }))
  }, [sharedList, filterAndSort, selectedProgramId])

  const assignedPrograms = React.useMemo(() => {
    const filtered = filterAndSort(assignedList)
    return filtered.map<ProgramRow>((p) => ({
      id: p.id,
      title: p.sport,
      tag: formatGenderAbbrev(p.gender),
      meta: `${p.year} · ${safeText(p.school)}`.trim(),
      selected: selectedProgramId === p.id,
    }))
  }, [assignedList, filterAndSort, selectedProgramId])

    // CONFIG MODAL (ADD / EDIT)
    const [configOpen, setConfigOpen] = useState(false)
    const [configMode, setConfigMode] = useState<"add" | "edit">("add")
    const [configProgram, setConfigProgram] = useState<any | null>(null)

    const openAddProgram = () => {
      setConfigMode("add")
      setConfigProgram(null)
      setConfigOpen(true)
    }

    const afterProgramMutation = async (programId?: ProgramId) => {
      await refresh()
      if (programId != null) setSelectedProgramId(programId)
      setConfigOpen(false)
    }

  return (
    <div className={cn("relative flex flex-col gap-2 h-full", className)}>
      {/* TOP UTILITIES ROW (search bar + smaller tools) */}
      <div className="flex items-center justify-between gap-3 px-1">
        {/* SEARCH BAR */}
        <div
          className={cn(
            "flex items-center gap-2",
            "h-8 flex-1 min-w-0",
            "rounded-full px-3",
            "bg-white/6 ring-1 ring-white/10",
            "focus-within:ring-2 focus-within:ring-white/20",
            "transition"
          )}
        >
          <Search className="h-5 w-5 text-white/65" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Programs..."
            className={cn(
              "border-0 bg-transparent p-0",
              "text-sm text-white/85 placeholder:text-white/35",
              "focus-visible:text-white focus-visible:ring-0",
              "min-w-0"
            )}
          />
          <button
            type="button"
            onClick={() => setQuery("")}
            className={cn(
              "shrink-0 rounded-full p-1 transition-opacity",
              query ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
              "text-white/50 hover:text-white/80"
            )}
            aria-label="Clear search"
            aria-hidden={!query}
            tabIndex={query ? 0 : -1}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* SORT PILL */}
        <div
          className={cn(
            "flex items-center gap-1",
            "p-1 h-8",
            "rounded-full",
            "bg-white/6 ring-1 ring-white/10"
          )}
        >
          <button
            type="button"
            onClick={() => setSortMode("recent_use")}
            aria-pressed={sortMode === "recent_use"}
            title="Recent use"
            className={cn(
              "h-6 w-8 rounded-full grid place-items-center transition",
              sortMode === "recent_use"
                ? "bg-white/10 text-white/90"
                : "text-white/65 hover:bg-white/10"
            )}
          >
            <Clock className="h-3.5 w-3.5" strokeWidth={2.25} />
          </button>

          <button
            type="button"
            onClick={() => setSortMode("alpha_asc")}
            aria-pressed={sortMode === "alpha_asc"}
            title="Alphabetical"
            className={cn(
              "h-6 w-8 rounded-full grid place-items-center transition",
              sortMode === "alpha_asc"
                ? "bg-white/10 text-white/90"
                : "text-white/65 hover:bg-white/10"
            )}
          >
            <AArrowDown className="h-3.5 w-3.5" strokeWidth={2.25} />
          </button>
        </div>

      </div>

      <div className="flex flex-col gap-10 overflow-y-auto overflow-x-hidden pb-[100px]">
        {/* SECTION: YOUR PROGRAMS */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between px-2 text-[var(--text-lt)]">
            <div className="flex items-center gap-1">
              <UserRound className="w-3 h-3" />
              <SectionLabel>Your Programs</SectionLabel>
            </div>

            <button
              type="button"
              onClick={() => setYourOpen((v) => !v)}
              aria-expanded={yourOpen}
              aria-label={yourOpen ? "Collapse Your Programs" : "Expand Your Programs"}
              className={cn(
                "h-7 w-7 grid place-items-center rounded-full",
                "text-white/65 hover:text-white/90 hover:bg-white/10 transition"
              )}
            >
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  yourOpen ? "rotate-0" : "-rotate-90"
                )}
              />
            </button>
          </div>

          {yourOpen && (
            <>
              {loading ? (
                <MutedLine>Loading…</MutedLine>
              ) : yourPrograms.length === 0 ? (
                <MutedLine>No programs yet</MutedLine>
              ) : (
                <div className="flex flex-col gap-3">
                  {yourPrograms.map((p) => (
                    <ProgramTile
                      key={String(p.id)}
                      row={p}
                      onSelect={async () => {
                        const idFilter = Number(p.id)
                        if (!Number.isFinite(idFilter)) {
                          console.warn("SKIP last_used_at update (non-numeric id):", { id: p.id })
                          setSelectedProgramId(p.id)
                          return
                        }
                        const { error } = await supabase
                          .from("programs")
                          .update({ last_used_at: new Date().toISOString() })
                          .eq("id", idFilter)

                        if (error) {
                          setSelectedProgramId(p.id)
                          return
                        }
                        await refresh()
                        setSelectedProgramId(p.id)
                      }}
                      onEdit={() => {
                        setConfigMode("edit")
                        setConfigProgram({ id: p.id })
                        setConfigOpen(true)
                      }}
                      onArchive={async () => {
                        await archiveProgram(p.id)
                        await refresh()
                      }}
                      onDelete={async () => {
                        await deleteProgram(p.id)
                        await refresh()
                      }}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* SECTION: SHARED PROGRAMS */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between px-2 text-[var(--text-lt)]">
            <div className="flex items-center gap-1">
              <UsersRound className="w-3 h-3" />
              <SectionLabel>Shared Programs</SectionLabel>
            </div>

            <button
              type="button"
              onClick={() => setSharedOpen((v) => !v)}
              aria-expanded={sharedOpen}
              aria-label={sharedOpen ? "Collapse Shared Programs" : "Expand Shared Programs"}
              className={cn(
                "h-7 w-7 grid place-items-center rounded-full",
                "text-white/65 hover:text-white/90 hover:bg-white/10 transition"
              )}
            >
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  sharedOpen ? "rotate-0" : "-rotate-90"
                )}
              />
            </button>
          </div>

          {sharedOpen && (
            <>
              {loading ? (
                <MutedLine>Loading…</MutedLine>
              ) : sharedPrograms.length === 0 ? (
                <MutedLine>No programs yet</MutedLine>
              ) : (
                <div className="flex flex-col gap-3">
                  {sharedPrograms.map((p) => (
                    <ProgramTile
                      key={String(p.id)}
                      row={p}
                      onSelect={async () => {
                        const idFilter = Number(p.id)
                        if (!Number.isFinite(idFilter)) {
                          console.warn("SKIP last_used_at update (non-numeric id):", { id: p.id })
                          setSelectedProgramId(p.id)
                          return
                        }
                        const { error } = await supabase
                          .from("programs")
                          .update({ last_used_at: new Date().toISOString() })
                          .eq("id", idFilter)

                        if (error) {
                          setSelectedProgramId(p.id)
                          return
                        }
                        await refresh()
                        setSelectedProgramId(p.id)
                      }}
                      onEdit={() => {
                        setConfigMode("edit")
                        setConfigProgram({ id: p.id })
                        setConfigOpen(true)
                      }}
                      onArchive={async () => {
                        await archiveProgram(p.id)
                        await refresh()
                      }}
                      onDelete={async () => {
                        await deleteProgram(p.id)
                        await refresh()
                      }}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>


        {/* SECTION: ASSIGNED PROGRAMS */}
        <div className="flex flex-col gap-0">
          <div className="flex items-center justify-between px-2 text-[var(--text-lt)]">
            <div className="flex items-center gap-1">
              <Tags className="w-3 h-3" />
              <SectionLabel>Assigned Programs</SectionLabel>
            </div>

            <button
              type="button"
              onClick={() => setAssignedOpen((v) => !v)}
              aria-expanded={assignedOpen}
              aria-label={assignedOpen ? "Collapse Assigned Programs" : "Expand Assigned Programs"}
              className={cn(
                "h-7 w-7 grid place-items-center rounded-full",
                "text-white/65 hover:text-white/90 hover:bg-white/10 transition"
              )}
            >
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  assignedOpen ? "rotate-0" : "-rotate-90"
                )}
              />
            </button>
          </div>

          {assignedOpen && (
            <>
              {loading ? (
                <MutedLine>Loading…</MutedLine>
              ) : assignedPrograms.length === 0 ? (
                <MutedLine>No programs yet</MutedLine>
              ) : (
                <div className="flex flex-col gap-3">
                  {assignedPrograms.map((p) => (
                    <ProgramTile
                      key={String(p.id)}
                      row={p}
                      onSelect={async () => {
                        const idFilter = Number(p.id)
                        if (!Number.isFinite(idFilter)) {
                          console.warn("SKIP last_used_at update (non-numeric id):", { id: p.id })
                          setSelectedProgramId(p.id)
                          return
                        }
                        const { error } = await supabase
                          .from("programs")
                          .update({ last_used_at: new Date().toISOString() })
                          .eq("id", idFilter)

                        if (error) {
                          setSelectedProgramId(p.id)
                          return
                        }
                        await refresh()
                        setSelectedProgramId(p.id)
                      }}
                      onEdit={() => {
                        setConfigMode("edit")
                        setConfigProgram({ id: p.id })
                        setConfigOpen(true)
                      }}
                      onArchive={async () => {
                        await archiveProgram(p.id)
                        await refresh()
                      }}
                      onDelete={async () => {
                        await deleteProgram(p.id)
                        await refresh()
                      }}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* <GradientHint fromColor="#181818" extent="100px" /> */}
      </div>
      
      {/* FLOATING ADD */}
      <div className="z-50 fixed bottom-20 right-4">
        <Button
          type="button"
          variant="float"
          regular="md"
          iconSize="lg"
          className="bg-[var(--gray-10)] hover:bg-white/12 text-[var(--text-dk)]"
          aria-label="Add program"
          onClick={openAddProgram}
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>

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

            await afterProgramMutation(updated.id)
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

          await afterProgramMutation(created.id)
          return created.id
        }}
      />
    </div>
  )
}

/* ========================================================================== */
/* UI PIECES                                                                  */
/* ========================================================================== */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-0 text-sm tracking-wide text-[var(--text-lt)]">
      {children}
    </div>
  )
}

function MutedLine({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 py-2 text-sm text-[var(--text)]">
      {children}
    </div>
  )
}

function ProgramTile({
  row,
  onSelect,
  onEdit,
  onArchive,
  onDelete,
  disabled,
}: {
  row: ProgramRow
  onSelect: () => void
  onEdit?: () => void
  onArchive?: () => void
  onDelete?: () => void
  disabled?: boolean
}) {
  const isSelected = !!row.selected
  const [menuOpen, setMenuOpen] = React.useState(false)

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={onSelect}
        className={cn(
          "group relative w-full text-left",
          "rounded-[15px] px-4 py-2 pr-12", // <-- give room for the dots button
          "transition",
          isSelected ? "bg-white/10" : "bg-transparent hover:bg-white/7",
          disabled && "cursor-default opacity-70 hover:bg-transparent"
        )}
        aria-current={isSelected ? "true" : undefined}
      >
        {/* CONTENT */}
        <div className="flex items-baseline gap-2">
          <div className="truncate text-lg leading-[1.1] font-semibold text-[var(--gray-8)]">
            {row.title}
          </div>

          {row.tag ? (
            <div className="text-base font-semibold text-[var(--text-lt)]">
              {row.tag}
            </div>
          ) : null}
        </div>

        <div className="truncate pt-1 text-xs text-[var(--text-lt)]">
          {row.meta}
        </div>

        {/* HOVER ACTION (THREE DOTS) */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setMenuOpen(true)
          }}
          onMouseDown={(e) => {
            // prevents the parent button from stealing focus/click behavior
            e.preventDefault()
            e.stopPropagation()
          }}
          aria-label={`More actions for ${row.title}`}
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2",
            "h-8 w-8 rounded-full grid place-items-center",
            "text-white/60 hover:text-white/90 hover:bg-white/10 transition",
            // hidden until hover/focus
            "opacity-0 pointer-events-none",
            "group-hover:opacity-100 group-hover:pointer-events-auto",
            "group-focus-within:opacity-100 group-focus-within:pointer-events-auto"
          )}
        >
          {/* three horizontal dots (using lucide 'MoreHorizontal' would be ideal,
             but if you don't want another import, use this tiny SVG) */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <circle cx="6" cy="12" r="1.8" />
            <circle cx="12" cy="12" r="1.8" />
            <circle cx="18" cy="12" r="1.8" />
          </svg>
        </button>
      </button>

      {/* MINI DIALOG MENU */}
      <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
        <DialogContent className="max-w-[280px] p-2">
          <DialogHeader className="px-2 pt-1">
            <DialogTitle className="text-sm text-[var(--text)]">
              {row.title}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-1 p-1">
            <button
              type="button"
              className={cn(
                "w-full text-left rounded-md px-3 py-2 text-sm",
                "text-[var(--text)] hover:bg-white/7 transition"
              )}
              onClick={() => {
                setMenuOpen(false)
                onEdit?.()
              }}
            >
              Edit
            </button>

            <button
              type="button"
              className={cn(
                "w-full text-left rounded-md px-3 py-2 text-sm",
                "text-[var(--text)] hover:bg-white/7 transition"
              )}
              onClick={() => {
                setMenuOpen(false)
                onArchive?.()
              }}
            >
              Archive
            </button>

            <button
              type="button"
              className={cn(
                "w-full text-left rounded-md px-3 py-2 text-sm",
                "text-red-200 hover:bg-red-500/10 transition"
              )}
              onClick={() => {
                setMenuOpen(false)
                onDelete?.()
              }}
            >
              Delete
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
