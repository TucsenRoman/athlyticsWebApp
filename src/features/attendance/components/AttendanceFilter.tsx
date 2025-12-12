// src/components/attendance/AttendanceFilterDialog.tsx
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/overlays/dialog";
import { Button } from "@/components/ui/actions/button";
import { Check, X, UsersRound, Tags, Target, Filter } from "lucide-react";

interface AttendanceFilterProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;

  onApply: (filters: any) => void; 
  onClear: () => void;

  // Optional: supply group data from DB later
  groups?: string[];
  positions?: string[];
  squads?: string[];
  tags?: string[];
}

export default function AttendanceFilterDialog({
  open,
  onOpenChange,
  onApply,
  onClear,
  groups = ["Group A", "Group B", "Group C"],
  positions = ["Sprinter", "Distance", "Thrower", "Jumper"],
  squads = ["Varsity", "JV"],
  tags = ["Injury", "New", "Transfer"],
}: AttendanceFilterProps) {

  const [activeCategory, setActiveCategory] = useState<"position" | "group" | "squad" | "tag">("position");

  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const toggle = (item: string) => {
    setSelected((prev) => ({
      ...prev,
      [item]: !prev[item],
    }));
  };

  const applyFilters = () => {
    const filters = Object.keys(selected).filter((k) => selected[k]);
    onApply(filters);
    onOpenChange(false);
  };

  const clearFilters = () => {
    setSelected({});
    onClear();
  };

  const getItems = () => {
    switch (activeCategory) {
      case "position": return positions;
      case "group": return groups;
      case "squad": return squads;
      case "tag": return tags;
    }
  };

  const categoryItems = getItems();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-4 rounded-xl border border-[var(--border)]">
        <DialogHeader>
          <DialogTitle className="text-[var(--text-dark)] flex items-center gap-2">
            <Filter className="h-4 w-4" /> Filter Athletes
          </DialogTitle>
        </DialogHeader>

        {/* CATEGORY TABS */}
        <div className="flex items-center gap-2 mt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveCategory("position")}
            className={`rounded-full px-3 py-1 text-xs ${
              activeCategory === "position"
                ? "bg-[var(--accent-bg)] text-[var(--accent)]"
                : "text-[var(--text)] hover:bg-[var(--gray-200)]"
            }`}
          >
            Position
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveCategory("group")}
            className={`rounded-full px-3 py-1 text-xs ${
              activeCategory === "group"
                ? "bg-[var(--accent-bg)] text-[var(--accent)]"
                : "text-[var(--text)] hover:bg-[var(--gray-200)]"
            }`}
          >
            Group
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveCategory("squad")}
            className={`rounded-full px-3 py-1 text-xs ${
              activeCategory === "squad"
                ? "bg-[var(--accent-bg)] text-[var(--accent)]"
                : "text-[var(--text)] hover:bg-[var(--gray-200)]"
            }`}
          >
            Squad
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveCategory("tag")}
            className={`rounded-full px-3 py-1 text-xs ${
              activeCategory === "tag"
                ? "bg-[var(--accent-bg)] text-[var(--accent)]"
                : "text-[var(--text)] hover:bg-[var(--gray-200)]"
            }`}
          >
            Tags
          </Button>
        </div>

        {/* ITEM MULTI-SELECT LIST */}
        <div className="mt-3 max-h-56 overflow-y-auto space-y-1 pr-1">
          {categoryItems?.map((item) => {
            const isSelected = selected[item];
            return (
              <button
                key={item}
                onClick={() => toggle(item)}
                className={`
                  w-full flex items-center justify-between
                  px-3 py-2 rounded-md text-sm
                  border border-[var(--border)]
                  ${
                    isSelected
                      ? "bg-[var(--accent-bg)] text-[var(--accent)]"
                      : "bg-[var(--gray-50)] text-[var(--text-dark)] hover:bg-[var(--gray-100)]"
                  }
                `}
              >
                <span>{item}</span>
                {isSelected && <Check className="h-4 w-4" strokeWidth={2} />}
              </button>
            );
          })}
        </div>

        {/* FOOTER BUTTONS */}
        <div className="mt-4 flex justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="
              rounded-full px-4 py-1 text-xs
              bg-[var(--gray-200)]
              text-[var(--text-dark)]
              hover:bg-[var(--gray-300)]
            "
          >
            <X className="h-3 w-3 mr-1" /> Clear All
          </Button>

          <Button
            size="sm"
            onClick={applyFilters}
            className="
              rounded-full px-4 py-1 text-xs
              bg-[var(--accent)] text-white
              hover:bg-[color-mix(in_srgb,var(--accent)_85%,black)]
            "
          >
            Apply Filters
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
