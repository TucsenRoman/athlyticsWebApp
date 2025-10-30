import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

interface EditProgramModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  programId: string;
  onProgramUpdated: () => void;
  onProgramDeleted: () => void;
}

export default function EditProgramModal({
  open,
  onOpenChange,
  programId,
  onProgramUpdated,
  onProgramDeleted,
}: EditProgramModalProps) {
  const [school, setSchool] = useState("");
  const [sport, setSport] = useState("");
  const [level, setLevel] = useState("Varsity");
  const [gender, setGender] = useState("Mixed");
  const [seasonYear, setSeasonYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (open && programId) {
      loadProgramData();
    }
  }, [open, programId]);

  const loadProgramData = async () => {
    setInitialLoading(true);
    try {
      const { data, error } = await supabase
        .from("programs")
        .select("*")
        .eq("id", programId)
        .single();

      if (error) throw error;

      if (data) {
        setSchool(data.school);
        setSport(data.sport);
        setLevel(data.level);
        setGender(data.gender);
        setSeasonYear(data.season_year);
      }
    } catch (error) {
      console.error("Error loading program:", error);
      toast.error("Failed to load program details");
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSave = async () => {
    if (!sport.trim()) {
      toast.error("Sport/Program is required");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("programs")
        .update({
          school: school.trim() || "My School",
          sport: sport.trim(),
          level,
          gender,
          season_year: seasonYear.trim() || new Date().getFullYear().toString(),
          name: `${gender} ${level} ${sport}`,
        })
        .eq("id", programId);

      if (error) throw error;

      toast.success("Program updated successfully");
      onProgramUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating program:", error);
      toast.error("Failed to update program");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("programs")
        .delete()
        .eq("id", programId);

      if (error) throw error;

      toast.success("Program deleted successfully");
      onProgramDeleted();
      onOpenChange(false);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Error deleting program:", error);
      toast.error("Failed to delete program");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card">
        <DialogHeader>
          <DialogTitle>Edit Program Details</DialogTitle>
        </DialogHeader>
        
        {initialLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="school">School</Label>
                <Input
                  id="school"
                  placeholder="e.g., Zimmerman High School"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sport">Sport / Program <span className="text-destructive">*</span></Label>
                <Input
                  id="sport"
                  placeholder="e.g., Cross Country, Basketball"
                  value={sport}
                  onChange={(e) => setSport(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="level">Level</Label>
                  <Select value={level} onValueChange={setLevel}>
                    <SelectTrigger id="level">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      <SelectItem value="Varsity">Varsity</SelectItem>
                      <SelectItem value="JV">JV</SelectItem>
                      <SelectItem value="Freshman">Freshman</SelectItem>
                      <SelectItem value="Middle School">Middle School</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger id="gender">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      <SelectItem value="Mixed">Mixed</SelectItem>
                      <SelectItem value="Boys">Boys</SelectItem>
                      <SelectItem value="Girls">Girls</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="season">Season / Year</Label>
                <Input
                  id="season"
                  placeholder="e.g., 2024-2025"
                  value={seasonYear}
                  onChange={(e) => setSeasonYear(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button 
                variant="destructive" 
                onClick={() => setShowDeleteConfirm(true)} 
                disabled={loading}
                className="sm:mr-auto"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Program
              </Button>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading} className="flex-1 sm:flex-none">
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={loading} className="flex-1 sm:flex-none">
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>

    <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
      <AlertDialogContent className="bg-card">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Program?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete this program and all associated data (athletes, attendance records, custom headers). This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? "Deleting..." : "Delete Program"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
