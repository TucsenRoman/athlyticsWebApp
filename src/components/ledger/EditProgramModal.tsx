import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EditProgramModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  programId: string;
  onProgramUpdated: () => void;
}

export default function EditProgramModal({
  open,
  onOpenChange,
  programId,
  onProgramUpdated,
}: EditProgramModalProps) {
  const [school, setSchool] = useState("");
  const [sport, setSport] = useState("");
  const [level, setLevel] = useState("Varsity");
  const [gender, setGender] = useState("Mixed");
  const [seasonYear, setSeasonYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

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
    if (!school.trim() || !sport.trim() || !seasonYear.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("programs")
        .update({
          school: school.trim(),
          sport: sport.trim(),
          level,
          gender,
          season_year: seasonYear.trim(),
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

  return (
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
                <Label htmlFor="school">School <span className="text-destructive">*</span></Label>
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
                <Label htmlFor="season">Season / Year <span className="text-destructive">*</span></Label>
                <Input
                  id="season"
                  placeholder="e.g., 2024-2025"
                  value={seasonYear}
                  onChange={(e) => setSeasonYear(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
