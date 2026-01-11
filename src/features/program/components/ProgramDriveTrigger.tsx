"use client"

import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useMemo,
  useEffect,
  useLayoutEffect,
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

type TriggerVariant = "header" | "empty"

interface ProgramDriveTriggerProps {
  variant?: TriggerVariant
  className?: string

  programs: ProgramLite[]
  loading: boolean
  archiveProgram: (id: ProgramId) => Promise<void>
  restoreProgram: (id: ProgramId) => Promise<void>
  deleteProgram: (id: ProgramId) => Promise<void>
  refreshPrograms: () => Promise<void>
}


/* ========================================================================== */
/* COMPONENT                                                                  */
/* ========================================================================== */

const ProgramDriveTrigger = forwardRef<
  ProgramDriveTriggerHandle,
  ProgramDriveTriggerProps
>(function ProgramDriveTrigger(
  {
    variant = "header",
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
  /* DATA                                                                    */
  /* ---------------------------------------------------------------------- */

  const { selectedProgramId, setSelectedProgramId } = useProgramContext()

  const [driveOpen, setDriveOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)

  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const sportRef = useRef<HTMLSpanElement>(null);

  useImperativeHandle(ref, () => ({
    open: () => setDriveOpen(true),
  }))

  const selectedProgram = programs.find(
    (p) => p.id === selectedProgramId,
  )

  useLayoutEffect(() => {
    if (!sportRef.current) return;

    const el = sportRef.current;
    const parent = el.parentElement;
    if (!parent) return;

    const update = () => {
      parent.style.setProperty("--sport-w", `${el.offsetWidth}px`);
    };

    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);

    return () => ro.disconnect();
  }, [selectedProgram]);

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

  const label = selectedProgram
    ? `${selectedProgram.sport || "Program"} • ${selectedProgram.year || ""}`
    : "Select Program"

  const hasPrograms = programs.length > 0

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
  const HeaderTrigger = (
    <button
      ref={triggerRef}
      onClick={() => setDriveOpen(true)}
      className="
        relative flex items-center gap-1
        pl-3 w-full h-12
        text-left text-[var(--text)] font-bold 
        transition-all cursor-pointer
      "
    >
      {!selectedProgram ? (
        <span className="flex items-center opacity-60">Select Program</span>
      ) : (
        <div className="flex flex-col leading-tight">
          <div className="absolute top-[25%] left-[3px] w-[3px] h-6 rounded-full bg-gradient-to-b from-[var(--acc-dk)] to-[#6F8AB4]" />
          <span
            ref={sportRef}
            className="
              flex items-center gap-2
              max-w-[200px] md:w-fit md:max-w-none
            "
          >
            <span className="truncate text-[21px] font-semibold">
              {selectedProgram.sport}
            </span>

            <span className="text-sm opacity-50 shrink-0">
              {formatGenderAbbrev(selectedProgram.gender)}
            </span>
          </span>

          <span className="max-w-[var(--sport-w)] h-3 text-[9.5px] font-light truncate">
            {selectedProgram.year} <span className="opacity-50">•</span>{" "}
            {selectedProgram.school}
          </span>
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
      {variant === "empty" ? EmptyTrigger : HeaderTrigger}

      <ProgramDriveModal
        open={driveOpen}
        programs={programs}
        selectedProgramId={selectedProgramId}
        onSelect={(id) => {
          setSelectedProgramId(id)
          if (id != null) setDriveOpen(false)
        }}
        onArchive={archiveProgram}
        onRestore={restoreProgram}
        onSoftDelete={deleteProgram}
        refreshPrograms={refreshPrograms}
        onClose={async () => {
          await refreshPrograms()
          setDriveOpen(false)
        }}
      />
    </>
  )
})

ProgramDriveTrigger.displayName = "ProgramDriveTrigger"
export default ProgramDriveTrigger
