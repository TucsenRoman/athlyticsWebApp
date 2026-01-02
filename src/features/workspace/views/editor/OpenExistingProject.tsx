"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/overlays/dialog";
import { Input } from "@/components/ui/forms/input";
import { ScrollArea } from "@/components/ui/layout/scroll-area";
import { FileText } from "lucide-react";
import { useState, useMemo } from "react";
import Fuse from "fuse.js";

interface LedgerTab {
  id: string;
  name: string;
}

interface PackageLedgerGroup {
  packageName: string;
  packageId: string;
  ledgers: LedgerTab[];
}

interface OpenExistingProjectProps {
  open: boolean;
  setOpen: (v: boolean) => void;
  existingLedgers: LedgerTab[];
  packageLedgers: PackageLedgerGroup[];
  onSelectLedger: (id: string) => void;
}

export default function OpenExistingProject({
  open,
  setOpen,
  existingLedgers,
  packageLedgers,
  onSelectLedger,
}: OpenExistingProjectProps) {
  const [search, setSearch] = useState("");
  const existingIds = new Set(existingLedgers.map((l) => l.id));

  /* Fuzzy search setup --------------------------------------------------- */

  const fuseOptions = useMemo(
    () => ({
      keys: ["name"],
      threshold: 0.35,
    }),
    []
  );

  const fusePerPackage = useMemo(() => {
    const map: Record<string, Fuse<LedgerTab>> = {};

    packageLedgers.forEach((pkg) => {
      map[pkg.packageId] = new Fuse(pkg.ledgers, fuseOptions);
    });

    return map;
  }, [packageLedgers, fuseOptions]);

  const filteredPackages = useMemo(() => {
    if (!search.trim()) return packageLedgers;

    return packageLedgers
      .map((pkg) => {
        const fuse = fusePerPackage[pkg.packageId];
        const matches = fuse.search(search).map((r) => r.item);

        return { ...pkg, ledgers: matches };
      })
      .filter((pkg) => pkg.ledgers.length > 0);
  }, [search, packageLedgers, fusePerPackage]);

  /* Render --------------------------------------------------------------- */

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg p-0 bg-[var(--bg)] border-[var(--border)]">
        <DialogHeader
          className="
            px-6 pt-6 pb-3 
            border-b border-[var(--border)]
            text-[var(--text-dk)]
          "
        >
          <DialogTitle className="text-[var(--text-dk)]">
            Select Ledger
          </DialogTitle>
        </DialogHeader>

        {/* SEARCH BAR */}
        <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--bg)]">
          <Input
            placeholder="Search ledgers…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-[var(--text-dk)]"
          />
        </div>

        {/* RESULTS LIST */}
        <ScrollArea className="max-h-[400px]">
          <div className="px-6 py-4 space-y-6">

            {filteredPackages.map((pkg) => (
              <div key={pkg.packageId}>
                <div className="text-[13px] font-semibold text-[var(--text)] mb-2">
                  {pkg.packageName}
                </div>

                <div className="space-y-1">
                  {pkg.ledgers.map((l) => {
                    const disabled = existingIds.has(l.id);

                    return (
                      <button
                        key={l.id}
                        disabled={disabled}
                        onClick={() => {
                          if (!disabled) {
                            onSelectLedger(l.id);
                            setOpen(false);
                          }
                        }}
                        className={`
                          w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition
                          ${
                            disabled
                              ? "bg-[var(--gray-ltt)] text-[var(--text)] cursor-not-allowed"
                              : "text-[var(--text-dk)] hover:bg-[var(--gray-ltt)]"
                          }
                        `}
                      >
                        <FileText size={16} />
                        {l.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Empty State */}
            {filteredPackages.length === 0 && (
              <div className="text-sm text-[var(--text)] px-2 py-6 text-center">
                No matching ledgers found.
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
