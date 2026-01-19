// src/components/navigation/DesktopHeader.tsx

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
  LocateFixed,
  PencilRuler,
  User,
  UserRound,
} from "lucide-react";
import { useProgram } from "@/features/program/useProgram";

/* -------------------------------------------------------------------------- */

export default function DesktopHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const programApi = useProgram()

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
      {/* HEADER (Mobile + Desktop) */}
      {!collapsed && (
        <div
          className={`
            hidden md:flex w-[100vw] rounded-b-elongated bg-gradient-to-b from-[#D9D9D9] to-[#F1F1F1]
            ${
              isLandingPage
                ? "fixed top-0 left-0 right-0"
                : "relative"
            }
            z-50 flex items-center justify-between
            h-[56px] px-3
            transition-all duration-500
            ${
              isLandingPage
                ? scrolled
                  ? "bg-transparent border-transparent"
                  : "bg-[var(--vWhite)] border-[var(--border)]"
                : "border-[var(--border)] bg-transparent backdrop-blur-[2px]"
            }
          `}
        >

          {/* LEFT — Logo + Program Selector */}
          <div className="flex justify-between items-center gap-2 w-min-content">
            
            {/* LOGO BUTTON */}
            {!programScoped && !landingScrolled &&
              <div
                onClick={handleLogoClick}
                className={`
                  flex flex-row shrink-0 items-center gap-2 
                  px-2 py-1 w-min-content h-10 
                  rounded-md transition-all
                  ${
                    logoInactive
                      ? "cursor-default"
                      : "cursor-pointer"
                  }
                  ${
                    landingScrolled
                      ? logoInactive
                        ? "bg-[--gray-lt]"
                        : "bg-[var(--gray-6)] shadow-lg"
                      : logoInactive
                        ? ""
                        : "hover:bg-[var(--dom-glass)]"
                  }
                `}
              >
                <img src="/logos/athlytics-logo.png" className="w-8 h-8" />
                {!programScoped && !landingScrolled && 
                  <span className="text-xl text-[--dom-dk] font-bold">ATHLYTICS</span>
                }
              </div>
            }

            {programScoped && (
              <ProgramDriveTrigger
                variant="header"
                programs={programApi.programs}
                loading={programApi.loading}
                archiveProgram={programApi.archiveProgram}
                restoreProgram={programApi.restoreProgram}
                deleteProgram={programApi.deleteProgram}
                refreshPrograms={programApi.refresh}
              />
            )}
          </div>

          {/* LANDING CTA INTERCEPT SLOT */}
          {/* <div>
            {showLandingCTA && (
              <DesktopNavPill landingScrolled>
                <DesktopNavButton
                  icon={<User className="w-4 h-4" strokeWidth={2.5} />}
                  label="Sign In"
                  active={activeSignIn}
                  onClick={() => navigate("/auth")}
                  widthClass="w-[95px]"
                />
                <DesktopNavButton
                  icon={<LocateFixed className="w-4 h-4" />}
                  label="Explore"
                  active={false}
                  onClick={() => navigate("/radar")}
                  widthClass="w-[110px]"
                />
              </DesktopNavPill>
            )}
          </div> */}

          {/* RIGHT — Desktop Nav + User Menu */}
            <div className="flex justify-between items-center gap-2 w-min-content">
              <div className="hidden md:flex items-center gap-2">
                {/* DEMO TAGS */}
                {/* {!user && isLandingPage && scrolled &&
                  <div>
                    <div className="flex flex-row justify-center items-center h-8 w-[150px] rounded-full shadow-lg">
                      <span className="text-sm font-medium text-[var(--dom-md)]">Explore for free →</span>
                    </div>
                  </div>
                  // ~Add more tags describing the visitor's state.
                } */}
                <DesktopNavPill landingScrolled={landingScrolled}>
                  {/* <DesktopNavButton
                    icon={<LocateFixed className="w-5 h-5" />}
                    label="Radar"
                    // icon={<SunMedium className="w-5 h-5" />}
                    // label="Spotlight"
                    active={activeRadar}
                    onClick={() => navigate("/radar")}
                    widthClass="w-[90px]"
                  /> */}

                  <DesktopNavButton
                    icon={<PencilRuler className="w-4 h-4" />}
                    label="Workspace"
                    active={activeWorkspace}
                    onClick={() => navigate("/workspace")}
                    widthClass="w-[130px]"
                  />

                {/* FUTURE DEV PROJECTS */}
                  {/* <DesktopNavButton
                    icon={<Dumbbell className="w-4 h-4" />}
                    label="Training"
                    active={activeTraining}
                    onClick={() => navigate("/training")}
                    widthClass="w-[120px]"
                  />
                </DesktopNavPill>

                <DesktopNavPill>
                  <DesktopNavButton
                    icon={<Sparkles className="w-4 h-4" />}
                    label="Discovery"
                    active={activeDiscovery}
                    onClick={() => navigate("/discovery")}
                    widthClass="w-[120px]"
                  /> */}
                </DesktopNavPill>
              </div>

            {/* SIGN IN + USER MENU */}
            {/* ~ For mobile, move user menu to fab and replace with settings gear. */}
            {!user ? (
              <DesktopNavPill landingScrolled={landingScrolled}>
                <DesktopNavButton
                  icon={<UserRound className="w-5 h-5" strokeWidth={2.5} />}
                  label="Sign In"
                  active={activeSignIn}
                  onClick={() => navigate("/auth")}
                  widthClass="w-[105px]"
                />
              </DesktopNavPill>
            ) : (
              <div className="hidden md:flex">
                <DesktopNavPill>
                    <AccountMenu />
                </DesktopNavPill>
              </div>
            )}
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
        flex justify-center items-center gap-1 h-10 w-full px-1 py-1 rounded-[19px]
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
        flex justify-center items-center gap-2 h-8 w-[150px] px-3 rounded-[20px] transition-colors
        ${widthClass}
        ${
          active
            ? "text-[var(--acc-dk)] bg-[var(--acc-lt)]"
            : "text-[var(--text)] hover:bg-[var(--gray-8)]"
        }
      `}
    >
      {icon}
      <span className="text-md font-medium">{label}</span>
    </button>
  );
}