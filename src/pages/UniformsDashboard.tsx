import DashboardLayout from "@/components/layout/DashboardLayout";
import UniformsDashboard from "@/components/uniforms/UniformsDashboard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const UniformsDashboardPage = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Uniforms Dashboard</h2>
            <p className="text-muted-foreground mt-2">
              Overview of uniform inventory and assignments
            </p>
          </div>
          <Button onClick={() => navigate('/uniforms')}>
            Manage Uniforms
          </Button>
        </div>

        <UniformsDashboard />
      </div>
    </DashboardLayout>
  );
};

export default UniformsDashboardPage;
