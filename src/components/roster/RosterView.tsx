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
  return;
}