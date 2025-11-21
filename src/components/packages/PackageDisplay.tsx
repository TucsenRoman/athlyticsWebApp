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
  ChevronDown,
  ChevronRight,
} from "lucide-react";

/* --------------------------------------- */
/* ICONS                                   */
/* --------------------------------------- */
const ICON_MAP: Record<string, any> = {
  file: FileText,
  clipboard: ClipboardList,
  team: Users,
  performance: Activity,
  chart: BarChart3,
  trophy: Trophy,
};

const getIcon = (key: string | null | undefined) =>
  ICON_MAP[key ?? "file"] || FileText;

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

export interface PackageLedgerTemplate {
  id: string;
  ledger_name: string;
  icon: string | null;
  package_id: string;
}

export interface InstallRecord {
  template_id: string;
  installed_ledger_id: string;
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

/* --------------------------------------- */
/* PROPS                                   */
/* --------------------------------------- */

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
  const [templates, setTemplates] = useState<PackageLedgerTemplate[]>([]);
  const [installs, setInstalls] = useState<InstallRecord[]>([]);
  const [open, setOpen] = useState<Record<string, boolean>>({});

  /* --------------------------------------- */
  /* LOAD PACKAGES                           */
  /* --------------------------------------- */
  useEffect(() => {
    supabase
      .from("ledger_packages")
      .select("id, name, description, icon, is_system_package")
      .order("sort_index", { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          console.error("Failed to load ledger_packages:", error);
          setPackages([]);
          return;
        }
        setPackages((data || []) as PackageRecord[]);
      });
  }, []);

  /* --------------------------------------- */
  /* LOAD PACKAGE LEDGER TEMPLATES           */
  /* --------------------------------------- */
  useEffect(() => {
    supabase
      .from("ledger_package_ledgers")
      .select("id, ledger_name, icon, package_id")
      .order("ledger_name", { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          console.error("Failed to load ledger_package_ledgers:", error);
          setTemplates([]);
          return;
        }
        setTemplates((data || []) as PackageLedgerTemplate[]);
      });
  }, []);

  /* --------------------------------------- */
  /* LOAD INSTALLS FOR ACTIVE PROGRAM        */
  /* --------------------------------------- */
  useEffect(() => {
    if (!selectedProgramId) {
      setInstalls([]);
      return;
    }

    supabase
      .from("ledger_package_installs")
      .select("template_id, installed_ledger_id")
      .eq("program_id", selectedProgramId)
      .then(({ data, error }) => {
        if (error) {
          console.error("Failed to load ledger_package_installs:", error);
          setInstalls([]);
          return;
        }
        setInstalls((data || []) as InstallRecord[]);
      });
  }, [selectedProgramId]);

  /* --------------------------------------- */
  /* BUILD PACKAGE → INSTALLED LEDGERS MAP   */
  /* --------------------------------------- */

  const packageGroups = useMemo(() => {
    // Map template_id -> template
    const templatesById = new Map<string, PackageLedgerTemplate>();
    templates.forEach((t) => templatesById.set(t.id, t));

    // Map package_id -> template_ids[]
    const templateIdsByPackage = new Map<string, string[]>();
    templates.forEach((t) => {
      if (!templateIdsByPackage.has(t.package_id)) {
        templateIdsByPackage.set(t.package_id, []);
      }
      templateIdsByPackage.get(t.package_id)!.push(t.id);
    });

    // Map template_id -> installs[]
    const installsByTemplateId = new Map<string, InstallRecord[]>();
    installs.forEach((inst) => {
      if (!installsByTemplateId.has(inst.template_id)) {
        installsByTemplateId.set(inst.template_id, []);
      }
      installsByTemplateId.get(inst.template_id)!.push(inst);
    });

    // Map ledger_id -> ledger
    const ledgerById = new Map<string, AnyLedger>();
    ledgers.forEach((l) => ledgerById.set(l.id, l));

    return packages.map((pkg) => {
      const templateIds = templateIdsByPackage.get(pkg.id) || [];
      const seenLedgerIds = new Set<string>();
      const installedLedgers: AnyLedger[] = [];

      templateIds.forEach((tid) => {
        const templateInstalls = installsByTemplateId.get(tid) || [];
        templateInstalls.forEach((inst) => {
          const ledger = ledgerById.get(inst.installed_ledger_id);
          if (ledger && !seenLedgerIds.has(ledger.id)) {
            installedLedgers.push(ledger);
            seenLedgerIds.add(ledger.id);
          }
        });
      });

      // Sort by ledger name for stable UI
      installedLedgers.sort((a, b) => {
        const an = a.name || "";
        const bn = b.name || "";
        return an.localeCompare(bn);
      });

      return {
        pkg,
        installedLedgers,
      };
    });
  }, [packages, templates, installs, ledgers]);

  /* --------------------------------------- */
  /* RENDER                                  */
  /* --------------------------------------- */

  return (
    <div className="space-y-1">
      {packageGroups.map(({ pkg, installedLedgers }) => {
        const isOpen = open[pkg.id] ?? true;
        const hasInstalls = installedLedgers.length > 0;

        return (
          <div
            key={pkg.id}
            className="w-full border-b border-border/40 last:border-b-0"
          >
            {/* PACKAGE HEADER */}
            <button
              type="button"
              onClick={() =>
                setOpen((prev) => ({ ...prev, [pkg.id]: !isOpen }))
              }
              className="
                w-full px-3 py-2
                text-muted-foreground hover:text-foreground
                transition
              "
            >
              <div className="flex items-start justify-between w-full">
                {/* LEFT — chevron + title + description */}
                <div className="flex items-start gap-2">
                  {/* Chevron */}
                  <motion.div
                    animate={{ rotate: isOpen ? 90 : 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="mt-0.5"
                  >
                    <ChevronRight
                      className={isOpen ? "w-4 h-4 text-primary/80" : "w-4 h-4 text-muted-foreground/70"}
                    />
                  </motion.div>

                  {/* Title + description */}
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold uppercase tracking-[0.08em]">
                      {pkg.name}
                    </span>

                    {isOpen && pkg.description && (
                      <span className="text-[11px] text-muted-foreground normal-case mt-0.5">
                        {pkg.description}
                      </span>
                    )}
                  </div>
                </div>

                {/* RIGHT — stacked pills */}
                <div className="flex flex-col items-end gap-1">
                  {/* Show if new program < 1 open */}
                  {pkg.is_system_package && (
                    <span className="w-[80px] px-2 py-[2px] rounded-full bg-primary/10 text-primary text-[10px] font-semibold text-center">
                      START HERE
                    </span>
                  )}

                  {/* {installedLedgers.length > 0 && (
                    <span
                      className="
                        w-[70px] px-2 py-[2px]
                        rounded-full
                        bg-muted text-muted-foreground
                        text-[9px] font-medium text-center
                      "
                    >
                      {installedLedgers.length}{" "}
                      {installedLedgers.length === 1 ? "LEDGER" : "LEDGERS"}
                    </span>
                  )} */}
                </div>
              </div>
            </button>

            {/* INSTALLED LEDGERS LIST */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <div
                  className="
                    relative
                    space-y-1 pl-9 pr-2 py-2
                    before:content-[''] before:absolute 
                    before:left-[19px]
                    before:top-[-25px]
                    before:bottom-[15px]
                    before:w-[1.5px]
                    before:bg-primary/20
                  "
                >
                  {!selectedProgramId && (
                    <p className="text-xs text-muted-foreground">
                      REPLACE THIS!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                    </p>
                  )}

                  {selectedProgramId && installedLedgers.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      No ledgers from this package in this program yet.
                    </p>
                  )}

                  {selectedProgramId &&
                    installedLedgers.map((ledger) => {
                      const Icon = getIcon(ledger.icon);

                      return (
                        <button
                          key={ledger.id}
                          type="button"
                          onClick={() => navigate(`/ledgers/${ledger.id}`)}
                          className="
                            w-full flex items-center justify-between
                            px-3 py-2 rounded-lg text-left
                            hover:bg-muted/40 transition
                          "
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="p-2 rounded-md bg-background border border-border">
                              <Icon className="w-4 h-4 text-primary" />
                            </div>

                            <div className="flex flex-col overflow-hidden">
                              <span className="text-sm font-medium truncate">
                                {ledger.name || "Untitled ledger"}
                              </span>
                              {ledger.description && (
                                <span className="text-xs text-muted-foreground truncate">
                                  {ledger.description}
                                </span>
                              )}
                            </div>
                          </div>

                          <span className="text-[10px] text-muted-foreground">Open</span>
                        </button>
                      );
                    })}
                </div>
              )}

            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
