import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarIcon, Download, ArrowUpDown } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useProgramContext } from "@/hooks/useProgramContext";

interface AttendanceStats {
  athlete_id: string;
  athlete_name: string;
  total_days: number;
  present: number;
  absent: number;
  excused: number;
  attendance_percentage: number;
}

type SortField = "athlete_name" | "total_days" | "present" | "absent" | "excused" | "attendance_percentage";
type SortDirection = "asc" | "desc";

const AttendanceReport = () => {
  const { selectedProgramId } = useProgramContext();
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [stats, setStats] = useState<AttendanceStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>("athlete_name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [seasonAverage, setSeasonAverage] = useState<number>(0);

  useEffect(() => {
    fetchProgramSeasonDates();
  }, [selectedProgramId]);

  useEffect(() => {
    if (startDate && endDate) {
      fetchAttendanceStats();
    }
  }, [startDate, endDate]);

  const fetchProgramSeasonDates = async () => {
    if (!selectedProgramId) return;
    
    try {
      const { data, error } = await supabase
        .from("programs")
        .select("season_start_date")
        .eq("id", selectedProgramId)
        .maybeSingle();

      if (error) throw error;
      
      if (data?.season_start_date) {
        setStartDate(new Date(data.season_start_date));
      }
    } catch (error) {
      console.error("Error fetching program dates:", error);
    }
  };

  const fetchAttendanceStats = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get all athletes
      const { data: athletes, error: athletesError } = await supabase
        .from("athletes")
        .select("id, name")
        .eq("coach_id", user.id)
        .order("name");

      if (athletesError) throw athletesError;

      // Get attendance records for date range
      const { data: attendanceRecords, error: attendanceError } = await supabase
        .from("attendance")
        .select("athlete_id, status")
        .eq("coach_id", user.id)
        .gte("date", format(startDate, "yyyy-MM-dd"))
        .lte("date", format(endDate, "yyyy-MM-dd"));

      if (attendanceError) throw attendanceError;

      // Calculate stats for each athlete
      const statsData: AttendanceStats[] = (athletes || []).map((athlete) => {
        const athleteRecords = (attendanceRecords || []).filter(
          (record) => record.athlete_id === athlete.id
        );

        const present = athleteRecords.filter((r) => r.status === "Present").length;
        const absent = athleteRecords.filter((r) => r.status === "Absent").length;
        const excused = athleteRecords.filter((r) => r.status === "Excused").length;
        const totalDays = athleteRecords.length;
        const attendancePercentage = totalDays > 0 ? (present / totalDays) * 100 : 0;

        return {
          athlete_id: athlete.id,
          athlete_name: athlete.name,
          total_days: totalDays,
          present,
          absent,
          excused,
          attendance_percentage: Math.round(attendancePercentage * 10) / 10,
        };
      });

      setStats(statsData);
      
      // Calculate season average
      const totalRate = statsData.reduce((sum, stat) => sum + stat.attendance_percentage, 0);
      const average = statsData.length > 0 ? Math.round(totalRate / statsData.length) : 0;
      setSeasonAverage(average);
    } catch (error) {
      console.error("Error fetching attendance stats:", error);
      toast.error("Failed to load attendance report");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedStats = [...stats].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    const modifier = sortDirection === "asc" ? 1 : -1;

    if (typeof aValue === "string" && typeof bValue === "string") {
      return aValue.localeCompare(bValue) * modifier;
    }
    return ((aValue as number) - (bValue as number)) * modifier;
  });

  const downloadCSV = () => {
    const headers = ["Athlete Name", "Total Days", "Present", "Absent", "Excused", "Attendance %"];
    const rows = sortedStats.map((stat) => [
      stat.athlete_name,
      stat.total_days,
      stat.present,
      stat.absent,
      stat.excused,
      stat.attendance_percentage,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-report-${startDate ? format(startDate, "yyyy-MM-dd") : "start"}-to-${format(endDate, "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success("Report downloaded successfully");
  };

  if (loading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Attendance Report</CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">From:</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[160px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(startDate, "MMM d, yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">To:</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[160px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(endDate, "MMM d, yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => date && setEndDate(date)}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <Button onClick={downloadCSV} variant="default">
              <Download className="mr-2 h-4 w-4" />
              Download CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer hover:bg-accent"
                onClick={() => handleSort("athlete_name")}
              >
                Athlete Name {sortField === "athlete_name" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-accent"
                onClick={() => handleSort("total_days")}
              >
                Total Days {sortField === "total_days" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-accent"
                onClick={() => handleSort("present")}
              >
                Present {sortField === "present" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-accent"
                onClick={() => handleSort("absent")}
              >
                Absent {sortField === "absent" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-accent"
                onClick={() => handleSort("excused")}
              >
                Excused {sortField === "excused" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-accent"
                onClick={() => handleSort("attendance_percentage")}
              >
                Attendance % {sortField === "attendance_percentage" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedStats.map((stat) => (
              <TableRow key={stat.athlete_id}>
                <TableCell className="font-medium">{stat.athlete_name}</TableCell>
                <TableCell>{stat.total_days}</TableCell>
                <TableCell>{stat.present}</TableCell>
                <TableCell>{stat.absent}</TableCell>
                <TableCell>{stat.excused}</TableCell>
                <TableCell
                  className={cn(
                    "font-semibold",
                    stat.attendance_percentage < 90 && "text-destructive"
                  )}
                >
                  {stat.attendance_percentage}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {stats.length === 0 && (
          <div className="text-center p-8 text-muted-foreground">
            No attendance data for selected date range
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AttendanceReport;
