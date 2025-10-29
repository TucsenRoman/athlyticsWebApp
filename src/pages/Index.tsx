import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardStats from "@/components/dashboard/DashboardStats";
import AthletesList from "@/components/athletes/AthletesList";
import UniformsDashboard from "@/components/uniforms/UniformsDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, ShirtIcon } from "lucide-react";
const Index = () => {
  return <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground mt-2">
            Manage your track and cross country team
          </p>
        </div>

        <DashboardStats />

        <Tabs defaultValue="roster" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="roster" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Roster
            </TabsTrigger>
            <TabsTrigger value="uniforms" className="flex items-center gap-2">
              <ShirtIcon className="w-4 h-4" />
              Uniforms
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="roster" className="space-y-4 animate-fade-in">
            <AthletesList />
          </TabsContent>
          
          <TabsContent value="uniforms" className="space-y-4 animate-fade-in">
            <UniformsDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>;
};
export default Index;