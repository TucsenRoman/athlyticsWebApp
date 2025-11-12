import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ArrowRight, ArrowLeftRight, Unlink } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function RouteInfo({ open, onClose, column, onUpdated }: any) {
  const [direction, setDirection] = useState(column?.route_direction || "one-way");
  const [permission, setPermission] = useState(column?.permission_level || "coach");
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const isTwoWay = direction === "two-way";

  // 🔁 Reset state whenever the dialog opens or column changes
  useEffect(() => {
    if (open && column) {
      setDirection(column.route_direction || "one-way");
      setPermission(column.permission_level || "coach");
      setConfirming(false);
    }
  }, [open, column]);

  /* ----------------------- Save Updates ----------------------- */
  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("ledger_headers")
      .update({
        route_direction: direction,
        permission_level: isTwoWay ? permission : "locked",
      })
      .eq("id", column.id);

    setSaving(false);
    if (error) return toast.error("Failed to update route.");
    toast.success("Route updated.");
    onUpdated?.();
    onClose();
  };

  /* ----------------------- Remove Routing ----------------------- */
  const handleUnroute = async () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }

    const { error } = await supabase
      .from("ledger_headers")
      .update({
        is_routed: false,
        source_ledger_id: null,
        source_column_id: null,
        route_direction: "one-way",
        permission_level: "locked",
      })
      .eq("id", column.id);

    if (error) return toast.error("Failed to remove route.");
    toast.success("Routing removed — links disconnected.");
    onUpdated?.();
    onClose();
  };

  /* ----------------------- Handle Close (Cancel or X) ----------------------- */
  const handleCancel = () => {
    // Reset before closing
    setDirection(column?.route_direction || "one-way");
    setPermission(column?.permission_level || "coach");
    setConfirming(false);
    onClose();
  };

  /* ----------------------- Render ----------------------- */
  if (!column) return null;

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleCancel()}>
      <DialogContent className="sm:max-w-md p-6 rounded-2xl border border-gray-200 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-center">
            Route Information
          </DialogTitle>
          <p className="text-xs text-muted-foreground text-center mt-1">
            {column?.name}
          </p>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="mt-5 space-y-6"
        >
          {/* Sync Direction */}
          <div>
            <Label className="text-sm font-medium">Sync Direction</Label>
            <div className="flex items-center justify-center gap-3 mt-2">
              <button
                onClick={() => setDirection("one-way")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md border transition-all text-sm ${
                  direction === "one-way"
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "border-gray-300 hover:bg-gray-100"
                }`}
              >
                <ArrowRight size={14} /> One-Way
              </button>
              <button
                onClick={() => setDirection("two-way")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md border transition-all text-sm ${
                  direction === "two-way"
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "border-gray-300 hover:bg-gray-100"
                }`}
              >
                <ArrowLeftRight size={14} /> Two-Way
              </button>
            </div>
          </div>

          {/* Permission Level */}
          {isTwoWay && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-2"
            >
              <Label className="text-sm font-medium">Who Can Edit</Label>
              <Select value={permission} onValueChange={setPermission}>
                <SelectTrigger>
                  <SelectValue placeholder="Select permission level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="read-only">Read only</SelectItem>
                  <SelectItem value="coach">Coaches only</SelectItem>
                  <SelectItem value="everyone">Everyone</SelectItem>
                </SelectContent>
              </Select>
            </motion.div>
          )}

          {/* Route Path */}
          <div className="border-t pt-3 text-sm">
            <div className="text-muted-foreground mb-1">Linked Path</div>
            <div className="font-medium">
              {column.source_ledger_name && column.source_column_name
                ? `${column.source_ledger_name} › ${column.source_column_name}`
                : "Unknown source"}
            </div>
          </div>
        </motion.div>

        <DialogFooter className="mt-6 flex justify-between items-start">
          {/* Left: Remove / Warning */}
          <div className="flex flex-col gap-2">
            {confirming && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-md max-w-[230px]">
                Removing routing will disconnect linked columns but keep their data.  
                Click again to confirm.
              </div>
            )}
            <Button
              variant="destructive"
              size="sm"
              className="flex items-center gap-1"
              onClick={handleUnroute}
            >
              <Unlink size={14} />
              {confirming ? "Confirm Remove" : "Remove Routing"}
            </Button>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex gap-2 items-center">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
