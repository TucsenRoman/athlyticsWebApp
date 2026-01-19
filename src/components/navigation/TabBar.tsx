// src/components/navigation/TabBar.tsx

import { PencilRuler, LocateFixed, User, type LucideIcon } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/utils/utils";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useProfileContext } from "@/features/profile/ProfileProvider";
import { AVATAR_MAP } from "@/features/profile/avatarMap";
// import { useUIPrefs } from "@/contexts/UIPrefsContext";

type TabButton = {
  key: "profile" | "radar" | "workspace";
  label: string;
  route: string;
  active: boolean;
  icon: LucideIcon;
};

const DOCK_W = 55;
const COLLAPSED_H = 55;

export default function TabBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useProfileContext();
  // const { dockSide } = useUIPrefs();

  const profileActive = location.pathname.startsWith("/settings/profile");

  const baseButtons: TabButton[] = useMemo(
    () => [
      {
        key: "radar",
        icon: LocateFixed,
        label: "Radar",
        route: "/radar",
        active: location.pathname.startsWith("/radar"),
      },
      {
        key: "workspace",
        icon: PencilRuler,
        label: "Workspace",
        route: "/workspace",
        active: location.pathname.startsWith("/workspace"),
      },
    ],
    [location.pathname]
  );

  const activeBtn: TabButton = useMemo(() => {
    if (profileActive) {
      return {
        key: "profile",
        icon: User, // icon fallback (avatar renders separately)
        label: "Profile",
        route: "/settings/profile",
        active: true,
      };
    }
    return baseButtons.find((b) => b.active) ?? baseButtons[0];
  }, [profileActive, baseButtons]);

  // When collapsed: show ONLY the active button (including profile)
  // When expanded: show profile + all nav buttons
  const [collapsed, setCollapsed] = useState(false);

  const visibleButtons: TabButton[] = useMemo(() => {
    if (collapsed) return [activeBtn];
    return [
      {
        key: "profile",
        icon: User,
        label: "Profile",
        route: "/settings/profile",
        active: profileActive,
      },
      ...baseButtons,
    ];
  }, [collapsed, activeBtn, baseButtons, profileActive]);

  // refs
  const dockRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Measure actual expanded content height (no dead space)
  const [expandedH, setExpandedH] = useState<number>(COLLAPSED_H);

  /* -------------------------------------------------------------------------- */
  /* EXTERNAL TRIGGERS                                                          */
  /* window.dispatchEvent(new Event("tabbar-collapse"))                          */
  /* window.dispatchEvent(new Event("tabbar-expand"))                            */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    const onCollapse = () => setCollapsed(true);
    const onExpand = () => setCollapsed(false);

    window.addEventListener("tabbar-collapse", onCollapse);
    window.addEventListener("tabbar-expand", onExpand);

    return () => {
      window.removeEventListener("tabbar-collapse", onCollapse);
      window.removeEventListener("tabbar-expand", onExpand);
    };
  }, []);

  /* -------------------------------------------------------------------------- */
  /* COLLAPSE ON CLICK OUTSIDE                                                  */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    if (collapsed) return;

    const onPointerDown = (e: PointerEvent) => {
      const el = dockRef.current;
      if (!el) return;

      if (!el.contains(e.target as Node)) setCollapsed(true);
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [collapsed]);

  /* -------------------------------------------------------------------------- */
  /* MEASURE EXPANDED HEIGHT (CONTENT-DRIVEN)                                    */
  /* -------------------------------------------------------------------------- */
  useLayoutEffect(() => {
    if (collapsed) return;

    const measure = () => {
      const el = contentRef.current;
      if (!el) return;
      const h = el.scrollHeight;
      setExpandedH(Math.max(COLLAPSED_H, h));
    };

    measure();

    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(measure)
        : null;

    if (ro && contentRef.current) ro.observe(contentRef.current);

    return () => {
      if (ro) ro.disconnect();
    };
  }, [collapsed, location.pathname, profile?.avatarUrl]);

  /* -------------------------------------------------------------------------- */
  /* CLICK BEHAVIOR                                                             */
  /* - collapsed: tap expands (no nav)                                           */
  /* - expanded: tap navigates + collapses                                       */
  /* -------------------------------------------------------------------------- */
  const onTap = (route: string) => {
    if (collapsed) {
      setCollapsed(false);
      return;
    }

    navigate(route);
    setCollapsed(true);
  };

  /* -------------------------------------------------------------------------- */
  /* RENDER HELPERS                                                             */
  /* -------------------------------------------------------------------------- */
  const avatarSrc =
    profile?.avatarUrl ? AVATAR_MAP[profile.avatarUrl] : undefined;

  const renderBtnIcon = (btn: TabButton) => {
    if (btn.key === "profile") {
      return (
        <div className="h-9 w-9 rounded-full overflow-hidden bg-[var(--gray-5)]">
          {avatarSrc ? (
            <img src={avatarSrc} alt="" className="h-full w-full object-cover" />
          ) : (
            <User className="h-full w-full p-1.5 text-[var(--gray-6)]" />
          )}
        </div>
      );
    }

    const color = btn.active ? "text-[var(--acc-dk)]" : "text-[var(--gray-11)]";

    return (
      <div className="h-9 w-9 flex items-center justify-center">
        <btn.icon className={cn("block h-7 w-7", color)} />
      </div>
    );
  };

  /* -------------------------------------------------------------------------- */
  /* MOTION                                                                     */
  /* -------------------------------------------------------------------------- */
  const spring = { type: "spring" as const, stiffness: 420, damping: 36 };

  return (
    <div 
      className={cn(
        "fixed bottom-4 z-50 md:hidden",
        "right-8"
        // dockSide === "right" ? "right-8" : "left-8"
      )}
    >
      <motion.div
        ref={dockRef}
        layout={false}
        initial={false}
        animate={{ height: collapsed ? COLLAPSED_H : expandedH }}
        transition={spring}
        style={{ width: DOCK_W }}
        className={cn(
          "overflow-hidden relative flex flex-col items-center",
          "rounded-full border border-white/25 backdrop-blur-[3px]",
          "bg-[var(--acc-glass)] shadow-[-8px_5px_20px_rgba(0,0,0,0.2)]"
        )}
      >
        {/* CONTENT (DEFINES EXPANDED HEIGHT) */}
        <motion.div
          ref={contentRef}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.1, ease: "easeOut" }}
          className={cn(
            "flex flex-col items-center justify-center",
            collapsed ? "pt-2" : "pb-5 gap-2"
          )}
        >
          {visibleButtons.map((btn) => {
            const color = btn.active
              ? "text-[var(--acc-dk)]"
              : "text-[var(--gray-11)]";

            return (
              <button
                key={btn.key}
                onClick={() => onTap(btn.route)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1",
                  // keep this minimal so collapse fits inside COLLAPSED_H
                  collapsed ? "p-0" : "p-2",
                )}
              >
                {renderBtnIcon(btn)}

                {/* labels only when expanded */}
                {/* {!collapsed && btn.key !== "profile" && (
                  <span className={cn("text-[9px] leading-none", color)}>
                    {btn.label}
                  </span>
                )} */}
              </button>
            );
          })}
        </motion.div>
      </motion.div>
    </div>
  );
}
