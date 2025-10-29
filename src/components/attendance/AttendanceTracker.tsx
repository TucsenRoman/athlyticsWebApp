import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarIcon, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Athlete {
  id: string;
  name: string;
}

interface AttendanceRecord {
  id?: string;
  athlete_id: string;
  status: "Present" | "Absent" | "Excused";
  notes: string;
}

export default function AttendanceTracker() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceRecord>>({});
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchAthletes();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

  const fetchAthletes = async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;

    const { data, error } = await supabase
      .from("athletes")
      .select("id, name")
      .eq("coach_id", user.user.id)
      .order("name");

    if (error) {
      toast({
        title: "Error loading athletes",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setAthletes(data || []);
  };

  const fetchAttendance = async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;

    const dateStr = format(selectedDate, "yyyy-MM-dd");
    
    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .eq("coach_id", user.user.id)
      .eq("date", dateStr);

    if (error) {
      toast({
        title: "Error loading attendance",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    const attendanceMap: Record<string, AttendanceRecord> = {};
    data?.forEach((record) => {
      attendanceMap[record.athlete_id] = {
        id: record.id,
        athlete_id: record.athlete_id,
        status: record.status as "Present" | "Absent" | "Excused",
        notes: record.notes || "",
      };
    });

    setAttendance(attendanceMap);
  };

  const updateAttendance = async (athleteId: string, field: "status" | "notes", value: string) => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;

    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const currentRecord = attendance[athleteId];

    const recordData = {
      athlete_id: athleteId,
      coach_id: user.user.id,
      date: dateStr,
      status: (field === "status" ? value : currentRecord?.status || "Present") as "Present" | "Absent" | "Excused",
      notes: field === "notes" ? value : currentRecord?.notes || "",
    };

    if (currentRecord?.id) {
      const { error } = await supabase
        .from("attendance")
        .update({ [field]: value })
        .eq("id", currentRecord.id);

      if (error) {
        toast({
          title: "Error updating attendance",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
    } else {
      const { data, error } = await supabase
        .from("attendance")
        .insert([recordData])
        .select()
        .single();

      if (error) {
        toast({
          title: "Error creating attendance",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setAttendance((prev) => ({
        ...prev,
        [athleteId]: {
          id: data.id,
          athlete_id: athleteId,
          status: recordData.status,
          notes: recordData.notes,
        },
      }));
      return;
    }

    setAttendance((prev) => ({
      ...prev,
      [athleteId]: {
        ...currentRecord,
        athlete_id: athleteId,
        status: field === "status" ? (value as "Present" | "Absent" | "Excused") : currentRecord.status,
        notes: field === "notes" ? value : currentRecord.notes,
      },
    }));
  };

  const markAllPresent = async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;

    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const records = athletes.map((athlete) => ({
      athlete_id: athlete.id,
      coach_id: user.user.id,
      date: dateStr,
      status: "Present",
      notes: "",
    }));

    const { error } = await supabase
      .from("attendance")
      .upsert(records, { onConflict: "athlete_id,date" });

    if (error) {
      toast({
        title: "Error marking all present",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "All athletes marked as present",
    });

    fetchAttendance();
  };

  const filteredAthletes = athletes.filter((athlete) => {
    if (filterStatus === "all") return true;
    const record = attendance[athlete.id];
    if (!record) return filterStatus === "unmarked";
    return record.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("w-[240px] justify-start text-left font-normal")}>
              <CalendarIcon />
              {format(selectedDate, "PPP")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>

        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Athletes</SelectItem>
              <SelectItem value="Present">Present</SelectItem>
              <SelectItem value="Absent">Absent</SelectItem>
              <SelectItem value="Excused">Excused</SelectItem>
              <SelectItem value="unmarked">Unmarked</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={markAllPresent} variant="default">
            <Check className="mr-2 h-4 w-4" />
            Mark All Present
          </Button>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Athlete Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAthletes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  No athletes found
                </TableCell>
              </TableRow>
            ) : (
              filteredAthletes.map((athlete) => {
                const record = attendance[athlete.id];
                return (
                  <TableRow key={athlete.id}>
                    <TableCell className="font-medium">{athlete.name}</TableCell>
                    <TableCell>
                      <Select
                        value={record?.status || ""}
                        onValueChange={(value) => updateAttendance(athlete.id, "status", value)}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Select status" />
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
                        value={record?.notes || ""}
                        onChange={(e) => updateAttendance(athlete.id, "notes", e.target.value)}
                        placeholder="Add notes..."
                        className="max-w-md"
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
