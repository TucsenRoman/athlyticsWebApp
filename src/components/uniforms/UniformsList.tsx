import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Search, Pencil, Trash2, ShirtIcon, LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { sanitizeSelectValue } from "@/lib/utils";
import AssignLockerModal from "@/components/lockers/AssignLockerModal";
import { z } from "zod";

interface Uniform {
  id: string;
  top_id: string;
  bottom_id: string;
  assigned_to: string | null;
  athlete_id: string | null;
  status: string;
  notes: string | null;
}

interface Athlete {
  id: string;
  name: string;
}

export default function UniformsList() {
  const [uniforms, setUniforms] = useState<Uniform[]>([]);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUniform, setEditingUniform] = useState<Uniform | null>(null);
  const [selectedUniforms, setSelectedUniforms] = useState<Set<string>>(new Set());
  const [showBulkReturnDialog, setShowBulkReturnDialog] = useState(false);
  const [newUniform, setNewUniform] = useState({
    top_id: "",
    bottom_id: "",
    athlete_id: null as string | null,
    status: "Checked Out",
    notes: "",
  });
  const [lockerModalOpen, setLockerModalOpen] = useState(false);
  const [selectedUniformForLocker, setSelectedUniformForLocker] = useState<{ athleteId: string; athleteName: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [uniformsRes, athletesRes] = await Promise.all([
        supabase.from("uniforms").select("*").order("top_id"),
        supabase.from("athletes").select("id, name").order("name"),
      ]);

      if (uniformsRes.error) throw uniformsRes.error;
      if (athletesRes.error) throw athletesRes.error;

      setUniforms(uniformsRes.data || []);
      setAthletes(athletesRes.data || []);
    } catch (error: any) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const uniformSchema = z.object({
    top_id: z.string()
      .trim()
      .min(1, "Top ID is required")
      .max(50, "Top ID must be less than 50 characters")
      .regex(/^[A-Za-z0-9-]+$/, "Top ID can only contain letters, numbers, and hyphens"),
    bottom_id: z.string()
      .trim()
      .min(1, "Bottom ID is required")
      .max(50, "Bottom ID must be less than 50 characters")
      .regex(/^[A-Za-z0-9-]+$/, "Bottom ID can only contain letters, numbers, and hyphens"),
    notes: z.string()
      .max(500, "Notes must be less than 500 characters")
      .optional()
      .nullable()
      .transform(val => val || null),
    status: z.enum(["Checked Out", "Returned", "Lost"], {
      errorMap: () => ({ message: "Invalid status value" })
    })
  });

  const handleAddUniform = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate input
      const validation = uniformSchema.safeParse({
        top_id: newUniform.top_id,
        bottom_id: newUniform.bottom_id,
        notes: newUniform.notes,
        status: newUniform.status
      });

      if (!validation.success) {
        toast.error(validation.error.errors[0].message);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("uniforms").insert({
        coach_id: user.id,
        top_id: validation.data.top_id,
        bottom_id: validation.data.bottom_id,
        athlete_id: newUniform.athlete_id,
        status: validation.data.status,
        notes: validation.data.notes,
      });

      if (error) {
        if (error.code === '23505') {
          toast.error("A uniform with this Top ID and Bottom ID already exists");
        } else {
          throw error;
        }
        return;
      }

      toast.success("Uniform added successfully!");
      setIsAddDialogOpen(false);
      setNewUniform({
        top_id: "",
        bottom_id: "",
        athlete_id: null,
        status: "Checked Out",
        notes: "",
      });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to add uniform");
    }
  };

  const handleEditUniform = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUniform) return;
    
    try {
      // Validate input
      const validation = uniformSchema.safeParse({
        top_id: editingUniform.top_id,
        bottom_id: editingUniform.bottom_id,
        notes: editingUniform.notes,
        status: editingUniform.status
      });

      if (!validation.success) {
        toast.error(validation.error.errors[0].message);
        return;
      }

      const { error } = await supabase
        .from("uniforms")
        .update({
          top_id: validation.data.top_id,
          bottom_id: validation.data.bottom_id,
          athlete_id: editingUniform.athlete_id,
          status: validation.data.status,
          notes: validation.data.notes,
        })
        .eq("id", editingUniform.id);

      if (error) {
        if (error.code === '23505') {
          toast.error("A uniform with this Top ID and Bottom ID already exists");
        } else {
          throw error;
        }
        return;
      }

      toast.success("Uniform updated successfully!");
      setIsEditDialogOpen(false);
      setEditingUniform(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to update uniform");
    }
  };

  const handleDeleteUniform = async (id: string) => {
    if (!confirm("Are you sure you want to delete this uniform?")) return;

    try {
      const { error } = await supabase
        .from("uniforms")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Uniform deleted successfully!");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete uniform");
    }
  };

  const openEditDialog = (uniform: Uniform) => {
    setEditingUniform(uniform);
    setIsEditDialogOpen(true);
  };

  const toggleUniformSelection = (uniformId: string) => {
    setSelectedUniforms(prev => {
      const newSet = new Set(prev);
      if (newSet.has(uniformId)) {
        newSet.delete(uniformId);
      } else {
        newSet.add(uniformId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedUniforms.size === filteredUniforms.length) {
      setSelectedUniforms(new Set());
    } else {
      setSelectedUniforms(new Set(filteredUniforms.map(u => u.id)));
    }
  };

  const handleBulkReturn = async () => {
    if (selectedUniforms.size === 0) {
      toast.error("Please select at least one uniform");
      return;
    }

    setShowBulkReturnDialog(true);
  };

  const confirmBulkReturn = async () => {
    try {
      const uniformIds = Array.from(selectedUniforms);
      
      const { error } = await supabase
        .from("uniforms")
        .update({
          status: "Returned",
          assigned_to: null,
          athlete_id: null,
        })
        .in("id", uniformIds);

      if (error) throw error;

      toast.success(`${uniformIds.length} uniform(s) marked as returned!`);
      setSelectedUniforms(new Set());
      setShowBulkReturnDialog(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to update uniforms");
    }
  };

  const filteredUniforms = uniforms.filter(uniform => {
    const matchesSearch = 
      uniform.top_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      uniform.bottom_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (uniform.assigned_to && uniform.assigned_to.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || uniform.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Checked Out":
        return "default";
      case "Returned":
        return "secondary";
      case "Lost":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading uniforms...</div>;
  }

  return (
    <div className="space-y-6">
      {selectedUniforms.size > 0 && (
        <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border border-primary/20">
          <p className="text-sm font-medium">
            {selectedUniforms.size} uniform(s) selected
          </p>
          <Button onClick={handleBulkReturn} variant="default">
            Mark as Returned
          </Button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by athlete or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Checked Out">Checked Out</SelectItem>
              <SelectItem value="Returned">Returned</SelectItem>
              <SelectItem value="Lost">Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Uniform
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Uniform</DialogTitle>
              <DialogDescription>
                Enter the uniform set information.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddUniform} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="top_id">Top ID</Label>
                <Input
                  id="top_id"
                  placeholder="e.g., G21"
                  value={newUniform.top_id}
                  onChange={(e) => setNewUniform({ ...newUniform, top_id: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bottom_id">Bottom ID</Label>
                <Input
                  id="bottom_id"
                  placeholder="e.g., 15"
                  value={newUniform.bottom_id}
                  onChange={(e) => setNewUniform({ ...newUniform, bottom_id: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="athlete">Assign to Athlete (Optional)</Label>
                <Select
                  value={sanitizeSelectValue(newUniform.athlete_id)}
                  onValueChange={(value) => setNewUniform({ ...newUniform, athlete_id: value === "NONE" ? null : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select athlete" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">None</SelectItem>
                    {athletes.map((athlete) => (
                      <SelectItem key={athlete.id} value={athlete.id}>
                        {athlete.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={newUniform.status}
                  onValueChange={(value) => setNewUniform({ ...newUniform, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Checked Out">Checked Out</SelectItem>
                    <SelectItem value="Returned">Returned</SelectItem>
                    <SelectItem value="Lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional notes..."
                  value={newUniform.notes}
                  onChange={(e) => setNewUniform({ ...newUniform, notes: e.target.value })}
                  rows={3}
                />
              </div>
              <Button type="submit" className="w-full">Add Uniform</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {editingUniform && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Uniform</DialogTitle>
              <DialogDescription>
                Update the uniform set information.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditUniform} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit_top_id">Top ID</Label>
                <Input
                  id="edit_top_id"
                  value={editingUniform.top_id}
                  onChange={(e) => setEditingUniform({ ...editingUniform, top_id: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_bottom_id">Bottom ID</Label>
                <Input
                  id="edit_bottom_id"
                  value={editingUniform.bottom_id}
                  onChange={(e) => setEditingUniform({ ...editingUniform, bottom_id: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_athlete">Assign to Athlete</Label>
                <Select
                  value={sanitizeSelectValue(editingUniform.athlete_id)}
                  onValueChange={(value) => setEditingUniform({ ...editingUniform, athlete_id: value === "NONE" ? null : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select athlete" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">None</SelectItem>
                    {athletes.map((athlete) => (
                      <SelectItem key={athlete.id} value={athlete.id}>
                        {athlete.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_status">Status</Label>
                <Select
                  value={editingUniform.status}
                  onValueChange={(value) => setEditingUniform({ ...editingUniform, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Checked Out">Checked Out</SelectItem>
                    <SelectItem value="Returned">Returned</SelectItem>
                    <SelectItem value="Lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_notes">Notes</Label>
                <Textarea
                  id="edit_notes"
                  value={editingUniform.notes || ""}
                  onChange={(e) => setEditingUniform({ ...editingUniform, notes: e.target.value })}
                  rows={3}
                />
              </div>
              <Button type="submit" className="w-full">Update Uniform</Button>
            </form>
          </DialogContent>
        </Dialog>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShirtIcon className="w-5 h-5" />
            Uniforms Inventory
          </CardTitle>
          <CardDescription>
            {filteredUniforms.length} uniform{filteredUniforms.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedUniforms.size === filteredUniforms.length && filteredUniforms.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Top ID</TableHead>
                <TableHead>Bottom ID</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUniforms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No uniforms found. Add your first uniform to get started!
                  </TableCell>
                </TableRow>
              ) : (
                filteredUniforms.map((uniform) => (
                  <TableRow key={uniform.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedUniforms.has(uniform.id)}
                        onCheckedChange={() => toggleUniformSelection(uniform.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{uniform.top_id}</TableCell>
                    <TableCell className="font-medium">{uniform.bottom_id}</TableCell>
                    <TableCell>
                      {uniform.assigned_to || (
                        <span className="text-muted-foreground italic">Not assigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(uniform.status)}>
                        {uniform.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {uniform.notes || (
                        <span className="text-muted-foreground italic">No notes</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        {uniform.athlete_id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const athleteName = uniform.assigned_to || "Athlete";
                              setSelectedUniformForLocker({
                                athleteId: uniform.athlete_id!,
                                athleteName,
                              });
                              setLockerModalOpen(true);
                            }}
                            title="Assign Locker"
                          >
                            <LockKeyhole className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(uniform)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUniform(uniform.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={showBulkReturnDialog} onOpenChange={setShowBulkReturnDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Bulk Return</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark {selectedUniforms.size} uniform(s) as returned? 
              This will clear all athlete assignments and update the status to "Returned".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBulkReturn}>
              Confirm Return
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {selectedUniformForLocker && (
        <AssignLockerModal
          isOpen={lockerModalOpen}
          onClose={() => {
            setLockerModalOpen(false);
            setSelectedUniformForLocker(null);
          }}
          athleteId={selectedUniformForLocker.athleteId}
          athleteName={selectedUniformForLocker.athleteName}
          onSuccess={() => {
            // No need to refresh anything specific in uniforms
          }}
        />
      )}
    </div>
  );
}
