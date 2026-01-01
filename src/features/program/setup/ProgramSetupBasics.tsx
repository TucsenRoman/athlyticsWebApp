"use client";

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
  customSport?: string;
  levels: string[];
  gender: string;
  seasonStart?: string;
  seasonEnd?: string;
}

interface ProgramSetupBasicsProps {
  mode: "add" | "edit";
  value: ProgramBasicsData;
  onChange: (value: ProgramBasicsData) => void;
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

const GENDERS = ["Boys", "Girls", "Co-ed"]; // ~Do a left to right tab selection (Vertical on mobile).

/* ========================================================================== */
/* COMPONENT                                                                  */
/* ========================================================================== */

export default function ProgramSetupBasics({
  mode,
  value,
  onChange,
}: ProgramSetupBasicsProps) {
  return (
    <div className="flex flex-col gap-8 pb-20">

      {/* SCHOOL ----------------------------------------------------------- */}
      <Field label="School">
        <Input
          value={value.school}
          onChange={(e) =>
            onChange({ ...value, school: e.target.value })
          }
          placeholder="e.g. Zimmerman High School"
        />
      </Field>

      {/* SPORT ------------------------------------------------------------ */}
      <Field label="Sport">
        <Select
          value={value.sport}
          onValueChange={(sport) =>
            onChange({ ...value, sport })
          }
        >
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

        {value.sport === "Other" && (
          <Input
            className="mt-2"
            placeholder="Enter custom sport"
            value={value.customSport ?? ""}
            onChange={(e) =>
              onChange({ ...value, customSport: e.target.value })
            }
          />
        )}
      </Field>

      {/* LEVELS ----------------------------------------------------------- */}
      <Field label="Levels">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              {value.levels.length === 0
                ? "Select levels"
                : value.levels.length > 2
                ? `${value.levels.length} levels selected`
                : value.levels.join(", ")}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-56">
            {LEVELS.map((level) => (
              <DropdownMenuCheckboxItem
                key={level}
                checked={value.levels.includes(level)}
                onCheckedChange={(checked) =>
                  onChange({
                    ...value,
                    levels: checked
                      ? [...value.levels, level]
                      : value.levels.filter((l) => l !== level),
                  })
                }
                onSelect={(e) => e.preventDefault()}
              >
                {level}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </Field>

      {/* GENDER ----------------------------------------------------------- */}
      <Field label="Gender">
        <Select
          value={value.gender}
          onValueChange={(gender) =>
            onChange({ ...value, gender })
          }
        >
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

      {/* SEASON RANGE (MVP) ---------------------------------------------- */}
      <Field label="Season range">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Input
            type="date"
            value={value.seasonStart ?? ""}
            onChange={(e) =>
              onChange({ ...value, seasonStart: e.target.value })
            }
          />

          <Input
            type="date"
            value={value.seasonEnd ?? ""}
            onChange={(e) =>
              onChange({ ...value, seasonEnd: e.target.value })
            }
          />
        </div>

        <span className="text-center text-xs text-[var(--accent)]">
          Extend the range to include pre- or post-season events.
        </span>
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
