"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  FilePlus2,
  FolderOpen,
  X
} from "lucide-react";

import OpenExistingProject from "@/components/workspace/editor/OpenExistingProject";

/* TYPES ------------------------------------------------------------------- */

interface LedgerTab {
  id: string;
  name: string;
}

interface PackageLedgerGroup {
  packageName: string;
  packageId: string;
  ledgers: LedgerTab[];
}

interface EditorFooterMenuProps {
  open: boolean;
  setOpen: (val: boolean) => void;

  existingLedgers: LedgerTab[];
  packageLedgers: PackageLedgerGroup[];

  onCreateLedger: () => void;
  onSelectLedger: (id: string) => void;
}

/* COMPONENT ---------------------------------------------------------------- */

const ICON_SIZE = 18;

export default function EditorFooterMenu({
  open,
  setOpen,
  existingLedgers,
  packageLedgers,
  onCreateLedger,
  onSelectLedger,
}: EditorFooterMenuProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const ACTIONS = [
    {
      icon: <FilePlus2 size={ICON_SIZE} />,
      label: "New Ledger",
      action: () => {
        onCreateLedger();
        setOpen(false);
      },
    },
    {
      icon: <FolderOpen size={ICON_SIZE} />,
      label: "Browse Ledgers",
      action: () => {
        setDialogOpen(true);
        setOpen(false);
      },
    },
  ];

  return (
    <>
      {/* MAIN ORB */}
      <div className="relative w-8 h-8 flex items-center justify-center overflow-visible">
        <button
          onClick={() => setOpen(!open)}
          className={`
            h-7 w-7 flex items-center justify-center rounded-full shadow
            transition-all duration-200
            ${
              open
                ? "bg-transparent hover:bg-[hsl(var(--accent))]/20 text-[hsl(var(--accent))]"
                : "bg-[hsl(var(--white))] hover:bg-[hsl(var(--gray-200))] text-[hsl(var(--gray-600))]"
            }
          `}
        >
          <motion.div
            key={open ? "x" : "menu"}
            initial={{ rotate: 0 }}
            animate={{ rotate: open ? 90 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="flex items-center justify-center"
          >
            {open ? (
              <X size={16} />
            ) : (
              <Menu size={16} />
            )}
          </motion.div>

        </button>


        {/* EXPANDED MENU ORBS */}
        <AnimatePresence>
          {open &&
            ACTIONS.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: 0, scale: 0 }}
                animate={{
                  opacity: 1,
                  x: (i + 1) * 42,
                  scale: 1,
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{
                  duration: 0.25,
                  delay: i * 0.05,
                }}
                className="absolute left-[2px] bottom-[2px] z-[9999]"
              >
                <button
                  onClick={() => item.action()}
                  title={item.label}
                  className="
                    h-7 w-7 rounded-full shadow-md flex items-center justify-center
                    bg-white hover:bg-[hsl(var(--gray-100))]
                    transition-all duration-200
                  "
                >
                  <div className="text-[hsl(var(--gray-700))]">
                    {item.icon}
                  </div>
                </button>
              </motion.div>
            ))}
        </AnimatePresence>
      </div>

      {/* LEDGER SELECT DIALOG */}
      <OpenExistingProject
        open={dialogOpen}
        setOpen={setDialogOpen}
        existingLedgers={existingLedgers}
        packageLedgers={packageLedgers}
        onSelectLedger={onSelectLedger}
      />
    </>
  );
}
