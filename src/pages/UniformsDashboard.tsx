import DashboardLayout from "@/components/layout/DashboardLayout";
import UniformsDashboard from "@/components/uniforms/UniformsDashboard";

const UniformsDashboardPage = () => {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Uniforms Dashboard</h2>
          <p className="text-muted-foreground mt-2">
            Overview of uniform inventory and assignments
          </p>
        </div>

        <UniformsDashboard />
      </div>
    </DashboardLayout>
  );
};

export default UniformsDashboardPage;
