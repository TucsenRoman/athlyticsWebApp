import React, { useRef, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import LedgerHeaders from "./LedgerHeaders";
import LedgerCell from "./LedgerCell";
import LedgerOrb from "./LedgerOrb";

interface LedgerSheetProps {
  ledgerId: string;
  headers: any[];
  entries: any[];
  setEntries: React.Dispatch<React.SetStateAction<any[]>>;
  reloadHeaders: () => Promise<void>;
  reloadEntries: () => Promise<void>;
  onMove: () => void;
}

export default function LedgerSheet({
  ledgerId,
  headers,
  entries,
  setEntries,
  reloadHeaders,
  reloadEntries,
  onMove,
}: LedgerSheetProps) {
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const [compactView, setCompactView] = useState(false);

  /* ----------------------------- ADD OPERATIONS ----------------------------- */

  // ➕ Add new row
  const handleAddRow = async () => {
    const emptyValues = Object.fromEntries(headers.map((h) => [h.id, null]));
    await supabase.from("ledger_entries").insert([
      { ledger_id: ledgerId, entity_name: "", values: emptyValues },
    ]);
    reloadEntries();
  };

  // ➕ Add new column
  const handleAddColumn = async () => {
    await supabase.from("ledger_headers").insert([
      {
        ledger_id: ledgerId,
        name: `Column ${headers.length + 1}`,
        type: "text",
        is_locked: false,
        options: [],
        formula: null,
      },
    ]);
    reloadHeaders();
  };

  /* ------------------------------ VALUE UPDATES ------------------------------ */

  const updateValueLocal = (entryId: string, headerId: string, newVal: any) => {
    // Local UI update
    setEntries((prev) =>
      prev.map((e) =>
        e.id === entryId
          ? { ...e, values: { ...(e.values || {}), [headerId]: newVal } }
          : e
      )
    );

    // Debounced DB save
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const current = entries.find((e) => e.id === entryId);
      if (!current) return;
      await supabase
        .from("ledger_entries")
        .update({
          values: { ...(current.values || {}), [headerId]: newVal },
        })
        .eq("id", entryId);
    }, 400);
  };

  /* ------------------------------ EXPORT HANDLERS ------------------------------ */

  const handleExport = () => {
    const csv =
      headers.map((h) => h.name).join(",") +
      "\n" +
      entries
        .map((e) =>
          headers.map((h) => JSON.stringify(e.values?.[h.id] ?? "")).join(",")
        )
        .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "ledger.csv";
    a.click();
  };

  const handlePrint = () => setTimeout(() => window.print(), 150);
  const handleBulkMode = () => console.log("Bulk mode toggled");
  const handleToggleView = () => setCompactView((v) => !v);

  /* -------------------------------- RENDER -------------------------------- */

  return (
    <div
      id="ledger-container"
      className="overflow-auto w-full h-[calc(100vh-6rem)] bg-white relative"
    >
      {/* ===== HEADER GRID ===== */}
      <div
        className="grid sticky top-0 z-20 bg-gray-100"
        style={{
          gridTemplateColumns: `50px repeat(${headers.length}, minmax(${
            compactView ? 60 : 150
          }px, 1fr)) 50px`,
        }}
      >
        {/* Orb (leftmost) */}
        <div className="border-b border-r flex items-center justify-center w-[50px]">
          <LedgerOrb
            ledgerId={ledgerId}
            onExport={handleExport}
            onBulkMode={handleBulkMode}
            onPrint={handlePrint}
            onToggleView={handleToggleView}
            onMove={onMove}
          />
        </div>

        {/* Header Cells */}
        <LedgerHeaders
          ledgerId={ledgerId}
          headers={headers}
          reloadHeaders={reloadHeaders}
        />

        {/* Add Column (rightmost) */}
        <div
          onClick={handleAddColumn}
          className="border-b border-r flex items-center justify-center text-gray-400 hover:text-primary hover:bg-gray-100 cursor-pointer transition"
          title="Add new column"
        >
          <Plus className="w-4 h-4 rotate-90" />
        </div>
      </div>

      {/* ===== BODY GRID ===== */}
      <div
        className="grid text-sm"
        style={{
          gridTemplateColumns: `50px repeat(${headers.length}, minmax(${
            compactView ? 60 : 150
          }px, 1fr))`,
        }}
      >
        {entries.map((entry, rowIndex) => (
          <React.Fragment key={entry.id}>
            {/* Row Index */}
            <div className="text-center border-b border-r bg-gray-50 p-2 font-medium sticky left-0 z-10 w-[50px]">
              {rowIndex + 1}
            </div>

            {/* Data Cells */}
            {headers.map((h) => (
              <div
                key={`${entry.id}-${h.id}`}
                className="border-b border-r p-1.5 truncate"
              >
                <LedgerCell
                  entryId={entry.id}
                  header={h}
                  value={entry.values?.[h.id]}
                  onChange={(val) => updateValueLocal(entry.id, h.id, val)}
                />
              </div>
            ))}
          </React.Fragment>
        ))}

        {/* ➕ Add Row */}
        <div
          onClick={handleAddRow}
          className="col-span-full border-t bg-gray-50 text-gray-400 hover:text-primary hover:bg-gray-100 p-2 text-center cursor-pointer transition font-medium"
          title="Add new row"
        >
          <Plus className="w-4 h-4 mx-auto" />
        </div>
      </div>
    </div>
  );
}
