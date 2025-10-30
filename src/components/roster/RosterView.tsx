import { useState } from "react";
import { Users, Lock, Shirt, Search, Plus, Pencil, Trash2, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

      {/* Three-Box View Selector */}
      <div className="flex items-center justify-between gap-2 w-full max-w-2xl mx-auto">
        {views.map(view => {
        const Icon = view.icon;
        const isActive = activeView === view.id;
        return <button key={view.id} onClick={() => setActiveView(view.id)} className={cn("flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all border", isActive ? "bg-background text-foreground shadow-sm border-border" : "bg-transparent text-muted-foreground border-transparent hover:bg-muted/50")}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              {isActive && <span className="font-medium">{view.label}</span>}
            </button>;
      })}
      </div>

      {/* Action + Search Row */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input placeholder={activeView === "athletes" ? "Search athletes..." : activeView === "lockers" ? "Search by name or locker #..." : "Search by name or uniform ID..."} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
        </div>

        {/* Action Buttons - Rendered by child views */}
        <div className="flex items-center gap-2">
          {/* Child views will handle their own action buttons */}
        </div>
      </div>

      {/* Dynamic Content Area */}
      <div className="mt-6">
        {activeView === "athletes" && <AthletesView searchQuery={searchQuery} onSwitchToAttendance={onSwitchToAttendance} />}
        {activeView === "lockers" && <LockersView searchQuery={searchQuery} />}
        {activeView === "uniforms" && <UniformsView searchQuery={searchQuery} />}
      </div>
    </div>;
}