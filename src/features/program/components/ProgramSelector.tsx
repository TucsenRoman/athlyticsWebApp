"use client";

import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";

import { supabase } from "@/integrations/supabase/client";

import type { ProgramId } from "@/features/program-cloak/useProgramContext";
import { useProgramContext } from "@/features/program-cloak/useProgramContext";
import { useDemo } from "@/contexts/DemoContext";

import { ChevronDown, Settings2, Plus, Pencil, Trash2, Archive } from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import { projectInstaller } from "@/integrations/supabase/projectInstaller";

import ExpansiveMenu, {
  type ExpansiveMenuItem,
} from "@/components/ui/navigation/expansivemenu";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/overlays/dropdown-menu";

import { Button } from "@/components/ui/actions/button";

import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
} from "@/components/ui/overlays/dialog";

// SETUP
import ProgramConfigModal from "../setup/ProgramConfigView";

/* -------------------------------------------------------------------------- */
/* TYPES */
/* -------------------------------------------------------------------------- */

import type { Program } from "@/features/program-cloak/useProgramContext";
import ProgramDeleteModal from "../setup/ProgramDeleteModal";
import ProgramArchiveModal from "../setup/ProgramArchiveModal";

export interface ProgramSelectorHandle {
  openPicker: () => void;
}

type ProgramSelectorVariant = "header" | "empty";

interface ProgramSelectorProps {
  selectedProgramId: ProgramId | null;
  onProgramChange: (id: ProgramId | null) => void;

  // controls styling of the trigger ("header" vs "empty")
  variant?: ProgramSelectorVariant;

  // allows demo / parent to inject program list
  programsOverride?: Program[];
}

const toProgram = (
  id: ProgramId,
  data: any
): Program => ({
  id,
  school: data.school ?? null,
  sport: data.sport ?? null,
  year: data.year ?? null,
});

/* -------------------------------------------------------------------------- */
/* STATIC OPTIONS */
/* -------------------------------------------------------------------------- */

const SPORTS = [
  "Cross Country",
  "Track & Radar",
  "Basketball",
  "Football",
  "Soccer",
  "Volleyball",
  "Wrestling",
  "Baseball",
  "Softball",
  "Golf",
  "Tennis",
  "Other",
];

const LEVEL_OPTIONS = [
  "All",
  "Varsity",
  "JV",
  "Freshman",
  "Middle School",
  "A-Team",
  "B-Team",
  "C-Team",
  "D-Team",
];

const GENDERS = ["Boys", "Girls", "Co-ed"];

/* COMPONENT */
const ProgramSelector = forwardRef<ProgramSelectorHandle, ProgramSelectorProps>(
  ({ selectedProgramId, onProgramChange, variant = "header", programsOverride }, ref) => {
    /* STATE */
    const [programs, setPrograms] = useState<Program[]>([]);
    const [loading, setLoading] = useState(true);

    const [pendingAction, setPendingAction] =
      useState<"edit" | "delete" | "archive" | null>(null);

    const [editorMode, setEditorMode] = useState<"add" | "edit" | null>(null);
    const [editorProgram, setEditorProgram] = useState<Program | null>(null);

    const [pendingDelete, setPendingDelete] = useState<Program | null>(null);
    const [pendingArchive, setPendingArchive] = useState<Program | null>(null);

    // External modal state
    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<"add" | "edit">("add");
    const [formProgram, setFormProgram] = useState<Program | null>(null);

    const { demoMode } = useDemo();

    // Demo mutations live in ProgramContext (source of truth)
    const { addProgram, updateProgram, deleteProgram } = useProgramContext();

    const triggerRef = useRef<HTMLButtonElement | null>(null);

    useImperativeHandle(ref, () => ({
      openPicker: () => triggerRef.current?.click(),
    }));

    // SETTINGS PARAMS
    const settingsMenuItems: ExpansiveMenuItem[] = [
      {
        label: "Edit",
        icon: <Pencil size={16} />,
        flavor: "blue",
        action: () => {
          setPendingAction((prev) => (prev === "edit" ? null : "edit"));
        },
      },
      {
        label: "Archive",
        icon: <Archive size={16} />,
        flavor: "yellow",
        action: () => {
          setPendingAction((prev) => (prev === "archive" ? null : "archive"));
        },
      },
      {
        label: "Delete",
        icon: <Trash2 size={16} />,
        flavor: "red",
        destructive: true,
        action: () => {
          setPendingAction((prev) => (prev === "delete" ? null : "delete"));
        },
      },
    ];

    /* ---------------------------------------------------------------------- */
    /* EFFECTIVE PROGRAMS (override wins; no DB reads/writes in demo) */
    /* ---------------------------------------------------------------------- */

    const effectivePrograms = programsOverride ?? programs;

    /* ---------------------------------------------------------------------- */
    /* LOAD PROGRAMS */
    /* ---------------------------------------------------------------------- */

    useEffect(() => {
      console.log("[ProgramSelector]", {
        demoMode,
        programsOverride,
      });

      // If parent injects programs (demo or otherwise), never read from Supabase.
      if (programsOverride) {
        setPrograms(programsOverride);
        setLoading(false);
        return;
      }

      // Demo mode should never talk to Supabase.
      if (demoMode) {
        setLoading(false);
        return;
      }

      const load = async () => {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (!user) {
            setLoading(false);
            return;
          }

          const { data } = await supabase
            .from("programs")
            .select("*")
            .eq("user_id", user.id);

          setPrograms((data || []) as unknown as Program[]);
        } catch (err) {
          console.error("Failed to load programs:", err);
        } finally {
          setLoading(false);
        }
      };

      load();
    }, [programsOverride, demoMode]);

    /* ---------------------------------------------------------------------- */
    /* HELPERS */
    /* ---------------------------------------------------------------------- */

    const isRealProgramId = (id: ProgramId): id is number =>
      typeof id === "number";

    const refreshPrograms = async () => {
      // If programs are injected, they're the source of truth.
      if (programsOverride) {
        setPrograms(programsOverride);
        return;
      }

      // Demo mode never touches Supabase.
      if (demoMode) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("programs")
        .select("*")
        .eq("user_id", user.id);

      setPrograms((data || []) as unknown as Program[]);
    };

    const selectedProgram = effectivePrograms.find((p) => p.id === selectedProgramId);
    const noPrograms = effectivePrograms.length === 0;

    const formattedName = (p: Program) => `${p.sport ?? "Unknown"} • ${p.year ?? "Year"}`;

    const formattedDetails = (p: Program) => p.school ?? "No school";

    // 🔔 Notify other components that the program has new data (packages, ledgers, etc.)
    const notifyProgramUpdated = (id: ProgramId) => {
      // In demo mode IDs can be strings; only dispatch for real numeric IDs
      if (typeof id !== "number") return;

      window.dispatchEvent(
        new CustomEvent("program-updated", { detail: { programId: id } })
      );
    };

    // Helpers to open modal
    const openAddProgram = () => {
      setFormMode("add");
      setFormProgram(null);
      setFormOpen(true);
    };

    const openEditProgram = (p: Program) => {
      setFormMode("edit");
      setFormProgram(p);
      setFormOpen(true);
    };

    // Submit handler for external modal (non-blocking for installer)
    // IMPORTANT: Return type stays Promise<number> for real mode compatibility.
    const handleExternalFormSubmit = async (
      data: any
    ): Promise<ProgramId | null> => {
      /* ------------------------------------------------------------------ */
      /* DEMO MODE (no Supabase, fully interactive)                          */
      /* ------------------------------------------------------------------ */
      if (demoMode || programsOverride) {
        if (formMode === "add") {
          const demoId: ProgramId = `demo-${Date.now()}`;

          const created = toProgram(demoId, data);

          addProgram(created);
          onProgramChange(demoId);

          return demoId;
        }

        if (formMode === "edit" && formProgram) {
          const updated = toProgram(formProgram.id, data);

          updateProgram(updated);

          // Only notify for real programs
          if (isRealProgramId(updated.id)) {
            notifyProgramUpdated(updated.id);
          }

          return updated.id;
        }

        return null;
      }

      /* ------------------------------------------------------------------ */
      /* REAL MODE (Supabase)                                                */
      /* ------------------------------------------------------------------ */

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return null;

      // ADD MODE
      if (formMode === "add") {
        const { data: created, error } = await supabase
          .from("programs")
          .insert([
            {
              user_id: user.id,
              school: data.school,
              sport: data.sport,
              level: data.levels.join(", "),
              gender: data.gender,
              year: data.year,
              season_start: data.seasonStart ?? null,
              season_end: data.seasonEnd ?? null,
            },
          ])
          .select()
          .single();

        if (!created || error) return null;

        const newId = created.id as ProgramId;

        await refreshPrograms();
        onProgramChange(newId);

        if (isRealProgramId(newId)) {
          setTimeout(() => {
            projectInstaller(newId);
            notifyProgramUpdated(newId);
          }, 0);
        }

        return newId;
      }

      // EDIT MODE
      if (formMode === "edit" && formProgram) {
        if (!isRealProgramId(formProgram.id)) return null;

        await supabase
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
          .eq("id", formProgram.id);

        await refreshPrograms();
        notifyProgramUpdated(formProgram.id);

        return formProgram.id;
      }

      return null;
      };

    /* SETTINGS APPLICATION HANDER */
    const handleProgramClick = (p: Program) => {
      if (pendingAction === "edit") {
        openEditProgram(p);
        setPendingAction(null);
        return;
      }

      if (pendingAction === "delete") {
        setPendingDelete(p);
        setPendingAction(null);
        return;
      }

      if (pendingAction === "archive") {
        setPendingArchive(p);
        setPendingAction(null);
        return;
      }

      onProgramChange(p.id);
    };

    /* DELETE HANDLER */
    const handleConfirmDelete = async () => {
      if (!pendingDelete) return;

      // DEMO / OVERRIDE: delete in ProgramContext only (no Supabase)
      if (demoMode || programsOverride) {
        deleteProgram(pendingDelete.id);

        if (selectedProgramId === pendingDelete.id) {
          onProgramChange(null);
        }

        setPendingDelete(null);
        return;
      }

      // REAL: only numeric ids hit Supabase
      if (typeof pendingDelete.id !== "number") {
        setPendingDelete(null);
        return;
      }

      await supabase.from("programs").delete().eq("id", pendingDelete.id);

      await refreshPrograms();

      if (selectedProgramId === pendingDelete.id) {
        onProgramChange(null);
      }

      setPendingDelete(null);
    };

    /* ARCHIVE HANDLER */
    const handleConfirmArchive = async () => {
      if (!pendingArchive) return;

      // DEMO / OVERRIDE
      if (demoMode || programsOverride) {
        // future: mark archived in context
        setPendingArchive(null);
        return;
      }

      // REAL MODE (placeholder)
      // supabase.from("programs").update({ archived: true }).eq("id", pendingArchive.id)

      setPendingArchive(null);
    };


    /* ---------------------------------------------------------------------- */
    /* TRIGGERS — ORIGINAL VARIANT STYLING */
    /* ---------------------------------------------------------------------- */

    const renderHeaderTrigger = () => (
      <button
        ref={triggerRef}
        tabIndex={-1}
        className="
          flex justify-center items-center gap-2
          h-full px-3
          rounded-xl
          transition-colors
          backdrop-blur
          focus:outline-none focus-visible:outline-none
          focus-visible:ring-0 ring-0 focus-visible:ring-offset-0
        "
      >
        <span className="text-sm font-bold truncate">
          {selectedProgram ? formattedName(selectedProgram) : "Select Program"}
        </span>

        <ChevronDown
          size={16}
          className="opacity-70 shrink-0 text-[var(--text-dark)]"
        />
      </button>
    );

    const renderEmptyTrigger = () => (
      <Button
        ref={triggerRef}
        className="
          h-[38px]
          px-4
          rounded-full
          flex items-center gap-2
          bg-[var(--gray-lt)]
          hover:bg-[var(--gray-lt)]
          border border-[var(--border)]
          backdrop-blur-sm
          transition
          text-[var(--text)]
        "
      >
        <span className="font-medium text-sm truncate">
          {selectedProgram ? formattedName(selectedProgram) : "Select Program"}
        </span>

        <ChevronDown size={16} className="opacity-70 text-[var(--text-dark)]" />
      </Button>
    );

    /* ---------------------------------------------------------------------- */
    /* DROPDOWN — ORIGINAL VARIANT STYLING */
    /* ---------------------------------------------------------------------- */

    const renderDropdown = () => (
      <DropdownMenu
        onOpenChange={(open) => {
          if (!open) {
            setPendingAction(null);
          }
        }}
      >
        <DropdownMenuTrigger asChild>
          {variant === "empty" ? renderEmptyTrigger() : renderHeaderTrigger()}
        </DropdownMenuTrigger>

        <DropdownMenuContent
          sideOffset={6}
          align={variant === "header" ? "center" : "start"}
          className={
            variant === "empty"
              ? `
                min-w-[155px] rounded-xl overflow-hidden
                bg-[var(--gray-2)]
                border border-[var(--border)]
                backdrop-blur-xl
                p-0
              `
              : `
                min-w-[190px] rounded-xl relative
                bg-[var(--gray-2)]
                border border-[var(--border)]
                shadow-xl backdrop-blur
              `
          }
        >
          <div
            className={`
              m-1 max-h-[260px] overflow-y-auto custom-scrollbar relative rounded-sm
              ${pendingAction === "edit" ? "flash-edit" : ""}
              ${pendingAction === "delete" ? "flash-delete" : ""}
              ${pendingAction === "archive" ? "flash-archive" : ""}
            `}
          >
            {noPrograms ? (
              <DropdownMenuItem
                className="
                  py-3 px-4 text-sm font-medium
                  text-[var(--accent)]
                  hover:!bg-[var(--accent-bg)]
                  cursor-pointer
                "
                onClick={() => {
                  openAddProgram();
                }}
              >
                + Add Program
              </DropdownMenuItem>
            ) : (
              effectivePrograms.map((p) => (
                <DropdownMenuItem
                  key={String(p.id)}
                  data-selected={selectedProgramId === p.id}
                  className="
                    relative
                    flex justify-start items-center
                    m-1 py-1 px-3
                    gap-2
                    text-sm
                    hover:!bg-[var(--accent-bg)]
                    cursor-pointer
                    pl-3

                    before:absolute before:left-0 
                    before:top-[10px] before:bottom-[10px]
                    before:w-1 before:bg-[var(--accent)] before:rounded-full
                    before:opacity-0 data-[selected=true]:before:opacity-50
                  "
                  onClick={() => handleProgramClick(p)}
                >
                  <div className="flex flex-col min-w-0 truncate">
                    <span className="font-medium text-sm text-[var(--text-dk)]">
                      {formattedName(p)}
                    </span>
                    <span className="text-xs text-[var(--text)]">
                      {formattedDetails(p)}
                    </span>
                  </div>
                </DropdownMenuItem>
              ))
            )}
          </div>

          {variant === "header" && !noPrograms && (
            <div className="sticky bottom-0 flex justify-between backdrop-blur border-t border-[var(--border)] py-2 px-1">
              {/* SETTINGS */}
              <ExpansiveMenu
                items={settingsMenuItems}
                mainIcon={<Settings2 className="h-4 w-4" />}
                expand="line"
                direction="right"
                spacing={35}
                variant="rainbow"
                defaultState="closed"
                autoClose={false}
                mainRotate={90}
              />

              {/* ADD PROGRAM */}
              <Button
                variant="stick"
                onClick={(e) => {
                  e.stopPropagation();
                  openAddProgram();
                }}
                title="Add Program"
              >
                <Plus />
              </Button>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );

    /* RENDER */
    if (loading) {
      return (
        <div className="text-sm text-[var(--text-lt)]">Loading…</div>
      );
    }

    return (
      <>
        {renderDropdown()}

        {/* DELETE CONFIRM */}
        <ProgramDeleteModal
          open={pendingDelete !== null}
          program={
            pendingDelete
              ? {
                  id: pendingDelete.id as number,
                  school: pendingDelete.school ?? null,
                  sport: pendingDelete.sport ?? "Program",
                  season_year: pendingDelete.year ?? "",
                }
              : null
          }
          onClose={() => setPendingDelete(null)}
          onConfirm={handleConfirmDelete}
        />

        <ProgramArchiveModal
          open={pendingArchive !== null}
          program={
            pendingArchive
              ? {
                  id: pendingArchive.id as number,
                  sport: pendingArchive.sport ?? "Program",
                  year: pendingArchive.year ?? "",
                  school: pendingArchive.school ?? null,
                }
              : null
          }
          onClose={() => setPendingArchive(null)}
          onConfirm={handleConfirmArchive}
        />

        <ProgramConfigModal
          mode={formMode}
          open={formOpen}
          program={formProgram}
          onClose={() => setFormOpen(false)}
          onSubmit={handleExternalFormSubmit}
        />
      </>
    );
  }
);

export default ProgramSelector;
