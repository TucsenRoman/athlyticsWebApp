import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

import {
  LedgerHeader,
  LedgerRouteRecord,
  RouteClass,
  buildChainMap,
  buildColumnRouteInfo,
  buildRemoveSecondaryMutation,
  buildRemovePrimaryMutation,
} from "@/utils/chain-utils";

import {
  Unlink,
  Info,
  Plus,
  CornerDownRight,
  Crown,
  SquareArrowUpRight,
  Trash2,
} from "lucide-react";

import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "@/components/ui/context-menu";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter as AlertFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

import { useNavigate } from "react-router-dom";

/* ------------------------------------------------------ */
/* PRIMARY ROW                                             */
/* ------------------------------------------------------ */

interface PrimaryRowProps {
  ledgerId: string;
  ledgerName: string;
  columnName: string;
  busy: boolean;
  mobileAction: "open" | "remove" | null;
  requestDeleteChain: () => void;
}

function PrimaryRow({
  ledgerId,
  ledgerName,
  columnName,
  busy,
  mobileAction,
  requestDeleteChain,
}: PrimaryRowProps) {
  const navigate = useNavigate();

  const openLedger = () => {
    navigate(`/ledgers/${ledgerId}`);
  };

  function handleMobileTap() {
    if (!mobileAction || mobileAction === "open") {
      return openLedger();
    }
    if (mobileAction === "remove") {
      requestDeleteChain();
      return;
    }
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          className="
            group
            relative flex items-center justify-between 
            text-sm mt-3 py-1 px-3 rounded-md 
            transition-colors
            hover:bg-gray-100 cursor-pointer
          "
          onClick={handleMobileTap}
        >
          <div className="flex items-center gap-2 text-lg">
            <Crown size={18} className="text-primary" />
            <span className="font-semibold">{ledgerName}</span>
            <span className="text-gray-400">&gt;</span>
            <span>{columnName}</span>
          </div>

          {/* DESKTOP ICONS */}
          <div className="hidden md:flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
            <button
              tabIndex={-1}
              onClick={(e) => {
                e.stopPropagation();
                openLedger();
              }}
              className="
                opacity-0 translate-x-1
                group-hover:opacity-100 group-hover:translate-x-0
                transition-all duration-150
                text-gray-500 hover:text-gray-700
              "
            >
              <SquareArrowUpRight size={14} />
            </button>

            <button
              tabIndex={-1}
              disabled={busy}
              onClick={(e) => {
                e.stopPropagation();
                requestDeleteChain();
              }}
              className="
                opacity-0 translate-x-1
                group-hover:opacity-100 group-hover:translate-x-0
                transition-all duration-150
                text-red-600 hover:text-red-700
                text-xs flex items-center gap-1
              "
            >
              <Trash2 size={12} /> Delete Chain
            </button>
          </div>
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent className="w-44">
        <ContextMenuItem onClick={openLedger}>Open</ContextMenuItem>
        <ContextMenuItem
          onClick={() =>
            window.open(`/ledgers/${ledgerId}`, "_blank", "noopener")
          }
        >
          Open in New Tab
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

/* ------------------------------------------------------ */
/* SECONDARY ROW                                           */
/* ------------------------------------------------------ */

interface RouteRowProps {
  secId: string;
  h: LedgerHeader;
  column: LedgerHeader;
  ledgerNames: Record<string, string>;
  busy: boolean;
  columnId: string | null;
  mobileAction: "open" | "remove" | null;
  requestRemoveSecondary: (secId: string) => void;
}

function RouteRow({
  secId,
  h,
  column,
  ledgerNames,
  busy,
  columnId,
  mobileAction,
  requestRemoveSecondary,
}: RouteRowProps) {
  const navigate = useNavigate();
  const openLedger = () => navigate(`/ledgers/${h.ledger_id}`);

  function handleMobileTap() {
    if (!mobileAction || mobileAction === "open") return openLedger();
    if (mobileAction === "remove") return requestRemoveSecondary(secId);
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          className="
            group
            relative flex items-center justify-between 
            text-sm py-1 px-3 rounded-md 
            transition-colors
            hover:bg-gray-100 cursor-pointer
          "
          onClick={handleMobileTap}
        >
          <div className="flex items-center gap-2">
            <CornerDownRight size={14} className="text-primary" />
            <span className="font-medium">
              {ledgerNames[h.ledger_id] ?? "Ledger"}
            </span>
            <span className="text-gray-400">&gt;</span>
            <span>
              {h.name}
              {secId === columnId && " (this column)"}
            </span>
          </div>

          {/* DESKTOP ICONS */}
          <div className="hidden md:flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
            <button
              tabIndex={-1}
              onClick={(e) => {
                e.stopPropagation();
                openLedger();
              }}
              className="
                opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0
                transition-all duration-150 text-gray-500 hover:text-gray-700
              "
            >
              <SquareArrowUpRight size={14} />
            </button>

            <button
              tabIndex={-1}
              onClick={(e) => {
                e.stopPropagation();
                requestRemoveSecondary(secId);
              }}
              disabled={busy}
              className="
                opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0
                transition-all duration-150 text-red-600 hover:text-red-700
                text-xs flex items-center gap-1
              "
            >
              <Unlink size={12} /> Remove
            </button>
          </div>
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent className="w-40">
        <ContextMenuItem onClick={openLedger}>Open</ContextMenuItem>
        <ContextMenuItem
          onClick={() =>
            window.open(`/ledgers/${h.ledger_id}`, "_blank", "noopener")
          }
        >
          Open in New Tab
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

/* ------------------------------------------------------ */
/* MAIN COMPONENT                                          */
/* ------------------------------------------------------ */

interface RouteInfoProps {
  open: boolean;
  onClose: () => void;
  column: LedgerHeader | null;
  ledgerNames: Record<string, string>;
  allHeaders: LedgerHeader[];
  allRoutes: LedgerRouteRecord[];
  reloadHeaders: () => void | Promise<void>;
  reloadRoutes: () => void | Promise<void>;
  onUpdated?: () => void;
}

type ConfirmType = "removeSecondary" | "deleteChain" | null;

export default function RouteInfo({
  open,
  onClose,
  column,
  ledgerNames,
  allHeaders,
  allRoutes,
  reloadHeaders,
  reloadRoutes,
  onUpdated,
}: RouteInfoProps) {
  const [busy, setBusy] = useState(false);
  const [mobileAction, setMobileAction] =
    useState<"open" | "remove" | null>(null);

  const [confirmType, setConfirmType] = useState<ConfirmType>(null);
  const [targetSecondaryId, setTargetSecondaryId] = useState<string | null>(
    null
  );

  const columnId = column?.id ?? null;

  /* ---------------- Build chain info ---------------- */

  const chainMap = useMemo(
    () => buildChainMap(allHeaders, allRoutes),
    [allHeaders, allRoutes]
  );

  const columnInfoMap = useMemo(
    () => buildColumnRouteInfo(allHeaders, chainMap),
    [allHeaders, chainMap]
  );

  const info = columnId ? columnInfoMap.get(columnId) ?? null : null;

  /* ---------------- Enhanced Header ---------------- */
  const renderHeader = (
    <DialogHeader
      className="
        pb-3 mb-2 
        border-b 
        border-gray-200 
        flex items-center justify-between
      " // 🔥 CHANGED — adds visual separation
    >
      <DialogTitle
        className="
          text-base font-semibold flex items-center gap-2
        "
      >
        Route Information
        <Tooltip>
          <TooltipTrigger asChild>
            <Info
              size={14}
              className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
            />
          </TooltipTrigger>

          <TooltipContent
            side="right"
            className="max-w-xs text-sm space-y-2"
          >
            <p>Routes link columns between ledgers.</p>
            <p>Primary columns push values to secondaries.</p>
          </TooltipContent>
        </Tooltip>
      </DialogTitle>
    </DialogHeader>
  );

  if (!column || !info) {
    return (
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="max-w-md">
          {renderHeader}

          <div className="text-sm text-muted-foreground pb-4">
            No route information available.
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const isPrimary = info.routeClass === "primary";
  const effectivePrimaryId =
    isPrimary ? info.columnId : info.chainPrimaryId;

  const chain = effectivePrimaryId ? chainMap[effectivePrimaryId] : undefined;
  const secondaryIds = chain?.secondaryIds ?? [];

  const chainRoutes = effectivePrimaryId
    ? allRoutes.filter(
        (r) => r.active && r.source_column_id === effectivePrimaryId
      )
    : [];

  const hasChain = chainRoutes.length > 0;

  /* ------------------------------------------------ */
  /* Route mutation handlers                          */
  /* ------------------------------------------------ */

  async function applyRouteMutation(mutation: {
    headersToUpdate: Partial<LedgerHeader>[];
    routesToInsert: Partial<LedgerRouteRecord>[];
    routesToDeleteIds: string[];
  }): Promise<void> {
    setBusy(true);
    try {
      const { headersToUpdate, routesToInsert, routesToDeleteIds } = mutation;

      if (headersToUpdate.length > 0) {
        const grouped: Record<string, string[]> = {};
        for (const h of headersToUpdate) {
          if (!h.id || !h.route_class) continue;
          if (!grouped[h.route_class]) grouped[h.route_class] = [];
          grouped[h.route_class].push(h.id);
        }

        for (const [cls, ids] of Object.entries(grouped)) {
          const { error } = await supabase
            .from("ledger_headers")
            .update({ route_class: cls as RouteClass })
            .in("id", ids);

          if (error) throw error;
        }
      }

      if (routesToInsert.length > 0) {
        const payload = routesToInsert.map((r) => ({
          source_ledger_id: r.source_ledger_id!,
          source_column_id: r.source_column_id!,
          target_ledger_id: r.target_ledger_id!,
          target_column_id: r.target_column_id!,
          active: r.active ?? true,
        }));

        const { error } = await supabase
          .from("ledger_routes")
          .insert(payload);

        if (error) throw error;
      }

      if (routesToDeleteIds.length > 0) {
        const { error } = await supabase
          .from("ledger_routes")
          .delete()
          .in("id", routesToDeleteIds);

        if (error) throw error;
      }

      await reloadHeaders();
      await reloadRoutes();
      onUpdated?.();
      toast.success("Route updated.");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Route update failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRemoveSecondary(secId: string) {
    if (!effectivePrimaryId) return;

    const { validation, mutation } = buildRemoveSecondaryMutation(
      allHeaders,
      chainRoutes,
      secId
    );

    if (!validation.ok) {
      toast.error(validation.reason);
      return;
    }

    await applyRouteMutation(mutation);
  }

  async function handleRemoveEntireChain() {
    if (!columnId || !isPrimary) return;

    const { validation, mutation } = buildRemovePrimaryMutation(
      allHeaders,
      chainRoutes,
      columnId
    );

    if (!validation.ok) {
      toast.error(validation.reason);
      return;
    }

    await applyRouteMutation(mutation);
  }

  function requestRemoveSecondary(secId: string) {
    setTargetSecondaryId(secId);
    setConfirmType("removeSecondary");
  }

  function requestDeleteChain() {
    setTargetSecondaryId(null);
    setConfirmType("deleteChain");
  }

  function closeConfirm() {
    setConfirmType(null);
    setTargetSecondaryId(null);
  }

  async function handleConfirmAction() {
    if (confirmType === "removeSecondary" && targetSecondaryId) {
      await handleRemoveSecondary(targetSecondaryId);
    } else if (confirmType === "deleteChain") {
      await handleRemoveEntireChain();
    }
    closeConfirm();
  }

  /* ---------------- Primary values ---------------- */

  const primaryHeader =
    effectivePrimaryId &&
    allHeaders.find((h) => h.id === effectivePrimaryId);

  const primaryLedgerId = primaryHeader
    ? primaryHeader.ledger_id
    : column.ledger_id;

  const primaryLedgerName = primaryHeader
    ? ledgerNames[primaryHeader.ledger_id]
    : ledgerNames[column.ledger_id];

  const primaryColumnName = primaryHeader ? primaryHeader.name : column.name;

  /* ------------------------------------------------ */
  /* RENDER DIALOG                                    */
  /* ------------------------------------------------ */

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        {renderHeader}

        <PrimaryRow
          ledgerId={primaryLedgerId}
          ledgerName={primaryLedgerName}
          columnName={primaryColumnName}
          busy={busy}
          mobileAction={mobileAction}
          requestDeleteChain={requestDeleteChain}
        />

        {!hasChain && (
          <div className="text-sm text-muted-foreground mt-2">
            No active route connections.
          </div>
        )}

        {hasChain && (
          <div
            className="
              border-l border-primary/40 pl-4
              max-h-48 overflow-y-auto
              ml-5
              space-y-3
            "
          >
            {secondaryIds.map((secId) => {
              const h = allHeaders.find((x) => x.id === secId);
              if (!h) return null;

              return (
                <RouteRow
                  key={secId}
                  secId={secId}
                  h={h}
                  column={column}
                  ledgerNames={ledgerNames}
                  busy={busy}
                  columnId={columnId}
                  mobileAction={mobileAction}
                  requestRemoveSecondary={requestRemoveSecondary}
                />
              );
            })}

            <button
              className="hidden md:inline-flex group p-1.5 rounded-full transition-colors hover:bg-primary/10"
              onClick={() => toast.info("Trigger RouteConnect from here")}
            >
              <Plus
                size={20}
                className="text-gray-600 transition-colors group-hover:text-primary"
              />
            </button>
          </div>
        )}

        {/* MOBILE HINT */}
        {hasChain && (
          <div className="md:hidden mt-4 text-center text-sm text-gray-600 font-medium relative h-6">
            <span
              className={`
                absolute inset-0 flex items-center justify-center gap-1
                transition-opacity duration-200
                ${mobileAction === "open" ? "opacity-100" : "opacity-0 pointer-events-none"}
              `}
            >
              Tap
              <Crown size={16} className="text-secondary" />
              or
              <CornerDownRight size={16} className="text-secondary" />
              to go to it.
            </span>

            <span
              className={`
                absolute inset-0 flex items-center justify-center gap-1
                transition-opacity duration-200
                ${mobileAction === "remove" ? "opacity-100" : "opacity-0 pointer-events-none"}
              `}
            >
              Tap
              <Crown size={16} className="text-destructive" />
              or
              <CornerDownRight size={16} className="text-destructive" />
              to remove it.
            </span>
          </div>
        )}

        {/* MOBILE ACTION DOCK */}
        {hasChain && (
          <div className="md:hidden flex items-center justify-around py-3 mt-2 bg-gray-50 rounded-lg shadow-inner">

            {/* Add Secondary */}
            <button
              onClick={() => toast.info("Trigger RouteConnect from here")}
              className="p-3 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
            >
              <Plus size={24} className="text-gray-700" />
            </button>

            {/* Open Mode */}
            <button
              onClick={() =>
                setMobileAction(mobileAction === "open" ? null : "open")
              }
              className={`
                p-3 rounded-full transition-colors
                ${mobileAction === "open" ? "bg-secondary/20" : "bg-gray-200"}
              `}
            >
              <SquareArrowUpRight size={24} className="text-secondary" />
            </button>

            {/* Remove Mode */}
            <button
              onClick={() =>
                setMobileAction(mobileAction === "remove" ? null : "remove")
              }
              className={`
                p-3 rounded-full transition-colors
                ${mobileAction === "remove" ? "bg-red-200" : "bg-gray-200"}
              `}
            >
              <Unlink size={24} className="text-red-600" />
            </button>

            {/* 🔥 REMOVED: Delete chain button on mobile */}
          </div>
        )}

        <DialogFooter className="hidden md:flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={busy}
          >
            Close
          </Button>
        </DialogFooter>

        {/* SHARED ALERT DIALOG */}
        <AlertDialog
          open={confirmType !== null}
          onOpenChange={(open) => {
            if (!open) closeConfirm();
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {confirmType === "removeSecondary"
                  ? "Remove secondary column?"
                  : "Delete entire route chain?"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {confirmType === "removeSecondary"
                  ? "This will unlink this secondary column."
                  : "This will remove the entire route chain."}
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertFooter>
              <AlertDialogCancel onClick={closeConfirm}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmAction}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {confirmType === "removeSecondary" ? "Remove" : "Delete Chain"}
              </AlertDialogAction>
            </AlertFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
}
