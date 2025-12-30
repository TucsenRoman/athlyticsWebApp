"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

import {
  ClipboardList,
  FileText,
  Users,
  Trophy,
  Activity,
  BarChart3,
  CalendarDays,
  Phone,
  Shirt,
  Lock,
  ChevronRight,
} from "lucide-react";

import PackageMenu from "./ProjectMenu";

/* -------------------------------------------------------------------------- */
/* ICON MAP                                                                   */
/* -------------------------------------------------------------------------- */

const ICON_MAP: Record<string, any> = {
  Users,
  ClipboardList,
  Trophy,
  Activity,
  BarChart3,
  Calendar: CalendarDays,
  Phone,
  Shirt,
  lock: Lock,
  Lock,
  file: FileText,
  FileText,
};

const getIcon = (raw: string | null | undefined) => {
  if (!raw) return FileText;
  const cleaned = raw.trim();
  return (
    ICON_MAP[cleaned] ||
    ICON_MAP[cleaned.toLowerCase()] ||
    ICON_MAP[cleaned.toUpperCase()] ||
    FileText
  );
};

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

export interface PackageRecord {
  id: string;
  program_id: number;
  name: string;
  description: string | null;
  icon: string | null;
}

interface PackageItemRow {
  id: string;
  package_id: string;
  ledger_id: string;
  order_index: number;
}

export interface AnyLedger {
  id: string;
  program_id: number;
  coach_id?: string | null;
  name: string | null;
  description?: string | null;
  icon?: string | null;
  status?: string | null;
}

interface ProjectSidebarProps {
  selectedProgramId: number | null;
  ledgers: AnyLedger[];
  openItem: (ledger: AnyLedger) => void;
}

interface PackageGroup {
  pkg: PackageRecord;
  ledgers: AnyLedger[];
}

/* -------------------------------------------------------------------------- */
/* COMPONENT                                                                  */
/* -------------------------------------------------------------------------- */

export default function ProjectSidebar({
  selectedProgramId,
  ledgers,
  openItem,
}: ProjectSidebarProps) {
  const [packages, setPackages] = useState<PackageRecord[]>([]);
  const [packageItems, setPackageItems] = useState<PackageItemRow[]>([]);
  const [open, setOpen] = useState<Record<string, boolean>>({});

  /* LOAD PACKAGES + ITEMS -------------------------------------------------- */

  useEffect(() => {
    if (!selectedProgramId) {
      setPackages([]);
      setPackageItems([]);
      return;
    }

    const load = async () => {
      const { data: pkgData, error: pkgError } = await supabase
        .from("packages")
        .select("id, program_id, name, description, icon")
        .eq("program_id", selectedProgramId)
        .order("created_at");

      if (pkgError) {
        console.error("Packages error:", pkgError);
        return;
      }

      const cast = (pkgData || []) as PackageRecord[];
      setPackages(cast);

      const pkgIds = cast.map((p) => p.id);
      if (!pkgIds.length) return;

      const { data: itemData, error: itemErr } = await supabase
        .from("package_items")
        .select("id, package_id, ledger_id, order_index")
        .in("package_id", pkgIds)
        .order("order_index");

      if (itemErr) {
        console.error("Package items error:", itemErr);
        return;
      }

      setPackageItems((itemData || []) as PackageItemRow[]);
    };

    load();
  }, [selectedProgramId]);

  /* BUILD GROUPS ----------------------------------------------------------- */

  const { packageGroups, looseLedgers } = useMemo(() => {
    const ledgerMap = new Map<string, AnyLedger>();
    ledgers.forEach((l) => l.id && ledgerMap.set(l.id, l));

    const used = new Set<string>();

    const groups: PackageGroup[] = packages.map((pkg) => {
      const rows = packageItems
        .filter((pi) => pi.package_id === pkg.id)
        .map((pi) => {
          const ledger = ledgerMap.get(pi.ledger_id);
          if (ledger) used.add(ledger.id);
          return ledger;
        })
        .filter(Boolean) as AnyLedger[];

      rows.sort((a, b) =>
        (a.name || "").localeCompare(b.name || "")
      );

      return { pkg, ledgers: rows };
    });

    const loose = ledgers
      .filter((l) => !used.has(l.id) && l.program_id === selectedProgramId)
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""));

    return { packageGroups: groups, looseLedgers: loose };
  }, [packages, packageItems, ledgers, selectedProgramId]);

  /* RENDER LEDGER ROW ------------------------------------------------------ */

  const renderLedgerRow = (ledger: AnyLedger) => {
    const Icon = getIcon(ledger.icon);
    return (
      <button
        key={ledger.id}
        onClick={() => openItem(ledger)}
        className="
          group
          flex items-center justify-between
          w-full px-3 py-2
          rounded-md
          hover:bg-[hsl(var(--gray-lt))]
          transition
        "
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div
            className="
              w-9 h-9 flex items-center justify-center
              rounded-md
              bg-[hsl(var(--surface-1))]
              border border-[hsl(var(--gray-200))]
            "
          >
            <Icon className="w-4 h-4 text-[hsl(var(--gray-800))]" />
          </div>

          <div className="flex flex-col overflow-hidden text-left">
            <span className="text-sm font-medium truncate text-[hsl(var(--gray-900))]">
              {ledger.name || "Untitled Ledger"}
            </span>

            {ledger.description && (
              <span className="text-xs text-[hsl(var(--gray-500))] truncate">
                {ledger.description}
              </span>
            )}
          </div>
        </div>
      </button>
    );
  };

  /* UI --------------------------------------------------------------------- */

  return (
    <div
      className="
        w-[260px]
        flex flex-col
        bg-[hsl(var(--background))]
        border-r border-[hsl(var(--gray-200))]
        pt-3 pb-6
        overflow-y-auto
      "
    >
      {/* PACKAGE SECTIONS */}
      {packageGroups.map(({ pkg, ledgers: pkgLedgers }) => {
        if (selectedProgramId && pkgLedgers.length === 0) return null;
        const isOpen = open[pkg.id] ?? true;
        const PkgIcon = getIcon(pkg.icon);

        return (
          <div key={pkg.id} className="px-3 mb-3">
            <button
              onClick={() =>
                setOpen((prev) => ({ ...prev, [pkg.id]: !isOpen }))
              }
              className="
                flex w-full items-center justify-between
                px-2 py-1.5
                rounded-md
                hover:bg-[hsl(var(--gray-lt))]
                transition
              "
            >
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: isOpen ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight className="w-4 h-4 text-[hsl(var(--gray-600))]" />
                </motion.div>

                <div className="flex items-center gap-2">
                  <div
                    className="
                      w-7 h-7 flex items-center justify-center
                      rounded-md
                      bg-[hsl(var(--surface-1))]
                      border border-[hsl(var(--gray-200))]
                    "
                  >
                    <PkgIcon className="w-3.5 h-3.5 text-[hsl(var(--gray-800))]" />
                  </div>

                  <span className="uppercase text-[10px] font-semibold tracking-wide text-[hsl(var(--gray-700))]">
                    {pkg.name}
                  </span>
                </div>
              </div>

              {/* <PackageMenu instanceId={pkg.id} /> */}
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="mt-1 ml-6 flex flex-col gap-1"
                >
                  {pkgLedgers.map((l) => renderLedgerRow(l))}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-3 border-t border-[hsl(var(--gray-200))]" />
          </div>
        );
      })}

      {/* OTHER LEDGERS */}
      <div className="px-3">
        <div className="uppercase text-[10px] font-semibold tracking-wide text-[hsl(var(--gray-700))] px-2 py-2">
          Other Ledgers
        </div>

        {looseLedgers.length === 0 ? (
          <div className="px-2 py-1 text-xs text-[hsl(var(--gray-500))]">
            None
          </div>
        ) : (
          looseLedgers.map((l) => renderLedgerRow(l))
        )}
      </div>
    </div>
  );
}
