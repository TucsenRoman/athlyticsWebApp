"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/overlays/dialog";

import { Button } from "@/components/ui/actions/button";
import { Archive } from "lucide-react";

type ArchiveProgram = {
  id: number;
  sport: string;
  year: string;
  school: string | null;
};

interface ProgramArchiveModalProps {
  open: boolean;
  program: ArchiveProgram | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ProgramArchiveModal({
  open,
  program,
  onClose,
  onConfirm,
}: ProgramArchiveModalProps) {
  if (!program) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Archive className="h-4 w-4 text-[var(--warning)]" />
            Archive Program
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm text-[var(--text)]">
          <p>
            This will archive <strong>{program.sport}</strong> ({program.year})
            {program.school && <> at <strong>{program.school}</strong></>}.
          </p>

          <p className="text-[var(--text-muted)]">
            Archived programs are hidden from active views but can be restored later.
          </p>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>

          <Button
            variant="warning"
            onClick={onConfirm}
            className="flex items-center gap-2"
          >
            <Archive className="h-4 w-4" />
            Archive
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
