import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Plus,
  User,
  Search,
  ChevronDown,
  Trophy,
  ShirtIcon,
  IdCard,
  TrendingUp,
  Medal,
  LockKeyhole,
  Settings2,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import AssignLockerModal from "@/components/lockers/AssignLockerModal";
import { z } from "zod";
import ProgramSummary from "./ProgramSummary";
import { useProgramContext } from "@/hooks/useProgramContext";

interface Athlete {
  id: string;
  name: string;
  grade: number;
  gender: string;
  // events: string[];
  // personal_records: any;
  // achievements: string[];
  // athlete_of_week: boolean;
  // athlete_of_meet: boolean;
  team_position: string;
}

interface UniformAssignment {
  top_id: string;
  bottom_id: string;
  created_at: string;
}

interface LockerAssignment {
  locker_number: string;
  combination: string | null;
}

interface MeetResult {
  id: string;
  meet_name: string;
  meet_date: string;
  event: string;
  mark: string;
  place: number | null;
  is_pr: boolean;
  notes: string | null;
}

interface AthleteDetails {
  uniforms: UniformAssignment[];
  locker: LockerAssignment | null;
  attendanceRate: number;
  totalAttendance: number;
  presentCount: number;
  recentResults: MeetResult[];
}

interface UniformAssignModalProps {
  athleteId: string;
  athleteName: string;
}

export default function AthletesList({ onSwitchToAttendance }: { onSwitchToAttendance?: () => void }) {
  const navigate = useNavigate();
  const { selectedProgramId } = useProgramContext();
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<"name" | "grade" | "gender" | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [athleteDetails, setAthleteDetails] = useState<Record<string, AthleteDetails>>({});
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);
  const [selectedAthleteForResults, setSelectedAthleteForResults] = useState<Athlete | null>(null);
  const [allResults, setAllResults] = useState<MeetResult[]>([]);
  const [newAthlete, setNewAthlete] = useState({
    name: "",
    grade: "9",
    gender: "Male",
    team_position: "None",
  });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAthlete, setEditingAthlete] = useState<Athlete | null>(null);
  const [isUniformModalOpen, setIsUniformModalOpen] = useState(false);
  const [selectedAthleteForUniform, setSelectedAthleteForUniform] = useState<{ id: string; name: string } | null>(null);
  const [uniformForm, setUniformForm] = useState({ top_id: "", bottom_id: "" });
  const [isLockerModalOpen, setIsLockerModalOpen] = useState(false);
  const [selectedAthleteForLockerAssign, setSelectedAthleteForLockerAssign] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Roster edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedAthletes, setEditedAthletes] = useState<Athlete[]>([]);
  const [newAthleteRows, setNewAthleteRows] = useState<
    Array<{ tempId: string; name: string; grade: string; gender: string }>
  >([]);

  useEffect(() => {
    fetchAthletes();
  }, []);

  const fetchAthletes = async () => {
    try {
      const { data, error } = await supabase.from("athletes").select("*").order("name");

      if (error) throw error;
      setAthletes(data || []);
    } catch (error: any) {
      toast.error("Failed to load athletes");
    } finally {
      setLoading(false);
    }
  };

  const fetchAthleteDetails = async (athleteId: string) => {
    if (athleteDetails[athleteId]) return;

    try {
      // Fetch uniform assignments
      const { data: uniforms } = await supabase
        .from("uniforms")
        .select("top_id, bottom_id, created_at")
        .eq("athlete_id", athleteId)
        .order("created_at", { ascending: false });

      // Fetch locker assignment
      const { data: lockerData } = await supabase
        .from("lockers")
        .select("locker_number, combination")
        .eq("athlete_id", athleteId)
        .maybeSingle();

      // Fetch attendance records
      const { data: attendance } = await supabase.from("attendance").select("status").eq("athlete_id", athleteId);

      const totalRecords = attendance?.length || 0;
      const presentRecords = attendance?.filter((a) => a.status === "Present").length || 0;
      const attendanceRate = totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0;

      // Fetch recent meet results (last 3)
      const { data: results } = await supabase
        .from("results")
        .select(
          `
          id,
          event,
          mark,
          place,
          is_pr,
          notes,
          meets!inner(name, date)
        `,
        )
        .eq("athlete_id", athleteId)
        .order("meets(date)", { ascending: false })
        .limit(3);

      const recentResults: MeetResult[] =
        results?.map((r: any) => ({
          id: r.id,
          meet_name: r.meets.name,
          meet_date: r.meets.date,
          event: r.event,
          mark: r.mark,
          place: r.place,
          is_pr: r.is_pr,
          notes: r.notes,
        })) || [];

      setAthleteDetails((prev) => ({
        ...prev,
        [athleteId]: {
          uniforms: uniforms || [],
          locker: lockerData || null,
          attendanceRate,
          totalAttendance: totalRecords,
          presentCount: presentRecords,
          recentResults,
        },
      }));
    } catch (error) {
      console.error("Failed to fetch athlete details:", error);
    }
  };

  const toggleRow = (athleteId: string) => {
    if (expandedRow === athleteId) {
      setExpandedRow(null);
    } else {
      setExpandedRow(athleteId);
      fetchAthleteDetails(athleteId);
    }
  };

  const athleteSchema = z.object({
    name: z
      .string()
      .trim()
      .min(1, "Name is required")
      .max(100, "Name must be less than 100 characters")
      .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes"),
    grade: z
      .number()
      .int("Grade must be a whole number")
      .min(6, "Grade must be at least 6")
      .max(12, "Grade must be 12 or below"),
    gender: z.enum(["Male", "Female", "Other"], {
      errorMap: () => ({ message: "Please select a valid gender" }),
    }),
    team_position: z.string().max(50, "Position must be less than 50 characters").optional(),
  });

  const handleAddAthlete = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Validate input
      const validation = athleteSchema.safeParse({
        name: newAthlete.name,
        grade: parseInt(newAthlete.grade),
        gender: newAthlete.gender,
        team_position: newAthlete.team_position,
      });

      if (!validation.success) {
        toast.error(validation.error.errors[0].message);
        return;
      }

      const { error } = await supabase.from("athletes").insert({
        coach_id: user.id,
        name: validation.data.name,
        grade: validation.data.grade,
        gender: validation.data.gender,
        team_position: validation.data.team_position,
      });

      if (error) throw error;

      toast.success("Athlete added successfully!");
      setIsAddDialogOpen(false);
      setNewAthlete({ name: "", grade: "9", gender: "Male", team_position: "None" });
      fetchAthletes();
    } catch (error: any) {
      toast.error(error.message || "Failed to add athlete");
    }
  };

  const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const handleUpdateAthlete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAthlete) return;

    try {
      // Validate input
      const validation = athleteSchema.safeParse({
        name: editingAthlete.name,
        grade: editingAthlete.grade,
        gender: editingAthlete.gender,
        team_position: editingAthlete.team_position,
      });

      if (!validation.success) {
        toast.error(validation.error.errors[0].message);
        return;
      }

      const { error } = await supabase
        .from("athletes")
        .update({
          name: validation.data.name,
          grade: validation.data.grade,
          gender: validation.data.gender,
          team_position: validation.data.team_position,
        })
        .eq("id", editingAthlete.id);

      if (error) throw error;

      toast.success("Athlete updated successfully!");
      setIsEditDialogOpen(false);
      setEditingAthlete(null);
      fetchAthletes();
      if (expandedRow === editingAthlete.id) {
        fetchAthleteDetails(editingAthlete.id);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update athlete");
    }
  };

  const openEditDialog = (athlete: Athlete) => {
    setEditingAthlete(athlete);
    setIsEditDialogOpen(true);
  };

  const openUniformModal = (athlete: Athlete) => {
    setSelectedAthleteForUniform({ id: athlete.id, name: athlete.name });
    setUniformForm({ top_id: "", bottom_id: "" });
    setIsUniformModalOpen(true);
  };

  const handleUniformAssignment = async () => {
    if (!selectedAthleteForUniform) return;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { top_id, bottom_id } = uniformForm;

      // Check if a uniform exists for this athlete
      const { data: existingUniform } = await supabase
        .from("uniforms")
        .select("*")
        .eq("athlete_id", selectedAthleteForUniform.id)
        .maybeSingle();

      if (existingUniform) {
        // Update existing uniform
        const status = top_id || bottom_id ? "Checked Out" : "Returned";
        const athlete_id = top_id || bottom_id ? selectedAthleteForUniform.id : null;

        const { error } = await supabase
          .from("uniforms")
          .update({
            top_id: top_id || existingUniform.top_id,
            bottom_id: bottom_id || existingUniform.bottom_id,
            status,
            athlete_id,
          })
          .eq("id", existingUniform.id);

        if (error) throw error;
      } else {
        // Insert new uniform
        const status = top_id || bottom_id ? "Checked Out" : "Returned";
        const athlete_id = top_id || bottom_id ? selectedAthleteForUniform.id : null;

        const { error } = await supabase.from("uniforms").insert({
          coach_id: user.id,
          top_id: top_id || "",
          bottom_id: bottom_id || "",
          status,
          athlete_id,
        });

        if (error) throw error;
      }

      toast.success("Uniform assignment updated");
      setIsUniformModalOpen(false);
      setUniformForm({ top_id: "", bottom_id: "" });

      // Refresh this athlete's details
      if (expandedRow === selectedAthleteForUniform.id) {
        delete athleteDetails[selectedAthleteForUniform.id];
        await fetchAthleteDetails(selectedAthleteForUniform.id);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to assign uniform");
    }
  };

  const handleUnassignLocker = async (athleteId: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Find the locker for this athlete
      const { data: locker } = await supabase.from("lockers").select("id").eq("athlete_id", athleteId).maybeSingle();

      if (!locker) {
        toast.error("No locker found for this athlete");
        return;
      }

      const { error } = await supabase
        .from("lockers")
        .update({
          athlete_id: null,
          status: "Available",
        })
        .eq("id", locker.id)
        .eq("coach_id", user.id);

      if (error) throw error;

      toast.success("Locker unassigned successfully");

      // Refresh this athlete's details
      if (expandedRow === athleteId) {
        delete athleteDetails[athleteId];
        await fetchAthleteDetails(athleteId);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to unassign locker");
    }
  };

  const openResultsModal = async (athlete: Athlete) => {
    setSelectedAthleteForResults(athlete);
    setIsResultsModalOpen(true);

    try {
      const { data: results } = await supabase
        .from("results")
        .select(
          `
          id,
          event,
          mark,
          place,
          is_pr,
          notes,
          meets!inner(name, date)
        `,
        )
        .eq("athlete_id", athlete.id)
        .order("meets(date)", { ascending: false });

      const allMeetResults: MeetResult[] =
        results?.map((r: any) => ({
          id: r.id,
          meet_name: r.meets.name,
          meet_date: r.meets.date,
          event: r.event,
          mark: r.mark,
          place: r.place,
          is_pr: r.is_pr,
          notes: r.notes,
        })) || [];

      setAllResults(allMeetResults);
    } catch (error) {
      console.error("Failed to fetch all results:", error);
      toast.error("Failed to load results");
    }
  };

  const handleSort = (field: "name" | "grade" | "gender") => {
    if (isEditMode) return; // Prevent sorting in edit mode
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleToggleEditMode = () => {
    if (isEditMode) {
      // Exiting edit mode - reset
      setIsEditMode(false);
      setEditedAthletes([]);
      setNewAthleteRows([]);
    } else {
      // Entering edit mode
      setIsEditMode(true);
      setEditedAthletes(JSON.parse(JSON.stringify(athletes))); // Deep copy
      setExpandedRow(null); // Collapse all rows
    }
  };

  const handleEditAthlete = (id: string, field: keyof Athlete, value: any) => {
    setEditedAthletes((prev) => prev.map((athlete) => (athlete.id === id ? { ...athlete, [field]: value } : athlete)));
  };

  const handleDeleteAthlete = (id: string) => {
    setEditedAthletes((prev) => prev.filter((athlete) => athlete.id !== id));
  };

  const handleAddNewRow = () => {
    const tempId = `temp-${Date.now()}`;
    setNewAthleteRows((prev) => [...prev, { tempId, name: "", grade: "9", gender: "Male" }]);
  };

  const handleEditNewRow = (tempId: string, field: string, value: string) => {
    setNewAthleteRows((prev) => prev.map((row) => (row.tempId === tempId ? { ...row, [field]: value } : row)));
  };

  const handleDeleteNewRow = (tempId: string) => {
    setNewAthleteRows((prev) => prev.filter((row) => row.tempId !== tempId));
  };

  const handleSaveChanges = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Validate all edited athletes
      for (const athlete of editedAthletes) {
        const validation = athleteSchema.safeParse({
          name: athlete.name,
          grade: athlete.grade,
          gender: athlete.gender,
          team_position: athlete.team_position,
        });
        if (!validation.success) {
          toast.error(`Invalid data for ${athlete.name}: ${validation.error.errors[0].message}`);
          return;
        }
      }

      // Validate new athlete rows
      for (const newRow of newAthleteRows) {
        if (!newRow.name.trim()) {
          toast.error("All new athletes must have a name");
          return;
        }
        const validation = athleteSchema.safeParse({
          name: newRow.name,
          grade: parseInt(newRow.grade),
          gender: newRow.gender,
          team_position: "None",
        });
        if (!validation.success) {
          toast.error(`Invalid data for new athlete: ${validation.error.errors[0].message}`);
          return;
        }
      }

      // Delete removed athletes
      const removedAthletes = athletes.filter(
        (original) => !editedAthletes.find((edited) => edited.id === original.id),
      );
      for (const athlete of removedAthletes) {
        const { error } = await supabase.from("athletes").delete().eq("id", athlete.id);
        if (error) throw error;
      }

      // Update existing athletes
      for (const athlete of editedAthletes) {
        const original = athletes.find((a) => a.id === athlete.id);
        if (original && JSON.stringify(original) !== JSON.stringify(athlete)) {
          const { error } = await supabase
            .from("athletes")
            .update({
              name: athlete.name,
              grade: athlete.grade,
              gender: athlete.gender,
              team_position: athlete.team_position,
            })
            .eq("id", athlete.id);
          if (error) throw error;
        }
      }

      // Insert new athletes
      for (const newRow of newAthleteRows) {
        const { error } = await supabase.from("athletes").insert({
          coach_id: user.id,
          name: newRow.name,
          grade: parseInt(newRow.grade),
          gender: newRow.gender,
          team_position: "None",
        });
        if (error) throw error;
      }

      toast.success("Roster updated successfully!");
      setIsEditMode(false);
      setEditedAthletes([]);
      setNewAthleteRows([]);
      fetchAthletes();
    } catch (error: any) {
      toast.error(error.message || "Failed to save changes");
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditedAthletes([]);
    setNewAthleteRows([]);
  };

  const filteredAthletes = athletes
    .filter((athlete) => athlete.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (!sortField) return 0;

      const direction = sortDirection === "asc" ? 1 : -1;

      if (sortField === "name") {
        return direction * a.name.localeCompare(b.name);
      } else if (sortField === "grade") {
        return direction * (a.grade - b.grade);
      } else if (sortField === "gender") {
        return direction * a.gender.localeCompare(b.gender);
      }
      return 0;
    });

  if (loading) {
    return <div className="text-center py-8">Loading athletes...</div>;
  }

  return (
    <div className="space-y-6">
      <ProgramSummary programId={selectedProgramId} athleteCount={athletes.length} />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search athletes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-8"
            disabled={isEditMode}
          />
          {searchQuery && !isEditMode && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery("")}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/uniforms")}
            className="flex-1 sm:flex-none"
            disabled={isEditMode}
          >
            <ShirtIcon className="w-4 h-4 mr-2" />
            Manage Uniforms
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info("Manage Lockers feature coming soon")}
            className="flex-1 sm:flex-none"
            disabled={isEditMode}
          >
            <LockKeyhole className="w-4 h-4 mr-2" />
            Manage Lockers
          </Button>
          <Button
            variant={isEditMode ? "default" : "destructive"}
            size="sm"
            onClick={handleToggleEditMode}
            className="flex-1 sm:flex-none"
          >
            <Settings2 className="w-4 h-4 mr-2" />
            {isEditMode ? "Exit Edit Mode" : "Manage Roster"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Athletes Roster
          </CardTitle>
          <CardDescription>
            {filteredAthletes.length} athlete{filteredAthletes.length !== 1 ? "s" : ""} in your program
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {!isEditMode && <TableHead className="w-12"></TableHead>}
                  <TableHead
                    className={!isEditMode ? "cursor-pointer hover:bg-muted/50" : ""}
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center gap-2">
                      Name
                      {sortField === "name" && !isEditMode && (
                        <span className="text-xs">{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className={!isEditMode ? "cursor-pointer hover:bg-muted/50" : ""}
                    onClick={() => handleSort("grade")}
                  >
                    <div className="flex items-center gap-2">
                      Grade
                      {sortField === "grade" && !isEditMode && (
                        <span className="text-xs">{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className={!isEditMode ? "cursor-pointer hover:bg-muted/50" : ""}
                    onClick={() => handleSort("gender")}
                  >
                    <div className="flex items-center gap-2">
                      Gender
                      {sortField === "gender" && !isEditMode && (
                        <span className="text-xs">{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </TableHead>
                  {isEditMode && <TableHead className="w-24 text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {!isEditMode && filteredAthletes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No athletes found. Add your first athlete to get started!
                    </TableCell>
                  </TableRow>
                ) : isEditMode ? (
                  <>
                    {editedAthletes.map((athlete) => (
                      <TableRow key={athlete.id} className="hover:bg-muted/50">
                        <TableCell>
                          <Input
                            value={athlete.name}
                            onChange={(e) => handleEditAthlete(athlete.id, "name", e.target.value)}
                            className="border-primary/50"
                            placeholder="Name"
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={athlete.grade.toString()}
                            onValueChange={(value) => handleEditAthlete(athlete.id, "grade", parseInt(value))}
                          >
                            <SelectTrigger className="border-primary/50">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="9">9</SelectItem>
                              <SelectItem value="10">10</SelectItem>
                              <SelectItem value="11">11</SelectItem>
                              <SelectItem value="12">12</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={athlete.gender}
                            onValueChange={(value) => handleEditAthlete(athlete.id, "gender", value)}
                          >
                            <SelectTrigger className="border-primary/50">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Male">Male</SelectItem>
                              <SelectItem value="Female">Female</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleDeleteAthlete(athlete.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {newAthleteRows.map((row) => (
                      <TableRow key={row.tempId} className="hover:bg-muted/50 bg-muted/20">
                        <TableCell>
                          <Input
                            value={row.name}
                            onChange={(e) => handleEditNewRow(row.tempId, "name", e.target.value)}
                            className="border-primary/50"
                            placeholder="New athlete name"
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={row.grade}
                            onValueChange={(value) => handleEditNewRow(row.tempId, "grade", value)}
                          >
                            <SelectTrigger className="border-primary/50">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="9">9</SelectItem>
                              <SelectItem value="10">10</SelectItem>
                              <SelectItem value="11">11</SelectItem>
                              <SelectItem value="12">12</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={row.gender}
                            onValueChange={(value) => handleEditNewRow(row.tempId, "gender", value)}
                          >
                            <SelectTrigger className="border-primary/50">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Male">Male</SelectItem>
                              <SelectItem value="Female">Female</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDeleteNewRow(row.tempId)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                ) : (
                  filteredAthletes.map((athlete) => (
                    <Collapsible
                      key={athlete.id}
                      open={expandedRow === athlete.id}
                      onOpenChange={() => toggleRow(athlete.id)}
                      asChild
                    >
                      <>
                        <TableRow className="cursor-pointer hover:bg-muted/50" onClick={() => toggleRow(athlete.id)}>
                          <TableCell>
                            <ChevronDown
                              className={`w-4 h-4 transition-transform duration-200 ${expandedRow === athlete.id ? "rotate-180" : ""}`}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{athlete.name}</TableCell>
                          <TableCell>{athlete.grade}th</TableCell>
                          <TableCell>{athlete.gender}</TableCell>
                        </TableRow>
                        <CollapsibleContent asChild>
                          <TableRow>
                            <TableCell colSpan={4} className="bg-muted/30 p-0 border-b">
                              <div className="p-4 md:p-6 space-y-4 transition-all duration-200 ease-out">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                  {/* Events & PRs */}
                                  <Card className="shadow-sm">
                                    <CardHeader className="pb-3">
                                      <div className="flex items-center justify-between">
                                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                                          <Trophy className="w-4 h-4 text-primary" />
                                          Events & Personal Records
                                        </CardTitle>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-7 text-xs"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            toast.info("PR management coming soon");
                                          }}
                                        >
                                          Add PR
                                        </Button>
                                      </div>
                                    </CardHeader>
                                  </Card>

                                  {/* Uniforms */}
                                  <Card className="shadow-sm">
                                    <CardHeader className="pb-3">
                                      <div className="flex items-center justify-between">
                                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                                          <ShirtIcon className="w-4 h-4 text-primary" />
                                          Uniform Assignments
                                        </CardTitle>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-7 text-xs"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            openUniformModal(athlete);
                                          }}
                                        >
                                          Assign Uniform
                                        </Button>
                                      </div>
                                    </CardHeader>
                                    <CardContent>
                                      {athleteDetails[athlete.id]?.uniforms &&
                                      athleteDetails[athlete.id].uniforms.length > 0 ? (
                                        <div className="space-y-3">
                                          {athleteDetails[athlete.id].uniforms.map((uniform, i) => (
                                            <div key={i} className="p-3 bg-background rounded-md border">
                                              {i === 0 && athleteDetails[athlete.id].uniforms.length > 1 && (
                                                <Badge variant="default" className="text-xs mb-2">
                                                  Current
                                                </Badge>
                                              )}
                                              <div className="grid grid-cols-2 gap-2">
                                                <div className="space-y-1">
                                                  <span className="text-xs text-muted-foreground">Top ID</span>
                                                  <div className="font-medium text-sm">{uniform.top_id}</div>
                                                </div>
                                                <div className="space-y-1">
                                                  <span className="text-xs text-muted-foreground">Bottom ID</span>
                                                  <div className="font-medium text-sm">{uniform.bottom_id}</div>
                                                </div>
                                              </div>
                                              <div className="text-xs text-muted-foreground mt-2">
                                                Assigned: {new Date(uniform.created_at).toLocaleDateString()}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <p className="text-sm text-muted-foreground py-2">No uniform assigned</p>
                                      )}
                                    </CardContent>
                                  </Card>

                                  {/* Team Position */}
                                  <Card className="shadow-sm">
                                    <CardHeader className="pb-3">
                                      <div className="flex items-center justify-between">
                                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                                          <IdCard className="w-4 h-4 text-primary" />
                                          Team Position
                                        </CardTitle>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-7 text-xs"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            openEditDialog(athlete);
                                          }}
                                        >
                                          Change
                                        </Button>
                                      </div>
                                    </CardHeader>
                                    <CardContent>
                                      <Badge
                                        variant={athlete.team_position !== "None" ? "default" : "secondary"}
                                        className="w-fit"
                                      >
                                        {athlete.team_position || "None"}
                                      </Badge>
                                    </CardContent>
                                  </Card>

                                  {/* Locker */}
                                  <Card className="shadow-sm">
                                    <CardHeader className="pb-3">
                                      <div className="flex items-center justify-between">
                                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                                          <LockKeyhole className="w-4 h-4 text-primary" />
                                          Locker
                                        </CardTitle>
                                        {athleteDetails[athlete.id]?.locker ? (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 text-xs"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleUnassignLocker(athlete.id);
                                            }}
                                          >
                                            Unassign
                                          </Button>
                                        ) : (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 text-xs"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setSelectedAthleteForLockerAssign({ id: athlete.id, name: athlete.name });
                                              setIsLockerModalOpen(true);
                                            }}
                                          >
                                            Assign
                                          </Button>
                                        )}
                                      </div>
                                    </CardHeader>
                                    <CardContent>
                                      {athleteDetails[athlete.id]?.locker ? (
                                        <div className="space-y-2">
                                          <div className="p-3 bg-background rounded-md border">
                                            <div className="flex justify-between items-start">
                                              <div>
                                                <div className="text-sm font-medium">
                                                  Locker #{athleteDetails[athlete.id].locker.locker_number}
                                                </div>
                                                {athleteDetails[athlete.id].locker.combination && (
                                                  <div className="text-xs text-muted-foreground mt-1">
                                                    Combo: {athleteDetails[athlete.id].locker.combination}
                                                  </div>
                                                )}
                                              </div>
                                              <Badge variant="default" className="text-xs">
                                                Assigned
                                              </Badge>
                                            </div>
                                          </div>
                                        </div>
                                      ) : (
                                        <p className="text-sm text-muted-foreground py-2">No locker assigned</p>
                                      )}
                                    </CardContent>
                                  </Card>

                                  {/* Attendance */}
                                  <Card className="shadow-sm">
                                    <CardHeader className="pb-3">
                                      <div className="flex items-center justify-between">
                                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                                          <TrendingUp className="w-4 h-4 text-primary" />
                                          Attendance Rate
                                        </CardTitle>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-7 text-xs"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            onSwitchToAttendance?.();
                                          }}
                                        >
                                          Open Attendance
                                        </Button>
                                      </div>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-semibold">
                                          {athleteDetails[athlete.id]?.attendanceRate ?? 0}%
                                        </span>
                                        {athleteDetails[athlete.id] && (
                                          <span className="text-sm text-muted-foreground">
                                            ({athleteDetails[athlete.id].presentCount}/
                                            {athleteDetails[athlete.id].totalAttendance})
                                          </span>
                                        )}
                                      </div>
                                    </CardContent>
                                  </Card>

                                  {/* Recent Meet Results */}
                                  <Card className="shadow-sm lg:col-span-2">
                                    <CardHeader className="pb-3">
                                      <div className="flex items-center justify-between">
                                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                                          <Medal className="w-4 h-4 text-primary" />
                                          Recent Meet Results
                                        </CardTitle>
                                        <div className="flex gap-2">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 text-xs"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              toast.info("Result management coming soon");
                                            }}
                                          >
                                            Add Result
                                          </Button>
                                          {athleteDetails[athlete.id]?.recentResults &&
                                            athleteDetails[athlete.id].recentResults.length > 0 && (
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  openResultsModal(athlete);
                                                }}
                                                className="h-7 text-xs"
                                              >
                                                View all
                                              </Button>
                                            )}
                                        </div>
                                      </div>
                                    </CardHeader>
                                    <CardContent>
                                      {athleteDetails[athlete.id]?.recentResults &&
                                      athleteDetails[athlete.id].recentResults.length > 0 ? (
                                        <div className="space-y-3">
                                          {athleteDetails[athlete.id].recentResults.map((result) => (
                                            <div key={result.id} className="p-3 bg-background rounded-md border">
                                              <div className="flex items-start justify-between gap-2 mb-2">
                                                <div>
                                                  <div className="font-medium text-sm flex items-center gap-2">
                                                    {result.meet_name}
                                                    {result.is_pr && (
                                                      <Badge variant="default" className="text-xs">
                                                        PR
                                                      </Badge>
                                                    )}
                                                  </div>
                                                  <div className="text-xs text-muted-foreground">
                                                    {new Date(result.meet_date).toLocaleDateString()}
                                                  </div>
                                                </div>
                                                {result.place && result.place <= 3 && (
                                                  <Medal className="w-5 h-5 text-amber-500" />
                                                )}
                                              </div>
                                              <div className="grid grid-cols-3 gap-2 text-sm">
                                                <div>
                                                  <span className="text-xs text-muted-foreground">Event</span>
                                                  <div className="font-medium">{result.event}</div>
                                                </div>
                                                <div>
                                                  <span className="text-xs text-muted-foreground">Mark</span>
                                                  <div className="font-medium">{result.mark}</div>
                                                </div>
                                                <div>
                                                  <span className="text-xs text-muted-foreground">Place</span>
                                                  <div className="font-medium">
                                                    {result.place ? getOrdinal(result.place) : "N/A"}
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <p className="text-sm text-muted-foreground py-2">No meet results recorded</p>
                                      )}
                                    </CardContent>
                                  </Card>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        </CollapsibleContent>
                      </>
                    </Collapsible>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {isEditMode && (
            <div className="mt-4 space-y-3">
              <Button variant="outline" onClick={handleAddNewRow} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Add Athlete
              </Button>
              <div className="flex flex-col sm:flex-row gap-2 justify-end">
                <Button variant="outline" onClick={handleCancelEdit} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button onClick={handleSaveChanges} className="w-full sm:w-auto">
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Athlete Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Athlete</DialogTitle>
            <DialogDescription>Update athlete information</DialogDescription>
          </DialogHeader>
          {editingAthlete && (
            <form onSubmit={handleUpdateAthlete} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editingAthlete.name}
                  onChange={(e) => setEditingAthlete({ ...editingAthlete, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-grade">Grade</Label>
                <Select
                  value={editingAthlete.grade.toString()}
                  onValueChange={(value) => setEditingAthlete({ ...editingAthlete, grade: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="9">9th Grade</SelectItem>
                    <SelectItem value="10">10th Grade</SelectItem>
                    <SelectItem value="11">11th Grade</SelectItem>
                    <SelectItem value="12">12th Grade</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-gender">Gender</Label>
                <Select
                  value={editingAthlete.gender}
                  onValueChange={(value) => setEditingAthlete({ ...editingAthlete, gender: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-team-position">Team Position</Label>
                <Select
                  value={editingAthlete.team_position}
                  onValueChange={(value) => setEditingAthlete({ ...editingAthlete, team_position: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="None">None</SelectItem>
                    <SelectItem value="Captain">Captain</SelectItem>
                    <SelectItem value="Co-Captain">Co-Captain</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">
                Update Athlete
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Results Modal */}
      <Dialog open={isResultsModalOpen} onOpenChange={setIsResultsModalOpen}>
        ...
      </Dialog>

      {/* Uniform Assignment Modal */}
      <Dialog open={isUniformModalOpen} onOpenChange={setIsUniformModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Uniform</DialogTitle>
            <DialogDescription>Assign uniform to {selectedAthleteForUniform?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="top_id">Top ID</Label>
              <Input
                id="top_id"
                value={uniformForm.top_id}
                onChange={(e) => setUniformForm({ ...uniformForm, top_id: e.target.value })}
                placeholder="e.g., T-001"
              />
            </div>
            <div>
              <Label htmlFor="bottom_id">Bottom ID</Label>
              <Input
                id="bottom_id"
                value={uniformForm.bottom_id}
                onChange={(e) => setUniformForm({ ...uniformForm, bottom_id: e.target.value })}
                placeholder="e.g., B-001"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsUniformModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUniformAssignment}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Locker Assignment Modal */}
      {selectedAthleteForLockerAssign && (
        <AssignLockerModal
          isOpen={isLockerModalOpen}
          onClose={() => {
            setIsLockerModalOpen(false);
            setSelectedAthleteForLockerAssign(null);
          }}
          athleteId={selectedAthleteForLockerAssign.id}
          athleteName={selectedAthleteForLockerAssign.name}
          onSuccess={() => {
            if (expandedRow === selectedAthleteForLockerAssign.id) {
              delete athleteDetails[selectedAthleteForLockerAssign.id];
              fetchAthleteDetails(selectedAthleteForLockerAssign.id);
            }
          }}
        />
      )}
    </div>
  );
}
