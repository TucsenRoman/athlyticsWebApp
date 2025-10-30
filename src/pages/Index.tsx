import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardStats from "@/components/dashboard/DashboardStats";
import RemindersPanel from "@/components/reminders/RemindersPanel";
import AthletesList from "@/components/athletes/AthletesList";
import AttendanceTracker from "@/components/attendance/AttendanceTracker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, ClipboardCheck } from "lucide-react";
import { useState } from "react";
const Index = () => {
  const [activeTab, setActiveTab] = useState("roster");
  return <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
        </div>

        <DashboardStats onSwitchToAttendance={() => setActiveTab("attendance")} />

        

        <RemindersPanel />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="sticky top-0 z-10 grid w-full max-w-2xl grid-cols-2 bg-background shadow-sm">
            <TabsTrigger value="roster" className="flex items-center justify-center gap-2 touch-manipulation data-[state=inactive]:gap-0">
              <Users className="w-4 h-4 flex-shrink-0" />
              <span className="data-[state=inactive]:hidden">Roster</span>
            </TabsTrigger>
            <TabsTrigger value="attendance" className="flex items-center justify-center gap-2 touch-manipulation data-[state=inactive]:gap-0">
              <ClipboardCheck className="w-4 h-4 flex-shrink-0" />
              <span className="data-[state=inactive]:hidden">Attendance</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="roster" className="space-y-4 animate-fade-in">
            <AthletesList onSwitchToAttendance={() => setActiveTab("attendance")} />
          </TabsContent>
          
          <TabsContent value="attendance" className="space-y-4 animate-fade-in">
            <AttendanceTracker />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>;
};
export default Index;