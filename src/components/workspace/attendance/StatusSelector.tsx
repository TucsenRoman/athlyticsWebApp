"use client";

import { useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import { ChevronDown } from "lucide-react";

// UI options shown to the user
export type StatusOption =
  | "present"
  | "absent"
  | "tardy"
  | "excused"
  | "other";

interface StatusSelectorProps {
  current: StatusOption | null; // null = default present
  onChange: (status: StatusOption | null) => void;
}

export default function StatusSelector({ current, onChange }: StatusSelectorProps) {
  const [open, setOpen] = useState(false);

  // default: present (null)
  const displayValue = current ?? "present";

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
        className="
          w-[130px] h-8 px-3
          text-sm
          flex items-center justify-between
          border border-[hsl(var(--gray-300))]
          bg-[hsl(var(--white))]
        "
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
