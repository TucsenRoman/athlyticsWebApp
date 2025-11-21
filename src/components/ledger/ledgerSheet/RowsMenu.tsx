// src/components/ledger/RowsMenu.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Rows3,
  Plus,
  Trash2,
  Copy,
  Pin,
  SquareMousePointer,
  CircleX,
  CopyPlus,
  Delete,
  CircleChevronLeft,
} from "lucide-react";

interface RowsMenuProps {
  ledgerId: string;
  onAddRow: () => void;
  onBulkAddRows: (count: number) => void;
  onBulkMode: () => void;
  onSelectAll?: () => void;
  onDeleteSelected?: () => void;
  onDeleteLastRow?: () => void;
  onExitBulk?: () => void;
  bulkModeActive?: boolean;
  allSelected?: boolean;
  open?: boolean;
  setOpen?: (val: boolean) => void;
}

export default function RowsMenu({
  ledgerId,
  onAddRow,
  onBulkAddRows,
  onBulkMode,
  onSelectAll,
  onDeleteSelected,
  onDeleteLastRow,
  onExitBulk,
  bulkModeActive,
  allSelected,
  open,
  setOpen,
}: RowsMenuProps) {
  const [submenu, setSubmenu] = useState<"bulk" | null>(null);
  const [bulkCount, setBulkCount] = useState(1);
  const ICON_SIZE = 18;

  /* -------------------- MENU TREE -------------------- */
  const MENU_TREE = {
    Select: [
      {
        icon: <Pin size={ICON_SIZE} />,
        label: "Pin (coming soon)",
        action: () => {},
      },
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
        icon: <CircleChevronLeft size={ICON_SIZE} />,
        label: "Exit Select Mode",
        action: () => {
          onExitBulk?.();
          setSubmenu(null);
        },
      },
    ],
  };

  const ROOT_ACTIONS = [
    {
      icon: <CopyPlus size={ICON_SIZE} />,
      label: "Add Rows in Bulk",
      action: () => setSubmenu("bulk"),
    },
    {
      icon: (
        <Delete
          className="text-[#e63946] transition-colors group-hover:text-[#6e6e6e]"
          size={ICON_SIZE}
        />
      ),
      label: "Delete Last Row",
      action: onDeleteLastRow,
      destructive: true,
    },
    {
      icon: <SquareMousePointer size={ICON_SIZE} />,
      label: "Select Mode",
      action: onBulkMode,
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
          animate={{
            opacity: 1,
            x: (i + 1) * spacing,
            y: 0,
            scale: 1,
          }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ duration: 0.25, delay: i * 0.05 }}
          className="absolute left-2 bottom-1 pointer-events-auto z-[10000]"
        >
          <button
            title={a.label}
            onClick={() => {
              a.action?.();
              if (a.label === "Exit Menu") {
                setSubmenu(null);
                setOpen?.(false);
                setBulkCount(1);
              } else if (a.label.includes("Exit")) {
                setSubmenu(null);
              }
            }}
            className={`group h-7 w-7 flex items-center justify-center rounded-full shadow-md transition-all duration-200
              ${
                a.destructive
                  ? "bg-white hover:bg-[#f39ca3]"
                  : "bg-white hover:bg-transparent"
              }`}
          >
            <div
              className={`transition-colors duration-200 ${
                a.destructive
                  ? "text-[#e63946] group-hover:text-[#6e6e6e]"
                  : "text-inherit group-hover:text-[hsl(var(--primary))]"
              }`}
            >
              {a.icon}
            </div>
          </button>
        </motion.div>
      ))}
    </AnimatePresence>
  );

  /* -------------------- BULK ADD UI -------------------- */
  const renderBulkInput = () => (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 0 }}
        animate={{ opacity: 1, x: 42 }}
        exit={{ opacity: 0, x: 0 }}
        transition={{ duration: 0.25 }}
        className="absolute left-2 bottom-1 flex items-center gap-2 z-[10001]"
      >
        <input
          type="number"
          min={1}
          value={bulkCount}
          onChange={(e) =>
            setBulkCount(Math.max(1, parseInt(e.target.value) || 1))
          }
          className="w-14 text-sm text-center rounded-md border border-gray-300 px-1 py-[2px] bg-white shadow-sm focus:ring-1 focus:ring-[hsl(var(--primary))] focus:outline-none"
        />
        <Button
          size="icon"
          variant="ghost"
          onClick={() => {
            setSubmenu(null);
            setOpen?.(false);
            setBulkCount(1);
          }}
          className="h-7 w-7 p-0 rounded-full bg-white hover:bg-[hsl(var(--primary))/0.15)]"
        >
          <CircleX className="text-gray-500" size={16} />
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

          if (submenu === "bulk") {
            // ✅ confirm bulk add
            onBulkAddRows?.(bulkCount);
            setSubmenu(null);
            setOpen?.(false);
            setBulkCount(1);
            return;
          }

          if (open) {
            // ✅ single add
            onAddRow?.();
            setOpen?.(false);
            return;
          }

          setOpen?.(true);
        }}
        className={`h-8 w-8 p-0 rounded-full transition-all duration-300 relative ${
          open || submenu === "bulk"
            ? "bg-[hsl(var(--primary))/0.25] ring-2 ring-[hsl(var(--primary))/0.6]"
            : bulkModeActive
            ? "bg-[hsl(var(--primary))/0.15] ring-2 ring-[hsl(var(--primary))/0.5]"
            : "bg-card hover:bg-[hsl(var(--primary))/0.1]"
        }`}
      >
        <motion.div
          key={
            bulkModeActive
              ? "checkbox"
              : submenu === "bulk"
              ? "copyplus"
              : open
              ? "plus"
              : "rows"
          }
          animate={{
            rotate: submenu === "bulk" ? 0 : open ? 90 : 0,
            opacity: 1,
          }}
          initial={{ rotate: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
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
          ) : submenu === "bulk" ? (
            <CopyPlus
              className="text-[hsl(var(--primary))] cursor-pointer hover:scale-110 transition-transform"
              size={20}
              aria-label="Confirm Bulk Add"
            />
          ) : open ? (
            <Plus
              className="text-[hsl(var(--primary))] transition-transform"
              size={20}
              aria-label="Add Single Row"
            />
          ) : (
            <Rows3
              className="text-[hsl(var(--primary))] transition-transform"
              size={20}
            />
          )}
        </motion.div>
      </Button>

      {/* ➡️ Expansions */}
      {bulkModeActive
        ? renderLinear(MENU_TREE["Select"], 42)
        : submenu === "bulk"
        ? renderBulkInput()
        : open && renderLinear(ROOT_ACTIONS, 42)}
    </div>
  );
}
