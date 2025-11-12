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

interface LedgerCellProps {
  entryId: string;
  header: any;
  value: any;
  onChange: (val: any) => void;
}

/* -------------------------------------------------------------------------- */
/*                              Sortable Option Row                            */
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
/*                              Ledger Cell Main                              */
/* -------------------------------------------------------------------------- */
function LedgerCell({ entryId, header, value, onChange }: LedgerCellProps) {
  const [localValue, setLocalValue] = useState(value ?? "");
  const [openOptionsEditor, setOpenOptionsEditor] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [editedOptions, setEditedOptions] = useState<string[]>([]);

  /* ---------------------------- Sync External Value ---------------------------- */
  useEffect(() => {
    setLocalValue(value ?? "");
  }, [value, header?.id]);

  /* ---------------------------- Parse Dropdown Options ---------------------------- */
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

  /* ---------------------------- Save Dropdown Options ---------------------------- */
  const handleSaveOptions = async () => {
    const cleanOptions = (editedOptions ?? []).filter((o) => o.trim() !== "");
    try {
      const { error } = await supabase
        .from("ledger_headers")
        .update({ options: cleanOptions })
        .eq("id", header.id);
      if (error) throw error;
      toast.success("Dropdown options updated");
      setOptions(cleanOptions);
      setOpenOptionsEditor(false);
    } catch (err) {
      console.error("❌ Failed to update options:", err);
      toast.error("Failed to update options");
    }
  };

  /* ---------------------------- Drag & Drop Setup ---------------------------- */
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = (editedOptions ?? []).findIndex((_, i) => `${i}` === active.id);
    const newIndex = (editedOptions ?? []).findIndex((_, i) => `${i}` === over.id);

    setEditedOptions((prev) => arrayMove(prev ?? [], oldIndex, newIndex));
  };

  /* ---------------------------- Render Types ---------------------------- */

  // 🧭 Dropdown cell
  if (header?.type === "dropdown") {
    return (
      <>
        <Select value={localValue ?? ""} onValueChange={onChange}>
          <SelectTrigger className="h-7 text-sm bg-transparent border-none shadow-none focus:ring-0">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>

          <SelectContent>
            {(options ?? []).map((opt, i) => (
              <SelectItem key={i} value={opt}>
                {opt}
              </SelectItem>
            ))}

            {(options ?? []).length > 0 && (
              <div className="border-t my-1 border-border" />
            )}

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

  // ☑️ Checkbox cell
  if (header?.type === "checkbox") {
    return (
      <div className="flex justify-center items-center">
        <input
          type="checkbox"
          checked={!!localValue}
          onChange={(e) => onChange(e.target.checked)}
          className="w-4 h-4 cursor-pointer"
        />
      </div>
    );
  }

  // ✏️ Text / number / time cell
  return (
    <Input
      type={
        header?.type === "number"
          ? "number"
          : header?.type === "time"
          ? "time"
          : "text"
      }
      value={localValue ?? ""}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={() => {
        if (localValue !== value) onChange(localValue);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" && localValue !== value) e.currentTarget.blur();
      }}
      className="h-7 text-sm w-full border-none bg-transparent focus:ring-0 focus:outline-none"
    />
  );
}

export default React.memo(LedgerCell);
