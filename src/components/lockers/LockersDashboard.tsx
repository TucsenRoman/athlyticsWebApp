import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { sanitizeSelectValue } from "@/lib/utils";

interface Locker {
  id: string;
  locker_number: string;
  status: string;
  athlete_id: string | null;
  combination: string | null;
  location: string | null;
  notes: string | null;
}

interface Athlete {
  id: string;
  name: string;
}

export default function LockersDashboard() {
  const [lockers, setLockers] = useState<Locker[]>([]);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingLocker, setEditingLocker] = useState<Locker | null>(null);
  const [formData, setFormData] = useState({
    locker_number: "",
    status: "Available",
    athlete_id: null as string | null,
    combination: "",
    location: "",
    notes: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch lockers
      const { data: lockersData, error: lockersError } = await supabase
        .from("lockers")
        .select("*")
        .order("locker_number");

      if (lockersError) throw lockersError;

      // Fetch athletes
      const { data: athletesData, error: athletesError } = await supabase
        .from("athletes")
        .select("id, name")
        .order("name");

      if (athletesError) throw athletesError;

      setLockers(lockersData || []);
      setAthletes(athletesData || []);
    } catch (error: any) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("lockers").insert({
        coach_id: user.id,
        locker_number: formData.locker_number,
        status: formData.status,
        athlete_id: formData.athlete_id,
        combination: formData.combination || null,
        location: formData.location || null,
        notes: formData.notes || null,
      });

      if (error) throw error;

      toast.success("Locker added successfully");
      setIsAddDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to add locker");
    }
  };

  const handleEdit = async () => {
    if (!editingLocker) return;

    try {
      // Auto-clear athlete_id if status changed to Available
      const updates: any = {
        locker_number: formData.locker_number,
        status: formData.status,
        athlete_id: formData.status === "Available" ? null : formData.athlete_id,
        combination: formData.combination || null,
        location: formData.location || null,
        notes: formData.notes || null,
      };

      const { error } = await supabase
        .from("lockers")
        .update(updates)
        .eq("id", editingLocker.id);

      if (error) throw error;

      toast.success("Locker updated successfully");
      setIsEditDialogOpen(false);
      setEditingLocker(null);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to update locker");
    }
  };

  const handleDelete = async (lockerId: string) => {
    if (!confirm("Are you sure you want to delete this locker?")) return;

    try {
      const { error } = await supabase.from("lockers").delete().eq("id", lockerId);

      if (error) throw error;

      toast.success("Locker deleted successfully");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete locker");
    }
  };

  const openEditDialog = (locker: Locker) => {
    setEditingLocker(locker);
    setFormData({
      locker_number: locker.locker_number,
      status: locker.status,
      athlete_id: locker.athlete_id,
      combination: locker.combination || "",
      location: locker.location || "",
      notes: locker.notes || "",
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      locker_number: "",
      status: "Available",
      athlete_id: null,
      combination: "",
      location: "",
      notes: "",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Assigned":
        return "default";
      case "Available":
        return "secondary";
      case "Out of Service":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getAthleteName = (athleteId: string | null) => {
    if (!athleteId) return "—";
    const athlete = athletes.find((a) => a.id === athleteId);
    return athlete?.name || "—";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Locker Management</CardTitle>
          <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Locker
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Locker #</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Combination</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : lockers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No lockers found. Add one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                lockers.map((locker) => (
                  <TableRow key={locker.id}>
                    <TableCell className="font-medium">{locker.locker_number}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(locker.status)}>{locker.status}</Badge>
                    </TableCell>
                    <TableCell>{getAthleteName(locker.athlete_id)}</TableCell>
                    <TableCell>{locker.combination || "—"}</TableCell>
                    <TableCell>{locker.location || "—"}</TableCell>
                    <TableCell className="max-w-xs truncate">{locker.notes || "—"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(locker)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(locker.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Add Locker Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Locker</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="locker_number">Locker Number *</Label>
              <Input
                id="locker_number"
                value={formData.locker_number}
                onChange={(e) => setFormData({ ...formData, locker_number: e.target.value })}
                placeholder="e.g., 101"
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Assigned">Assigned</SelectItem>
                  <SelectItem value="Out of Service">Out of Service</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="athlete_id">Assign to Athlete</Label>
              <Select 
                value={sanitizeSelectValue(formData.athlete_id)} 
                onValueChange={(value) => setFormData({ ...formData, athlete_id: value === "NONE" ? null : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select athlete (optional)" />
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
            <div>
              <Label htmlFor="combination">Combination</Label>
              <Input
                id="combination"
                value={formData.combination}
                onChange={(e) => setFormData({ ...formData, combination: e.target.value })}
                placeholder="e.g., 12-34-56"
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Boys Locker Room"
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); resetForm(); }}>
                Cancel
              </Button>
              <Button onClick={handleAdd} disabled={!formData.locker_number}>
                Add Locker
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Locker Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Locker</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit_locker_number">Locker Number *</Label>
              <Input
                id="edit_locker_number"
                value={formData.locker_number}
                onChange={(e) => setFormData({ ...formData, locker_number: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit_status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Assigned">Assigned</SelectItem>
                  <SelectItem value="Out of Service">Out of Service</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit_athlete_id">Assign to Athlete</Label>
              <Select 
                value={sanitizeSelectValue(formData.athlete_id)} 
                onValueChange={(value) => setFormData({ ...formData, athlete_id: value === "NONE" ? null : value })}
                disabled={formData.status === "Available"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select athlete (optional)" />
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
            <div>
              <Label htmlFor="edit_combination">Combination</Label>
              <Input
                id="edit_combination"
                value={formData.combination}
                onChange={(e) => setFormData({ ...formData, combination: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit_location">Location</Label>
              <Input
                id="edit_location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit_notes">Notes</Label>
              <Textarea
                id="edit_notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setIsEditDialogOpen(false); resetForm(); }}>
                Cancel
              </Button>
              <Button onClick={handleEdit} disabled={!formData.locker_number}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
