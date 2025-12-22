// src/components/header/HeaderLayout.tsx

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sparkles, PencilRuler, Dumbbell, LocateFixed } from "lucide-react";
import ProgramSelector from "@/features/program/components/ProgramSelector";
import { useProgramContext } from "@/features/program-cloak/useProgramContext";
import AccountMenu from "../layout/AccountMenu";
import { useDemo } from "@/contexts/DemoContext";

/* -------------------------------------------------------------------------- */

export default function MainHeader() {
  const navigate = useNavigate();
  const location = useLocation();

  const hideHeader = location.pathname.startsWith("/ledgers/");

  // ACTIVE PROGRAM
  const {
    selectedProgramId,
    setSelectedProgramId,
    programs,
  } = useProgramContext();

  // DEMO MODE
  const { demoMode } = useDemo();

  // ~Old code.
  // const [isEditMode, setIsEditMode] = useState(false);

  const activeRadar = location.pathname.startsWith("/radar");
  const activeWorkspace = location.pathname.startsWith("/workspace");
  const activeTraining = location.pathname.startsWith("/training");
  const activeDiscovery = location.pathname.startsWith("/discovery");

  const programScoped =
    location.pathname.startsWith("/radar") ||
    location.pathname.startsWith("/workspace") ||
    location.pathname.startsWith("/training");

  // Collapse/expand header toggle
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    const toggle = () => setCollapsed(prev => !prev);
    window.addEventListener("toggle-header", toggle);
    return () => window.removeEventListener("toggle-header", toggle);
  }, []);

  return (
    <>
      {/* HEADER (Mobile + Desktop) */}
      {!hideHeader && !collapsed && (
        <header className="h-14 px-3 flex items-center justify-between border-b border-[var(--border)]">

          {/* LEFT — Logo + Program Selector */}
          <div className="flex justify-between items-center gap-2 w-min-content">
            
            {/* LOGO BUTTON */}
            <div className="flex items-center p-1 h-10 w-[50px] rounded-md hover:bg-[var(--accent-bg)] transition-all">
              <button
                onClick={() => navigate("/")}
              >
                <img src="/logos/athlytics-logo.png" className="w-8 h-8" />
              </button>
            </div>

            {programScoped && (
              <DesktopNavPill>
                <div className="group flex items-center rounded-xl h-8 transition-all text-[var(--text)] hover:bg-[var(--accent-bg)] hover:text-[var(--accent)] cursor-pointer">
                  <ProgramSelector
                    selectedProgramId={selectedProgramId}
                    onProgramChange={setSelectedProgramId}
                    programsOverride={demoMode ? programs : undefined}
                  />
                </div>
              </DesktopNavPill>
            )}
          </div>

          {/* RIGHT — Desktop Nav + User Menu */}
          <div className="hidden md:flex gap-2">
            <div className="flex justify-between items-center gap-2 w-min-content">
              <DesktopNavPill>
                <DesktopNavButton
                  icon={<LocateFixed className="w-5 h-5" />}
                  label="Radar"
                  active={activeRadar}
                  onClick={() => navigate("/radar")}
                  widthClass="w-[90px]"
                />

                <DesktopNavButton
                  icon={<PencilRuler className="w-4 h-4" />}
                  label="Workspace"
                  active={activeWorkspace}
                  onClick={() => navigate("/workspace")}
                  widthClass="w-[120px]"
                />

                {/* <DesktopNavButton
                  icon={<Dumbbell className="w-4 h-4" />}
                  label="Training"
                  active={activeTraining}
                  onClick={() => navigate("/training")}
                  widthClass="w-[120px]"
                />
              </DesktopNavPill>

              <DesktopNavPill> */}
                <DesktopNavButton
                  icon={<Sparkles className="w-4 h-4" />}
                  label="Discovery"
                  active={activeDiscovery}
                  onClick={() => navigate("/discovery")}
                  widthClass="w-[120px]"
                />
              </DesktopNavPill>
            </div>
            <AccountMenu />
          </div>

          {/* Mobile — User menu only */}
          <div className="md:hidden">
            <AccountMenu />
          </div>
        </header>
      )}
    </>

    // ~ For mobile, move user menu to fab and replace with settings gear.
  );
}

/* -------------------------------------------------------------------------- */
/* DESKTOP NAV PILL WRAPPER                                                   */
/* -------------------------------------------------------------------------- */

function DesktopNavPill({ children }) {
  return (
    <div className="flex justify-center items-center gap-1 h-10 w-full px-1 py-1 rounded-xl bg-[var(--gray-100)]">
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
        flex justify-center items-center gap-2 h-8 px-3 rounded-xl transition-colors
        ${widthClass}
        ${
          active
            ? "text-[var(--text-accent)] bg-[var(--accent-bg)] font-bold"
            : "text-[var(--text)] hover:bg-[var(--gray-200)]"
        }
      `}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </button>
  );
}