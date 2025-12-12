"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/overlays/dialog";
import { Button } from "@/components/ui/actions/button";
import { Input } from "@/components/ui/forms/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/forms/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/overlays/dropdown-menu";
import { LoadingIndicator } from "@/components/ui/feedback/loading-indicator";

import { projectInstaller } from "@/integrations/supabase/projectInstaller";

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

  const submit = async () => {
    setLoading(true);

    const payload = {
      school: school.trim(),
      sport: effectiveSport.trim(),
      levels,
      gender,
      seasonYear: seasonYear.trim(),
    };

    const programId = await onSubmit(payload);

    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md theme-surface">
        <DialogHeader>
          <DialogTitle className="text-[var(--text-dark)]">{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* School Input */}
          <Input placeholder="School" value={school} onChange={(e) => setSchool(e.target.value)} />

          {/* Sport Select */}
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
            <Input placeholder="Custom sport" value={customSport} onChange={(e) => setCustomSport(e.target.value)} />
          )}

          {/* Levels Dropdown */}
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
            <DropdownMenuContent>
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

          {/* Gender Select */}
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

          {/* Season Input */}
          <Input placeholder="Season (e.g. 2024-2025)" value={seasonYear} onChange={(e) => setSeasonYear(e.target.value)} />
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-2 pt-1 min-h-[72px]">
          {loading ? (
            <LoadingIndicator message={loadingMessage} />
          ) : (
            <>
              <Button
                variant={mode === "add" ? "success" : "accent"}
                onClick={submit}
              >
                {mode === "add" ? "Create Program" : "Save Changes"}
              </Button>

              <Button
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
