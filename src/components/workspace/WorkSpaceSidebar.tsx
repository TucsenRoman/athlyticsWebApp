"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useProgramContext } from "@/hooks/useProgramContext";

import { ChevronDown, ChevronRight, Table2, Folder } from "lucide-react";

interface Ledger {
  id: string;
  name: string | null;
}

interface Header {
  id: string;
  name: string | null;
  route_class: "independent" | "primary" | "secondary";
}

export default function WorkspaceSidebar() {
  const navigate = useNavigate();
  const { selectedProgramId } = useProgramContext();

  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [headersByLedger, setHeadersByLedger] = useState<Record<string, Header[]>>({});
  const [expandedLedgerId, setExpandedLedgerId] = useState<string | null>(null);

  /* -------------------------------------------------- */
  /* LOAD LEDGERS                                        */
  /* -------------------------------------------------- */
  useEffect(() => {
    if (!selectedProgramId) return;

    const fetchLedgers = async () => {
      const { data } = await supabase
        .from("ledgers")
        .select("id, name")
        .eq("program_id", selectedProgramId)
        .order("created_at", { ascending: true });

      if (data) setLedgers(data);
    };

    fetchLedgers();
  }, [selectedProgramId]);

  /* -------------------------------------------------- */
  /* LOAD HEADERS (ROUTE GROUPS)                         */
  /* -------------------------------------------------- */
  const loadHeaderGroups = async (ledgerId: string) => {
    const { data } = await supabase
      .from("ledger_headers")
      .select("id, name, route_class")
      .eq("ledger_id", ledgerId)
      .order("order_index", { ascending: true });

    if (data) {
      setHeadersByLedger((prev) => ({ ...prev, [ledgerId]: data }));
      setExpandedLedgerId(ledgerId);
    }
  };

  const toggleLedger = async (ledgerId: string) => {
    if (expandedLedgerId === ledgerId) {
      setExpandedLedgerId(null);
      return;
    }

    if (!headersByLedger[ledgerId]) await loadHeaderGroups(ledgerId);
    else setExpandedLedgerId(ledgerId);
  };

  const openLedger = (ledgerId: string) => {
    navigate(`/ledgers/${ledgerId}`);
  };

  return (
    <div className="w-64 border-r border-[--border] bg-[--surface-1] flex flex-col">
      <div className="p-4 text-sm font-medium">
        Ledgers
      </div>

      <div className="flex-1 overflow-y-auto">

        {ledgers.map((ledger) => {
          const isOpen = expandedLedgerId === ledger.id;
          const headers = headersByLedger[ledger.id] || [];

          const independent = headers.filter(h => h.route_class === "independent");
          const primary = headers.filter(h => h.route_class === "primary");
          const secondary = headers.filter(h => h.route_class === "secondary");

          return (
            <div key={ledger.id}>
              {/* Ledger row */}
              <button
                className="w-full flex items-center justify-between px-4 py-2 hover:bg-[--surface-2]"
                onClick={() => toggleLedger(ledger.id)}
              >
                <div className="flex items-center gap-2">
                  <Table2 className="w-4 h-4 opacity-70" />
                  {ledger.name ?? "Untitled Ledger"}
                </div>

                {isOpen ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>

              {/* Header Groups */}
              {isOpen && (
                <div className="ml-6 mt-1">
                  
                  {independent.length > 0 && (
                    <>
                      <div className="text-xs text-[--text-muted] mb-1">Independent</div>
                      {independent.map((h) => (
                        <button
                          key={h.id}
                          className="flex w-full items-center gap-2 px-2 py-1 text-sm hover:bg-[--surface-2]"
                          onClick={() => openLedger(ledger.id)}
                        >
                          <Folder className="w-3 h-3 opacity-70" />
                          {h.name ?? "Unnamed"}
                        </button>
                      ))}
                    </>
                  )}

                  {primary.length > 0 && (
                    <>
                      <div className="text-xs text-[--text-muted] mt-3 mb-1">Primary</div>
                      {primary.map((h) => (
                        <button
                          key={h.id}
                          className="flex w-full items-center gap-2 px-2 py-1 text-sm hover:bg-[--surface-2]"
                          onClick={() => openLedger(ledger.id)}
                        >
                          <Folder className="w-3 h-3 opacity-70" />
                          {h.name ?? "Unnamed"}
                        </button>
                      ))}
                    </>
                  )}

                  {secondary.length > 0 && (
                    <>
                      <div className="text-xs text-[--text-muted] mt-3 mb-1">Secondary</div>
                      {secondary.map((h) => (
                        <button
                          key={h.id}
                          className="flex w-full items-center gap-2 px-2 py-1 text-sm hover:bg-[--surface-2]"
                          onClick={() => openLedger(ledger.id)}
                        >
                          <Folder className="w-3 h-3 opacity-70" />
                          {h.name ?? "Unnamed"}
                        </button>
                      ))}
                    </>
                  )}

                </div>
              )}
            </div>
          );
        })}

      </div>
    </div>
  );
}
