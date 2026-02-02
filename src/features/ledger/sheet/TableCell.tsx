// src/features/ledger/sheet/TableCell.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/forms/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/forms/select";
import { Button } from "@/components/ui/actions/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/overlays/dialog";
import { SquarePen, GripVertical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

interface TableCellProps {
  entryId: string;
  header: any;
  value: any;

  /**
   * Parent-owned commit handler.
   * Must merge into the row's existing `values` object and write to DB,
   * so this cell stays UI-only and does not double-write.
   */
  onChange: (val: any) => void;

  searchQuery?: string;
  disabled?: boolean;
}

function parseOptions(raw: any): string[] {
  try {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.filter((x) => typeof x === "string");
    if (typeof raw === "string" && raw.trim() !== "") {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed)
        ? parsed.filter((x) => typeof x === "string")
        : [];
    }
    return [];
  } catch {
    return [];
  }
}

/* -------------------------------------------------------------------------- */
/*                             SORTABLE OPTION ROW                            */
/* -------------------------------------------------------------------------- */

function SortableOptionRow({
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

  const style: React.CSSProperties = {
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
        className="w-4 h-4 cursor-grab text-[var(--debug)]"
      />
      <Input
        value={value}
        onChange={(e) => onEdit(e.target.value)}
        placeholder="Option"
        className="flex-1 h-7"
      />
      <Button
        variant="ghost"
        onClick={onDelete}
        className="text-[var(--debug)] hover:-[var(--debug)]"
        type="button"
      >
        ✕
      </Button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                TABLE CELL                                  */
/* -------------------------------------------------------------------------- */

function TableCell({
  entryId,
  header,
  value,
  onChange,
  disabled = false,
  searchQuery,
}: TableCellProps) {
  const [localValue, setLocalValue] = useState(value ?? "");
  const [openOptionsEditor, setOpenOptionsEditor] = useState(false);

  const [options, setOptions] = useState<string[]>([]);
  const [editedOptions, setEditedOptions] = useState<string[]>([]);

  /* -------------------------------- Sync external value -------------------------------- */
  useEffect(() => {
    setLocalValue(value ?? "");
    // only resync when the header id changes or value changes
  }, [value, header?.id]);

  /* --------------------------- Extract dropdown options --------------------------- */
  useEffect(() => {
    const parsed = parseOptions(header?.options);
    setOptions(parsed);
    setEditedOptions(parsed);
  }, [header?.options, header?.id]);

  /* --------------------------- Commit value (parent handles DB) --------------------------- */
  const commit = (val: any) => {
    if (disabled) return;
    onChange(val);
  };

  /* --------------------------- Save dropdown options --------------------------- */
  const handleSaveOptions = async () => {
    if (disabled) return;

    const clean = (editedOptions ?? [])
      .map((o) => String(o ?? "").trim())
      .filter((o) => o !== "");

    try {
      const { error } = await supabase
        .from("table_columns")
        .update({ options: clean })
        .eq("id", header?.id);

      if (error) throw error;

      setOptions(clean);
      setEditedOptions(clean);
      setOpenOptionsEditor(false);
    } catch (err) {
      console.error("❌ Failed to update dropdown options:", err);
    }
  };

  /* ---------------------------- DnD setup for dropdown options ---------------------------- */
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = (editedOptions ?? []).findIndex((_, i) => `${i}` === active.id);
    const newIndex = (editedOptions ?? []).findIndex((_, i) => `${i}` === over.id);

    if (oldIndex < 0 || newIndex < 0) return;

    setEditedOptions((prev) => arrayMove(prev ?? [], oldIndex, newIndex));
  };

  /* -------------------------------------------------------------------------- */
  /*                                   RENDER                                   */
  /* -------------------------------------------------------------------------- */

  // Dropdown
  if (header?.type === "select") {
    return (
      <>
        <Select
          disabled={disabled}
          value={localValue ?? ""}
          onValueChange={(val) => {
            setLocalValue(val);
            commit(val);
          }}
        >
          <SelectTrigger className="h-7 text-sm bg-transparent border-none shadow-none focus:ring-0">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>

          <SelectContent>
            {(options ?? []).map((opt, i) => (
              <SelectItem key={`${opt}-${i}`} value={opt}>
                {opt}
              </SelectItem>
            ))}

            {(options ?? []).length > 0 && <div className="border-t my-1" />}

            {/* Manage Options */}
            <div className="flex items-center justify-center py-1">
              <Button
                variant="ghost"
                disabled={disabled}
                className="text-xs text-muted-foreground flex gap-1"
                onClick={() => setOpenOptionsEditor(true)}
                type="button"
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
                    <SortableOptionRow
                      key={`${i}`}
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
              type="button"
              disabled={disabled}
            >
              + Add Option
            </Button>

            <DialogFooter className="pt-3">
              <Button
                variant="secondary"
                onClick={() => setOpenOptionsEditor(false)}
                type="button"
              >
                Cancel
              </Button>
              <Button onClick={handleSaveOptions} type="button" disabled={disabled}>
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Checkbox
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
            commit(val);
          }}
          className="w-4 h-4 cursor-pointer disabled:opacity-50"
        />
      </div>
    );
  }

  // Text / number / time
  const isNumber = header?.type === "number";
  const isTime = header?.type === "time";

  // Highlight mode (Ctrl+F style) — only for text
  if (!isNumber && !isTime && searchQuery) {
    return (
      <div
        className="h-7 text-sm w-full flex items-center px-2"
        dangerouslySetInnerHTML={{
          __html: searchHighlight(String(localValue ?? ""), searchQuery),
        }}
      />
    );
  }

  return (
    <Input
      disabled={disabled}
      type={isNumber ? "number" : isTime ? "time" : "text"}
      value={localValue ?? ""}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={() => {
        if (!disabled && localValue !== value) commit(localValue);
      }}
      onKeyDown={(e) => {
        if (!disabled && (e.key === "Enter" || e.key === "Tab") && localValue !== value) {
          e.preventDefault();
          e.currentTarget.blur();
        }
      }}
      className="h-7 text-sm w-full border-none bg-transparent focus:ring-0 disabled:opacity-50"
    />
  );
}

export default React.memo(TableCell);
