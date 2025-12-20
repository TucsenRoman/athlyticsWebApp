import { Sparkles, PencilRuler, Dumbbell, LocateFixed } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui";
import { cn } from "@/utils/utils";

export default function MobilePageNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const buttons = [
    {
      icon: LocateFixed,
      route: "/radar",
      active: location.pathname.startsWith("/radar"),
    },
    {
      icon: PencilRuler,
      route: "/workspace",
      active: location.pathname.startsWith("/workspace"),
    },
    // {
    //   icon: Dumbbell,
    //   route: "/training",
    //   active: location.pathname.startsWith("/training"),
    // },
    {
      icon: Sparkles,
      route: "/discovery",
      active: location.pathname.startsWith("/discovery"),
    },
  ];

  return (
    <div className="
      md:hidden fixed bottom-0 inset-x-0
      flex items-center justify-around
      m-1 h-14
      backdrop-blur-lg rounded-lg shadow-inner
    ">
      {buttons.map(({ icon: Icon, route, active }) => (
        <Button
          key={route}
          variant="none"
          iconSize="xlg"
          onClick={() => navigate(route)}
          className={cn(
            "p-6",
            active
              ? "text-[var(--accent)] rounded-full"
              : "text-[var(--text)]"
          )}        >
          <Icon fill="var(--bg)" />
        </Button>
      ))}
    </div>
  );
}
