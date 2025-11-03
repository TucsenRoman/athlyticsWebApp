import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  FileText,
  BarChart3,
  Activity,
  ClipboardList,
  Trophy,
  Users,
  Pencil,
  Trash2,
  MoreHorizontal,
  Archive,
  ArchiveRestore,
  Copy,
  SortAsc,
  SortDesc,
  Search,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useProgramContext } from "@/hooks/useProgramContext";
import { toast } from "sonner";

// ----- Templates -----
const TEMPLATES = [
  {
    id: "blank_template",
    name: "Blank Ledger",
    icon: FileText,
    description: "Start fresh with a fully customizable ledger layout.",
  },
];

// ----- Icon options for selection -----
const ICON_OPTIONS = [
  { id: "file", icon: FileText, label: "Notes" },
  { id: "chart", icon: BarChart3, label: "Analytics" },
  { id: "activity", icon: Activity, label: "Performance" },
  { id: "clipboard", icon: ClipboardList, label: "Roster" },
  { id: "trophy", icon: Trophy, label: "Awards" },
  { id: "users", icon: Users, label: "Team" },
];

// ----- Types (loose to keep schema-flexible) -----
type AnyLedger = {
  id: string;
  coach_id: string;
  program_id: string;
  name: string;
  description?: string | null;
  template_key?: string | null;
  icon_key?: string | null;
  status?: "active" | "archived" | "draft" | string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type EntryCountMap = Record<string, number>;

// ----- Utilities -----
const getIcon = (iconKey: string | null | undefined) => {
  const found = ICON_OPTIONS.find((i) => i.id === iconKey);
  return found ? found.icon : FileText;
};

function formatRelativeDate(iso?: string | null) {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);

  const s = Math.floor(diff / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  const w = Math.floor(d / 7);

  if (w >= 1) return `${w}w ago`;
  if (d >= 1) return `${d}d ago`;
  if (h >= 1) return `${h}h ago`;
  if (m >= 1) return `${m}m ago`;
  return `just now`;
}

export default function Ledger() {
  const navigate = useNavigate();
  const { selectedProgramId } = useProgramContext();

  // Data
  const [ledgers, setLedgers] = useState<AnyLedger[]>([]);
  const [entryCounts, setEntryCounts] = useState<EntryCountMap>({});
  const [loading, setLoading] = useState(true);

  // Create/Edit Dialog
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isIconDialogOpen, setIsIconDialogOpen] = useState(false);

  // Create form
  const [selectedTemplate, setSelectedTemplate] = useState<string>("blank_template");
  const [ledgerName, setLedgerName] = useState("");
  const [ledgerDescription, setLedgerDescription] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // Edit form
  const [editingLedger, setEditingLedger] = useState<AnyLedger | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  // Filters / Sort / Search
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "archived">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "az" | "entries">("newest");
  const [searchQuery, setSearchQuery] = useState("");

  // ----- Load Ledgers -----
  useEffect(() => {
    const fetchLedgers = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !selectedProgramId) {
          setLedgers([]);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("ledgers")
          .select("*")
          .eq("coach_id", user.id)
          .eq("program_id", selectedProgramId)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setLedgers((data || []) as AnyLedger[]);

        // After ledgers load, fetch entry counts in one query
        const ids = (data || []).map((l) => l.id);
        if (ids.length) {
          const { data: rows, error: countErr } = await supabase
            .from("ledger_entries")
            .select("ledger_id, id", { count: "exact" }) // select id for rows; we'll count client-side by group
            .in("ledger_id", ids);

          if (countErr) throw countErr;

          const counts: EntryCountMap = {};
          (rows || []).forEach((r: any) => {
            counts[r.ledger_id] = (counts[r.ledger_id] || 0) + 1;
          });
          setEntryCounts(counts);
        } else {
          setEntryCounts({});
        }
      } catch (err) {
        console.error("Error loading ledgers:", err);
        toast.error("Failed to load ledgers.");
      } finally {
        setLoading(false);
      }
    };

    fetchLedgers();
  }, [selectedProgramId]);

  // ----- Create Ledger -----
  const handleCreateLedger = async () => {
    if (!selectedProgramId || !selectedTemplate) return;

    try {
      setCreating(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not logged in");

      const payload = {
        coach_id: user.id,
        program_id: selectedProgramId,
        name: ledgerName.trim() || "Untitled Ledger",
        description: ledgerDescription.trim(),
        template_key: selectedTemplate,
        icon_key: selectedIcon,
        status: "active" as const,
      };

      const { data, error } = await supabase
        .from("ledgers")
        .insert([payload])
        .select()
        .single();

      if (error || !data) throw error;

      setLedgers((prev) => [data as AnyLedger, ...prev]);
      toast.success("Ledger created.");
      // Reset
      setIsCreateOpen(false);
      setSelectedTemplate(null);
      setLedgerName("");
      setLedgerDescription("");
      setSelectedIcon(null);
    } catch (err) {
      console.error("Error creating ledger:", err);
      toast.error("Failed to create ledger.");
    } finally {
      setCreating(false);
    }
  };

  // ----- Open Edit Dialog -----
  const openEditDialog = (ledger: AnyLedger) => {
    setEditingLedger(ledger);
    setLedgerName(ledger.name || "");
    setLedgerDescription(ledger.description || "");
    setSelectedIcon(ledger.icon_key || null);
    setIsEditOpen(true);
  };

  // ----- Save Edits -----
  const handleSaveEdit = async () => {
    if (!editingLedger) return;

    try {
      setSavingEdit(true);
      const { data, error } = await supabase
        .from("ledgers")
        .update({
          name: ledgerName.trim(),
          description: ledgerDescription.trim(),
          icon_key: selectedIcon,
          // rely on db trigger for updated_at if you have one; else we could set updated_at: new Date().toISOString()
        })
        .eq("id", editingLedger.id)
        .select()
        .single();

      if (error) throw error;

      setLedgers((prev) => prev.map((l) => (l.id === editingLedger.id ? (data as AnyLedger) : l)));
      toast.success("Ledger updated.");
      setIsEditOpen(false);
      setEditingLedger(null);
    } catch (err) {
      console.error("Error updating ledger:", err);
      toast.error("Failed to update ledger.");
    } finally {
      setSavingEdit(false);
    }
  };

  // ----- Delete -----
  const handleDeleteLedger = async (ledgerId: string) => {
    if (!confirm("Delete this ledger? This cannot be undone.")) return;

    try {
      const { error } = await supabase.from("ledgers").delete().eq("id", ledgerId);
      if (error) throw error;
      setLedgers((prev) => prev.filter((l) => l.id !== ledgerId));
      toast.success("Ledger deleted.");
    } catch (err) {
      console.error("Error deleting ledger:", err);
      toast.error("Failed to delete ledger.");
    }
  };

  // ----- Archive / Unarchive -----
  const setLedgerStatus = async (ledger: AnyLedger, next: "active" | "archived") => {
    try {
      const { data, error } = await supabase
        .from("ledgers")
        .update({ status: next })
        .eq("id", ledger.id)
        .select()
        .single();
      if (error) throw error;
      setLedgers((prev) => prev.map((l) => (l.id === ledger.id ? (data as AnyLedger) : l)));
      toast.success(next === "archived" ? "Ledger archived." : "Ledger restored.");
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Failed to update status.");
    }
  };

  // ----- Duplicate -----
  const handleDuplicateLedger = async (ledger: AnyLedger) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not logged in");

      // 1) Create new ledger record
      const dupName = `${ledger.name || "Untitled"} (Copy)`;
      const { data: newLedger, error: newErr } = await supabase
        .from("ledgers")
        .insert([
          {
            coach_id: user.id,
            program_id: ledger.program_id,
            name: dupName,
            description: ledger.description || "",
            template_key: ledger.template_key || "blank",
            icon_key: ledger.icon_key || null,
            status: "active",
          },
        ])
        .select()
        .single();
      if (newErr || !newLedger) throw newErr;

      // 2) Clone headers
      const { data: headers, error: headersErr } = await supabase
        .from("ledger_headers")
        .select("*")
        .eq("ledger_id", ledger.id);
      if (headersErr) throw headersErr;

      if (headers && headers.length) {
        const headersPayload = headers.map((h: any) => {
          const { id, ledger_id, created_at, updated_at, ...rest } = h || {};
          return { ...rest, ledger_id: newLedger.id };
        });
        const { error: insertHdrErr } = await supabase
          .from("ledger_headers")
          .insert(headersPayload);
        if (insertHdrErr) throw insertHdrErr;
      }

      // 3) Clone entries
      const { data: entries, error: entriesErr } = await supabase
        .from("ledger_entries")
        .select("*")
        .eq("ledger_id", ledger.id);
      if (entriesErr) throw entriesErr;

      if (entries && entries.length) {
        const entriesPayload = entries.map((e: any) => {
          const { id, ledger_id, created_at, updated_at, ...rest } = e || {};
          return { ...rest, ledger_id: newLedger.id };
        });
        const { error: insertEntErr } = await supabase
          .from("ledger_entries")
          .insert(entriesPayload);
        if (insertEntErr) throw insertEntErr;
      }

      // Update UI
      setLedgers((prev) => [newLedger as AnyLedger, ...prev]);
      // Recompute entry count
      setEntryCounts((prev) => ({ ...prev, [newLedger.id]: (entries?.length || 0) }));
      toast.success("Ledger duplicated.");
    } catch (err) {
      console.error("Error duplicating ledger:", err);
      toast.error("Failed to duplicate ledger.");
    }
  };

  // ----- Derived filtered + sorted -----
  const filteredSorted = useMemo(() => {
    let items = [...ledgers];

    // Status filter
    if (statusFilter !== "all") {
      items = items.filter((l) => (l.status || "active") === statusFilter);
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      items = items.filter((l) => {
        const name = (l.name || "").toLowerCase();
        const desc = (l.description || "").toLowerCase();
        return name.includes(q) || desc.includes(q);
      });
    }

    // Sort
    items.sort((a, b) => {
      switch (sortBy) {
        case "oldest": {
          const at = new Date(a.created_at || 0).getTime();
          const bt = new Date(b.created_at || 0).getTime();
          return at - bt;
        }
        case "az": {
          return (a.name || "").localeCompare(b.name || "");
        }
        case "entries": {
          const ca = entryCounts[a.id] || 0;
          const cb = entryCounts[b.id] || 0;
          return cb - ca;
        }
        case "newest":
        default: {
          const at = new Date(a.created_at || 0).getTime();
          const bt = new Date(b.created_at || 0).getTime();
          return bt - at;
        }
      }
    });

    return items;
  }, [ledgers, statusFilter, sortBy, searchQuery, entryCounts]);

  // ----- UI -----
  return (
    <DashboardLayout>
      <div className="pb-24">
        {/* Page Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <h2 className="text-3xl font-bold tracking-tight">Ledgers</h2>
          <Button
            onClick={() => setIsCreateOpen(true)}
            disabled={!selectedProgramId}
            className="self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 mr-2" /> New Ledger
          </Button>
        </div>

        {/* Controls: Search, Status, Sort */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-70" />
            <Input
              className="pl-9"
              placeholder="Search ledgers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">
                <div className="flex items-center gap-2">
                  <SortDesc className="w-4 h-4" /> Newest
                </div>
              </SelectItem>
              <SelectItem value="oldest">
                <div className="flex items-center gap-2">
                  <SortAsc className="w-4 h-4" /> Oldest
                </div>
              </SelectItem>
              <SelectItem value="az">A–Z</SelectItem>
              <SelectItem value="entries">Most Entries</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Body */}
        {loading ? (
          <p className="text-muted-foreground">Loading ledgers...</p>
        ) : !selectedProgramId ? (
          <div className="text-center py-10 text-muted-foreground">
            Select a program to view its ledgers.
          </div>
        ) : filteredSorted.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <p>No ledgers match your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSorted.map((ledger) => {
              const Icon = getIcon(ledger.icon_key);
              const count = entryCounts[ledger.id] || 0;
              const status = (ledger.status as string) || "active";
              const updated = ledger.updated_at || ledger.created_at;

              return (
                <Card
                  key={ledger.id}
                  className="transition-shadow duration-200"
                >
                  <CardHeader className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      {/* Title + icon */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded-md bg-muted shrink-0">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <CardTitle
                            className="text-lg font-semibold truncate"
                            onClick={() => navigate(`/ledgers/${ledger.id}`)}
                          >
                            {ledger.name}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant={status === "archived" ? "secondary" : "default"}
                              className={status === "archived" ? "opacity-70" : ""}
                            >
                              {status === "archived" ? "Archived" : "Active"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Updated {formatRelativeDate(updated)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions (mobile + desktop) */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="shrink-0">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => openEditDialog(ledger)}
                          >
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          {status === "archived" ? (
                            <DropdownMenuItem
                              onClick={() => setLedgerStatus(ledger, "active")}
                            >
                              <ArchiveRestore className="w-4 h-4 mr-2" />
                              Unarchive
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => setLedgerStatus(ledger, "archived")}
                            >
                              <Archive className="w-4 h-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleDuplicateLedger(ledger)}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteLedger(ledger.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                    </div>

                    {/* Description */}
                    <CardDescription className="line-clamp-2">
                      {ledger.description || "No description provided."}
                    </CardDescription>

                    {/* Footer stats */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{count} entries</span>
                      <span>
                        Created {new Date(ledger.created_at || "").toLocaleDateString()}
                      </span>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* ===== CREATE DIALOG ===== */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md bg-card">
          <DialogHeader>
            <DialogTitle>Create New Ledger</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Template */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Template</label>
              <Select
                value={selectedTemplate || ""}
                onValueChange={(v) => setSelectedTemplate(v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATES.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Name */}
            <Input
              placeholder="Ledger Name (e.g., 2025 Spring Performance Log)"
              value={ledgerName}
              onChange={(e) => setLedgerName(e.target.value)}
            />

            {/* Description */}
            <Input
              placeholder="Description (optional)"
              value={ledgerDescription}
              onChange={(e) => setLedgerDescription(e.target.value)}
            />

            {/* Icon (for blank/custom style) */}
            {selectedTemplate === "blank_template" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Icon</label>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => setIsIconDialogOpen(true)}>
                    {selectedIcon
                      ? (() => {
                          const Icon = getIcon(selectedIcon);
                          return <Icon className="w-4 h-4 mr-2" />;
                        })()
                      : null}
                    {selectedIcon ? "Change Icon" : "Select Icon"}
                  </Button>
                  {selectedIcon && (() => {
                    const Icon = getIcon(selectedIcon);
                    return <Icon className="w-5 h-5 text-primary" />;
                  })()}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateLedger} disabled={creating}>
              {creating ? "Creating..." : "Create Ledger"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== EDIT DIALOG ===== */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md bg-card">
          <DialogHeader>
            <DialogTitle>Edit Ledger</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <Input
              placeholder="Ledger Name"
              value={ledgerName}
              onChange={(e) => setLedgerName(e.target.value)}
            />
            <Input
              placeholder="Description"
              value={ledgerDescription}
              onChange={(e) => setLedgerDescription(e.target.value)}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium">Icon</label>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setIsIconDialogOpen(true)}>
                  {selectedIcon
                    ? (() => {
                        const Icon = getIcon(selectedIcon);
                        return <Icon className="w-4 h-4 mr-2" />;
                      })()
                    : null}
                  {selectedIcon ? "Change Icon" : "Select Icon"}
                </Button>
                {selectedIcon && (() => {
                  const Icon = getIcon(selectedIcon);
                  return <Icon className="w-5 h-5 text-primary" />;
                })()}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={savingEdit}>
              {savingEdit ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== ICON PICKER (shared) ===== */}
      <Dialog open={isIconDialogOpen} onOpenChange={setIsIconDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-card">
          <DialogHeader>
            <DialogTitle>Select Icon</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-6 gap-3 py-3">
            {ICON_OPTIONS.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setSelectedIcon(id);
                  setIsIconDialogOpen(false);
                }}
                className={`flex flex-col items-center justify-center p-2 rounded-md border transition ${
                  selectedIcon === id
                    ? "border-primary bg-primary/10"
                    : "border-muted hover:border-primary/40"
                }`}
              >
                <Icon className="w-6 h-6 text-primary" />
                <span className="text-xs mt-1">{label}</span>
              </button>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsIconDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
