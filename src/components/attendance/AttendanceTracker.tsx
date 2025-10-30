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
import { CalendarIcon, Filter, Edit, ChevronLeft, ChevronRight } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { z } from "zod";
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
  const [editingNotes, setEditingNotes] = useState<{
    [key: string]: string;
  }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isEditMode, setIsEditMode] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const {
    toast
  } = useToast();
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
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) return;
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const {
        data,
        error
      } = await supabase.from("attendance_submissions").select("*").eq("coach_id", user.id).eq("date", dateStr).maybeSingle();
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
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) return;
      const {
        data,
        error
      } = await supabase.from("athletes").select("id, name, grade, gender").eq("coach_id", user.id).order("name");
      if (error) throw error;
      setAthletes(data || []);
    } catch (error) {
      console.error("Error fetching athletes:", error);
      toast({
        title: "Error",
        description: "Failed to load athletes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const fetchAttendance = async () => {
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) return;
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const {
        data,
        error
      } = await supabase.from("attendance").select("*").eq("coach_id", user.id).eq("date", dateStr);
      if (error) throw error;
      setAttendance((data || []) as AttendanceRecord[]);
    } catch (error) {
      console.error("Error fetching attendance:", error);
    }
  };
  const updateAttendance = async (athleteId: string, status: "Present" | "Absent" | "Excused", notes?: string) => {
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) return;
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const existingRecord = attendance.find(a => a.athlete_id === athleteId);
      if (existingRecord) {
        const {
          error
        } = await supabase.from("attendance").update({
          status,
          notes: notes || null
        }).eq("id", existingRecord.id);
        if (error) throw error;
      } else {
        const {
          error
        } = await supabase.from("attendance").insert({
          athlete_id: athleteId,
          coach_id: user.id,
          date: dateStr,
          status,
          notes: notes || null
        });
        if (error) throw error;
      }
      await fetchAttendance();
      toast({
        title: "Success",
        description: "Attendance updated"
      });
    } catch (error) {
      console.error("Error updating attendance:", error);
      toast({
        title: "Error",
        description: "Failed to update attendance",
        variant: "destructive"
      });
    }
  };
  const attendanceNotesSchema = z.object({
    notes: z.string().max(500, "Notes must be less than 500 characters").optional().nullable().transform(val => val || null)
  });
  const saveNotes = async (athleteId: string, notes: string) => {
    // Validate notes length
    const validation = attendanceNotesSchema.safeParse({
      notes: notes || null
    });
    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: validation.error.errors[0].message,
        variant: "destructive"
      });
      return;
    }
    const record = attendance.find(a => a.athlete_id === athleteId);
    const currentStatus = record?.status || "Present";
    await updateAttendance(athleteId, currentStatus, validation.data.notes || undefined);

    // Clear the editing state for this athlete
    setEditingNotes(prev => {
      const newState = {
        ...prev
      };
      delete newState[athleteId];
      return newState;
    });
  };
  const handleNotesChange = (athleteId: string, value: string) => {
    setEditingNotes(prev => ({
      ...prev,
      [athleteId]: value
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
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) return;
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const promises = athletes.map(athlete => {
        const existingRecord = attendance.find(a => a.athlete_id === athlete.id);
        const currentNotes = editingNotes[athlete.id] || existingRecord?.notes || null;
        if (existingRecord) {
          return supabase.from("attendance").update({
            status: existingRecord.status,
            notes: currentNotes
          }).eq("id", existingRecord.id);
        } else {
          return supabase.from("attendance").insert({
            athlete_id: athlete.id,
            coach_id: user.id,
            date: dateStr,
            status: "Present",
            notes: currentNotes
          });
        }
      });
      await Promise.all(promises);

      // Mark as submitted in attendance_submissions
      await supabase.from("attendance_submissions").upsert({
        coach_id: user.id,
        date: dateStr,
        submitted_at: new Date().toISOString()
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
        description: "Attendance submitted successfully"
      });
    } catch (error) {
      console.error("Error submitting attendance:", error);
      toast({
        title: "Error",
        description: "Failed to submit attendance",
        variant: "destructive"
      });
    }
  };
  const clearAllAttendance = async () => {
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) return;
      const dateStr = format(selectedDate, "yyyy-MM-dd");

      // Delete all attendance records for this date
      const {
        error: attendanceError
      } = await supabase.from("attendance").delete().eq("coach_id", user.id).eq("date", dateStr);
      if (attendanceError) throw attendanceError;

      // Delete submission marker
      const {
        error: submissionError
      } = await supabase.from("attendance_submissions").delete().eq("coach_id", user.id).eq("date", dateStr);
      if (submissionError) throw submissionError;

      // Reset UI state
      setAttendance([]);
      setEditingNotes({});
      setIsSubmitted(false);
      setIsEditMode(true);
      setShowSuccess(false);
      toast({
        title: "Cleared",
        description: "All attendance for this date has been cleared"
      });
    } catch (error) {
      console.error("Error clearing attendance:", error);
      toast({
        title: "Error",
        description: "Failed to clear attendance",
        variant: "destructive"
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
      Excused: "secondary"
    } as const;
    return <Badge variant={variants[status]}>{status}</Badge>;
  };
  const handlePreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };
  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };
  const filteredAthletes = athletes.filter(athlete => {
    if (filterStatus.includes("all")) return true;
    const record = attendance.find(a => a.athlete_id === athlete.id);
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
  if (loading) {
    return <div className="text-center p-8">Loading...</div>;
  }
  return <Card>
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CardTitle>Attendance for</CardTitle>
              {showSuccess && <span className="text-sm font-medium text-green-600 animate-fade-in">
                  ✓ Saved!
                </span>}
            </div>
          </div>
          
          {/* Date Navigation Bar */}
          <div className="flex items-center justify-center gap-2 p-3 bg-muted rounded-lg">
            <Button variant="ghost" size="icon" onClick={handlePreviousDay} className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <span className="text-lg font-bold min-w-[120px] text-center">
              {format(selectedDate, "MM/dd/yyyy")}
            </span>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <CalendarIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-popover z-50" align="center">
                <Calendar mode="single" selected={selectedDate} onSelect={date => date && setSelectedDate(date)} initialFocus className={cn("p-3 pointer-events-auto")} />
              </PopoverContent>
            </Popover>
            
            <Button variant="ghost" size="icon" onClick={handleNextDay} className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Controls Bar: Filter and Submit/Edit buttons */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
            <Select value={filterStatus.includes("all") ? "all" : filterStatus[0] || "all"} onValueChange={value => {
              if (value === "all") {
                setFilterStatus(["all"]);
              } else {
                setFilterStatus([value]);
              }
            }} disabled={!isEditMode}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Present">Present</SelectItem>
                <SelectItem value="Absent">Absent</SelectItem>
                <SelectItem value="Excused">Excused</SelectItem>
                <SelectItem value="Noted Reason">Noted Reason</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {isSubmitted && !isEditMode ? <Button onClick={enableEditMode} variant="outline" size="sm" className="touch-manipulation flex-1 sm:flex-none">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button> : <Button onClick={submitAttendance} variant="default" size="sm" className="touch-manipulation flex-1 sm:flex-none">
                  Submit
                </Button>}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAthletes.map(athlete => {
            const record = attendance.find(a => a.athlete_id === athlete.id);
            const currentStatus = record?.status || "Present";
            const savedNotes = record?.notes || "";
            const displayNotes = editingNotes[athlete.id] !== undefined ? editingNotes[athlete.id] : savedNotes;
            return <TableRow key={athlete.id} className={cn(!isEditMode && "opacity-60")}>
                  <TableCell className="font-medium">{athlete.name}</TableCell>
                  <TableCell>{athlete.grade || "N/A"}</TableCell>
                  <TableCell>
                    <Select value={currentStatus} onValueChange={value => updateAttendance(athlete.id, value as "Present" | "Absent" | "Excused", savedNotes)} disabled={!isEditMode}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover z-50">
                        <SelectItem value="Present">Present</SelectItem>
                        <SelectItem value="Absent">Absent</SelectItem>
                        <SelectItem value="Excused">Excused</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input placeholder="Add notes..." value={displayNotes} onChange={e => handleNotesChange(athlete.id, e.target.value)} onBlur={() => handleNotesBlur(athlete.id)} onKeyDown={e => handleNotesKeyDown(athlete.id, e)} className="max-w-[300px]" disabled={!isEditMode} />
                  </TableCell>
                </TableRow>;
          })}
          </TableBody>
        </Table>

        {filteredAthletes.length === 0 && <div className="text-center p-8 text-muted-foreground">
            No athletes found
          </div>}
      </CardContent>
    </Card>;
};
export default AttendanceTracker;