import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/header/DashboardLayout";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, MoreHorizontal, FilePlus2, ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

type Ledger = Tables<"ledgers">;
type LedgerHeader = Tables<"ledger_headers">;
type LedgerEntry = Tables<"ledger_entries">;
type Program = Tables<"programs">;

export default function LedgerView() {
  const { ledgerId } = useParams<{ ledgerId: string }>();
  const navigate = useNavigate();

  const [ledger, setLedger] = useState<Ledger | null>(null);
  const [headers, setHeaders] = useState<LedgerHeader[]>([]);
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Add column modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [adding, setAdding] = useState(false);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [targetProgramId, setTargetProgramId] = useState<string | null>(null);
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);


  // Template modal
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [templateIcon, setTemplateIcon] = useState("ClipboardList");
  const [saveTemplateModalOpen, setSaveTemplateModalOpen] = useState(false);
  const [saveOptions, setSaveOptions] = useState({ columns: true, rows: false });
  const [savingTemplate, setSavingTemplate] = useState(false);

  // Editing state
  const [editingHeaderId, setEditingHeaderId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [showFormulaInput, setShowFormulaInput] = useState<string | null>(null);
  const [editFormula, setEditFormula] = useState("");
  const [editingCell, setEditingCell] = useState<{
    entryId: string | null;
    headerName: string | null;
    value: string;
  }>({ entryId: null, headerName: null, value: "" });

  // 🧭 Load ledger + related data
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

  useEffect(() => {
    const fetchPrograms = async () => {
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();
      if (userErr || !user) return console.error("No user found", userErr);

      const { data, error } = await supabase
        .from("programs")
        .select("*")
        .eq("coach_id", user.id)
        .order("created_at", { ascending: false });

      if (error) console.error("Error fetching programs:", error);
      else setPrograms(data || []);
    };

    fetchPrograms();
  }, []);

  // ♻️ Reload helpers
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
    if (error) toast.error("Failed to add row");
    else {
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

  const handleMoveLedger = async () => {
    if (!ledgerId || !targetProgramId || !ledger) return;
    const { error } = await supabase
      .from("ledgers")
      .update({
        program_id: targetProgramId,
        icon: ledger.icon || "clipboard",
      })
      .eq("id", ledgerId);
    if (error) return toast.error("Failed to move ledger.");
    toast.success("Ledger moved successfully.");
    setMoveModalOpen(false);
    navigate(`/ledgers/${ledgerId}`);
    // navigate("/");
  };

  const handleDuplicateLedger = async () => {
    if (!ledger || !targetProgramId) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not logged in");

      const { data: newLedger, error: ledgerErr } = await supabase
        .from("ledgers")
        .insert([
          {
            name: `${ledger.name} (Copy)`,
            description: ledger.description,
            program_id: targetProgramId,
            coach_id: user.id,
            icon: ledger.icon || "clipboard",
          },
        ])
        .select()
        .single();
      if (ledgerErr || !newLedger) throw ledgerErr;

      // Copy headers
      if (headers.length) {
        const headerPayload = headers.map((h) => ({
          ledger_id: newLedger.id,
          name: h.name,
          type: h.type,
          formula: h.formula,
          is_locked: h.is_locked,
          options: h.options,
        }));
        await supabase.from("ledger_headers").insert(headerPayload);
      }

      // Copy entries
      if (entries.length) {
        const entryPayload = entries.map((e) => ({
          ledger_id: newLedger.id,
          entity_name: e.entity_name,
          values: e.values,
        }));
        await supabase.from("ledger_entries").insert(entryPayload);
      }

      toast.success("Ledger duplicated successfully.");
      setDuplicateModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to duplicate ledger.");
    }
  };

  // SAVE AS TEMPLATE
  const handleSaveAsTemplate = async () => {
    if (!ledger) return;
    try {
      setSavingTemplate(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not logged in");

      const { data: template, error: templateErr } = await supabase
        .from("ledger_templates")
        .insert([
          {
            name: ledger.name || "Untitled Template",
            description: ledger.description || `Created from ${ledger.name}`,
            icon: ledger.icon || "clipboard",
            coach_id: user.id,
            visibility: "private",
          },
        ])
        .select()
        .single();
      if (templateErr || !template) throw templateErr;

      // --- Copy columns ---
      if (saveOptions.columns && headers.length > 0) {
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

      // --- Copy rows (entries) ---
      if (saveOptions.rows && entries.length > 0) {
        const rowPayload = entries.map((e) => ({
          template_id: template.id,
          values: e.values,
        }));
        const { error: insertRowErr } = await supabase
          .from("ledger_template_entries")
          .insert(rowPayload);
        if (insertRowErr) throw insertRowErr;
      }

      toast.success("Template saved successfully.");
      setSaveTemplateModalOpen(false);
    } catch (err) {
      console.error("Error saving as template:", err);
      toast.error("Failed to save template.");
    } finally {
      setSavingTemplate(false);
    }
  };

  // ✏️ Rename header
  const handleRenameHeader = async (id: string) => {
    if (!editName.trim()) return;
    const header = headers.find((h) => h.id === id);
    const { error } = await supabase
      .from("ledger_headers")
      .update({ name: editName, formula: header?.formula ?? null })
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
    if (error) toast.error("Failed to update cell");
    else {
      // toast.success("Updated");
      setEntries((prev) =>
        prev.map((e) => (e.id === entryId ? { ...e, values: updatedValues } : e))
      );
    }
    setEditingCell({ entryId: null, headerName: null, value: "" });
  };

  // --- UI ---
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
      <Card className="w-full mx-auto mt-4 flex flex-col h-[calc(100vh-7rem)]">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 pb-2">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <CardTitle className="text-2xl font-bold">{ledger.name}</CardTitle>
              {ledger.description && (
                <p className="text-sm text-muted-foreground">{ledger.description}</p>
              )}
            </div>
          </div>

          {/* Compact Action Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-auto">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              {/* open modal instead of saving immediately */}
              <DropdownMenuItem onClick={() => setSaveTemplateModalOpen(true)}>
                <Save className="w-4 h-4 mr-2" /> Save as Template
              </DropdownMenuItem>

              <DropdownMenuItem onClick={handleAddRow}>
                <Plus className="w-4 h-4 mr-2" /> Add Row
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => setMoveModalOpen(true)}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Move to Program
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => setDuplicateModalOpen(true)}>
                <FilePlus2 className="w-4 h-4 mr-2" /> Duplicate to Program
              </DropdownMenuItem>

              <DropdownMenuItem
                className="text-destructive"
                onClick={() => {
                  if (confirm("Delete this ledger?")) {
                    // TODO: add delete logic
                  }
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete Ledger
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto border border-border rounded-md scroll-smooth snap-x snap-mandatory">
          <table className="min-w-full">
            <thead>
              <tr>
                {headers.map((h) => (
                  <th
                    key={h.id}
                    className="group text-left px-4 py-2 text-sm font-medium border-b relative whitespace-nowrap bg-background snap-start"
                  >                      
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
                        editingCell.entryId === entry.id && editingCell.headerName === h.name;
                      return (
                        <td
                          key={h.id}
                          className="px-4 py-2 text-sm text-muted-foreground whitespace-nowrap cursor-pointer snap-start"
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
                              onKeyDown={async (e) => {
                                const currentRowIndex = entries.findIndex((en) => en.id === entry.id);
                                const currentColIndex = headers.findIndex((hd) => hd.name === h.name);

                                const input = e.currentTarget;
                                const caretAtStart = input.selectionStart === 0;
                                const caretAtEnd = input.selectionStart === input.value.length;

                                const focusCell = (rowIndex: number, colIndex: number) => {
                                  if (rowIndex < 0 || rowIndex >= entries.length) return;
                                  if (colIndex < 0 || colIndex >= headers.length) return;

                                  const nextEntry = entries[rowIndex];
                                  const nextHeader = headers[colIndex];
                                  const val =
                                    typeof nextEntry.values === "object" && nextEntry.values
                                      ? (nextEntry.values as Record<string, any>)[nextHeader.name] ?? ""
                                      : "";

                                  setEditingCell({
                                    entryId: nextEntry.id,
                                    headerName: nextHeader.name,
                                    value: val,
                                  });
                                };

                                // --- ENTER ---
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  await handleCellSave(entry.id, h.name);

                                  const nextRow = entries[currentRowIndex + 1];
                                  if (nextRow) {
                                    focusCell(currentRowIndex + 1, currentColIndex);
                                  } else {
                                    await handleAddRow();
                                    const { data: updatedEntries } = await supabase
                                      .from("ledger_entries")
                                      .select("*")
                                      .eq("ledger_id", ledgerId)
                                      .order("created_at", { ascending: true });

                                    if (updatedEntries && updatedEntries.length > entries.length) {
                                      const newRow = updatedEntries[updatedEntries.length - 1];
                                      setEntries(updatedEntries);
                                      setEditingCell({
                                        entryId: newRow.id,
                                        headerName: h.name,
                                        value: "",
                                      });
                                    }
                                  }
                                }

                                // --- TAB ---
                                if (e.key === "Tab") {
                                  e.preventDefault();
                                  await handleCellSave(entry.id, h.name);

                                  let nextCol = currentColIndex + (e.shiftKey ? -1 : 1);
                                  let nextRow = currentRowIndex;

                                  if (nextCol >= headers.length) {
                                    nextCol = 0;
                                    nextRow++;
                                  } else if (nextCol < 0) {
                                    nextCol = headers.length - 1;
                                    nextRow--;
                                  }

                                  if (nextRow >= entries.length) {
                                    await handleAddRow();
                                    const { data: updatedEntries } = await supabase
                                      .from("ledger_entries")
                                      .select("*")
                                      .eq("ledger_id", ledgerId)
                                      .order("created_at", { ascending: true });

                                    if (updatedEntries && updatedEntries.length > entries.length) {
                                      const newRow = updatedEntries[updatedEntries.length - 1];
                                      setEntries(updatedEntries);
                                      setEditingCell({
                                        entryId: newRow.id,
                                        headerName: headers[nextCol].name,
                                        value: "",
                                      });
                                    }
                                  } else {
                                    focusCell(nextRow, nextCol);
                                  }
                                }

                                // --- ARROW KEYS ---
                                if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
                                  const atEdge =
                                    (e.key === "ArrowLeft" && caretAtStart) ||
                                    (e.key === "ArrowRight" && caretAtEnd) ||
                                    e.key === "ArrowUp" ||
                                    e.key === "ArrowDown";

                                  if (!atEdge) return; // allow normal cursor movement

                                  e.preventDefault();
                                  let targetRow = currentRowIndex;
                                  let targetCol = currentColIndex;

                                  if (e.key === "ArrowUp") targetRow--;
                                  if (e.key === "ArrowDown") targetRow++;
                                  if (e.key === "ArrowLeft") targetCol--;
                                  if (e.key === "ArrowRight") targetCol++;

                                  if (
                                    targetRow >= 0 &&
                                    targetRow < entries.length &&
                                    targetCol >= 0 &&
                                    targetCol < headers.length
                                  ) {
                                    await handleCellSave(entry.id, h.name);
                                    focusCell(targetRow, targetCol);
                                  } else if (e.key === "ArrowDown" && targetRow >= entries.length) {
                                    await handleAddRow();
                                    const { data: updatedEntries } = await supabase
                                      .from("ledger_entries")
                                      .select("*")
                                      .eq("ledger_id", ledgerId)
                                      .order("created_at", { ascending: true });

                                    if (updatedEntries && updatedEntries.length > entries.length) {
                                      const newRow = updatedEntries[updatedEntries.length - 1];
                                      setEntries(updatedEntries);
                                      setEditingCell({
                                        entryId: newRow.id,
                                        headerName: h.name,
                                        value: "",
                                      });
                                    }
                                  }
                                }

                                // --- ESCAPE ---
                                if (e.key === "Escape") {
                                  setEditingCell({ entryId: null, headerName: null, value: "" });
                                }
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

          <div className="flex justify-center py-4">
            <Button onClick={handleAddRow}>
              <Plus className="w-4 h-4 mr-2" />
              Add Row
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ➕ Add Column Modal */}
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
      <Dialog open={saveTemplateModalOpen} onOpenChange={setSaveTemplateModalOpen}>
        <DialogContent className="sm:max-w-md bg-card">
          <DialogHeader>
            <DialogTitle>Save as Template</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={saveOptions.columns}
                onChange={(e) =>
                  setSaveOptions((prev) => ({ ...prev, columns: e.target.checked }))
                }
              />
              <span>Include Columns</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={saveOptions.rows}
                onChange={(e) =>
                  setSaveOptions((prev) => ({ ...prev, rows: e.target.checked }))
                }
              />
              <span>Include Rows</span>
            </label>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveTemplateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAsTemplate} disabled={savingTemplate}>
              {savingTemplate ? "Saving..." : "Save Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 🧭 Move Ledger Modal */}
      <Dialog open={moveModalOpen} onOpenChange={setMoveModalOpen}>
        <DialogContent className="sm:max-w-md bg-card">
          <DialogHeader>
            <DialogTitle>Move Ledger</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Select value={targetProgramId} onValueChange={setTargetProgramId}>
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
            <Button variant="outline" onClick={() => setMoveModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleMoveLedger} disabled={!targetProgramId}>
              Move
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 🧭 Duplicate Ledger Modal */}
      <Dialog open={duplicateModalOpen} onOpenChange={setDuplicateModalOpen}>
        <DialogContent className="sm:max-w-md bg-card">
          <DialogHeader>
            <DialogTitle>Duplicate Ledger</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Select value={targetProgramId} onValueChange={setTargetProgramId}>
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
            <Button variant="outline" onClick={() => setDuplicateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleDuplicateLedger} disabled={!targetProgramId}>
              Duplicate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
