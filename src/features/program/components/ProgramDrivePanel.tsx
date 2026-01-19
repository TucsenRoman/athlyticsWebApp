// src/features/program/components/ProgramDrivePanel.tsx
"use client"

import * as React from "react"
import { cn } from "@/utils/utils"

import { Button } from "@/components/ui/actions/button"

import { Search, SlidersHorizontal, Plus, Archive, Trash2 } from "lucide-react"

import { useProgramContext } from "@/features/program-cloak/useProgramContext"
import { useProgram } from "@/features/program/useProgram"

import type { ProgramLite } from "../programLite.types"
import type { ProgramId } from "@/features/program-cloak/useProgramContext"

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
  const { programs, loading, archiveProgram, deleteProgram } = useProgram()

  // If you later add a "shared" source, replace this split.
  const yourPrograms = React.useMemo(() => {
    const active = programs.filter((p) => p.state === "active")
    return active.map<ProgramRow>((p) => ({
      id: p.id,
      title: p.sport,
      tag: formatGenderAbbrev(p.gender),
      meta: `${p.year} · ${safeText(p.school)}`.trim(),
      selected: selectedProgramId === p.id,
    }))
  }, [programs, selectedProgramId])

  const sharedPrograms = React.useMemo(() => {
    // placeholder until you have actual shared programs
    return [] as ProgramRow[]
  }, [])

  return (
    <div className={cn("flex flex-col gap-8", className)}>
      {/* TOP UTILITIES ROW (matches image) */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            iconSize="lg"
            className="h-9 w-9 rounded-full hover:bg-white/10"
            aria-label="Search"
          >
            <Search className="h-5 w-5 text-white/80" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            iconSize="lg"
            className="h-9 w-9 rounded-full hover:bg-white/10"
            aria-label="Filters"
          >
            <SlidersHorizontal className="h-5 w-5 text-white/80" />
          </Button>
        </div>

        <Button
          type="button"
          variant="ghost"
          iconSize="lg"
          className="h-10 w-10 rounded-full hover:bg-white/10"
          aria-label="Add program"
        >
          <Plus className="h-6 w-6 text-white/80" />
        </Button>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            iconSize="lg"
            className="h-9 w-9 rounded-full hover:bg-white/10"
            aria-label="Archive"
          >
            <Archive className="h-5 w-5 text-white/75" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            iconSize="lg"
            className="h-9 w-9 rounded-full hover:bg-white/10"
            aria-label="Trash"
          >
            <Trash2 className="h-5 w-5 text-white/75" />
          </Button>
        </div>
      </div>

      {/* SECTION: YOUR PROGRAMS */}
      <div className="flex flex-col gap-1">
        <SectionLabel>Your programs</SectionLabel>

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
                onSelect={() => setSelectedProgramId(p.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* SECTION: SHARED PROGRAMS */}
      <div className="flex flex-col gap-1">
        <SectionLabel>Shared Programs</SectionLabel>

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
                onSelect={() => setSelectedProgramId(p.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ========================================================================== */
/* UI PIECES                                                                  */
/* ========================================================================== */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-2 text-sm tracking-wide text-[var(--text-lt)]">
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
  disabled,
}: {
  row: ProgramRow
  onSelect: () => void
  disabled?: boolean
}) {
  const isSelected = !!row.selected

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        "w-full text-left",
        "rounded-[15px] px-4 py-2",
        "transition",
        isSelected
          ? "bg-white/10"
          : "bg-transparent hover:bg-white/7",
        disabled && "cursor-default opacity-70 hover:bg-transparent",
      )}
      aria-current={isSelected ? "true" : undefined}
    >
      <div className="flex items-baseline gap-2">
        <div className="truncate text-lg leading-[1.1] font-semibold text-[var(--vWhite)]">
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
    </button>
  )
}
