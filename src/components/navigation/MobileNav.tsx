import { Sparkles, PencilRuler, Dumbbell, LocateFixed } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui";
import { cn } from "@/utils/utils";

export default function MobileNav() {
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
    // {
    //   icon: Sparkles,
    //   route: "/discovery",
    //   active: location.pathname.startsWith("/discovery"),
    // },
  ];

  return (
    <div className="
      md:hidden fixed bottom-0 inset-x-0
      flex items-center justify-around
      h-[60px]
      bg-[var(--gray-5)]
      shadow-inner
    ">
      {buttons.map(({ icon: Icon, route, active }) => (
        <Button
          key={route}
          iconSize="xl"
          onClick={() => navigate(route)}
          className={cn(
            "p-2", // ~Was at p-6. Why?
            active
              ? "bg-[var(--dom-bg)] text-[var(--dom-dk)] rounded-full"
              : "text-[var(--text)]"
          )}        >
          <Icon fill="transparent" /* ~Maybe use white fill. */ /> 
        </Button>
      ))}
    </div>
  );
}
