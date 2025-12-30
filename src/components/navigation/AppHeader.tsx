// src/components/navigation/AppHeader.tsx

"use client";

// HOOKS/CONTEXT
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

// COMPONENTS
import ProgramSelector from "@/features/program/components/ProgramSelector";
import { useProgramContext } from "@/features/program-cloak/useProgramContext";
import AccountMenu from "../layout/AccountMenu";
import { useDemo } from "@/contexts/DemoContext";

// ICONS
import {
  LocateFixed,
  PencilRuler,
  User,
} from "lucide-react";

/* -------------------------------------------------------------------------- */

export default function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();

  // NO AUTH → SIGN IN BUTTON
  const { user } = useAuth();
  const authActive =
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/signup");
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
    location.pathname === "/login"; // ~Change to "signin."
  const activeRadar = location.pathname.startsWith("/radar");
  const activeWorkspace = location.pathname.startsWith("/workspace");
  const activeSignIn = location.pathname.startsWith("/login"); // ~Change to "signin."
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

    if (location.pathname === "/") {
      const el = document.getElementById("app-scroll-container");
      el?.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/");
    }
  };
  const logoInactive = location.pathname === "/" && !landingScrolled;

  useEffect(() => {
    if (!isLandingPage) return;

    const el = document.getElementById("app-scroll-container");
    if (!el) return;

    const onScroll = () => {
      setScrolled(el.scrollTop > 8);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [isLandingPage]);


  const showLandingCTA =
    isLandingPage &&
    landingScrolled &&
    !user;

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
            ${
              isLandingPage
                ? "fixed top-0 left-0 right-0"
                : "relative"
            }
            z-50
            h-14 px-3 flex items-center justify-between
            transition-all duration-500
            border-b
            ${
              isLandingPage
                ? scrolled
                  ? "bg-transparent border-transparent"
                  : "bg-[var(--bg)] border-[var(--border)]"
                : "bg-[var(--bg)] border-[var(--border)]"
            }
          `}
        >

          {/* LEFT — Logo + Program Selector */}
          <div className="flex justify-between items-center gap-2 w-min-content">
            
            {/* LOGO BUTTON */}
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
                      : "bg-[--gray-lt] hover:bg-[var(--gray-lt-hv)] shadow-lg"
                    : logoInactive
                      ? ""
                      : "hover:bg-[var(--accent-glass)]"
                }
              `}
            >          
                <img src="/logos/athlytics-logo.png" className="w-8 h-8" />
                {!programScoped && !landingScrolled && 
                  <span className="text-xl text-[--accent] font-bold">ATHLYTICS</span>
                }
            </div>

            {programScoped && (
              <DesktopNavPill>
                <div className="group flex items-center rounded-xl h-8 transition-all text-[var(--text)] hover:bg-[var(--accent-glass)] hover:text-[var(--accent)] cursor-pointer">
                  <ProgramSelector
                    selectedProgramId={selectedProgramId}
                    onProgramChange={setSelectedProgramId}
                    programsOverride={demoMode ? programs : undefined}
                  />
                </div>
              </DesktopNavPill>
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
                  onClick={() => navigate("/login")}
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
                      <span className="text-sm font-medium text-[--accent-md]">Explore for free →</span>
                    </div>
                  </div>
                  // ~Add more tags describing the visitor's state.
                } */}
                <DesktopNavPill landingScrolled={landingScrolled}>
                  <DesktopNavButton
                    icon={<LocateFixed className="w-5 h-5" />}
                    label="Radar"
                    // icon={<SunMedium className="w-5 h-5" />}
                    // label="Spotlight"
                    active={activeRadar}
                    onClick={() => navigate("/radar")}
                    widthClass="w-[90px]"
                  />

                  <DesktopNavButton
                    icon={<PencilRuler className="w-4 h-4" />}
                    label="Workspace"
                    active={activeWorkspace}
                    onClick={() => navigate("/workspace")}
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
                  icon={<User className="w-4 h-4" strokeWidth={2.5} />}
                  label="Sign In"
                  active={activeSignIn}
                  onClick={() => navigate("/login")}
                  widthClass="w-[95px]"
                />
              </DesktopNavPill>
            ) : (
              <div className="flex">
                <AccountMenu />
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
        flex justify-center items-center gap-1 h-10 w-full px-1 py-1 rounded-xl
        transition-all duration-300 bg-[var(--gray-lt)]
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
        flex justify-center items-center gap-2 h-8 w-[120px] px-3 rounded-xl transition-colors
        ${widthClass}
        ${
          active
            ? "text-[var(--text-accent)] bg-[var(--accent-glass)]"
            : "text-[var(--text)] hover:bg-[var(--gray-200)]"
        }
      `}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}