import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { SquarePen, GripVertical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import { searchHighlight } from "@/utils/searchHighlight";

// 🧱 DND Kit imports
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/* -------------------------------------------------------------------------- */
/*                              TYPES / INTERFACES                             */
/* -------------------------------------------------------------------------- */

interface LedgerCellProps {
  entryId: string;
  header: any;
  value: any;
  onChange: (val: any) => void;
  routeSyncRef?: any;

  searchQuery?: string;

  // ✅ FIX: TypeScript was complaining. Add disabled here.
  disabled?: boolean;
}

/* -------------------------------------------------------------------------- */
/*                             Sortable Option Row                            */
/* -------------------------------------------------------------------------- */

function SortableOption({
  id,
  value,
  onEdit,
  onDelete,
}: {
  id: string;
  value: string;
  onEdit: (val: string) => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? "none" : transition,
    zIndex: isDragging ? 999 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 px-2 py-1.5 rounded-md bg-muted/20 ${
        isDragging ? "shadow-lg scale-[1.02]" : ""
      }`}
    >
      <GripVertical
        {...attributes}
        {...listeners}
        className="w-4 h-4 cursor-grab text-muted-foreground"
      />
      <Input
        value={value}
        onChange={(e) => onEdit(e.target.value)}
        placeholder="Option"
        className="flex-1 h-7"
      />
      <Button
        size="icon"
        variant="ghost"
        onClick={onDelete}
        className="text-muted-foreground hover:text-red-500"
      >
        ✕
      </Button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               Ledger Cell Main                              */
/* -------------------------------------------------------------------------- */

function LedgerCell({
  entryId,
  header,
  value,
  onChange,
  routeSyncRef,
  disabled = false,
  searchQuery,
}: LedgerCellProps) {
  const [localValue, setLocalValue] = useState(value ?? "");
  const [openOptionsEditor, setOpenOptionsEditor] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [editedOptions, setEditedOptions] = useState<string[]>([]);
  const syncTimeout = useRef<NodeJS.Timeout | null>(null);

  /* -------------------------------- Sync external value -------------------------------- */
  useEffect(() => {
    setLocalValue(value ?? "");
  }, [value, header?.id]);

  /* --------------------------- Extract dropdown options --------------------------- */
  useEffect(() => {
    try {
      if (!header) {
        setOptions([]);
        setEditedOptions([]);
        return;
      }

      let parsed: any[] = [];

      if (Array.isArray(header.options)) parsed = header.options;
      else if (typeof header.options === "string" && header.options.trim() !== "") {
        parsed = JSON.parse(header.options);
      }

      if (!Array.isArray(parsed)) parsed = [];

      setOptions(parsed);
      setEditedOptions(parsed);
    } catch {
      setOptions([]);
      setEditedOptions([]);
    }
  }, [header]);

  /* --------------------------- Save dropdown options --------------------------- */

  const handleSaveOptions = async () => {
    const clean = (editedOptions ?? []).filter((o) => o.trim() !== "");
    try {
      const { error } = await supabase
        .from("ledger_headers")
        .update({ options: clean })
        .eq("id", header.id);
      if (error) throw error;

      setOptions(clean);
      toast.success("Dropdown options updated");
      setOpenOptionsEditor(false);
    } catch (err) {
      console.error("❌ Failed to update dropdown options:", err);
      toast.error("Failed to update options");
    }
  };

  /* ------------------------------- Trigger route sync ------------------------------ */
  const triggerSync = () => {
    if (!routeSyncRef?.current?.runInitialSync) return;
    if (syncTimeout.current) clearTimeout(syncTimeout.current);

    syncTimeout.current = setTimeout(() => {
      console.log("🔁 [LedgerCell] Running route sync");
      routeSyncRef.current.runInitialSync();
    }, 300);
  };

  /* -------------------------------- Save cell value -------------------------------- */
  const saveValue = async (val: any) => {
    if (disabled) return;

    try {
      const { error } = await supabase
        .from("ledger_entries")
        .update({ values: { [header.id]: val } })
        .eq("id", entryId);
      if (error) throw error;

      console.log("💾 Saved cell value:", { entryId, col: header.name, val });
      onChange(val);
      triggerSync();
    } catch (err) {
      console.error("❌ Failed to save cell:", err);
      toast.error("Failed to save");
    }
  };

  /* ---------------------------- DnD setup for dropdown options ---------------------------- */
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = (editedOptions ?? []).findIndex((_, i) => `${i}` === active.id);
    const newIndex = (editedOptions ?? []).findIndex((_, i) => `${i}` === over.id);

    setEditedOptions((prev) => arrayMove(prev ?? [], oldIndex, newIndex));
  };

  /* -------------------------------------------------------------------------- */
  /*                                   RENDER                                   */
  /* -------------------------------------------------------------------------- */

  /* ------------------------------ Dropdown type ------------------------------ */
  if (header?.type === "select") {
    return (
      <>
        <Select
          disabled={disabled}
          value={localValue ?? ""}
          onValueChange={(val) => {
            setLocalValue(val);
            saveValue(val);
          }}
        >
          <SelectTrigger className="h-7 text-sm bg-transparent border-none shadow-none focus:ring-0">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>

          <SelectContent>
            {(options ?? []).map((opt, i) => (
              <SelectItem key={i} value={opt}>
                {opt}
              </SelectItem>
            ))}

            {(options ?? []).length > 0 && <div className="border-t my-1" />}

            {/* Manage Options */}
            <div className="flex items-center justify-center py-1">
              <Button
                variant="ghost"
                size="sm"
                disabled={disabled}
                className="text-xs text-muted-foreground flex gap-1"
                onClick={() => setOpenOptionsEditor(true)}
              >
                <SquarePen className="w-3.5 h-3.5" />
                Manage Options
              </Button>
            </div>
          </SelectContent>
        </Select>

        {/* Options Editor */}
        <Dialog open={openOptionsEditor} onOpenChange={setOpenOptionsEditor}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Manage Options for {header?.name || "Dropdown"}
              </DialogTitle>
            </DialogHeader>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={(editedOptions ?? []).map((_, i) => `${i}`)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {(editedOptions ?? []).map((opt, i) => (
                    <SortableOption
                      key={i}
                      id={`${i}`}
                      value={opt}
                      onEdit={(val) => {
                        const copy = [...(editedOptions ?? [])];
                        copy[i] = val;
                        setEditedOptions(copy);
                      }}
                      onDelete={() =>
                        setEditedOptions((prev) =>
                          (prev ?? []).filter((_, idx) => idx !== i)
                        )
                      }
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <Button
              variant="outline"
              className="mt-3"
              onClick={() => setEditedOptions([...(editedOptions ?? []), ""])}
            >
              + Add Option
            </Button>

            <DialogFooter className="pt-3">
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

  /* ------------------------------- Checkbox type ------------------------------- */
  if (header?.type === "checkbox") {
    return (
      <div className="flex justify-center items-center">
        <input
          type="checkbox"
          disabled={disabled}
          checked={!!localValue}
          onChange={(e) => {
            const val = e.target.checked;
            setLocalValue(val);
            saveValue(val);
          }}
          className="w-4 h-4 cursor-pointer disabled:opacity-50"
        />
      </div>
    );
  }

  /* -------------------------- Text / number / time -------------------------- */

  if (header?.type !== "select" && header?.type !== "checkbox") {
    const isNumber = header?.type === "number";
    const isTime = header?.type === "time";
    const isEditing = routeSyncRef?.current?.editingCell === entryId;

    // 🔍 Highlight mode (Ctrl+F style)
    if (!isEditing && !isNumber && !isTime && searchQuery) {
      return (
        <div
          className="h-7 text-sm w-full flex items-center px-2"
          dangerouslySetInnerHTML={{
            __html: searchHighlight(localValue ?? "", searchQuery),
          }}
        />
      );
    }

    // ✏️ Editable input mode
    return (
      <Input
        disabled={disabled}
        type={isNumber ? "number" : isTime ? "time" : "text"}
        value={localValue ?? ""}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={() => {
          if (!disabled && localValue !== value) saveValue(localValue);
        }}
        onKeyDown={(e) => {
          if (
            !disabled &&
            (e.key === "Enter" || e.key === "Tab") &&
            localValue !== value
          ) {
            e.preventDefault();
            e.currentTarget.blur();
          }
        }}
        className="h-7 text-sm w-full border-none bg-transparent focus:ring-0 disabled:opacity-50"
      />
    );
  }
}

export default React.memo(LedgerCell);
