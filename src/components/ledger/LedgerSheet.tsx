import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import LedgerHeaders from "./LedgerHeaders";
import LedgerCell from "./LedgerCell";
import LedgerMenu from "./LedgerMenu";
import ColumnsMenu from "./ColumnsMenu";
import RowsMenu from "./RowsMenu";

export default function LedgerSheet({
  ledgerId,
  headers,
  entries,
  setEntries,
  reloadHeaders,
  reloadEntries,
}) {
  /* ----------------------------- Local State ----------------------------- */
  const [compactView, setCompactView] = useState(false);
  const [pinnedColumns, setPinnedColumns] = useState<string[]>([]);
  const [pinMode, setPinMode] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
  const [rowsOrbOpen, setRowsOrbOpen] = useState(false);
  const [columnsMenuOpen, setColumnsMenuOpen] = useState(false);

  // --- NEW COLUMN BULK MODE ---
  const [columnBulkMode, setColumnBulkMode] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);

  /* ----------------------------- Refs ----------------------------- */
  const scrollRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef<HTMLDivElement>(null);

  const leftPinnedHeaders = headers.filter((h) => pinnedColumns.includes(h.id));
  const scrollHeaders = headers.filter((h) => !pinnedColumns.includes(h.id));

  const COL_WIDTH = compactView ? 60 : 150;
  const ROW_HEIGHT = 40;
  const pinnedWidth = 50 + leftPinnedHeaders.length * COL_WIDTH;
  const contentHeight = entries.length * ROW_HEIGHT;

  /* --------------------------- Scroll Sync --------------------------- */
  useEffect(() => {
    const grid = scrollRef.current;
    const header = headerRef.current;
    const pinned = pinnedRef.current;
    if (!grid || !header || !pinned) return;

    const headerInner = header.querySelector("div"); // inner flex container

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!grid || !headerInner || !pinnedRef.current) return;
          // horizontally move unpinned headers
          headerInner.style.transform = `translateX(${-grid.scrollLeft}px)`;
          // vertically move pinned rows
          pinnedRef.current.style.transform = `translateY(${-grid.scrollTop}px)`;
          ticking = false;
        });
        ticking = true;
      }
    };

    grid.addEventListener("scroll", handleScroll, { passive: true });
    return () => grid.removeEventListener("scroll", handleScroll);
  }, []);

  /* --------------------------- Helpers --------------------------- */
  const handleTogglePin = (id: string) => {
    setPinnedColumns((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const togglePinMode = useCallback(() => {
    setPinMode((prev) => !prev);
  }, []);

  const updateValueLocal = useCallback(
    async (entryId: string, headerId: string, newVal: any) => {
      setEntries((prev) =>
        prev.map((entry) =>
          entry.id === entryId
            ? { ...entry, values: { ...(entry.values || {}), [headerId]: newVal } }
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

  /* ---------------------- Row Multi-select ---------------------- */
  const toggleCheckbox = useCallback(
    (id: string, index: number, event: React.ChangeEvent<HTMLInputElement>) => {
      if (!bulkMode) return;
      const shift = event.nativeEvent instanceof MouseEvent && event.nativeEvent.shiftKey;
      setSelectedRows((prev) => {
        let next = [...prev];
        if (shift && lastSelectedIndex !== null) {
          const start = Math.min(lastSelectedIndex, index);
          const end = Math.max(lastSelectedIndex, index);
          const ids = entries.slice(start, end + 1).map((e) => e.id);
          for (const rid of ids) if (!next.includes(rid)) next.push(rid);
        } else {
          if (next.includes(id)) next = next.filter((r) => r !== id);
          else next.push(id);
        }
        setLastSelectedIndex(index);
        return next;
      });
    },
    [bulkMode, lastSelectedIndex, entries]
  );

/* --------------------------- Row & Column Actions --------------------------- */
const handleAddRow = useCallback(async () => {
  const emptyValues = Object.fromEntries(headers.map((h) => [h.id, ""]));
  try {
    const { error } = await supabase
      .from("ledger_entries")
      .insert([{ ledger_id: ledgerId, entity_name: "", values: emptyValues }]);

    if (error) throw error;
    reloadEntries();
  } catch (err: any) {
    console.error("❌ Add row failed:", err.message);
  }
}, [headers, ledgerId, reloadEntries]);

const handleDeleteLastRow = useCallback(async () => {
  if (entries.length === 0) return;
  const last = entries[entries.length - 1];

  // 🔒 Protection: check if any cell in the row has content
  const hasData =
    last.entity_name?.trim() ||
    Object.values(last.values || {}).some(
      (v) => v !== null && String(v).trim() !== ""
    );

  if (hasData) {
    const confirmDelete = window.confirm(
      "⚠️ The last row contains data. Are you sure you want to delete it?"
    );
    if (!confirmDelete) return;
  }

  try {
    const { error } = await supabase.from("ledger_entries").delete().eq("id", last.id);
    if (error) throw error;
    reloadEntries();
  } catch (err: any) {
    console.error("❌ Delete last row failed:", err.message);
  }
}, [entries, reloadEntries]);

const handleAddColumn = useCallback(async () => {
  try {
    const { error } = await supabase
      .from("ledger_headers")
      .insert([{ ledger_id: ledgerId, name: "New Column", type: "text" }]);
    if (error) throw error;
    reloadHeaders();
  } catch (err: any) {
    console.error("❌ Add column failed:", err.message);
  }
}, [ledgerId, reloadHeaders]);

const handleDeleteLastColumn = useCallback(async () => {
  if (headers.length === 0) return;
  const last = headers[headers.length - 1];

  // 🔒 Protection: check if any entry has data in that column
  const columnId = last.id;
  const columnUsed = entries.some(
    (e) => e.values?.[columnId] && String(e.values[columnId]).trim() !== ""
  );

  if (columnUsed) {
    const confirmDelete = window.confirm(
      `⚠️ The column "${last.name}" contains data. Are you sure you want to delete it?`
    );
    if (!confirmDelete) return;
  }

  try {
    const { error } = await supabase.from("ledger_headers").delete().eq("id", columnId);
    if (error) throw error;
    reloadHeaders();
  } catch (err: any) {
    console.error("❌ Delete last column failed:", err.message);
  }
}, [headers, entries, reloadHeaders]);

  /* --------------------------- Column Pin Mode Hook --------------------------- */
  const handleColumnPinModeToggle = () => {
    // Triggered from ColumnsMenu pin button
    togglePinMode();
  };

  /* --------------------------- Bulk Row Actions --------------------------- */
  const selectAll = useCallback(() => {
    if (!bulkMode) return;
    if (selectedRows.length === entries.length) setSelectedRows([]);
    else setSelectedRows(entries.map((e) => e.id));
  }, [bulkMode, selectedRows.length, entries]);

  const deleteSelected = useCallback(async () => {
    if (!bulkMode || selectedRows.length === 0) return;

    // 🔒 Collect selected entries
    const entriesToDelete = entries.filter((e) => selectedRows.includes(e.id));

    // 🔍 Check if any of the selected rows contain data
    const hasData = entriesToDelete.some(
      (row) =>
        row.entity_name?.trim() ||
        Object.values(row.values || {}).some(
          (v) => v !== null && String(v).trim() !== ""
        )
    );

    if (hasData) {
      const confirmDelete = window.confirm(
        `⚠️ ${entriesToDelete.length} selected row${
          entriesToDelete.length > 1 ? "s" : ""
        } contain data. Are you sure you want to delete ${
          entriesToDelete.length > 1 ? "them" : "it"
        }?`
      );
      if (!confirmDelete) return;
    }

    try {
      const { error } = await supabase
        .from("ledger_entries")
        .delete()
        .in("id", selectedRows);
      if (error) throw error;

      setSelectedRows([]);
      reloadEntries();
    } catch (err: any) {
      console.error("❌ Bulk delete failed:", err.message);
    }
  }, [bulkMode, selectedRows, entries, reloadEntries]);


  /* ----------------------- Rows Orb ----------------------- */
  const rowsMenu = useMemo(
    () => (
      <RowsMenu
        key="rows-utility-orb"
        ledgerId={ledgerId}
        open={rowsOrbOpen}
        setOpen={setRowsOrbOpen}
        onAddRow={handleAddRow}
        onDeleteLastRow={handleDeleteLastRow}
        onBulkAddRows={async (count: number) => {
          if (!count || count < 1) return;

          // create empty row objects for Supabase
          const emptyValues = Object.fromEntries(headers.map((h) => [h.id, ""]));
          const newRows = Array.from({ length: count }, () => ({
            ledger_id: ledgerId,
            entity_name: "",
            values: emptyValues,
          }));

          const { error } = await supabase.from("ledger_entries").insert(newRows);
          if (error) console.error("❌ Bulk add failed:", error.message);
          else reloadEntries();
        }}
        onBulkMode={() => setBulkMode((v) => !v)}
        bulkModeActive={bulkMode}
        allSelected={selectedRows.length === entries.length && entries.length > 0}
        onSelectAll={selectAll}
        onDeleteSelected={deleteSelected}
        onExitBulk={() => {
          setBulkMode(false);
          setSelectedRows([]);
        }}
      />
    ),
    [ledgerId, rowsOrbOpen, bulkMode, selectedRows.length, entries.length, handleAddRow]
  );

  /* ========================================================================= */
  /*                                  RENDER                                   */
  /* ========================================================================= */
  return (
    <div className="relative w-full h-[calc(100vh-6rem)] flex flex-col bg-white overflow-hidden">
      {/* Ledger Menu */}
      <div className="absolute left-0 top-0 h-10 w-[50px] flex items-center justify-center z-[200]">
        <LedgerMenu
          ledgerId={ledgerId}
          onExportCSV={() => {}}
          onPrint={() => window.print()}
          onToggleView={() => setCompactView((v) => !v)}
          onTogglePinMode={togglePinMode}
        />
      </div>

      {/* Columns Menu */}
      <div className="absolute right-0 top-0 h-10 w-[50px] flex items-center justify-center z-[200]">
        <ColumnsMenu
          ledgerId={ledgerId}
          onAddColumn={handleAddColumn}
          onDeleteLastColumn={handleDeleteLastColumn}
          onBulkMode={() => setColumnBulkMode((v) => !v)}
          onSelectAll={() => {}}
          onDeleteSelected={() => {}}
          onExitBulk={() => {
            setColumnBulkMode(false);
            setSelectedColumns([]);
          }}
          bulkModeActive={columnBulkMode}
          allSelected={selectedColumns.length === headers.length}
          open={columnsMenuOpen}
          setOpen={setColumnsMenuOpen}
          onTogglePinMode={handleColumnPinModeToggle}
          reloadHeaders={reloadHeaders} 
        />
      </div>

      {/* ====================== HEADER ====================== */}
      <div className="relative z-30 bg-[#f7f7f7] border-b border-gray-200">
        {/* Pinned headers (fixed left) */}
        <div
          className="absolute left-0 top-0 flex z-30"
          style={{
            width: `${pinnedWidth}px`,
            height: "2.5rem",
            minHeight: "2.5rem",
          }}
        >
          <div
            className="flex items-center justify-center w-[50px] border-r border-gray-200 text-xs font-medium text-gray-600"
            style={{ height: "2.5rem" }}
          >
          </div>
          {leftPinnedHeaders.map((h) => (
            <div
              key={h.id}
              className="flex items-center justify-center"
              style={{ width: COL_WIDTH - 1, height: "2.55rem" }}
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

        {/* Scrollable header group */}
        <div
          ref={headerRef}
          className="relative overflow-hidden z-20"
          style={{
            marginLeft: `${pinnedWidth}px`,
            height: "2.5rem",
          }}
        >
          <div
            className="flex bg-[#f7f7f7]"
            id="scrollable-header-inner"
            style={{
              minWidth: `${scrollHeaders.length * COL_WIDTH}px`,
              height: "3rem",
              transform: "translateX(0px)",
              willChange: "transform",
            }}
          >
            {scrollHeaders.map((h) => (
              <div
                key={h.id}
                className="flex items-center justify-center border-r border-gray-200"
                style={{ width: COL_WIDTH, height: "3rem" }}
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
      <div className="relative overflow-auto max-w-full max-h-full">
        {/* Scrollable grid */}
        <div ref={scrollRef} className="relative overflow-auto max-w-full max-h-full">
          <div
            className="flex min-w-max relative"
            style={{ marginLeft: `${pinnedWidth}px` }}
          >            
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
                    className={`flex items-center p-1.5 truncate cursor-pointer transition-colors ${
                      selectedRows.includes(entry.id) ? "bg-orange-50" : "bg-white"
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
              </div>
            ))}
          </div>
        </div>

        {/* Floating pinned region (outside scrollRef) */}
        <div
          ref={pinnedRef}
          className="absolute left-0 top-0 z-30 flex bg-gray-50 border-r border-gray-100"
          style={{
            width: `${pinnedWidth}px`,
            height: `${contentHeight}px`,
            transform: "translateY(0px)",
            transition: "transform 0s",
            pointerEvents: "none",
          }}
        >
          <div
            className="pointer-events-auto flex flex-col bg-gray-50 border-r border-gray-100 overflow-y-hidden"
            style={{
              width: "50px",
              minWidth: "50px",
              maxWidth: "50px",
              flexShrink: 0,
            }}
          >
            {entries.map((entry, i) => {
              const isSelected = selectedRows.includes(entry.id);
              return (
                <div
                  key={entry.id}
                  className={`flex items-center justify-center text-sm font-medium select-none transition-colors ${
                    isSelected
                      ? "bg-orange-100 text-orange-700"
                      : bulkMode
                      ? "hover:bg-orange-50"
                      : ""
                  }`}
                  style={{
                    height: `${ROW_HEIGHT}px`,
                    minHeight: `${ROW_HEIGHT}px`,
                    maxHeight: `${ROW_HEIGHT}px`,
                    flexShrink: 0,
                    borderBottom: "1px solid rgba(0,0,0,0.05)",
                  }}
                >
                  {bulkMode ? (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => toggleCheckbox(entry.id, i, e)}
                      className="accent-orange-500 cursor-pointer"
                    />
                  ) : (
                    i + 1
                  )}
                </div>
              );
            })}
          </div>

          {leftPinnedHeaders.map((h) => (
            <div
              key={h.id}
              className="grid border-r border-gray-100 bg-white"
              style={{
                width: `${COL_WIDTH}px`,
                gridTemplateRows: `repeat(${entries.length}, ${ROW_HEIGHT}px)`,
              }}
            >
              {entries.map((entry, i) => (
                <div
                  key={`${entry.id}-${h.id}`}
                  className={`flex items-center p-1.5 truncate transition-colors ${
                    selectedRows.includes(entry.id) ? "bg-orange-50" : "bg-white"
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
            </div>
          ))}
        </div>
      </div>
      {/* ====================== FOOTER ====================== */}
      <div className="sticky bottom-0 left-0 w-full h-12 bg-gray-50 border-t border-gray-200 z-40 flex items-center justify-between pl-[7px]">
        <div className="flex items-center justify-center">
          {rowsMenu}
        </div>
      </div>
    </div>
  );
}
