import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddProgramModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProgramCreated: (programId: string) => void;
}

const SPORTS = [
  "Football",
  "Basketball",
  "Cross Country",
  "Track & Field",
  "Soccer",
  "Baseball",
  "Softball",
  "Volleyball",
  "Swimming",
  "Wrestling",
  "Tennis",
  "Golf",
  "Lacrosse",
  "Hockey",
  "Other",
];

const LEVELS = ["Varsity", "JV", "Freshman", "Middle School"];
const GENDERS = ["Boys", "Girls", "Mixed"];

export default function AddProgramModal({
  open,
  onOpenChange,
  onProgramCreated,
}: AddProgramModalProps) {
  const [school, setSchool] = useState("");
  const [sport, setSport] = useState("");
  const [level, setLevel] = useState("");
  const [gender, setGender] = useState("");
  const [seasonYear, setSeasonYear] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!sport) {
      toast.error("Sport/Program is required");
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in");
        return;
      }

      // Create program name
      const finalLevel = level || "Varsity";
      const finalGender = gender || "Mixed";
      const programName = `${finalGender} ${finalLevel} ${sport}`;

      const { data: newProgram, error } = await supabase
        .from("programs")
        .insert({
          coach_id: user.id,
          school: school.trim() || "My School",
          sport,
          level: finalLevel,
          gender: finalGender,
          season_year: seasonYear.trim() || new Date().getFullYear().toString(),
          name: programName,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success(`Program "${programName}" created successfully`);
      
      // Reset form
      setSchool("");
      setSport("");
      setLevel("");
      setGender("");
      setSeasonYear("");
      onOpenChange(false);
      
      // Notify parent to switch to new program
      if (newProgram) {
        onProgramCreated(newProgram.id);
      }
    } catch (error) {
      console.error("Error creating program:", error);
      toast.error("Failed to create program");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card">
        <DialogHeader>
          <DialogTitle>Create New Program</DialogTitle>
        </DialogHeader>
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
            <Label htmlFor="sport">
              Sport / Program <span className="text-destructive">*</span>
            </Label>
            <Select value={sport} onValueChange={setSport}>
              <SelectTrigger>
                <SelectValue placeholder="Select sport" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {SPORTS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="level">Level</Label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {LEVELS.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {GENDERS.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="season">Season / Year</Label>
            <Input
              id="season"
              placeholder="e.g., 2024-2025 or Fall 2024"
              value={seasonYear}
              onChange={(e) => setSeasonYear(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={loading}>
            {loading ? "Creating..." : "Create Program"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
