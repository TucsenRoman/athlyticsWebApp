import { toast } from "sonner";

interface UndoToastOptions {
  message: string;
  onUndo: () => void | Promise<void>;
  duration?: number;
}

export const useUndoToast = () => {
  const showUndoToast = ({ message, onUndo, duration = 5000 }: UndoToastOptions) => {
    toast(message, {
      duration,
      action: {
        label: "Undo",
        onClick: () => {
          onUndo();
          toast.success("Action undone");
        },
      },
    });
  };

  return { showUndoToast };
};
