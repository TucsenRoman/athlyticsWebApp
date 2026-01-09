// src/components/navigation/MobileHeader.tsx

"use client";

// HOOKS/CONTEXT
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

// COMPONENTS
import ProgramDriveTrigger from "@/features/program/components/ProgramDriveTrigger";
import { useProgramContext } from "@/features/program-cloak/useProgramContext";
import AccountMenu from "../layout/AccountMenu";
import { useDemo } from "@/contexts/DemoContext";

// ICONS
import {
    Bell,
  LocateFixed,
  PencilRuler,
  Search,
  User,
  UserRound,
} from "lucide-react";
import GlobalSearch from "@/features/radar/GlobalSearch";
import { Divider } from "../ui";

/* -------------------------------------------------------------------------- */

export default function MobileHeader() {
  const navigate = useNavigate();
  const location = useLocation();

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
    location.pathname === "/"; 
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
      {/* <Divider color="var(--gray-8)" inset={10} /> */}
      {/* MOBILE HEADER */}
      {programScoped && !collapsed && (
        <div className="md:hidden flex flex-row justify-between items-center gap-4 pl-4 pr-2 py-2 h-[60px] w-[100vw] rounded-b-elongated bg-gradient-to-b from-[#D9D9D9] to-[#F1F1F1]">
          <ProgramDriveTrigger variant="mobile" />

          <div className="flex items-start gap-2 h-full text-[#BFBFBF]">
            <div className="flex justify-center items-center mt-1 w-10 h-8 rounded-full border border-[#FFFFFF] bg-[#F7F7F7] shadow-[inset_0px_1px_10px_rgba(0,0,0,0.15)]">
              <Search className="w-4 h-4" />
            </div>
            {/* <div className="relative flex justify-center items-center mt-1 w-[42px] h-[32px] rounded-full border border-[#FFFFFF] bg-[#F7F7F7] shadow-[inset_0px_1px_10px_rgba(0,0,0,0.15)]">
              <Bell className="w-4 h-4" />
              <div className="absolute top-[6.5px] right-[13px] w-[7px] h-[7px] rounded-full border border-[#F7F7F7] bg-[var(--acc-dk)]" />
            </div> */}

            <AccountMenu />
          </div>
        </div>
      )}
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