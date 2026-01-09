import { Sparkles, PencilRuler, Dumbbell, LocateFixed, ChevronLeft, ChevronRight, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui";
import { cn } from "@/utils/utils";
import { useEffect, useState } from "react";
import { useProfileContext } from "@/features/profile/ProfileProvider";
import { AVATAR_MAP } from "@/features/profile/avatarMap";

export default function TabBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useProfileContext()

  const buttons = [
  {
    key: "profile",
    label: "Profile",
    route: "/settings/profile",
    active: location.pathname.startsWith("/settings/profile"),
    type: "avatar",
  },
  {
    key: "radar",
    icon: LocateFixed,
    label: "Radar",
    route: "/radar",
    active: location.pathname.startsWith("/radar"),
    type: "icon",
  },
  {
    key: "workspace",
    icon: PencilRuler,
    label: "Workspace",
    route: "/workspace",
    active: location.pathname.startsWith("/workspace"),
    type: "icon",
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
      <div className="md:hidden fixed bottom-0 right-0 z-50 flex items-end gap-2 w-[100vw]">
        {/* <div
          onClick={toggle}
          className={cn(
            "flex justify-center items-center mb-2 h-6 w-8 rounded-full border-[0px] shadow-[0px_2px_2px_rgba(0,0,0,0.1)] transition-transform",
            open
              ? "border-[var(--border-dk)] bg-gradient-to-br from-[var(--gray-9)] to-[var(--gray-11)] text-[var(--gray-3)]"
              : "border-[var(--acc-dk)] bg-gradient-to-br from-[var(--acc-lt)] to-[var(--acc-md)] text-[var(--acc-dk)]",
            
          )}
        >
          <ChevronRight className={`pl-[2px] ${!open && "rotate-180"}`} />
        </div> */}
        <div
          className={cn(
            `
              flex justify-center items-center gap-2
              pl-0 h-[45px]
              rounded-tl-[20px]
              bg-gradient-to-b from-transparent to-[var(--gray-6)]
              shadow-[-1px_-1px_10px_rgba(0,0,0,0.1)]
              backdrop-blur-[2px] backdrop-saturate-150
              transition-[width,opacity,transform] duration-200 ease-out
              overflow-hidden
            `,
            open
              ? "w-full opacity-100 translate-x-0"
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
        {buttons.map((btn) => {
          const activeStyles = btn.active
            ? "bg-[var(--acc-lt)] rounded-full text-[var(--acc-dk)] shadow-inner"
            : "text-[var(--text)]"

          return (
            <div
              key={btn.key}
              onClick={() => navigate(btn.route)}
              className={cn(
                "flex flex-col justify-center items-center h-8 w-14 text-xs",
                activeStyles
              )}
            >
              {btn.type === "avatar" ? (
                <div className="h-[48px] w-[48px] rounded-full overflow-hidden bg-[var(--gray-5)]">
                  {profile?.avatarUrl ? (
                    <img
                      src={AVATAR_MAP[profile.avatarUrl]}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-full w-full text-[var(--gray-6)]" />
                  )}
                </div>
              ) : (
                <btn.icon
                  className="w-[80%] h-[80%]"
                  fill={btn.active ? "none" : "var(--gray-5)"}
                />
              )}
            </div>
          )
        })}
          {/* {buttons.map(({ icon: Icon, label, route, active }) => (
            <div
              key={route}
              onClick={() => navigate(route)}
              className={cn(
                "flex flex-col justify-center items-center h-8 w-14 text-xs",
                active
                  ? "bg-[var(--acc-lt)] rounded-full text-[var(--acc-dk)] shadow-inner"
                  : "text-[var(--text)]"
              )}
              // bg-gradient-to-br from-[var(--acc-lt)] to-[var(--acc-lt)]
            >
              <Icon 
                className="w-[80%] h-[80%]"
                fill={active ? "none" : "var(--gray-5)"}
              />
            </div>
          ))} */}
        </div>
      </div>
    </>
  );
}
