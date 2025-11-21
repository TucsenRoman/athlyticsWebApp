// src/components/program/ProgramFormModal.tsx
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";

interface Program {
  id: number;
  sport: string;
  level: string;
  gender: string;
  school: string;
  season_year: string;
}

export type ProgramFormMode = "add" | "edit";

interface ProgramFormModalProps {
  mode: ProgramFormMode;
  open: boolean;
  program: Program | null;     // null for add
  onClose: () => void;
  onSubmit: (data: {
    school: string;
    sport: string;
    levels: string[];
    gender: string;
    seasonYear: string;
  }) => Promise<void>;
}

const SPORTS = [
  "Cross Country","Track & Field","Basketball","Football","Soccer",
  "Volleyball","Wrestling","Baseball","Softball","Golf","Tennis","Other"
];
const LEVEL_OPTIONS = [
  "All","Varsity","JV","Freshman","Middle School","A-Team","B-Team","C-Team","D-Team"
];
const GENDERS = ["Boys","Girls","Co-ed"];

export default function ProgramFormModal({
  mode,
  open,
  program,
  onClose,
  onSubmit,
}: ProgramFormModalProps) {
  // hydrate form
  const [school, setSchool] = useState(program?.school ?? "");
  const [sport, setSport] = useState(program?.sport ?? "");
  const [customSport, setCustomSport] = useState("");
  const [levels, setLevels] = useState<string[]>(
    program?.level ? program.level.split(",").map(s => s.trim()) : []
  );
  const [gender, setGender] = useState(program?.gender ?? "");
  const [seasonYear, setSeasonYear] = useState(program?.season_year ?? "");

  const effectiveSport = sport === "Other" ? customSport : sport;

  const title = mode === "add" ? "Add New Program" : "Edit Program";

  const submit = async () => {
    if (!school || !effectiveSport || !gender || !seasonYear) return;

    await onSubmit({
      school: school.trim(),
      sport: effectiveSport.trim(),
      levels,
      gender,
      seasonYear: seasonYear.trim(),
    });

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <Input
            placeholder="School"
            value={school}
            onChange={e => setSchool(e.target.value)}
          />

          {/* Sport */}
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
              placeholder="Enter custom sport"
              value={customSport}
              onChange={(e) => setCustomSport(e.target.value)}
            />
          )}

          {/* Levels (multi) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {levels.length === 0 ? "Select Levels"
                  : levels.length > 2 ? `${levels.length} levels selected`
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
                      checked ? [...prev, option] : prev.filter(l => l !== option)
                    );
                  }}
                  onSelect={e => e.preventDefault()}
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
              {GENDERS.map(g => (
                <SelectItem key={g} value={g}>{g}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Season */}
          <Input
            placeholder="Season (e.g., 2024-2025)"
            value={seasonYear}
            onChange={e => setSeasonYear(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <Button
            className={mode === "add"
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
            }
            onClick={submit}
          >
            {mode === "add" ? "Create Program" : "Save Changes"}
          </Button>

          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
