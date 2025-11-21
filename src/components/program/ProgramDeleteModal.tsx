// src/components/program/ProgramDeleteModal.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Program {
  id: number;
  sport: string;
  season_year: string;
}

interface Props {
  open: boolean;
  program: Program | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function ProgramDeleteModal({
  open,
  program,
  onClose,
  onConfirm,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card">
        <DialogHeader>
          <DialogTitle>Delete Program?</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete{" "}
          <span className="font-semibold">
            {program?.sport} • {program?.season_year}
          </span>
          ? This action cannot be undone.
        </p>

        <div className="flex flex-col gap-2 mt-5">
          <Button variant="destructive" onClick={onConfirm}>
            Delete Program
          </Button>

          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
