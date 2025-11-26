"use client";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useProgramContext } from "@/hooks/useProgramContext";
import { useDemo } from "@/contexts/DemoContext";

import PackageDisplay from "@/components/discovery/PackageDisplay";
import DiscoveryFeed from "@/components/discovery/DiscoveryFeed";
import NoProgramState from "@/components/NoProgramState";

import DiscoveryHeader from "@/components/discovery/DiscoveryHeader";

import {
  ClipboardList,
  FileText,
  Users,
  Activity,
  BarChart3,
  Trophy,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

/* --------------------------------------- */
/* ICON MAP                                */
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

export type AnyLedger = {
  id: string;
  coach_id: string;
  program_id: number;
  name: string;
  description?: string | null;
  icon: string | null;
  status: string | null;
  created_at?: string | null;
};

/* --------------------------------------- */
/* PAGE                                    */
/* --------------------------------------- */

export default function LedgerPage() {
  const navigate = useNavigate();
  const { selectedProgramId } = useProgramContext();
  const { demoMode } = useDemo();

  /* --------------------------------------- */
  /* UI STATE                                */
  /* --------------------------------------- */

  const [collapsed, setCollapsed] = useState(true);
  const [openOther, setOpenOther] = useState(true);

  // New unified header state
  const [mode, setMode] = useState<"discover" | "social">("discover");
  const [query, setQuery] = useState("");

  // Ledger state
  const [ledgers, setLedgers] = useState<AnyLedger[]>([]);
  const [installedTemplateIds, setInstalledTemplateIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [newLedgerOpen, setNewLedgerOpen] = useState(false);

  /* --------------------------------------- */
  /* DEMO LEDGERS                            */
  /* --------------------------------------- */

  const demoLedgers: AnyLedger[] = [
    {
      id: "demo1",
      coach_id: "demo",
      program_id: 0,
      name: "Sprint Results",
      description: "PRs, SBs, event results",
      icon: "performance",
      status: "active",
    },
    {
      id: "demo2",
      coach_id: "demo",
      program_id: 0,
      name: "Attendance",
      description: "Practice attendance tracker",
      icon: "clipboard",
      status: "active",
    },
  ];

  /* --------------------------------------- */
  /* LOAD LEDGERS                            */
  /* --------------------------------------- */

  useEffect(() => {
    if (demoMode) {
      setLedgers(demoLedgers);
      setLoading(false);
      return;
    }

    async function load() {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !selectedProgramId) {
        setLedgers([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("ledgers")
        .select("*")
        .eq("coach_id", user.id)
        .eq("program_id", selectedProgramId)
        .order("created_at", { ascending: false });

      if (error) console.error(error);
      setLedgers((data || []) as AnyLedger[]);
      setLoading(false);
    }

    load();
  }, [demoMode, selectedProgramId]);

  /* --------------------------------------- */
  /* LOAD INSTALLED TEMPLATE IDS             */
  /* --------------------------------------- */

  useEffect(() => {
    if (demoMode || !selectedProgramId) {
      setInstalledTemplateIds(new Set());
      return;
    }

    supabase
      .from("ledger_package_installs")
      .select("installed_ledger_id")
      .eq("program_id", selectedProgramId)
      .then(({ data, error }) => {
        if (error || !data) {
          console.error(error);
          setInstalledTemplateIds(new Set());
          return;
        }

        const set = new Set<string>();
        data.forEach((row) => row.installed_ledger_id && set.add(row.installed_ledger_id));
        setInstalledTemplateIds(set);
      });
  }, [demoMode, selectedProgramId, ledgers.length]);

  /* --------------------------------------- */
  /* ORPHANS                                 */
  /* --------------------------------------- */

  const orphanLedgers = useMemo(() => {
    if (demoMode) return demoLedgers;
    if (!installedTemplateIds.size) return ledgers;
    return ledgers.filter((l) => !installedTemplateIds.has(l.id));
  }, [demoMode, ledgers, installedTemplateIds]);

  /* --------------------------------------- */
  /* NO PROGRAM                              */
  /* --------------------------------------- */

  if (!demoMode && !selectedProgramId) return <NoProgramState />;

  /* --------------------------------------- */
  /* RENDER                                  */
  /* --------------------------------------- */

  return (
    <div className="flex h-full overflow-hidden">

      {/* SIDEBAR */}
      <aside
        className={`
          ${collapsed ? "w-0 opacity-0 pointer-events-none" : "w-72 opacity-100"}
          shrink-0 border-r border-border
          bg-card/30 backdrop-blur-xl
          overflow-y-auto transition-all duration-300
        `}
      >
        {/* REMOVE SIDEBAR HEADER COMPLETELY */}

        {/* PACKAGES */}
        {!demoMode && selectedProgramId && (
          <PackageDisplay selectedProgramId={selectedProgramId} ledgers={ledgers} />
        )}

        {/* OTHER LEDGERS */}
        <div className="border-t border-border/40 pt-2">
          <button
            type="button"
            onClick={() => setOpenOther((o) => !o)}
            className="
              w-full flex items-center justify-between
              px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em]
              text-muted-foreground hover:text-foreground transition
            "
          >
            <div className="flex items-center gap-2">
              {openOther ? (
                <ChevronDown className="w-4 h-4 opacity-70" />
              ) : (
                <ChevronRight className="w-4 h-4 opacity-70" />
              )}
              <span>{demoMode ? "Demo Ledgers" : "Other Ledgers"}</span>
            </div>

            {orphanLedgers.length > 0 && (
              <span className="text-[10px] text-muted-foreground">{orphanLedgers.length}</span>
            )}
          </button>

          {openOther && (
            <div className="mt-1 space-y-1 pl-9 pr-2 pb-3">
              {loading && <p className="text-xs text-muted-foreground">Loading…</p>}
              {!loading && orphanLedgers.length === 0 && (
                <p className="text-xs text-muted-foreground">None</p>
              )}

              {orphanLedgers.map((ledger) => {
                const Icon = getIcon(ledger.icon);

                return (
                  <button
                    key={ledger.id}
                    onClick={() => (demoMode ? null : navigate(`/ledgers/${ledger.id}`))}
                    className="
                      w-full flex items-center justify-between
                      px-3 py-2 rounded-lg hover:bg-muted/40 transition
                    "
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2 rounded-md border bg-background border-border">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>

                      <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-medium truncate">{ledger.name}</span>
                        {ledger.description && (
                          <span className="text-xs text-muted-foreground truncate">
                            {ledger.description}
                          </span>
                        )}
                      </div>
                    </div>

                    {!demoMode && (
                      <span className="text-[10px] text-muted-foreground">Open</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-hidden flex flex-col">

        {/* UNIFIED HEADER */}
        <DiscoveryHeader
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          mode={mode}
          setMode={setMode}
          query={query}
          setQuery={setQuery}
        />

        {/* CONTENT SECTION */}
        <div className="flex-1 overflow-hidden">
          <DiscoveryFeed mode={mode} query={query} />
        </div>
      </main>
    </div>
  );
}
 