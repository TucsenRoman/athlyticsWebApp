import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CopyLedgerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ledgerId: string;
}

export default function CopyLedger({ open, onOpenChange, ledgerId }: CopyLedgerProps) {
  const [programs, setPrograms] = useState<any[]>([]);
  const [targetProgramId, setTargetProgramId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 🧠 Load user’s programs
  useEffect(() => {
    const fetchPrograms = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("programs")
        .select("*")
        .eq("coach_id", user.id)
        .order("created_at", { ascending: false });

      if (error) console.error(error);
      else setPrograms(data || []);
    };

    if (open) fetchPrograms();
  }, [open]);

  // 🔁 Copy ledger to another program
  const handleDuplicate = async () => {
    if (!ledgerId || !targetProgramId) return;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      // Fetch source ledger
      const { data: ledger } = await supabase
        .from("ledgers")
        .select("*")
        .eq("id", ledgerId)
        .single();

      if (!ledger) throw new Error("Ledger not found");

      // Create new ledger in the target program
      const { data: newLedger, error: insertErr } = await supabase
        .from("ledgers")
        .insert([
          {
            coach_id: user.id,
            program_id: targetProgramId,
            name: `${ledger.name} (Copy)`,
            description: ledger.description || "",
            icon: ledger.icon || "ClipboardList",
            status: "active",
            favorite: null, //!!!
          },
        ])
        .select()
        .single();

      if (insertErr || !newLedger) throw insertErr;

      // Copy headers
      const { data: headers } = await supabase
        .from("ledger_headers")
        .select("*")
        .eq("ledger_id", ledger.id);

      if (headers?.length)
        await supabase.from("ledger_headers").insert(
          headers.map((h: any) => ({
            ledger_id: newLedger.id,
            name: h.name,
            type: h.type,
            options: h.options,
            formula: h.formula,
            is_locked: h.is_locked,
          }))
        );

      // Copy entries
      const { data: entries } = await supabase
        .from("ledger_entries")
        .select("*")
        .eq("ledger_id", ledger.id);

      if (entries?.length)
        await supabase.from("ledger_entries").insert(
          entries.map((e: any) => ({
            ledger_id: newLedger.id,
            entity_name: e.entity_name,
            values: e.values,
          }))
        );

      toast.success("Ledger duplicated successfully!");
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to duplicate ledger.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card">
        <DialogHeader>
          <DialogTitle>Duplicate Ledger to Program</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <Select
            value={targetProgramId ?? ""}
            onValueChange={setTargetProgramId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a program" />
            </SelectTrigger>
            <SelectContent>
              {programs.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.school} {p.sport} {p.level} ({p.season_year})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleDuplicate} disabled={!targetProgramId || loading}>
            {loading ? "Duplicating..." : "Duplicate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
