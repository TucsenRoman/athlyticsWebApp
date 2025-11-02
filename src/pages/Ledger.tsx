import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  FilePlus2,
  FileText,
  Layers,
  Users,
  ClipboardList,
  Lock,
  Shirt,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
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
// import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const TEMPLATES = [
  {
    id: "performance",
    name: "Performance Log",
    icon: ClipboardList,
    description: "Track athlete performance metrics and personal records.",
  },
  {
    id: "lockers",
    name: "Locker Manager",
    icon: Lock,
    description: "Assign and track lockers.",
  },
  {
    id: "uniforms",
    name: "Uniform Manager",
    icon: Shirt,
    description: "Assign, track, and collect uniforms or equipment.",
  },
];

export default function Ledger() {
  const [activeTab, setActiveTab] = useState("templates");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [programs, setPrograms] = useState<any[]>([]);
  const [programId, setProgramId] = useState<string | null>(null);
  const [ledgerName, setLedgerName] = useState("");
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  // ✅ Fetch user's programs on mount
  useEffect(() => {
    const fetchPrograms = async () => {
      setLoadingPrograms(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from("programs")
          .select("*")
          .eq("coach_id", user.id)
          .order("school", { ascending: true });

        if (error) throw error;
        setPrograms(data || []);
      } catch (err) {
        console.error("Error loading programs:", err);
        // toast.error("Failed to load programs");
      } finally {
        setLoadingPrograms(false);
      }
    };

    fetchPrograms();
  }, []);

  // ✅ Opens modal for the chosen template
  const handleUseTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    setIsModalOpen(true);
  };

  // ✅ Create a new ledger in Supabase
  const handleCreateLedger = async () => {
    if (!programId) {
      // toast.error("Please select a program");
      return;
    }
    if (!selectedTemplate) {
      // toast.error("No template selected");
      return;
    }

    try {
      setCreating(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not logged in");

      const { data, error } = await supabase
        .from("ledgers")
        .insert([
          {
            coach_id: user.id,
            program_id: programId,
            name: ledgerName.trim() || `New ${selectedTemplate} Ledger`,
            template_key: selectedTemplate,
            status: "draft",
          },
        ])
        .select()
        .single();

      if (error || !data) throw error;

      // toast.success(`Ledger "${data.name}" created!`);
      setIsModalOpen(false);
      setLedgerName("");
      setProgramId(null);
      setSelectedTemplate(null);

      // ✅ Redirect to ledger view
      navigate(`/ledgers/${data.id}`);
    } catch (err) {
      console.error("Error creating ledger:", err);
      // toast.error("Failed to create ledger");
    } finally {
      setCreating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* === PAGE HEADER === */}
        <div className="flex flex-col gap-4">
          <h2 className="text-3xl font-bold tracking-tight">Ledgers</h2>
        </div>

        {/* === TABS === */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="sticky top-0 z-10 grid w-full grid-cols-4 h-12 bg-muted/50 border-b border-border mb-4 p-0 rounded-none">
            <TabsTrigger
              value="new"
              className="h-12 px-4 data-[state=active]:bg-background data-[state=active]:rounded-t-lg flex items-center justify-center gap-2 transition-all duration-200"
            >
              <FilePlus2 className="w-5 h-5" />
              <span className="hidden md:inline">New</span>
            </TabsTrigger>

            <TabsTrigger
              value="your-ledgers"
              className="h-12 px-4 data-[state=active]:bg-background data-[state=active]:rounded-t-lg flex items-center justify-center gap-2 transition-all duration-200"
            >
              <FileText className="w-5 h-5" />
              <span className="hidden md:inline">Your Ledgers</span>
            </TabsTrigger>

            <TabsTrigger
              value="templates"
              className="h-12 px-4 data-[state=active]:bg-background data-[state=active]:rounded-t-lg flex items-center justify-center gap-2 transition-all duration-200"
            >
              <Layers className="w-5 h-5" />
              <span className="hidden md:inline">Templates</span>
            </TabsTrigger>

            <TabsTrigger
              value="community"
              className="h-12 px-4 data-[state=active]:bg-background data-[state=active]:rounded-t-lg flex items-center justify-center gap-2 transition-all duration-200"
            >
              <Users className="w-5 h-5" />
              <span className="hidden md:inline">Community</span>
            </TabsTrigger>
          </TabsList>

          {/* === TEMPLATES TAB === */}
          <TabsContent value="templates" className="animate-fade-in space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {TEMPLATES.map((template) => {
                const Icon = template.icon;
                return (
                  <Card
                    key={template.id}
                    className="flex flex-col justify-between hover:shadow-md transition-shadow duration-200"
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-md bg-muted">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <CardTitle className="text-lg font-semibold">
                          {template.name}
                        </CardTitle>
                      </div>
                      <CardDescription className="mt-2">
                        {template.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        className="w-full mt-2"
                        onClick={() => handleUseTemplate(template.id)}
                        disabled={creating}
                      >
                        {creating ? "Creating..." : "Use Template"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* === OTHER TABS === */}
          <TabsContent value="new" className="animate-fade-in space-y-4">
            <p className="text-muted-foreground">
              Build a custom ledger with drag &amp; drop components.{" "}
              <strong>*IN DEVELOPMENT*</strong>
            </p>
          </TabsContent>

          <TabsContent value="your-ledgers" className="animate-fade-in space-y-4">
            <p className="text-muted-foreground">
              Your saved ledgers will appear here.
            </p>
          </TabsContent>

          <TabsContent value="community" className="animate-fade-in space-y-4">
            <p className="text-muted-foreground">
              Explore community-shared ledgers.{" "}
              <strong>*IN DEVELOPMENT*</strong>
            </p>
          </TabsContent>
        </Tabs>
      </div>

      {/* === CREATE LEDGER MODAL === */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md bg-card">
          <DialogHeader>
            <DialogTitle>Create Ledger from Template</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Template</label>
              <Input
                value={
                  TEMPLATES.find((t) => t.id === selectedTemplate)?.name || ""
                }
                disabled
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Program</label>
              <Select
                value={programId || ""}
                onValueChange={(v) => setProgramId(v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      loadingPrograms ? "Loading programs..." : "Select a program"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {programs.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.school} — {p.sport} ({p.season_year})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ledger Name</label>
              <Input
                placeholder="e.g., 2025 Spring Performance Log"
                value={ledgerName}
                onChange={(e) => setLedgerName(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateLedger} disabled={creating}>
              {creating ? "Creating..." : "Create Ledger"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}