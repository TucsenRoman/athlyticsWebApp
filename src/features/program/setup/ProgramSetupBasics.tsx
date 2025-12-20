"use client";

import { useState } from "react";

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
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/overlays/dropdown-menu";

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

export interface ProgramBasicsData {
  school: string;
  sport: string;
  levels: string[];
  gender: string;
}

interface ProgramSetupBasicsProps {
  mode: "add" | "edit";
  program?: Partial<ProgramBasicsData> | null;
  onSubmit: (data: ProgramBasicsData) => void;
}

/* ========================================================================== */
/* OPTIONS                                                                    */
/* ========================================================================== */

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

const LEVELS = [
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

/* ========================================================================== */
/* COMPONENT                                                                  */
/* ========================================================================== */

export default function ProgramSetupBasics({
  mode,
  program,
  onSubmit,
}: ProgramSetupBasicsProps) {
  /* ------------------------------------------------------------------------ */
  /* STATE                                                                    */
  /* ------------------------------------------------------------------------ */

  const [school, setSchool] = useState(program?.school ?? "");
  const [sport, setSport] = useState(program?.sport ?? "");
  const [customSport, setCustomSport] = useState("");
  const [levels, setLevels] = useState<string[]>(program?.levels ?? []);
  const [gender, setGender] = useState(program?.gender ?? "");

  const resolvedSport = sport === "Other" ? customSport : sport;

  /* ------------------------------------------------------------------------ */
  /* RENDER                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="flex flex-col gap-4">
      {/* SCHOOL */}
      <Field label="School">
        <Input
          value={school}
          onChange={(e) => setSchool(e.target.value)}
          placeholder="e.g. Zimmerman High School"
        />
      </Field>

      {/* SPORT */}
      <Field label="Sport">
        <Select value={sport} onValueChange={setSport}>
          <SelectTrigger>
            <SelectValue placeholder="Select sport" />
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
      </Field>

      {/* LEVELS */}
      <Field label="Levels">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between"
            >
              {levels.length === 0
                ? "Select levels"
                : levels.length > 2
                ? `${levels.length} levels selected`
                : levels.join(", ")}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-56">
            {LEVELS.map((level) => (
              <DropdownMenuCheckboxItem
                key={level}
                checked={levels.includes(level)}
                onCheckedChange={(checked) =>
                  setLevels((prev) =>
                    checked
                      ? [...prev, level]
                      : prev.filter((l) => l !== level)
                  )
                }
                onSelect={(e) => e.preventDefault()}
              >
                {level}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </Field>

      {/* GENDER */}
      <Field label="Gender">
        <Select value={gender} onValueChange={setGender}>
          <SelectTrigger>
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>

          <SelectContent>
            {GENDERS.map((g) => (
              <SelectItem key={g} value={g}>
                {g}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
    </div>
  );
}

/* ========================================================================== */
/* SUBCOMPONENTS                                                              */
/* ========================================================================== */

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-[var(--text)]">
        {label}
      </label>
      {children}
    </div>
  );
}
