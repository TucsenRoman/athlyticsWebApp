"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";

import { packageInstaller } from "@/integrations/supabase/installProject";

interface Program {
  id: number;
  sport: string;
  level: string;
  gender: string;
  school: string;
  year: string;
}

export type ProgramFormMode = "add" | "edit";

interface ProgramFormModalProps {
  mode: ProgramFormMode;
  open: boolean;
  program: Program | null;
  onClose: () => void;

  /** PARENT MUST NOT run installer. This returns newProgramId instead. */
  onSubmit: (data: {
    school: string;
    sport: string;
    levels: string[];
    gender: string;
    seasonYear: string;
  }) => Promise<number>; // RETURN PROGRAM ID
}

const SPORTS = [
  "Cross Country", "Track & Field", "Basketball", "Football",
  "Soccer", "Volleyball", "Wrestling", "Baseball", "Softball",
  "Golf", "Tennis", "Other",
];

const LEVEL_OPTIONS = [
  "All", "Varsity", "JV", "Freshman", "Middle School",
  "A-Team", "B-Team", "C-Team", "D-Team",
];

const GENDERS = ["Boys", "Girls", "Co-ed"];

const LOADING_MESSAGES: Record<string, string[]> = {
  "Cross Country": ["Lacing up...", "Checking the trail...", "Dialing pace..."],
  "Track & Field": ["Setting blocks...", "Wind check...", "Adjusting stance..."],
  Basketball: ["Warming up...", "Layup lines...", "Ankle wrap..."],
  Football: ["Strapping pads...", "Checking playbook...", "Running drills..."],
  Soccer: ["Tying cleats...", "Warmup touches...", "Setting formation..."],
  Volleyball: ["Setting net...", "Warmup serves...", "Running rotations..."],
  Wrestling: ["Taping fingers...", "Warmup shots...", "Stretching..."],
  Baseball: ["Chalking baselines...", "Warmup throws...", "Batting prep..."],
  Softball: ["Grip check...", "Warmup swings...", "Clearing dirt..."],
  Golf: ["Reading green...", "Practice swings...", "Choosing club..."],
  Tennis: ["Warmup rallies...", "String tension...", "Shadow swings..."],
  Other: ["Loading...", "Preparing...", "Almost ready..."],
};

export default function ProgramFormModal({
  mode,
  open,
  program,
  onClose,
  onSubmit,
}: ProgramFormModalProps) {

  const [school, setSchool] = useState(program?.school ?? "");
  const [sport, setSport] = useState(program?.sport ?? "");
  const [customSport, setCustomSport] = useState("");
  const [levels, setLevels] = useState<string[]>(
    program?.level ? program.level.split(",").map(s => s.trim()) : []
  );
  const [gender, setGender] = useState(program?.gender ?? "");
  const [seasonYear, setSeasonYear] = useState(program?.year ?? "");
  const [loading, setLoading] = useState(false);

  const effectiveSport = sport === "Other" ? customSport : sport;
  const title = mode === "add" ? "Add Program" : "Edit Program";

  const loadingMessage = useMemo(() => {
    const list = LOADING_MESSAGES[sport] || LOADING_MESSAGES.Other;
    return list[Math.floor(Math.random() * list.length)];
  }, [sport]);

  /* ---------------------------------------------------------------------- */
  /* UI-FIRST SUBMIT (modal closes immediately)                             */
  /* ---------------------------------------------------------------------- */

  const submit = async () => {
    setLoading(true);

    // Prepare payload
    const payload = {
      school: school.trim(),
      sport: effectiveSport.trim(),
      levels,
      gender,
      seasonYear: seasonYear.trim(),
    };

    // Create/update program → returns programId
    const programId = await onSubmit(payload);

    // Close modal immediately — user sees instant response
    setLoading(false);
    onClose();

    // Installer runs in ProgramSelector, NOT here
  };


  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Form Fields */}
          <Input
            placeholder="School"
            value={school}
            onChange={(e) => setSchool(e.target.value)}
          />

          <Select value={sport} onValueChange={setSport}>
            <SelectTrigger>
              <SelectValue placeholder="Select Sport" />
            </SelectTrigger>
            <SelectContent>
              {SPORTS.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {sport === "Other" && (
            <Input
              placeholder="Custom sport"
              value={customSport}
              onChange={(e) => setCustomSport(e.target.value)}
            />
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {levels.length === 0
                  ? "Select Levels"
                  : levels.length > 2
                  ? `${levels.length} selected`
                  : levels.join(", ")}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              {LEVEL_OPTIONS.map(option => (
                <DropdownMenuCheckboxItem
                  key={option}
                  checked={levels.includes(option)}
                  onCheckedChange={(checked) => {
                    setLevels(prev =>
                      checked
                        ? [...prev, option]
                        : prev.filter(l => l !== option)
                    );
                  }}
                  onSelect={(e) => e.preventDefault()}
                >
                  {option}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger>
              <SelectValue placeholder="Gender" />
            </SelectTrigger>
            <SelectContent>
              {GENDERS.map(g => (
                <SelectItem key={g} value={g}>{g}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Season (e.g. 2024-2025)"
            value={seasonYear}
            onChange={(e) => setSeasonYear(e.target.value)}
          />
        </div>

        {/* FOOTER — shows loading UI on submit */}
        <div className="flex flex-col gap-2 pt-1 min-h-[72px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-4">
              <div className="h-6 w-6 border-2 border-[hsl(var(--accent))] border-t-transparent rounded-full animate-spin mb-2"></div>
              <p className="text-sm text-[hsl(var(--gray-600))]">{loadingMessage}</p>
            </div>
          ) : (
            <>
              <Button
                className={mode === "add"
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"}
                onClick={submit}
              >
                {mode === "add" ? "Create Program" : "Save Changes"}
              </Button>

              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
