import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardStats from "@/components/dashboard/DashboardStats";
import AthletesList from "@/components/athletes/AthletesList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Users, BarChart3, ShirtIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground mt-2">
              Manage your track and cross country team
            </p>
          </div>
          <Button onClick={() => navigate("/uniforms")} variant="outline">
            <ShirtIcon className="w-4 h-4 mr-2" />
            Manage Uniforms
          </Button>
        </div>

        <DashboardStats />

        <Tabs defaultValue="athletes" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="athletes" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Athletes
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="athletes" className="space-y-4">
            <AthletesList />
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-4">
            <div className="text-center py-12 text-muted-foreground">
              Analytics and performance graphs coming soon
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Index;
