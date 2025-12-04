"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
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

  /* --------------------------------------------------------------- */
  /* FUZZY SEARCH: initialize Fuse for EACH package's ledgers        */
  /* --------------------------------------------------------------- */

  const fuseOptions = useMemo(
    () => ({
      keys: ["name"],
      threshold: 0.35, // lower = stricter, higher = fuzzier
    }),
    []
  );

  // Build Fuse instances for each package only once
  const fusePerPackage = useMemo(() => {
    const map: Record<string, Fuse<LedgerTab>> = {};

    packageLedgers.forEach((pkg) => {
      map[pkg.packageId] = new Fuse(pkg.ledgers, fuseOptions);
    });

    return map;
  }, [packageLedgers, fuseOptions]);

  /* --------------------------------------------------------------- */
  /* Apply fuzzy filtering                                           */
  /* --------------------------------------------------------------- */
  const filteredPackages = useMemo(() => {
    if (!search.trim()) return packageLedgers;

    return packageLedgers
      .map((pkg) => {
        const fuse = fusePerPackage[pkg.packageId];
        const matches = fuse.search(search).map((r) => r.item);

        return {
          ...pkg,
          ledgers: matches,
        };
      })
      .filter((pkg) => pkg.ledgers.length > 0);
  }, [search, packageLedgers, fusePerPackage]);

  /* --------------------------------------------------------------- */
  /* RENDER                                                         */
  /* --------------------------------------------------------------- */

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg p-0">
        <DialogHeader className="px-6 pt-6 pb-3 border-b border-[hsl(var(--gray-200))]">
          <DialogTitle>Select Ledger</DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4 border-b border-[hsl(var(--gray-200))]">
          <Input
            placeholder="Search ledgers…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <ScrollArea className="max-h-[400px]">
          <div className="px-6 py-4 space-y-6">
            {filteredPackages.map((pkg) => (
              <div key={pkg.packageId}>
                <div className="text-[13px] font-semibold text-[hsl(var(--gray-500))] mb-2">
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
                          w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm
                          ${
                            disabled
                              ? "text-[hsl(var(--gray-400))] bg-[hsl(var(--gray-100))] cursor-not-allowed"
                              : "hover:bg-[hsl(var(--gray-100))] text-[hsl(var(--gray-800))]"
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

            {/* No results fallback */}
            {filteredPackages.length === 0 && (
              <div className="text-sm text-[hsl(var(--gray-500))] px-2 py-6 text-center">
                No matching ledgers found.
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
