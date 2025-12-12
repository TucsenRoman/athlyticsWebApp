// src/components/ledger/LedgerDropdown.tsx
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/data_display/badge";
import { Button } from "@/components/ui/actions/button";
import { Input } from "@/components/ui/forms/input";
import type { Json } from "@/integrations/supabase/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/overlays/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command/command";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/overlays/popover";
import { Pencil } from "lucide-react";

interface LedgerDropdownProps {
  entryId: string;
  header: any;
  value: string;
  onChange: (val: string) => void;
}

interface OptionItem extends Record<string, Json> {
  label: string;
  color: string;
}

const DEFAULT_COLORS = [
  "#A0AEC0", // gray
  "#F6AD55", // orange
  "#FC8181", // red
  "#68D391", // green
  "#63B3ED", // blue
  "#B794F4", // purple
];

export default function LedgerDropdown({
  entryId,
  header,
  value,
  onChange,
}: LedgerDropdownProps) {
  const [open, setOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [options, setOptions] = useState<OptionItem[]>([]);
  const [search, setSearch] = useState("");

  // 🧠 Load header options (ensure color data)
  useEffect(() => {
    try {
      if (Array.isArray(header.options)) {
        const opts = header.options.map((opt: any, i) =>
          typeof opt === "string"
            ? { label: opt, color: DEFAULT_COLORS[i % DEFAULT_COLORS.length] }
            : opt
        );
        setOptions(opts);
      }
    } catch {
      setOptions([]);
    }
  }, [header.options]);

  const selected = options.find((o) => o.label === value);

  const handleSelect = (label: string) => {
    onChange(label);
    setOpen(false);
  };

  const handleAddOption = async () => {
    if (!search.trim()) return;
    const newOpt: OptionItem = {
      label: search.trim(),
      color: DEFAULT_COLORS[options.length % DEFAULT_COLORS.length],
    };
    const updated = [...options, newOpt];
    setOptions(updated);
    setSearch("");

    await supabase
      .from("ledger_headers")
      .update({ options: updated as unknown as Json[] })
      .eq("id", header.id);
  };

  return (
    <>
      {/* 🔽 Dropdown trigger */}
      <Popover open={open} onOpenChange={setOpen} modal={false}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-7 justify-start text-left text-sm bg-transparent hover:bg-muted/50"
          >
            {selected ? (
              <Badge
                style={{
                  backgroundColor: selected.color,
                  color: "white",
                  borderRadius: "6px",
                }}
                className="px-2 py-0.5 text-xs font-medium"
              >
                {selected.label}
              </Badge>
            ) : (
              <span className="text-muted-foreground text-xs">Select...</span>
            )}
          </Button>
        </PopoverTrigger>

        {/* 🔽 Dropdown content */}
        <PopoverContent
            align="start"
            className="w-[220px] bg-white border rounded-md shadow-md p-0 flex flex-col"
        >
        {/* Search + Options */}
        <div className="flex flex-col flex-1 p-2 min-h-[200px] max-h-[300px] overflow-y-auto">
            <Command shouldFilter={false}>
            <CommandInput
                placeholder="Search options..."
                value={search}
                onValueChange={setSearch}
                className="mb-2"
            />
            <CommandList className="space-y-1">
                {options.length > 0 ? (
                options.map((opt, i) => (
                    <CommandItem
                    key={i}
                    onSelect={() => handleSelect(opt.label)}
                    className="cursor-pointer rounded-sm px-2 py-1.5 hover:bg-gray-100"
                    >
                    <div
                        className="flex items-center gap-2 w-full"
                        style={{
                        backgroundColor: opt.color || "#e5e7eb",
                        borderRadius: "4px",
                        padding: "2px 6px",
                        }}
                    >
                        <span className="text-xs text-white font-medium">{opt.label}</span>
                    </div>
                    </CommandItem>
                ))
                ) : (
                <CommandEmpty>No options yet</CommandEmpty>
                )}
            </CommandList>
            </Command>
        </div>

            {/* Edit footer */}
            <div className="border-t bg-gray-50 py-2 px-3 flex justify-end items-center">
                <button
                onClick={() => setEditDialogOpen(true)}
                className="flex items-center text-muted-foreground hover:text-primary text-xs transition"
                >
                <Pencil className="w-3 h-3 mr-1" /> Edit options
                </button>
            </div>
        </PopoverContent>
      </Popover>

      {/* ✏️ Edit Options Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md bg-card">
          <DialogHeader>
            <DialogTitle>Edit Dropdown Options</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  value={opt.label}
                  onChange={(e) => {
                    const updated = [...options];
                    updated[i].label = e.target.value;
                    setOptions(updated);
                  }}
                />
                <Input
                  type="color"
                  value={opt.color || "#cccccc"}
                  onChange={(e) => {
                    const updated = [...options];
                    updated[i].color = e.target.value;
                    setOptions(updated);
                  }}
                  className="w-10 p-0 border-none bg-transparent cursor-pointer"
                />
              </div>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setOptions([
                  ...options,
                  { label: "New option", color: "#cccccc" },
                ])
              }
              className="w-full"
            >
              + Add Option
            </Button>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="ghost" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                await supabase
                  .from("ledger_headers")
                  .update({ options: options as unknown as Json[] })
                  .eq("id", header.id);
                setEditDialogOpen(false);
              }}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
