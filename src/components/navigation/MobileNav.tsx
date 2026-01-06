import { Sparkles, PencilRuler, Dumbbell, LocateFixed, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui";
import { cn } from "@/utils/utils";
import { useEffect, useState } from "react";

export default function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const buttons = [
    {
      icon: LocateFixed,
      label: "Radar",
      route: "/radar",
      active: location.pathname.startsWith("/radar"),
    },
    {
      icon: PencilRuler,
      label: "Workspace",
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

  // useEffect(() => {
  //   const meta = document.querySelector(
  //     'meta[name="theme-color"]'
  //   ) as HTMLMetaElement | null;

  //   if (!meta) return;

  //   // 🚨 DEBUG COLOR — impossible to miss
  //   meta.setAttribute("content", "#ff0000");

  //   return () => {
  //     meta.setAttribute("content", "#ffffff");
  //   };
  // }, []);

  const [open, setOpen] = useState(true);

  const toggle = () => setOpen(v => !v);


  return (
    <>
      <div className="md:hidden fixed bottom-0 right-0 z-50 flex items-center gap-2">
        <button
          onClick={toggle}
          className={cn(
            "flex justify-center items-center p-0.5 rounded-full shadow-md transition-transform",
            open
              ? "bg-[var(--gray-5)] text-[var(--text-lt)]"
              : "bg-[var(--dom-bg)] text-[var(--dom-md)]",
            !open && "rotate-180"
          )}
        >
          <ChevronRight className="translate-x-[1px]" />
        </button>
        <div
          className={cn(
            `
              flex justify-around items-center gap-2
              pl-3 h-[60px]
              rounded-tl-[30px]
              bg-gradient-to-b from-white/50 to-[var(--gray-5)]
              shadow-[-1px_-1px_10px_rgba(0,0,0,0.01)]
              backdrop-blur-[2.5px] backdrop-saturate-150
              transition-[width,opacity,transform] duration-200 ease-out
              overflow-hidden
            `,
            open
              ? "w-[180px] opacity-100 translate-x-0"
              : "w-0 opacity-0 translate-x-4"
          )}
          // style={{
          //   mask: "url(#inverse-scoop-bl)",
          //   WebkitMask: "url(#inverse-scoop-bl)",
          // }}
        >
        {/* <svg
          width="72"
          height="50"
          viewBox="0 0 72 50"
          className="absolute bottom-0 left-[-50px] pointer-events-none"
        >
          <g transform="translate(72,0) scale(-1,1)">
            <path
              d="
                M 0 16
                C 12 16, 20 10, 36 10
                C 52 10, 60 16, 72 16
                L 72 50
                L 0 50
                Z
              "
              fill="rgb(220, 38, 38)"
            />
          </g>
        </svg> */}

          {buttons.map(({ icon: Icon, label, route, active }) => (
            // <div className="flex flex-col">
              <button
                key={route}
                onClick={() => navigate(route)}
                className={cn(
                  "flex flex-col justify-center items-center h-10 w-14 text-xs",
                  active
                    ? "bg-gradient-to-br from-[var(--dom-md)] to-[var(--dom-dk)] rounded-full text-[var(--gray-5)] shadow-inner"
                    : "text-[var(--text-dk)]"
                )}        >
                <Icon 
                  className="w-8 h-8"
                  fill={active ? "none" : "var(--gray-5)"}
                />
              </button>
              // {/* <span className="flex justify-center text-xs">{label}</span> */}
            // {/* </div> */}
          ))}
        </div>
      </div>
    </>
  );
}
