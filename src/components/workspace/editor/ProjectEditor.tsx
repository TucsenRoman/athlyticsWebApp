"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

import LedgerSheet from "@/components/ledger/ledgerSheet/LedgerSheet";
import EditorFooter from "./EditorFooter";

import type { Tables } from "@/integrations/supabase/types";

interface ProjectEditorProps {
  ledgerId: string;
  setLedgerId: React.Dispatch<React.SetStateAction<string>>;
  programId: number;
}

type Ledger = Tables<"ledgers">;
type LedgerHeader = Tables<"ledger_headers">;
type LedgerEntry = Tables<"ledger_entries">;

export default function ProjectEditor({
  ledgerId,
  setLedgerId,
  programId,
}: ProjectEditorProps) {
  const [ledger, setLedger] = useState<Ledger | null>(null);
  const [headers, setHeaders] = useState<LedgerHeader[]>([]);
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [ledgers, setLedgers] = useState<{ id: string; name: string }[]>([]);

  /* ---------------------------------------------------------------------- */
  /* SCROLLBAR THUMB                                                        */
  /* ---------------------------------------------------------------------- */
  const scrollRef = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState({ height: 0, top: 0 });

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const update = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const ratio = clientHeight / scrollHeight;
      const height = Math.max(30, clientHeight * ratio);
      const maxScroll = scrollHeight - clientHeight;
      const top = (scrollTop / maxScroll) * (clientHeight - height) || 0;

      setThumb({ height, top });
    };

    update();
    el.addEventListener("scroll", update);
    window.addEventListener("resize", update);

    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [headers.length, entries.length]);

  /* ---------------------------------------------------------------------- */
  /* LOAD ALL LEDGERS FOR THIS PROGRAM                                      */
  /* ---------------------------------------------------------------------- */
  useEffect(() => {
    if (!programId) return;

    const load = async () => {
      const { data } = await supabase
        .from("ledgers")
        .select("id, name")
        .eq("program_id", programId)
        .order("created_at");

      setLedgers(data ?? []);
    };

    load();
  }, [programId]);

  /* ---------------------------------------------------------------------- */
  /* LOAD ACTIVE LEDGER + HEADERS + ENTRIES                                 */
  /* ---------------------------------------------------------------------- */
  useEffect(() => {
    if (!ledgerId) {
      setLedger(null);
      setHeaders([]);
      setEntries([]);
      return;
    }

    const load = async () => {
      setLoading(true);

      const { data: ledgerData } = await supabase
        .from("ledgers")
        .select("*")
        .eq("id", ledgerId)
        .maybeSingle();

      const { data: headerData } = await supabase
        .from("ledger_headers")
        .select("*")
        .eq("ledger_id", ledgerId)
        .order("order_index");

      const { data: entryData } = await supabase
        .from("ledger_entries")
        .select("*")
        .eq("ledger_id", ledgerId)
        .order("created_at");

      setLedger(ledgerData);
      setHeaders(headerData || []);
      setEntries(entryData || []);

      loadRoutes();
      setLoading(false);
    };

    load();
  }, [ledgerId]);

  /* ---------------------------------------------------------------------- */
  /* ROUTES                                                                 */
  /* ---------------------------------------------------------------------- */
  const loadRoutes = async () => {
    if (!ledgerId) return;

    const { data } = await supabase
      .from("ledger_routes")
      .select("*")
      .or(`source_ledger_id.eq.${ledgerId},target_ledger_id.eq.${ledgerId}`)
      .order("created_at");

    setRoutes(data || []);
  };

  /* ---------------------------------------------------------------------- */
  /* RELOAD HELPERS                                                         */
  /* ---------------------------------------------------------------------- */
  const reloadHeaders = async () => {
    const { data } = await supabase
      .from("ledger_headers")
      .select("*")
      .eq("ledger_id", ledgerId)
      .order("order_index");

    setHeaders(data || []);
  };

  const reloadEntries = async () => {
    const { data } = await supabase
      .from("ledger_entries")
      .select("*")
      .eq("ledger_id", ledgerId)
      .order("created_at");

    setEntries(data || []);
  };

  /* ---------------------------------------------------------------------- */
  /* CRUD: CREATE + DELETE LEDGERS                                          */
  /* ---------------------------------------------------------------------- */
  const handleCreateLedger = async () => {
    if (!programId) return;

    const newName = `New Ledger ${ledgers.length + 1}`;

    const { data, error } = await supabase
      .from("ledgers")
      .insert({
        name: newName,
        program_id: programId,
      })
      .select()
      .maybeSingle();

    if (error) return console.error(error);

    setLedgers((prev) => [...prev, data]);
    setLedgerId(data.id);
  };

  const handleDeleteLedger = async (id: string) => {
    if (!id) return;

    await supabase.from("ledgers").delete().eq("id", id);

    const remaining = ledgers.filter((l) => l.id !== id);
    setLedgers(remaining);

    setLedgerId(remaining[0]?.id || "");
  };

  /* ---------------------------------------------------------------------- */
  /* UI STATE FLAGS                                                         */
  /* ---------------------------------------------------------------------- */
  const noLedgerSelected = !ledgerId;
  const ledgerMissing = ledgerId && !ledger && !loading;

  /* ---------------------------------------------------------------------- */
  /* RENDER                                                                 */
  /* ---------------------------------------------------------------------- */
  return (
    <div className="flex flex-col flex-1 min-h-0 bg-background">

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col">
        {noLedgerSelected ? (
          <div className="flex justify-center items-center flex-1 py-24 text-muted-foreground">
            No ledger selected.
          </div>
        ) : loading ? (
          <div className="flex justify-center items-center flex-1 py-24 text-muted-foreground">
            Loading...
          </div>
        ) : ledgerMissing ? (
          <div className="flex justify-center items-center flex-1 py-24 text-muted-foreground">
            Ledger not found.
          </div>
        ) : (
          <div ref={scrollRef} className="relative flex-1 overflow-auto">
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
        )}
      </div>

      {/* FOOTER ALWAYS RENDERS */}
      <EditorFooter
        openLedgers={ledgers}
        activeLedgerId={ledgerId}
        setActiveLedgerId={setLedgerId}
        onCreateLedger={handleCreateLedger}
        onManageRoutes={() => console.log("manage routes")}
        onSettings={() => console.log("settings")}
        onDelete={handleDeleteLedger}
        programId={programId}
      />
    </div>
  );
}
