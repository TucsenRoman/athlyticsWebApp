import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardStats from "@/components/dashboard/DashboardStats";
import RemindersPanel from "@/components/reminders/RemindersPanel";
import ManagementView from "@/components/management/ManagementView";
import AttendanceTracker from "@/components/attendance/AttendanceTracker";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, ClipboardList, Users } from "lucide-react";
import { useState } from "react";


const Index = () => {
  const [activeTab, setActiveTab] = useState("management");
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="sticky top-0 z-10 grid w-full grid-cols-2 h-12 bg-muted/50 border-b border-border mb-4 p-0 rounded-none">
            {/* <TabsTrigger 
              value="overview" 
              className="h-12 px-4 data-[state=active]:bg-background data-[state=active]:shadow-[0_-1px_4px_rgba(0,0,0,0.05)] data-[state=active]:rounded-t-lg data-[state=inactive]:bg-muted flex items-center justify-center gap-2 transition-all duration-200"
            >
              <LayoutDashboard className="w-5 h-5 md:w-[18px] md:h-[18px] flex-shrink-0" />
              <span className="hidden md:inline">Overview</span>
            </TabsTrigger> */}
            <TabsTrigger 
              value="management" 
              className="h-12 px-4 data-[state=active]:bg-background data-[state=active]:shadow-[0_-1px_4px_rgba(0,0,0,0.05)] data-[state=active]:rounded-t-lg data-[state=inactive]:bg-muted flex items-center justify-center gap-2 transition-all duration-200"
            >
              <ClipboardList className="w-5 h-5 md:w-[18px] md:h-[18px] flex-shrink-0" />
              <span className="hidden md:inline">Management</span>
            </TabsTrigger>
            <TabsTrigger 
              value="attendance" 
              className="h-12 px-4 data-[state=active]:bg-background data-[state=active]:shadow-[0_-1px_4px_rgba(0,0,0,0.05)] data-[state=active]:rounded-t-lg data-[state=inactive]:bg-muted flex items-center justify-center gap-2 transition-all duration-200"
            >
              <Users className="w-5 h-5 md:w-[18px] md:h-[18px] flex-shrink-0" />
              <span className="hidden md:inline">Attendance</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6 animate-fade-in mt-4">
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