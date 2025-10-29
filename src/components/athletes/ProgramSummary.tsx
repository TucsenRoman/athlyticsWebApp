import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Users } from "lucide-react";
import { toast } from "sonner";

interface Program {
  id: string;
  name: string;
  sport: string;
  level: string;
  gender: string;
  season_start_date: string | null;
  season_end_date: string | null;
}

interface ProgramSummaryProps {
  programId: string | null;
  athleteCount: number;
}

export default function ProgramSummary({ programId, athleteCount }: ProgramSummaryProps) {
  const [program, setProgram] = useState<Program | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    sport: "",
    level: "",
    gender: "",
    season_start_date: "",
    season_end_date: "",
  });

  useEffect(() => {
    if (programId) {
      fetchProgram();
    }
  }, [programId]);

  const fetchProgram = async () => {
    try {
      const { data, error } = await supabase
        .from("programs")
        .select("*")
        .eq("id", programId)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setProgram(data);
        setFormData({
          name: data.name,
          sport: data.sport,
          level: data.level,
          gender: data.gender,
          season_start_date: data.season_start_date || "",
          season_end_date: data.season_end_date || "",
        });
      }
    } catch (error: any) {
      console.error("Failed to fetch program:", error);
    }
  };

  const handleUpdateProgram = async () => {
    if (!programId) return;

    try {
      const { error } = await supabase
        .from("programs")
        .update({
          name: formData.name,
          sport: formData.sport,
          level: formData.level,
          gender: formData.gender,
          season_start_date: formData.season_start_date || null,
          season_end_date: formData.season_end_date || null,
        })
        .eq("id", programId);

      if (error) throw error;

      toast.success("Program updated successfully");
      setIsEditDialogOpen(false);
      fetchProgram();
    } catch (error: any) {
      toast.error(error.message || "Failed to update program");
    }
  };

  if (!program) return null;

  return (
    <>
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-primary" />
            <div>
              <div className="text-sm font-medium">
                {athleteCount} athlete{athleteCount !== 1 ? 's' : ''} for {program.gender}'s {program.sport}
              </div>
              <div className="text-xs text-muted-foreground">
                {program.level} • {program.season_start_date && program.season_end_date
                  ? `${new Date(program.season_start_date).toLocaleDateString()} - ${new Date(program.season_end_date).toLocaleDateString()}`
                  : "Season dates not set"}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditDialogOpen(true)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Edit Roster
          </Button>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Program Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Program Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="sport">Sport</Label>
              <Select value={formData.sport} onValueChange={(value) => setFormData({ ...formData, sport: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Track & Field">Track & Field</SelectItem>
                  <SelectItem value="Cross Country">Cross Country</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="level">Level</Label>
              <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Middle School">Middle School</SelectItem>
                  <SelectItem value="High School">High School</SelectItem>
                  <SelectItem value="College">College</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Boys">Boys</SelectItem>
                  <SelectItem value="Girls">Girls</SelectItem>
                  <SelectItem value="Men">Men</SelectItem>
                  <SelectItem value="Women">Women</SelectItem>
                  <SelectItem value="Co-ed">Co-ed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="season_start">Season Start</Label>
                <Input
                  id="season_start"
                  type="date"
                  value={formData.season_start_date}
                  onChange={(e) => setFormData({ ...formData, season_start_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="season_end">Season End</Label>
                <Input
                  id="season_end"
                  type="date"
                  value={formData.season_end_date}
                  onChange={(e) => setFormData({ ...formData, season_end_date: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateProgram}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
