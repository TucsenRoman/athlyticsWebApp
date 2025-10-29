import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ShirtIcon, Calendar } from "lucide-react";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import RemindersCard from "./RemindersCard";

const TIMEZONE = "America/Chicago";

interface DashboardStatsProps {
  onSwitchToAttendance?: () => void;
}

const DashboardStats = ({ onSwitchToAttendance }: DashboardStatsProps) => {
  const [attendancePercent, setAttendancePercent] = useState<number | null>(null);
  const [uniformsOut, setUniformsOut] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    
    // Realtime updates for attendance and uniforms
    const channel = supabase
      .channel('dashboard-stats-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance' }, () => {
        fetchStats();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance_submissions' }, () => {
        fetchStats();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'uniforms' }, () => {
        fetchStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Today's attendance - check if submitted first
      const now = toZonedTime(new Date(), TIMEZONE);
      const todayDate = format(now, "yyyy-MM-dd");

      // Check if attendance has been submitted for today
      const { data: submissionData } = await supabase
        .from("attendance_submissions")
        .select("*")
        .eq("coach_id", user.id)
        .eq("date", todayDate)
        .maybeSingle();

      if (submissionData) {
        // Attendance was submitted, calculate percentage
        const { data: todayAttendance } = await supabase
          .from("attendance")
          .select("status")
          .eq("coach_id", user.id)
          .eq("date", todayDate);

        if (todayAttendance && todayAttendance.length > 0) {
          const presentCount = todayAttendance.filter(a => a.status === "Present").length;
          const percentage = Math.round((presentCount / todayAttendance.length) * 100);
          setAttendancePercent(percentage);
        } else {
          setAttendancePercent(null);
        }
      } else {
        // Not submitted yet
        setAttendancePercent(null);
      }

      // Uniforms still out
      const { count } = await supabase
        .from("uniforms")
        .select("*", { count: "exact", head: true })
        .eq("coach_id", user.id)
        .neq("status", "Returned");

      setUniformsOut(count || 0);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: "Today's Attendance",
      value: loading ? "..." : attendancePercent !== null ? `${attendancePercent}%` : null,
      icon: Users,
      color: "text-primary",
      isAttendance: true,
    },
    {
      title: "Uniforms Still Out",
      value: loading ? "..." : uniformsOut,
      icon: ShirtIcon,
      color: "text-primary",
    },
    {
      title: "Next Meet",
      value: "Coming Soon",
      icon: Calendar,
      color: "text-muted-foreground",
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            {stat.isAttendance && stat.value === null && !loading ? (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Not submitted</div>
                <button
                  onClick={onSwitchToAttendance}
                  className="text-xs px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  Mark Attendance
                </button>
              </div>
            ) : (
              <div className="text-2xl font-bold">{stat.value}</div>
            )}
          </CardContent>
        </Card>
      ))}
      <RemindersCard />
    </div>
  );
};

export default DashboardStats;
