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
import { CalendarIcon, CheckCircle2, Filter } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchAthletes();
  }, []);

  useEffect(() => {
    if (athletes.length > 0) {
      fetchAttendance();
    }
  }, [selectedDate, athletes]);

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

  const markAllPresent = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const promises = athletes.map((athlete) => {
        const existingRecord = attendance.find((a) => a.athlete_id === athlete.id);
        
        if (existingRecord) {
          return supabase
            .from("attendance")
            .update({ status: "Present" })
            .eq("id", existingRecord.id);
        } else {
          return supabase
            .from("attendance")
            .insert({
              athlete_id: athlete.id,
              coach_id: user.id,
              date: dateStr,
              status: "Present",
            });
        }
      });

      await Promise.all(promises);
      await fetchAttendance();
      toast({
        title: "Success",
        description: "All athletes marked as present",
      });
    } catch (error) {
      console.error("Error marking all present:", error);
      toast({
        title: "Error",
        description: "Failed to mark all present",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: "Present" | "Absent" | "Excused") => {
    const variants = {
      Present: "default",
      Absent: "destructive",
      Excused: "secondary",
    } as const;

    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const filteredAthletes = athletes.filter((athlete) => {
    if (filterStatus === "all") return true;
    const record = attendance.find((a) => a.athlete_id === athlete.id);
    if (filterStatus === "Absent") {
      return record?.status === "Absent";
    }
    return false;
  });

  if (loading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Attendance Tracker</CardTitle>
          <div className="flex items-center gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, "PPP")}
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
            <Button onClick={markAllPresent} variant="default">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Mark All Present
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Athletes</SelectItem>
              <SelectItem value="Absent">Absent Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

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
            {filteredAthletes.map((athlete) => {
              const record = attendance.find((a) => a.athlete_id === athlete.id);
              const currentStatus = record?.status || "Present";
              const currentNotes = record?.notes || "";

              return (
                <TableRow key={athlete.id}>
                  <TableCell className="font-medium">{athlete.name}</TableCell>
                  <TableCell>{athlete.grade || "N/A"}</TableCell>
                  <TableCell>
                    <Select
                      value={currentStatus}
                      onValueChange={(value) =>
                        updateAttendance(
                          athlete.id,
                          value as "Present" | "Absent" | "Excused",
                          currentNotes
                        )
                      }
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
                      value={currentNotes}
                      onChange={(e) =>
                        updateAttendance(athlete.id, currentStatus, e.target.value)
                      }
                      className="max-w-[300px]"
                    />
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
    </Card>
  );
};

export default AttendanceTracker;
