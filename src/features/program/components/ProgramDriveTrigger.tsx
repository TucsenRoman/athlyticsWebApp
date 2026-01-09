"use client"

import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useMemo,
  useEffect,
} from "react"

import { useAuth } from "@/contexts/AuthContext"
import type { ProgramId } from "@/features/program-cloak/useProgramContext" // ~Still needed?
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

type TriggerVariant = "mobile" | "empty"

interface ProgramDriveTriggerProps {
  variant?: TriggerVariant
    className?: string
}

/* ========================================================================== */
/* COMPONENT                                                                  */
/* ========================================================================== */

const ProgramDriveTrigger = forwardRef<
  ProgramDriveTriggerHandle,
  ProgramDriveTriggerProps
>(({ variant = "mobile" }, ref) => {
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

  /* AUTH GATE */
  const { user, loading: authLoading } = useAuth()

  if (authLoading) {
    return null
  }

  // if (!user) {
  //   return null
  // }

  if (loading) {
    return null
  }

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
      <div className="flex justify-center items-center p-1 h-10 rounded-lg bg-[var(--gray-7)] shadow-inner">
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

  /* ---------------------------------------------------------------------- */
  /* TRIGGERS                                                               */
  /* ---------------------------------------------------------------------- */

  const DesktopTrigger = (
    <button
      ref={triggerRef}
      onClick={() => setDriveOpen(true)}
      className="
        flex items-center gap-2
        h-10 w-fit px-3
        rounded-2xl bg-gradient-to-br from-[var(--dom-glass)] to-[var(--acc-glass)] hover:brightness-105
        text-md text-[var(--text)] font-bold
        transition-all cursor-pointer shadow-inner
      "
    >
      <span className="truncate">{label}</span>
      {/* <ChevronDown size={16} strokeWidth={2.5} className="w-4 h-4 opacity-60" /> */}
    </button>
  )

  const MobileTrigger = (
    <button
      ref={triggerRef}
      onClick={() => setDriveOpen(true)}
      className="
        relative flex items-center gap-1
        pl-3 w-fit h-12
        text-left text-[var(--text)] font-bold 
        transition-all cursor-pointer
      "
    >
      {!selectedProgram ? (
        <span className="flex items-center opacity-60">Select Program</span>
      ) : (
        <div className="flex flex-col leading-tight truncate">
          <div className="absolute top-[25%] left-[3px] w-[2px] h-[24px] bg-gradient-to-b from-[var(--acc-dk)] to-[#6F8AB4]"></div>
          <span className="w-full max-w-[150px] h-[28px] text-[21px] font-semibold">
            {selectedProgram.sport}
          </span>

          {selectedProgram.year && (
            <span className="w-[141px] h-[13px] text-[9px] font-light truncate">
              {selectedProgram.year} • {selectedProgram.school}
            </span>
          )}
        </div>
      )}
      <ChevronDown size={16} strokeWidth={2.5} className="w-4 h-4 opacity-60" />
    </button>
  )

  const EmptyTrigger = (
    <Button
      ref={triggerRef}
      onClick={() => setDriveOpen(true)}
      className="
        flex items-center gap-2
        h-[38px] px-4
        rounded-full bg-[var(--gray-lt)]
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
      {variant === "empty" ? EmptyTrigger : MobileTrigger}

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
