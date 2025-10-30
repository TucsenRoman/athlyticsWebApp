import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardStats from "@/components/dashboard/DashboardStats";
import RemindersPanel from "@/components/reminders/RemindersPanel";
import AttendanceTracker from "@/components/attendance/AttendanceTracker";
const Index = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
        </div>

        <DashboardStats onSwitchToAttendance={() => {}} />

        <RemindersPanel />

        <div className="space-y-4">
          <h3 className="text-2xl font-semibold">Attendance</h3>
          <AttendanceTracker />
        </div>
      </div>
    </DashboardLayout>
  );
};
export default Index;
