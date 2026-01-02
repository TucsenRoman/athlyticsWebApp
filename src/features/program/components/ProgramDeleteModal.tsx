// src/components/program/ProgramDeleteModal.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/overlays/dialog";
import { Button } from "@/components/ui/actions/button";

interface Program {
  id: number;
  school: string;
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
      <DialogContent className="sm:max-w-md bg-[var(--gray-lt)] rounded-lg">
        <DialogHeader>
          <DialogTitle>Delete Program?</DialogTitle>
        </DialogHeader>

        <p className="text-center text-sm text-[var(--text)]">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-[var(--dom-dk)]">
            {program?.school} {program?.sport}, {program?.season_year}
          </span>
          ? This action{" "}
          <span className="font-bold">
            cannot be undone.
          </span>
        </p>

        <div className="flex flex-col gap-2 mt-5">
          <Button variant="danger" onClick={onConfirm}>
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
