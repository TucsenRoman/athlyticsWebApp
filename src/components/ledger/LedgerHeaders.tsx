// src/components/ledger/LedgerHeaders.tsx
import React, { useState, useEffect } from "react";
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
  setHeaders: React.Dispatch<React.SetStateAction<any[]>>;
  reloadHeaders: () => Promise<void>;
}

export default function LedgerHeaders({
  ledgerId,
  headers,
  setHeaders,
  reloadHeaders,
}: LedgerHeadersProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [openOptionsEditor, setOpenOptionsEditor] = useState<any | null>(null);
  const [newOptions, setNewOptions] = useState<string[]>([]);

  const typeIcons: Record<string, React.ElementType> = {
    text: Type,
    number: Hash,
    dropdown: List,
    checkbox: CheckSquare,
    time: Clock,
  };

  // ✏️ Rename header
  const handleRename = async (headerId: string) => {
    if (!editValue.trim()) return;
    try {
      await supabase.from("ledger_headers").update({ name: editValue }).eq("id", headerId);
      toast.success("Header renamed");
      setEditingId(null);
      reloadHeaders();
    } catch (err) {
      console.error(err);
      toast.error("Failed to rename header");
    }
  };

  // 🗑️ Delete header
  const handleDelete = async (headerId: string, name: string) => {
    if (!confirm(`Delete column "${name}"?`)) return;
    try {
      await supabase.from("ledger_headers").delete().eq("id", headerId);
      toast.success("Header deleted");
      reloadHeaders();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete header");
    }
  };

  // ⚙️ Change type
  const handleChangeType = async (headerId: string, type: string) => {
    try {
      await supabase.from("ledger_headers").update({ type }).eq("id", headerId);
      toast.success(`Column type set to ${type}`);
      reloadHeaders();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update column type");
    }
  };

  // ➕ Add new column
  const handleAddColumn = async () => {
    try {
      await supabase.from("ledger_headers").insert([
        {
          ledger_id: ledgerId,
          name: `Column ${headers.length + 1}`,
          type: "text",
          is_locked: false,
          options: [],
          formula: null,
        },
      ]);
      toast.success("New column added");
      reloadHeaders();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add new column");
    }
  };

  // 🧩 Load options when opening editor
  useEffect(() => {
    if (openOptionsEditor) {
      try {
        const opts = Array.isArray(openOptionsEditor.options)
          ? openOptionsEditor.options
          : JSON.parse(openOptionsEditor.options || "[]");
        setNewOptions(opts);
      } catch {
        setNewOptions([]);
      }
    }
  }, [openOptionsEditor]);

  // 💾 Save dropdown options
  const handleSaveOptions = async () => {
    const options = newOptions.filter((o) => o.trim() !== "");
    try {
      await supabase
        .from("ledger_headers")
        .update({ options })
        .eq("id", openOptionsEditor.id);
      toast.success("Dropdown options updated");
      setOpenOptionsEditor(null);
      reloadHeaders();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update options");
    }
  };

  return (
    <>
      {/* Empty left cell */}
      <div className="sticky top-0 bg-gray-100 border-b border-r p-2 z-10" />

      {/* Header cells */}
      {headers.map((h, i) => {
        const Icon = typeIcons[h.type] || Type;
        return (
          <div
            key={h.id}
            className="sticky top-0 bg-gray-100 border-b border-r px-2 py-1.5 flex items-center justify-between z-10"
          >
            {/* Left: type icon + name */}
            <div className="flex items-center gap-1 overflow-hidden">
              <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
              {editingId === h.id ? (
                <Input
                  value={editValue}
                  autoFocus
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={() => handleRename(h.id)}
                  onKeyDown={(e) => e.key === "Enter" && handleRename(h.id)}
                  className="h-7 text-sm px-1"
                />
              ) : (
                <span
                  className="font-semibold text-sm truncate cursor-pointer"
                  onDoubleClick={() => {
                    setEditingId(h.id);
                    setEditValue(h.name);
                  }}
                >
                  {h.name || String.fromCharCode(65 + i)}
                </span>
              )}
            </div>

            {/* Right: settings dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 p-0">
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                {/* ⚙️ Type editor */}
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
                          onClick={() => handleChangeType(h.id, type)}
                        >
                          <TypeIcon className="w-4 h-4 mr-2" /> {type}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                {/* ✏️ Dropdown options editor */}
                {h.type === "dropdown" && (
                  <DropdownMenuItem onClick={() => setOpenOptionsEditor(h)}>
                    <List className="w-4 h-4 mr-2" /> Edit dropdown options
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                {/* ✏️ Rename / Delete */}
                <DropdownMenuItem
                  onClick={() => {
                    setEditingId(h.id);
                    setEditValue(h.name);
                  }}
                >
                  <Pencil className="w-4 h-4 mr-2" /> Rename column
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDelete(h.id, h.name)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Delete column
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      })}

      {/* ➕ Add Column Button */}
      <div
        onClick={handleAddColumn}
        className="sticky top-0 bg-gray-100 border-b border-r p-2 text-gray-400 hover:text-primary hover:bg-gray-200 cursor-pointer transition flex items-center justify-center"
        title="Add new column"
      >
        <Plus className="w-4 h-4 rotate-90" />
      </div>

      {/* 🧭 Dropdown Options Editor */}
      <Dialog open={!!openOptionsEditor} onOpenChange={() => setOpenOptionsEditor(null)}>
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
            <Button variant="secondary" onClick={() => setOpenOptionsEditor(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveOptions}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
