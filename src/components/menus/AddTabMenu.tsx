// src/components/menus/AddTabMenu.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Plus,
  FolderPlus,
  X,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PackageLedger {
  packageName: string;
  ledgers: { id: string; name: string }[];
}

interface AddTabMenuProps {
  existingLedgers: { id: string; name: string }[];
  packageLedgers: PackageLedger[];

  onCreateLedger: () => void;
  onSelectLedger: (ledgerId: string) => void;

  open?: boolean;
  setOpen?: (v: boolean) => void;
}

export default function AddTabMenu({
  existingLedgers,
  packageLedgers,
  onCreateLedger,
  onSelectLedger,
  open,
  setOpen,
}: AddTabMenuProps) {
  const [showDialog, setShowDialog] = useState(false);
  const ICON_SIZE = 18;

  /* ---------------------------------------------------------------------- */
  /* ORB ACTIONS                                                            */
  /* ---------------------------------------------------------------------- */
  const ROOT_ACTIONS = [
    {
      icon: <Plus size={ICON_SIZE} />,
      label: "Create New Ledger",
      action: () => {
        onCreateLedger();
        setOpen?.(false);
      },
    },
    {
      icon: <FolderPlus size={ICON_SIZE} />,
      label: "Add Existing Ledger",
      action: () => {
        // Now opens dialog instead of submenu
        setShowDialog(true);
        setOpen?.(false);
      },
    },
  ];

  /* ---------------------------------------------------------------------- */
  /* ANIMATION RENDERER                                                     */
  /* ---------------------------------------------------------------------- */
  const renderLinear = (items: any[], spacing = 42) => (
    <AnimatePresence>
      {items.map((item, i) => (
        <motion.div
          key={item.label}
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
            title={item.label}
            onClick={item.action}
            className="
              group h-7 w-7 flex items-center justify-center 
              rounded-full shadow-md bg-white hover:bg-[hsl(var(--accent))/0.15]
              transition-all duration-200
            "
          >
            <div className="text-[hsl(var(--gray-700))] group-hover:text-[hsl(var(--accent))] transition-colors">
              {item.icon}
            </div>
          </button>
        </motion.div>
      ))}
    </AnimatePresence>
  );

  /* ---------------------------------------------------------------------- */
  /* DIALOG UI                                                              */
  /* ---------------------------------------------------------------------- */
  const renderDialog = () => (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Existing Ledger</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">

          {/* EXISTING LEDGERS */}
          <div>
            <h3 className="text-sm font-medium mb-2 text-[hsl(var(--gray-700))]">
              Your Ledgers
            </h3>

            <div className="space-y-1">
              {existingLedgers.map((l) => (
                <Button
                  key={l.id}
                  variant="ghost"
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    onSelectLedger(l.id);
                    setShowDialog(false);
                  }}
                >
                  <FolderPlus size={16} />
                  {l.name}
                </Button>
              ))}
            </div>
          </div>

          {/* PACKAGES */}
          {packageLedgers.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2 text-[hsl(var(--gray-700))]">
                Packages
              </h3>

              <div className="space-y-3">
                {packageLedgers.map((pkg) => (
                  <div key={pkg.packageName}>
                    <div className="text-xs mb-1 text-[hsl(var(--gray-500))] uppercase tracking-wide">
                      {pkg.packageName}
                    </div>

                    <div className="space-y-1">
                      {pkg.ledgers.map((l) => (
                        <Button
                          key={l.id}
                          variant="ghost"
                          className="w-full justify-start gap-2"
                          onClick={() => {
                            onSelectLedger(l.id);
                            setShowDialog(false);
                          }}
                        >
                          <FolderPlus size={16} />
                          {l.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );

  /* ---------------------------------------------------------------------- */
  /* COMPONENT                                                              */
  /* ---------------------------------------------------------------------- */

  return (
    <>
      {/* ORB + EXPANSION */}
      <div className="relative flex items-center justify-center w-9 h-9 overflow-visible z-[9999]">

        {/* ORB BUTTON */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen?.(!open)}
          className={`
            h-8 w-8 p-0 rounded-full transition-all duration-300 relative
            ${
              open
                ? "bg-[hsl(var(--accent))/0.2] ring-2 ring-[hsl(var(--accent))/0.5]"
                : "bg-card hover:bg-[hsl(var(--accent))/0.1]"
            }
          `}
        >
          <motion.div
            key={open ? "x" : "plus"}
            animate={{ rotate: open ? 90 : 0, opacity: 1 }}
            initial={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="flex items-center justify-center"
          >
            {open ? (
              <X size={20} className="text-[hsl(var(--accent))]" />
            ) : (
              <Plus size={20} className="text-[hsl(var(--accent))]" />
            )}
          </motion.div>
        </Button>

        {/* RADIAL MENU */}
        {open && renderLinear(ROOT_ACTIONS)}
      </div>

      {/* DIALOG */}
      {renderDialog()}
    </>
  );
}
