import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useProgramContext } from "@/hooks/useProgramContext";
import PackageDisplay from "@/components/packages/PackageDisplay";

import {
  ChevronDown,
  ChevronRight,
  ClipboardList,
  FileText,
  Users,
  Activity,
  BarChart3,
  Trophy,
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
/* MAIN PAGE                               */
/* --------------------------------------- */

export default function LedgerPage() {
  const navigate = useNavigate();
  const { selectedProgramId } = useProgramContext();

  const [ledgers, setLedgers] = useState<AnyLedger[]>([]);
  const [installedTemplateIds, setInstalledTemplateIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const [openOther, setOpenOther] = useState(true);

  /* --------------------------------------- */
  /* LOAD LEDGERS FOR THIS PROGRAM           */
  /* --------------------------------------- */

  useEffect(() => {
    async function loadLedgers() {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

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

    loadLedgers();
  }, [selectedProgramId]);

  /* --------------------------------------- */
  /* LOAD INSTALLED TEMPLATE IDS             */
  /* (needed to find ORPHAN ledgers)         */
  /* --------------------------------------- */

  useEffect(() => {
    if (!selectedProgramId) {
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
        data.forEach((row) => {
          if (row.installed_ledger_id) set.add(row.installed_ledger_id);
        });

        setInstalledTemplateIds(set);
      });
  }, [selectedProgramId, ledgers.length]);

  /* --------------------------------------- */
  /* ORPHAN LEDGERS (not part of any package) */
  /* --------------------------------------- */

  const orphanLedgers = useMemo(() => {
    if (!installedTemplateIds.size) return ledgers;
    return ledgers.filter((l) => !installedTemplateIds.has(l.id));
  }, [ledgers, installedTemplateIds]);

  /* --------------------------------------- */
  /* RENDER                                  */
  /* --------------------------------------- */

  return (
    <div className="flex h-full overflow-hidden">

      {/* ------------------------- */}
      {/* SIDEBAR                   */}
      {/* ------------------------- */}
      <aside
        className="
          w-72 shrink-0
          border-r border-border
          bg-card/30 backdrop-blur-xl
          overflow-y-auto
        "
      >
        <div className="p-4 text-xl font-bold">Ledgers</div>

        {/* PACKAGES */}
        <PackageDisplay
          selectedProgramId={selectedProgramId}
          ledgers={ledgers}
        />

        {/* OTHER LEDGERS SECTION */}
        <div className="border-t border-border/40 pt-2">

          {/* HEADER */}
          <button
            type="button"
            onClick={() => setOpenOther((o) => !o)}
            className="
              w-full flex items-center justify-between
              px-3 py-2
              text-xs font-semibold uppercase tracking-[0.08em]
              text-muted-foreground hover:text-foreground
              transition
            "
          >
            <div className="flex items-center gap-2">
              {openOther ? (
                <ChevronDown className="w-4 h-4 opacity-70" />
              ) : (
                <ChevronRight className="w-4 h-4 opacity-70" />
              )}
              <span>Other Ledgers</span>
            </div>

            {orphanLedgers.length > 0 && (
              <span className="text-[10px] text-muted-foreground">
                {orphanLedgers.length}
              </span>
            )}
          </button>

          {/* LIST */}
          {openOther && (
            <div className="mt-1 space-y-1 pl-9 pr-2 pb-3">
              {loading && (
                <p className="text-xs text-muted-foreground">Loading…</p>
              )}

              {!loading && orphanLedgers.length === 0 && (
                <p className="text-xs text-muted-foreground">None</p>
              )}

              {orphanLedgers.map((ledger) => {
                const Icon = getIcon(ledger.icon);

                return (
                  <button
                    key={ledger.id}
                    onClick={() => navigate(`/ledgers/${ledger.id}`)}
                    className="
                      w-full flex items-center justify-between
                      px-3 py-2 rounded-lg
                      hover:bg-muted/40 transition
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

                    <span className="text-[10px] text-muted-foreground">
                      Open
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      {/* ------------------------- */}
      {/* MAIN CONTENT AREA         */}
      {/* ------------------------- */}
      <main className="flex-1 p-6 overflow-y-auto">
        <div>
          Global tabs | Chatbot & Designer | | Global Routes | | Automations |
        </div>
        <div>
          Package/Template/Ledger specific tabs | Notes & Comments | | Permissions |
        </div>
      </main>

    </div>
  );
}
