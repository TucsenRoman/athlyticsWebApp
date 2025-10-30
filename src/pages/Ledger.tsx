import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { useProgramContext } from "@/hooks/useProgramContext";

interface Athlete {
  id: string;
  name: string;
  grade: number | null;
  gender: string | null;
  team_position: string | null;
  events: string[];
  achievements: string[];
  personal_records: any;
  athlete_of_week: boolean;
  athlete_of_meet: boolean;
}

const availableHeaders = [
  { id: "name", label: "Name" },
  { id: "grade", label: "Grade" },
  { id: "gender", label: "Gender" },
  { id: "team_position", label: "Position" },
  { id: "events", label: "Events" },
  { id: "achievements", label: "Achievements" },
  { id: "athlete_of_week", label: "Athlete of Week" },
  { id: "athlete_of_meet", label: "Athlete of Meet" },
];

export default function Ledger() {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHeaders, setSelectedHeaders] = useState<string[]>(["name", "grade", "gender", "team_position"]);
  const [editingCell, setEditingCell] = useState<{ athleteId: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState("");
  const { selectedProgramId } = useProgramContext();

  useEffect(() => {
    fetchAthletes();
  }, [selectedProgramId]);

  const fetchAthletes = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from("athletes")
        .select("*")
        .eq("coach_id", user.id);

      if (selectedProgramId) {
        query = query.eq("program_id", selectedProgramId);
      }

      const { data, error } = await query.order("name");

      if (error) throw error;
      setAthletes(data || []);
    } catch (error) {
      console.error("Error fetching athletes:", error);
      toast.error("Failed to load athletes");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAthlete = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("athletes")
        .insert({
          name: "New Athlete",
          coach_id: user.id,
          program_id: selectedProgramId,
          grade: null,
          gender: null,
          team_position: "None",
          events: [],
          achievements: [],
          personal_records: {},
          athlete_of_week: false,
          athlete_of_meet: false,
        })
        .select()
        .single();

      if (error) throw error;
      
      setAthletes([...athletes, data]);
      toast.success("Athlete added");
    } catch (error) {
      console.error("Error adding athlete:", error);
      toast.error("Failed to add athlete");
    }
  };

  const handleDeleteAthlete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("athletes")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setAthletes(athletes.filter(a => a.id !== id));
      toast.success("Athlete deleted");
    } catch (error) {
      console.error("Error deleting athlete:", error);
      toast.error("Failed to delete athlete");
    }
  };

  const startEdit = (athleteId: string, field: string, currentValue: any) => {
    setEditingCell({ athleteId, field });
    
    if (Array.isArray(currentValue)) {
      setEditValue(currentValue.join(", "));
    } else if (typeof currentValue === "boolean") {
      setEditValue(currentValue ? "true" : "false");
    } else {
      setEditValue(currentValue?.toString() || "");
    }
  };

  const saveEdit = async () => {
    if (!editingCell) return;

    const { athleteId, field } = editingCell;
    let processedValue: any = editValue;

    // Process value based on field type
    if (field === "grade") {
      processedValue = editValue ? parseInt(editValue) : null;
    } else if (field === "events" || field === "achievements") {
      processedValue = editValue.split(",").map(s => s.trim()).filter(Boolean);
    } else if (field === "athlete_of_week" || field === "athlete_of_meet") {
      processedValue = editValue.toLowerCase() === "true";
    }

    try {
      const { error } = await supabase
        .from("athletes")
        .update({ [field]: processedValue })
        .eq("id", athleteId);

      if (error) throw error;

      setAthletes(athletes.map(a => 
        a.id === athleteId ? { ...a, [field]: processedValue } : a
      ));
      
      setEditingCell(null);
      toast.success("Updated");
    } catch (error) {
      console.error("Error updating athlete:", error);
      toast.error("Failed to update");
    }
  };

  const renderCellValue = (athlete: Athlete, headerId: string) => {
    const value = athlete[headerId as keyof Athlete];
    
    if (Array.isArray(value)) {
      return value.join(", ") || "—";
    }
    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }
    return value?.toString() || "—";
  };

  const filteredAthletes = athletes.filter(athlete =>
    athlete.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleHeader = (headerId: string) => {
    setSelectedHeaders(prev =>
      prev.includes(headerId)
        ? prev.filter(h => h !== headerId)
        : [...prev, headerId]
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Ledger</h2>
          <Button onClick={handleAddAthlete} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Athlete
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Athlete Records</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search athletes by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-muted-foreground self-center">Headers:</span>
              {availableHeaders.map((header) => (
                <Button
                  key={header.id}
                  variant={selectedHeaders.includes(header.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleHeader(header.id)}
                >
                  {header.label}
                </Button>
              ))}
            </div>

            {filteredAthletes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? "No athletes found matching your search." : "No athletes yet. Click 'Add Athlete' to get started."}
              </div>
            ) : (
              <div className="border rounded-lg overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {selectedHeaders.map((headerId) => {
                        const header = availableHeaders.find((h) => h.id === headerId);
                        return header ? <TableHead key={headerId}>{header.label}</TableHead> : null;
                      })}
                      <TableHead className="w-16"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAthletes.map((athlete) => (
                      <TableRow key={athlete.id}>
                        {selectedHeaders.map((headerId) => (
                          <TableCell
                            key={`${athlete.id}-${headerId}`}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => startEdit(athlete.id, headerId, athlete[headerId as keyof Athlete])}
                          >
                            {editingCell?.athleteId === athlete.id && editingCell?.field === headerId ? (
                              <Input
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={saveEdit}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") saveEdit();
                                  if (e.key === "Escape") setEditingCell(null);
                                }}
                                autoFocus
                                className="h-8"
                              />
                            ) : (
                              renderCellValue(athlete, headerId)
                            )}
                          </TableCell>
                        ))}
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAthlete(athlete.id)}
                            className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
