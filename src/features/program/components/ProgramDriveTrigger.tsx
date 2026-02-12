// src/features/program/components/ProgramDriveTrigger.tsx
"use client"

import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  useLayoutEffect,
} from "react"

import { useAuth } from "@/contexts/AuthContext"
import type { ProgramId } from "@/features/program-cloak/useProgramContext"
import { useProgramContext } from "@/features/program-cloak/useProgramContext"
import { useProgram } from "@/features/program/useProgram"

import { Box, ChevronDown, ChevronRight, MousePointer2, Plus } from "lucide-react"
import { Button } from "@/components/ui/actions/button"
import { cn } from "@/utils/utils"

import ProgramDriveModal from "./ProgramDriveModal"
import ProgramConfigModal from "./ProgramConfigModal"

import type { ProgramLite } from "../programLite.types"

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

export interface ProgramDriveTriggerHandle {
  open: () => void
}

export type TriggerVariant = "drawer" | "rail" | "popup"

type DriveDeps = {
  programs: ProgramLite[]
  loading: boolean
  archiveProgram: (id: ProgramId) => Promise<void>
  restoreProgram: (id: ProgramId) => Promise<void>
  deleteProgram: (id: ProgramId) => Promise<void>
  refreshPrograms: () => Promise<void>
}

interface ProgramDriveTriggerProps {
  variant?: TriggerVariant
  className?: string

  // Optional override: if you pass ANY of these, you should pass ALL of them.
  programs?: ProgramLite[]
  loading?: boolean
  archiveProgram?: (id: ProgramId) => Promise<void>
  restoreProgram?: (id: ProgramId) => Promise<void>
  deleteProgram?: (id: ProgramId) => Promise<void>
  refreshPrograms?: () => Promise<void>
}

/* ========================================================================== */
/* COMPONENT                                                                  */
/* ========================================================================== */

const ProgramDriveTrigger = forwardRef<
  ProgramDriveTriggerHandle,
  ProgramDriveTriggerProps
>(function ProgramDriveTrigger(
  {
    variant = "drawer",
    className,
    programs,
    loading,
    archiveProgram,
    restoreProgram,
    deleteProgram,
    refreshPrograms,
  },
  ref,
) {
  /* ---------------------------------------------------------------------- */
  /* HOOKS (MUST RUN IN SAME ORDER EVERY RENDER)                             */
  /* ---------------------------------------------------------------------- */

  const auth = useAuth()
  const { selectedProgramId, setSelectedProgramId } = useProgramContext()
  const driveFromHook = useProgram()

  const [driveOpen, setDriveOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)

  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const sportRef = useRef<HTMLSpanElement | null>(null)

  useImperativeHandle(ref, () => ({
    open: () => setDriveOpen(true),
  }))

  const deps: DriveDeps = useMemo(() => {
    const hasAnyOverride =
      programs !== undefined ||
      loading !== undefined ||
      archiveProgram !== undefined ||
      restoreProgram !== undefined ||
      deleteProgram !== undefined ||
      refreshPrograms !== undefined

    if (hasAnyOverride) {
      return {
        programs: programs ?? [],
        loading: !!loading,
        archiveProgram:
          archiveProgram ??
          (async () => {
            throw new Error("ProgramDriveTrigger: archiveProgram missing")
          }),
        restoreProgram:
          restoreProgram ??
          (async () => {
            throw new Error("ProgramDriveTrigger: restoreProgram missing")
          }),
        deleteProgram:
          deleteProgram ??
          (async () => {
            throw new Error("ProgramDriveTrigger: deleteProgram missing")
          }),
        refreshPrograms:
          refreshPrograms ??
          (async () => {
            throw new Error("ProgramDriveTrigger: refreshPrograms missing")
          }),
      }
    }

    return {
      programs: driveFromHook.programs,
      loading: driveFromHook.loading,
      archiveProgram: driveFromHook.archiveProgram,
      restoreProgram: driveFromHook.restoreProgram,
      deleteProgram: driveFromHook.deleteProgram,
      refreshPrograms: driveFromHook.refresh, // ✅ matches your useProgram API
    }
  }, [
    programs,
    loading,
    archiveProgram,
    restoreProgram,
    deleteProgram,
    refreshPrograms,
    driveFromHook.programs,
    driveFromHook.loading,
    driveFromHook.archiveProgram,
    driveFromHook.restoreProgram,
    driveFromHook.deleteProgram,
    driveFromHook.refresh,
  ])

  const selectedProgram = deps.programs.find((p) => p.id === selectedProgramId)

  // Keep this hook unconditional; guard inside.
  useLayoutEffect(() => {
    if (!sportRef.current) return
    const el = sportRef.current
    const parent = el.parentElement
    if (!parent) return

    const update = () => {
      parent.style.setProperty("--sport-w", `${el.offsetWidth}px`)
    }

    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [selectedProgram])

  /* ---------------------------------------------------------------------- */
  /* DERIVED                                                                 */
  /* ---------------------------------------------------------------------- */

  const hasPrograms = deps.programs.length > 0

  function formatGenderAbbrev(gender: string | null) {
    if (!gender) return ""
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
        return gender.charAt(0).toUpperCase()
    }
  }

  /* ---------------------------------------------------------------------- */
  /* RENDER GUARDS (AFTER HOOKS)                                             */
  /* ---------------------------------------------------------------------- */

  if (auth.loading) return null
  if (deps.loading) return null

  /* ====================================================================== */
  /* EMPTY STATE (NO PROGRAMS)                                               */
  /* ====================================================================== */

  if (!hasPrograms) {
    return (
      <div className="flex justify-center items-center p-1 h-12 rounded-lg bg-[var(--gray-7)] shadow-inner">
        <Button
          iconSize="none"
          onClick={() => setCreateOpen(true)}
          className="
            flex items-center gap-2
            h-8 w-fit px-3
            rounded-xl hover:bg-[var(--gray-8)]
            text-[var(--text)] font-bold
            transition-all cursor-pointer
          "
        >
          <Plus size={16} strokeWidth={2.5} />
          Program
        </Button>

        <ProgramConfigModal
          mode="add"
          open={createOpen}
          program={null}
          onClose={() => setCreateOpen(false)}
          onSubmit={async () => null}
        />
      </div>
    )
  }

  /* ====================================================================== */
  /* TRIGGERS                                                                */
  /* ====================================================================== */

  const DrawerTrigger = (
    <button
      ref={triggerRef}
      type="button"
      onClick={() => setDriveOpen(true)}
      className={cn(
        "relative flex justify-between items-center gap-1",
        "px-4 py-2 w-full",
        "rounded-2xl border border-transparent hover:border-[var(--gray-17)]",
        "bg-gradient-to-br from-[var(--gray-18)] to-[var(--gray-18)]",
        "text-[var(--text)] hover:text-[var(--text-lt)] font-medium",
        "transition-all duration-300",
        className,
      )}
    >
      {!selectedProgram ? (
        <>
          <span className="flex items-center">Select Program</span>
          <div className="flex">
            <Box size={16} strokeWidth={2.5} className="w-4 h-4" />
            {/* <ChevronRight size={16} strokeWidth={2.5} className="w-4 h-4" /> */}
          </div>
          {/* <ChevronRight size={16} strokeWidth={2.5} className="rotate-[-30deg] absolute top-[7px] right-[7px] w-4 h-4" /> */}
        </>
      ) : (
        <div className="flex flex-col leading-tight">
          <span ref={sportRef} className="flex items-center gap-2 max-w-full">
            <span className="truncate text-[21px] font-semibold">
              {selectedProgram.sport}
            </span>

            <span className="text-sm font-medium opacity-50 shrink-0">
              {formatGenderAbbrev(selectedProgram.gender)}
            </span>
          </span>

          <span className="w-full h-4 text-[10px] font-normal truncate">
            {selectedProgram.year} <span className="opacity-50">•</span>{" "}
            {selectedProgram.school}
          </span>
        </div>
      )}
    </button>
  )

  const RailTrigger = (
    <button
      ref={triggerRef}
      type="button"
      aria-label="Open Program Drive"
      title="Program Drive"
      onClick={() => setDriveOpen(true)}
      className={cn(
        "flex items-center justify-center",
        "h-10 w-10 rounded-full",
        "border border-[var(--gray-18)]",
        "text-[var(--text)] hover:bg-[var(--gray-18)] hover:text-[var(--text-lt)]",
        "transition-all duration-300",
        className,
      )}
    >
      <Box className="h-5 w-5" />
    </button>
  )

  const PopupTrigger = (
    <button
      ref={triggerRef}
      type="button"
      onClick={() => setDriveOpen(true)}
      className={cn(
        "flex items-center justify-center",
        "w-full h-11",
        "rounded-2xl border border-transparent hover:border-[var(--gray-17)]",
        "bg-[var(--gray-18)]",
        "text-[var(--text)] hover:text-[var(--text-lt)] font-medium",
        "transition-all duration-300",
        className,
      )}
      aria-label="Select Program"
    >
      <span className="truncate">
        {selectedProgram ? "Change Program" : "Select Program"}
      </span>
    </button>
  )

  const TRIGGERS: Record<TriggerVariant, React.ReactNode> = {
    drawer: DrawerTrigger,
    rail: RailTrigger,
    popup: PopupTrigger,
  }

  /* ====================================================================== */
  /* RENDER                                                                  */
  /* ====================================================================== */

  return (
    <>
      {TRIGGERS[variant]}

      <ProgramDriveModal
        open={driveOpen}
        programs={deps.programs}
        selectedProgramId={selectedProgramId}
        onSelect={(id) => {
          setSelectedProgramId(id)
          if (id != null) setDriveOpen(false)
        }}
        onArchive={deps.archiveProgram}
        onRestore={deps.restoreProgram}
        onSoftDelete={deps.deleteProgram}
        refreshPrograms={deps.refreshPrograms}
        onClose={async () => {
          await deps.refreshPrograms()
          setDriveOpen(false)
        }}
      />
    </>
  )
})

ProgramDriveTrigger.displayName = "ProgramDriveTrigger"
export default ProgramDriveTrigger
