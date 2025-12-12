// src/components/ledger/ColumnsMenu.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/actions/button";
import RouteConnect from "./RouteConnect";
import {
  Columns3,
  Plus,
  Trash2,
  Copy,
  Pin,
  SquareMousePointer,
  CircleX,
  Link,
  Delete,
  CircleChevronUp,
} from "lucide-react";

interface ColumnsMenuProps {
  ledgerId: string;
  onAddColumn: () => void;
  onBulkMode: () => void;
  onSelectAll?: () => void;
  onDeleteSelected?: () => void;
  onDeleteLastColumn?: () => void;
  onExitBulk?: () => void;
  onTogglePinMode?: () => void;
  bulkModeActive?: boolean;
  allSelected?: boolean;
  open?: boolean;
  setOpen?: (val: boolean) => void;
  reloadHeaders?: () => void;

  // 🔄 routing-related (used by LedgerSheet, kept optional)
  routes?: any[];
  reloadRoutes?: () => void;
}

export default function ColumnsMenu({
  ledgerId,
  onAddColumn,
  onBulkMode,
  onSelectAll,
  onDeleteSelected,
  onDeleteLastColumn,
  onExitBulk,
  onTogglePinMode,
  bulkModeActive,
  allSelected,
  open,
  setOpen,
  reloadHeaders,
  routes,        // currently unused, but accepted to satisfy parent
  reloadRoutes,  // used after route connection
}: ColumnsMenuProps) {
  const [submenu, setSubmenu] = useState<"routes" | null>(null);
  const [pinActive, setPinActive] = useState(false);
  const [returningToRoot, setReturningToRoot] = useState(false);
  const [routeDialogOpen, setRouteDialogOpen] = useState(false);
  const ICON_SIZE = 18;

  /* -------------------- MENU TREE -------------------- */
  const MENU_TREE = {
    Select: [
      {
        icon: <Copy size={ICON_SIZE} />,
        label: "Duplicate (coming soon)",
        action: () => {},
      },
      {
        icon: (
          <Trash2
            size={ICON_SIZE}
            className="text-[#e63946] transition-colors group-hover:text-[#6e6e6e]"
          />
        ),
        label: "Delete Selected",
        action: onDeleteSelected,
        destructive: true,
      },
      {
        icon: <CircleChevronUp size={ICON_SIZE} />,
        label: "Exit Select Mode",
        action: () => {
          onExitBulk?.();
          setReturningToRoot(true);
          setSubmenu(null);
          setTimeout(() => setReturningToRoot(false), 200);
        },
      },
    ],
  };

  const ROOT_ACTIONS = [
    {
      icon: (
        <Delete
          className="text-[#e63946] transition-colors group-hover:text-[#6e6e6e]"
          size={ICON_SIZE}
        />
      ),
      label: "Delete Last Column",
      destructive: true,
      action: () => {
        onDeleteLastColumn?.();
        setOpen?.(false);
      },
    },
    {
      icon: <Link size={ICON_SIZE} />,
      label: "Connect Route",
      action: () => {
        setRouteDialogOpen(true);
        setOpen?.(false);
      },
    },
    {
      icon: (
        <motion.div
          animate={{ rotate: pinActive ? 45 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
        >
          <Pin
            size={ICON_SIZE}
            style={{
              fill: pinActive ? "hsl(var(--primary))" : "none",
              color: pinActive ? "hsl(var(--primary))" : "currentColor",
              transition: "color 0.2s, fill 0.2s",
            }}
          />
        </motion.div>
      ),
      label: pinActive ? "Exit Pin Mode" : "Pin Columns",
      action: () => {
        setPinActive((prev) => !prev);
        onTogglePinMode?.();
      },
    },
    {
      icon: <CircleX size={ICON_SIZE} />,
      label: "Exit Menu",
      action: () => {
        setSubmenu(null);
        setOpen?.(false);
      },
    },
  ];

  /* -------------------- LINEAR EXPANSION -------------------- */
  const renderLinear = (items: any[], spacing = 42) => (
    <AnimatePresence>
      {items.map((a, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: 0, scale: 0 }}
          animate={{ opacity: 1, x: 0, y: (i + 1) * spacing, scale: 1 }}
          exit={
            returningToRoot
              ? { opacity: 1, scale: 1, x: 0, y: 0 }
              : { opacity: 0, scale: 0 }
          }
          transition={{
            duration: returningToRoot ? 0 : 0.25,
            delay: returningToRoot ? 0 : i * 0.05,
          }}
          className="absolute left-1 bottom-1 translate-x-[-100%] pointer-events-auto z-[10000]"
        >
          <button
            title={a.label}
            onClick={() => {
              a.action?.();
              if (a.label === "Exit Menu") {
                setSubmenu(null);
                setOpen?.(false);
              } else if (a.label.includes("Exit")) {
                setSubmenu(null);
              }
            }}
            className={`group h-7 w-7 flex items-center justify-center rounded-full shadow-md transition-all duration-200
              ${
                a.destructive
                  ? "bg-white hover:bg-[#f39ca3]"
                  : "bg-white hover:bg-white"
              }`}
          >
            <div
              className={`transition-colors duration-200 ${
                a.destructive
                  ? "text-[#e63946] group-hover:text-[#6e6e6e]"
                  : "text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--primary))]"
              }`}
            >
              {a.icon}
            </div>
          </button>
        </motion.div>
      ))}
    </AnimatePresence>
  );

  /* -------------------- ROUTES SHELL -------------------- */
  const renderRoutesShell = () => (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: 1, y: 42 }}
        exit={{ opacity: 0, y: 0 }}
        transition={{ duration: 0.25 }}
        className="absolute left-0 bottom-1 translate-x-[-100%] flex flex-col items-center gap-2 z-[10001]"
      >
        <Button
          size="icon"
          variant="ghost"
          onClick={() => {
            setSubmenu(null);
            setOpen?.(false);
          }}
          className="h-6 w-6 p-0 rounded-full bg-white hover:bg-[hsl(var(--primary))/0.1] shadow-sm"
        >
          <CircleX className="text-gray-500" size={14} />
        </Button>
      </motion.div>
    </AnimatePresence>
  );

  /* -------------------------- RENDER -------------------------- */
  return (
    <div
      className="relative flex items-center justify-center w-9 h-9 overflow-visible"
      style={{ zIndex: 9999 }}
    >
      {/* 🟠 Main Orb */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          if (bulkModeActive) {
            onSelectAll?.();
            return;
          }

          if (submenu === "routes") {
            setSubmenu(null);
            setOpen?.(false);
            return;
          }

          if (open) {
            onAddColumn?.();
            setOpen?.(false);
            return;
          }

          setOpen?.(true);
        }}
        className={`h-8 w-8 p-0 rounded-full transition-all duration-300 relative ${
          open || submenu === "routes"
            ? "bg-[hsl(var(--primary))/0.25] ring-2 ring-[hsl(var(--primary))/0.6]"
            : bulkModeActive
            ? "bg-[hsl(var(--primary))/0.15] ring-2 ring-[hsl(var(--primary))/0.5]"
            : "bg-card hover:bg-[hsl(var(--primary))/0.1]"
        }`}
      >
        <motion.div
          key={bulkModeActive ? "bulk" : open ? "plus" : "columns"}
          initial={{ rotate: 0, scale: 0.8, opacity: 0 }}
          animate={{ rotate: open ? 90 : 0, scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="flex items-center justify-center"
        >
          {bulkModeActive ? (
            <div
              onClick={(e) => {
                e.stopPropagation();
                onSelectAll?.();
              }}
              className={`h-[14px] w-[14px] rounded-[4px] border-[1.5px] cursor-pointer flex items-center justify-center
                ${
                  allSelected
                    ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]"
                    : "border-[hsl(var(--muted-foreground))] bg-transparent"
                }`}
            >
              {allSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.15 }}
                  className="h-[6px] w-[6px] bg-white rounded-[1px]"
                />
              )}
            </div>
          ) : open ? (
            <Plus
              className="text-[hsl(var(--primary))] transition-transform"
              size={20}
            />
          ) : (
            <Columns3
              className="text-[hsl(var(--primary))] transition-transform"
              size={20}
            />
          )}
        </motion.div>
      </Button>

      {/* Expansions */}
      {bulkModeActive
        ? renderLinear(MENU_TREE["Select"], 43)
        : submenu === "routes"
        ? renderRoutesShell()
        : open && renderLinear(ROOT_ACTIONS, 32)}

      {/* 🔗 Route Connect Dialog */}
      {/* <RouteConnect
        open={routeDialogOpen}
        onClose={() => setRouteDialogOpen(false)}
        onConnected={() => {
          // keep previous behavior
          reloadHeaders?.();
          // also refresh routes for route badges / sync
          reloadRoutes?.();
        }}
      /> */}
    </div>
  );
}
