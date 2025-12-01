"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Users,
  Trash2,
  Database,
} from "lucide-react";

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

interface LargestLedgerStat {
  ledgerId: string;
  ledgerName: string;
  rowCount: number;
}

interface RecentlyActiveAthlete {
  key: string;
  lastActive: string;
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
    <div className="border rounded-xl bg-card overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex justify-between items-center px-4 py-3 text-left"
      >
        <span className="font-semibold">{title}</span>
        <span className="text-muted-foreground">{open ? "−" : "+"}</span>
      </button>

      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

export default function ProjectManager({ programId }: ProjectManagerProps) {
  const [programName, setProgramName] = useState("Program");

  const [ledgers, setLedgers] = useState<LedgerRow[]>([]);
  const [packages, setPackages] = useState<PackageRow[]>([]);
  const [packageItems, setPackageItems] = useState<PackageItemRow[]>([]);

  const [entries, setEntries] = useState<LedgerEntryMeta[]>([]);
  const [headerCount, setHeaderCount] = useState<number>(0);

  const [selected, setSelected] = useState<Set<string>>(new Set());

  /* ---------------------------------------------------------------------- */
  /* LOAD PROGRAM + DATA                                                   */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!programId) return;

    const load = async () => {
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

      const ledgersData = (l ?? []) as LedgerRow[];
      const packagesData = (pkgs ?? []) as PackageRow[];

      setLedgers(ledgersData);
      setPackages(packagesData);

      const ledgerIds = ledgersData.map((lg) => lg.id);
      const packageIds = packagesData.map((pkg) => pkg.id);

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
    };

    load();
  }, [programId]);

  /* ---------------------------------------------------------------------- */
  /* DERIVED: PACKAGES → LEDGERS                                           */
  /* ---------------------------------------------------------------------- */

  const packageMap = new Map<string, LedgerRow[]>();
  packages.forEach((pkg) => packageMap.set(pkg.id, []));

  packageItems.forEach((rel) => {
    const ledger = ledgers.find((l) => l.id === rel.ledger_id);
    if (ledger) {
      packageMap.get(rel.package_id)!.push(ledger);
    }
  });

  const packagedLedgerIds = new Set(packageItems.map((i) => i.ledger_id));
  const orphanLedgers = ledgers.filter((l) => !packagedLedgerIds.has(l.id));
  const emptyPackages = packages.filter(
    (p) => (packageMap.get(p.id)?.length ?? 0) === 0
  );

  /* ---------------------------------------------------------------------- */
  /* DERIVED: STORAGE + ATHLETES                                           */
  /* ---------------------------------------------------------------------- */

  const totalRows = entries.length;

  const rowsByLedger = new Map<string, number>();
  entries.forEach((e) => {
    rowsByLedger.set(e.ledger_id, (rowsByLedger.get(e.ledger_id) ?? 0) + 1);
  });

  const largestLedgers: LargestLedgerStat[] = [...rowsByLedger.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([ledgerId, rowCount]) => ({
      ledgerId,
      ledgerName:
        ledgers.find((l) => l.id === ledgerId)?.name ?? "Untitled Ledger",
      rowCount,
    }));

  const allKeys = entries
    .map((e) => e.entity_key)
    .filter((k): k is string => !!k && k.trim() !== "");

  const uniqueAthletes = new Set(allKeys);
  const totalAthletes = uniqueAthletes.size;

  const now = Date.now();
  const DAY = 1000 * 60 * 60 * 24;

  const active7 = new Set<string>();
  const active30 = new Set<string>();
  const lastActivity = new Map<string, number>();

  entries.forEach((e) => {
    if (!e.entity_key) return;

    const key = e.entity_key.trim();
    const ts = new Date(e.created_at).getTime();
    const delta = now - ts;

    if (delta <= 7 * DAY) active7.add(key);
    if (delta <= 30 * DAY) active30.add(key);

    const prev = lastActivity.get(key);
    if (!prev || ts > prev) lastActivity.set(key, ts);
  });

  const recentlyActive: RecentlyActiveAthlete[] = [...lastActivity.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([key, ts]) => ({
      key,
      lastActive: new Date(ts).toISOString(),
    }));

  /* ---------------------------------------------------------------------- */
  /* SELECTION                                                              */
  /* ---------------------------------------------------------------------- */

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

    if (pkgIds.length > 0)
      await supabase.from("packages").delete().in("id", pkgIds);

    if (ledgerIds.length > 0)
      await supabase.from("ledgers").delete().in("id", ledgerIds);

    clearAll();
  };

  /* ---------------------------------------------------------------------- */
  return (
    <div className="w-full h-full overflow-auto p-6 flex flex-col gap-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{programName} Overview</h1>

        {selected.size > 0 && (
          <button
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm"
            onClick={deleteSelected}
          >
            <Trash2 className="w-4 h-4" />
            Delete Selected ({selected.size})
          </button>
        )}
      </div>

      {/* STORAGE + ATHLETES */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Collapsible title="Storage Usage" defaultOpen={false}>
          <StorageUsageCard
            totalRows={totalRows}
            headerCount={headerCount}
            largestLedgers={largestLedgers}
          />
        </Collapsible>

        <Collapsible title="Athletes" defaultOpen={false}>
          <AthleteUsageCard
            totalAthletes={totalAthletes}
            active7={active7.size}
            active30={active30.size}
            recentlyActive={recentlyActive}
          />
        </Collapsible>
      </div> */}

      {/* SELECTION */}
      <div className="flex items-center gap-3 text-sm">
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
              className="p-3 rounded-lg border bg-card flex flex-col gap-2"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selected.has(`pkg:${pkg.id}`)}
                  onChange={() => toggleSelect(`pkg:${pkg.id}`)}
                />
                <span className="font-semibold">{pkg.name}</span>
              </div>

              {children.length === 0 && (
                <div className="ml-6 p-2 rounded border bg-muted/20 text-sm text-muted-foreground">
                  Empty package
                </div>
              )}

              {children.map((ledger) => (
                <div
                  key={ledger.id}
                  className="ml-6 p-2 rounded border bg-muted/20 flex items-center gap-3"
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
            className="p-3 rounded-lg border bg-card flex items-center gap-3"
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
      <Section
        title="Ledgers Without Packages"
        count={orphanLedgers.length}
      >
        {orphanLedgers.map((l) => (
          <div
            key={l.id}
            className="p-3 rounded-lg border bg-card flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selected.has(`led:${l.id}`)}
                onChange={() => toggleSelect(`led:${l.id}`)}
              />
              <span className="font-medium">{l.name ?? "Untitled Ledger"}</span>
            </div>
            <span className="text-xs text-muted-foreground">
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

/* -------------------------------------------------------------------------- */
/* SECTION — now fully collapsible                                            */
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
  const label =
    typeof count === "number" ? `${title} (${count})` : title;

  return (
    <Collapsible title={label} defaultOpen={false}>
      <div className="flex flex-col gap-2">{children}</div>
    </Collapsible>
  );
}

function Empty({ message }: { message: string }) {
  return (
    <div className="text-sm text-muted-foreground p-3 border rounded-lg bg-muted/20">
      {message}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* STORAGE CARD                                                               */
/* -------------------------------------------------------------------------- */

function StorageUsageCard({
  totalRows,
  headerCount,
  largestLedgers,
}: {
  totalRows: number;
  headerCount: number;
  largestLedgers: LargestLedgerStat[];
}) {
  const estimatedBytes = estimateStorageBytes(totalRows, headerCount);

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-4 text-sm">
        <Stat label="Rows" value={totalRows} />
        <Stat label="Columns" value={headerCount} />
        <Stat label="Est. Storage" value={formatBytes(estimatedBytes)} />
      </div>

      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-1">
          Largest Ledgers
        </p>

        {largestLedgers.length === 0 && (
          <p className="text-xs text-muted-foreground">None</p>
        )}

        {largestLedgers.map((l) => (
          <div
            key={l.ledgerId}
            className="flex justify-between items-center text-xs border rounded-lg px-3 py-2 bg-muted/20 mb-1"
          >
            <span className="truncate max-w-[60%]">{l.ledgerName}</span>
            <span className="text-muted-foreground">{l.rowCount} rows</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* ATHLETE CARD                                                               */
/* -------------------------------------------------------------------------- */

function AthleteUsageCard({
  totalAthletes,
  active7,
  active30,
  recentlyActive,
}: {
  totalAthletes: number;
  active7: number;
  active30: number;
  recentlyActive: RecentlyActiveAthlete[];
}) {
  const inactive = Math.max(totalAthletes - active30, 0);

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-4 text-sm">
        <Stat label="Active (7d)" value={active7} />
        <Stat label="Active (30d)" value={active30} />
        <Stat label="Inactive" value={inactive} />
      </div>

      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-1">
          Recently Active
        </p>

        {recentlyActive.length === 0 && (
          <p className="text-xs text-muted-foreground">None</p>
        )}

        {recentlyActive.map((a) => (
          <div
            key={a.key}
            className="flex justify-between items-center text-xs border rounded-lg px-3 py-2 bg-muted/20 mb-1"
          >
            <span className="truncate max-w-[60%]">{a.key}</span>
            <span className="text-muted-foreground">
              {formatDateShort(a.lastActive)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

function Stat({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="p-3 rounded-lg border bg-muted/20">
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}

function estimateStorageBytes(rows: number, headers: number): number {
  const BYTES_PER_ROW = 150;
  const BYTES_PER_HEADER = 300;
  return rows * BYTES_PER_ROW + headers * BYTES_PER_HEADER;
}

function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[i]}`;
}

function formatDateShort(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
