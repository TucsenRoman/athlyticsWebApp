import DashboardLayout from "@/components/layout/DashboardLayout";
import AttendanceTracker from "@/components/attendance/AttendanceTracker";

const Index = () => {
  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center w-full">
        <AttendanceTracker />
      </div>
    </DashboardLayout>
  );
};

export default Index;
