import React, { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  Pencil,
  Trash2,
  Settings2,
  Type,
  Hash,
  List,
  CheckSquare,
  Clock,
  Plus,
  Pin,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LedgerHeadersProps {
  ledgerId: string;
  headers: any[];
  reloadHeaders: () => Promise<void>;
  pinnedColumns?: string[];
  onTogglePin?: (id: string) => void;
  pinMode?: boolean;
}

/* -------------------------------------------------------------------------- */
/*                            HEADER CELL COMPONENT                           */
/* -------------------------------------------------------------------------- */
function HeaderCell({
  header,
  index,
  isEditing,
  editValue,
  setEditValue,
  setEditingId,
  handleRename,
  handleChangeType,
  handleDelete,
  addAt,
  typeIcons,
  pinnedColumns = [],
  onTogglePin,
  pinMode = false,
}: any) {
  const Icon = typeIcons[header.type] || Type;
  const isPinned = pinnedColumns.includes(header.id);
  const pinnedIndex = pinnedColumns.indexOf(header.id);
  const columnWidth = 150; // must match LedgerSheet
  const leftOffset = pinnedIndex >= 0 ? 50 + pinnedIndex * columnWidth : null; // WHY IS THIS??

  return (
    <motion.div
      layout
      transition={{ type: "spring", stiffness: 280, damping: 25 }}
      className={`group relative overflow-visible w-full border-none px-2 py-1.5 flex items-center justify-between
        ${isPinned ? "bg-gray-50 shadow-inner" : "bg-gray-100"}
        ${pinMode ? "ring-2 ring-primary/40" : ""}
        ${isPinned ? "z-10" : "z-0"}
      `}
      style={
        isPinned
          ? {
              left: `${leftOffset}px`,
              zIndex: 60,
              background: "white",
              boxShadow: "1px 0 0 rgba(0,0,0,0.08)",
            }
          : {}
      }
    >
      {/* --- Left side: icon + name --- */}
      <div
        className="flex items-center gap-2 overflow-hidden select-none"
        onClick={() => {
          if (pinMode) onTogglePin?.(header.id);
        }}
      >
        <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
        {isEditing ? (
          <Input
            value={editValue}
            autoFocus
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={() => handleRename(header.id)}
            onKeyDown={(e) => e.key === "Enter" && handleRename(header.id)}
            className="h-7 text-sm px-1"
          />
        ) : (
          <span
            className="font-semibold text-sm truncate cursor-pointer"
            onDoubleClick={() => {
              if (!pinMode) {
                setEditingId(header.id);
                setEditValue(header.name);
              }
            }}
          >
            {header.name || String.fromCharCode(65 + index)}
          </span>
        )}
      </div>

      {/* --- Right side: pin + dropdown --- */}
      <div className="flex items-center gap-1">
        {/* 📌 Pin toggle */}
        <motion.button
          title={isPinned ? "Unpin column" : "Pin column"}
          onClick={() => onTogglePin?.(header.id)}
          className={`h-7 w-7 p-0 flex items-center justify-center rounded-md transition
            ${
              isPinned
                ? "text-primary opacity-100"
                : "text-muted-foreground hover:text-primary/80 " +
                  (pinMode ? "opacity-100" : "opacity-0 group-hover:opacity-100")
            }
          `}
          whileTap={{ scale: 0.9 }}
        >
          <motion.div
            initial={false}
            animate={{
              rotate: isPinned ? 45 : 0,
              scale: isPinned ? 1.05 : 1,
            }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            <Pin
              className={`w-4 h-4 transition ${
                isPinned ? "fill-[hsl(var(--primary))]" : ""
              }`}
            />
          </motion.div>
        </motion.button>

        {/* ⚙️ Dropdown Menu — always visible */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 p-0 text-muted-foreground hover:text-primary/80 transition"
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Settings2 className="w-4 h-4 mr-2" /> Edit column type
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {Object.keys(typeIcons).map((type) => {
                  const TypeIcon = typeIcons[type];
                  return (
                    <DropdownMenuItem
                      key={type}
                      onClick={() => handleChangeType(header.id, type)}
                    >
                      <TypeIcon className="w-4 h-4 mr-2" /> {type}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => {
                setEditingId(header.id);
                setEditValue(header.name);
              }}
            >
              <Pencil className="w-4 h-4 mr-2" /> Rename column
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => handleDelete(header.id, header.name)}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete column
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ➕ Add Column Button */}
      <button
        onClick={() => addAt(index + 1)}
        className="pointer-events-auto absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 h-6 w-6 rounded-md bg-primary text-primary-foreground shadow opacity-0 group-hover:opacity-100 transition hover:bg-primary/80"
        title="Add column here"
      >
        <Plus className="w-3 h-3" />
      </button>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              MAIN COMPONENT                                */
/* -------------------------------------------------------------------------- */
export default function LedgerHeaders({
  ledgerId,
  headers,
  reloadHeaders,
  pinnedColumns = [],
  onTogglePin,
  pinMode = false,
}: LedgerHeadersProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [newOptions, setNewOptions] = useState<string[]>([]);
  const [openOptionsEditor, setOpenOptionsEditor] = useState<any | null>(null);

  const typeIcons: Record<string, React.ElementType> = {
    text: Type,
    number: Hash,
    dropdown: List,
    checkbox: CheckSquare,
    time: Clock,
  };

  /* ---------------------------- Add Column ---------------------------- */
  const addAt = async (index: number) => {
    try {
      const { error } = await supabase.from("ledger_headers").insert([
        {
          ledger_id: ledgerId,
          name: `Column ${headers.length + 1}`,
          type: "text",
          is_locked: false,
          options: [],
          formula: null,
          order_index: index,
        },
      ]);
      if (error) throw error;

      toast.success("Column added");
      reloadHeaders();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add column");
    }
  };

  /* ---------------------------- Rename Column ---------------------------- */
  const handleRename = async (headerId: string) => {
    if (!editValue.trim()) return;
    try {
      await supabase
        .from("ledger_headers")
        .update({ name: editValue })
        .eq("id", headerId);
      toast.success("Header renamed");
      setEditingId(null);
      reloadHeaders();
    } catch {
      toast.error("Failed to rename header");
    }
  };

  /* ---------------------------- Delete Column ---------------------------- */
  const handleDelete = async (headerId: string, name: string) => {
    if (!confirm(`Delete column "${name}"?`)) return;
    try {
      await supabase.from("ledger_headers").delete().eq("id", headerId);
      toast.success("Header deleted");
      reloadHeaders();
    } catch {
      toast.error("Failed to delete header");
    }
  };

  /* --------------------------- Change Type --------------------------- */
  const handleChangeType = async (headerId: string, type: string) => {
    try {
      await supabase.from("ledger_headers").update({ type }).eq("id", headerId);
      toast.success(`Column type set to ${type}`);
      reloadHeaders();
    } catch {
      toast.error("Failed to update column type");
    }
  };

  /* ----------------------------- RENDER ----------------------------- */
  return (
    <>
      {headers.map((h, i) => (
        <HeaderCell
          key={h.id}
          header={h}
          index={i}
          isEditing={editingId === h.id}
          editValue={editValue}
          setEditValue={setEditValue}
          setEditingId={setEditingId}
          handleRename={handleRename}
          handleChangeType={handleChangeType}
          handleDelete={handleDelete}
          addAt={addAt}
          typeIcons={typeIcons}
          pinnedColumns={pinnedColumns}
          onTogglePin={onTogglePin}
          pinMode={pinMode}
        />
      ))}

      {/* --- Dropdown Options Editor --- */}
      <Dialog
        open={!!openOptionsEditor}
        onOpenChange={() => setOpenOptionsEditor(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Edit Options for {openOptionsEditor?.name || "Dropdown"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            {newOptions.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  value={opt}
                  onChange={(e) => {
                    const copy = [...newOptions];
                    copy[i] = e.target.value;
                    setNewOptions(copy);
                  }}
                  placeholder={`Option ${i + 1}`}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() =>
                    setNewOptions((prev) => prev.filter((_, idx) => idx !== i))
                  }
                >
                  ✕
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={() => setNewOptions([...newOptions, ""])}
            >
              + Add Option
            </Button>
          </div>

          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setOpenOptionsEditor(null)}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                const options = newOptions.filter((o) => o.trim() !== "");
                await supabase
                  .from("ledger_headers")
                  .update({ options })
                  .eq("id", openOptionsEditor.id);
                toast.success("Dropdown options updated");
                setOpenOptionsEditor(null);
                reloadHeaders();
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
