// src/components/header/HeaderLayout.tsx

import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  MapPinned,
  Sparkles,
  PencilRuler,
} from "lucide-react";

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
  const activeDiscovery = location.pathname.startsWith("/discovery");

  return (
    <EditModeContext.Provider value={{ isEditMode, setIsEditMode }}>
      <div className="min-h-screen bg-[hsl(var(--background))] flex flex-col overflow-hidden">

        {/* ------------------------------------------------------------------ */}
        {/* HEADER (Mobile + Desktop)                                         */}
        {/* ------------------------------------------------------------------ */}
        {!hideHeader && (
          <header
            className="
              h-16 px-3 flex items-center justify-between
              bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))]
              border-b border-[hsl(var(--border))]
            "
          >
            {/* LEFT — Logo + Program Selector */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/field")}
                className="hover:opacity-80 transition"
              >
                <img src="/AthlyticsLogo.png" className="w-[70px] h-[70px]" />
              </button>

              <ProgramSelector
                variant="header"
                selectedProgramId={selectedProgramId}
                onProgramChange={setSelectedProgramId}
              />
            </div>

            {/* RIGHT — Desktop Nav + User Menu */}
            <div className="hidden md:flex items-center gap-3">
              <DesktopNavPill>
                <DesktopNavButton
                  icon={<MapPinned className="w-4 h-4" />}
                  label="Field"
                  active={activeField}
                  onClick={() => navigate("/field")}
                />

                <DesktopNavButton
                  icon={<PencilRuler className="w-4 h-4" />}
                  label="Workspace"
                  active={activeWorkspace}
                  onClick={() => navigate("/workspace")}
                />

                <DesktopNavButton
                  icon={<Sparkles className="w-4 h-4" />}
                  label="Discovery"
                  active={activeDiscovery}
                  onClick={() => navigate("/discovery")}
                />
              </DesktopNavPill>

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
        <main className="flex-1 overflow-hidden">
          {children}
        </main>

        {/* ------------------------------------------------------------------ */}
        {/* MOBILE BOTTOM NAV                                                 */}
        {/* ------------------------------------------------------------------ */}
        {!hideHeader && (
          <MobileBottomBar
            activeField={activeField}
            activeWorkspace={activeWorkspace}
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
    <div
      className="
        flex items-center gap-1 px-1 py-1
        rounded-xl
        bg-[hsl(var(--gray-100))]
        dark:bg-[hsl(var(--gray-800))]
      "
    >
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* DESKTOP NAV BUTTON                                                          */
/* -------------------------------------------------------------------------- */

function DesktopNavButton({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 h-8 px-3 rounded-xl transition-colors
        ${
          active
            ? "bg-[hsl(var(--accent))]/20 text-[hsl(var(--accent))] font-bold"
            : "text-[hsl(var(--gray-600))] hover:bg-[hsl(var(--gray-200))]"
        }
      `}
    >
      <span>{icon}</span>
      <span className="text-sm">{label}</span>
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* MOBILE NAV BAR                                                             */
/* -------------------------------------------------------------------------- */

function MobileBottomBar({
  activeField,
  activeWorkspace,
  activeDiscovery,
  navigate,
}) {
  return (
    <div
      className="
        md:hidden fixed bottom-0 inset-x-0 h-16
        bg-[hsl(var(--card))] border-t border-[hsl(var(--border))]
        flex items-center justify-around
      "
    >
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
        ${
          active
            ? "text-[hsl(var(--accent))] bg-[hsl(var(--accent))]/20"
            : "text-[hsl(var(--gray-600))]"
        }
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
