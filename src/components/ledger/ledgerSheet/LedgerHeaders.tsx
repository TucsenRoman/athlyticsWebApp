import React, { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
  Link,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import RouteConnect from "../RouteConnect";
import RouteInfo from "../RouteInfo";

/* -------------------------------------------------------------------------- */
/*                                Header Cell                                 */
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
  pinnedColumns,
  onTogglePin,
  pinMode,
  onSort,
  ledgerId,
  routes,
  onOpenRouteConnect,
  onOpenRouteInfo,
}: any) {
  const Icon = typeIcons?.[header?.type] || Type;
  const isPinned = pinnedColumns.includes(header?.id);

  const [dialogOpen, setDialogOpen] = useState(false);

  // 🔗 Route state now comes from route_class via parent
  const isPrimary = header?.isPrimary;
  const isSecondary = header?.isSecondary;

  const routeIconColor =
    isPrimary
      ? "text-blue-500 hover:text-blue-600"
      : isSecondary
      ? "text-green-500 hover:text-green-600"
      : "";

  return (
    <>
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className={`group relative flex items-center justify-between overflow-hidden rounded-t-[12px] px-2 border-r border-gray-100
          ${pinMode ? "ring-2 ring-[hsl(var(--primary))/0.3]" : ""}`}
        style={{
          width: "150px",
          minWidth: "150px",
          maxWidth: "150px",
          background: isPinned ? "#fff" : "transparent",
          zIndex: isPinned ? 50 : 1,
        }}
      >
        {/* ---------- LEFT: Icon + Column Name ---------- */}
        <div className="flex items-center gap-2 overflow-hidden select-none">
          <Icon className="w-4 h-4 text-muted-foreground shrink-0" />

          {(isPinned || pinMode) && (
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePin?.(header?.id);
              }}
              title={isPinned ? "Unpin column" : "Pin column"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="cursor-pointer"
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
              onBlur={() => handleRename(header.id)}
              onKeyDown={(e) => e.key === "Enter" && handleRename(header.id)}
              className="h-7 text-sm px-1 border-none focus:ring-0 truncate"
              style={{ width: "120px" }}
            />
          ) : (
            <span
              className="font-semibold text-sm truncate cursor-pointer max-w-[120px]"
              title={header?.name}
              onDoubleClick={() => {
                if (!pinMode) {
                  setEditingId(header.id);
                  setEditValue(header.name);
                }
              }}
            >
              {header?.name || `Column ${index + 1}`}
            </span>
          )}
        </div>

        {/* ---------- RIGHT: Route Icon + Dropdown ---------- */}
        <div className="flex items-center gap-1 pr-[2px] relative">
          {(isPrimary || isSecondary) && (
            <Link
              size={15}
              strokeWidth={2.3}
              onClick={(e) => {
                e.stopPropagation();
                onOpenRouteInfo?.(header);
              }}
              className={`cursor-pointer opacity-90 ${routeIconColor}`}
              aria-label={isPrimary ? "Primary Route" : "Secondary Route"}
            />
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-primary"
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-56 border border-gray-200 shadow-md"
            >
              {/* ---------- Sort ---------- */}
              <DropdownMenuItem onClick={() => setDialogOpen(true)}>
                <Funnel className="w-4 h-4 mr-2" /> Sort & Filter
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* ---------- Edit Type ---------- */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Settings2 className="w-4 h-4 mr-2" /> Edit Column Type
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

              {/* ---------- Connect Route ---------- */}
              {!isPrimary && !isSecondary && (
                <>
                  <DropdownMenuItem
                    onClick={() => {
                      onOpenRouteConnect?.(header);
                    }}
                  >
                    <Link className="w-4 h-4 mr-2" /> Connect Route
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}

              {/* ---------- Column Actions ---------- */}
              <DropdownMenuItem
                onClick={() => {
                  setEditingId(header.id);
                  setEditValue(header.name);
                }}
              >
                <Pencil className="w-4 h-4 mr-2" /> Rename Column
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => onTogglePin?.(header.id)}>
                <Pin className="w-4 h-4 mr-2" />
                {isPinned ? "Unpin Column" : "Pin Column"}
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => addAt(index + 1)}>
                <Plus className="w-4 h-4 mr-2" /> Add Column
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => handleDelete(header.id, header.name)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete Column
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>

      {/* ---------- Sort Dialog ---------- */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Sort & Filter</DialogTitle>
          </DialogHeader>

          <div className="my-3 text-center">
            <h3 className="text-base font-semibold">{header.name}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Choose a sort order or close to keep as-is.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSort && onSort(header.id, "asc")}
            >
              <ArrowUpNarrowWide className="w-4 h-4 mr-1" /> Ascending
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSort && onSort(header.id, "desc")}
            >
              <ArrowDownWideNarrow className="w-4 h-4 mr-1" /> Descending
            </Button>
          </div>

          <DialogFooter className="mt-4">
            <Button size="sm" onClick={() => setDialogOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*                                LedgerHeaders                               */
/* -------------------------------------------------------------------------- */

export default function LedgerHeaders({
  ledgerId,
  headers = [],
  allHeaders = [],
  reloadHeaders,
  pinnedColumns = [],
  onTogglePin,
  pinMode = false,
  onSort,
  routes = [],
  reloadRoutes,
}: any) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  // active column for route dialogs
  const [activeColumn, setActiveColumn] = useState<any | null>(null);
  const [routeConnectOpen, setRouteConnectOpen] = useState(false);
  const [routeInfoOpen, setRouteInfoOpen] = useState(false);

  // Ledger name lookup for RouteConnect dropdowns
  const [ledgerNames, setLedgerNames] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadLedgerNames() {
      // Use allHeaders if available for global routing,
      // otherwise fall back to the local headers array.
      const source = (allHeaders && allHeaders.length > 0) ? allHeaders : headers;

      if (!source || source.length === 0) return;

      const ledgerIds = [...new Set(source.map((h: any) => h.ledger_id))] as string[];

      if (ledgerIds.length === 0) return;

      const { data, error } = await supabase
        .from("ledgers")
        .select("id, name")
        .in("id", ledgerIds)

      if (error) {
        console.error("Failed to load ledger names:", error);
        return;
      }

      const map: Record<string, string> = {};
      for (const row of data) map[row.id] = row.name;

      setLedgerNames(map);
    }

    loadLedgerNames();
  }, [headers, allHeaders]);

  const typeIcons: Record<string, React.ElementType> = {
    text: Type,
    number: Hash,
    select: List,
    checkbox: CheckSquare,
    time: Clock,
  };

  /* ------------------------------ Add Column ------------------------------ */
  const addAt = useCallback(
    async (index: number) => {
      try {
        const { error } = await supabase.from("ledger_headers").insert([
          {
            ledger_id: ledgerId,
            name: `Column ${headers.length + 1}`,
            type: "text",
            order_index: index,
            options: [],
            // route_class will use DB default ("independent")
          },
        ]);
        if (error) throw error;
        toast.success("Column added");
        reloadHeaders();
      } catch {
        toast.error("Failed to add column");
      }
    },
    [ledgerId, headers.length, reloadHeaders]
  );

  /* ------------------------------ Rename Header ------------------------------ */
  const handleRename = useCallback(
    async (headerId: string) => {
      if (!editValue.trim()) {
        setEditingId(null);
        return;
      }
      try {
        const { error } = await supabase
          .from("ledger_headers")
          .update({ name: editValue })
          .eq("id", headerId);
        if (error) throw error;
        toast.success("Header renamed");
        setEditingId(null);
        reloadHeaders();
      } catch {
        toast.error("Failed to rename header");
      }
    },
    [editValue, reloadHeaders]
  );

  /* ------------------------------ Delete Header ------------------------------ */
  const handleDelete = useCallback(
    async (headerId: string, name: string) => {
      if (!confirm(`Delete column "${name}"?`)) return;
      try {
        const { error } = await supabase
          .from("ledger_headers")
          .delete()
          .eq("id", headerId);
        if (error) throw error;
        toast.success("Header deleted");
        reloadHeaders();
      } catch {
        toast.error("Failed to delete header");
      }
    },
    [reloadHeaders]
  );

  /* ------------------------------ Change Type ------------------------------ */
  const handleChangeType = useCallback(
    async (headerId: string, type: string) => {
      try {
        const { error } = await supabase
          .from("ledger_headers")
          .update({ type })
          .eq("id", headerId);
        if (error) throw error;
        toast.success(`Type set to ${type}`);
        reloadHeaders();
      } catch {
        toast.error("Failed to change type");
      }
    },
    [reloadHeaders]
  );

  /* ------------------------------ Route Dialog Hooks ----------------------- */

  const handleOpenRouteConnect = useCallback((header: any) => {
    setActiveColumn(header);
    setRouteConnectOpen(true);
  }, []);

  const handleOpenRouteInfo = useCallback((header: any) => {
    setActiveColumn(header);
    setRouteInfoOpen(true);
  }, []);

  /* ------------------------------ Render Headers --------------------------- */
  if (!headers.length)
    return (
      <div className="text-sm text-muted-foreground italic p-2">
        No columns yet.
      </div>
    );

  return (
    <>
      <div className="flex items-center gap-[1px] overflow-x-auto">
        {headers.map((header: any, index: number) => {
          // ✅ New truth source: route_class from the header row
          const isPrimary = header.route_class === "primary";
          const isSecondary = header.route_class === "secondary";

          return (
            <HeaderCell
              key={header.id}
              header={{ ...header, isPrimary, isSecondary }}
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
              ledgerId={ledgerId}
              routes={routes}
              onOpenRouteConnect={handleOpenRouteConnect}
              onOpenRouteInfo={handleOpenRouteInfo}
            />
          );
        })}
      </div>

      {/* ---------- Route Connect Dialog (NEW SYSTEM) ---------- */}
      <RouteConnect
        open={routeConnectOpen}
        onClose={() => setRouteConnectOpen(false)}
        column={activeColumn}
        headers={allHeaders || headers} // prefer global headers, fallback local
        routes={routes}
        ledgerNames={ledgerNames}
        reloadHeaders={reloadHeaders}
        reloadRoutes={reloadRoutes || (() => {})}
      />

      {/* ---------- Route Info Dialog (NEW SYSTEM) ---------- */}
      <RouteInfo
        open={routeInfoOpen}
        onClose={() => setRouteInfoOpen(false)}
        column={activeColumn}
        ledgerNames={ledgerNames}
        allHeaders={allHeaders || headers}
        allRoutes={routes}
        reloadHeaders={reloadHeaders}
        reloadRoutes={reloadRoutes || (() => {})}
        onUpdated={() => {
          reloadHeaders();
          reloadRoutes();
        }}
      />
    </>
  );
}
 