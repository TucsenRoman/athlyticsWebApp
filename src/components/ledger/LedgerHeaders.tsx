import React, { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import RouteInfo from "./RouteInfo";
import RouteSetup from "./RouteSetup";
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
  Funnel,
  ArrowUpNarrowWide,
  ArrowDownWideNarrow,
  Route,
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
  onSort,
  reloadHeaders,
  ledgerId,
}: any) {
  const Icon = typeIcons?.[header?.type] || Type;
  const isPinned = pinnedColumns?.includes(header?.id);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [routeSetupOpen, setRouteSetupOpen] = useState(false);
  const [routeInfoOpen, setRouteInfoOpen] = useState(false);
  const [activeColumn, setActiveColumn] = useState<any>(null);

  const isPrimary = header?.is_routed && !header?.source_ledger_id;
  const isSecondary = header?.is_routed && !!header?.source_ledger_id;

  return (
    <>
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 280, damping: 25 }}
        className={`group relative overflow-visible h-full w-full px-2 flex gap-[20px] ${
          pinMode ? "ring-2" : ""
        } z-10 rounded-t-[20px]`}
        style={{
          zIndex: isPinned ? 60 : 0,
          background: isPinned ? "#fff" : undefined,
        }}
      >
        {/* Left Side — Icon + Name */}
        <div className="flex items-center gap-2 overflow-hidden select-none">
          <Icon className="w-4 h-4 text-muted-foreground shrink-0" />

          {(isPinned || pinMode) && (
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePin?.(header?.id);
              }}
              title={isPinned ? "Unpin column" : "Pin column"}
              initial={{ opacity: 0, rotate: 0, scale: 0.9 }}
              animate={{
                opacity: 1,
                rotate: isPinned ? 45 : 0,
                scale: 1,
              }}
              whileHover={{ scale: 1.1, opacity: 0.9 }}
              className="flex items-center justify-center cursor-pointer transition-colors"
            >
              <Pin
                className={`w-3.5 h-3.5 ${
                  isPinned
                    ? "fill-[hsl(var(--primary))] text-[hsl(var(--primary))]"
                    : "text-muted-foreground"
                }`}
              />
            </motion.button>
          )}

          {isEditing ? (
            <Input
              value={editValue}
              autoFocus
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => handleRename?.(header?.id)}
              onKeyDown={(e) => e.key === "Enter" && handleRename?.(header?.id)}
              className="h-7 text-sm px-1 border-none outline-none focus:ring-0"
            />
          ) : (
            <span
              className="font-semibold text-sm truncate cursor-pointer"
              onDoubleClick={() => {
                if (!pinMode) {
                  setEditingId?.(header?.id);
                  setEditValue?.(header?.name);
                }
              }}
            >
              {header?.name || `Column ${index + 1}`}
            </span>
          )}
        </div>

        {/* Right Side — Route Icon (if routed) + Dropdown */}
        <div className="flex items-center gap-1 pr-[3px] text-muted-foreground">
          {header?.is_routed && (
            <Route
              size={14}
              strokeWidth={2}
              onClick={(e) => {
                e.stopPropagation();
                setActiveColumn(header);
                setRouteInfoOpen(true);
              }}
              className={`cursor-pointer opacity-80 hover:opacity-100 text-[hsl(var(--secondary))]`}
            />
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-primary transition"
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-56 border border-gray-200 shadow-md"
            >
              {/* ---------- SORT + FILTER ---------- */}
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  setDialogOpen(true);
                }}
              >
                <Funnel className="w-4 h-4 mr-2" />
                Sort & Filter...
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-gray-200" />

              {/* ---------- TYPE SETTINGS ---------- */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Settings2 className="w-4 h-4 mr-2" /> Edit column type
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {Object.keys(typeIcons || {}).map((type) => {
                    const TypeIcon = typeIcons[type];
                    return (
                      <DropdownMenuItem
                        key={type}
                        onClick={() =>
                          handleChangeType?.(header?.id, type)
                        }
                      >
                        <TypeIcon className="w-4 h-4 mr-2" /> {type}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSeparator className="bg-gray-200" />

              {/* 🧩 Route Setup — Only if NOT routed */}
              {!header?.is_routed && (
                <>
                  <DropdownMenuItem
                    onClick={() => {
                      setActiveColumn(header);
                      setRouteSetupOpen(true);
                    }}
                  >
                    <Route className="w-4 h-4 mr-2" /> Route Column
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-200" />
                </>
              )}

              {/* ---------- COLUMN ACTIONS ---------- */}
              <DropdownMenuItem
                onClick={() => {
                  setEditingId?.(header?.id);
                  setEditValue?.(header?.name);
                }}
              >
                <Pencil className="w-4 h-4 mr-2" /> Rename column
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => onTogglePin?.(header?.id)}>
                <Pin className="w-4 h-4 mr-2" />
                {isPinned ? "Unpin column" : "Pin column"}
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => addAt?.(index + 1)}>
                <Plus className="w-4 h-4 mr-2" /> Add new column
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-gray-200" />

              <DropdownMenuItem
                onClick={() => handleDelete?.(header?.id, header?.name)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete column
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>

      {/* ---------- Sort & Filter Dialog ---------- */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Sort & Filter</DialogTitle>
          </DialogHeader>

          <div className="mt-3 mb-5 flex flex-col items-center text-center">
            <h3 className="text-base font-semibold">{header?.name}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Choose a sort order or close to keep as-is
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 justify-center gap-1"
              onClick={() => onSort?.(header?.id, "asc")}
            >
              <ArrowUpNarrowWide className="w-4 h-4" /> Ascending
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 justify-center gap-1"
              onClick={() => onSort?.(header?.id, "desc")}
            >
              <ArrowDownWideNarrow className="w-4 h-4" /> Descending
            </Button>
          </div>

          <DialogFooter className="mt-4">
            <Button size="sm" onClick={() => setDialogOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 🧭 Route Dialogs */}
      <RouteSetup
        currentLedgerId={ledgerId}
        open={routeSetupOpen}
        onClose={() => setRouteSetupOpen(false)}
        column={activeColumn}
        onRouted={reloadHeaders}
      />
      <RouteInfo
        open={routeInfoOpen}
        onClose={() => setRouteInfoOpen(false)}
        column={activeColumn}
        onUpdated={reloadHeaders}
      />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*                              MAIN COMPONENT                                */
/* -------------------------------------------------------------------------- */
export default function LedgerHeaders({
  ledgerId,
  headers = [],
  reloadHeaders,
  pinnedColumns = [],
  onTogglePin,
  pinMode = false,
  onSort,
}: any) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const typeIcons: Record<string, React.ElementType> = {
    text: Type,
    number: Hash,
    dropdown: List,
    checkbox: CheckSquare,
    time: Clock,
  };

  const addAt = async (index: number) => {
    try {
      const { error } = await supabase.from("ledger_headers").insert([
        {
          ledger_id: ledgerId,
          name: `Column ${headers?.length + 1}`,
          type: "text",
          is_locked: false,
          options: [],
          order_index: index,
        },
      ]);
      if (error) throw error;
      toast.success("Column added");
      reloadHeaders?.();
    } catch {
      toast.error("Failed to add column");
    }
  };

  const handleRename = async (headerId: string) => {
    if (!editValue.trim()) return;
    try {
      await supabase
        .from("ledger_headers")
        .update({ name: editValue })
        .eq("id", headerId);
      toast.success("Header renamed");
      setEditingId(null);
      reloadHeaders?.();
    } catch {
      toast.error("Failed to rename header");
    }
  };

  const handleDelete = async (headerId: string, name: string) => {
    if (!confirm(`Delete column "${name}"?`)) return;
    try {
      await supabase.from("ledger_headers").delete().eq("id", headerId);
      toast.success("Header deleted");
      reloadHeaders?.();
    } catch {
      toast.error("Failed to delete header");
    }
  };

  const handleChangeType = async (headerId: string, type: string) => {
    try {
      await supabase.from("ledger_headers").update({ type }).eq("id", headerId);
      toast.success(`Column type set to ${type}`);
      reloadHeaders?.();
    } catch {
      toast.error("Failed to update column type");
    }
  };

  if (!Array.isArray(headers) || headers.length === 0) {
    return (
      <div className="text-sm text-muted-foreground italic px-2 py-2">
        No columns yet.
      </div>
    );
  }

  return (
    <div className="flex items-center gap-[1px]">
      {headers.map((header: any, index: number) => (
        <HeaderCell
          key={header.id}
          header={header}
          index={index}
          isEditing={editingId === header.id}
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
          onSort={onSort}
          reloadHeaders={reloadHeaders}
          ledgerId={ledgerId}
        />
      ))}
    </div>
  );
}
