import { useState } from "react";
import DashboardLayout from "@/components/header/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, ClipboardList } from "lucide-react";

import Dashboard from "@/pages/DashboardPage";
import Ledger from "@/pages/LedgerPage";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          {/* Tab Header */}
          <TabsList className="sticky top-0 z-10 grid w-full grid-cols-2 h-12 bg-muted/50 border-b border-border mb-4 p-0 rounded-none">
            <TabsTrigger
              value="dashboard"
              className="h-12 px-4 data-[state=active]:bg-background data-[state=active]:shadow-[0_-1px_4px_rgba(0,0,0,0.05)] data-[state=inactive]:bg-muted flex items-center justify-center gap-2 transition-all duration-200"
            >
              <LayoutDashboard className="w-5 h-5 md:w-[18px] md:h-[18px]" />
              <span className="hidden md:inline">Dashboard</span>
            </TabsTrigger>

            <TabsTrigger
              value="ledger"
              className="h-12 px-4 data-[state=active]:bg-background data-[state=active]:shadow-[0_-1px_4px_rgba(0,0,0,0.05)] data-[state=inactive]:bg-muted flex items-center justify-center gap-2 transition-all duration-200"
            >
              <ClipboardList className="w-5 h-5 md:w-[18px] md:h-[18px]" />
              <span className="hidden md:inline">Ledger</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          <TabsContent value="dashboard" className="animate-fade-in mt-2">
            <Dashboard />
          </TabsContent>

          <TabsContent value="ledger" className="animate-fade-in mt-2">
            <Ledger />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Index;
