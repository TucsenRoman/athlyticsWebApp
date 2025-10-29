import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import RemindersCard from "./RemindersCard";
import MessagesCard from "./MessagesCard";
import TodaysPlanCard from "./TodaysPlanCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const TIMEZONE = "America/Chicago";

interface DashboardStatsProps {
  onSwitchToAttendance?: () => void;
}

const DashboardStats = ({ onSwitchToAttendance }: DashboardStatsProps) => {
  const [attendancePercent, setAttendancePercent] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    
    // Realtime updates for attendance
    const channel = supabase
      .channel('dashboard-stats-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance' }, () => {
        fetchStats();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance_submissions' }, () => {
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
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      className="w-full"
    >
      <CarouselContent className="-ml-2 md:-ml-4">
        <CarouselItem className="pl-2 md:pl-4 basis-[85%] sm:basis-[45%] lg:basis-[30%] xl:basis-[23%]">
          <Card className="hover:shadow-md transition-shadow h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Attendance</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {attendancePercent !== null && !loading ? (
                <div className="text-2xl font-bold">{attendancePercent}%</div>
              ) : !loading ? (
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
                <div className="text-2xl font-bold">...</div>
              )}
            </CardContent>
          </Card>
        </CarouselItem>

        <CarouselItem className="pl-2 md:pl-4 basis-[85%] sm:basis-[45%] lg:basis-[30%] xl:basis-[23%]">
          <RemindersCard />
        </CarouselItem>

        <CarouselItem className="pl-2 md:pl-4 basis-[85%] sm:basis-[45%] lg:basis-[30%] xl:basis-[23%]">
          <MessagesCard />
        </CarouselItem>

        <CarouselItem className="pl-2 md:pl-4 basis-[85%] sm:basis-[45%] lg:basis-[30%] xl:basis-[23%]">
          <TodaysPlanCard />
        </CarouselItem>
      </CarouselContent>
      <CarouselPrevious className="hidden md:flex" />
      <CarouselNext className="hidden md:flex" />
    </Carousel>
  );
};

export default DashboardStats;
