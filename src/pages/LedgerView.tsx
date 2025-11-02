import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";

type LedgerRow = Tables<"ledgers">;

export default function LedgerView() {
  const { ledgerId } = useParams<{ ledgerId: string }>();
  const navigate = useNavigate();

  const [ledger, setLedger] = useState<LedgerRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const fetchLedger = async () => {
      if (!ledgerId) return;
      const { data, error } = await supabase
        .from("ledgers")
        .select("*")
        .eq("id", ledgerId)
        .single();

      if (error) console.error("Error loading ledger:", error);
      else setLedger(data);
      setLoading(false);
    };

    fetchLedger();
  }, [ledgerId]);

  const handleDuplicate = async () => {
    console.log("🟡 handleDuplicate called");

    if (!ledger) {
      console.log("❌ No ledger loaded yet");
      return;
    }

    try {
      setCreating(true);
      const { data: { user } } = await supabase.auth.getUser();
      console.log("👤 Current user:", user);

      if (!user) throw new Error("User not logged in");

      const coach_id = user.id;
      const program_id = ledger.program_id || "dev-program";

      console.log("📦 Inserting new ledger:", {
        coach_id,
        program_id,
        name: `${ledger.name} Copy`,
        template_key: ledger.template_key,
        status: "draft",
      });

      const { data, error } = await supabase
        .from("ledgers")
        .insert([
          {
            coach_id,
            program_id,
            name: `${ledger.name} Copy`,
            template_key: ledger.template_key,
            status: "draft",
          },
        ])
        .select()
        .single();

      console.log("🧾 Insert result:", { data, error });

      if (error || !data) throw error;

      toast.success("Ledger duplicated!");
      navigate(`/ledgers/${data.id}`);
    } catch (err) {
      console.error("❌ Error duplicating ledger:", err);
      toast.error("Failed to duplicate ledger");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center py-24">
          <Loader2 className="animate-spin w-8 h-8 text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!ledger) {
    return (
      <DashboardLayout>
        <div className="text-center py-24 text-muted-foreground">
          Ledger not found.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Card className="max-w-4xl mx-auto mt-10">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{ledger.name}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Template: {ledger.template_key || "—"} • Created{" "}
            {new Date(ledger.created_at).toLocaleDateString()}{" "}
            {new Date(ledger.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </CardHeader>
        <CardContent className="pt-4 space-y-6">
          <div className="text-center text-muted-foreground py-8 border rounded-md bg-muted/10">
            Table area coming soon.
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleDuplicate}
              disabled={creating}
              className="px-4 py-2 rounded-md bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
            >
              {creating ? "Duplicating..." : "Duplicate Ledger"}
            </button>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
