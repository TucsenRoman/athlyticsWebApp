// src/components/workspace/attendance/StatusSelector.tsx
"use client";

import { useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

export type StatusOption = "present" | "absent" | "tardy" | "excused" | "other";

interface StatusSelectorProps {
  current: StatusOption | null; // null = default present
  onChange: (status: StatusOption | null) => void;
}

const STATUS_TRIGGER_STYLES: Record<StatusOption, string> = {
  present:
    "bg-[var(--gray-50)] text-[var(--text-dark)] border-[var(--border)]",
  absent:
    "bg-[var(--danger-bg)] text-[var(--danger)] border-[var(--danger)]",
  tardy:
    "bg-[var(--fvr-yellow-bg)] text-[var(--fvr-yellow)] border-[var(--fvr-yellow)]",
  excused:
    "bg-[var(--fvr-blue-bg)] text-[var(--fvr-blue)] border-[var(--fvr-blue)]",
  other:
    "bg-[var(--gray-100)] text-[var(--text-dark)] border-[var(--border)]",
};

export default function StatusSelector({
  current,
  onChange,
}: StatusSelectorProps) {
  const [open, setOpen] = useState(false);

  const displayValue: StatusOption = current ?? "present";
  const visualClass = STATUS_TRIGGER_STYLES[displayValue];

  return (
    <Select
      open={open}
      onOpenChange={setOpen}
      value={displayValue}
      onValueChange={(val) => {
        if (val === "present") onChange(null);
        else onChange(val as StatusOption);
      }}
    >
      <SelectTrigger
        className={`
          w-[140px] h-9 px-3
          text-sm
          flex items-center justify-between
          rounded-md
          border
          transition-colors
          ${visualClass}
        `}
      >
        <SelectValue />
      </SelectTrigger>

      <SelectContent className="text-sm">
        <SelectItem value="present">Present</SelectItem>
        <SelectItem value="absent">Absent</SelectItem>
        <SelectItem value="tardy">Tardy</SelectItem>
        <SelectItem value="excused">Excused</SelectItem>
        <SelectItem value="other">Other</SelectItem>
      </SelectContent>
    </Select>
  );
}
