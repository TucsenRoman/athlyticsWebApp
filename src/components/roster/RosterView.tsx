import { useState } from "react";
import { Users, Lock, Shirt } from "lucide-react";
import { cn } from "@/lib/utils";
import AthletesView from "./views/AthletesView";
import LockersView from "./views/LockersView";
import UniformsView from "./views/UniformsView";
type ViewType = "athletes" | "lockers" | "uniforms";
export default function RosterView({
  onSwitchToAttendance
}: {
  onSwitchToAttendance?: () => void;
}) {
  const [activeView, setActiveView] = useState<ViewType>("athletes");
  const [searchQuery, setSearchQuery] = useState("");
  const views = [{
    id: "athletes" as ViewType,
    label: "Athletes",
    icon: Users
  }, {
    id: "lockers" as ViewType,
    label: "Lockers",
    icon: Lock
  }, {
    id: "uniforms" as ViewType,
    label: "Uniforms",
    icon: Shirt
  }];
  return <div className="space-y-6">
      {/* Static Header */}
      <div className="border-b bg-muted/30 -mx-6 px-6 py-4">
        <h3 className="text-lg font-semibold text-foreground">Cross Country</h3>
      </div>

      {/* Unified Tabs and Content Container */}
      <div className="rounded-lg border bg-card shadow-sm">
        {/* Three-Box View Selector */}
        <div className="flex items-center justify-between gap-2 w-full border-b bg-muted/30 rounded-t-lg p-3">
          {views.map(view => {
            const Icon = view.icon;
            const isActive = activeView === view.id;
            return <button key={view.id} onClick={() => setActiveView(view.id)} className={cn("flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all", isActive ? "bg-background text-foreground shadow-sm" : "bg-transparent text-muted-foreground hover:bg-muted/50")}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                {isActive && <span className="font-medium">{view.label}</span>}
              </button>;
          })}
        </div>

        {/* Dynamic Content Area */}
        <div className="p-4">
          {activeView === "athletes" && <AthletesView searchQuery={searchQuery} onSwitchToAttendance={onSwitchToAttendance} />}
          {activeView === "lockers" && <LockersView searchQuery={searchQuery} />}
          {activeView === "uniforms" && <UniformsView searchQuery={searchQuery} />}
        </div>
      </div>
    </div>;
}