import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useProgramContext } from "@/hooks/useProgramContext";
import { format } from "date-fns";
import { Users, CheckCircle2, XCircle, MinusCircle } from "lucide-react";

interface AttendanceRow {
  athlete_id: string;
  status: "Present" | "Absent" | "Excused";
}

export default function AttendanceCard() {
  const navigate = useNavigate();
  const { selectedProgramId } = useProgramContext();

  const [loading, setLoading] = useState(true);
  const [presentCount, setPresentCount] = useState(0);
  const [absentCount, setAbsentCount] = useState(0);
  const [excusedCount, setExcusedCount] = useState(0);
  const [totalAthletes, setTotalAthletes] = useState(0);

  const today = format(new Date(), "yyyy-MM-dd");

  // Load athletes + attendance
  useEffect(() => {
    loadAttendance();
  }, [selectedProgramId]);

  const loadAttendance = async () => {
    setLoading(true);
    try {
      if (!selectedProgramId) return;

      const { data: athletes } = await supabase
        .from("athletes")
        .select("id")
        .eq("program_id", selectedProgramId);

      if (!athletes) return;

      setTotalAthletes(athletes.length);

      const { data: attendance } = await supabase
        .from("attendance")
        .select("athlete_id, status")
        .eq("date", today);

      let present = 0;
      let absent = 0;
      let excused = 0;

      attendance?.forEach((row: AttendanceRow) => {
        if (row.status === "Present") present++;
        if (row.status === "Absent") absent++;
        if (row.status === "Excused") excused++;
      });

      setPresentCount(present);
      setAbsentCount(absent);
      setExcusedCount(excused);
    } catch (err) {
      console.error("Error loading attendance card:", err);
    } finally {
      setLoading(false);
    }
  };

  const percent = totalAthletes
    ? Math.round((presentCount / totalAthletes) * 100)
    : 0;

  // color state
  const percentColor =
    percent >= 90 ? "text-green-600"
    : percent >= 75 ? "text-yellow-500"
    : "text-red-500";

  return (
    <Card
      className="p-4 hover:bg-accent transition cursor-pointer"
      onClick={() => navigate("/attendance")}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Attendance
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : (
          <>
            {/* Percent summary */}
            <div className="text-3xl font-bold">
              <span className={percentColor}>{percent}%</span>
            </div>

            {/* Breakdown */}
            <div className="flex items-center justify-between text-sm mt-2">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                {presentCount} Present
              </div>
              <div className="flex items-center gap-1">
                <XCircle className="w-4 h-4 text-red-600" />
                {absentCount} Absent
              </div>
              <div className="flex items-center gap-1">
                <MinusCircle className="w-4 h-4 text-yellow-600" />
                {excusedCount} Excused
              </div>
            </div>

            {/* Total */}
            <p className="text-xs text-muted-foreground mt-1">
              {totalAthletes} total athletes
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
