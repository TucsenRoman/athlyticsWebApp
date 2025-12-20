"use client";

import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";

import { supabase } from "@/integrations/supabase/client";

import {
  ChevronDown,
  Settings2,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import { projectInstaller } from "@/integrations/supabase/projectInstaller";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/overlays/dropdown-menu";

import { Button } from "@/components/ui/actions/button";

import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
} from "@/components/ui/overlays/dialog";

// import { Input } from "@/components/ui/forms/input";

// import {
//   Select,
//   SelectTrigger,
//   SelectValue,
//   SelectContent,
//   SelectItem,
// } from "@/components/ui/forms/select";

import { useEditMode } from "@/contexts/EditModeContext";

// SETUP
import ProgramSetupView from "../setup/ProgramSetupView";

/* -------------------------------------------------------------------------- */
/* TYPES */
/* -------------------------------------------------------------------------- */

export interface Program {
  id: number;
  user_id: string;
  school: string | null;
  sport: string | null;
  level: string | null;
  gender: string | null;
  year: string | null;
}

export interface ProgramSelectorHandle {
  openPicker: () => void;
}

type ProgramSelectorVariant = "header" | "empty";

interface ProgramSelectorProps {
  selectedProgramId: number | null;
  onProgramChange: (id: number | null) => void;
  variant?: ProgramSelectorVariant;
}

/* -------------------------------------------------------------------------- */
/* STATIC OPTIONS */
/* -------------------------------------------------------------------------- */

const SPORTS = [
  "Cross Country",
  "Track & Field",
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

/* -------------------------------------------------------------------------- */
/* COMPONENT */
/* -------------------------------------------------------------------------- */

const ProgramSelector = forwardRef<ProgramSelectorHandle, ProgramSelectorProps>(
  ({ selectedProgramId, onProgramChange, variant = "header" }, ref) => {
    /* ---------------------------------------------------------------------- */
    /* STATE */
    /* ---------------------------------------------------------------------- */

    const [programs, setPrograms] = useState<Program[]>([]);
    const [loading, setLoading] = useState(true);

    const [pendingAction, setPendingAction] =
      useState<"edit" | "delete" | null>(null);

    const [editorMode, setEditorMode] = useState<"add" | "edit" | null>(null);
    const [editorProgram, setEditorProgram] = useState<Program | null>(null);

    const [pendingDelete, setPendingDelete] = useState<Program | null>(null);

    // External modal state
    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<"add" | "edit">("add");
    const [formProgram, setFormProgram] = useState<Program | null>(null);

    const { isEditMode, setIsEditMode } = useEditMode();

    const triggerRef = useRef<HTMLButtonElement | null>(null);

    useImperativeHandle(ref, () => ({
      openPicker: () => triggerRef.current?.click(),
    }));

    /* ---------------------------------------------------------------------- */
    /* LOAD PROGRAMS */
    /* ---------------------------------------------------------------------- */

    useEffect(() => {
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

          setPrograms(data || []);
        } catch (err) {
          console.error("Failed to load programs:", err);
        } finally {
          setLoading(false);
        }
      };

      load();
    }, []);

    /* ---------------------------------------------------------------------- */
    /* HELPERS */
    /* ---------------------------------------------------------------------- */

    const refreshPrograms = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("programs")
        .select("*")
        .eq("user_id", user.id);

      setPrograms(data || []);
    };

    const selectedProgram = programs.find((p) => p.id === selectedProgramId);
    const noPrograms = programs.length === 0;

    const formattedName = (p: Program) =>
      `${p.sport ?? "Unknown"} • ${p.year ?? "Year"}`;

    const formattedDetails = (p: Program) =>
      p.school ?? "No school";

    // 🔔 Notify other components that the program has new data (packages, ledgers, etc.)
    const notifyProgramUpdated = (id: number) => {
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
    const handleExternalFormSubmit = async (data) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      /* -------------------------------------------------------------- */
      /* ADD MODE                                                       */
      /* -------------------------------------------------------------- */
      if (formMode === "add") {
        const { data: created, error } = await supabase
          .from("programs")
          .insert([{
            user_id: user.id,
            school: data.school,
            sport: data.sport,
            level: data.levels.join(", "),
            gender: data.gender,
            year: data.seasonYear,
          }])
          .select()
          .single();

        if (!created || error) {
          console.error("Program create error:", error);
          return 0;
        }

        const newId = created.id;

        // Update UI immediately
        await refreshPrograms();
        onProgramChange(newId);

        // 🔥 Run installer *after* modal closes → async & non-blocking
        setTimeout(async () => {
          await projectInstaller(newId);
          notifyProgramUpdated(newId);
        }, 0);

        return newId;
      }

      /* -------------------------------------------------------------- */
      /* EDIT MODE                                                      */
      /* -------------------------------------------------------------- */
      if (formMode === "edit" && formProgram) {
        await supabase
          .from("programs")
          .update({
            school: data.school,
            sport: data.sport,
            level: data.levels.join(", "),
            gender: data.gender,
            year: data.seasonYear,
          })
          .eq("id", formProgram.id);

        await refreshPrograms();

        // Notify other components — name/order might have changed
        notifyProgramUpdated(formProgram.id);

        return formProgram.id;
      }

      return 0;
    };

    /* ---------------------------------------------------------------------- */
    /* CLICK HANDLING */
    /* ---------------------------------------------------------------------- */

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

      onProgramChange(p.id);
    };

    /* ---------------------------------------------------------------------- */
    /* DELETE */
    /* ---------------------------------------------------------------------- */

    const handleConfirmDelete = async () => {
      if (!pendingDelete) return;

      await supabase
        .from("programs")
        .delete()
        .eq("id", pendingDelete.id);

      await refreshPrograms();

      if (selectedProgramId === pendingDelete.id) {
        onProgramChange(null);
      }

      setPendingDelete(null);
    };

    /* ---------------------------------------------------------------------- */
    /* EDIT ACTIONS (floating circle buttons) */
    /* ---------------------------------------------------------------------- */

    const renderActions = () => {
      const items = [
        // {
        //   label: "Add",
        //   icon: <Plus size={20} className="text-[var(--text)]" />,
        //   action: () => openAddProgram(),
        // },
        {
          label: "Edit",
          icon: <Pencil size={20} className="text-[var(--edit)]" />,
          action: () =>
            setPendingAction((p) => (p === "edit" ? null : "edit")),
        },
        {
          label: "Delete",
          icon: (
            <Trash2
              size={20}
              className="text-[var(--danger)]"
            />
          ),
          destructive: true,
          action: () =>
            setPendingAction((p) => (p === "delete" ? null : "delete")),
        },
      ];

      return (
        <AnimatePresence>
          {isEditMode &&
            items.map((a, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0, x: 0 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  x: (i + 1) * 42,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.8,
                  x: 0,
                }}
                transition={{ duration: 0.25, delay: i * 0.05 }}
                className="absolute bottom-2.5 left-1"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    a.action();
                  }}
                  className={`
                    h-8 w-8 flex items-center justify-center rounded-full shadow-md transition-all
                    ${
                      a.label === "Edit"
                        ? "bg-[var(--bg)] hover:bg-[var(--edit-bg)]"
                        : a.destructive
                        ? "bg-[var(--bg)] hover:bg-[var(--danger-bg)]"
                        : "bg-[var(--bg)] hover:bg-[var(--gray-200)]"
                    }
                  `}
                >
                  {a.icon}
                </button>
              </motion.div>
            ))}
        </AnimatePresence>
      );
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
          bg-[var(--bg)]
          hover:bg-[var(--bg)]
          border border-[var(--border)]
          backdrop-blur-sm
          transition
          text-[var(--foreground)]
        "
      >
        <span className="font-medium text-sm truncate">
          {selectedProgram ? formattedName(selectedProgram) : "Select Program"}
        </span>

        <ChevronDown
          size={16}
          className="opacity-70 text-[var(--text-dark)]"
        />
      </Button>
    );

    /* ---------------------------------------------------------------------- */
    /* DROPDOWN — ORIGINAL VARIANT STYLING */
    /* ---------------------------------------------------------------------- */

    const renderDropdown = () => (
      <DropdownMenu
        onOpenChange={(open) => {
          if (!open) {
            setIsEditMode(false);
            setPendingAction(null);
          }
        }}
      >
        <DropdownMenuTrigger asChild>
          {variant === "empty"
            ? renderEmptyTrigger()
            : renderHeaderTrigger()}
        </DropdownMenuTrigger>

        <DropdownMenuContent
          sideOffset={6}
          align={variant === "header" ? "center" : "start"}
          className={
            variant === "empty"
              ? `
                min-w-[155px] rounded-xl overflow-hidden
                bg-[var(--bg)]
                border border-[var(--border)]
                backdrop-blur-xl
                p-0
              `
              : `
                min-w-[180px] rounded-xl relative
                bg-[var(--bg)]
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
              programs.map((p) => (
                <DropdownMenuItem
                  key={p.id}
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
                    <span className="font-medium text-sm text-[var(--text-dark)]">
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
            <div className="sticky bottom-0 flex justify-between bg-transparent backdrop-blur border-t border-[var(--border)] py-2 px-1">
              {/* SETTINGS */}
              <Button
                className={`
                  h-9 w-9 rounded-full transition-all relative z-50 bg-[var(--bg)]
                  ${
                    isEditMode
                      ? "hover:bg-[var(--accent-bg)] text-[var(--accent)] shadow-lg"
                      : "hover:bg-[var(--gray-300)] text-[var(--text)]"
                  }
                `}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditMode(!isEditMode);
                  setPendingAction(null);
                }}
              >
                <motion.div
                  animate={{ rotate: isEditMode ? -90 : 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                  }}
                  className="flex items-center justify-center"
                >
                  <Settings2 className="scale-[1.3]" />
                </motion.div>
              </Button>

              {renderActions()}

              {/* ADD PROGRAM */}
              <Button
                variant="accent"
                size="icon"
                className="h-8 w-8 rounded-full shadow-md hover:shadow-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  openAddProgram();
                }}
                title="Add Program"
              >
                <Plus size={16} />
              </Button>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );

    /* ---------------------------------------------------------------------- */
    /* RENDER */
    /* ---------------------------------------------------------------------- */

    if (loading) {
      return (
        <div className="text-sm text-[var(--muted-foreground)]">
          Loading…
        </div>
      );
    }

    return (
      <>
        {renderDropdown()}
        {/* DELETE CONFIRM */}
        <Dialog
          open={pendingDelete !== null}
          onOpenChange={(open) => {
            if (!open) setPendingDelete(null);
          }}
        >
          <DialogContent className="sm:max-w-md bg-[var(--card)] text-[var(--card-foreground)]">
            <DialogHeader>
              <DialogTitle>Delete Program?</DialogTitle>
            </DialogHeader>

            <p className="text-sm text-[var(--muted-foreground)]">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-[var(--accent)]">
                {pendingDelete?.school} {pendingDelete?.sport}, {pendingDelete?.year}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="flex flex-col gap-2 mt-5">
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleConfirmDelete}
              >
                Delete Program
              </Button>

              <Button
                variant="outline"
                onClick={() => setPendingDelete(null)}
              >
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <ProgramSetupView
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
