"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  programId: number | null;
}

export default function NewPackageOrLedgerDialog({ open, onOpenChange, programId }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add New</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* CREATE PACKAGE */}
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => {
              console.log("Create new package");
              // open package create modal here
              onOpenChange(false);
            }}
          >
            + Create Package
          </Button>

          {/* CREATE LEDGER */}
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => {
              console.log("Create new ledger for program", programId);
              // open ledger create modal here
              onOpenChange(false);
            }}
          >
            + Create Ledger
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
