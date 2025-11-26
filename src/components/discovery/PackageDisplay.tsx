"use client";

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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

import PackageMenu from "./PackageMenu";

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
  name: string;
  description: string | null;
  icon: string | null;
  is_system_package: boolean;
}

export interface PackageInstallInstance {
  id: string;
  program_id: number;
  package_id: string;
  name: string | null;
  tags: string[] | null;
}

export interface InstallRecord {
  template_id: string;
  installed_ledger_id: string;
  install_instance_id: string | null;
}

export interface AnyLedger {
  id: string;
  coach_id: string | null;
  program_id: number;
  name: string | null;
  description?: string | null;
  icon: string | null;
  status: string | null;
}

interface PackageDisplayProps {
  selectedProgramId: number | null;
  ledgers: AnyLedger[];
}

/* -------------------------------------------------------------------------- */
/* COMPONENT                                                                  */
/* -------------------------------------------------------------------------- */

export default function PackageDisplay({
  selectedProgramId,
  ledgers,
}: PackageDisplayProps) {
  const navigate = useNavigate();

  const [packages, setPackages] = useState<PackageRecord[]>([]);
  const [instances, setInstances] = useState<PackageInstallInstance[]>([]);
  const [installs, setInstalls] = useState<InstallRecord[]>([]);
  const [open, setOpen] = useState<Record<string, boolean>>({});

  /* ---------------------------------------------------------------------- */
  /* LOAD SUPABASE                                                          */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    supabase
      .from("ledger_packages")
      .select("id, name, description, icon, is_system_package")
      .order("sort_index", { ascending: true })
      .then(({ data }) => setPackages(data || []));
  }, []);

  useEffect(() => {
    if (!selectedProgramId) return setInstances([]);
    supabase
      .from("package_install_instances")
      .select("id, program_id, package_id, name, tags")
      .eq("program_id", selectedProgramId)
      .then(({ data }) => setInstances(data || []));
  }, [selectedProgramId]);

  useEffect(() => {
    if (!selectedProgramId) return setInstalls([]);
    supabase
      .from("ledger_package_installs")
      .select("template_id, installed_ledger_id, install_instance_id")
      .eq("program_id", selectedProgramId)
      .then(({ data }) => setInstalls(data || []));
  }, [selectedProgramId]);

  /* ---------------------------------------------------------------------- */
  /* BUILD PACKAGE GROUPS                                                   */
  /* ---------------------------------------------------------------------- */

  const packageGroups = useMemo(() => {
    const ledgerById = new Map(ledgers.map((l) => [l.id, l]));

    return packages
      .map((pkg) => {
        const pkgInstances = instances.filter((i) => i.package_id === pkg.id);

        const tagSet = new Set<string>();
        pkgInstances.forEach((i) => (i.tags || []).forEach((t) => tagSet.add(t)));

        const instanceIds = new Set(pkgInstances.map((i) => i.id));
        const seen = new Set<string>();
        const installedLedgers: AnyLedger[] = [];

        installs.forEach((row) => {
          if (!row.install_instance_id) return;
          if (!instanceIds.has(row.install_instance_id)) return;

          const ledger = ledgerById.get(row.installed_ledger_id);
          if (ledger && !seen.has(ledger.id)) {
            seen.add(ledger.id);
            installedLedgers.push(ledger);
          }
        });

        installedLedgers.sort((a, b) =>
          (a.name || "").localeCompare(b.name || "")
        );

        return { pkg, tags: Array.from(tagSet), installedLedgers };
      })
      .filter((g) => (selectedProgramId ? g.installedLedgers.length > 0 : true));
  }, [packages, instances, installs, ledgers, selectedProgramId]);

  /* ---------------------------------------------------------------------- */
  /* ACTION CALLBACKS (stubbed)                                             */
  /* ---------------------------------------------------------------------- */

  const onRename = (id: string) => console.log("Rename:", id);
  const onManageTags = (id: string) => console.log("Manage tags:", id);
  const onDuplicate = (id: string) => console.log("Duplicate:", id);
  const onDelete = (id: string) => console.log("Delete:", id);
  const onDismantle = (id: string) => console.log("Dismantle:", id);
  const onEditLedgers = (id: string) => console.log("Edit ledgers:", id);

  /* ---------------------------------------------------------------------- */
  /* RENDER                                                                  */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="space-y-1">

      {packageGroups.map(({ pkg, tags, installedLedgers }) => {
        const isOpen = open[pkg.id] ?? true;

        return (
          <div
            key={pkg.id}
            className="w-full border-b border-[hsl(var(--gray-300))]"
          >
            {/* PACKAGE HEADER */}
            <div
              className="
                px-3 py-2 flex items-center justify-between
                text-[hsl(var(--gray-600))] hover:text-[hsl(var(--gray-900))]
                transition-colors
              "
            >
              <button
                type="button"
                className="flex items-center gap-2 flex-1 text-left"
                onClick={() =>
                  setOpen((prev) => ({ ...prev, [pkg.id]: !isOpen }))
                }
              >
                <motion.div
                  animate={{ rotate: isOpen ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight className="w-4 h-4 text-[hsl(var(--gray-500))]" />
                </motion.div>

                <span className="truncate text-xs font-semibold uppercase tracking-wide text-[hsl(var(--gray-900))]">
                  {pkg.name}
                </span>
              </button>

              <div className="flex items-center gap-2">
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="
                          px-2 py-[2px] rounded-full text-[10px] font-medium
                          bg-[hsl(var(--gray-200))] text-[hsl(var(--gray-700))]
                        "
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <PackageMenu
                  instanceId={pkg.id}
                  onRename={onRename}
                  onManageTags={onManageTags}
                  onDuplicate={onDuplicate}
                  onDelete={onDelete}
                  onDismantle={onDismantle}
                  onEditLedgers={onEditLedgers}
                />
              </div>
            </div>

            {/* LEDGERS */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <div
                  className="
                    relative space-y-1 pl-9 pr-2 py-2
                    before:absolute before:left-[19px]
                    before:top-0 before:bottom-[10px]
                    before:w-[2px] before:bg-[hsl(var(--gray-300))]
                  "
                >
                  {selectedProgramId &&
                    installedLedgers.map((ledger) => {
                      const Icon = getIcon(ledger.icon);

                      return (
                        <button
                          key={ledger.id}
                          onClick={() => navigate(`/ledgers/${ledger.id}`)}
                          className="
                            w-full flex items-center justify-between
                            px-3 py-2 rounded-lg transition
                            hover:bg-[hsl(var(--gray-100))]
                          "
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="
                              p-2 rounded-md border bg-[hsl(var(--card))]
                              border-[hsl(var(--gray-300))]
                            ">
                              <Icon className="w-4 h-4 text-[hsl(var(--900))]" />
                            </div>

                            <div className="flex flex-col overflow-hidden">
                              <span className="text-sm font-medium truncate text-[hsl(var(--gray-900))]">
                                {ledger.name}
                              </span>
                              {ledger.description && (
                                <span className="text-xs text-[hsl(var(--gray-600))] truncate">
                                  {ledger.description}
                                </span>
                              )}
                            </div>
                          </div>

                          <span className="text-[10px] text-[hsl(var(--gray-600))]">
                            Open
                          </span>
                        </button>
                      );
                    })}
                </div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {selectedProgramId && packageGroups.length === 0 && (
        <p className="px-3 py-2 text-xs text-[hsl(var(--gray-600))]">
          No packages installed in this program yet.
        </p>
      )}
    </div>
  );
}
