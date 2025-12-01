"use client";

import { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  MoreHorizontal,
  Trash2,
  Route,
  Settings,
  X,
  Plus,
} from "lucide-react";

import AddTabMenu from "@/components/menus/AddTabMenu";
import { fetchPackageLedgers } from "@/utils/fetchPackageLedgers";

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

interface LedgerTab {
  id: string;
  name: string;
}

interface EditorFooterProps {
  openLedgers: LedgerTab[];
  activeLedgerId: string;
  setActiveLedgerId: (id: string) => void;

  onCreateLedger?: () => void;
  onManageRoutes?: () => void;
  onSettings?: () => void;
  onDelete?: (id: string) => void;

  programId: number; // needed for package-ledgers
}

/* -------------------------------------------------------------------------- */
/* COMPONENT                                                                  */
/* -------------------------------------------------------------------------- */

export default function EditorFooter({
  openLedgers,
  activeLedgerId,
  setActiveLedgerId,
  onCreateLedger,
  onManageRoutes,
  onSettings,
  onDelete,
  programId,
}: EditorFooterProps) {
  const activeLedger = openLedgers.find((l) => l.id === activeLedgerId);

  /* ---------------------------------------------------------------------- */
  /* STATE                                                                  */
  /* ---------------------------------------------------------------------- */

  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showOverflowMenu, setShowOverflowMenu] = useState(false);

  const [packageLedgers, setPackageLedgers] = useState<
    { packageName: string; packageId: string; ledgers: LedgerTab[] }[]
  >([]);

  const addRef = useRef<HTMLDivElement>(null);
  const overflowRef = useRef<HTMLDivElement>(null);

  /* ---------------------------------------------------------------------- */
  /* FETCH PACKAGE → LEDGERS                                                */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    async function loadPkgLedgers() {
      const data = await fetchPackageLedgers(programId);
      setPackageLedgers(data);
    }
    loadPkgLedgers();
  }, [programId]);

  /* ---------------------------------------------------------------------- */
  /* CLICK OUTSIDE TO CLOSE MENUS                                           */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        addRef.current &&
        !addRef.current.contains(e.target as Node) &&
        overflowRef.current &&
        !overflowRef.current.contains(e.target as Node)
      ) {
        setShowAddMenu(false);
        setShowOverflowMenu(false);
      }
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, []);

  /* ---------------------------------------------------------------------- */
  /* RENDER                                                                  */
  /* ---------------------------------------------------------------------- */

  return (
    <div
      className="
        h-14 
        border-t border-[hsl(var(--gray-200))]
        bg-[hsl(var(--background))]
        flex items-center justify-between
        px-3
        select-none
      "
    >
      {/* TABS + ADD BUTTON */}
      <div className="flex items-center gap-2 overflow-x-auto flex-1 pr-2">
        {openLedgers.map((ledger) => {
          const active = ledger.id === activeLedgerId;

          return (
            <div
              key={ledger.id}
              className={`
                flex items-center
                rounded-full cursor-pointer
                px-3 py-1.5
                whitespace-nowrap
                transition

                ${
                  active
                    ? "bg-[hsl(var(--accent)/0.2)] text-[hsl(var(--accent))] shadow-inner font-medium"
                    : "bg-[hsl(var(--gray-100))] text-[hsl(var(--gray-700))] hover:bg-[hsl(var(--gray-200))]"
                }
              `}
            >
              <button
                onClick={() => setActiveLedgerId(ledger.id)}
                className="flex items-center gap-2"
              >
                <span>{ledger.name}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition ${
                    active ? "opacity-80" : "opacity-40"
                  }`}
                />
              </button>

              {/* CLOSE TAB */}
              <button
                onClick={() => onDelete?.(ledger.id)}
                className="
                  ml-2 p-1 rounded-full
                  hover:bg-black/10
                  text-[hsl(var(--gray-600))]
                  hover:text-[hsl(var(--danger))]
                  transition
                "
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}

        {/* ADD TAB MENU (ORB) */}
        <div className="relative" ref={addRef}>
          <AddTabMenu
            existingLedgers={openLedgers}
            packageLedgers={packageLedgers}
            onCreateLedger={() => {
              setShowAddMenu(false);
              onCreateLedger?.();
            }}
            onSelectLedger={(id) => {
              setShowAddMenu(false);
              setActiveLedgerId(id);
            }}
            open={showAddMenu}
            setOpen={setShowAddMenu}
          />
        </div>
      </div>

      {/* OVERFLOW MENU */}
      <div className="relative" ref={overflowRef}>
        <button
          onClick={() => setShowOverflowMenu((v) => !v)}
          className="
            p-2 rounded-full
            bg-[hsl(var(--gray-100))]
            text-[hsl(var(--gray-600))]
            hover:bg-[hsl(var(--gray-200))]
            transition
          "
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>

        {showOverflowMenu && (
          <div
            className="
              absolute right-0 bottom-12
              w-48
              bg-[hsl(var(--white))]
              border border-[hsl(var(--gray-200))]
              rounded-xl shadow-xl
              py-1
              z-50
            "
          >
            {/* ACTIVE LEDGER LABEL */}
            {activeLedger && (
              <div
                className="
                  px-3 py-1.5 text-xs font-medium 
                  text-[hsl(var(--gray-500))]
                  border-b border-[hsl(var(--gray-200))]
                "
              >
                {activeLedger.name}
              </div>
            )}

            {/* ROUTES */}
            <button
              onClick={() => {
                setShowOverflowMenu(false);
                onManageRoutes?.();
              }}
              className="
                w-full flex items-center gap-2 px-3 py-2
                hover:bg-[hsl(var(--gray-100))]
                text-[hsl(var(--gray-700))]
              "
            >
              <Route className="w-4 h-4" />
              Manage Routes
            </button>

            {/* SETTINGS */}
            <button
              onClick={() => {
                setShowOverflowMenu(false);
                onSettings?.();
              }}
              className="
                w-full flex items-center gap-2 px-3 py-2
                hover:bg-[hsl(var(--gray-100))]
                text-[hsl(var(--gray-700))]
              "
            >
              <Settings className="w-4 h-4" />
              Ledger Settings
            </button>

            <div className="my-1 border-t border-[hsl(var(--gray-200))]" />

            {/* DELETE ACTIVE TAB */}
            <button
              onClick={() => {
                setShowOverflowMenu(false);
                onDelete?.(activeLedgerId);
              }}
              className="
                w-full flex items-center gap-2 px-3 py-2
                text-[hsl(var(--danger))]
                hover:bg-[hsl(var(--danger)/0.1)]
              "
            >
              <Trash2 className="w-4 h-4" />
              Close Active Ledger
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
