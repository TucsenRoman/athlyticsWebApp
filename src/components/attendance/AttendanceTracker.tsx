import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Filter, Download, Trash2, LockKeyhole, Edit } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import AssignLockerModal from "@/components/lockers/AssignLockerModal";

interface Athlete {
  id: string;
  name: string;
  grade: number | null;
  gender: string | null;
}

interface AttendanceRecord {
  id: string;
  athlete_id: string;
  date: string;
  status: "Present" | "Absent" | "Excused";
  notes: string | null;
}

const AttendanceTracker = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string[]>(["all"]);
  const [editingNotes, setEditingNotes] = useState<{ [key: string]: string }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isEditMode, setIsEditMode] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const { toast } = useToast();
  const [lockerModalOpen, setLockerModalOpen] = useState(false);
  const [selectedAthleteForLocker, setSelectedAthleteForLocker] = useState<{ athleteId: string; athleteName: string } | null>(null);

  useEffect(() => {
    fetchAthletes();
  }, []);

  useEffect(() => {
    // Reset states when date changes
    setShowSuccess(false);
    setEditingNotes({});
    
    if (athletes.length > 0) {
      fetchAttendance();
      checkSubmissionStatus();
    }
  }, [selectedDate, athletes.length]);

  const checkSubmissionStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const { data, error } = await supabase
        .from("attendance_submissions")
        .select("*")
        .eq("coach_id", user.id)
        .eq("date", dateStr)
        .maybeSingle();

      if (error) throw error;
      
      const submitted = !!data;
      setIsSubmitted(submitted);
      setIsEditMode(!submitted);
    } catch (error) {
      console.error("Error checking submission status:", error);
    }
  };

  const fetchAthletes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("athletes")
        .select("id, name, grade, gender")
        .eq("coach_id", user.id)
        .order("name");

      if (error) throw error;
      setAthletes(data || []);
    } catch (error) {
      console.error("Error fetching athletes:", error);
      toast({
        title: "Error",
        description: "Failed to load athletes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const { data, error } = await supabase
        .from("attendance")
        .select("*")
        .eq("coach_id", user.id)
        .eq("date", dateStr);

      if (error) throw error;
      setAttendance((data || []) as AttendanceRecord[]);
    } catch (error) {
      console.error("Error fetching attendance:", error);
    }
  };

  const updateAttendance = async (
    athleteId: string,
    status: "Present" | "Absent" | "Excused",
    notes?: string
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const existingRecord = attendance.find((a) => a.athlete_id === athleteId);

      if (existingRecord) {
        const { error } = await supabase
          .from("attendance")
          .update({ status, notes: notes || null })
          .eq("id", existingRecord.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("attendance")
          .insert({
            athlete_id: athleteId,
            coach_id: user.id,
            date: dateStr,
            status,
            notes: notes || null,
          });

        if (error) throw error;
      }

      await fetchAttendance();
      toast({
        title: "Success",
        description: "Attendance updated",
      });
    } catch (error) {
      console.error("Error updating attendance:", error);
      toast({
        title: "Error",
        description: "Failed to update attendance",
        variant: "destructive",
      });
    }
  };

  const saveNotes = async (athleteId: string, notes: string) => {
    const record = attendance.find((a) => a.athlete_id === athleteId);
    const currentStatus = record?.status || "Present";
    
    await updateAttendance(athleteId, currentStatus, notes);
    
    // Clear the editing state for this athlete
    setEditingNotes((prev) => {
      const newState = { ...prev };
      delete newState[athleteId];
      return newState;
    });
  };

  const handleNotesChange = (athleteId: string, value: string) => {
    setEditingNotes((prev) => ({
      ...prev,
      [athleteId]: value,
    }));
  };

  const handleNotesBlur = (athleteId: string) => {
    const notes = editingNotes[athleteId];
    if (notes !== undefined) {
      saveNotes(athleteId, notes);
    }
  };

  const handleNotesKeyDown = (athleteId: string, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const notes = editingNotes[athleteId];
      if (notes !== undefined) {
        saveNotes(athleteId, notes);
      }
    }
  };

  const submitAttendance = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const promises = athletes.map((athlete) => {
        const existingRecord = attendance.find((a) => a.athlete_id === athlete.id);
        const currentNotes = editingNotes[athlete.id] || existingRecord?.notes || null;
        
        if (existingRecord) {
          return supabase
            .from("attendance")
            .update({ 
              status: existingRecord.status,
              notes: currentNotes 
            })
            .eq("id", existingRecord.id);
        } else {
          return supabase
            .from("attendance")
            .insert({
              athlete_id: athlete.id,
              coach_id: user.id,
              date: dateStr,
              status: "Present",
              notes: currentNotes,
            });
        }
      });

      await Promise.all(promises);
      
      // Mark as submitted in attendance_submissions
      await supabase
        .from("attendance_submissions")
        .upsert({
          coach_id: user.id,
          date: dateStr,
          submitted_at: new Date().toISOString(),
        }, {
          onConflict: 'coach_id,date'
        });

      await fetchAttendance();
      setEditingNotes({});
      setIsEditMode(false);
      setIsSubmitted(true);
      setShowSuccess(true);
      
      setTimeout(() => setShowSuccess(false), 3000);
      
      toast({
        title: "Success",
        description: "Attendance submitted successfully",
      });
    } catch (error) {
      console.error("Error submitting attendance:", error);
      toast({
        title: "Error",
        description: "Failed to submit attendance",
        variant: "destructive",
      });
    }
  };

  const clearAllAttendance = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const dateStr = format(selectedDate, "yyyy-MM-dd");
      
      // Delete all attendance records for this date
      const { error: attendanceError } = await supabase
        .from("attendance")
        .delete()
        .eq("coach_id", user.id)
        .eq("date", dateStr);

      if (attendanceError) throw attendanceError;

      // Delete submission marker
      const { error: submissionError } = await supabase
        .from("attendance_submissions")
        .delete()
        .eq("coach_id", user.id)
        .eq("date", dateStr);

      if (submissionError) throw submissionError;

      // Reset UI state
      setAttendance([]);
      setEditingNotes({});
      setIsSubmitted(false);
      setIsEditMode(true);
      setShowSuccess(false);

      toast({
        title: "Cleared",
        description: "All attendance for this date has been cleared",
      });
    } catch (error) {
      console.error("Error clearing attendance:", error);
      toast({
        title: "Error",
        description: "Failed to clear attendance",
        variant: "destructive",
      });
    }
  };

  const enableEditMode = () => {
    setIsEditMode(true);
    setIsSubmitted(false);
  };


  const getStatusBadge = (status: "Present" | "Absent" | "Excused") => {
    const variants = {
      Present: "default",
      Absent: "destructive",
      Excused: "secondary",
    } as const;

    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const toggleFilter = (value: string) => {
    if (value === "all") {
      setFilterStatus(["all"]);
    } else {
      const newFilters = filterStatus.includes("all") 
        ? [value]
        : filterStatus.includes(value)
          ? filterStatus.filter(f => f !== value)
          : [...filterStatus.filter(f => f !== "all"), value];
      
      setFilterStatus(newFilters.length === 0 ? ["all"] : newFilters);
    }
  };

  const filteredAthletes = athletes.filter((athlete) => {
    if (filterStatus.includes("all")) return true;
    const record = attendance.find((a) => a.athlete_id === athlete.id);
    const status = record?.status || "Present";
    const hasNotes = !!record?.notes;
    
    return filterStatus.some(filter => {
      if (filter === "Present") return status === "Present";
      if (filter === "Absent") return status === "Absent";
      if (filter === "Excused") return status === "Excused";
      if (filter === "Noted Reason") return hasNotes;
      return false;
    });
  });

  const exportCSV = () => {
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const headers = ["Name", "Grade", "Status", "Notes"];
    const rows = athletes.map((athlete) => {
      const record = attendance.find((a) => a.athlete_id === athlete.id);
      return [
        athlete.name,
        athlete.grade || "N/A",
        record?.status || "Present",
        record?.notes || "",
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map(cell => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-${dateStr}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Attendance exported successfully",
    });
  };

  if (loading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CardTitle>Daily Tracker</CardTitle>
              {showSuccess && (
                <span className="text-sm font-medium text-green-600 animate-fade-in">
                  ✓ Saved!
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isSubmitted && !isEditMode ? (
                <Button onClick={enableEditMode} variant="outline" size="sm" className="touch-manipulation">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <Button onClick={submitAttendance} variant="default" size="sm" className="touch-manipulation">
                  Submit
                </Button>
              )}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-lg font-medium">
              {format(selectedDate, "EEEE, MMMM d, yyyy")}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    Change Date
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              <Button onClick={exportCSV} variant="outline" size="sm" className="touch-manipulation">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6 space-y-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="filter-all"
                checked={filterStatus.includes("all")}
                onCheckedChange={() => toggleFilter("all")}
                disabled={!isEditMode}
              />
              <label htmlFor="filter-all" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                All
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="filter-present"
                checked={filterStatus.includes("Present")}
                onCheckedChange={() => toggleFilter("Present")}
                disabled={!isEditMode}
              />
              <label htmlFor="filter-present" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Present
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="filter-absent"
                checked={filterStatus.includes("Absent")}
                onCheckedChange={() => toggleFilter("Absent")}
                disabled={!isEditMode}
              />
              <label htmlFor="filter-absent" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Absent
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="filter-excused"
                checked={filterStatus.includes("Excused")}
                onCheckedChange={() => toggleFilter("Excused")}
                disabled={!isEditMode}
              />
              <label htmlFor="filter-excused" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Excused
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="filter-noted"
                checked={filterStatus.includes("Noted Reason")}
                onCheckedChange={() => toggleFilter("Noted Reason")}
                disabled={!isEditMode}
              />
              <label htmlFor="filter-noted" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Noted Reason
              </label>
            </div>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAthletes.map((athlete) => {
              const record = attendance.find((a) => a.athlete_id === athlete.id);
              const currentStatus = record?.status || "Present";
              const savedNotes = record?.notes || "";
              const displayNotes = editingNotes[athlete.id] !== undefined 
                ? editingNotes[athlete.id] 
                : savedNotes;

              return (
                <TableRow 
                  key={athlete.id}
                  className={cn(!isEditMode && "opacity-60")}
                >
                  <TableCell className="font-medium">{athlete.name}</TableCell>
                  <TableCell>{athlete.grade || "N/A"}</TableCell>
                  <TableCell>
                    <Select
                      value={currentStatus}
                      onValueChange={(value) =>
                        updateAttendance(
                          athlete.id,
                          value as "Present" | "Absent" | "Excused",
                          savedNotes
                        )
                      }
                      disabled={!isEditMode}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Present">Present</SelectItem>
                        <SelectItem value="Absent">Absent</SelectItem>
                        <SelectItem value="Excused">Excused</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      placeholder="Add notes..."
                      value={displayNotes}
                      onChange={(e) => handleNotesChange(athlete.id, e.target.value)}
                      onBlur={() => handleNotesBlur(athlete.id)}
                      onKeyDown={(e) => handleNotesKeyDown(athlete.id, e)}
                      className="max-w-[300px]"
                      disabled={!isEditMode}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedAthleteForLocker({
                          athleteId: athlete.id,
                          athleteName: athlete.name,
                        });
                        setLockerModalOpen(true);
                      }}
                      title="Assign Locker"
                    >
                      <LockKeyhole className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {filteredAthletes.length === 0 && (
          <div className="text-center p-8 text-muted-foreground">
            No athletes found
          </div>
        )}
      </CardContent>

      {selectedAthleteForLocker && (
        <AssignLockerModal
          isOpen={lockerModalOpen}
          onClose={() => {
            setLockerModalOpen(false);
            setSelectedAthleteForLocker(null);
          }}
          athleteId={selectedAthleteForLocker.athleteId}
          athleteName={selectedAthleteForLocker.athleteName}
          onSuccess={() => {
            // No need to refresh attendance data
          }}
        />
      )}
    </Card>
  );
};

export default AttendanceTracker;
