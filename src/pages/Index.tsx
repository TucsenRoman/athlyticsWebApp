import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardStats from "@/components/dashboard/DashboardStats";
import RemindersPanel from "@/components/reminders/RemindersPanel";
import ManagementView from "@/components/management/ManagementView";
import AttendanceTracker from "@/components/attendance/AttendanceTracker";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, Users, ClipboardCheck } from "lucide-react";
import { useState } from "react";


const Index = () => {
  const [activeTab, setActiveTab] = useState("management");
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="sticky top-0 z-10 grid w-full grid-cols-3 bg-card border-b shadow-sm rounded-none md:rounded-lg md:max-w-3xl md:bg-background md:border">
            <TabsTrigger value="overview" className="touch-manipulation min-h-[48px] data-[state=active]:bg-background md:data-[state=active]:bg-muted gap-2">
              <LayoutDashboard className="w-5 h-5 md:w-4 md:h-4 flex-shrink-0" />
              <span className="hidden md:inline transition-all">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="management" className="touch-manipulation min-h-[48px] data-[state=active]:bg-background md:data-[state=active]:bg-muted gap-2">
              <Users className="w-5 h-5 md:w-4 md:h-4 flex-shrink-0" />
              <span className="hidden md:inline transition-all">Management</span>
            </TabsTrigger>
            <TabsTrigger value="attendance" className="touch-manipulation min-h-[48px] data-[state=active]:bg-background md:data-[state=active]:bg-muted gap-2">
              <ClipboardCheck className="w-5 h-5 md:w-4 md:h-4 flex-shrink-0" />
              <span className="hidden md:inline transition-all">Attendance</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6 animate-fade-in">
            <DashboardStats onSwitchToAttendance={() => setActiveTab("attendance")} />
            <RemindersPanel />
          </TabsContent>
          
          <TabsContent value="management" className="space-y-4 animate-fade-in">
            <ManagementView />
          </TabsContent>
          
          <TabsContent value="attendance" className="space-y-4 animate-fade-in">
            <AttendanceTracker />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};
export default Index;