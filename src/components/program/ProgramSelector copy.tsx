import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChevronDown, Settings2, Plus, CircleX, Trash2, Pencil } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
    {
      selectedProgramId,
      onProgramChange,
      variant = "header",
    }: ProgramSelectorProps,
    ref
  ) {
    /* -------------------------------- STATE -------------------------------- */

    const [programs, setPrograms] = useState<Program[]>([]);
    const [userName, setUserName] = useState("");

    const [loading, setLoading] = useState(true);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [actionsOpen, setActionsOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editProgram, setEditProgram] = useState<Program | null>(null);
    const [pendingAction, setPendingAction] = useState<"edit" | "delete" | null>(null);
    const [flashProgramId, setFlashProgramId] = useState<string | null>(null);
    const [pendingDeleteProgram, setPendingDeleteProgram] = useState<Program | null>(null);

    // Form state (shared for add + edit)
    const [school, setSchool] = useState("");
    const [sport, setSport] = useState("");
    const [customSport, setCustomSport] = useState("");
    const [levels, setLevels] = useState<string[]>([]);
    const [gender, setGender] = useState("");
    const [seasonYear, setSeasonYear] = useState("");

    const { isEditMode, setIsEditMode } = useEditMode();

    // ref to trigger button for programmatic open
    const triggerRef = useRef<HTMLButtonElement | null>(null);

    useImperativeHandle(ref, () => ({
      openPicker: () => {
        triggerRef.current?.click();
      },
    }));

    /* --------------------------- LOAD USER + PROGRAMS ---------------------- */

    useEffect(() => {
      const fetchUserAndPrograms = async () => {
        try {
          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser();
          if (userError) throw userError;

          if (!user) {
            setLoading(false);
            return;
          }

          const { data: profileData } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", user.id)
            .single();

          if (profileData?.full_name) {
            setUserName(profileData.full_name);
          }

          const { data: programsData, error: programsError } = await supabase
            .from("programs")
            .select("*")
            .eq("coach_id", user.id);

          if (programsError) throw programsError;

          setPrograms(programsData || []);
        } catch (error) {
          console.error("Error fetching programs:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchUserAndPrograms();
    }, []);

    /* ------------------------------- HELPERS -------------------------------- */

    const resetForm = () => {
      setSchool("");
      setSport("");
      setCustomSport("");
      setLevels([]);
      setGender("");
      setSeasonYear("");
    };

    const hydrateFormFromProgram = (program: Program) => {
      setSchool(program.school);
      setSport(program.sport);
      setLevels(
        program.level ? program.level.split(",").map((s) => s.trim()) : []
      );
      setGender(program.gender);
      setSeasonYear(program.season_year);
      setCustomSport(program.sport === "Other" ? program.sport : "");
    };

    const selectedProgram = programs.find((p) => p.id === selectedProgramId);

    const formatProgramName = (program: Program) =>
      `${program.sport} • ${program.season_year}`;

    const formatProgramDetails = (program: Program) => program.school;

    const effectiveSportValue =
      sport === "Other" ? customSport.trim() : sport.trim();

  /* -------------------- ROWSMENU-STYLE LINEAR EXPANSION -------------------- */
  const renderProgramActionsLinear = (items: any[], spacing = 42) => (
    <AnimatePresence>
      {items.map((a, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: 0, scale: 0 }}
          animate={{
            opacity: 1,
            x: (i + 1) * spacing,
            y: 0,
            scale: 1,
          }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ duration: 0.25, delay: i * 0.05 }}
          className="absolute left- bottom-00.5 pointer-events-auto z-[99999]"
        >
          <button
            title={a.label}
            onClick={(e) => {
              e.stopPropagation();
              a.action?.();
            }}
            className={`group h-8 w-8 flex items-center justify-center rounded-full shadow-md transition-all duration-200
              ${
                a.destructive
                  ? "bg-white hover:bg-[#f39ca3]"
                  : "bg-white hover:bg-muted/40"
              }`}
          >
            <div
              className={`transition-colors duration-200 ${
                a.destructive
                  ? "text-[#e63946] group-hover:text-[#6e6e6e]"
                  : "text-inherit group-hover:text-[hsl(var(--primary))]"
              }`}
            >
              {a.icon}
            </div>
          </button>
        </motion.div>
      ))}
    </AnimatePresence>
  );

    /* ------------------------------- ADD PROGRAM ---------------------------- */

    const handleAddProgram = async () => {
      if (!school.trim() || !effectiveSportValue || !gender || !seasonYear) {
        // You can hook up a toast here if you want.
        return;
      }

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase.from("programs").insert([
          {
            coach_id: user.id,
            school: school.trim(),
            sport: effectiveSportValue,
            level: levels.join(", "),
            gender,
            season_year: seasonYear.trim(),
          },
        ]);

        if (error) throw error;

        resetForm();
        setIsAddModalOpen(false);

        // refresh
        const { data: programsData, error: programsError } = await supabase
          .from("programs")
          .select("*")
          .eq("coach_id", user.id);

        if (programsError) throw programsError;
        setPrograms(programsData || []);
      } catch (error) {
        console.error("Add failed:", error);
      }
    };

    /* ------------------------------ UPDATE PROGRAM -------------------------- */

    const handleUpdateProgram = async () => {
      if (!editProgram) return;
      if (!school.trim() || !effectiveSportValue || !gender || !seasonYear) {
        return;
      }

      try {
        const { error } = await supabase
          .from("programs")
          .update({
            school: school.trim(),
            sport: effectiveSportValue,
            level: levels.join(", "),
            gender,
            season_year: seasonYear.trim(),
          })
          .eq("id", editProgram.id);

        if (error) throw error;

        setIsEditModalOpen(false);
        setEditProgram(null);
        resetForm();

        // refresh
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: programsData, error: programsError } = await supabase
          .from("programs")
          .select("*")
          .eq("coach_id", user.id);

        if (programsError) throw programsError;
        setPrograms(programsData || []);
      } catch (error) {
        console.error("Update failed:", error);
      }
    };

    /* ------------------------------ DELETE PROGRAM -------------------------- */

    const handleDeleteProgram = async (programId: number) => {
      try {
        const { error } = await supabase
          .from("programs")
          .delete()
          .eq("id", programId);

        if (error) throw error;

        // refresh
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: programsData, error: programsError } = await supabase
          .from("programs")
          .select("*")
          .eq("coach_id", user.id);

        if (programsError) throw programsError;
        setPrograms(programsData || []);

        // clear selection if you deleted the active program
        if (selectedProgramId === programId) {
          onProgramChange(null);
        }
      } catch (error) {
        console.error("Delete failed:", error);
      }
    };

    /* ----------------------------- LOADING STATE ---------------------------- */

    if (loading) {
      return (
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium text-white">Loading programs…</span>
        </div>
      );
    }

    /* ------------------------------ TRIGGERS -------------------------------- */

    const renderHeaderTrigger = () => (
      <Button
        ref={triggerRef}
        variant="ghost"
        className="
          h-auto w-full md:w-auto
          px-3 py-2 md:px-2 md:py-1
          hover:bg-muted/50
          min-h-[48px] md:min-h-0
          justify-between
        "
      >
        <div className="flex w-full items-center justify-between gap-3">
          <div className="flex flex-col flex-1 text-left min-w-0">
            <span className="font-medium text-base md:text-sm text-foreground truncate">
              Asst. Coach
            </span>

            {selectedProgram ? (
              <>
                <span className="hidden md:block text-xs text-muted-foreground truncate">
                  {selectedProgram.sport} • {selectedProgram.season_year}
                </span>
                <span className="block md:hidden text-xs text-muted-foreground leading-tight truncate">
                  {selectedProgram.sport} • {selectedProgram.season_year}
                </span>
              </>
            ) : (
              <span className="text-xs text-muted-foreground truncate">
                Select a Program
              </span>
            )}
          </div>

          <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        </div>
      </Button>
    );

    const renderEmptyTrigger = () => (
      <Button
        ref={triggerRef}
        variant="ghost"
        className="
          w-[190px] justify-between text-left
          rounded-2xl px-4 py-3
          bg-white/80 dark:bg-neutral-900/60
          shadow-[0_2px_8px_rgba(0,0,0,0.15)]
          backdrop-blur-sm
          border border-black/10 dark:border-white/10
          text-base font-medium
          hover:bg-white/90 dark:hover:bg-neutral-900/70
          transition-all
        "
      >
        <span className="truncate">
          {selectedProgram
            ? `${selectedProgram.sport} • ${selectedProgram.season_year}`
            : "Select a Program"}
        </span>
        <ChevronDown className="h-5 w-5 opacity-70 flex-shrink-0" />
      </Button>
    );

    /* ------------------------------ DROPDOWN -------------------------------- */

    const renderDropdown = () => (
      <DropdownMenu
        onOpenChange={(open) => {
          if (!open) {
            setIsEditMode(false);
            setActionsOpen(false);
            setPendingAction(null);
            // setPendingDeleteProgram(null);
            setFlashProgramId(null);
          }
        }}
      >
        <DropdownMenuTrigger asChild>
          {variant === "empty" ? renderEmptyTrigger() : renderHeaderTrigger()}
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align={variant === "header" ? "center" : "start"}
          sideOffset={6}
          className={
            variant === "empty"
              ? `
                w-[190px] 
                rounded-3xl 
                overflow-hidden

                bg-white/85 
                dark:bg-neutral-900/70
                backdrop-blur-xl

                shadow-[0_8px_24px_rgba(0,0,0,0.25)]
                border border-white/40 dark:border-white/10
                ring-1 ring-black/5 dark:ring-white/5
                p-0
              `
              : `
                w-fit rounded-lg relative
              `
          }
        >
          {/* -------------------------- SCROLL REGION -------------------------- */}
          <div
            className={`
              ${variant === "empty"
                ? "max-h-64 overflow-y-auto"
                : "max-h-[260px] overflow-y-auto"}
              transition-all
              ${pendingAction === "edit" ? "animate-pulse bg-blue-200/40" : ""}
              ${pendingAction === "delete" ? "animate-pulse bg-red-200/40" : ""}
              ${flashProgramId ? "bg-red-400/60" : ""}
            `}
          >
            {/* Program list */}
            {programs.map((program) => (
              <DropdownMenuItem
                key={program.id}
                onClick={() => {
                  // EDIT MODE
                  if (pendingAction === "edit") {
                    hydrateFormFromProgram(program);
                    setEditProgram(program);
                    setIsEditModalOpen(true);
                    setPendingAction(null);
                    return;
                  }

                  // DELETE MODE
                    if (pendingAction === "delete") {
                      setPendingDeleteProgram(program);
                      setPendingAction(null);
                      return;
                    }

                  // NORMAL SELECT
                  onProgramChange(program.id);
                }}
                className={`
                  flex justify-between items-center gap-2 
                  py-3 px-4
                  text-sm
                  transition-all
                  hover:bg-black/5 dark:hover:bg-white/5
                  rounded-none
                  ${selectedProgramId === program.id
                    ? "relative after:absolute after:left-0 after:top-1/4 after:h-1/2 after:w-[2px] after:bg-[hsl(var(--primary))]/70"
                  : ""}
                `}
              >
                <div className="min-w-0">
                  <span className="font-medium text-sm block truncate">
                    {formatProgramName(program)}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    {formatProgramDetails(program)}
                  </span>
                </div>
              </DropdownMenuItem>
            ))}

            {programs.length === 0 && (
              <div className="p-3 text-sm text-muted-foreground text-center">
                No programs found.
              </div>
            )}
          </div>

          {/* ------------------------ HEADER-ONLY FOOTER ------------------------ */}
          {variant === "header" && (
            <div className="sticky bottom-0 left-0 bg-card/90 backdrop-blur-[1px] border-t border-border py-2 z-[99999]">
              <div className="flex items-center relative gap-2">

                {/* MAIN */}
                <Button
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditMode(!isEditMode);
                    setActionsOpen(!isEditMode);
                  }}
                  className={`h-9 w-9 p-0 rounded-full transition-all duration-300
                    ${isEditMode
                      ? "bg-[hsl(var(--primary))/0.25] ring-2 ring-[hsl(var(--primary))/0.5]"
                      : "bg-muted"}
                  `}
                >
                  <motion.div
                    key={isEditMode ? "close" : "gear"}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      rotate: isEditMode ? 90 : 0,
                    }}
                    transition={{ type: "spring", stiffness: 260, damping: 18 }}
                    className="flex items-center justify-center"
                  >
                    {isEditMode ? (
                      <CircleX className="scale-[1.4] text-muted-foreground" />
                    ) : (
                      <Settings2 className="scale-[1.4] text-muted-foreground" />
                    )}
                  </motion.div>
                </Button>

                {/* ---------------------- LINEAR EXPANSION ---------------------- */}
                {isEditMode &&
                  renderProgramActionsLinear(
                    [
                      {
                        icon: <Plus size={20} />,
                        label: "Add",
                        action: () => {
                          resetForm();
                          setIsAddModalOpen(true);
                        },
                      },

                      // EDIT — only shown when a program exists
                      {
                        icon: <Pencil size={20} className="text-blue-500" />,
                        label: "Edit",
                        action: () => setPendingAction(prev => prev === "edit" ? null : "edit"),
                      },

                      {
                        icon: <Trash2 size={20} className="text-[#e63946]" />,
                        label: "Delete",
                        destructive: true,
                        action: () => setPendingAction(prev => prev === "delete" ? null : "delete"),
                      },
                    ].filter(Boolean), // this now correctly strips null actions
                    42
                  )}
              </div>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );

    /* ------------------------------ FORM SHARED ----------------------------- */

    const renderProgramFormBody = () => (
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
            className="mt-2"
            placeholder="Enter custom sport"
            value={customSport}
            onChange={(e) => setCustomSport(e.target.value)}
          />
        )}

        {/* Level Multi-Select */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              {levels.length === 0
                ? "Select Levels"
                : levels.length > 2
                ? `${levels.length} levels selected`
                : levels.join(", ")}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            {LEVEL_OPTIONS.map((option) => (
              <DropdownMenuCheckboxItem
                key={option}
                checked={levels.includes(option)}
                onCheckedChange={(checked) => {
                  setLevels((prev) =>
                    checked
                      ? [...prev, option]
                      : prev.filter((lvl) => lvl !== option)
                  );
                }}
                onSelect={(e) => e.preventDefault()}
              >
                {option}
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
    );

    /* -------------------------------- RENDER -------------------------------- */

    return (
      <>
        {renderDropdown()}

        {/* Add Program Modal */}
        <Dialog
          open={isAddModalOpen}
          onOpenChange={(open) => {
            if (!open) resetForm();
            setIsAddModalOpen(open);
          }}
        >
          <DialogContent className="sm:max-w-md bg-card">
            <DialogHeader>
              <DialogTitle>Add New Program</DialogTitle>
            </DialogHeader>

            {renderProgramFormBody()}

            <div className="flex flex-col gap-2 pt-1">
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={handleAddProgram}
              >
                Create Program
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  resetForm();
                  setIsAddModalOpen(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Program Modal */}
        <Dialog
          open={isEditModalOpen}
          onOpenChange={(open) => {
            if (!open) {
              setEditProgram(null);
              resetForm();
            }
            setIsEditModalOpen(open);
          }}
        >
          <DialogContent className="sm:max-w-md bg-card">
            <DialogHeader>
              <DialogTitle>Edit Program</DialogTitle>
            </DialogHeader>

            {renderProgramFormBody()}

            <div className="flex flex-col gap-2 pt-1">
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleUpdateProgram}
              >
                Save Changes
              </Button>

              <ConfirmationDialog
                title="Delete Program"
                message={`Are you sure you want to delete "${sport || "this program"}"?`}
                confirmLabel="Delete"
                confirmVariant="destructive"
                onConfirm={() => {
                  if (editProgram) {
                    handleDeleteProgram(editProgram.id);
                  }
                }}
                asChild
              >
                <Button variant="destructive">Delete Program</Button>
              </ConfirmationDialog>

              <Button
                variant="outline"
                onClick={() => {
                  setEditProgram(null);
                  setIsEditModalOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        {/* DELETE MODAL */}
        <Dialog
          open={pendingDeleteProgram !== null}
          onOpenChange={(open) => {
            if (!open) setPendingDeleteProgram(null); // reset on close
          }}
        >
          <DialogContent className="sm:max-w-md bg-card">
            <DialogHeader>
              <DialogTitle>Delete Program?</DialogTitle>
            </DialogHeader>

            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete{" "}
              <span className="font-semibold">
                {pendingDeleteProgram?.sport} • {pendingDeleteProgram?.season_year}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="flex flex-col gap-2 mt-5">
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => {
                  if (!pendingDeleteProgram) return;
                  handleDeleteProgram(pendingDeleteProgram.id);
                  setPendingDeleteProgram(null);
                }}
              >
                Delete Program
              </Button>

              <Button
                variant="outline"
                onClick={() => setPendingDeleteProgram(null)}
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
