import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardStats from "@/components/dashboard/DashboardStats";
import RemindersPanel from "@/components/reminders/RemindersPanel";
import AthletesList from "@/components/athletes/AthletesList";
import UniformsDashboard from "@/components/uniforms/UniformsDashboard";
import LockersDashboard from "@/components/lockers/LockersDashboard";
import AttendanceTracker from "@/components/attendance/AttendanceTracker";
import AttendanceReport from "@/components/attendance/AttendanceReport";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, ShirtIcon, ClipboardCheck, Calendar, LockKeyhole } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
const Index = () => {
  const [activeTab, setActiveTab] = useState("roster");

  return <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>

        <DashboardStats 
          onSwitchToAttendance={() => setActiveTab("attendance")}
          onSwitchToLockers={() => setActiveTab("lockers")}
        />

        <RemindersPanel />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-3xl grid-cols-4">
            <TabsTrigger value="roster" className="flex items-center gap-2 touch-manipulation">
              <Users className="w-4 h-4 flex-shrink-0" />
              <span className={cn("hidden", activeTab === "roster" && "inline")}>Roster</span>
            </TabsTrigger>
            <TabsTrigger value="uniforms" className="flex items-center gap-2 touch-manipulation">
              <ShirtIcon className="w-4 h-4 flex-shrink-0" />
              <span className={cn("hidden", activeTab === "uniforms" && "inline")}>Uniforms</span>
            </TabsTrigger>
            <TabsTrigger value="lockers" className="flex items-center gap-2 touch-manipulation">
              <LockKeyhole className="w-4 h-4 flex-shrink-0" />
              <span className={cn("hidden", activeTab === "lockers" && "inline")}>Lockers</span>
            </TabsTrigger>
            <TabsTrigger value="attendance" className="flex items-center gap-2 touch-manipulation">
              <ClipboardCheck className="w-4 h-4 flex-shrink-0" />
              <span className={cn("hidden", activeTab === "attendance" && "inline")}>Attendance</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="roster" className="space-y-4 animate-fade-in">
            <AthletesList onSwitchToAttendance={() => setActiveTab("attendance")} />
          </TabsContent>
          
          <TabsContent value="uniforms" className="space-y-4 animate-fade-in">
            <UniformsDashboard />
          </TabsContent>

          <TabsContent value="lockers" className="space-y-4 animate-fade-in">
            <LockersDashboard />
          </TabsContent>
          
          <TabsContent value="attendance" className="space-y-4 animate-fade-in">
            <Tabs defaultValue="daily" className="space-y-4">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="daily" className="flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4" />
                  Daily Tracker
                </TabsTrigger>
                <TabsTrigger value="report" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Report
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="daily">
                <AttendanceTracker />
              </TabsContent>
              
              <TabsContent value="report">
                <AttendanceReport />
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>;
};
export default Index;