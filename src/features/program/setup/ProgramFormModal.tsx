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

import ProgramRoles from "@/features/program/setup/ProgramSetupRoles";

/* -------------------------------------------------------------------------- */
/* TYPES */
/* -------------------------------------------------------------------------- */

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
  onSubmit: (data: {
    school: string;
    sport: string;
    levels: string[];
    gender: string;
    seasonYear: string;
  }) => Promise<number>;
}

/* -------------------------------------------------------------------------- */
/* STATIC DATA */
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

/* -------------------------------------------------------------------------- */
/* COMPONENT */
/* -------------------------------------------------------------------------- */

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
    program?.level ? program.level.split(",").map((s) => s.trim()) : []
  );
  const [gender, setGender] = useState(program?.gender ?? "");
  const [seasonYear, setSeasonYear] = useState(program?.year ?? "");
  const [loading, setLoading] = useState(false);

  const [step, setStep] = useState<"details" | "roles">("details");
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const effectiveSport = sport === "Other" ? customSport : sport;
  const title = mode === "add" ? "Add Program" : "Edit Program";

  const loadingMessage = useMemo(() => {
    const list = LOADING_MESSAGES[sport] || LOADING_MESSAGES.Other;
    return list[Math.floor(Math.random() * list.length)];
  }, [sport]);

  const submit = async () => {
    setLoading(true);

    await onSubmit({
      school: school.trim(),
      sport: effectiveSport.trim(),
      levels,
      gender,
      seasonYear: seasonYear.trim(),
    });

    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="
          sm:max-w-md
          bg-[var(--bg)]
          border border-[var(--border)]
          rounded-[var(--radius)]
          text-[var(--text-dark)]
          shadow-xl
        "
      >
        <DialogHeader>
          <DialogTitle className="text-[var(--text-dark)]">
            {title}
          </DialogTitle>
        </DialogHeader>

        {/* DETAILS STEP */}
        {step === "details" && (
          <div className="space-y-4 py-2">
            <Input
              placeholder="School"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              className="bg-[var(--light)] border-[var(--border)]"
            />

            <Select value={sport} onValueChange={setSport}>
              <SelectTrigger className="bg-[var(--light)] border-[var(--border)]">
                <SelectValue placeholder="Select Sport" />
              </SelectTrigger>
              <SelectContent className="bg-[var(--light)] border-[var(--border)]">
                {SPORTS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {sport === "Other" && (
              <Input
                placeholder="Custom sport"
                value={customSport}
                onChange={(e) => setCustomSport(e.target.value)}
                className="bg-[var(--light)] border-[var(--border)]"
              />
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex justify-between w-full p-2 bg-[var(--light)] border-[var(--border)]"
                >
                  {levels.length === 0
                    ? "Select Levels"
                    : levels.length > 2
                    ? `${levels.length} selected`
                    : levels.join(", ")}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[var(--light)] border-[var(--border)]">
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
              <SelectTrigger className="bg-[var(--light)] border-[var(--border)]">
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent className="bg-[var(--light)] border-[var(--border)]">
                {GENDERS.map(g => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Season (e.g. 2024-2025)"
              value={seasonYear}
              onChange={(e) => setSeasonYear(e.target.value)}
              className="bg-[var(--light)] border-[var(--border)]"
            />
          </div>
        )}

        {/* ROLES STEP */}
        {step === "roles" && (
          <ProgramRoles
            selectedPreset={selectedPreset}
            onSelect={setSelectedPreset}
            onContinue={() => {}}
            onSkip={() => {}}
          />
        )}

        {/* FOOTER */}
        <div className="flex justify-end gap-2 w-full">
          {loading ? (
            <LoadingIndicator message={loadingMessage} />
          ) : (
            <>
              <Button
                className={`
                  px-2 py-1
                  ${
                    mode === "add"
                      ? "bg-[var(--success)] text-white hover:bg-[color-mix(in srgb,var(--success) 85%,black)]"
                      : "bg-[var(--accent)] text-white hover:bg-[color-mix(in srgb,var(--accent) 85%,black)]"
                  }
                `}
                onClick={submit}
              >
                {mode === "add" ? "Create Program" : "Save Changes"}
              </Button>

              <Button
                variant="outline"
                className="px-2 py-1 border-[var(--border)] text-[var(--text)] hover:bg-[var(--gray-lt)]"
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
