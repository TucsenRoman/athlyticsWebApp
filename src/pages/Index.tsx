import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardStats from "@/components/dashboard/DashboardStats";
import RemindersPanel from "@/components/reminders/RemindersPanel";
import ManagementView from "@/components/management/ManagementView";
import AttendanceTracker from "@/components/attendance/AttendanceTracker";
import ContextSelector from "@/components/ledger/ContextSelector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, Users, ClipboardCheck } from "lucide-react";
import { useState } from "react";
import { useLedger } from "@/contexts/LedgerContext";

const Index = () => {
  const [activeTab, setActiveTab] = useState("management");
  const { currentContext, setCurrentContext } = useLedger();
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <ContextSelector 
            currentContext={currentContext}
            onContextChange={setCurrentContext}
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="sticky top-0 z-10 grid w-full max-w-3xl grid-cols-3 bg-background shadow-sm">
            <TabsTrigger value="overview" className="touch-manipulation">
              <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
              <span className="transition-all">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="management" className="touch-manipulation">
              <Users className="w-4 h-4 flex-shrink-0" />
              <span className="transition-all">Management</span>
            </TabsTrigger>
            <TabsTrigger value="attendance" className="touch-manipulation">
              <ClipboardCheck className="w-4 h-4 flex-shrink-0" />
              <span className="transition-all">Attendance</span>
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