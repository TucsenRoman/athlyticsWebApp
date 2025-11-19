// components/cards/AttendanceCard.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useProgramContext } from "@/hooks/useProgramContext";
import { format } from "date-fns";

import CardFormatter from "@/components/cards/CardFormatter";

import {
  Users,
  CheckCircle2,
  XCircle,
  MinusCircle,
} from "lucide-react";

export default function AttendanceCard() {
  const navigate = useNavigate();
  const { selectedProgramId } = useProgramContext();

  const [loading, setLoading] = useState(true);
  const [presentCount, setPresentCount] = useState(0);
  const [absentCount, setAbsentCount] = useState(0);
  const [excusedCount, setExcusedCount] = useState(0);
  const [totalAthletes, setTotalAthletes] = useState(0);

  const today = format(new Date(), "yyyy-MM-dd");

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

      let present = 0, absent = 0, excused = 0;

      attendance?.forEach((row) => {
        if (row.status === "Present") present++;
        if (row.status === "Absent") absent++;
        if (row.status === "Excused") excused++;
      });

      setPresentCount(present);
      setAbsentCount(absent);
      setExcusedCount(excused);
    } finally {
      setLoading(false);
    }
  };

  const percent = totalAthletes
    ? Math.round((presentCount / totalAthletes) * 100)
    : 0;

  const percentColor =
    percent >= 90
      ? "text-green-600"
      : percent >= 75
      ? "text-yellow-500"
      : "text-red-500";

  return (
    <CardFormatter
      title="Attendance"
      icon={Users}
      onClick={() => navigate("/attendance")}
    >
      {loading ? (
        <p className="text-sm text-neutral-500">Loading...</p>
      ) : (
        <>
          <div className="text-3xl font-bold">
            <span className={percentColor}>{percent}%</span>
          </div>

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

          <p className="text-xs text-neutral-500">
            {totalAthletes} total athletes
          </p>
        </>
      )}
    </CardFormatter>
  );
}
