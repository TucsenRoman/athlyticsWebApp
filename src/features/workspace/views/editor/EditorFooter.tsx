"use client";

import { useState, useRef, useEffect } from "react";
import { X, Route, Settings, Trash2 } from "lucide-react";

import EditorFooterMenu from "@/components/ui/IGNORE/EditorFooterMenu";
import { fetchPackageLedgers } from "@/lib/fetchPackageLedgers";

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

interface EditorFooterProps {
  openLedgers: LedgerTab[];
  activeLedgerId: string;
  setActiveLedgerId: (id: string) => void;

  onCreateLedger?: () => void;
  onManageRoutes?: () => void;
  onSettings?: () => void;
  onDelete?: (id: string) => void;
  onCloseTab?: (id: string) => void;

  onSelectLedger?: (id: string) => void;
  programId: number;
}

/* CLICK OUTSIDE ----------------------------------------------------------- */

function useClickOutside(
  refs: React.RefObject<HTMLElement>[],
  handler: () => void
) {
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      const target = e.target as Node;
      const inside = refs.some((r) => r.current?.contains(target));
      if (!inside) handler();
    };

    window.addEventListener("mousedown", fn);
    return () => window.removeEventListener("mousedown", fn);
  }, [refs, handler]);
}

/* COMPONENT --------------------------------------------------------------- */

export default function EditorFooter({
  openLedgers,
  activeLedgerId,
  setActiveLedgerId,

  onCreateLedger,
  onManageRoutes,
  onSettings,
  onDelete,
  onCloseTab,
  onSelectLedger,

  programId,
}: EditorFooterProps) {
  const activeLedger = openLedgers.find((l) => l.id === activeLedgerId);

  const [addOpen, setAddOpen] = useState(false);
  const [showOverflow, setShowOverflow] = useState(false);

  const [packageLedgers, setPackageLedgers] = useState<PackageLedgerGroup[]>([]);

  const addRef = useRef<HTMLDivElement>(null);
  const overflowRef = useRef<HTMLDivElement>(null);

  /* LOAD PACKAGE → LEDGERS ------------------------------------------------ */
  useEffect(() => {
    async function load() {
      const data = await fetchPackageLedgers(programId);
      setPackageLedgers(data);
    }
    load();
  }, [programId]);

  /* CLICK OUTSIDE --------------------------------------------------------- */
  useClickOutside([addRef, overflowRef], () => {
    setAddOpen(false);
    setShowOverflow(false);
  });

  /* ----------------------------------------------------------------------- */
  /* RENDER                                                                  */
  /* ----------------------------------------------------------------------- */

  return (
    <div
      className="
        h-14 flex items-center justify-between
        px-3 border-t border-[var(--border)]
        bg-[var(--bg)]
        text-[var(--text-dark)]
        select-none
      "
    >
      {/* LEFT: OPEN TABS --------------------------------------------------- */}
      <div className="flex items-center gap-2 overflow-x-auto flex-1 pr-2">
        {openLedgers.map((ledger) => {
          const active = ledger.id === activeLedgerId;

          return (
            <button
              key={ledger.id}
              onClick={() => setActiveLedgerId(ledger.id)}
              className={`
                relative shrink-0 flex items-center gap-1
                pl-3 pr-2 py-1 h-6 rounded-full
                text-sm whitespace-nowrap transition

                ${
                  active
                    ? "bg-[var(--accent-bg)] text-[var(--text-accent)] shadow-md font-medium"
                    : "bg-[var(--gray-100)] text-[var(--text-dark)] hover:bg-[var(--gray-200)] shadow"
                }
              `}
            >
              <span className="-translate-y-[1px]">{ledger.name}</span>

              {/* CLOSE TAB */}
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab?.(ledger.id);
                }}
                className={`
                  p-1 rounded-full cursor-pointer transition
                  ${
                    active
                      ? "hover:bg-[var(--accent-bg)] text-[var(--text-accent)]"
                      : "hover:bg-[var(--gray-300)] text-[var(--text-dark)]"
                  }
                `}
              >
                <X className="w-3 h-3" />
              </span>
            </button>
          );
        })}

        {/* ADD TAB MENU ---------------------------------------------------- */}
        <div className="relative shrink-0" ref={addRef}>
          <EditorFooterMenu
            open={addOpen}
            setOpen={setAddOpen}
            existingLedgers={openLedgers}
            packageLedgers={packageLedgers}
            onCreateLedger={() => {
              setAddOpen(false);
              onCreateLedger?.();
            }}
            onSelectLedger={(id) => {
              setAddOpen(false);
              onSelectLedger?.(id);
              setActiveLedgerId(id);
            }}
          />
        </div>
      </div>

      {/* RIGHT: OVERFLOW MENU --------------------------------------------- */}
      <div className="relative" ref={overflowRef}>
        {showOverflow && (
          <div
            className="
              absolute right-0 bottom-12 z-50
              w-48 bg-[var(--bg)]
              border border-[var(--border)]
              rounded-xl shadow-xl py-1
              text-[var(--text-dark)]
            "
          >
            {activeLedger && (
              <div
                className="
                  px-3 py-1.5 text-xs font-medium
                  text-[var(--text)]
                  border-b border-[var(--border)]
                "
              >
                {activeLedger.name}
              </div>
            )}

            <button
              onClick={() => {
                setShowOverflow(false);
                onManageRoutes?.();
              }}
              className="
                w-full flex items-center gap-2 px-3 py-2
                text-[var(--text-dark)]
                hover:bg-[var(--gray-100)]
              "
            >
              <Route className="w-4 h-4" />
              Manage Routes
            </button>

            <button
              onClick={() => {
                setShowOverflow(false);
                onSettings?.();
              }}
              className="
                w-full flex items-center gap-2 px-3 py-2
                text-[var(--text-dark)]
                hover:bg-[var(--gray-100)]
              "
            >
              <Settings className="w-4 h-4" />
              Ledger Settings
            </button>

            <div className="my-1 border-t border-[var(--border)]" />

            <button
              onClick={() => {
                setShowOverflow(false);
                onDelete?.(activeLedgerId);
              }}
              className="
                w-full flex items-center gap-2 px-3 py-2
                text-[var(--danger)]
                hover:bg-[var(--danger-bg)]
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
