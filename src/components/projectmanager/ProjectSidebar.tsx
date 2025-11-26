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

interface ProjectSidebarProps {
  selectedProgramId: number | null;
  ledgers: AnyLedger[];
  // openItem drives WorkspacePage openTabs / activeTab
  openItem: (ledger: AnyLedger) => void;
}

/* -------------------------------------------------------------------------- */
/* GROUPED TYPES                                                              */
/* -------------------------------------------------------------------------- */

interface InstanceGroup {
  instance: PackageInstallInstance;
  ledgers: AnyLedger[];
}

interface PackageGroup {
  pkg: PackageRecord;
  tags: string[];
  instances: InstanceGroup[];
  totalLedgers: number;
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
  const [instances, setInstances] = useState<PackageInstallInstance[]>([]);
  const [installs, setInstalls] = useState<InstallRecord[]>([]);
  const [open, setOpen] = useState<Record<string, boolean>>({});

  /* ---------------------------------------------------------------------- */
  /* SUPABASE QUERIES                                                       */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    supabase
      .from("ledger_packages")
      .select("id, name, description, icon, is_system_package")
      .order("sort_index", { ascending: true })
      .then(({ data }) => setPackages(data || []));
  }, []);

  useEffect(() => {
    if (!selectedProgramId) {
      setInstances([]);
      return;
    }

    supabase
      .from("package_install_instances")
      .select("id, program_id, package_id, name, tags")
      .eq("program_id", selectedProgramId)
      .then(({ data }) => setInstances(data || []));
  }, [selectedProgramId]);

  useEffect(() => {
    if (!selectedProgramId) {
      setInstalls([]);
      return;
    }

    supabase
      .from("ledger_package_installs")
      .select("template_id, installed_ledger_id, install_instance_id")
      .eq("program_id", selectedProgramId)
      .then(({ data }) => setInstalls(data || []));
  }, [selectedProgramId]);

  /* ---------------------------------------------------------------------- */
  /* BUILD PROJECT / PACKAGE GROUPS                                         */
  /* ---------------------------------------------------------------------- */

  const { packageGroups, looseLedgers } = useMemo(() => {
    const ledgerById = new Map(ledgers.map((l) => [l.id, l]));
    const usedLedgerIds = new Set<string>();

    // group instances by package
    const instancesByPackage = new Map<string, PackageInstallInstance[]>();
    instances.forEach((inst) => {
      const arr = instancesByPackage.get(inst.package_id) || [];
      arr.push(inst);
      instancesByPackage.set(inst.package_id, arr);
    });

    // group installs by instance
    const installsByInstance = new Map<string, InstallRecord[]>();
    installs.forEach((row) => {
      if (!row.install_instance_id) return;
      const arr = installsByInstance.get(row.install_instance_id) || [];
      arr.push(row);
      installsByInstance.set(row.install_instance_id, arr);
    });

    const groups: PackageGroup[] = packages.map((pkg) => {
      const pkgInstances = instancesByPackage.get(pkg.id) || [];

      const instanceGroups: InstanceGroup[] = pkgInstances.map((instance) => {
        const rows = installsByInstance.get(instance.id) || [];
        const instanceLedgers: AnyLedger[] = [];

        rows.forEach((row) => {
          const ledger = ledgerById.get(row.installed_ledger_id);
          if (ledger) {
            instanceLedgers.push(ledger);
            usedLedgerIds.add(ledger.id);
          }
        });

        // sort for stable UI
        instanceLedgers.sort((a, b) =>
          (a.name || "").localeCompare(b.name || "")
        );

        return { instance, ledgers: instanceLedgers };
      });

      // collect tags from all instances
      const tagSet = new Set<string>();
      instanceGroups.forEach((ig) =>
        (ig.instance.tags || []).forEach((t) => tagSet.add(t))
      );

      const totalLedgers = instanceGroups.reduce(
        (sum, ig) => sum + ig.ledgers.length,
        0
      );

      return {
        pkg,
        tags: Array.from(tagSet),
        instances: instanceGroups,
        totalLedgers,
      };
    });

    // any ledgers not tied to an instance are "loose"
    const loose: AnyLedger[] =
      selectedProgramId == null
        ? []
        : ledgers.filter(
            (l) => l.program_id === selectedProgramId && !usedLedgerIds.has(l.id)
          );

    // sort loose ledgers for consistency
    loose.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

    return { packageGroups: groups, looseLedgers: loose };
  }, [packages, instances, installs, ledgers, selectedProgramId]);

  /* ---------------------------------------------------------------------- */
  /* ACTION CALLBACKS (STUBS)                                               */
  /* ---------------------------------------------------------------------- */

  const onRename = (id: string) => console.log("Rename:", id);
  const onManageTags = (id: string) => console.log("Manage tags:", id);
  const onDuplicate = (id: string) => console.log("Duplicate:", id);
  const onDelete = (id: string) => console.log("Delete:", id);
  const onDismantle = (id: string) => console.log("Dismantle:", id);
  const onEditLedgers = (id: string) => console.log("Edit ledgers:", id);

  /* ---------------------------------------------------------------------- */
  /* RENDER HELPERS                                                         */
  /* ---------------------------------------------------------------------- */

  const renderLedgerRow = (ledger: AnyLedger) => {
    const Icon = getIcon(ledger.icon);

    return (
      <button
        key={ledger.id}
        onClick={() => openItem(ledger)}
        className="
          w-full flex items-center justify-between
          px-3 py-2
          rounded-[var(--radius)]
          bg-[hsl(var(--card))]
          text-[hsl(var(--gray-700))]
          border border-[hsl(var(--gray-200))]
          shadow-sm
          hover:bg-[hsla(var(--accent)/0.08)]
          hover:border-[hsl(var(--accent))]
          hover:text-[hsl(var(--black))]
          transition-all
        "
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div
            className="
              p-2 rounded-[calc(var(--radius)*0.8)]
              bg-[hsl(var(--gray-50))]
              border border-[hsl(var(--gray-200))]
              shadow-sm
            "
          >
            <Icon className="w-4 h-4 text-[hsl(var(--gray-700))]" />
          </div>

          <div className="flex flex-col overflow-hidden text-left">
            <span className="text-sm font-medium truncate text-[hsl(var(--black))]">
              {ledger.name || "Untitled ledger"}
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

  /* ---------------------------------------------------------------------- */
  /* RENDER                                                                 */
  /* ---------------------------------------------------------------------- */

  const hasAnyProjects =
    packageGroups.some((g) => g.totalLedgers > 0) || looseLedgers.length > 0;

  return (
    <div
      className="
        w-[300px] flex flex-col gap-6
        bg-[hsl(var(--background))]
        border-r border-[hsl(var(--gray-200))]
        pt-2 pb-4
      "
    >

      {/* PACKAGE GROUPS */}
      {packageGroups.map(({ pkg, tags, instances, totalLedgers }) => {
        if (selectedProgramId && totalLedgers === 0) return null;
        const isOpen = open[pkg.id] ?? true;

        return (
          <div key={pkg.id} className="px-3">

            {/* HEADER */}
            <button
              onClick={() =>
                setOpen((prev) => ({ ...prev, [pkg.id]: !isOpen }))
              }
              className="
                w-full flex items-center justify-between
                px-2 py-2
                rounded-[var(--radius)]
                hover:bg-[hsl(var(--gray-50))]
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

                <span className="uppercase text-xs font-semibold tracking-wide text-[hsl(var(--gray-700))]">
                  {pkg.name}
                </span>
              </div>

              <PackageMenu
                instanceId={pkg.id}
                onRename={onRename}
                onManageTags={onManageTags}
                onDuplicate={onDuplicate}
                onDelete={onDelete}
                onDismantle={onDismantle}
                onEditLedgers={onEditLedgers}
              />
            </button>

            {/* CHILDREN */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="mt-1 ml-6 flex flex-col gap-1"
                >
                  {instances.map((inst) => {
                    const pkgGroup = packageGroups.find(
                      (g) => g.pkg.id === pkg.id
                    );
                    const instanceGroup = pkgGroup?.instances.find(
                      (ig) => ig.instance.id === inst.instance.id
                    );
                    const instanceLedgers = instanceGroup?.ledgers ?? [];

                    if (
                      selectedProgramId &&
                      instanceLedgers.length === 0
                    ) {
                      return null;
                    }

                    return (
                      <div key={inst.instance.id} className="flex flex-col gap-1">

                        {/* PROJECT NAME */}
                        <div className="px-2 py-1">
                          <span className="text-xs text-[hsl(var(--gray-600))] block">
                            {inst.instance.name || "Untitled project"}
                          </span>
                        </div>

                        {/* LEDGER ROWS */}
                        {instanceLedgers.map((ledger) => {
                          const Icon = getIcon(ledger.icon);
                          return (
                            <button
                              key={ledger.id}
                              onClick={() => openItem(ledger)}
                              className="
                                w-full flex items-center justify-between
                                pl-2 pr-3 py-2
                                rounded-[var(--radius)]
                                hover:bg-[hsl(var(--gray-50))]
                                transition
                              "
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className="
                                    w-9 h-9 flex items-center justify-center
                                    rounded-[var(--radius)]
                                    bg-[hsl(var(--card))]
                                    border border-[hsl(var(--gray-200))]
                                  "
                                >
                                  <Icon className="w-4 h-4 text-[hsl(var(--gray-800))]" />
                                </div>

                                <span className="text-sm font-medium text-[hsl(var(--gray-900))]">
                                  {ledger.name}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Divider */}
            <div className="mt-3 border-t border-[hsl(var(--gray-200))]" />
          </div>
        );
      })}

      {/* OTHER LEDGERS */}
      <div className="px-3">
        <div className="uppercase text-xs font-semibold tracking-wide text-[hsl(var(--gray-700))] px-2 py-2">
          OTHER LEDGERS
        </div>

        {looseLedgers.length === 0 ? (
          <div className="px-2 py-1 text-xs text-[hsl(var(--gray-500))]">
            None
          </div>
        ) : (
          looseLedgers.map((ledger) => {
            const Icon = getIcon(ledger.icon);
            return (
              <button
                key={ledger.id}
                onClick={() => openItem(ledger)}
                className="
                  w-full flex items-center justify-between
                  pl-2 pr-3 py-2
                  rounded-[var(--radius)]
                  hover:bg-[hsl(var(--gray-50))]
                  transition
                "
              >
                <div className="flex items-center gap-3">
                  <div
                    className="
                      w-9 h-9 flex items-center justify-center
                      rounded-[var(--radius)]
                      bg-[hsl(var(--card))]
                      border border-[hsl(var(--gray-200))]
                    "
                  >
                    <Icon className="w-4 h-4 text-[hsl(var(--gray-800))]" />
                  </div>

                  <span className="text-sm font-medium text-[hsl(var(--gray-900))]">
                    {ledger.name}
                  </span>
                </div>

                <span className="text-xs text-[hsl(var(--gray-500))]">
                  Open
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );

}
