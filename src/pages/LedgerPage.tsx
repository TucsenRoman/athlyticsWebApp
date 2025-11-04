import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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

// ----- Icon options for selection -----
const ICON_OPTIONS = [
  { id: "file", icon: FileText, label: "Notes" },
  { id: "chart", icon: BarChart3, label: "Analytics" },
  { id: "activity", icon: Activity, label: "Performance" },
  { id: "clipboard", icon: ClipboardList, label: "Roster" },
  { id: "trophy", icon: Trophy, label: "Awards" },
  { id: "users", icon: Users, label: "Team" },
];

// ----- Types -----
type AnyLedger = {
  id: string;
  coach_id: string;
  program_id: string;
  name: string;
  description?: string | null;
  template_key?: string | null;
  icon?: string | null;
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

  // Global Templates
  const [templates, setTemplates] = useState<any[]>([
    {
      id: "blank_template",
      name: "Blank Ledger",
      description: "Start fresh with a fully customizable ledger layout.",
    },
  ]);

  // 🧭 Program selection for Move/Duplicate
  const [programs, setPrograms] = useState<any[]>([]);
  const [targetProgramId, setTargetProgramId] = useState<string | null>(null);
  const [isMoveOpen, setIsMoveOpen] = useState(false);
  const [isDuplicateToOpen, setIsDuplicateToOpen] = useState(false);
  const [activeLedger, setActiveLedger] = useState<AnyLedger | null>(null);

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

  // ----- Load Global Templates -----
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const { data, error } = await supabase
          .from("ledger_templates")
          .select("*")
          .order("created_at", { ascending: true });

        if (error) throw error;

        // Always include the default blank template at the top
        const uniqueTemplates = [
          {
            id: "blank_template",
            name: "Blank Ledger",
            description: "Start fresh with a fully customizable ledger layout.",
            icon: 'file',
          },
          ...(data || []),
        ];

        // ✅ Remove duplicates by ID (handles re-renders or refreshes)
        const deduped = Array.from(
          new Map(uniqueTemplates.map((t) => [t.id, t])).values()
        );

        setTemplates(deduped);
      } catch (err) {
        console.error("Error loading templates:", err);
      }
    };

    fetchTemplates();
  }, []);

  // Fetch only the coach's programs
  useEffect(() => {
    const fetchPrograms = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from("programs")
        .select("*")
        .eq("coach_id", user.id)
        .order("created_at", { ascending: false });
      if (!error && data) setPrograms(data);
    };
    fetchPrograms();
  }, []);

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

        const ids = (data || []).map((l) => l.id);
        if (ids.length) {
          const { data: rows, error: countErr } = await supabase
            .from("ledger_entries")
            .select("ledger_id, id", { count: "exact" })
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

      // Fetch the selected template (if not blank)
      let templateDefaults = null;
      if (selectedTemplate !== "blank_template") {
        const { data: template, error: templateErr } = await supabase
          .from("ledger_templates")
          .select("name, description, icon")
          .eq("id", selectedTemplate)
          .single();

        if (!templateErr && template) {
          templateDefaults = template;
        }
      }

      // ✅ Use template defaults for name, description, and icon
      const payload = {
        coach_id: user.id,
        program_id: selectedProgramId,
        name:
          ledgerName.trim() ||
          templateDefaults?.name ||
          "Untitled Ledger",
        description:
          ledgerDescription.trim() ||
          templateDefaults?.description ||
          "",
        template_key: selectedTemplate,
        icon:
          selectedIcon ||
          templateDefaults?.icon ||
          "ClipboardList",
        status: "active" as const,
      };

      const { data, error } = await supabase
        .from("ledgers")
        .insert([payload])
        .select()
        .single();

      if (error || !data) throw error;

      // Copy template headers (if not blank)
      if (selectedTemplate !== "blank_template") {
        const { data: templateHeaders, error: headerErr } = await supabase
          .from("ledger_template_headers")
          .select("*")
          .eq("template_id", selectedTemplate);

        if (headerErr) throw headerErr;

        if (templateHeaders && templateHeaders.length > 0) {
          const insertPayload = templateHeaders.map((h) => ({
            ledger_id: data.id,
            name: h.column_name,
            type: h.column_type,
            options: h.options,
          }));
          const { error: insertErr } = await supabase
            .from("ledger_headers")
            .insert(insertPayload);
          if (insertErr) throw insertErr;
        }
      }

      setLedgers((prev) => [data as AnyLedger, ...prev]);
      toast.success("Ledger created.");
      setIsCreateOpen(false);
      setSelectedTemplate("blank_template");
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

  // ----- Edit / Delete / Archive same as before -----
  const openEditDialog = (ledger: AnyLedger) => {
    setEditingLedger(ledger);
    setLedgerName(ledger.name || "");
    setLedgerDescription(ledger.description || "");
    setSelectedIcon(ledger.icon || null);
    setIsEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingLedger) return;
    try {
      setSavingEdit(true);
      const { data, error } = await supabase
        .from("ledgers")
        .update({
          name: ledgerName.trim(),
          description: ledgerDescription.trim(),
          icon: selectedIcon,
        })
        .eq("id", editingLedger.id)
        .select()
        .single();

      if (error) throw error;
      setLedgers((prev) =>
        prev.map((l) => (l.id === editingLedger.id ? (data as AnyLedger) : l))
      );
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

  const setLedgerStatus = async (ledger: AnyLedger, next: "active" | "archived") => {
    try {
      const { data, error } = await supabase
        .from("ledgers")
        .update({
          status: next,
          icon: ledger.icon || "ClipboardList", // ✅ add this line
        })
        .eq("id", ledger.id)
        .select()
        .single();

      if (error) throw error;

      setLedgers((prev) =>
        prev.map((l) => (l.id === ledger.id ? (data as AnyLedger) : l))
      );

      toast.success(next === "archived" ? "Ledger archived." : "Ledger restored.");
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Failed to update status.");
    }
  };

  const handleDuplicateLedger = async (ledger: AnyLedger) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not logged in");

      const dupName = `${ledger.name || "Untitled"} (Copy)`;
      const { data: newLedger, error: newErr } = await supabase
        .from("ledgers")
        .insert([
          {
            coach_id: user.id,
            program_id: ledger.program_id,
            name: dupName,
            description: ledger.description || "",
            template_key: ledger.template_key || "blank_template",
            icon: ledger.icon || null,
            status: "active",
          },
        ])
        .select()
        .single();
      if (newErr || !newLedger) throw newErr;

      const { data: headers } = await supabase
        .from("ledger_headers")
        .select("*")
        .eq("ledger_id", ledger.id);

      if (headers && headers.length) {
        const headersPayload = headers.map((h: any) => ({
          ...h,
          ledger_id: newLedger.id,
        }));
        await supabase.from("ledger_headers").insert(headersPayload);
      }

      const { data: entries } = await supabase
        .from("ledger_entries")
        .select("*")
        .eq("ledger_id", ledger.id);

      if (entries && entries.length) {
        const entriesPayload = entries.map((e: any) => ({
          ...e,
          ledger_id: newLedger.id,
        }));
        await supabase.from("ledger_entries").insert(entriesPayload);
      }

      setLedgers((prev) => [newLedger as AnyLedger, ...prev]);
      setEntryCounts((prev) => ({
        ...prev,
        [newLedger.id]: entries?.length || 0,
      }));
      toast.success("Ledger duplicated.");
    } catch (err) {
      console.error("Error duplicating ledger:", err);
      toast.error("Failed to duplicate ledger.");
    }
  };

  const handleMoveLedger = async () => {
    if (!activeLedger || !targetProgramId) return;

    const { error } = await supabase
      .from("ledgers")
      .update({
        program_id: targetProgramId,
        icon: activeLedger.icon || "clipboard",
      })
      .eq("id", activeLedger.id);

    if (error) {
      toast.error("Failed to move ledger.");
      return;
    }

    toast.success("Ledger moved successfully.");
    setIsMoveOpen(false);
    setTargetProgramId(null);

    // 🧠 Remove from current list (no need to reload full page)
    setLedgers((prev) => prev.filter((l) => l.id !== activeLedger.id));

    // ✅ Optionally also reset the active ledger
    setActiveLedger(null);

    // ✅ Re-fetch entry counts to stay accurate
    const ids = ledgers.filter((l) => l.id !== activeLedger.id).map((l) => l.id);
    if (ids.length) {
      const { data: rows, error: countErr } = await supabase
        .from("ledger_entries")
        .select("ledger_id, id", { count: "exact" })
        .in("ledger_id", ids);

      if (!countErr && rows) {
        const counts: Record<string, number> = {};
        rows.forEach((r: any) => {
          counts[r.ledger_id] = (counts[r.ledger_id] || 0) + 1;
        });
        setEntryCounts(counts);
      }
    } else {
      setEntryCounts({});
    }
  };

  const handleDuplicateToProgram = async () => {
    if (!activeLedger || !targetProgramId) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not logged in");

      const { data: newLedger, error: insertErr } = await supabase
        .from("ledgers")
        .insert([
          {
            coach_id: user.id,
            program_id: targetProgramId,
            name: `${activeLedger.name} (Copy)`,
            description: activeLedger.description || "",
            icon: activeLedger.icon || "clipboard",
            status: "active",
          },
        ])
        .select()
        .single();
      if (insertErr || !newLedger) throw insertErr;

      // Copy headers + entries
      const { data: headers } = await supabase
        .from("ledger_headers")
        .select("*")
        .eq("ledger_id", activeLedger.id);
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

      const { data: entries } = await supabase
        .from("ledger_entries")
        .select("*")
        .eq("ledger_id", activeLedger.id);
      if (entries?.length)
        await supabase.from("ledger_entries").insert(
          entries.map((e: any) => ({
            ledger_id: newLedger.id,
            entity_name: e.entity_name,
            values: e.values,
          }))
        );

      toast.success("Ledger duplicated to another program.");
      setIsDuplicateToOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to duplicate ledger.");
    }
  };

  const filteredSorted = useMemo(() => {
    let items = [...ledgers];
    if (statusFilter !== "all") {
      items = items.filter((l) => (l.status || "active") === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      items = items.filter(
        (l) =>
          (l.name || "").toLowerCase().includes(q) ||
          (l.description || "").toLowerCase().includes(q)
      );
    }
    items.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.created_at || 0).getTime() -
            new Date(b.created_at || 0).getTime();
        case "az":
          return (a.name || "").localeCompare(b.name || "");
        case "entries":
          return (entryCounts[b.id] || 0) - (entryCounts[a.id] || 0);
        default:
          return new Date(b.created_at || 0).getTime() -
            new Date(a.created_at || 0).getTime();
      }
    });
    return items;
  }, [ledgers, statusFilter, sortBy, searchQuery, entryCounts]);

  // ----- UI -----
  return (
    <div>
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

        {/* Search / Filter / Sort */}
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

        {/* Ledger Cards */}
        {loading ? (
          <p className="text-muted-foreground">Loading ledgers...</p>
        ) : !selectedProgramId ? (
          <div className="text-center py-10 text-muted-foreground">
            Select a program to view its ledgers.
          </div>
        ) : filteredSorted.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <p>No ledgers found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSorted.map((ledger) => {
              const Icon = getIcon(ledger.icon);
              const count = entryCounts[ledger.id] || 0;
              const status = ledger.status || "active";
              const updated = ledger.updated_at || ledger.created_at;

              return (
                <Card key={ledger.id} className="transition-shadow duration-200">
                  <CardHeader className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded-md bg-muted shrink-0">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <CardTitle
                            className="text-lg font-semibold truncate cursor-pointer"
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

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="shrink-0">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => openEditDialog(ledger)}>
                            <Pencil className="w-4 h-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          {status === "archived" ? (
                            <DropdownMenuItem onClick={() => setLedgerStatus(ledger, "active")}>
                              <ArchiveRestore className="w-4 h-4 mr-2" /> Unarchive
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => setLedgerStatus(ledger, "archived")}>
                              <Archive className="w-4 h-4 mr-2" /> Archive
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => {
                              setActiveLedger(ledger);
                              setIsMoveOpen(true);
                            }}
                          >
                            <FileText className="w-4 h-4 mr-2" /> Move to Program
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setActiveLedger(ledger);
                              setIsDuplicateToOpen(true);
                            }}
                          >
                            <Copy className="w-4 h-4 mr-2" /> Duplicate to Program
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteLedger(ledger.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <CardDescription className="line-clamp-2">
                      {ledger.description || "No description provided."}
                    </CardDescription>

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
            <div className="space-y-2">
              <label className="text-sm font-medium">Template</label>
              <Select
                value={selectedTemplate || ""}
                onValueChange={(v) => {
                  setSelectedTemplate(v);

                  // 🧠 Find the template object
                  const chosen = templates.find((t) => t.id === v);

                  // 🪄 Auto-fill defaults from template (if not blank)
                  if (chosen && v !== "blank_template") {
                    setLedgerName(chosen.name || "");
                    setLedgerDescription(chosen.description || "");
                    setSelectedIcon(chosen.icon || null);
                  } else {
                    // Reset to blank if the user picks "Blank Ledger"
                    setLedgerName("");
                    setLedgerDescription("");
                    setSelectedIcon(null);
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Input
              placeholder="Ledger Name (e.g., 2025 Spring Performance Log)"
              value={ledgerName}
              onChange={(e) => setLedgerName(e.target.value)}
            />
            <Input
              placeholder="Description (optional)"
              value={ledgerDescription}
              onChange={(e) => setLedgerDescription(e.target.value)}
            />

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

      {/* ===== ICON PICKER ===== */}
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
      {/* ===== MOVE LEDGER MODAL ===== */}
      <Dialog open={isMoveOpen} onOpenChange={setIsMoveOpen}>
        <DialogContent className="sm:max-w-md bg-card">
          <DialogHeader>
            <DialogTitle>Move Ledger</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={targetProgramId ?? ""} onValueChange={setTargetProgramId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a program" />
              </SelectTrigger>
                <SelectContent>
                  {programs
                    .filter((p) => p.id !== selectedProgramId) // ✅ hide active program
                    .map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.school} {p.sport} {p.level} ({p.season_year})
                      </SelectItem>
                    ))
                  }
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMoveOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleMoveLedger} disabled={!targetProgramId}>
              Move
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== DUPLICATE TO PROGRAM MODAL ===== */}
      <Dialog open={isDuplicateToOpen} onOpenChange={setIsDuplicateToOpen}>
        <DialogContent className="sm:max-w-md bg-card">
          <DialogHeader>
            <DialogTitle>Duplicate Ledger to Program</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={targetProgramId ?? ""} onValueChange={setTargetProgramId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a program" />
              </SelectTrigger>
              <SelectContent>
                  {programs
                    .filter((p) => p.id !== selectedProgramId) // ✅ hide active program
                    .map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.school} {p.sport} {p.level} ({p.season_year})
                      </SelectItem>
                    ))
                  }
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDuplicateToOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleDuplicateToProgram} disabled={!targetProgramId}>
              Duplicate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
