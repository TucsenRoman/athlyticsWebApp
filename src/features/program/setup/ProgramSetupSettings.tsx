"use client";

import { Checkbox } from "@/components/ui/forms/checkbox";
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

export default function ProgramSetupSettings() {
  return (
    <div className="flex flex-col gap-6 p-2">

      {/* VISIBILITY -------------------------------------------------------- */}
      <Section
        title="Visibility"
        description="Control who can see this program."
      >
        <Row>
          <Checkbox id="public" />
          <label
            htmlFor="public"
            className="text-sm text-[var(--text)] cursor-pointer"
          >
            Public program
          </label>
        </Row>

        <p className="text-xs text-[var(--text-muted)]">
          Allows unauthenticated users to view basic program info.
        </p>
      </Section>

      {/* PERMISSIONS ------------------------------------------------------- */}
      <Section
        title="Default Permissions"
        description="Baseline access rules for new members."
      >
        <Row>
          <Checkbox id="view-schedule" />
          <label
            htmlFor="view-schedule"
            className="text-sm text-[var(--text)] cursor-pointer"
          >
            New members can view schedules
          </label>
        </Row>

        <Row>
          <Checkbox id="view-attendance" />
          <label
            htmlFor="view-attendance"
            className="text-sm text-[var(--text)] cursor-pointer"
          >
            New members can view attendance
          </label>
        </Row>
      </Section>

      {/* DATA -------------------------------------------------------------- */}
      <Section
        title="Data Retention"
        description="How long historical data is kept."
      >
        <Row className="items-center justify-between">
          <span className="text-sm text-[var(--text)]">
            Attendance history
          </span>

          <Select>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="season">This season</SelectItem>
              <SelectItem value="year">1 year</SelectItem>
              <SelectItem value="forever">Forever</SelectItem>
            </SelectContent>
          </Select>
        </Row>
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

      <div className="flex flex-col gap-3">
        {children}
      </div>
    </div>
  );
}

function Row({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {children}
    </div>
  );
}
