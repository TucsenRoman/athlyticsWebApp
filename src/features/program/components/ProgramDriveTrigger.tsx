"use client"

import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useMemo,
} from "react"

import type { ProgramId } from "@/features/program-cloak/useProgramContext"
import { useProgramContext } from "@/features/program-cloak/useProgramContext"
import { useProgram } from "@/features/program/useProgram"

import { ChevronDown, Plus } from "lucide-react"
import { Button } from "@/components/ui/actions/button"

import ProgramDriveModal from "./ProgramDriveModal"
import ProgramConfigModal from "./ProgramConfigModal"

import type { ProgramLite } from "../programLite.types"

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

export interface ProgramDriveTriggerHandle {
  open: () => void
}

type TriggerVariant = "header" | "empty"

interface ProgramDriveTriggerProps {
  variant?: TriggerVariant
}

/* ========================================================================== */
/* COMPONENT                                                                  */
/* ========================================================================== */

const ProgramDriveTrigger = forwardRef<
  ProgramDriveTriggerHandle,
  ProgramDriveTriggerProps
>(({ variant = "header" }, ref) => {
  /* ---------------------------------------------------------------------- */
  /* DATA                                                                    */
  /* ---------------------------------------------------------------------- */

  const { selectedProgramId, setSelectedProgramId } = useProgramContext()
  const {
    programs,
    loading,
    archiveProgram,
    restoreProgram,
    deleteProgram,
  } = useProgram()

  const [driveOpen, setDriveOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)

  const triggerRef = useRef<HTMLButtonElement | null>(null)

  useImperativeHandle(ref, () => ({
    open: () => setDriveOpen(true),
  }))

  /* ---------------------------------------------------------------------- */
  /* SHAPE DATA (API → UI)                                                   */
  /* ---------------------------------------------------------------------- */

  const programLites = useMemo<ProgramLite[]>(() => {
    return programs.map((p) => ({
      id: p.id,
      sport: p.sport,
      year: p.year,
      school: p.school ?? null,
      state: p.state,
      created_at: p.created_at,
      last_used_at: p.last_used_at,
    }))
  }, [programs])

  /* ---------------------------------------------------------------------- */
  /* DERIVED                                                                 */
  /* ---------------------------------------------------------------------- */

  const selectedProgram = programLites.find(
    (p) => p.id === selectedProgramId,
  )

  const label = selectedProgram
    ? `${selectedProgram.sport || "Program"} • ${selectedProgram.year || ""}`
    : "Select Program"

  const hasPrograms = programLites.length > 0

  /* ---------------------------------------------------------------------- */
  /* EMPTY STATE                                                             */
  /* ---------------------------------------------------------------------- */

  if (!loading && !hasPrograms) {
    return (
      <>
        <Button
          iconSize="none"
          onClick={() => setCreateOpen(true)}
          className="
            flex items-center gap-2
            h-full w-[150px] px-3
            rounded-xl backdrop-blur
            text-[var(--dom-dk)]
            font-bold
            transition
          "
        >
          Create Program
          <Plus size={16} strokeWidth={2.5} />
        </Button>

        <ProgramConfigModal
          mode="add"
          open={createOpen}
          program={null}
          onClose={() => setCreateOpen(false)}
          onSubmit={async () => null}
        />
      </>
    )
  }

  /* ---------------------------------------------------------------------- */
  /* TRIGGERS                                                                */
  /* ---------------------------------------------------------------------- */

  const HeaderTrigger = (
    <button
      ref={triggerRef}
      onClick={() => setDriveOpen(true)}
      className="
        flex items-center gap-2
        h-full min-w-[150px] px-3
        rounded-xl backdrop-blur
        font-bold
        transition
      "
    >
      <span className="text-sm truncate">{label}</span>
      <ChevronDown size={16} strokeWidth={2.5} />
    </button>
  )

  const EmptyTrigger = (
    <Button
      ref={triggerRef}
      onClick={() => setDriveOpen(true)}
      className="
        h-[38px]
        px-4
        rounded-full
        flex items-center gap-2
        bg-[var(--gray-lt)]
        border border-[var(--border)]
        backdrop-blur-sm
      "
    >
      <span className="text-sm truncate">{label}</span>
      <ChevronDown size={16} className="opacity-70" />
    </Button>
  )

  /* ---------------------------------------------------------------------- */
  /* RENDER                                                                  */
  /* ---------------------------------------------------------------------- */

  return (
    <>
      {variant === "empty" ? EmptyTrigger : HeaderTrigger}

      <ProgramDriveModal
        open={driveOpen}
        selectedProgramId={selectedProgramId}
        onSelect={(id) => {
          setSelectedProgramId(id)
          if (id != null) setDriveOpen(false)
        }}
        onArchive={archiveProgram}
        onRestore={restoreProgram}
        onSoftDelete={deleteProgram}
        onClose={() => setDriveOpen(false)}
      />
    </>
  )
})

ProgramDriveTrigger.displayName = "ProgramDriveTrigger"
export default ProgramDriveTrigger
