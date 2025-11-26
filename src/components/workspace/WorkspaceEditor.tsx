"use client";

import React, { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

import type { Tables } from "@/integrations/supabase/types";
import LedgerSheet from "../ledger/ledgerSheet/LedgerSheet";

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

type Ledger = Tables<"ledgers">;
type LedgerHeader = Tables<"ledger_headers">;
type LedgerEntry = Tables<"ledger_entries">;

interface WorkspaceEditorProps {
  activeTab: string | null;
  openTabs: any[];
}

/* -------------------------------------------------------------------------- */
/* WORKSPACE EDITOR                                                           */
/* -------------------------------------------------------------------------- */

export default function WorkspaceEditor({ activeTab, openTabs }: WorkspaceEditorProps) {
  const activeLedger = openTabs.find((t) => t.id === activeTab);
  const ledgerId = activeLedger?.id ?? null;

  const [ledger, setLedger] = useState<Ledger | null>(null);
  const [headers, setHeaders] = useState<LedgerHeader[]>([]);
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  /* ---------------------------------------------------------------------- */
  /* LOAD LEDGER DATA                                                       */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!ledgerId) {
      setLedger(null);
      setHeaders([]);
      setEntries([]);
      setRoutes([]);
      return;
    }

    const load = async () => {
      try {
        setLoading(true);

        const { data: ledgerData } = await supabase
          .from("ledgers")
          .select("*")
          .eq("id", ledgerId)
          .single();

        const { data: headerData } = await supabase
          .from("ledger_headers")
          .select("*")
          .eq("ledger_id", ledgerId)
          .order("order_index", { ascending: true });

        const { data: entryData } = await supabase
          .from("ledger_entries")
          .select("*")
          .eq("ledger_id", ledgerId)
          .order("created_at");

        setLedger(ledgerData ?? null);
        setHeaders(headerData ?? []);
        setEntries(entryData ?? []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load ledger");
      } finally {
        setLoading(false);
      }
    };

    load();
    loadRoutes();
  }, [ledgerId]);

  /* ---------------------------------------------------------------------- */
  /* LOAD ROUTES                                                            */
  /* ---------------------------------------------------------------------- */

  const loadRoutes = async () => {
    if (!ledgerId) return;

    const { data, error } = await supabase
      .from("ledger_routes")
      .select("*")
      .or(`source_ledger_id.eq.${ledgerId},target_ledger_id.eq.${ledgerId}`)
      .order("created_at");

    if (error) {
      console.error("Failed to load routes:", error);
      setRoutes([]);
      return;
    }

    setRoutes(data || []);
  };

  /* ---------------------------------------------------------------------- */
  /* RELOAD HELPERS                                                         */
  /* ---------------------------------------------------------------------- */

  const reloadHeaders = async () => {
    if (!ledgerId) return;

    const { data } = await supabase
      .from("ledger_headers")
      .select("*")
      .eq("ledger_id", ledgerId)
      .order("order_index", { ascending: true });

    setHeaders(data ?? []);
  };

  const reloadEntries = async () => {
    if (!ledgerId) return;

    const { data } = await supabase
      .from("ledger_entries")
      .select("*")
      .eq("ledger_id", ledgerId)
      .order("created_at");

    setEntries(data ?? []);
  };

  /* ---------------------------------------------------------------------- */
  /* CONDITIONAL UI                                                         */
  /* ---------------------------------------------------------------------- */

  if (!activeLedger)
    return (
      <div className="flex flex-1 items-center justify-center opacity-40 text-sm">
        Select a ledger to begin editing.
      </div>
    );

  if (loading)
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="animate-spin w-8 h-8 text-muted-foreground" />
      </div>
    );

  if (!ledger)
    return (
      <div className="text-center py-24 text-muted-foreground">
        Ledger not found.
      </div>
    );

  /* ---------------------------------------------------------------------- */
  /* RENDER                                                                 */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="flex-1 overflow-hidden">
      <div
        ref={scrollContainerRef}
        className="relative flex-1 flex flex-col overflow-auto"
      >
        <div
          className="absolute right-0 top-0 h-full w-[12px] pointer-events-none z-40"
          style={{
            background:
              "linear-gradient(to left, white 40%, rgba(255,255,255,0) 100%)",
          }}
        />

        <LedgerSheet
          ledgerId={ledgerId}
          headers={headers}
          entries={entries}
          setEntries={setEntries}
          reloadHeaders={reloadHeaders}
          reloadEntries={reloadEntries}
          routes={routes}
          reloadRoutes={loadRoutes}
        />
      </div>
    </div>
  );
}
