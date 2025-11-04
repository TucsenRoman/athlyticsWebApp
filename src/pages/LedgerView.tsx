import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/header/DashboardLayout";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Ledger = Tables<"ledgers">;
type LedgerHeader = Tables<"ledger_headers">;
type LedgerEntry = Tables<"ledger_entries">;

export default function LedgerView() {
  const { ledgerId } = useParams<{ ledgerId: string }>();
  const navigate = useNavigate();

  const [ledger, setLedger] = useState<Ledger | null>(null);
  const [headers, setHeaders] = useState<LedgerHeader[]>([]);
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [adding, setAdding] = useState(false);

  const [editingHeaderId, setEditingHeaderId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [showFormulaInput, setShowFormulaInput] = useState<string | null>(null);
  const [editFormula, setEditFormula] = useState("");

  const [editingCell, setEditingCell] = useState<{
    entryId: string | null;
    headerName: string | null;
    value: string;
  }>({ entryId: null, headerName: null, value: "" });

  // 🧭 Load ledger + data
  useEffect(() => {
    if (!ledgerId) return;
    const loadLedgerData = async () => {
      setLoading(true);
      try {
        const { data: ledgerData, error: ledgerError } = await supabase
          .from("ledgers")
          .select("*")
          .eq("id", ledgerId)
          .single();
        if (ledgerError) throw ledgerError;
        setLedger(ledgerData);

        const { data: headerData, error: headerError } = await supabase
          .from("ledger_headers")
          .select("*")
          .eq("ledger_id", ledgerId)
          .order("created_at", { ascending: true });
        if (headerError) throw headerError;
        setHeaders(headerData || []);

        const { data: entryData, error: entryError } = await supabase
          .from("ledger_entries")
          .select("*")
          .eq("ledger_id", ledgerId)
          .order("created_at", { ascending: true });
        if (entryError) throw entryError;
        setEntries(entryData || []);
      } catch (err) {
        console.error("Error loading ledger:", err);
        toast.error("Failed to load ledger data.");
      } finally {
        setLoading(false);
      }
    };
    loadLedgerData();
  }, [ledgerId]);

  // ♻️ Reload headers + entries
  const reloadHeaders = async () => {
    const { data, error } = await supabase
      .from("ledger_headers")
      .select("*")
      .eq("ledger_id", ledgerId)
      .order("created_at", { ascending: true });
    if (!error) setHeaders(data || []);
  };

  const reloadEntries = async () => {
    const { data, error } = await supabase
      .from("ledger_entries")
      .select("*")
      .eq("ledger_id", ledgerId)
      .order("created_at", { ascending: true });
    if (!error) setEntries(data || []);
  };

  // ➕ Add column
  const handleAddColumn = async () => {
    if (!newColumnName.trim() || !ledgerId) return;
    try {
      setAdding(true);
      const { error } = await supabase.from("ledger_headers").insert([
        {
          ledger_id: ledgerId,
          name: newColumnName,
          type: "text",
          is_locked: false,
          options: null,
          formula: null,
        },
      ]);
      if (error) throw error;
      toast.success(`Added column "${newColumnName}"`);
      setNewColumnName("");
      setAddModalOpen(false);
      reloadHeaders();
    } catch (err) {
      console.error("Error adding column:", err);
      toast.error("Failed to add column");
    } finally {
      setAdding(false);
    }
  };

  // ➕ Add row
  const handleAddRow = async () => {
    if (!ledgerId || headers.length === 0) return;
    const emptyValues = Object.fromEntries(headers.map((h) => [h.name, null]));
    const { error } = await supabase.from("ledger_entries").insert([
      {
        ledger_id: ledgerId,
        entity_name: "",
        values: emptyValues,
      },
    ]);
    if (error) {
      toast.error("Failed to add row");
    } else {
      toast.success("Row added");
      reloadEntries();
    }
  };

  // 🗑️ Delete column
  const handleDeleteColumn = async (headerId: string, isLocked: boolean) => {
    if (isLocked) return toast.error("This column is locked.");
    const { error } = await supabase.from("ledger_headers").delete().eq("id", headerId);
    if (error) toast.error("Failed to delete column.");
    else {
      toast.success("Column deleted.");
      reloadHeaders();
    }
  };

  // 🗑️ Delete row
  const handleDeleteRow = async (entryId: string) => {
    const { error } = await supabase.from("ledger_entries").delete().eq("id", entryId);
    if (error) toast.error("Failed to delete row.");
    else {
      toast.success("Row deleted");
      reloadEntries();
    }
  };

  // 💾 Save this ledger as a reusable template
  const handleSaveAsTemplate = async () => {
    if (!ledger) return;

    try {
      // 👤 Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not logged in");

      // 1️⃣ Create template entry
      const { data: template, error: templateErr } = await supabase
        .from("ledger_templates")
        .insert([
          {
            name: ledger.name || "Untitled Template",
            description: `Created from ledger ${ledger.name}`,
            coach_id: user.id, // ✅ this line links the template to the user
          },
        ])
        .select()
        .single();

      if (templateErr || !template) throw templateErr;

      // 2️⃣ Copy all headers into template_headers
      if (headers.length > 0) {
        const headerPayload = headers.map((h) => ({
          template_id: template.id,
          column_name: h.name,
          column_type: h.type || "text",
          options: h.options || null,
        }));

        const { error: insertErr } = await supabase
          .from("ledger_template_headers")
          .insert(headerPayload);

        if (insertErr) throw insertErr;
      }

      toast.success(`Saved "${ledger.name}" as a new template.`);
    } catch (err) {
      console.error("Error saving as template:", err);
      toast.error("Failed to save as template.");
    }
  };

  // ✏️ Rename header
  const handleRenameHeader = async (id: string) => {
    if (!editName.trim()) return;
    const header = headers.find((h) => h.id === id);
    const { error } = await supabase
      .from("ledger_headers")
      .update({
        name: editName,
        formula: header?.formula ?? null,
      })
      .eq("id", id);
    if (error) toast.error("Rename failed");
    else {
      toast.success("Header updated");
      setEditingHeaderId(null);
      reloadHeaders();
    }
  };

  // 🧮 Save formula
  const handleSaveFormula = async (id: string) => {
    const { error } = await supabase.from("ledger_headers").update({ formula: editFormula }).eq("id", id);
    if (error) toast.error("Failed to save formula");
    else {
      toast.success("Formula saved");
      setShowFormulaInput(null);
      reloadHeaders();
    }
  };

  // 💾 Save cell
  const handleCellSave = async (entryId: string, headerName: string) => {
    const entry = entries.find((e) => e.id === entryId);
    if (!entry) return;

    const updatedValues = {
      ...(entry.values as Record<string, any>),
      [headerName]: editingCell.value,
    };

    const { error } = await supabase
      .from("ledger_entries")
      .update({ values: updatedValues })
      .eq("id", entryId);

    if (error) {
      toast.error("Failed to update cell");
    } else {
      toast.success("Updated");
      setEntries((prev) =>
        prev.map((e) => (e.id === entryId ? { ...e, values: updatedValues } : e))
      );
    }

    setEditingCell({ entryId: null, headerName: null, value: "" });
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
        <div className="text-center py-24 text-muted-foreground">Ledger not found.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Card className="max-w-6xl mx-auto mt-10 overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <CardTitle className="text-2xl font-bold">{ledger.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Template: {ledger.template_key || "—"} • Created{" "}
                {new Date(ledger.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <Button
            onClick={handleSaveAsTemplate}
            variant="outline"
            className="ml-auto flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save as Template
          </Button>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto border border-border rounded-md">
            <table className="min-w-full">
              <thead className="bg-muted/30">
                <tr>
                  {headers.map((h) => (
                    <th key={h.id} className="group text-left px-4 py-2 text-sm font-medium border-b relative whitespace-nowrap">
                      {editingHeaderId === h.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onBlur={() => handleRenameHeader(h.id)}
                            className="w-32"
                            autoFocus
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setShowFormulaInput(h.id);
                              setEditFormula(h.formula || "");
                            }}
                            title="Edit formula"
                          >
                            ƒx
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-2">
                          <span
                            onClick={() => {
                              setEditingHeaderId(h.id);
                              setEditName(h.name);
                            }}
                            className="cursor-pointer select-none"
                          >
                            {h.name}
                            {h.formula && (
                              <span className="text-xs text-muted-foreground ml-2">
                                (Formula: {h.formula})
                              </span>
                            )}
                          </span>
                          <button
                            onClick={() => handleDeleteColumn(h.id, h.is_locked)}
                            className="opacity-0 group-hover:opacity-100 text-destructive"
                            title="Delete column"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      {showFormulaInput === h.id && (
                        <Input
                          placeholder="=H1+H2"
                          value={editFormula}
                          onChange={(e) => setEditFormula(e.target.value)}
                          onBlur={() => handleSaveFormula(h.id)}
                          className="mt-2 text-xs"
                        />
                      )}
                    </th>
                  ))}
                  {/* ➕ Add Header */}
                  <th className="px-2 text-center">
                    <Button size="icon" variant="ghost" onClick={() => setAddModalOpen(true)}>
                      <Plus className="w-5 h-5" />
                    </Button>
                  </th>
                </tr>
              </thead>

              <tbody>
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan={headers.length + 1} className="text-center py-8 text-muted-foreground">
                      No entries yet.
                    </td>
                  </tr>
                ) : (
                  entries.map((entry) => (
                    <tr key={entry.id} className="border-b hover:bg-muted/10 group">
                      {headers.map((h) => {
                        const cellValue =
                          typeof entry.values === "object" && entry.values
                            ? (entry.values as Record<string, any>)[h.name] ?? ""
                            : "";

                        const isEditing =
                          editingCell.entryId === entry.id &&
                          editingCell.headerName === h.name;

                        return (
                          <td
                            key={h.id}
                            className="px-4 py-2 text-sm text-muted-foreground whitespace-nowrap cursor-pointer"
                            onClick={() =>
                              setEditingCell({
                                entryId: entry.id,
                                headerName: h.name,
                                value: cellValue,
                              })
                            }
                          >
                            {isEditing ? (
                              <Input
                                value={editingCell.value}
                                autoFocus
                                onChange={(e) =>
                                  setEditingCell((prev) => ({
                                    ...prev,
                                    value: e.target.value,
                                  }))
                                }
                                onBlur={() => handleCellSave(entry.id, h.name)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleCellSave(entry.id, h.name);
                                  if (e.key === "Escape")
                                    setEditingCell({ entryId: null, headerName: null, value: "" });
                                }}
                                className="h-7 text-sm"
                              />
                            ) : (
                              cellValue || "—"
                            )}
                          </td>
                        );
                      })}

                      <td className="opacity-0 group-hover:opacity-100 text-center">
                        <button
                          className="text-destructive hover:text-destructive/80"
                          title="Delete row"
                          onClick={() => handleDeleteRow(entry.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ➕ Add Row Button */}
          <div className="flex justify-center py-4">
            <Button onClick={handleAddRow}>
              <Plus className="w-4 h-4 mr-2" />
              Add Row
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add Column Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Column</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Column name"
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
            />
          </div>
          <DialogFooter className="mt-4">
            <Button variant="ghost" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddColumn} disabled={adding}>
              {adding ? "Adding..." : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
