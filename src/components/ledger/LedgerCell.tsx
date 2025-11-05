// src/components/ledger/LedgerCell.tsx
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { SquarePen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LedgerCellProps {
  entryId: string;
  header: any;
  value: any;
  onChange: (val: any) => void;
}

export default function LedgerCell({
  entryId,
  header,
  value,
  onChange,
}: LedgerCellProps) {
  const [localValue, setLocalValue] = useState(value ?? "");
  const [openOptionsEditor, setOpenOptionsEditor] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [editedOptions, setEditedOptions] = useState<string[]>([]);

  // Keep local value in sync with external updates
  useEffect(() => {
    setLocalValue(value ?? "");
  }, [value, header.id]);

  // Parse dropdown options safely
  useEffect(() => {
    try {
      const parsed =
        Array.isArray(header.options) ||
        typeof header.options === "object"
          ? header.options
          : JSON.parse(header.options || "[]");
      setOptions(parsed);
      setEditedOptions(parsed);
    } catch {
      setOptions([]);
      setEditedOptions([]);
    }
  }, [header]);

  const handleChange = (newVal: any) => {
    setLocalValue(newVal);
    onChange(newVal);
  };

  // 💾 Save edited options to Supabase
  const handleSaveOptions = async () => {
    const cleanOptions = editedOptions.filter((o) => o.trim() !== "");
    try {
      await supabase
        .from("ledger_headers")
        .update({ options: cleanOptions })
        .eq("id", header.id);
      toast.success("Dropdown options updated");
      setOptions(cleanOptions);
      setOpenOptionsEditor(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update options");
    }
  };

  // 🧭 Dropdown cell
  if (header.type === "dropdown") {
    return (
      <>
        <Select value={localValue ?? ""} onValueChange={handleChange}>
          <SelectTrigger className="h-7 text-sm bg-transparent border-none shadow-none focus:ring-0">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>

          <SelectContent>
            {options.map((opt, i) => (
              <SelectItem key={i} value={opt}>
                {opt}
              </SelectItem>
            ))}

            {/* Divider */}
            {options.length > 0 && (
              <div className="border-t my-1 border-border" />
            )}

            {/* Manage dropdown button */}
            <div className="flex items-center justify-center py-1">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground flex items-center gap-1"
                onClick={() => setOpenOptionsEditor(true)}
              >
                <SquarePen className="w-3.5 h-3.5" />
                Manage Options
              </Button>
            </div>
          </SelectContent>
        </Select>

        {/* 🧭 Dropdown Options Editor Dialog */}
        <Dialog open={openOptionsEditor} onOpenChange={setOpenOptionsEditor}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Manage Options for {header.name || "Dropdown"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-2">
              {editedOptions.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    value={opt}
                    onChange={(e) => {
                      const copy = [...editedOptions];
                      copy[i] = e.target.value;
                      setEditedOptions(copy);
                    }}
                    placeholder={`Option ${i + 1}`}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() =>
                      setEditedOptions((prev) =>
                        prev.filter((_, idx) => idx !== i)
                      )
                    }
                  >
                    ✕
                  </Button>
                </div>
              ))}

              <Button
                variant="outline"
                onClick={() => setEditedOptions([...editedOptions, ""])}
              >
                + Add Option
              </Button>
            </div>

            <DialogFooter>
              <Button
                variant="secondary"
                onClick={() => setOpenOptionsEditor(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveOptions}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // ☑️ Checkbox cell
  if (header.type === "checkbox") {
    return (
      <div className="flex justify-center items-center">
        <input
          type="checkbox"
          checked={!!localValue}
          onChange={(e) => handleChange(e.target.checked)}
          className="w-4 h-4 cursor-pointer"
        />
      </div>
    );
  }

  // ✏️ Text / number / time input cell
  return (
    <Input
      type={
        header.type === "number"
          ? "number"
          : header.type === "time"
          ? "time"
          : "text"
      }
      value={localValue ?? ""}
      onChange={(e) => handleChange(e.target.value)}
      className="h-7 text-sm w-full border-none bg-transparent focus:ring-0 focus:outline-none"
    />
  );
}
