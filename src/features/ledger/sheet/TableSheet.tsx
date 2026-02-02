import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import TableHeaders from "./TableHeaders";
import TableCell from "./TableCell";
import {
  repairRouteClasses,
  TableColumn,
  TableRouteRecord,
} from "@/utils/chain-utils";
import { syncRoutes, deleteEntityEverywhere } from "@/lib/route-sync";

// ICONS
import {
  CheckSquare,
  Columns3,
  Pin,
  PinOff,
  Plus,
  Trash2,
  Rows3,
  Copy,
  CopyPlus,
  SquareMousePointer,
  CircleX,
  CircleChevronLeft,
} from "lucide-react";

// UI COMPONENTS
import ExpansiveMenu from "@/components/ui/navigation/expansivemenu";
import TableMenu from "./TableMenu";

const TABLES = {
  headers: "table_columns",
  entries: "table_rows",
  routes: "table_routes",
} as const
const db = supabase as any
const ROW_PARENT_COL = "file_id" as const

interface TableSheetProps {
  tableId: string;
  headers: TableColumn[];
  entries: any[];
  setEntries: React.Dispatch<React.SetStateAction<any[]>>;
  reloadHeaders: () => void | Promise<void>;
  reloadEntries: () => void | Promise<void>;

  searchQuery?: string; 

  routes?: TableRouteRecord[];
  reloadRoutes?: () => void | Promise<void>;
}

export default function TableSheet({
  tableId,
  headers,
  entries,
  setEntries,
  reloadHeaders,
  reloadEntries,
  searchQuery,
}: TableSheetProps) {
  /* ----------------------------- Local State ----------------------------- */
  const [allHeaders, setAllHeaders] = useState<TableColumn[]>([]);
  const [allRoutes, setAllRoutes] = useState<TableRouteRecord[]>([]);

  const [compactView, setCompactView] = useState(false);
  const [pinnedColumns, setPinnedColumns] = useState<string[]>([]);
  const [pinMode, setPinMode] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(
    null
  );

  // MENU STATES
  const [useAlternateRows, setUseAlternateRows] = useState(false)

  const sheetRef = useRef<HTMLDivElement>(null)

  const [columnsMenuOpen, setColumnsMenuOpen] = useState(false);
  const [rowsOrbOpen, setRowsOrbOpen] = useState(false);

  // Column bulk mode (this maps to old bulkModeActive)
  const [columnBulkMode, setColumnBulkMode] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);

  // --- ADD: old "select all" parity ---
  const allColumnsSelected =
    headers.length > 0 && selectedColumns.length === headers.length;

  const selectAllColumns = useCallback(() => {
    if (!columnBulkMode) return;
    setSelectedColumns((prev) =>
      prev.length === headers.length ? [] : headers.map((h) => h.id)
    );
  }, [columnBulkMode, headers]);

  // --- ADD: delete selected columns (old onDeleteSelected parity) ---
  const deleteSelectedColumns = useCallback(async () => {
    if (!columnBulkMode || selectedColumns.length === 0) return;

    const colsToDelete = headers.filter((h) => selectedColumns.includes(h.id));

    const anyUsed = colsToDelete.some((col) =>
      entries.some(
        (e) =>
          e.values?.[col.id] !== null &&
          String(e.values?.[col.id] ?? "").trim() !== ""
      )
    );

    if (anyUsed) {
      const ok = window.confirm(
        `⚠️ ${colsToDelete.length} selected column${
          colsToDelete.length > 1 ? "s" : ""
        } contain data. Delete anyway?`
      );
      if (!ok) return;
    }

    try {
      const { error } = await db
        .from(TABLES.headers)
        .delete()
        .in("id", selectedColumns);

      if (error) throw error;

      setSelectedColumns([]);
      setColumnBulkMode(false);
      await reloadHeaders();
    } catch (err: any) {
      console.error("❌ Delete selected columns failed:", err?.message ?? err);
    }
  }, [columnBulkMode, selectedColumns, headers, entries, reloadHeaders]);

  // Rows menu: old behavior parity
  const [rowsSubmenu, setRowsSubmenu] = useState<"bulk" | null>(null);
  const [rowsBulkCount, setRowsBulkCount] = useState(1);

  const handleBulkAddRows = useCallback(
    async (count: number) => {
      if (!count || count < 1) return;

      const emptyValues = Object.fromEntries(headers.map((h) => [h.id, ""]));

      const newRows = Array.from({ length: count }, () => ({
        [ROW_PARENT_COL]: tableId,
        entity_key: `row_${crypto.randomUUID()}`,
        values: emptyValues,
      }));

      try {
        const { error } = await db.from(TABLES.entries).insert(newRows);
        if (error) {
          console.error("❌ Bulk add failed:", error);
          return;
        }

        await reloadEntries();
        await syncRoutes(tableId);
      } catch (err: any) {
        console.error("❌ Bulk add unexpected failure:", err?.message ?? err);
      }
    },
    [headers, tableId, reloadEntries]
  );

  /* ----------------------------- Refs ----------------------------- */
  const scrollRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef<HTMLDivElement>(null);

  /* Layout calculations */
  const leftPinnedHeaders = headers.filter((h) =>
    pinnedColumns.includes(h.id)
  );
  const scrollHeaders = headers.filter(
    (h) => !pinnedColumns.includes(h.id)
  );

  const COL_WIDTH = compactView ? 60 : 150;
  const ROW_HEIGHT = 40;
  const pinnedWidth = 50 + leftPinnedHeaders.length * COL_WIDTH;
  const contentHeight = entries.length * ROW_HEIGHT;

  /* ---------------------- Load ALL headers across ALL ledgers ---------------------- */
  const loadAllHeaders = useCallback(async () => {
    const { data, error } = await db
      .from(TABLES.headers)
      .select("*");

    if (error) {
      console.error("❌ Failed to load ALL headers:", error);
      return;
    }

    setAllHeaders((data || []) as TableColumn[]);
  }, []);

  /* ---------------------- Load ROUTES for this ledger ---------------------- */
  // const loadRoutes = useCallback(async () => {
  //   const { data, error } = await supabase
  //     .from("ledger_routes")
  //     .select("*")
  //     .or(
  //       `source_ledger_id.eq.${tableId},target_ledger_id.eq.${tableId}`
  //     );

  //   if (error) {
  //     console.error("❌ Failed to load routes:", error);
  //     return;
  //   }

  //   setAllRoutes((data || []) as LedgerRouteRecord[]);
  // }, [tableId]);

  /* ---------------------- Load everything on mount ---------------------- */
  useEffect(() => {
    loadAllHeaders();
    // loadRoutes();
  }, [
    loadAllHeaders, 
    // loadRoutes
  ]);

  /* ---------------------- Reload all headers when THIS ledger changes ---------------------- */
  useEffect(() => {
    loadAllHeaders();
  }, [headers, loadAllHeaders]);

  /* --------------------------- AUTO-REPAIR route_class --------------------------- */
  useEffect(() => {
    if (!headers || !allRoutes) return;

    const fixes = repairRouteClasses(headers, allRoutes);
    if (fixes.length === 0) return;

    console.log("🛠 Auto-repairing broken route_class values:", fixes);

    const doRepair = async () => {
      for (const fix of fixes) {
        const { error } = await db
          .from(TABLES.headers)
          .update({ route_class: fix.route_class })
          .eq("id", fix.id);

        if (error) {
          console.error(
            "❌ Auto-repair update failed for ID:",
            fix.id,
            error
          );
          return;
        }
      }

      await reloadHeaders();
      await loadAllHeaders();
    };

    doRepair();
  }, [headers, allRoutes, reloadHeaders, loadAllHeaders]);

  /* --------------------------- Scroll Sync --------------------------- */
  useEffect(() => {
    const grid = scrollRef.current;
    const header = headerRef.current;
    const pinned = pinnedRef.current;
    if (!grid || !header || !pinned) return;

    const headerInner = header.querySelector("div");

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!grid || !headerInner || !pinnedRef.current) return;
          (headerInner as HTMLDivElement).style.transform = `translateX(${-grid.scrollLeft}px)`;
          pinnedRef.current!.style.transform = `translateY(${-grid.scrollTop}px)`;
          ticking = false;
        });
        ticking = true;
      }
    };

    grid.addEventListener("scroll", handleScroll, { passive: true });
    return () => grid.removeEventListener("scroll", handleScroll);
  }, []);

  /* --------------------------- Pin handlers --------------------------- */
  const handleTogglePin = useCallback((id: string) => {
    setPinnedColumns((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }, []);

  const togglePinMode = useCallback(() => {
    setPinMode((prev) => !prev);
  }, []);

  /* --------------------------- Cell editing --------------------------- */
  const updateValueLocal = useCallback(
    async (entryId: string, headerId: string, newVal: any) => {
      // local React update
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

       // current entry before DB write
      const target = entries.find((e) => e.id === entryId);
      const updatedValues = { ...(target?.values || {}), [headerId]: newVal };

      try {
        const { error } = await db
          .from(TABLES.entries)
          .update({ values: updatedValues })
          .eq("id", entryId);

        if (error) throw error;

        // ⭐ THIS MAKES ROUTES ACTUALLY PUSH
        await syncRoutes(tableId);

      } catch (err: any) {
        console.error("❌ Failed to update entry:", err.message);
      }
    },
    [entries, setEntries, tableId]
  );

  /* ---------------------- Row Multi-select ---------------------- */
  const toggleCheckbox = useCallback(
    (
      id: string,
      index: number,
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      if (!bulkMode) return;
      const shift =
        event.nativeEvent instanceof MouseEvent &&
        event.nativeEvent.shiftKey;

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
    const emptyValues = Object.fromEntries(headers.map((h) => [h.id, ""]))
    const newKey = `row_${crypto.randomUUID()}`

    const payload = {
      [ROW_PARENT_COL]: tableId, // ✅ this must be the parent file id
      entity_key: newKey,
      values: emptyValues,
    }

    const { error } = await db.from(TABLES.entries).insert([payload])
    if (error) {
      console.error("❌ Add row failed:", error)
      return
    }

    await reloadEntries()
    await syncRoutes(tableId)
  }, [headers, tableId, reloadEntries])

  const handleDeleteLastRow = useCallback(async () => {
    if (entries.length === 0) return;

    const last = entries[entries.length - 1];
    const key = last.entity_key;

    const hasData =
      key?.trim() ||
      Object.values(last.values || {}).some(
        v => v !== null && String(v).trim() !== ""
      );

    if (hasData) {
      const confirmDelete = window.confirm(
        "⚠️ The last row contains data. Are you sure you want to delete it?"
      );
      if (!confirmDelete) return;
    }

    try {
      if (key) {
        // Delete the entire entity cluster across all ledgers
        await deleteEntityEverywhere(key);
      } else {
        // Fallback: delete only this row
        const { error: delErr } = await db
          .from(TABLES.entries)
          .delete()
          .eq("id", last.id);

        if (delErr) throw delErr;
      }

      await reloadEntries();
      await syncRoutes(tableId); // re-align rows in other ledgers

    } catch (err: any) {
      console.error("❌ Delete last row failed:", err.message);
    }
  }, [entries, reloadEntries, tableId]);


  /* ADD COLUMN */
  const handleAddColumn = useCallback(async () => {
    try {
      const payload = {
        file_id: tableId,
        name: "New Column",
        type: "text",
        order_index: headers.length,      // include if NOT NULL / for ordering
        // route_class: null,             // optional
        // options: {},                   // optional
        // locked: false,                 // optional
      }

      const { error } = await db.from(TABLES.headers).insert([payload])
      if (error) throw error

      await reloadHeaders()
    } catch (err: any) {
      console.error("Add column failed:", err?.message ?? err)
    }
  }, [tableId, headers.length, reloadHeaders])


  /* DELETE LAST COLUMN */
  const handleDeleteLastColumn = useCallback(async () => {
    if (headers.length === 0) return;

    const last = headers[headers.length - 1];
    const columnId = last.id;

    const columnUsed = entries.some(
      e =>
        e.values?.[columnId] &&
        String(e.values[columnId]).trim() !== ""
    );

    if (columnUsed) {
      const confirmDelete = window.confirm(
        `⚠️ The column "${last.name}" contains data. Are you sure you want to delete it?`
      );
      if (!confirmDelete) return;
    }

    try {
      const { error } = await db
        .from(TABLES.headers)
        .delete()
        .eq("id", columnId);

      if (error) throw error;

      reloadHeaders();

    } catch (err: any) {
      console.error("❌ Delete last column failed:", err.message);
    }
  }, [headers, entries, reloadHeaders]);

  /* --------------------------- Column Pin Mode Hook --------------------------- */
  const handleColumnPinModeToggle = () => {
    togglePinMode();
  };

  // --- ADD: orb click logic must match old ColumnsMenu.tsx ---
  const setColumnsMenuOpenWithOldLogic = useCallback(
    (next: boolean) => {
      // Select mode: orb toggles "select all" and menu stays open
      if (columnBulkMode) {
        selectAllColumns();
        return;
      }

      // Old behavior: if menu is open and user clicks orb again -> add column + close
      if (columnsMenuOpen && !next) {
        handleAddColumn();
        setColumnsMenuOpen(false);
        return;
      }

      // Normal toggle
      setColumnsMenuOpen(next);
    },
    [columnBulkMode, selectAllColumns, columnsMenuOpen, handleAddColumn]
  );

  /* --------------------------- Bulk Row Actions --------------------------- */
  const selectAll = useCallback(() => {
    if (!bulkMode) return;
    if (selectedRows.length === entries.length) setSelectedRows([]);
    else setSelectedRows(entries.map((e) => e.id));
  }, [bulkMode, selectedRows.length, entries]);

  const deleteSelected = useCallback(async () => {
    if (!bulkMode || selectedRows.length === 0) return;

    const entriesToDelete = entries.filter((e) =>
      selectedRows.includes(e.id)
    );

    const hasData = entriesToDelete.some(
      (row) =>
        row.entity_key?.trim() ||
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
      // 1) Split into: rows with keys (cluster delete) and without keys (local delete)
      const keys = new Set<string>();
      const rowIdsWithoutKey: string[] = [];

      for (const row of entriesToDelete) {
        if (row.entity_key && row.entity_key.trim()) {
          keys.add(row.entity_key.trim());
        } else {
          rowIdsWithoutKey.push(row.id);
        }
      }

      // 2) Delete all clusters by entity_key
      for (const key of keys) {
        await deleteEntityEverywhere(key);
      }

      // 3) Delete any keyless rows directly in this ledger
      if (rowIdsWithoutKey.length > 0) {
        const { error: delErr } = await db
          .from(TABLES.entries)
          .delete()
          .in("id", rowIdsWithoutKey);

        if (delErr) throw delErr;
      }

      // 4) Reset UI + reload + resync
      setSelectedRows([]);
      await reloadEntries();
      await syncRoutes(tableId);

    } catch (err: any) {
      console.error("❌ Bulk delete failed:", err.message);
    }
  }, [bulkMode, selectedRows, entries, reloadEntries, tableId]);

  // MENUS' ITEMS
  const rowMenuItems = useMemo(() => {
    if (bulkMode) {
      return [
        {
          id: "row-pin",
          label: "Pin (coming soon)",
          icon: <Pin className="h-4 w-4" />,
          action: () => {},
        },
        {
          id: "row-dup",
          label: "Duplicate (coming soon)",
          icon: <Copy className="h-4 w-4" />,
          action: () => {},
        },
        {
          id: "row-del-selected",
          label: "Delete selected",
          icon: <Trash2 className="h-4 w-4" />,
          action: deleteSelected,
          destructive: true,
          flavor: "red",
        },
        {
          id: "row-exit-select",
          label: "Exit select mode",
          icon: <CircleChevronLeft className="h-4 w-4" />,
          action: () => {
            setBulkMode(false);
            setSelectedRows([]);
            setLastSelectedIndex(null);
          },
        },
      ] as const;
    }

    // BULK SUBMENU: no action buttons (we show the input UI next to the orb)
    if (rowsSubmenu === "bulk") {
      return [] as const;
    }

    // ROOT MENU
    return [
      {
        id: "row-bulk",
        label: "Add rows in bulk",
        icon: <CopyPlus className="h-4 w-4" />,
        action: () => {
          setRowsSubmenu("bulk");
          setRowsBulkCount(1);
          setRowsOrbOpen(true); // keep menu “open” so the orb click can confirm
        },
      },
      {
        id: "row-del-last",
        label: "Delete last row",
        icon: <Trash2 className="h-4 w-4" />,
        action: handleDeleteLastRow,
        destructive: true,
        flavor: "red",
      },
      {
        id: "row-select",
        label: "Select mode",
        icon: <SquareMousePointer className="h-4 w-4" />,
        action: () => {
          setBulkMode(true);
          setRowsSubmenu(null);
          setRowsOrbOpen(true);
        },
      },
      {
        id: "row-exit",
        label: "Exit menu",
        icon: <CircleX className="h-4 w-4" />,
        action: () => {
          setRowsSubmenu(null);
          setRowsBulkCount(1);
          setRowsOrbOpen(false);
        },
      },
    ] as const;
  }, [
    bulkMode,
    rowsSubmenu,
    deleteSelected,
    handleDeleteLastRow,
  ]);

  const headerMenuItems = useMemo(() => {
    // SELECT MODE MENU (old MENU_TREE["Select"])
    if (columnBulkMode) {
      return [
        {
          id: "col-dup",
          label: "Duplicate (coming soon)",
          icon: <Copy className="h-4 w-4" />,
          action: () => {},
        },
        {
          id: "col-del-selected",
          label: "Delete selected",
          icon: <Trash2 className="h-4 w-4" />,
          action: deleteSelectedColumns,
          destructive: true,
          flavor: "red",
        },
        {
          id: "col-exit-select",
          label: "Exit select mode",
          icon: <CircleChevronLeft className="h-4 w-4" />,
          action: () => {
            setColumnBulkMode(false);
            setSelectedColumns([]);
            setColumnsMenuOpen(true); // keep it open like the old returningToRoot feel
          },
        },
      ] as const;
    }

    // ROOT MENU (old ROOT_ACTIONS) — NO "Add column" item (orb does it)
    return [
      {
        id: "col-del-last",
        label: "Delete last column",
        icon: <Trash2 className="h-4 w-4" />,
        action: handleDeleteLastColumn,
        destructive: true,
        flavor: "red",
      },
      {
        id: "col-pin-mode",
        label: pinMode ? "Exit pin mode" : "Pin columns",
        icon: pinMode ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />,
        action: handleColumnPinModeToggle,
        flavor: "slate",
      },
      {
        id: "col-select-mode",
        label: "Select mode",
        icon: <SquareMousePointer className="h-4 w-4" />,
        action: () => {
          setColumnBulkMode(true);
          setSelectedColumns([]);
          setColumnsMenuOpen(true);
        },
        flavor: "yellow",
      },
      {
        id: "col-exit",
        label: "Exit menu",
        icon: <CircleX className="h-4 w-4" />,
        action: () => {
          setColumnsMenuOpen(false);
          setColumnBulkMode(false);
          setSelectedColumns([]);
        },
      },
    ] as const;
  }, [
    columnBulkMode,
    deleteSelectedColumns,
    handleDeleteLastColumn,
    pinMode,
    handleColumnPinModeToggle,
  ]);

  const rowsMenuOpen = bulkMode ? true : rowsOrbOpen;

  const setRowsMenuOpen = useCallback(
    (next: boolean) => {
      console.log("[RowsOrb] setOpen called:", {
        next,
        bulkMode,
        rowsSubmenu,
        rowsOrbOpen,
        rowsBulkCount,
      });

      // Bulk/select mode: orb click selects all, menu stays “open”
      if (bulkMode) {
        selectAll();
        return;
      }

      // Bulk add mode: closing confirms bulk add (old behavior)
      if (rowsSubmenu === "bulk") {
        if (!next) {
          handleBulkAddRows(rowsBulkCount);
          setRowsSubmenu(null);
          setRowsBulkCount(1);
          setRowsOrbOpen(false);
        } else {
          setRowsOrbOpen(true);
        }
        return;
      }

      // Old behavior: if menu is open and user clicks orb again -> add single row + close
      if (rowsOrbOpen && !next) {
        handleAddRow();
        setRowsOrbOpen(false);
        return;
      }

      // Normal toggle
      setRowsOrbOpen(next);
    },
    [
      bulkMode,
      selectAll,
      rowsSubmenu,
      rowsBulkCount,
      handleBulkAddRows,
      rowsOrbOpen,
      handleAddRow,
    ]
  );

  /* --------------------------- Route reload for children --------------------------- */
  // const refreshRoutes = useCallback(async () => {
  //   await loadRoutes();
  // }, [loadRoutes]);

  return (
    <div ref={sheetRef as any} className="relative flex flex-col h-full min-h-0 w-full overflow-hidden text-[var(--text)]">
      {/* TABLE MENU */}
      <div className="absolute left-[7px] top-[2.5px] z-[300] pointer-events-auto">
        <TableMenu
          tableId={tableId}
          headers={headers}
          entries={entries}
          compactView={compactView}
          setCompactView={setCompactView}
          pinMode={pinMode}
          setPinMode={setPinMode}
          useAlternateRows={useAlternateRows}
          setUseAlternateRows={setUseAlternateRows}
          fullscreenTargetRef={sheetRef as any}
        />
      </div>

      {/* Columns Menu */}
      <div className="absolute right-3 top-2 z-[300] pointer-events-auto">
        <ExpansiveMenu
          items={headerMenuItems as any}
          variant="rainbow"
          expand="line"
          direction="down"
          radius={64}
          spacing={46}
          autoClose={false}
          mainIcon={
            columnBulkMode ? (
              <div
                className={`h-[14px] w-[14px] rounded-[4px] border-[1.5px] flex items-center justify-center ${
                  allColumnsSelected
                    ? "border-[hsl(var(--primary))] bg-red-600"
                    : "border-[hsl(var(--muted-foreground))] bg-transparent"
                }`}
              >
                {allColumnsSelected && (
                  <div className="h-[6px] w-[6px] bg-white rounded-[1px]" />
                )}
              </div>
            ) : columnsMenuOpen ? (
              <Plus className="h-4 w-4" />
            ) : (
              <Columns3 className="h-4 w-4" />
            )
          }
          mainIconSize={18}
          mainSize={34}
          open={columnsMenuOpen}
          setOpen={setColumnsMenuOpenWithOldLogic}
        />
      </div>

      {/* ====================== HEADER ====================== */}
      <div className="relative z-30 bg-transparent border-b border-[var(--gray-18)]">
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
            className="flex items-center justify-center w-[50px] border-r border-[var(--gray-18)]"
            style={{ height: "2.5rem" }}
          />
          {leftPinnedHeaders.map((h) => (
            <div
              key={h.id}
              className="flex items-center justify-center"
              style={{ width: COL_WIDTH - 1, height: "2.55rem" }}
            >
              <TableHeaders
                fileId={tableId}
                headers={[h]}
                allHeaders={allHeaders}
                routes={allRoutes}
                // reloadRoutes={refreshRoutes}
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
            className="flex"
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
                className="flex items-center justify-center border-r border-[var(--gray-18)]"
                style={{ width: COL_WIDTH, height: "3rem" }}
              >
                <TableHeaders
                  fileId={tableId}
                  headers={[h]}
                  allHeaders={allHeaders}
                  routes={allRoutes}
                  // reloadRoutes={refreshRoutes}
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
      <div className="relative overflow-hidden max-w-full max-h-full">
        {/* Scrollable grid */}
        <div
          ref={scrollRef}
          className="relative overflow-auto max-w-full max-h-full scrollbar"
        >
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
                      selectedRows.includes(entry.id)
                        ? "bg-orange-500"
                        : useAlternateRows && i % 2 === 1
                        ? "bg-[var(--gray-19)]"
                        : "bg-transparent"
                    }`}
                    style={{
                      height: `${ROW_HEIGHT}px`,
                      borderBottom: "1px solid var(--gray-19)",
                    }}
                  >
                    <TableCell
                      entryId={entry.id}
                      header={h}
                      value={entry.values?.[h.id]}
                      onChange={(val) => {
                        console.log(`🧩 [TableSheet] ScrollCell ...`)
                        updateValueLocal(entry.id, h.id, val);
                      }}
                      searchQuery={searchQuery}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Floating pinned region */}
        <div
          ref={pinnedRef}
          className="absolute left-0 top-0 z-30 flex bg-transparent border-r border-[var(--gray-18)]"
          style={{
            width: `${pinnedWidth}px`,
            height: `${contentHeight}px`,
            transform: "translateY(0px)",
            transition: "transform 0s",
            pointerEvents: "none",
          }}
        >
          {/* Numbered / Checkbox column */}
          <div
            className="pointer-events-auto flex flex-col bg-[var(--gray-20)] border-r border-[var(--gray-18)] overflow-y-hidden"
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
                      : useAlternateRows && i % 2 === 1
                      ? "bg-[var(--gray-19)]"
                      : "bg-transparent"
                  }`}
                  style={{
                    height: `${ROW_HEIGHT}px`,
                    minHeight: `${ROW_HEIGHT}px`,
                    maxHeight: `${ROW_HEIGHT}px`,
                    flexShrink: 0,
                    borderBottom: "1px solid var(--gray-19)",
                  }}
                >
                  {bulkMode ? (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) =>
                        toggleCheckbox(entry.id, i, e)
                      }
                      className="accent-orange-500 cursor-pointer"
                    />
                  ) : (
                    i + 1
                  )}
                </div>
              );
            })}
          </div>

          {/* Pinned columns */}
          {leftPinnedHeaders.map((h) => (
            <div
              key={h.id}
              className="grid border-r border-[var(--gray-18)] bg-[var(--gray-20)]"
              style={{
                width: `${COL_WIDTH}px`,
                gridTemplateRows: `repeat(${entries.length}, ${ROW_HEIGHT}px)`,
              }}
            >
              {entries.map((entry, i) => (
                <div
                  key={`${entry.id}-${h.id}`}
                  className={`flex items-center p-1.5 truncate transition-colors ${
                    selectedRows.includes(entry.id)
                      ? "bg-orange-500"
                      : useAlternateRows && i % 2 === 1
                      ? "bg-[var(--gray-19)]"
                      : "bg-transparent"
                  }`}
                  style={{
                    height: `${ROW_HEIGHT}px`,
                    borderBottom: "1px solid var(--gray-19)",
                  }}
                >
                  <TableCell
                    entryId={entry.id}
                    header={h}
                    value={entry.values?.[h.id]}
                    onChange={(val) => {
                      console.log(
                        `🧩 [LedgerSheet] PinnedCell ${entry.id}-${h.name} updated`
                      );
                      updateValueLocal(entry.id, h.id, val);
                    }}
                    searchQuery={searchQuery}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ====================== FOOTER ====================== */}
      <div className="sticky bottom-0 left-0 w-full h-12 z-40 flex items-center justify-between pl-[8px]">
        {/* ROW MENU */}
        <div className="flex items-center gap-3">
          <ExpansiveMenu
            items={rowMenuItems as any}
            variant="rainbow"
            expand="line"
            direction="right"
            spacing={42}
            radius={56}
            autoClose={false}
            mainIcon={
              bulkMode ? (
                <CheckSquare className="h-4 w-4 -rotate-90" />
              ) : rowsSubmenu === "bulk" ? (
                <CopyPlus className="h-4 w-4" />
              ) : rowsMenuOpen ? (
                <Plus className="h-4 w-4" />
              ) : (
                <Rows3 className="h-4 w-4" />
              )
            }
            mainIconSize={18}
            mainSize={36}
            open={rowsMenuOpen}
            setOpen={setRowsMenuOpen}
            mainRotate={90}
          />

          {/* Bulk input (old submenu feel) */}
          {rowsSubmenu === "bulk" && !bulkMode && (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                value={rowsBulkCount}
                onChange={(e) =>
                  setRowsBulkCount(Math.max(1, parseInt(e.target.value) || 1))
                }
                className="w-14 text-sm text-center rounded-md border border-gray-300 px-1 py-[2px] bg-[var(--gray-10)] shadow-sm focus:ring-1 focus:ring-[hsl(var(--text))] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  setRowsSubmenu(null);
                  setRowsBulkCount(1);
                  setRowsOrbOpen(false);
                }}
                className="h-7 w-7 rounded-full bg-[var(--gray-18)] shadow-sm flex items-center justify-center hover:bg-[hsl(var(--primary))/0.12)]"
                title="Cancel"
              >
                <CircleX className="h-4 w-4 text-[var(--text)]" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
