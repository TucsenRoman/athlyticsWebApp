import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HeaderLayout from "@/components/header/HeaderLayout";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import LedgerToolbar from "./LedgerToolbar";
import LedgerSheet from "./LedgerSheet";
import type { Tables } from "@/integrations/supabase/types";

type Ledger = Tables<"ledgers">;
type LedgerHeader = Tables<"ledger_headers">;
type LedgerEntry = Tables<"ledger_entries">;

export default function LedgerView() {
  const { ledgerId } = useParams<{ ledgerId: string }>();
  const navigate = useNavigate();

  const [ledger, setLedger] = useState<Ledger | null>(null);
  const [headers, setHeaders] = useState<LedgerHeader[]>([]);
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // 🧭 Load ledger + related data
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
      } catch (err) {
        toast.error("Failed to load ledger data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [ledgerId]);

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

  if (loading) {
    return (
      <HeaderLayout>
        <div className="flex justify-center items-center py-24">
          <Loader2 className="animate-spin w-8 h-8 text-muted-foreground" />
        </div>
      </HeaderLayout>
    );
  }

  if (!ledger) {
    return (
      <HeaderLayout>
        <div className="text-center py-24 text-muted-foreground">
          Ledger not found.
        </div>
      </HeaderLayout>
    );
  }

  return (
    <HeaderLayout>
      <LedgerToolbar onBack={() => navigate(-1)} />
      <LedgerSheet
        ledgerId={ledgerId!}
        headers={headers}
        entries={entries}
        setEntries={setEntries}
        reloadHeaders={reloadHeaders}
        reloadEntries={reloadEntries}
      />
    </HeaderLayout>
  );
}