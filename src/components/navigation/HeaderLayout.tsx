// src/components/header/HeaderLayout.tsx

import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  MapPinned,
  Sparkles,
  PencilRuler,
  LayoutGrid,
} from "lucide-react";
import { motion } from "framer-motion";

import ProgramSelector from "@/components/program/ProgramSelector";
import { useProgramContext } from "@/hooks/useProgramContext";
import { EditModeContext } from "@/contexts/EditModeContext";
import Usermenu from "@/components/UserMenu";

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
      <div className="min-h-screen bg-background overflow-hidden flex flex-col">

        {/* ------------------------ HEADER (Mobile + Desktop) ------------------------ */}
        {!hideHeader && (
          <header className="border-b bg-secondary h-16 flex items-center px-3 justify-between">

            {/* LEFT — Logo + Program Selector */}
            <div className="flex items-center gap-3">

              {/* Logo — visible on all sizes unless you want sm:hidden */}
              <button
                onClick={() => navigate("/field")}
                className="hover:opacity-80 transition"
              >
                <img src="/AthlyticsLogo.png" className="w-[75px] h-[75px]" />
              </button>

              <ProgramSelector
                variant="header"
                selectedProgramId={selectedProgramId}
                onProgramChange={setSelectedProgramId}
              />
            </div>

            {/* RIGHT — Desktop Navigation + Usermenu */}
            <div className="hidden md:flex items-center gap-3">

              {/* Desktop nav pill */}
              <div className="flex bg-muted rounded-xl px-1 py-1 gap-1 items-center">
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
              </div>

              <Usermenu />
            </div>

            {/* Mobile Usermenu Only */}
            <div className="md:hidden">
              <Usermenu />
            </div>

          </header>
        )}

        {/* ----------------------------- PAGE CONTENT ----------------------------- */}
        <main className="flex-1 overflow-hidden">
          {children}
        </main>

        {/* ----------------------------- MOBILE BOTTOM BAR ----------------------------- */}
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
/* Desktop Nav Button                                                         */
/* -------------------------------------------------------------------------- */

function DesktopNavButton({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 h-8 rounded-xl px-3
        transition-colors
        ${active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted/30"
        }
      `}
    >
      <span>{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* MOBILE BOTTOM NAV BAR + CENTER FAB                                         */
/* -------------------------------------------------------------------------- */

function MobileBottomBar({
  activeField,
  activeWorkspace,
  activeDiscovery,
  navigate,
}: any) {
  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 h-16 bg-secondary border-t flex items-center justify-around px-6">

      {/* Field */}
      <MobileNavIcon
        icon={<MapPinned className="w-6 h-6" />}
        active={activeField}
        onClick={() => navigate("/field")}
      />

      {/* Workspace */}
      <MobileNavIcon
        icon={<PencilRuler className="w-6 h-6" />}
        active={activeWorkspace}
        onClick={() => navigate("/workspace")}
      />

      {/* Discovery */}
      <MobileNavIcon
        icon={<Sparkles className="w-6 h-6" />}
        active={activeDiscovery}
        onClick={() => navigate("/discovery")}
      />

      {/* Overflow/Menu (optional) */}

    </div>
  );
}

function MobileNavIcon({ icon, active, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.85 }}
      animate={active ? { scale: 1.25 } : { scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className={`
        flex flex-col items-center justify-center p-2 rounded-full
        ${active ? "text-primary bg-primary/20" : "text-muted-foreground"}
      `}
    >
      <motion.div
        animate={active ? { rotate: 0, opacity: 1 } : { opacity: 0.75 }}
        transition={{ duration: 0.15 }}
      >
        {icon}
      </motion.div>
    </motion.button>
  );
}
