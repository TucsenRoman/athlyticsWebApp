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

/* --------------------------------------- */
/* ICON MAP                                */
/* --------------------------------------- */

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

/* --------------------------------------- */
/* TYPES                                   */
/* --------------------------------------- */

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

/* --------------------------------------- */
/* COMPONENT                               */
/* --------------------------------------- */

export default function PackageDisplay({
  selectedProgramId,
  ledgers,
}: PackageDisplayProps) {
  const navigate = useNavigate();

  const [packages, setPackages] = useState<PackageRecord[]>([]);
  const [instances, setInstances] = useState<PackageInstallInstance[]>([]);
  const [installs, setInstalls] = useState<InstallRecord[]>([]);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  /* --------------------------------------- */
  /* LOAD DATA FROM SUPABASE                 */
  /* --------------------------------------- */

  useEffect(() => {
    supabase
      .from("ledger_packages")
      .select("id, name, description, icon, is_system_package")
      .order("sort_index", { ascending: true })
      .then(({ data, error }) => {
        if (error) console.error(error);
        setPackages(data || []);
      });
  }, []);

  useEffect(() => {
    if (!selectedProgramId) return setInstances([]);

    supabase
      .from("package_install_instances")
      .select("id, program_id, package_id, name, tags")
      .eq("program_id", selectedProgramId)
      .then(({ data, error }) => {
        if (error) console.error(error);
        setInstances(data || []);
      });
  }, [selectedProgramId]);

  useEffect(() => {
    if (!selectedProgramId) return setInstalls([]);

    supabase
      .from("ledger_package_installs")
      .select("template_id, installed_ledger_id, install_instance_id")
      .eq("program_id", selectedProgramId)
      .then(({ data, error }) => {
        if (error) console.error(error);
        setInstalls(data || []);
      });
  }, [selectedProgramId]);

  /* --------------------------------------- */
  /* BUILD PACKAGE GROUPS                    */
  /* --------------------------------------- */

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

  /* --------------------------------------- */
  /* MENU HANDLERS                           */
  /* --------------------------------------- */

  const onRename = (instanceId: string) => console.log("Rename:", instanceId);
  const onManageTags = (instanceId: string) =>
    console.log("Manage tags:", instanceId);
  const onDuplicate = (instanceId: string) =>
    console.log("Duplicate package:", instanceId);
  const onDelete = (instanceId: string) => console.log("Delete:", instanceId);
  const onDismantle = (instanceId: string) =>
    console.log("Dismantle:", instanceId);
  const onEditLedgers = (instanceId: string) =>
    console.log("Edit ledgers:", instanceId);

  /* --------------------------------------- */
  /* RENDER                                  */
  /* --------------------------------------- */

  return (
    <div className="space-y-1">

      {packageGroups.map(({ pkg, tags, installedLedgers }) => {
        const isOpen = open[pkg.id] ?? true;

        return (
          <div key={pkg.id} className="w-full border-b border-border/40">

            {/* ----------------------------------- */}
            {/* PACKAGE HEADER                       */}
            {/* ----------------------------------- */}

            <div
              className="
                px-3 py-2 flex items-center justify-between
                text-muted-foreground hover:text-foreground
                transition-colors
              "
            >
              <button
                type="button"
                onClick={() =>
                  setOpen((prev) => ({ ...prev, [pkg.id]: !isOpen }))
                }
                className="flex items-center gap-2 flex-1 text-left"
              >
                <motion.div
                  animate={{ rotate: isOpen ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight
                    className={
                      isOpen
                        ? "w-4 h-4 text-primary"
                        : "w-4 h-4 text-muted-foreground"
                    }
                  />
                </motion.div>

                <span className="truncate text-xs font-semibold uppercase tracking-[0.07em] text-foreground">
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
                          px-2 py-[2px] rounded-full
                          bg-secondary/10 text-secondary-foreground/90
                          text-[10px] font-medium
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

            {/* ----------------------------------- */}
            {/* LEDGERS INSIDE PACKAGE              */}
            {/* ----------------------------------- */}

            <AnimatePresence initial={false}>
              {isOpen && (
                <div
                  className="
                    relative space-y-1 pl-9 pr-2 py-2
                    before:absolute before:left-[19px]
                    before:top-0 before:bottom-[10px]
                    before:w-[1.5px] before:bg-secondary/25
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
                            px-3 py-2 rounded-lg
                            hover:bg-muted/30 transition
                          "
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="p-2 rounded-md bg-card border border-border">
                              <Icon className="w-4 h-4 text-primary" />
                            </div>

                            <div className="flex flex-col overflow-hidden">
                              <span className="text-sm font-medium truncate text-foreground">
                                {ledger.name}
                              </span>

                              {ledger.description && (
                                <span className="text-xs text-muted-foreground truncate">
                                  {ledger.description}
                                </span>
                              )}
                            </div>
                          </div>

                          <span className="text-[10px] text-muted-foreground">
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
        <p className="px-3 py-2 text-xs text-muted-foreground">
          No packages installed in this program yet.
        </p>
      )}
    </div>
  );
}
