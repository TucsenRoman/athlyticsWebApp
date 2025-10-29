import DashboardLayout from "@/components/layout/DashboardLayout";
import RemindersPanel from "@/components/reminders/RemindersPanel";
import AthletesList from "@/components/athletes/AthletesList";
import UniformsDashboard from "@/components/uniforms/UniformsDashboard";
import AttendanceTracker from "@/components/attendance/AttendanceTracker";
import AttendanceReport from "@/components/attendance/AttendanceReport";
import RemindersList from "@/components/reminders/RemindersList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, ShirtIcon, ClipboardCheck, Calendar, Bell } from "lucide-react";
const Index = () => {
  return <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground mt-2">
            Manage your track and cross country team
          </p>
        </div>

        <RemindersPanel />

        <Tabs defaultValue="roster" className="space-y-6">
          <TabsList className="grid w-full max-w-3xl grid-cols-4">
            <TabsTrigger value="roster" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Roster
            </TabsTrigger>
            <TabsTrigger value="uniforms" className="flex items-center gap-2">
              <ShirtIcon className="w-4 h-4" />
              Uniforms
            </TabsTrigger>
            <TabsTrigger value="attendance" className="flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4" />
              Attendance
            </TabsTrigger>
            <TabsTrigger value="reminders" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Reminders
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="roster" className="space-y-4 animate-fade-in">
            <AthletesList />
          </TabsContent>
          
          <TabsContent value="uniforms" className="space-y-4 animate-fade-in">
            <UniformsDashboard />
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

          <TabsContent value="reminders" className="space-y-4 animate-fade-in">
            <RemindersList />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>;
};
export default Index;