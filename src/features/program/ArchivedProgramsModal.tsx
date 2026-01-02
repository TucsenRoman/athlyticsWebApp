"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/overlays/dialog";

import { Button } from "@/components/ui/actions/button";
import { ArchiveRestore, Archive } from "lucide-react";

type ArchivedProgram = {
  id: number;
  school: string | null;
  sport: string;
  year: string;
  archived_at?: string | null;
};

interface ArchivedProgramsModalProps {
  open: boolean;
  programs: ArchivedProgram[];
  onClose: () => void;

  // restore intent only — no DB assumptions
  onRestore: (id: number) => void;
}

export default function ArchivedProgramsModal({
  open,
  programs,
  onClose,
  onRestore,
}: ArchivedProgramsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Archive className="h-4 w-4 text-[var(--warning)]" />
            Archived Programs
          </DialogTitle>
        </DialogHeader>

        {programs.length === 0 ? (
          <div className="py-8 text-center text-sm text-[var(--text-muted)]">
            No archived programs
          </div>
        ) : (
          <div className="mt-2 space-y-2 max-h-[320px] overflow-y-auto">
            {programs.map((p) => (
              <div
                key={p.id}
                className="
                  flex items-center justify-between
                  rounded-lg border border-[var(--border)]
                  px-3 py-2
                  bg-[var(--gray-2)]
                "
              >
                <div className="min-w-0">
                  <div className="font-medium text-sm text-[var(--text-dk)] truncate">
                    {p.sport} • {p.year}
                  </div>

                  {p.school && (
                    <div className="text-xs text-[var(--text)] truncate">
                      {p.school}
                    </div>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => onRestore(p.id)}
                >
                  <ArchiveRestore className="h-4 w-4" />
                  Restore
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
