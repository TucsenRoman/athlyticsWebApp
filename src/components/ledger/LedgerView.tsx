"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

import LedgerToolbar from "../workspace/workspacetoolbar/WorkspaceToolbar";
import LedgerSheet from "./ledgerSheet/LedgerSheet";
import LedgerFooter from "./LedgerFooter";

import type { Tables } from "@/integrations/supabase/types";

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

type Ledger = Tables<"ledgers">;
type LedgerHeader = Tables<"ledger_headers">;
type LedgerEntry = Tables<"ledger_entries">;

interface LedgerViewProps {
  ledgerId?: string; // optional override (WorkspaceEditor)
}

/* -------------------------------------------------------------------------- */
/* LEDGER VIEW                                                                */
/* -------------------------------------------------------------------------- */

export default function LedgerView({ ledgerId: forcedId }: LedgerViewProps) {
  const params = useParams<{ ledgerId: string }>();
  const navigate = useNavigate();

  // Final ID source: props → URL
  const ledgerId = forcedId || params.ledgerId;

  const [title, setTitle] = useState("Untitled Ledger");
  const [ledger, setLedger] = useState<Ledger | null>(null);
  const [headers, setHeaders] = useState<LedgerHeader[]>([]);
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState({ height: 0, top: 0 });

  /* ---------------------------------------------------------------------- */
  /* LOAD LEDGER + HEADERS + ENTRIES                                       */
  /* ---------------------------------------------------------------------- */

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
          .order("order_index");

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
  /* SCROLL TRACKING                                                        */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const updateThumb = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const ratio = clientHeight / scrollHeight;
      const height = Math.max(30, clientHeight * ratio);
      const maxScroll = scrollHeight - clientHeight;
      const top = (scrollTop / maxScroll) * (clientHeight - height) || 0;

      setThumb({ height, top });
    };

    updateThumb();
    el.addEventListener("scroll", updateThumb);
    window.addEventListener("resize", updateThumb);

    return () => {
      el.removeEventListener("scroll", updateThumb);
      window.removeEventListener("resize", updateThumb);
    };
  }, [entries.length, headers.length]);

  /* ---------------------------------------------------------------------- */
  /* CONDITIONAL SCREENS                                                    */
  /* ---------------------------------------------------------------------- */

  if (!ledgerId) {
    return (
      <div className="flex justify-center items-center py-24 text-muted-foreground">
        No ledger selected.
      </div>
    );
  }

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

  /* ---------------------------------------------------------------------- */
  /* RENDER                                                                 */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="flex-1 overflow-hidden">
      <LedgerToolbar ledgerId={ledgerId} title={title} setTitle={setTitle} />

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

      {/* <LedgerFooter /> */}
    </div>
  );
}
