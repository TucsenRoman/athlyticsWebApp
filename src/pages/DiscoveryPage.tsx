"use client";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

import { useProgramContext } from "@/features/program_cloak/useProgramContext";
import { useDemo } from "@/contexts/DemoContext";

import DiscoveryHeader from "@/components/discovery/DiscoveryHeader";
import DiscoveryFeed from "@/components/discovery/DiscoveryFeed";
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

/* -------------------------------------------------------------------------- */
/* ICON MAP                                                                   */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

export type AnyLedger = {
  id: string;
  program_id: number | null;
  user_id: string | null;
  name: string;
  description?: string | null;
  icon: string | null;
  status: string | null;
  created_at?: string | null;
  template_key?: string | null;
};

/* -------------------------------------------------------------------------- */
/* PAGE                                                                       */
/* -------------------------------------------------------------------------- */

export default function DiscoveryPage() {
  const navigate = useNavigate();
  const { selectedProgramId } = useProgramContext();
  const { demoMode } = useDemo();

  /* UI STATE */
  const [collapsed, setCollapsed] = useState(true);
  const [openOther, setOpenOther] = useState(true);
  const [mode, setMode] = useState<"discover" | "social">("discover");
  const [query, setQuery] = useState("");

  /* DATA STATE */
  const [ledgers, setLedgers] = useState<AnyLedger[]>([]);
  const [loading, setLoading] = useState(true);
  const [installedLedgerIds, setInstalledLedgerIds] = useState<Set<string>>(new Set());

  /* DEMO FALLBACK */
  const demoLedgers: AnyLedger[] = [
    {
      id: "demo1",
      program_id: 0,
      user_id: "demo",
      name: "Sprint Results",
      description: "PRs, SBs, event results",
      icon: "performance",
      status: "active",
    },
    {
      id: "demo2",
      program_id: 0,
      user_id: "demo",
      name: "Attendance",
      description: "Practice attendance tracker",
      icon: "clipboard",
      status: "active",
    },
  ];

  /* ---------------------------------------------------------------------- */
  /* LOAD LEDGERS FOR PROGRAM                                               */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (demoMode) {
      setLedgers(demoLedgers);
      setLoading(false);
      return;
    }

    async function load() {
      setLoading(true);

      if (!selectedProgramId) {
        setLedgers([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("ledgers")
        .select("*")
        .eq("program_id", selectedProgramId)
        .order("created_at", { ascending: false });

      if (error) console.error("Ledger fetch error:", error);
      setLedgers((data || []) as AnyLedger[]);
      setLoading(false);
    }

    load();
  }, [demoMode, selectedProgramId]);

  /* ---------------------------------------------------------------------- */
  /* LOAD LEDGERS THAT BELONG TO INSTALLED PACKAGES                         */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (demoMode || !selectedProgramId) {
      setInstalledLedgerIds(new Set());
      return;
    }

    async function loadInstalled() {
      const { data, error } = await supabase
        .from("package_items")
        .select("ledger_id, packages!inner(program_id)")
        .eq("packages.program_id", selectedProgramId);

      if (error) {
        console.error("Package items error:", error);
        return setInstalledLedgerIds(new Set());
      }

      const set = new Set<string>(data?.map((row) => row.ledger_id));
      setInstalledLedgerIds(set);
    }

    loadInstalled();
  }, [demoMode, selectedProgramId]);

  /* ---------------------------------------------------------------------- */
  /* ORPHAN LEDGERS → (not from a package)                                  */
  /* ---------------------------------------------------------------------- */

  const orphanLedgers = useMemo(() => {
    if (demoMode) return demoLedgers;
    if (!installedLedgerIds.size) return ledgers;
    return ledgers.filter((l) => !installedLedgerIds.has(l.id));
  }, [demoMode, ledgers, installedLedgerIds]);

  /* ---------------------------------------------------------------------- */
  /* RENDER                                                                 */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="flex h-full overflow-hidden">

      {/* SIDEBAR — minimal, only orphans */}
      <aside
        className={`
          ${collapsed ? "w-0 opacity-0 pointer-events-none" : "w-72 opacity-100"}
          shrink-0 border-r border-border
          bg-card/30 backdrop-blur-xl
          overflow-y-auto transition-all duration-300
        `}
      >
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
              <span className="text-[10px] text-muted-foreground">
                {orphanLedgers.length}
              </span>
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
                    onClick={() =>
                      demoMode ? null : navigate(`/ledgers/${ledger.id}`)
                    }
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
                        <span className="text-sm font-medium truncate">
                          {ledger.name}
                        </span>
                        {ledger.description && (
                          <span className="text-xs text-muted-foreground truncate">
                            {ledger.description}
                          </span>
                        )}
                      </div>
                    </div>

                    {!demoMode && (
                      <span className="text-[10px] text-muted-foreground">
                        Open
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 overflow-hidden flex flex-col">
        <DiscoveryHeader
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          mode={mode}
          setMode={setMode}
          query={query}
          setQuery={setQuery}
        />

        <div className="flex-1 overflow-hidden">
          <DiscoveryFeed mode={mode} query={query} />
        </div>
      </main>
    </div>
  );
}
