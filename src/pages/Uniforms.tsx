import DashboardLayout from "@/components/layout/DashboardLayout";
import UniformsList from "@/components/uniforms/UniformsList";

const Uniforms = () => {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Uniforms Management</h2>
          <p className="text-muted-foreground mt-2">
            Track and manage uniform assignments for your team
          </p>
        </div>

        <UniformsList />
      </div>
    </DashboardLayout>
  );
};

export default Uniforms;
