import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChevronDown, Settings, Plus, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEditMode } from "@/contexts/EditModeContext"; // ✅ correct path and hook

interface Program {
  id: string;
  sport: string;
  level: string;
  gender: string;
  school: string;
  season_year: string;
}

interface ProgramSelectorProps {
  selectedProgramId: string | null;
  onProgramChange: (programId: string) => void;
  isEditMode?: boolean;
}

// ✅ option arrays
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

export default function ProgramSelector({
  selectedProgramId,
  onProgramChange,
}: ProgramSelectorProps) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editProgram, setEditProgram] = useState<Program | null>(null);

  // form states
  const [school, setSchool] = useState("");
  const [sport, setSport] = useState("");
  const [customSport, setCustomSport] = useState("");
  const [levels, setLevels] = useState<string[]>([]);
  const [gender, setGender] = useState("");
  const [seasonYear, setSeasonYear] = useState("");

  const { isEditMode } = useEditMode();

  // --- Fetch user + programs ---
  useEffect(() => {
    fetchUserAndPrograms();
  }, []);

  const fetchUserAndPrograms = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) return setLoading(false);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      if (profileData?.full_name) setUserName(profileData.full_name);

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

  // --- Add Program ---
  const handleAddProgram = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("programs").insert([
        {
          coach_id: user.id,
          school,
          sport: sport === "Other" ? customSport : sport,
          level: levels.join(", "),
          gender,
          season_year: seasonYear,
        },
      ]);

      if (error) throw error;

      // reset
      setSchool("");
      setSport("");
      setCustomSport("");
      setLevels([]);
      setGender("");
      setSeasonYear("");
      setIsAddModalOpen(false);
      fetchUserAndPrograms();
    } catch (error) {
      console.error("Add failed:", error);
    }
  };

  // --- Update Program ---
  const handleUpdateProgram = async () => {
    if (!editProgram) return;
    try {
      const { error } = await supabase
        .from("programs")
        .update({
          school,
          sport: sport === "Other" ? customSport : sport,
          level: levels.join(", "),
          gender,
          season_year: seasonYear,
        })
        .eq("id", editProgram.id);

      if (error) throw error;
      setIsEditModalOpen(false);
      setEditProgram(null);
      fetchUserAndPrograms();
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  // --- Delete Program ---
  const handleDeleteProgram = async (programId: string) => {
    try {
      const { error } = await supabase.from("programs").delete().eq("id", programId);
      if (error) throw error;
      fetchUserAndPrograms();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const selectedProgram = programs.find((p) => p.id === selectedProgramId);

  // Keep the top line short and readable — just school + year
  const formatProgramName = (program: Program) => {
    return `${program.sport} • ${program.season_year}`;
  };

  const formatProgramDetails = (program: Program) => {
    return `${program.school}`;
  };

  if (loading)
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="font-medium">Loading...</span>
      </div>
    );

  return (
    <div
      className={`flex items-center gap-2 transition-opacity duration-300 ${
        !isEditMode ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-center gap-2">
        {/* 🧭 Program Selector Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-auto w-full md:w-auto px-3 py-2 md:px-2 md:py-1 hover:bg-muted/50 min-h-[48px] md:min-h-0 justify-between"
            >
              <div className="flex w-full items-center justify-between">
                <div className="flex flex-col flex-1 text-left">
                  {/* Username */}
                  <span className="font-medium text-base md:text-sm text-foreground">
                    {userName || "Unknown User"}
                  </span>

                  {/* Program Name / Info */}
                  {selectedProgram ? (
                    <>
                      {/* Desktop */}
                      <span className="hidden md:block text-xs text-muted-foreground truncate">
                        {selectedProgram.sport} • {selectedProgram.season_year}
                      </span>

                      {/* Mobile */}
                      <span className="block md:hidden text-xs text-muted-foreground leading-tight">
                        {selectedProgram.sport} • {selectedProgram.season_year}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">No program selected</span>
                  )}
                </div>

                {/* Dropdown chevron */}
                <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              </div>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="start"
            className="w-[95vw] md:w-80 max-h-[250px] overflow-y-auto rounded-lg"
          >
            {programs.map((program) => (
              <DropdownMenuItem
                key={program.id}
                onClick={() => onProgramChange(program.id)}
                className={`flex justify-between items-center ${
                  selectedProgramId === program.id ? "bg-muted" : ""
                }`}
              >
                <div>
                  <span className="font-medium text-sm block">
                    {formatProgramName(program)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatProgramDetails(program)}
                  </span>
                </div>

                {/* 🧩 Only show the edit + delete controls when in ledger + edit mode */}
                {isEditMode && (
                  <div className="flex items-center gap-1">
                    {/* ⚙️ Edit Program Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditProgram(program);
                        setSchool(program.school);
                        setSport(program.sport);
                        setLevels(
                          program.level
                            ? program.level.split(",").map((s) => s.trim())
                            : []
                        );
                        setGender(program.gender);
                        setSeasonYear(program.season_year);
                        setIsEditModalOpen(true);
                      }}
                      className="ml-1 h-7 w-7 hover:bg-primary/10"
                    >
                      <Settings className="h-4 w-4 text-primary" />
                    </Button>

                    {/* 🗑️ Delete Program Button */}
                    <ConfirmationDialog
                      title="Delete Program"
                      message={`Are you sure you want to delete "${program.sport}"?`}
                      confirmLabel="Delete"
                      confirmVariant="destructive"
                      onConfirm={() => handleDeleteProgram(program.id)}
                      asChild
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-1 h-7 w-7 text-destructive hover:bg-destructive/10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </ConfirmationDialog>
                  </div>
                )}
              </DropdownMenuItem>
            ))}

            {programs.length === 0 && (
              <div className="p-3 text-sm text-muted-foreground text-center">
                No programs found.
              </div>
            )}

            {isEditMode && (
              <Button
                size="icon"
                variant="outline"
                onClick={() => setIsAddModalOpen(true)}
                className="ml-2 h-8 w-8"
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* ➕ Add Program Modal */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="sm:max-w-md bg-card">
            <DialogHeader>
              <DialogTitle>Add New Program</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* School */}
              <Input
                placeholder="School (e.g., Zimmerman High School)"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
              />

              {/* Sport Select */}
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

            <div className="flex flex-col gap-2">
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={handleAddProgram}
              >
                Create Program
              </Button>
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* ⚙️ Edit Program Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-md bg-card">
            <DialogHeader>
              <DialogTitle>Edit Program</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <Input
                placeholder="e.g., Zimmerman High School"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
              />

              {/* Sport Select */}
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

            <div className="flex flex-col gap-2">
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleUpdateProgram}
              >
                Save Changes
              </Button>

              <ConfirmationDialog
                title="Delete Program"
                message={`Are you sure you want to delete "${sport}"?`}
                confirmLabel="Delete"
                confirmVariant="destructive"
                onConfirm={() => {
                  if (editProgram) handleDeleteProgram(editProgram.id);
                }}
                asChild
              >
                <Button variant="destructive">Delete Program</Button>
              </ConfirmationDialog>

              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}