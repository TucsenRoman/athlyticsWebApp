"use client";

import { Input } from "@/components/ui/forms/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/forms/select";

/* ========================================================================== */
/* COMPONENT                                                                  */
/* ========================================================================== */

export default function ProgramSetupSeason() {
  return (
    <div className="flex flex-col gap-6 p-2">

      {/* SEASON RANGE ------------------------------------------------------ */}
      <Section
        title="Season Dates"
        description="Define the active season window for this program."
      >
        <Row>
          <Field label="Start date">
            <Input type="date" />
          </Field>

          <Field label="End date">
            <Input type="date" />
          </Field>
        </Row>
      </Section>

      {/* COMPETITION PHASE ------------------------------------------------- */}
      <Section
        title="Competition Phase"
        description="High-level structure for the season."
      >
        <Field label="Primary phase">
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select phase" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pre">Pre-season</SelectItem>
              <SelectItem value="in">In-season</SelectItem>
              <SelectItem value="post">Post-season</SelectItem>
              <SelectItem value="off">Off-season</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </Section>

      {/* TRAINING CYCLES --------------------------------------------------- */}
      <Section
        title="Training Cycles"
        description="Optional structure for planning blocks."
      >
        <Field label="Cycle length (weeks)">
          <Input placeholder="e.g. 4" />
        </Field>

        <Field label="Cycle type">
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="micro">Microcycle</SelectItem>
              <SelectItem value="meso">Mesocycle</SelectItem>
              <SelectItem value="macro">Macrocycle</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </Section>

    </div>
  );
}

/* ========================================================================== */
/* SUBCOMPONENTS                                                              */
/* ========================================================================== */

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="text-sm font-medium text-[var(--text-dk)]">
          {title}
        </h3>
        {description && (
          <p className="text-xs text-[var(--text-muted)]">
            {description}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {children}
      </div>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {children}
    </div>
  );
}

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
