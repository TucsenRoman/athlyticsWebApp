// src/components/navigation/MobileHeader.tsx

"use client";

// HOOKS/CONTEXT
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

// COMPONENTS
import ProgramDriveTrigger from "@/features/program/components/ProgramDriveTrigger";
import { useProgramContext } from "@/features/program-cloak/useProgramContext";
import { useDemo } from "@/contexts/DemoContext";

// ICONS
import {
  Bell,
  Search,
} from "lucide-react";
import { useProgram } from "@/features/program/useProgram";

/* -------------------------------------------------------------------------- */

export default function MobileHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const programApi = useProgram()

  // FUTURE DEV
  const hasNotification = true;

  // NO AUTH → SIGN IN BUTTON
  const { user } = useAuth();
  const authActive =
    location.pathname.startsWith("/auth")
  // const hideHeader = location.pathname.startsWith("/ledgers/");

  // ACTIVE PROGRAM
  const {
    selectedProgramId,
    setSelectedProgramId,
    programs,
  } = useProgramContext();

  // DEMO MODE
  const { demoMode } = useDemo();

  // PAGES
  const isLandingPage =
    location.pathname === "/" ||
    location.pathname === "/auth";
  const activeRadar = location.pathname.startsWith("/radar");
  const activeWorkspace = location.pathname.startsWith("/workspace");
  const activeSignIn = location.pathname.startsWith("/auth");
  // const activeTraining = location.pathname.startsWith("/training");
  // const activeDiscovery = location.pathname.startsWith("/discovery");

  // ~Are these duplicates of the above variables?
  const programScoped =
    location.pathname.startsWith("/radar") ||
    location.pathname.startsWith("/workspace") ||
    location.pathname.startsWith("/training");

  // Scroll Control
  const [scrolled, setScrolled] = useState(false);
  const landingScrolled = isLandingPage && scrolled;

  const handleLogoClick = () => {
    if (logoInactive) return;

    if (!isLandingPage) {
      navigate("/");
      return;
    }
    
    if (isLandingPage) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const el = document.getElementById("app-scroll-container");
      el?.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  const logoInactive = location.pathname === "/" && !landingScrolled;

  useEffect(() => {
    let target: HTMLElement | Window | null = null;

    if (isLandingPage) {
      target = window;
    } else {
      target = document.getElementById("app-scroll-container");
    }

    if (!target) return;

    const onScroll = () => {
      const scrollTop =
        target === window
          ? window.scrollY
          : (target as HTMLElement).scrollTop;

      setScrolled(scrollTop > 8);
    };

    target.addEventListener("scroll", onScroll, { passive: true });
    return () => target.removeEventListener("scroll", onScroll);
  }, [isLandingPage]);

  // const showLandingCTA =
  //   isLandingPage &&
  //   landingScrolled &&
  //   !user;

  // Collapse/expand header toolbar toggle tbn
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const toggle = () => setCollapsed(prev => !prev);
    window.addEventListener("toggle-header", toggle);
    return () => window.removeEventListener("toggle-header", toggle);
  }, []);


  return (
    <>
      {/* MOBILE HEADER */}
      {programScoped && !collapsed && (
        <div className="animate-slide-down-top md:hidden flex flex-row justify-between items-start gap-0 pl-4 pr-2 py-1 h-[60px] w-[100vw] rounded-b-elongated bg-gradient-to-b from-[var(--gray-6)] to-[var(--gray-2)]">
          <ProgramDriveTrigger
            variant="header"
            programs={programApi.programs}
            loading={programApi.loading}
            archiveProgram={programApi.archiveProgram}
            restoreProgram={programApi.restoreProgram}
            deleteProgram={programApi.deleteProgram}
            refreshPrograms={programApi.refresh}
          />

          <div className="flex justify-end items-start gap-2 h-full w-full text-[var(--gray-10)]">
            <div 
              className="relative flex justify-center items-center mt-1.5 w-10 h-8 rounded-full border border-[var(--gray-3)] bg-[#F7F7F7] shadow-inner"
              onClick={null}
            >
              <Search className="w-5 h-5" />
            </div>
            <div 
              className="relative flex justify-center items-center mt-1.5 w-10 h-8 rounded-full border border-[var(--gray-3)] bg-[#F7F7F7] shadow-inner"
              onClick={null}
            >
              <Bell className="w-5 h-5" />
              {hasNotification &&
                <div className="absolute top-[4.5px] right-[11px] w-[7px] h-[7px] rounded-full border border-[#F7F7F7] bg-[var(--acc-dk)]" />
              }
            </div>

            {/* {!collapsed &&
              <div
                className="flex justify-center items-center mt-1.5 w-10 h-8 rounded-full border border-[var(--gray-3)] bg-[#F7F7F7] shadow-[inset_0px_1px_10px_rgba(0,0,0,0.15)] transition-opacity"
                title={collapsed ? "Expand header" : "Collapse header"}
                onClick={() => setCollapsed(prev => !prev)}
              >
                <Maximize className="h-4 w-4" />
              </div>
            } */}

            {/* <AccountMenu /> */}
          </div>
        </div>
      )}

      {/* FULLSCREEN BTN */}
      {/* {programScoped && collapsed && (
        <div className="md:hidden flex justify-between items-center px-4 py-1 w-full h-10 ">
          <GlobalSearch
            query=""
            onChange={() => {}}
          />

          <Button
            className="flex justify-center items-center w-10 h-8 rounded-full border border-[var(--gray-3)] bg-[var(--acc-bg)] shadow-[inset_0px_1px_10px_rgba(0,0,0,0.15)] transition-opacity"
            title={collapsed ? "Expand header" : "Collapse header"}
            onClick={() => setCollapsed(prev => !prev)}
          >
            <Minimize className="h-4 w-4 text-[var(--acc-md)]" />
          </Button>
        </div>
      )} */}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* DESKTOP NAV PILL WRAPPER                                                   */
/* -------------------------------------------------------------------------- */

interface DesktopNavPillProps {
  children: React.ReactNode;
  landingScrolled?: boolean;
}

function DesktopNavPill({ children, landingScrolled = false }: DesktopNavPillProps) {
  return (
    <div
      className={`
        flex justify-center items-center gap-1 h-10 w-full px-1 py-1 rounded-xl
        transition-all duration-300 bg-[var(--gray-7)] shadow-inner
        ${
          landingScrolled
            ? "shadow-lg"
            : null
        }
      `}
    >
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* DESKTOP NAV BUTTON                                                          */
/* -------------------------------------------------------------------------- */

interface DesktopNavButtonProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  widthClass?: string;
}

function DesktopNavButton({
  icon,
  label,
  active,
  onClick,
  widthClass = "",
}: DesktopNavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex justify-center items-center gap-2 h-8 w-[150px] px-3 rounded-xl transition-colors
        ${widthClass}
        ${
          active
            ? "text-[var(--dom-dk)] bg-[var(--dom-glass)]"
            : "text-[var(--text)] hover:bg-[var(--gray-8)]"
        }
      `}
    >
      {icon}
      <span className="text-md font-medium">{label}</span>
    </button>
  );
}