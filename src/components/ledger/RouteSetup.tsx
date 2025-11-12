import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Info } from "lucide-react";
import { toast } from "sonner";

interface RouteSetupProps {
  currentLedgerId: string;
  open: boolean;
  onClose: () => void;
  column: any;
  onRouted: () => void;
}

export default function RouteSetup({
  currentLedgerId,
  open,
  onClose,
  column,
  onRouted,
}: RouteSetupProps) {
  const [mode, setMode] = useState<"create" | "connect">("create");

  // Shared state
  const [direction, setDirection] = useState<"one-way" | "two-way">("one-way");
  const [permission, setPermission] = useState<"coach" | "everyone">("coach");
  const [loading, setLoading] = useState(false);

  // Create tab
  const [currentColumns, setCurrentColumns] = useState<any[]>([]);
  const [selectedSource, setSelectedSource] = useState("");

  // Connect tab
  const [routes, setRoutes] = useState<any[]>([]);
  const [selectedRoute, setSelectedRoute] = useState("");

  /* ---------------- Reset on open ---------------- */
  useEffect(() => {
    if (!open) return;
    setMode("create");
    setSelectedRoute("");
    setDirection("one-way");
    setPermission("coach");
  }, [open]);

  /* ---------------- Load columns (Create) ---------------- */
  useEffect(() => {
    if (!open || mode !== "create") return;
    (async () => {
      const { data, error } = await supabase
        .from("ledger_headers")
        .select("id, name")
        .eq("ledger_id", currentLedgerId)
        .order("name");

      if (error) return console.error("Failed to load columns:", error);

      setCurrentColumns(data || []);

      // ✅ Auto-select current column if exists
      if (column?.id) setSelectedSource(column.id);
    })();
  }, [open, currentLedgerId, mode, column?.id]);

  /* ---------------- Load routes (Connect) ---------------- */
  useEffect(() => {
    if (!open || mode !== "connect") return;
    (async () => {
      const { data, error } = await supabase
        .from("ledger_headers")
        .select(
          `
          id,
          name,
          ledger_id,
          ledgers:ledger_id (id, name)
        `
        )
        .eq("is_routed", true)
        .neq("ledger_id", currentLedgerId)
        .order("created_at", { ascending: false })
        .limit(25);

      if (error) {
        console.error("Failed to load routes:", error);
        return;
      }

      const rows = (data as any[]) || [];
      const paths = rows.map((r) => ({
        id: r.id,
        ledger_id: r.ledger_id,
        label: `${r.ledgers?.name || "Unknown Ledger"} → ${r.name}`,
      }));
      setRoutes(paths);
    })();
  }, [open, mode, currentLedgerId]);

  /* ---------------- Handle CREATE ---------------- */
  const handleCreate = async () => {
    if (!selectedSource)
      return toast.error("Select a source column first.");

    setLoading(true);
    try {
      const { error } = await supabase
        .from("ledger_headers")
        .update({
          is_routed: true,
          source_ledger_id: currentLedgerId,
          source_column_id: selectedSource,
          route_direction: direction,
          permission_level:
            direction === "two-way" ? permission : "locked",
        })
        .eq("id", column.id);

      if (error) throw error;

      toast.success("Route created successfully!");
      onRouted?.();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create route.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Handle CONNECT ---------------- */
  const handleConnect = async () => {
    if (!selectedRoute)
      return toast.error("Select an existing route path first.");

    const target = routes.find((r) => r.id === selectedRoute);
    if (target && target.ledger_id === currentLedgerId) {
      toast.error("Cannot connect to a route in the same ledger.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("ledger_headers")
        .update({
          is_routed: true,
          source_column_id: selectedRoute,
          route_direction: direction,
          permission_level:
            direction === "two-way" ? permission : "locked",
        })
        .eq("id", column.id);

      if (error) throw error;

      toast.success("Connected to existing route!");
      onRouted?.();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to connect route.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Derived labels ---------------- */
  const selectedSourceLabel = useMemo(() => {
    const found = currentColumns.find((c) => c.id === selectedSource);
    return found?.name || column?.name || "—";
  }, [selectedSource, currentColumns, column?.name]);

  /* ---------------- Render ---------------- */
  return (
    <TooltipProvider delayDuration={0}>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg p-6 rounded-2xl border border-gray-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-center">
              {mode === "connect" ? "Connect Route" : "Create Route"}
            </DialogTitle>
            <p className="text-xs text-muted-foreground text-center mt-1">
              Routing <span className="font-medium">{selectedSourceLabel}</span>
            </p>
          </DialogHeader>

          <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="mt-4">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="create">Create</TabsTrigger>
              <TabsTrigger value="connect">Connect</TabsTrigger>
            </TabsList>

            {/* ================= CREATE TAB ================= */}
            <TabsContent value="create">
              <div className="space-y-6">
                {/* Source Column */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-1">
                    Source Column
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info size={14} className="text-muted-foreground cursor-pointer" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs max-w-[220px]">
                        Choose which column this one should pull data from.
                      </TooltipContent>
                    </Tooltip>
                  </Label>

                  <Select
                    value={selectedSource}
                    onValueChange={setSelectedSource}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a column" />
                    </SelectTrigger>
                    <SelectContent>
                      {currentColumns.length > 0 ? (
                        currentColumns.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem disabled value="none">
                          No columns available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sync Direction + Permissions */}
                <div className="border rounded-lg p-3 bg-gray-50">
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
                      → One-Way
                    </button>
                    <button
                      onClick={() => setDirection("two-way")}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-md border transition-all text-sm ${
                        direction === "two-way"
                          ? "border-primary bg-primary/10 text-primary font-medium"
                          : "border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      ↔ Two-Way
                    </button>
                  </div>

                  {direction === "two-way" && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-4"
                    >
                      <Label className="text-sm font-medium">
                        Who Can Edit
                      </Label>
                      <Select
                        value={permission}
                        onValueChange={(val) =>
                          setPermission(val as "coach" | "everyone")
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select permission" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="coach">Coaches only</SelectItem>
                          <SelectItem value="everyone">Everyone</SelectItem>
                        </SelectContent>
                      </Select>
                    </motion.div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* ================= CONNECT TAB ================= */}
            <TabsContent value="connect">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Existing Route Paths
                  </Label>
                  <Select
                    value={selectedRoute}
                    onValueChange={setSelectedRoute}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a route path" />
                    </SelectTrigger>
                    <SelectContent>
                      {routes.length > 0 ? (
                        routes.map((r) => (
                          <SelectItem key={r.id} value={r.id}>
                            {r.label}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem disabled value="none">
                          No existing routes found
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="border rounded-lg p-3 bg-gray-50">
                  <Label className="text-sm font-medium">
                    Edit Permissions
                  </Label>
                  <Select
                    value={permission}
                    onValueChange={(val) =>
                      setPermission(val as "coach" | "everyone")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select permission" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="coach">Coaches only</SelectItem>
                      <SelectItem value="everyone">Everyone</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6 flex justify-between">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              disabled={loading}
              onClick={mode === "create" ? handleCreate : handleConnect}
            >
              {loading
                ? "Processing..."
                : mode === "create"
                ? "Create Route"
                : "Connect Route"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
