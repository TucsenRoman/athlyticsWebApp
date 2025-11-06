import React, { useState, useRef, useEffect } from "react";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import LedgerHeaders from "./LedgerHeaders";
import LedgerCell from "./LedgerCell";
import LedgerOrb from "./LedgerOrb";

export default function LedgerSheet({
  ledgerId,
  headers,
  entries,
  setEntries,
  reloadHeaders,
  reloadEntries,
}) {
  const [compactView, setCompactView] = useState(false);
  const [pinnedColumns, setPinnedColumns] = useState<string[]>([]);
  const [pinMode, setPinMode] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef<HTMLDivElement>(null);
  const hScrollRef = useRef<HTMLDivElement>(null);
  const vScrollRef = useRef<HTMLDivElement>(null);

  const pinnedHeaders = headers.filter((h) => pinnedColumns.includes(h.id));
  const scrollHeaders = headers.filter((h) => !pinnedColumns.includes(h.id));

  const COL_WIDTH = compactView ? 60 : 150;
  const ROW_HEIGHT = 40;

  /* --------------------------- Scroll Sync --------------------------- */
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

  const handleHScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (scrollRef.current)
      scrollRef.current.scrollLeft = e.currentTarget.scrollLeft;
  };

  const handleVScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = e.currentTarget.scrollTop;
  };

  /* ---------------------------- Pin / Add / Update ---------------------------- */
  const handleTogglePin = (id: string) => {
    setPinnedColumns((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const updateValueLocal = (entryId: string, headerId: string, newVal: any) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.id === entryId
          ? { ...e, values: { ...(e.values || {}), [headerId]: newVal } }
          : e
      )
    );

    supabase
      .from("ledger_entries")
      .update({
        values: {
          ...(entries.find((e) => e.id === entryId)?.values || {}),
          [headerId]: newVal,
        },
      })
      .eq("id", entryId);
  };

  const handleAddRow = async () => {
    const emptyValues = Object.fromEntries(headers.map((h) => [h.id, null]));
    await supabase.from("ledger_entries").insert([
      { ledger_id: ledgerId, entity_name: "", values: emptyValues },
    ]);
    reloadEntries();
  };

  /* ========================================================================= */
  /*                                   RENDER                                  */
  /* ========================================================================= */
  return (
    <div className="relative w-full h-[calc(100vh-6rem)] bg-white flex flex-col overflow-hidden">
      {/* ====================== HEADER ====================== */}
      <div className="relative z-30 border-b" style={{ height: "40px" }}>
        {/* Shared background strip to unify tone */}
        <div className="absolute inset-0 bg-gray-100 z-0" />

        {/* === Orb + pinned headers (float layer) === */}
        <div className="absolute top-0 left-0 h-full z-30 flex">
          {/* Orb */}
          <div className="w-[50px] h-full border-r flex items-center justify-center bg-gray-100">
            <LedgerOrb
              ledgerId={ledgerId}
              onExportCSV={() => {}}
              onBulkMode={() => {}}
              onPrint={() => window.print()}
              onToggleView={() => setCompactView((v) => !v)}
              onTogglePinMode={() => setPinMode((v) => !v)}
            />
          </div>

          {/* Pinned headers */}
          {pinnedHeaders.map((h, index) => (
            <div
              key={h.id}
              className="absolute top-0 flex items-center"
              style={{
                width: `${COL_WIDTH}px`,
                left: `${index}px`,
                pointerEvents: "auto",
                background: "transparent",
                boxSizing: "border-box",
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

        {/* === Scrollable track === */}
        <div ref={headerRef} className="relative overflow-hidden h-full z-10">
          <div className="flex min-w-max h-full">
            {/* Spacer for orb + pinned width */}
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
                style={{
                  width: `${COL_WIDTH}px`,
                  background: "transparent",
                  boxSizing: "border-box",
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
        </div>
      </div>

      {/* ====================== BODY ====================== */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* === Pinned Columns === */}
        <div
          ref={pinnedRef}
          className="sticky left-0 z-20 bg-white border-r overflow-hidden"
          style={{
            width: `${50 + pinnedHeaders.length * COL_WIDTH}px`,
            boxSizing: "border-box",
          }}
        >
          <div className="flex">
            {/* Row numbers */}
            <div
              className="grid border-r bg-gray-50"
              style={{
                width: "50px",
                gridTemplateRows: `repeat(${entries.length + 1}, ${ROW_HEIGHT}px)`,
                boxSizing: "border-box",
              }}
            >
              {entries.map((entry, i) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-center border-b text-sm font-medium select-none"
                  style={{ height: `${ROW_HEIGHT}px` }}
                >
                  {i + 1}
                </div>
              ))}
              <div style={{ height: `${ROW_HEIGHT}px` }} />
            </div>

            {/* Actual pinned column cells */}
            {pinnedHeaders.map((h, index) => (
              <div
                key={h.id}
                className="grid border-r z-10"
                style={{
                  width: `${COL_WIDTH}px`,
                  gridTemplateRows: `repeat(${entries.length + 1}, ${ROW_HEIGHT}px)`,
                  boxSizing: "border-box",
                }}
              >
                {entries.map((entry) => (
                  <div
                    key={`${entry.id}-${h.id}`}
                    className="border-b border-gray-200 bg-white p-1.5 truncate flex items-center"
                    style={{ height: `${ROW_HEIGHT}px` }}
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

        {/* === Scrollable Grid === */}
        <div ref={scrollRef} className="flex-1 overflow-auto relative">
          <div className="flex flex-col min-w-max">
            <div className="flex">
              {scrollHeaders.map((h) => (
                <div
                  key={h.id}
                  className="grid border-r border-gray-200"
                  style={{
                    width: `${COL_WIDTH}px`,
                    gridTemplateRows: `repeat(${entries.length}, ${ROW_HEIGHT}px)`,
                    boxSizing: "border-box",
                  }}
                >
                  {entries.map((entry) => (
                    <div
                      key={`${entry.id}-${h.id}`}
                      className="border-b border-gray-200 bg-white p-1.5 truncate flex items-center"
                      style={{ height: `${ROW_HEIGHT}px` }}
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

            {/* Add Row */}
            <div
              onClick={handleAddRow}
              className="border-t bg-gray-50 text-gray-400 p-2 text-center cursor-pointer font-medium"
              style={{ height: `${ROW_HEIGHT}px` }}
            >
              <Plus className="w-4 h-4 mx-auto" />
            </div>
          </div>
        </div>

        {/* === Custom Scrollbars === */}
        <div
          ref={vScrollRef}
          onScroll={handleVScroll}
          className="absolute right-0 top-0 w-2 h-full overflow-y-scroll"
        >
          <div
            style={{
              height: `${entries.length * ROW_HEIGHT + ROW_HEIGHT}px`,
            }}
          />
        </div>

        <div
          ref={hScrollRef}
          onScroll={handleHScroll}
          className="absolute bottom-0 left-0 h-2 w-full overflow-x-scroll"
        >
          <div
            style={{
              width: `${scrollHeaders.length * COL_WIDTH}px`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
