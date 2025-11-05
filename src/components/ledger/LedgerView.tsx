import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import LedgerToolbar from "./LedgerToolbar";
import LedgerSheet from "./LedgerSheet";
import LedgerFooter from "./LedgerFooter";
import type { Tables } from "@/integrations/supabase/types";

type Ledger = Tables<"ledgers">;
type LedgerHeader = Tables<"ledger_headers">;
type LedgerEntry = Tables<"ledger_entries">;

export default function LedgerView() {
  const { ledgerId } = useParams<{ ledgerId: string }>();
  const navigate = useNavigate();

  const [title, setTitle] = useState("Untitled Ledger");
  const [ledger, setLedger] = useState<Ledger | null>(null);
  const [headers, setHeaders] = useState<LedgerHeader[]>([]);
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // ===== LOAD LEDGER DATA =====
  useEffect(() => {
    if (!ledgerId) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const { data: ledgerData } = await supabase
          .from("ledgers")
          .select("*")
          .eq("id", ledgerId)
          .single();

        const { data: headerData } = await supabase
          .from("ledger_headers")
          .select("*")
          .eq("ledger_id", ledgerId)
          .order("created_at");

        const { data: entryData } = await supabase
          .from("ledger_entries")
          .select("*")
          .eq("ledger_id", ledgerId)
          .order("created_at");

        setLedger(ledgerData);
        setHeaders(headerData || []);
        setEntries(entryData || []);
        if (ledgerData?.name) setTitle(ledgerData.name);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load ledger data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [ledgerId]);

  // ===== RELOAD HELPERS =====
  const reloadHeaders = async () => {
    const { data } = await supabase
      .from("ledger_headers")
      .select("*")
      .eq("ledger_id", ledgerId)
      .order("created_at");
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

  // ===== MOVE & DUPLICATE HANDLERS =====
  const handleMoveLedger = async () => {
    if (!ledger) return;
    try {
      // You can open your move modal here if desired
      toast.info("Move ledger modal would open here.");
      // Example supabase call:
      // await supabase.from("ledgers").update({ program_id: newProgramId }).eq("id", ledger.id);
    } catch (err) {
      console.error(err);
      toast.error("Failed to move ledger.");
    }
  };

  // ===== PAGE STATE =====
  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="animate-spin w-8 h-8 text-muted-foreground" />
      </div>
    );
  }

  if (!ledger) {
    return (
      <div className="text-center py-24 text-muted-foreground">
        Ledger not found.
      </div>
    );
  }

  // ===== RENDER =====
  return (
    <div className="flex-1 overflow-auto pb-28">
      <LedgerToolbar
        ledgerId={ledgerId}
        title={title}
        setTitle={setTitle}
      />

      <div className="flex-1 flex flex-col">
        <LedgerSheet
          ledgerId={ledgerId!}
          headers={headers}
          entries={entries}
          setEntries={setEntries}
          reloadHeaders={reloadHeaders}
          reloadEntries={reloadEntries}
          onMove={handleMoveLedger}
        />
      </div>

      {/* 🧭 LedgerFooter likely contains LedgerOrb */}
      <LedgerFooter />
    </div>
  );
}