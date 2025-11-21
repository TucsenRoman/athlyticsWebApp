// src/components/header/HeaderLayout.tsx

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

import { User2, LayoutDashboard, ClipboardList } from "lucide-react";

import ProgramSelector from "@/components/program/ProgramSelector";
import { useProgramContext } from "@/hooks/useProgramContext";
import { EditModeContext } from "@/contexts/EditModeContext";
import UserDropdownShell from "@/components/UserMenu"

interface HeaderLayoutProps {
  children: React.ReactNode;
}

export default function HeaderLayout({ children }: HeaderLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const hideHeader = location.pathname.startsWith("/ledgers/");

  /* -------------------------------------------------------------------------- */
  /* AUTH                                                                       */
  /* -------------------------------------------------------------------------- */
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [loading, user, navigate]);

  /* -------------------------------------------------------------------------- */
  /* PROGRAM CONTEXT (just ID)                                                  */
  /* -------------------------------------------------------------------------- */
  const { selectedProgramId, setSelectedProgramId } = useProgramContext();

  /* -------------------------------------------------------------------------- */
  /* EDIT MODE (Header controls only)                                           */
  /* -------------------------------------------------------------------------- */
  const [isEditMode, setIsEditMode] = useState(false);

  /* -------------------------------------------------------------------------- */
  /* FIELDVIEW ↔ LEDGER ROUTING                                                 */
  /* -------------------------------------------------------------------------- */
  const onLedger = location.pathname.startsWith("/ledger");
  const toggleView = () => navigate(onLedger ? "/" : "/ledger");

  /* -------------------------------------------------------------------------- */
  /* LOGOUT                                                                     */
  /* -------------------------------------------------------------------------- */
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  /* -------------------------------------------------------------------------- */
  /* RENDER                                                                      */
  /* -------------------------------------------------------------------------- */

  return (
    <EditModeContext.Provider value={{ isEditMode, setIsEditMode }}>
      <div className="min-h-screen bg-background overflow-hidden">

        {/* HEADER */}
        {!hideHeader && user && (
          <header className="border-b bg-card/90 backdrop-blur-md h-16 flex items-center">
            <div className="container mx-auto px-4 w-full flex items-center justify-between relative">

              {/* LEFT — Logo + Program Selector */}
              <div className="flex items-center gap-3">

                {/* Mobile Logo */}
                <button
                  onClick={() => navigate("/")}
                  className="flex md:hidden items-center hover:opacity-80 transition"
                >
                  <img src="/StopWatchLogo.png" className="w-8 h-8" />
                </button>

                {/* Program Selector */}
                <div className="h-12 flex items-center">
                  <ProgramSelector
                    variant="header"
                    selectedProgramId={selectedProgramId}
                    onProgramChange={setSelectedProgramId}
                  />
                </div>
              </div>

              {/* CENTER — Desktop Logo */}
              <button
                onClick={() => navigate("/")}
                className="hidden md:flex items-center gap-2 absolute left-1/2 -translate-x-1/2 hover:opacity-80 transition"
              >
                <img src="/StopWatchLogo.png" className="w-9 h-9" />
                <h1 className="text-xl font-bold">Athlytics</h1>
              </button>

              {/* RIGHT — Toggle + User Menu */}
              <div className="flex items-center gap-2">

                {/* Toggle View */}
                <button
                  onClick={toggleView}
                  className="h-10 w-10 flex items-center justify-center rounded-xl bg-muted hover:bg-muted/70 transition"
                >
                  {onLedger ? (
                    <LayoutDashboard className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ClipboardList className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>

                {/* User Menu */}
                <UserDropdownShell onSignOut={handleSignOut} />
              </div>
            </div>
          </header>
        )}

        {/* PAGE CONTENT */}
        <main className="flex-1 h-[calc(100vh-4rem)] overflow-hidden">
          {loading ? null : children}
        </main>
      </div>
    </EditModeContext.Provider>
  );
}
