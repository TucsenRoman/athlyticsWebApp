import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import LedgerHeaders from "./LedgerHeaders";
import LedgerCell from "./LedgerCell";
import LedgerOrb from "./LedgerOrb";
import { supabase } from "@/integrations/supabase/client";

interface LedgerSheetProps {
  ledgerId: string;
  headers: any[];
  entries: any[];
  setEntries: React.Dispatch<React.SetStateAction<any[]>>;
  reloadHeaders: () => Promise<void>;
  reloadEntries: () => Promise<void>;
}

export default function LedgerSheet({
  ledgerId,
  headers,
  entries,
  setEntries,
  reloadHeaders,
  reloadEntries,
}: LedgerSheetProps) {
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const [compactView, setCompactView] = useState(false);

  // ➕ Add new empty row
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

  // ⚡ Local update
  const updateValueLocal = (entryId: string, headerId: string, newVal: any) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.id === entryId
          ? { ...e, values: { ...(e.values || {}), [headerId]: newVal } }
          : e
      )
    );
  };

  // 💾 Debounced Supabase update
  const saveValue = (entryId: string, headerId: string, newVal: any) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const currentEntry = entries.find((e) => e.id === entryId);
      if (!currentEntry) return;
      await supabase
        .from("ledger_entries")
        .update({
          values: { ...(currentEntry.values || {}), [headerId]: newVal },
        })
        .eq("id", entryId);
    }, 400);
  };

  // 🧼 Keep entries clean when headers change
  useEffect(() => {
    setEntries((prevEntries) =>
      prevEntries.map((entry) => {
        const prevValues = entry.values || {};
        const newValues: Record<string, any> = {};
        headers.forEach((h) => {
          newValues[h.id] =
            prevValues[h.id] !== undefined ? prevValues[h.id] : null;
        });
        return { ...entry, values: newValues };
      })
    );
  }, [headers, setEntries]);

  // 🔄 Auto-sync on header change
  useEffect(() => {
    if (!headers.length || !entries.length) return;
    const timeout = setTimeout(async () => {
      for (const entry of entries) {
        await supabase
          .from("ledger_entries")
          .update({ values: entry.values })
          .eq("id", entry.id);
      }
    }, 600);
    return () => clearTimeout(timeout);
  }, [headers, entries]);

  // 🧹 Clear all entries
  const handleClearAll = async () => {
    if (!confirm("Clear all rows?")) return;
    await supabase.from("ledger_entries").delete().eq("ledger_id", ledgerId);
    reloadEntries();
  };

  // 📤 Export CSV
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
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ledger.csv";
    a.click();
  };

  // 👥 Bulk mode (placeholder for multi-select logic)
  const handleBulkMode = () => {
    console.log("Bulk mode toggled");
  };

  // 🖨️ Print handler — auto closes orb
  const handlePrint = () => {
    setTimeout(() => window.print(), 150);
  };

  // 👁️ Toggle Compact / Full View
  const handleToggleView = () => {
    setCompactView((v) => !v);
  };

  return (
    <div className="overflow-auto w-full h-[calc(100vh-6rem)] bg-white relative">
      <div
        className="grid text-sm select-none"
        style={{
          gridTemplateColumns: `50px repeat(${headers.length}, minmax(${
            compactView ? 60 : 150
          }px, 1fr)) 40px`,
        }}
      >
        {/* 🧭 Ledger Command Orb (top-left corner) */}
        <div className="sticky top-0 left-0 z-30 bg-gray-100 border-b border-r flex items-center justify-center">
          <LedgerOrb
            onExport={handleExport}
            onBulkMode={handleBulkMode}
            onPrint={handlePrint}
            onToggleView={handleToggleView}
          />
        </div>

        {/* 🧠 Header Row */}
        <LedgerHeaders
          ledgerId={ledgerId}
          headers={headers}
          setHeaders={setEntries as any}
          reloadHeaders={reloadHeaders}
        />

        {/* 🧱 Data Rows */}
        {entries.map((entry, rowIndex) => (
          <React.Fragment key={entry.id}>
            {/* Row Index */}
            <div className="text-center border-b border-r bg-gray-50 p-2 font-medium sticky left-0 z-10">
              {rowIndex + 1}
            </div>

            {/* Cells */}
            {headers.map((h) => (
              <div
                key={`${entry.id}-${h.id}`}
                className="border-b border-r p-1.5 truncate"
              >
                <LedgerCell
                  key={`${entry.id}-${h.id}`}
                  entryId={entry.id}
                  header={h}
                  value={entry.values?.[h.id]}
                  onChange={(newVal) => {
                    updateValueLocal(entry.id, h.id, newVal);
                    saveValue(entry.id, h.id, newVal);
                  }}
                />
              </div>
            ))}

            {/* End filler cell */}
            <div className="border-b border-r bg-gray-50" />
          </React.Fragment>
        ))}

        {/* ➕ Add Row Button */}
        <div
          onClick={handleAddRow}
          className="border-r bg-gray-50 text-gray-400 hover:text-primary hover:bg-gray-100 p-2 text-center cursor-pointer transition font-medium"
          title="Add new row"
        >
          <Plus className="w-4 h-4 mx-auto" />
        </div>
      </div>
    </div>
  );
}
