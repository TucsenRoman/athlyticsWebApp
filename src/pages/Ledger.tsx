import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Edit2, Lock, ChevronDown, ArrowLeft, Settings } from "lucide-react";
import { useLedger } from "@/contexts/LedgerContext";
import { useProgramContext } from "@/hooks/useProgramContext";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import AddProgramModal from "@/components/ledger/AddProgramModal";
import EditProgramModal from "@/components/ledger/EditProgramModal";
import { supabase } from "@/integrations/supabase/client";

export default function Ledger() {
  const navigate = useNavigate();
  const { selectedProgramId, setSelectedProgramId } = useProgramContext();
  const {
    headers,
    athletes,
    loading,
    addHeader,
    editHeader,
    deleteHeader,
    addAthlete,
    updateAthlete,
    deleteAthlete,
    getCustomFieldValue,
    getAttendanceRate,
  } = useLedger();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHeaders, setSelectedHeaders] = useState<string[]>(["name", "gender", "grade", "attendance_rate"]);
  const [editingCell, setEditingCell] = useState<{ athleteId: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [newHeaderName, setNewHeaderName] = useState("");
  const [isAddHeaderOpen, setIsAddHeaderOpen] = useState(false);
  const [editingHeaderId, setEditingHeaderId] = useState<string | null>(null);
  const [editingHeaderValue, setEditingHeaderValue] = useState("");
  const [isAddAthleteOpen, setIsAddAthleteOpen] = useState(false);
  const [newAthleteData, setNewAthleteData] = useState<Record<string, any>>({});
  const [isAddProgramOpen, setIsAddProgramOpen] = useState(false);
  const [isEditProgramOpen, setIsEditProgramOpen] = useState(false);
  const [programs, setPrograms] = useState<any[]>([]);
  const [programsLoading, setProgramsLoading] = useState(true);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    setProgramsLoading(true);
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
    } catch (error) {
      console.error("Error fetching programs:", error);
      toast.error("Failed to load programs");
    } finally {
      setProgramsLoading(false);
    }
  };

  const handleProgramCreated = (programId: string) => {
    setSelectedProgramId(programId);
    fetchPrograms();
  };

  const handleProgramUpdated = () => {
    fetchPrograms();
  };

  const filteredAthletes = athletes.filter(athlete =>
    athlete.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleHeader = (headerId: string) => {
    setSelectedHeaders(prev => {
      const newHeaders = prev.includes(headerId)
        ? prev.filter(h => h !== headerId)
        : [...prev, headerId];
      
      // Enforce at least "name" header
      if (newHeaders.length === 0 || !newHeaders.includes("name")) {
        return ["name"];
      }
      
      return newHeaders;
    });
  };

  const handleAddCustomHeader = () => {
    if (!newHeaderName.trim()) {
      toast.error("Header name cannot be empty");
      return;
    }

    addHeader(newHeaderName);
    setNewHeaderName("");
    setIsAddHeaderOpen(false);
  };

  const startEditHeader = (header: any) => {
    if (header.isHardwired) return;
    setEditingHeaderId(header.id);
    setEditingHeaderValue(header.label);
  };

  const saveHeaderEdit = () => {
    if (!editingHeaderId || !editingHeaderValue.trim()) return;
    editHeader(editingHeaderId, editingHeaderValue);
    setEditingHeaderId(null);
  };

  const handleDeleteHeader = (headerId: string) => {
    deleteHeader(headerId);
    setSelectedHeaders(prev => prev.filter(h => h !== headerId));
  };

  const startEdit = (athleteId: string, field: string) => {
    // Don't allow editing attendance_rate
    if (field === "attendance_rate") return;

    const athlete = athletes.find(a => a.id === athleteId);
    if (!athlete) return;

    setEditingCell({ athleteId, field });
    
    // Check if it's a custom field
    const isCustomOrSpecial = !headers.find(h => h.id === field && h.isHardwired);
    
    if (isCustomOrSpecial) {
      setEditValue(getCustomFieldValue(athleteId, field));
      return;
    }

    const currentValue = athlete[field as keyof typeof athlete];
    
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
    await updateAthlete(editingCell.athleteId, editingCell.field, editValue);
    setEditingCell(null);
  };

  const renderCellValue = (athlete: any, headerId: string) => {
    // Special handling for attendance_rate
    if (headerId === "attendance_rate") {
      return getAttendanceRate(athlete.id);
    }

    // Check if it's a custom field
    const header = headers.find(h => h.id === headerId);
    const isCustom = header && !header.isHardwired;
    
    if (isCustom) {
      const value = getCustomFieldValue(athlete.id, headerId);
      return value || "—";
    }

    const value = athlete[headerId as keyof typeof athlete];
    
    if (Array.isArray(value)) {
      return value.join(", ") || "—";
    }
    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }
    return value?.toString() || "—";
  };

  const handleAddAthlete = async () => {
    if (!newAthleteData.name?.trim()) {
      toast.error("Name is required");
      return;
    }

    await addAthlete(newAthleteData);
    setNewAthleteData({});
    setIsAddAthleteOpen(false);
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

  const selectedProgram = programs.find(p => p.id === selectedProgramId);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="gap-2 -ml-2 self-start"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Button>
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">Ledger</h2>
          </div>
        </div>

        <AddProgramModal
          open={isAddProgramOpen}
          onOpenChange={setIsAddProgramOpen}
          onProgramCreated={handleProgramCreated}
        />

        {selectedProgramId && (
          <EditProgramModal
            open={isEditProgramOpen}
            onOpenChange={setIsEditProgramOpen}
            programId={selectedProgramId}
            onProgramUpdated={handleProgramUpdated}
          />
        )}

        {/* Program Selection Section */}
        <Card>
          <CardHeader>
            <CardTitle>Program Selection</CardTitle>
          </CardHeader>
          <CardContent>
            {programsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3">
                <Select
                  value={selectedProgramId || ""}
                  onValueChange={setSelectedProgramId}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a program..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    {programs.map((program) => (
                      <SelectItem key={program.id} value={program.id}>
                        {program.school} – {program.name} ({program.season_year})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <div className="flex gap-2">
                  <Button onClick={() => setIsAddProgramOpen(true)} variant="outline">
                    <Plus className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Add Program</span>
                  </Button>
                  
                  {selectedProgramId && (
                    <Button onClick={() => setIsEditProgramOpen(true)} variant="outline">
                      <Settings className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Edit Program</span>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {!selectedProgramId ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <div className="text-muted-foreground text-lg">
                  No program selected
                </div>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Please create or select a program to view its Ledger.
                </p>
                <Button onClick={() => setIsAddProgramOpen(true)} className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Program
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">

        <Card>
          <CardHeader>
            <CardTitle>Header Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2 items-center">
              {headers.map((header) => (
                <div key={header.id} className={cn(
                  "flex items-center gap-1 rounded-md px-2 py-1",
                  header.isHardwired ? "bg-muted/70 border border-muted-foreground/20" : "bg-muted"
                )}>
                  {header.isHardwired && (
                    <Lock className="w-3 h-3 text-muted-foreground" />
                  )}
                  
                  {editingHeaderId === header.id ? (
                    <Input
                      value={editingHeaderValue}
                      onChange={(e) => setEditingHeaderValue(e.target.value)}
                      onBlur={saveHeaderEdit}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveHeaderEdit();
                        if (e.key === "Escape") setEditingHeaderId(null);
                      }}
                      className="h-6 w-24 px-1 text-sm"
                      autoFocus
                    />
                  ) : (
                    <span className={cn(
                      "text-sm font-medium",
                      header.isHardwired && "text-muted-foreground"
                    )}>{header.label}</span>
                  )}
                  
                  {!header.isHardwired && (
                    <div className="flex items-center gap-0.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditHeader(header)}
                        className="h-5 w-5 p-0 hover:bg-background"
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteHeader(header.id)}
                        className="h-5 w-5 p-0 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              
              <Dialog open={isAddHeaderOpen} onOpenChange={setIsAddHeaderOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Header
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-card">
                  <DialogHeader>
                    <DialogTitle>Add Custom Header</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <Input
                      placeholder="Enter header name (e.g., Mile Goal)"
                      value={newHeaderName}
                      onChange={(e) => setNewHeaderName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddCustomHeader();
                      }}
                      autoFocus
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsAddHeaderOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddCustomHeader}>
                        Add Header
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Athlete Records</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search athletes by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-8"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-muted"
                  >
                    <Plus className="h-4 w-4 rotate-45" />
                  </Button>
                )}
              </div>
              
              <div className="flex gap-2 items-center flex-wrap">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-between min-w-[200px]">
                      Visible Columns ({selectedHeaders.length})
                      <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[250px] p-3 bg-card" align="start">
                    <div className="space-y-2">
                      <div className="text-sm font-medium mb-3">Select Columns</div>
                      {headers.map((header) => (
                        <div key={header.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`header-${header.id}`}
                            checked={selectedHeaders.includes(header.id)}
                            onCheckedChange={() => toggleHeader(header.id)}
                            disabled={header.id === "name" && selectedHeaders.includes("name") && selectedHeaders.length === 1}
                          />
                          <label
                            htmlFor={`header-${header.id}`}
                            className={cn(
                              "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-1",
                              header.isHardwired && "text-muted-foreground"
                            )}
                          >
                            {header.isHardwired && <Lock className="w-3 h-3" />}
                            {header.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
                
                <Dialog open={isAddAthleteOpen} onOpenChange={setIsAddAthleteOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="whitespace-nowrap">
                      <Plus className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Add Athlete</span>
                      <span className="sm:hidden">Add</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md bg-card max-h-[90vh] flex flex-col p-0">
                    <DialogHeader className="px-6 pt-6">
                      <DialogTitle>Add Athlete</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto px-6 py-4">
                      <div className="space-y-4">
                        {headers.filter(header => header.id !== "attendance_rate").map((header) => (
                          <div key={header.id} className="space-y-2">
                            <Label htmlFor={header.id} className="flex items-center gap-1">
                              {header.isHardwired && <Lock className="w-3 h-3 text-muted-foreground" />}
                              {header.label}
                              {header.id === "name" && <span className="text-destructive ml-1">*</span>}
                            </Label>
                            {header.id === "gender" ? (
                              <Select
                                value={newAthleteData[header.id] || ""}
                                onValueChange={(value) => setNewAthleteData({ ...newAthleteData, [header.id]: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent className="bg-popover z-50">
                                  <SelectItem value="Male">Male</SelectItem>
                                  <SelectItem value="Female">Female</SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <Input
                                id={header.id}
                                placeholder={`Enter ${header.label.toLowerCase()}`}
                                value={newAthleteData[header.id] || ""}
                                onChange={(e) => setNewAthleteData({ ...newAthleteData, [header.id]: e.target.value })}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <DialogFooter className="px-6 py-4 border-t bg-muted/20">
                      <div className="flex justify-end gap-2 w-full">
                        <Button variant="outline" onClick={() => {
                          setIsAddAthleteOpen(false);
                          setNewAthleteData({});
                        }}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddAthlete}>
                          Add Athlete
                        </Button>
                      </div>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>


            {searchQuery && filteredAthletes.length > 0 ? (
              <div className="space-y-4">
                <div className="text-sm font-medium text-muted-foreground">
                  Search Results ({filteredAthletes.length})
                </div>
                {filteredAthletes.map((athlete) => (
                  <Card key={athlete.id} className="bg-muted/30">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{athlete.name}</CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteAthlete(athlete.id)}
                          className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {headers.map((header) => (
                          <div key={header.id} className="space-y-1">
                            <Label className={cn(
                              "text-sm flex items-center gap-1",
                              header.isHardwired && "text-muted-foreground"
                            )}>
                              {header.isHardwired && <Lock className="w-3 h-3" />}
                              {header.label}
                            </Label>
                            <div 
                              className={cn(
                                "text-sm font-medium p-2 rounded",
                                header.id !== "attendance_rate" && "cursor-pointer hover:bg-muted/50"
                              )}
                              onClick={() => header.id !== "attendance_rate" && startEdit(athlete.id, header.id)}
                            >
                              {editingCell?.athleteId === athlete.id && editingCell?.field === header.id ? (
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
                                renderCellValue(athlete, header.id)
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : searchQuery ? (
              <div className="text-center py-8 text-muted-foreground">
                No athletes found matching your search.
              </div>
            ) : filteredAthletes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No athletes yet. Click 'Add Athlete' to get started.
              </div>
            ) : (
              <div className="border rounded-lg overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {selectedHeaders.map((headerId) => {
                        const header = headers.find((h) => h.id === headerId);
                        return header ? (
                          <TableHead key={headerId} className={cn(
                            header.isHardwired && "bg-muted/30"
                          )}>
                            <div className="flex items-center gap-1">
                              {header.isHardwired && <Lock className="w-3 h-3 text-muted-foreground" />}
                              {header.label}
                            </div>
                          </TableHead>
                        ) : null;
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
                            className={`${headerId !== "attendance_rate" ? "cursor-pointer hover:bg-muted/50" : ""}`}
                            onClick={() => headerId !== "attendance_rate" && startEdit(athlete.id, headerId)}
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
                            onClick={() => deleteAthlete(athlete.id)}
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
        )}
      </div>
    </DashboardLayout>
  );
}
