"use client";

import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trash2 } from "lucide-react";

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

interface ProjectManagerProps {
  programId: number;
}

interface LedgerRow {
  id: string;
  name: string | null;
}

interface PackageRow {
  id: string;
  name: string;
}

interface PackageItemRow {
  package_id: string;
  ledger_id: string;
}

interface LedgerEntryMeta {
  ledger_id: string;
  created_at: string;
  entity_key: string | null;
}

/* -------------------------------------------------------------------------- */
/* COLLAPSIBLE                                                                */
/* -------------------------------------------------------------------------- */

function Collapsible({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className="
        border border-[var(--border)]
        rounded-xl
        bg-[var(--bg)]
        overflow-hidden
      "
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="
          w-full flex justify-between items-center 
          px-4 py-3 text-left
          text-[var(--text-dk)]
          hover:bg-[var(--gray-50)]
          transition-colors
        "
      >
        <span className="font-semibold">{title}</span>
        <span className="text-[var(--text)]">{open ? "−" : "+"}</span>
      </button>

      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* EMPTY STATE                                                                */
/* -------------------------------------------------------------------------- */

function Empty({ message }: { message: string }) {
  return (
    <div
      className="
        text-sm text-[var(--text)]
        p-3 rounded-lg
        border border-[var(--border)]
        bg-[var(--bg)]
      "
    >
      {message}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* SECTION WRAPPER                                                            */
/* -------------------------------------------------------------------------- */

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count?: number;
  children: React.ReactNode;
}) {
  const label = typeof count === "number" ? `${title} (${count})` : title;

  return (
    <Collapsible title={label} defaultOpen={false}>
      <div className="flex flex-col gap-2">{children}</div>
    </Collapsible>
  );
}

/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT                                                             */
/* -------------------------------------------------------------------------- */

export default function ProjectManager({ programId }: ProjectManagerProps) {
  const [programName, setProgramName] = useState("Program");

  const [ledgers, setLedgers] = useState<LedgerRow[]>([]);
  const [packages, setPackages] = useState<PackageRow[]>([]);
  const [packageItems, setPackageItems] = useState<PackageItemRow[]>([]);
  const [entries, setEntries] = useState<LedgerEntryMeta[]>([]);
  const [headerCount, setHeaderCount] = useState(0);

  const [selected, setSelected] = useState<Set<string>>(new Set());

  /* ------------------------------------------------------------------------ */
  /* LOAD ALL DATA                                                            */
  /* ------------------------------------------------------------------------ */

  const loadAll = useCallback(async () => {
    if (!programId) return;

    console.log("📂 ProjectManager: loading program data…");

    const { data: p } = await supabase
      .from("programs")
      .select("sport, year")
      .eq("id", programId)
      .maybeSingle();

    if (p) {
      setProgramName(`${p.sport ?? "Program"} ${p.year ?? ""}`.trim());
    }

    const [{ data: l }, { data: pkgs }] = await Promise.all([
      supabase
        .from("ledgers")
        .select("id, name")
        .eq("program_id", programId)
        .order("created_at", { ascending: true }),

      supabase
        .from("packages")
        .select("id, name")
        .eq("program_id", programId)
        .order("created_at", { ascending: true }),
    ]);

    const ledgerRows = (l ?? []) as LedgerRow[];
    const packageRows = (pkgs ?? []) as PackageRow[];

    setLedgers(ledgerRows);
    setPackages(packageRows);

    const ledgerIds = ledgerRows.map((lg) => lg.id);
    const packageIds = packageRows.map((pkg) => pkg.id);

    if (ledgerIds.length > 0) {
      const [{ data: headers }, { data: entryRows }] = await Promise.all([
        supabase
          .from("ledger_headers")
          .select("id, ledger_id")
          .in("ledger_id", ledgerIds),

        supabase
          .from("ledger_entries")
          .select("ledger_id, created_at, entity_key")
          .in("ledger_id", ledgerIds),
      ]);

      setHeaderCount(headers?.length ?? 0);
      setEntries((entryRows ?? []) as LedgerEntryMeta[]);
    } else {
      setHeaderCount(0);
      setEntries([]);
    }

    if (packageIds.length > 0) {
      const { data: items } = await supabase
        .from("package_items")
        .select("package_id, ledger_id")
        .in("package_id", packageIds);

      setPackageItems((items ?? []) as PackageItemRow[]);
    } else {
      setPackageItems([]);
    }

    console.log("📂 ProjectManager: load complete.");
  }, [programId]);

  /* ------------------------------------------------------------------------ */
  /* INITIAL LOAD + EVENT SUBSCRIBE                                           */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    const handler = () => {
      console.log("🔄 ProjectManager: program-updated → refreshing");
      loadAll();
    };

    window.addEventListener("program-updated", handler);
    return () => window.removeEventListener("program-updated", handler);
  }, [loadAll]);

  /* ------------------------------------------------------------------------ */
  /* PACKAGE → LEDGER MAPPING                                                 */
  /* ------------------------------------------------------------------------ */

  const packageMap = new Map<string, LedgerRow[]>();
  packages.forEach((pkg) => packageMap.set(pkg.id, []));

  packageItems.forEach((rel) => {
    const ledger = ledgers.find((l) => l.id === rel.ledger_id);
    if (ledger) packageMap.get(rel.package_id)!.push(ledger);
  });

  const packagedLedgerIds = new Set(packageItems.map((i) => i.ledger_id));
  const orphanLedgers = ledgers.filter((l) => !packagedLedgerIds.has(l.id));
  const emptyPackages = packages.filter(
    (p) => (packageMap.get(p.id)?.length ?? 0) === 0
  );

  /* ------------------------------------------------------------------------ */
  /* SELECTION LOGIC                                                          */
  /* ------------------------------------------------------------------------ */

  const toggleSelect = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const selectAll = () => {
    const all = new Set<string>();
    packages.forEach((p) => all.add(`pkg:${p.id}`));
    ledgers.forEach((l) => all.add(`led:${l.id}`));
    setSelected(all);
  };

  const clearAll = () => setSelected(new Set());

  const deleteSelected = async () => {
    const pkgIds = [...selected]
      .filter((k) => k.startsWith("pkg:"))
      .map((k) => k.slice(4));

    const ledgerIds = [...selected]
      .filter((k) => k.startsWith("led:"))
      .map((k) => k.slice(4));

    if (pkgIds.length > 0) {
      await supabase.from("packages").delete().in("id", pkgIds);
    }

    if (ledgerIds.length > 0) {
      await supabase.from("ledgers").delete().in("id", ledgerIds);
    }

    clearAll();
    loadAll();
  };

  /* ------------------------------------------------------------------------ */
  /* RENDER                                                                    */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="w-full h-full overflow-auto p-6 flex flex-col gap-6 bg-[var(--bg)] text-[var(--text-dk)]">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[var(--text-dk)]">
          {programName} Overview
        </h1>

        {selected.size > 0 && (
          <button
            className="
              flex items-center gap-2 
              px-4 py-2 rounded-lg text-sm
              bg-[var(--danger)] text-[var(--text-lt)]
              hover:opacity-80 transition
            "
            onClick={deleteSelected}
          >
            <Trash2 className="w-4 h-4" />
            Delete Selected ({selected.size})
          </button>
        )}
      </div>

      {/* SELECTION BAR */}
      <div className="flex items-center gap-3 text-sm text-[var(--text)]">
        <button className="underline" onClick={selectAll}>
          Select All
        </button>
        <button className="underline" onClick={clearAll}>
          Clear Selection
        </button>
      </div>

      {/* PACKAGES */}
      <Section title="Packages" count={packages.length}>
        {packages.map((pkg) => {
          const children = packageMap.get(pkg.id) ?? [];

          return (
            <div
              key={pkg.id}
              className="
                p-3 rounded-lg 
                border border-[var(--border)]
                bg-[var(--bg)]
                flex flex-col gap-2
              "
            >
              <div className="flex items-center gap-3 text-[var(--text-dk)]">
                <input
                  type="checkbox"
                  checked={selected.has(`pkg:${pkg.id}`)}
                  onChange={() => toggleSelect(`pkg:${pkg.id}`)}
                />
                <span className="font-semibold">{pkg.name}</span>
              </div>

              {children.length === 0 && (
                <div
                  className="
                    ml-6 p-2 rounded 
                    border border-[var(--border)]
                    bg-[var(--bg)]
                    text-sm text-[var(--text)]
                  "
                >
                  Empty package
                </div>
              )}

              {children.map((ledger) => (
                <div
                  key={ledger.id}
                  className="
                    ml-6 p-2 rounded 
                    border border-[var(--border)]
                    bg-[var(--bg)]
                    flex items-center gap-3
                    text-[var(--text-dk)]
                  "
                >
                  <input
                    type="checkbox"
                    checked={selected.has(`led:${ledger.id}`)}
                    onChange={() => toggleSelect(`led:${ledger.id}`)}
                  />
                  <span>{ledger.name ?? "Untitled Ledger"}</span>
                </div>
              ))}
            </div>
          );
        })}

        {packages.length === 0 && (
          <Empty message="No packages in this program." />
        )}
      </Section>

      {/* EMPTY PACKAGES */}
      <Section title="Empty Packages" count={emptyPackages.length}>
        {emptyPackages.map((pkg) => (
          <div
            key={pkg.id}
            className="
              p-3 rounded-lg 
              border border-[var(--border)]
              bg-[var(--bg)]
              flex items-center gap-3
              text-[var(--text-dk)]
            "
          >
            <input
              type="checkbox"
              checked={selected.has(`pkg:${pkg.id}`)}
              onChange={() => toggleSelect(`pkg:${pkg.id}`)}
            />
            <span className="font-medium">{pkg.name}</span>
          </div>
        ))}

        {emptyPackages.length === 0 && (
          <Empty message="No empty packages. Nice and tidy." />
        )}
      </Section>

      {/* ORPHAN LEDGERS */}
      <Section title="Ledgers Without Packages" count={orphanLedgers.length}>
        {orphanLedgers.map((l) => (
          <div
            key={l.id}
            className="
              p-3 rounded-lg 
              border border-[var(--border)]
              bg-[var(--bg)]
              flex items-center justify-between
              text-[var(--text-dk)]
            "
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selected.has(`led:${l.id}`)}
                onChange={() => toggleSelect(`led:${l.id}`)}
              />
              <span className="font-medium">{l.name ?? "Untitled Ledger"}</span>
            </div>
            <span className="text-xs text-[var(--text)]">
              Ledger ID: {l.id}
            </span>
          </div>
        ))}

        {orphanLedgers.length === 0 && (
          <Empty message="No un-packaged ledgers." />
        )}
      </Section>
    </div>
  );
}
