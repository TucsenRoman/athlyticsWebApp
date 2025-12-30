import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/overlays/dialog";
import { Button } from "@/components/ui/actions/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/forms/select";
import { supabase } from "@/integrations/supabase/client";
import type { TablesUpdate } from "@/integrations/supabase/types";

interface MoveLedgerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ledgerId: string;
}

export default function MoveLedger({
  open,
  onOpenChange,
  ledgerId,
}: MoveLedgerProps) {
  const [programs, setPrograms] = useState<any[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 🧭 Load available programs when dialog opens
  useEffect(() => {
    const fetchPrograms = async () => {
      const { data, error } = await supabase
        .from("programs")
        .select("id, sport, level, gender, school, season_year")
        .order("season_year", { ascending: false });

      if (error) {
        console.error(error);
      } else {
        setPrograms(data || []);
      }
    };

    if (open) fetchPrograms();
  }, [open]);

  // 🔄 Move the ledger
  const handleMove = async () => {
    if (!selectedProgram) {
      return;
    }

    setLoading(true);
    try {
      // ✅ Type-safe partial update including required Radar `icon`
      const updatePayload: TablesUpdate<"ledgers"> = {
        program_id: selectedProgram,
        icon: "", // ✅ Required to satisfy Supabase type
        favorite: null, //COME BACK TO THIS AND ACTUALLY FIX IT.
      };

      const { error } = await supabase
        .from("ledgers")
        .update(updatePayload)
        .eq("id", ledgerId);

      if (error) throw error;

      onOpenChange(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Move Ledger to Another Program</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Select
            onValueChange={setSelectedProgram}
            value={selectedProgram ?? ""}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a program..." />
            </SelectTrigger>
            <SelectContent>
              {programs.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.school} — {p.sport} ({p.level}, {p.gender},{" "}
                  {p.season_year})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleMove} disabled={loading}>
            {loading ? "Moving..." : "Move Ledger"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
