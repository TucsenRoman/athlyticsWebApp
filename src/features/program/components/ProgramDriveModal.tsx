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
  HardDrive,
  Search,
  Check,
  Pencil,
  Plus,
} from "lucide-react"

import type { ProgramLite } from "../programLite.types"
import type { ProgramId } from "@/features/program-cloak/useProgramContext"

import { getAllPrograms } from "../selectors/getAllPrograms"
import { getArchivedPrograms } from "../selectors/getArchivedPrograms"
import { getDeletedPrograms } from "../selectors/getDeletedPrograms"
import { Divider, GradientHint } from "@/components/ui"
import ProgramDeleteModal from "./ProgramDeleteModal"
import ProgramConfigModal from "./ProgramConfigModal"

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

interface ProgramDriveModalProps {
  open: boolean
  programs: ProgramLite[]
  selectedProgramId: ProgramId | null
  onSelect: (id: ProgramId) => void
  onArchive: (id: ProgramId) => void
  onRestore: (id: ProgramId) => void
  onSoftDelete: (id: ProgramId) => void
  onClose: () => void
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
}: ProgramDriveModalProps) {
  const [query, setQuery] = useState("")
  const [focusedProgramId, setFocusedProgramId] =
    useState<ProgramId | null>(null)

  useEffect(() => {
    if (!open) setFocusedProgramId(null)
  }, [open])

  const [configOpen, setConfigOpen] = useState(false)
  const [configMode, setConfigMode] = useState<"add" | "edit">("add")
  const [configProgram, setConfigProgram] = useState<any | null>(null)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteProgram, setDeleteProgram] = useState<any | null>(null)

  /* ---------------------------------------------------------------------- */
  /* SEARCH                                                                  */
  /* ---------------------------------------------------------------------- */

  const filterByQuery = (list: ProgramLite[]) => {
    if (!query.trim()) return list
    const q = query.toLowerCase()

    return list.filter((p) =>
      [p.sport, p.year, p.school, String(p.id)].some(
        (v) => v && v.toLowerCase().includes(q),
      ),
    )
  }

  /* ---------------------------------------------------------------------- */
  /* DERIVED LISTS                                                           */
  /* ---------------------------------------------------------------------- */

  const allPrograms = useMemo(
    () => filterByQuery(getAllPrograms(programs)),
    [programs, query],
  )

  const archivedPrograms = useMemo(
    () => filterByQuery(getArchivedPrograms(programs)),
    [programs, query],
  )

  const deletedPrograms = useMemo(
    () => filterByQuery(getDeletedPrograms(programs)),
    [programs, query],
  )

  /* ---------------------------------------------------------------------- */
  /* RENDER                                                                  */
  /* ---------------------------------------------------------------------- */

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="gap-2 max-w-3xl p-0 overflow-hidden bg-[var(--vWhite)]">
        {/* HEADER */}
        <div className="flex justify-between gap-2 h-12 py-2 px-4 bg-[var(--vWhite)]">
          <div className="flex items-center gap-2 min-w-0">
            {/* TITLE */}
            <div className="flex items-center pb-[2px] text-lg text-[var(--text-dk)] font-bold">
              Drive
            </div>

            {/* ADD PROGRAM */}
            <div className="sticky bottom-0 flex justify-between backdrop-blur border-[var(--border)] py-2 px-1">
              <Button
                variant="stick"
                regular="xs"
                onClick={() => {
                  setConfigMode("add")
                  setConfigProgram(null)
                  setConfigOpen(true)
                }}
                title="Add Program"
              >
                <Plus/>
              </Button>
            </div>
          </div>
          
          {/* SEARCH */}
          <div className="flex items-center gap-2 mr-6 px-4 w-full max-w-[200px] h-8 rounded-full border border-[var(--border)] focus-within:border-[var(--accent-lt)] text-xs text-[var(--text)]">
            <Search className="h-4 w-4" />
            <Input
              tabIndex={-1}
              className="p-0 border-0 bg-transparent text-sm"
              placeholder="Search programs..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <Divider inset={1} />

        <div className="relative m-1 rounded-lg border border-[var(--border)] bg-[var(--gray-3)] overflow-hidden">
          {/* TABS */}
          <Tabs defaultValue="all">
            <TabsList className="h-10 gap-1 border-0 bg-0">
              <TabsTrigger value="all" className="px-4 text-xs">
                All
              </TabsTrigger>
              <TabsTrigger value="archived" className="px-4 text-xs">
                Archived
              </TabsTrigger>
              <TabsTrigger value="deleted" className="px-4 text-xs">
                Deleted
              </TabsTrigger>
            </TabsList>

            <Divider inset={1} />

            <div className="px-6 pb-[100px] h-[50vh] overflow-y-auto">
              <TabsContent value="all" className="flex flex-col gap-4">
                <ProgramList
                  programs={allPrograms}
                  selectedProgramId={selectedProgramId}
                  focusedProgramId={focusedProgramId}
                  setFocusedProgramId={setFocusedProgramId}
                  onOpen={(id) => {
                    onSelect(id)
                    onClose()
                  }}
                  onEdit={(program) => {
                    setConfigMode("edit")
                    setConfigProgram(program)
                    setConfigOpen(true)
                  }}
                  onDelete={(program) => {
                    onSoftDelete(program.id)
                  }}
                  onArchive={onArchive}
                />
              </TabsContent>

              <TabsContent value="archived">
                <ProgramList
                  programs={archivedPrograms}
                  selectedProgramId={selectedProgramId}
                  focusedProgramId={focusedProgramId}
                  setFocusedProgramId={setFocusedProgramId}
                  onOpen={(id) => {
                    onSelect(id)
                    onClose()
                  }}
                  onDelete={(program) => {
                    onSoftDelete(program.id)
                  }}
                  onRestore={onRestore}
                />
              </TabsContent>

              <TabsContent value="deleted">
                <ProgramList
                  programs={deletedPrograms}
                  selectedProgramId={selectedProgramId}
                  focusedProgramId={focusedProgramId}
                  setFocusedProgramId={setFocusedProgramId}
                  onRestore={onRestore}
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

              <GradientHint debug={false} extent="100px" radius="lg" />
            </div>
          </Tabs>

          <ProgramConfigModal
            mode={configMode}
            open={configOpen}
            program={configProgram}
            onClose={() => setConfigOpen(false)}
            onSubmit={async () => {
              setConfigOpen(false)
              return null
            }}
          />

          <ProgramDeleteModal
            open={deleteOpen}
            program={deleteProgram}
            onClose={() => setDeleteOpen(false)}
            onConfirm={async () => {
              setDeleteOpen(false)
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ========================================================================== */
/* PROGRAM LIST                                                              */
/* ========================================================================== */
const PROGRAM_ID_PREVIEW_LENGTH = 6

function shortId(id: ProgramId) {
  return id ? String(id).slice(0, PROGRAM_ID_PREVIEW_LENGTH) : "—"
}

function ProgramList({
  programs,
  selectedProgramId,
  focusedProgramId,
  setFocusedProgramId,
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
  setFocusedProgramId: (id: ProgramId | null) => void

  onOpen?: (id: ProgramId) => void
  onArchive?: (id: ProgramId) => void
  onRestore?: (id: ProgramId) => void
  onEdit?: (program: ProgramLite) => void
  onDelete?: (program: ProgramLite) => void
  danger?: boolean
}) {
  if (programs.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-[var(--text-lt)]">
        No programs found
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--border)]">
      {programs.map((p) => {
        const isFocused = focusedProgramId === p.id
        const isActive = selectedProgramId === p.id

        return (
          <div
            key={p.id}
            onClick={() => setFocusedProgramId(p.id)}
            className={[
              "relative flex flex-col gap-2 px-4 py-3 transition cursor-pointer",
              "hover:bg-[var(--gray-2)]",
              isFocused && "bg-[var(--gray-3)]",
            ].join(" ")}
          >
            {/* ACTIVE INDICATOR */}
            {isActive && (
              <div className="absolute right-4 top-4 flex items-center gap-1 text-xs text-[var(--accent)]">
                <Check className="h-3 w-3" />
                In use
              </div>
            )}

            <div className="text-sm font-medium">
              {p.sport} • {p.year}
            </div>

            <div className="flex items-center gap-2 text-xs text-[var(--text-lt)] truncate">
              {p.school && <span>{p.school}</span>}
              <span className="opacity-60"> • #{shortId(p.id)}</span>
            </div>


            {/* INLINE ACTIONS -------------------------------------------- */}
            {isFocused && (
              <div
                className="mt-2 flex flex-wrap justify-start gap-10 items-center w-full"
                onClick={(e) => e.stopPropagation()}
              >
                {onOpen && !isActive && (
                  <Button onClick={() => onOpen(p.id)}>
                    Open
                  </Button>
                )}

                {onEdit && (
                  <Button
                    variant="ghost"
                    onClick={() => onEdit(p)}
                  >
                    <Pencil className="h-3 w-3" />
                    Edit
                  </Button>
                )}

                {onArchive && p.state === "active" && (
                  <Button
                    irregular="xs"
                    variant="ghost"
                    onClick={() => onArchive(p.id)}
                  >
                    <Archive className="h-3 w-3" />
                    Archive
                  </Button>
                )}

                {onRestore && (p.state === "archived" || p.state === "deleted") && (
                  <Button
                    irregular="xs"
                    variant="ghost"
                    onClick={() => onRestore(p.id)}
                  >
                    Restore
                  </Button>
                )}

                {onDelete && p.state !== "deleted" && (
                  <Button
                    irregular="xs"
                    variant="danger"
                    onClick={() => onDelete(p)}
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </Button>
                )}

                {/* HARD DELETE (Deleted tab only) */}
                {danger && p.state === "deleted" && (
                  <Button
                    irregular="xs"
                    variant="danger"
                    onClick={() => onDelete(p)}
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete Forever
                  </Button>
                )}
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
