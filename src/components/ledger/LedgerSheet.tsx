// src/components/ledger/LedgerSheet.tsx
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import LedgerHeaders from "./LedgerHeaders";
import LedgerCell from "./LedgerCell";
import LedgerOrb from "./LedgerOrb";
import RowsUtilityOrb from "./RowsUtilityOrb";

export default function LedgerSheet({
  ledgerId,
  headers,
  entries,
  setEntries,
  reloadHeaders,
  reloadEntries,
}) {
  /* ----------------------------- Local States ----------------------------- */
  const [compactView, setCompactView] = useState(false);
  const [pinnedColumns, setPinnedColumns] = useState<string[]>([]);
  const [pinMode, setPinMode] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);

  // ✅ Orb open state now controlled here (won’t reset)
  const [rowsOrbOpen, setRowsOrbOpen] = useState(false);

  /* --------------------------- Refs and constants --------------------------- */
  const scrollRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef<HTMLDivElement>(null);
  const hScrollRef = useRef<HTMLDivElement>(null);
  const vScrollRef = useRef<HTMLDivElement>(null);

  const [originalEntries, setOriginalEntries] = useState(entries);
  useEffect(() => setOriginalEntries(entries), [entries]);

  const pinnedHeaders = headers.filter((h) => pinnedColumns.includes(h.id));
  const scrollHeaders = headers.filter((h) => !pinnedColumns.includes(h.id));

  const COL_WIDTH = compactView ? 60 : 150;
  const ROW_HEIGHT = 40;

  /* --------------------------- Scroll Synchronization --------------------------- */
  useEffect(() => {
    const grid = scrollRef.current;
    const header = headerRef.current;
    const pinned = pinnedRef.current;
    if (!grid || !header || !pinned) return;

    const handleScroll = () => {
      header.scrollLeft = grid.scrollLeft;
      pinned.scrollTop = grid.scrollTop;
      if (hScrollRef.current) hScrollRef.current.scrollLeft = grid.scrollLeft;
      if (vScrollRef.current) vScrollRef.current.scrollTop = grid.scrollTop;
    };

    grid.addEventListener("scroll", handleScroll, { passive: true });
    return () => grid.removeEventListener("scroll", handleScroll);
  }, []);

  /* --------------------------- Pin Toggle --------------------------- */
  const handleTogglePin = (id: string) => {
    setPinnedColumns((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  /* ---------------------------- Cell Updates ---------------------------- */
  const updateValueLocal = useCallback(
    async (entryId: string, headerId: string, newVal: any) => {
      setEntries((prev) =>
        prev.map((entry) =>
          entry.id === entryId
            ? {
                ...entry,
                values: { ...(entry.values || {}), [headerId]: newVal },
              }
            : entry
        )
      );

      const target = entries.find((e) => e.id === entryId);
      const updatedValues = { ...(target?.values || {}), [headerId]: newVal };

      try {
        const { error } = await supabase
          .from("ledger_entries")
          .update({ values: updatedValues })
          .eq("id", entryId);
        if (error) throw error;
      } catch (err: any) {
        console.error("❌ Failed to update entry:", err.message);
      }
    },
    [entries, setEntries]
  );

  /* ---------------------------- Row Actions ---------------------------- */
  const handleAddRow = useCallback(async () => {
    const emptyValues = Object.fromEntries(headers.map((h) => [h.id, ""]));
    await supabase.from("ledger_entries").insert([
      { ledger_id: ledgerId, entity_name: "", values: emptyValues },
    ]);
    reloadEntries();
  }, [headers, ledgerId, reloadEntries]);

  const handleAddBulkRows = useCallback(
    async (count: number) => {
      if (count <= 0) return;
      const emptyValues = Object.fromEntries(headers.map((h) => [h.id, ""]));
      const newRows = Array.from({ length: count }).map(() => ({
        ledger_id: ledgerId,
        entity_name: "",
        values: emptyValues,
      }));
      await supabase.from("ledger_entries").insert(newRows);
      reloadEntries();
    },
    [headers, ledgerId, reloadEntries]
  );

  const handleDeleteLastRow = useCallback(async () => {
    if (entries.length === 0) return;
    const last = entries[entries.length - 1];
    await supabase.from("ledger_entries").delete().eq("id", last.id);
    reloadEntries();
  }, [entries, reloadEntries]);

  /* ---------------------------- Bulk Select Logic ---------------------------- */
  const toggleRowSelect = useCallback(
    (id: string, index: number, event?: React.MouseEvent<HTMLDivElement>) => {
      if (!bulkMode) return;
      const isShift = event?.shiftKey;
      const isCtrl = event?.metaKey || event?.ctrlKey;

      if (isShift && lastSelectedIndex !== null) {
        const start = Math.min(lastSelectedIndex, index);
        const end = Math.max(lastSelectedIndex, index);
        const idsInRange = entries.slice(start, end + 1).map((e) => e.id);
        setSelectedRows((prev) => Array.from(new Set([...prev, ...idsInRange])));
      } else if (isCtrl) {
        setSelectedRows((prev) =>
          prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
        );
        setLastSelectedIndex(index);
      } else {
        setSelectedRows([id]);
        setLastSelectedIndex(index);
      }
    },
    [bulkMode, lastSelectedIndex, entries]
  );

  const handleCheckboxToggle = useCallback((id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  }, []);

  const selectAll = useCallback(() => {
    if (!bulkMode) return;
    if (selectedRows.length === entries.length) setSelectedRows([]);
    else setSelectedRows(entries.map((e) => e.id));
  }, [bulkMode, selectedRows, entries]);

  const deleteSelected = useCallback(async () => {
    if (!bulkMode || selectedRows.length === 0) return;
    await supabase.from("ledger_entries").delete().in("id", selectedRows);
    setSelectedRows([]);
    reloadEntries();
  }, [bulkMode, selectedRows, reloadEntries]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && bulkMode) {
        setBulkMode(false);
        setSelectedRows([]);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [bulkMode]);

  /* ----------------------- Memoized RowsUtilityOrb ----------------------- */
  const rowsUtilityOrb = useMemo(
    () => (
      <RowsUtilityOrb
        key="rows-utility-orb"
        ledgerId={ledgerId}
        open={rowsOrbOpen}
        setOpen={setRowsOrbOpen}
        onAddRow={handleAddRow}
        onBulkAddRows={handleAddBulkRows}
        onDeleteLastRow={handleDeleteLastRow}
        onBulkMode={() => setBulkMode((v) => !v)}
        bulkModeActive={bulkMode}
        allSelected={selectedRows.length === entries.length}
        onSelectAll={selectAll}
        onDeleteSelected={deleteSelected}
        onExitBulk={() => {
          setBulkMode(false);
          setSelectedRows([]);
        }}
      />
    ),
    [
      ledgerId,
      rowsOrbOpen,
      bulkMode,
      selectedRows.length,
      entries.length,
      handleAddRow,
      handleAddBulkRows,
      handleDeleteLastRow,
      selectAll,
      deleteSelected,
    ]
  );

  /* ========================================================================= */
  /*                                   RENDER                                  */
  /* ========================================================================= */
  return (
    <div className="relative w-full h-[calc(100vh-6rem)] flex flex-col overflow-hidden bg-white">
      {/* ====================== HEADER ====================== */}
      <div
        className="relative z-30"
        style={{ height: "40px", background: "#f7f7f7" }}
      >
        <div className="absolute top-0 left-0 h-full z-30 flex">
          {/* Ledger Orb */}
          <div className="w-[50px] h-full flex items-center justify-center border-r border-gray-100">
            <LedgerOrb
              ledgerId={ledgerId}
              onExportCSV={() => {}}
              onPrint={() => window.print()}
              onToggleView={() => setCompactView((v) => !v)}
              onTogglePinMode={() => setPinMode((v) => !v)}
            />
          </div>

          {/* Pinned Headers */}
          {pinnedHeaders.map((h, index) => (
            <div
              key={h.id}
              className="absolute top-0 flex items-center"
              style={{
                width: `${COL_WIDTH}px`,
                left: `${index}px`,
                background: "#f7f7f7",
              }}
            >
              <LedgerHeaders
                ledgerId={ledgerId}
                headers={[h]}
                reloadHeaders={reloadHeaders}
                pinnedColumns={pinnedColumns}
                onTogglePin={handleTogglePin}
                pinMode={pinMode}
              />
            </div>
          ))}
        </div>

        {/* Scrollable Header */}
        <div ref={headerRef} className="relative overflow-hidden h-full z-10">
          <div className="flex min-w-max h-full">
            <div
              style={{
                width: `${50 + pinnedHeaders.length * COL_WIDTH}px`,
                flexShrink: 0,
              }}
            />
            {scrollHeaders.map((h) => (
              <div
                key={h.id}
                className="flex items-center h-full"
                style={{ width: `${COL_WIDTH}px`, background: "#f7f7f7" }}
              >
                <LedgerHeaders
                  ledgerId={ledgerId}
                  headers={[h]}
                  reloadHeaders={reloadHeaders}
                  pinnedColumns={pinnedColumns}
                  onTogglePin={handleTogglePin}
                  pinMode={pinMode}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ====================== BODY ====================== */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* === Pinned Columns === */}
        <div
          ref={pinnedRef}
          className="sticky left-0 z-20 overflow-visible"
          style={{
            background: "white",
            width: `${50 + pinnedHeaders.length * COL_WIDTH}px`,
          }}
        >
          <div className="flex">
            {/* Row numbers + Orb */}
            <div
              className="grid bg-gray-50"
              style={{
                width: "50px",
                gridTemplateRows: `repeat(${entries.length + 1}, ${ROW_HEIGHT}px)`,
                borderRight: "1px solid rgba(0,0,0,0.05)",
              }}
            >
              {entries.map((entry, i) => {
                const isSelected = selectedRows.includes(entry.id);
                return (
                  <div
                    key={entry.id}
                    onClick={(e) => {
                      if (!bulkMode) toggleRowSelect(entry.id, i, e);
                    }}
                    className={`flex items-center justify-center text-sm font-medium select-none transition-colors ${
                      isSelected
                        ? "bg-orange-100 text-orange-600"
                        : bulkMode
                        ? "hover:bg-orange-50"
                        : ""
                    }`}
                    style={{
                      height: `${ROW_HEIGHT}px`,
                      borderBottom: "1px solid rgba(0,0,0,0.05)",
                    }}
                  >
                    {bulkMode ? (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleCheckboxToggle(entry.id);
                        }}
                        className="accent-orange-500 cursor-pointer"
                      />
                    ) : (
                      i + 1
                    )}
                  </div>
                );
              })}

              {/* Bottom-left Row Utility Orb */}
              <div
                className="flex items-center justify-center bg-gray-50 border-t border-r border-gray-200"
                style={{ height: `${ROW_HEIGHT}px`, width: "50px" }}
              >
                {rowsUtilityOrb}
              </div>
            </div>

            {/* Pinned Cells */}
            <div className="relative flex">
              {pinnedHeaders.map((h, i) => (
                <div
                  key={h.id}
                  className="grid"
                  style={{
                    width: `${COL_WIDTH}px`,
                    gridTemplateRows: `repeat(${entries.length + 1}, ${ROW_HEIGHT}px)`,
                    transform: `translateX(${i * COL_WIDTH}px)`,
                  }}
                >
                  {entries.map((entry) => (
                    <div
                      key={`${entry.id}-${h.id}`}
                      className={`flex items-center p-1.5 truncate transition-colors ${
                        selectedRows.includes(entry.id)
                          ? "bg-orange-50"
                          : "bg-white"
                      }`}
                      style={{
                        height: `${ROW_HEIGHT}px`,
                        borderBottom: "1px solid rgba(0,0,0,0.05)",
                      }}
                    >
                      <LedgerCell
                        entryId={entry.id}
                        header={h}
                        value={entry.values?.[h.id]}
                        onChange={(val) => updateValueLocal(entry.id, h.id, val)}
                      />
                    </div>
                  ))}
                  <div style={{ height: `${ROW_HEIGHT}px` }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* === Scrollable Grid === */}
        <div ref={scrollRef} className="flex-1 overflow-auto relative">
          <div className="flex flex-col min-w-max">
            <div className="flex">
              {scrollHeaders.map((h) => (
                <div
                  key={h.id}
                  className="grid"
                  style={{
                    width: `${COL_WIDTH}px`,
                    gridTemplateRows: `repeat(${entries.length}, ${ROW_HEIGHT}px)`,
                  }}
                >
                  {entries.map((entry, i) => (
                    <div
                      key={`${entry.id}-${h.id}`}
                      onClick={(e) => toggleRowSelect(entry.id, i, e)}
                      className={`flex items-center p-1.5 truncate cursor-pointer transition-colors ${
                        selectedRows.includes(entry.id)
                          ? "bg-orange-50"
                          : "bg-white"
                      }`}
                      style={{
                        height: `${ROW_HEIGHT}px`,
                        borderBottom: "1px solid rgba(0,0,0,0.05)",
                      }}
                    >
                      <LedgerCell
                        entryId={entry.id}
                        header={h}
                        value={entry.values?.[h.id]}
                        onChange={(val) =>
                          updateValueLocal(entry.id, h.id, val)
                        }
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
