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
import { installDefaultPackage } from "@/components/discovery/discoverylogic/installDefaultPackage";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { useEditMode } from "@/contexts/EditModeContext";

/* -------------------------------------------------------------------------- */
/*  TYPES                                                                     */
/* -------------------------------------------------------------------------- */

interface Program {
  id: number;
  sport: string;
  level: string;
  gender: string;
  school: string;
  season_year: string;
}

export interface ProgramSelectorHandle {
  openPicker: () => void;
}

type ProgramSelectorVariant = "header" | "empty";

interface ProgramSelectorProps {
  selectedProgramId: number | null;
  onProgramChange: (programId: number | null) => void;
  variant?: ProgramSelectorVariant;
}

/* -------------------------------------------------------------------------- */
/*  STATIC OPTIONS                                                            */
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
/*  MAIN COMPONENT                                                            */
/* -------------------------------------------------------------------------- */

const ProgramSelector = forwardRef<ProgramSelectorHandle, ProgramSelectorProps>(
  function ProgramSelector(
    { selectedProgramId, onProgramChange, variant = "header" },
    ref
  ) {
    /* -------------------------------- STATE -------------------------------- */

    const [programs, setPrograms] = useState<Program[]>([]);
    const [loading, setLoading] = useState(true);

    // Action modes
    const [pendingAction, setPendingAction] = useState<"edit" | "delete" | null>(
      null
    );

    const [editorMode, setEditorMode] = useState<"add" | "edit" | null>(null);
    const [editorProgram, setEditorProgram] = useState<Program | null>(null);

    const [pendingDelete, setPendingDelete] = useState<Program | null>(null);

    // Add/Edit Modal fields
    const [school, setSchool] = useState("");
    const [sport, setSport] = useState("");
    const [customSport, setCustomSport] = useState("");
    const [levels, setLevels] = useState<string[]>([]);
    const [gender, setGender] = useState("");
    const [seasonYear, setSeasonYear] = useState("");

    const { isEditMode, setIsEditMode } = useEditMode();

    const triggerRef = useRef<HTMLButtonElement | null>(null);

    useImperativeHandle(ref, () => ({
      openPicker: () => triggerRef.current?.click(),
    }));

    /* --------------------------- LOAD USER + PROGRAMS ---------------------- */

    useEffect(() => {
      const load = async () => {
        try {
          const { data: userData } = await supabase.auth.getUser();
          const user = userData?.user;
          if (!user) {
            setLoading(false);
            return;
          }

          const { data } = await supabase
            .from("programs")
            .select("*")
            .eq("coach_id", user.id);

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
    /* HELPERS                                                                */
    /* ---------------------------------------------------------------------- */

    const refreshPrograms = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) return;

      const { data } = await supabase
        .from("programs")
        .select("*")
        .eq("coach_id", user.id);

      setPrograms(data || []);
    };

    const resetForm = () => {
      setSchool("");
      setSport("");
      setCustomSport("");
      setLevels([]);
      setGender("");
      setSeasonYear("");
    };

    const hydrateForm = (program: Program) => {
      setSchool(program.school);
      setSport(program.sport);
      setCustomSport(program.sport === "Other" ? program.sport : "");
      setLevels(
        program.level ? program.level.split(",").map((s) => s.trim()) : []
      );
      setGender(program.gender);
      setSeasonYear(program.season_year);
    };

    const selectedProgram = programs.find((p) => p.id === selectedProgramId);
    const noPrograms = programs.length === 0;

    const formatName = (p: Program) => `${p.sport} • ${p.season_year}`;
    const formatDetails = (p: Program) => p.school;

    const effectiveSport =
      sport === "Other" ? customSport.trim() : sport.trim();

    /* ---------------------------------------------------------------------- */
    /* PROGRAM CLICK HANDLING                                                 */
    /* ---------------------------------------------------------------------- */

    const handleProgramClick = (program: Program) => {
      // EDIT MODE
      if (pendingAction === "edit") {
        hydrateForm(program);
        setEditorProgram(program);
        setEditorMode("edit");
        setPendingAction(null);
        return;
      }

      // DELETE MODE
      if (pendingAction === "delete") {
        setPendingDelete(program);
        setPendingAction(null);
        return;
      }

      // NORMAL SELECT
      onProgramChange(program.id);
    };

    /* ---------------------------------------------------------------------- */
    /* ADD + EDIT SUBMIT HANDLING                                             */
    /* ---------------------------------------------------------------------- */

    const handleSubmit = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      if (!school.trim() || !effectiveSport || !gender || !seasonYear) return;

      let createdProgramId: number | null = null;

      /* ---------------------------------------------------------------------- */
      /* ADD NEW PROGRAM                                                        */
      /* ---------------------------------------------------------------------- */
      if (editorMode === "add") {
        const { data: created, error: createErr } = await supabase
          .from("programs")
          .insert([
            {
              coach_id: user.id,
              school: school.trim(),
              sport: effectiveSport,
              level: levels.join(", "),
              gender,
              season_year: seasonYear.trim(),
            },
          ])
          .select()
          .single();

        if (createErr || !created) {
          console.error("Program creation failed:", createErr);
          return;
        }

        createdProgramId = created.id;

        // AUTO-INSTALL STARTER PACKAGE
        const install = await installDefaultPackage(createdProgramId, user.id);
        if (!install.success) {
          console.error("Package install failed:", install.error);
        }
      }

      /* ---------------------------------------------------------------------- */
      /* EDIT EXISTING PROGRAM                                                  */
      /* ---------------------------------------------------------------------- */
      if (editorMode === "edit" && editorProgram) {
        await supabase
          .from("programs")
          .update({
            school: school.trim(),
            sport: effectiveSport,
            level: levels.join(", "),
            gender,
            season_year: seasonYear.trim(),
          })
          .eq("id", editorProgram.id);
      }

      /* ---------------------------------------------------------------------- */
      /* REFRESH + RESET UI                                                     */
      /* ---------------------------------------------------------------------- */
      await refreshPrograms();

      setEditorMode(null);
      setEditorProgram(null);
      resetForm();
    };

    /* ---------------------------------------------------------------------- */
    /* DELETE CONFIRM HANDLING                                                */
    /* ---------------------------------------------------------------------- */

    const handleConfirmDelete = async () => {
      if (!pendingDelete) return;

      await supabase.from("programs").delete().eq("id", pendingDelete.id);

      await refreshPrograms();

      if (selectedProgramId === pendingDelete.id) {
        onProgramChange(null);
      }

      setPendingDelete(null);
    };

    /* ---------------------------------------------------------------------- */
    /* ROWSMENU-STYLE EXPANDING BUTTON BAR                                     */
    /* ---------------------------------------------------------------------- */

    const renderActions = () => {
      const items = [
        {
          label: "Add",
          icon: (
            <Plus
              size={20}
              className="text-[hsl(var(--foreground))]"
            />
          ),
          action: () => {
            resetForm();
            setEditorMode("add");
            setEditorProgram(null);
          },
        },
        {
          label: "Edit",
          icon: (
            <Pencil
              size={20}
              className="text-[var(--secondary-700)]/80"
            />
          ),
          action: () =>
            setPendingAction((p) => (p === "edit" ? null : "edit")),
        },
        {
          label: "Delete",
          icon: (
            <Trash2
              size={20}
              className="text-[hsl(var(--destructive))]"
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
                  className={`h-8 w-8 flex items-center justify-center rounded-full shadow-md transition-all
                    ${
                      a.label === "Edit" && pendingAction === "edit"
                        ? "bg-[var(--primary-100)]"
                        : a.destructive
                        ? "bg-[hsl(var(--background))] hover:bg-[hsl(var(--destructive))]/15"
                        : "bg-[hsl(var(--background))] hover:bg-[hsl(var(--muted))]/40"
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
    /* TRIGGERS                                                               */
    /* ---------------------------------------------------------------------- */

    const renderHeaderTrigger = () => (
      <Button
        ref={triggerRef}
        variant="outline"
        className="
          flex items-center gap-2
          h-10 px-3
          rounded-xl
          bg-[hsl(var(--secondary))]/20
          text-[hsl(var(--foreground))]
          border border-[hsl(var(--border))]
          transition-colors
          hover:bg-[hsl(var(--secondary))]/30
        "
      >
        <span className="font-medium text-sm truncate">
          {selectedProgram ? formatName(selectedProgram) : "Select Program"}
        </span>

        <ChevronDown
          size={16}
          className="opacity-70 shrink-0 text-[var(--primary-500)]"
        />
      </Button>
    );

    const renderEmptyTrigger = () => (
      <Button
        ref={triggerRef}
        variant="ghost"
        className="
          h-[38px]
          px-4
          rounded-full
          flex items-center gap-2
          bg-[hsl(var(--background))]/70
          hover:bg-[hsl(var(--background))]/90
          border border-[hsl(var(--border))]/70
          shadow-athletic
          backdrop-blur-sm
          transition
          text-[hsl(var(--foreground))]
        "
      >
        <span className="font-medium text-sm truncate">
          {selectedProgram ? formatName(selectedProgram) : "Select Program"}
        </span>

        <ChevronDown
          size={16}
          className="opacity-70 text-[var(--primary-500)]"
        />
      </Button>
    );

    /* ---------------------------------------------------------------------- */
    /* DROPDOWN (with tinted scroll region)                                   */
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
          {variant === "empty" ? renderEmptyTrigger() : renderHeaderTrigger()}
        </DropdownMenuTrigger>

        <DropdownMenuContent
          sideOffset={6}
          align={variant === "header" ? "center" : "start"}
          className={
            variant === "empty"
              ? `
                w-[190px] rounded-3xl overflow-hidden
                bg-[hsl(var(--background))]/95
                border border-[hsl(var(--border))]
                backdrop-blur-xl
                p-0 shadow-athletic
              `
              : `
                w-fit rounded-xl relative
                bg-[hsl(var(--background))]/98
                border border-[hsl(var(--border))]
                shadow-xl backdrop-blur
              `
          }
        >
          <div
            className={`
              max-h-[260px] overflow-y-auto transition-all custom-scrollbar
              ${
                pendingAction === "edit"
                  ? "animate-pulse bg-[var(--primary-100)]/40"
                  : pendingAction === "delete"
                  ? "animate-pulse bg-[hsl(var(--destructive))]/12"
                  : ""
              }
            `}
          >
            {noPrograms ? (
              <DropdownMenuItem
                className="
                  py-3 px-4 text-sm font-medium
                  text-[var(--primary-500)]
                  hover:bg-[var(--primary-500)]/12
                  cursor-pointer
                "
                onClick={() => {
                  resetForm();
                  setEditorMode("add");
                  setEditorProgram(null);
                }}
              >
                + Add Program
              </DropdownMenuItem>
            ) : (
              programs.map((p) => (
                <DropdownMenuItem
                  key={p.id}
                  className="
                    py-3 px-4 text-sm
                    hover:bg-[var(--primary-100)]/10
                    cursor-pointer
                  "
                  onClick={() => handleProgramClick(p)}
                >
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium text-sm truncate">
                      {formatName(p)}
                    </span>
                    <span className="text-xs text-[hsl(var(--muted-foreground))] truncate">
                      {formatDetails(p)}
                    </span>
                  </div>
                </DropdownMenuItem>
              ))
            )}
          </div>

          {variant === "header" && !noPrograms && (
            <div className="sticky bottom-0 bg-transparent backdrop-blur border-t border-[hsl(var(--border))] py-2 pl-1">
              <Button
                variant="ghost"
                className={`
                  h-9 w-9 rounded-full transition-all relative z-50
                  ${
                    isEditMode
                      ? "bg-[hsl(var(--primary))]/25 ring-2 ring-[hsl(var(--primary))]/60"
                      : "bg-transparent hover:bg-[hsl(var(--muted))]/40"
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
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="flex items-center justify-center"
                >
                  <Settings2
                    className={`
                      scale-[1.3] transition-colors
                      ${
                        isEditMode
                          ? "text-[hsl(var(--primary))]"
                          : "text-[hsl(var(--muted-foreground))]"
                      }
                    `}
                  />
                </motion.div>
              </Button>

              {renderActions()}
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );

    /* ---------------------------------------------------------------------- */
    /* RENDER                                                                  */
    /* ---------------------------------------------------------------------- */

    if (loading) {
      return (
        <div className="text-sm text-[hsl(var(--muted-foreground))]">
          Loading…
        </div>
      );
    }

    return (
      <>
        {renderDropdown()}

        {/* ADD / EDIT MODAL */}
        <Dialog
          open={editorMode !== null}
          onOpenChange={(open) => {
            if (!open) {
              setEditorMode(null);
              setEditorProgram(null);
              resetForm();
            }
          }}
        >
          <DialogContent className="sm:max-w-md bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))]">
            <DialogHeader>
              <DialogTitle className="text-[hsl(var(--foreground))]">
                {editorMode === "add" ? "Add Program" : "Edit Program"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <Input
                placeholder="School (e.g., Zimmerman High School)"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
              />

              {/* Sport */}
              <Select value={sport} onValueChange={setSport}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Sport" />
                </SelectTrigger>
                <SelectContent>
                  {SPORTS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {sport === "Other" && (
                <Input
                  className="mt-1"
                  placeholder="Custom Sport"
                  value={customSport}
                  onChange={(e) => setCustomSport(e.target.value)}
                />
              )}

              {/* Level multi-select */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="
                      w-full justify-between
                      border-[hsl(var(--border))]
                      bg-[hsl(var(--background))]
                      hover:bg-[hsl(var(--muted))]/30
                    "
                  >
                    {levels.length === 0
                      ? "Select Levels"
                      : levels.length > 2
                      ? `${levels.length} levels selected`
                      : levels.join(", ")}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-[hsl(var(--background))]/98 border border-[hsl(var(--border))] shadow-md">
                  {LEVEL_OPTIONS.map((lvl) => (
                    <DropdownMenuCheckboxItem
                      key={lvl}
                      checked={levels.includes(lvl)}
                      onCheckedChange={(checked) => {
                        setLevels((prev) =>
                          checked
                            ? [...prev, lvl]
                            : prev.filter((v) => v !== lvl)
                        );
                      }}
                      onSelect={(e) => e.preventDefault()}
                      className="cursor-pointer data-[state=checked]:bg-[var(--primary-500)]/10"
                    >
                      {lvl}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Gender */}
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger>
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent>
                  {GENDERS.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Season */}
              <Input
                placeholder="Season / Year (e.g., 2024-2025)"
                value={seasonYear}
                onChange={(e) => setSeasonYear(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <Button
                className="
                  bg-[var(--primary-500)]
                  hover:bg-[var(--primary-500)]/90
                  text-[var(--primary-foreground)]
                "
                onClick={handleSubmit}
              >
                {editorMode === "add" ? "Create Program" : "Save Changes"}
              </Button>

              <Button
                variant="outline"
                className="border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]/20"
                onClick={() => {
                  setEditorMode(null);
                  setEditorProgram(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* DELETE CONFIRM MODAL */}
        <Dialog
          open={pendingDelete !== null}
          onOpenChange={(open) => {
            if (!open) setPendingDelete(null);
          }}
        >
          <DialogContent className="sm:max-w-md bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))]">
            <DialogHeader>
              <DialogTitle className="text-[hsl(var(--foreground))]">
                Delete Program?
              </DialogTitle>
            </DialogHeader>

            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-[var(--secondary-700)]">
                {pendingDelete?.sport} • {pendingDelete?.season_year}
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
                className="border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]/20"
                onClick={() => setPendingDelete(null)}
              >
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }
);

export default ProgramSelector;
