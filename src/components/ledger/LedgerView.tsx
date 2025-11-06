import React, { useEffect, useRef, useState } from "react";
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

  // refs and scroll state — declared early (hooks must always run)
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState({ height: 0, top: 0 });

  /* ------------------------------ Load data ------------------------------ */
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

  /* ------------------------------ Reloaders ------------------------------ */
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

  /* --------------------------- Scroll tracking --------------------------- */
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const updateThumb = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const ratio = clientHeight / scrollHeight;
      const thumbHeight = Math.max(30, clientHeight * ratio);
      const maxScrollTop = scrollHeight - clientHeight;
      const top = (scrollTop / maxScrollTop) * (clientHeight - thumbHeight) || 0;
      setThumb({ height: thumbHeight, top });
    };

    updateThumb();
    el.addEventListener("scroll", updateThumb);
    window.addEventListener("resize", updateThumb);
    return () => {
      el.removeEventListener("scroll", updateThumb);
      window.removeEventListener("resize", updateThumb);
    };
  }, [entries.length, headers.length]);

  /* ------------------------------ Conditional UI ------------------------------ */
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

  /* ------------------------------ Render ------------------------------ */
  return (
    <div className="flex-1 overflow-hidden pb-28">
      {/* <LedgerToolbar ledgerId={ledgerId} title={title} setTitle={setTitle} /> */}

      {/* Scroll wrapper */}
      <div
        ref={scrollContainerRef}
        className="relative flex-1 flex flex-col overflow-auto"
      >
        {/* Mask the native scrollbar visually */}
        <div
          className="absolute right-0 top-0 h-full w-[12px] pointer-events-none z-40"
          style={{
            background:
              "linear-gradient(to left, white 40%, rgba(255,255,255,0) 100%)",
          }}
        />

        <LedgerSheet
          ledgerId={ledgerId!}
          headers={headers}
          entries={entries}
          setEntries={setEntries}
          reloadHeaders={reloadHeaders}
          reloadEntries={reloadEntries}
        />

        {/* Orange thumb overlay */}
        <div
          className="absolute right-[2px] top-0 w-[6px] rounded-full bg-[hsl(var(--primary))] z-50 transition-all"
          style={{
            height: `${thumb.height}px`,
            transform: `translateY(${thumb.top}px)`,
            opacity: entries.length > 10 ? 0.6 : 0,
          }}
        />
      </div>

      {/* <LedgerFooter /> */}
    </div>
  );
}
