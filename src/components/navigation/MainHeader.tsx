// src/components/header/HeaderLayout.tsx

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MapPinned, Sparkles, PencilRuler, Weight, Dumbbell } from "lucide-react";
import { motion } from "framer-motion";
import ProgramSelector from "@/components/program/ProgramSelector";
import { useProgramContext } from "@/hooks/useProgramContext";
import { EditModeContext } from "@/contexts/EditModeContext";
import Usermenu from "./UserMenu";

/* -------------------------------------------------------------------------- */

interface HeaderLayoutProps {
  children: React.ReactNode;
}

export default function HeaderLayout({ children }: HeaderLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const hideHeader = location.pathname.startsWith("/ledgers/");
  const { selectedProgramId, setSelectedProgramId } = useProgramContext();
  const [isEditMode, setIsEditMode] = useState(false);

  const activeField = location.pathname.startsWith("/field");
  const activeWorkspace = location.pathname.startsWith("/workspace");
  const activeTraining = location.pathname.startsWith("/training");
  const activeDiscovery = location.pathname.startsWith("/discovery");

  // Collapse/expand header toggle
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    const toggle = () => setCollapsed(prev => !prev);
    window.addEventListener("toggle-header", toggle);
    return () => window.removeEventListener("toggle-header", toggle);
  }, []);

  return (
    <EditModeContext.Provider value={{ isEditMode, setIsEditMode }}>
      <div className="bg-[var(--bg)] flex flex-col flex-1 min-h-0">
      {/* <div className="min-h-screen bg-[var(--bg)] flex flex-col overflow-hidden"> */}

        {/* ------------------------------------------------------------------ */}
        {/* HEADER (Mobile + Desktop)                                         */}
        {/* ------------------------------------------------------------------ */}
        {!hideHeader && !collapsed && (
          <header className="h-[8vh] px-3 flex items-center justify-between border-b border-[var(--border)]">

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

              <DesktopNavPill>
                {/* PROGRAM SELECTOR */}
                <div className="group flex items-center rounded-xl h-8 transition-all text-[var(--text)] hover:bg-[var(--accent-bg)] hover:text-[var(--accent)] cursor-pointer">
                  <ProgramSelector
                    selectedProgramId={selectedProgramId}
                    onProgramChange={setSelectedProgramId}
                  />
                </div>
              </DesktopNavPill>
            </div>

            {/* RIGHT — Desktop Nav + User Menu */}
            <div className="hidden md:flex gap-2">
              <div className="flex justify-between items-center w-min-content">
                <DesktopNavPill>
                  <DesktopNavButton
                    icon={<MapPinned className="w-4 h-4" />}
                    label="Field"
                    active={activeField}
                    onClick={() => navigate("/field")}
                    widthClass="w-[80px]"
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
                  /> */}

                  <DesktopNavButton
                    icon={<Sparkles className="w-4 h-4" />}
                    label="Discovery"
                    active={activeDiscovery}
                    onClick={() => navigate("/discovery")}
                    widthClass="w-[120px]"
                  />
                </DesktopNavPill>
              </div>
              <Usermenu />
            </div>

            {/* Mobile — User menu only */}
            <div className="md:hidden">
              <Usermenu />
            </div>
          </header>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* CONTENT                                                           */}
        {/* ------------------------------------------------------------------ */}
        <main className="flex flex-col flex-1 min-h-0">
          {children}
        </main>

        {/* ------------------------------------------------------------------ */}
        {/* MOBILE BOTTOM NAV                                                 */}
        {/* ------------------------------------------------------------------ */}
        {!hideHeader && (
          <MobileBottomBar
            activeField={activeField}
            activeWorkspace={activeWorkspace}
            activeTraining={activeTraining}
            activeDiscovery={activeDiscovery}
            navigate={navigate}
          />
        )}
      </div>
    </EditModeContext.Provider>
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

/* -------------------------------------------------------------------------- */
/* MOBILE NAV BAR                                                             */
/* -------------------------------------------------------------------------- */

function MobileBottomBar({ activeField, activeWorkspace, activeTraining, activeDiscovery, navigate }) {
  return (
    <div className="
      md:hidden fixed 
      flex items-center justify-around
      bottom-0 inset-x-0 
      h-[9vh] bg-[var(--light)] shadow-inner 
    ">
      <MobileNavIcon
        icon={<MapPinned className="w-6 h-6" />}
        active={activeField}
        onClick={() => navigate("/field")}
      />
      <MobileNavIcon
        icon={<PencilRuler className="w-6 h-6" />}
        active={activeWorkspace}
        onClick={() => navigate("/workspace")}
      />
      <MobileNavIcon
        icon={<Dumbbell className="w-6 h-6" />}
        active={activeTraining}
        onClick={() => navigate("/training")}
      />
      <MobileNavIcon
        icon={<Sparkles className="w-6 h-6" />}
        active={activeDiscovery}
        onClick={() => navigate("/discovery")}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* MOBILE NAV ICON                                                            */
/* -------------------------------------------------------------------------- */

function MobileNavIcon({ icon, active, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.85 }}
      animate={active ? { scale: 1.25 } : { scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className={`
        flex flex-col items-center justify-center p-2 rounded-full
        ${active ? "text-[var(--text-accent)] bg-[var(--accent-bg)]" : "text-[var(--text)]"}
      `}
    >
      <motion.div
        animate={active ? { opacity: 1 } : { opacity: 0.75 }}
        transition={{ duration: 0.15 }}
      >
        {icon}
      </motion.div>
    </motion.button>
  );
}
