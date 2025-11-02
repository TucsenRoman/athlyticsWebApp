import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";

interface ConfirmationDialogProps {
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: ButtonVariant;
  onConfirm: () => void | Promise<void>;
  asChild?: boolean;
  children?: React.ReactNode;
}

export default function ConfirmationDialog({
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmVariant = "destructive",
  onConfirm,
  asChild,
  children,
}: ConfirmationDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild={asChild}>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-sm bg-card">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">{message}</p>
        <DialogFooter className="mt-4 flex justify-end gap-2">
          <Button variant="outline">{cancelLabel}</Button>
          <Button
            variant={confirmVariant}
            onClick={async () => {
              await onConfirm();
            }}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
