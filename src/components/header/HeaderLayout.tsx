import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";

import { Lock, Unlock, User2, LayoutDashboard, ClipboardList } from "lucide-react";

import ProgramSelector from "@/components/header/ProgramSelector";
import { useProgramContext } from "@/hooks/useProgramContext";
import { EditModeContext } from "@/contexts/EditModeContext";

import { AnimatePresence, motion } from "framer-motion";

interface HeaderLayoutProps {
  children: React.ReactNode;
}

export default function HeaderLayout({ children }: HeaderLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const hideHeader = location.pathname.startsWith("/ledgers/");

  /* -------------------------------------------------------------------------- */
  /*                                AUTH STATE                                  */
  /* -------------------------------------------------------------------------- */

  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const { selectedProgramId, setSelectedProgramId } = useProgramContext();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [loading, user, navigate]);

  /* -------------------------------------------------------------------------- */
  /*                                 EDIT MODE                                  */
  /* -------------------------------------------------------------------------- */

  const [isEditMode, setIsEditMode] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [showPopup, setShowPopup] = useState(false);

  const holdDuration = 500;

  const holdTimeout = useRef<NodeJS.Timeout | null>(null);
  const holdInterval = useRef<NodeJS.Timeout | null>(null);
  const popupTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleHoldStart = () => {
    if (isEditMode) {
      setIsEditMode(false);
      return;
    }

    let progress = 0;
    setHoldProgress(0);

    holdInterval.current = setInterval(() => {
      progress += 100 / (holdDuration / 50);
      setHoldProgress(progress);
    }, 50);

    holdTimeout.current = setTimeout(() => {
      clearInterval(holdInterval.current!);
      setHoldProgress(100);
      setIsEditMode(true);
      if (navigator.vibrate) navigator.vibrate(60);
      holdTimeout.current = null;
    }, holdDuration);
  };

  const handleHoldEnd = () => {
    const unfinished = holdTimeout.current !== null;

    if (holdTimeout.current) clearTimeout(holdTimeout.current);
    if (holdInterval.current) clearInterval(holdInterval.current);

    holdTimeout.current = null;
    holdInterval.current = null;

    if (!isEditMode && unfinished) {
      setShowPopup(true);
      if (popupTimeout.current) clearTimeout(popupTimeout.current);
      popupTimeout.current = setTimeout(() => setShowPopup(false), 2000);
    }

    setHoldProgress(0);
  };

  /* -------------------------------------------------------------------------- */
  /*                           FIELDVIEW ↔ LEDGER TOGGLE                        */
  /* -------------------------------------------------------------------------- */

  const onLedger = location.pathname.startsWith("/ledger");

  const toggleView = () => {
    navigate(onLedger ? "/" : "/ledger");
  };

  /* -------------------------------------------------------------------------- */
  /*                                    LOGOUT                                  */
  /* -------------------------------------------------------------------------- */

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  /* -------------------------------------------------------------------------- */
  /*                                    RENDER                                  */
  /* -------------------------------------------------------------------------- */

  return (
    <EditModeContext.Provider value={{ isEditMode, setIsEditMode }}>
      <div className="min-h-screen bg-background overflow-hidden">

        {/* HEADER (only hides visually, not logically) */}
        {!hideHeader && user && (
          <header className="border-b bg-card/90 backdrop-blur-md h-16 flex items-center">
            <div className="container mx-auto px-4 w-full flex items-center justify-between relative">

              {/* ----- LEFT: LOGO + PROGRAM SELECTOR ----- */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/")}
                  className="flex md:hidden items-center hover:opacity-80 transition"
                >
                  <img src="/android-chrome-512x512.png" className="w-8 h-8" />
                </button>

                <ProgramSelector
                  selectedProgramId={selectedProgramId}
                  onProgramChange={setSelectedProgramId}
                />
              </div>

              {/* ----- CENTER: DESKTOP LOGO ----- */}
              <button
                onClick={() => navigate("/")}
                className="hidden md:flex items-center gap-2 absolute left-1/2 -translate-x-1/2 hover:opacity-80 transition"
              >
                <img src="/android-chrome-512x512.png" className="w-9 h-9" />
                <h1 className="text-xl font-bold">Athlytics</h1>
              </button>

              {/* ----- RIGHT: TOGGLE + EDIT-MODE + LOGOUT ----- */}
              <div className="flex items-center gap-2 relative">

                {/* SWITCH BUTTON */}
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

                {/* HOLD-TO-UNLOCK */}
                {/* <div
                  className="relative h-10 w-10 flex items-center justify-center rounded-xl overflow-hidden cursor-pointer select-none"
                  onMouseDown={handleHoldStart}
                  onMouseUp={handleHoldEnd}
                  onMouseLeave={handleHoldEnd}
                  onTouchStart={handleHoldStart}
                  onTouchEnd={handleHoldEnd}
                >
                  <div
                    className={`absolute inset-0 ${
                      isEditMode ? "bg-green-600" : "bg-[rgb(248,114,45)]"
                    }`}
                  />

                  {!isEditMode && (
                    <motion.div
                      className="absolute inset-0"
                      style={{
                        background: `conic-gradient(
                          from -90deg,
                          rgba(255,255,255,0.9) 0deg,
                          rgba(255,255,255,0) ${holdProgress * 3.6}deg
                        )`,
                      }}
                    />
                  )}

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={isEditMode ? "unlock" : "lock"}
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.6, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="text-white z-10"
                    >
                      {isEditMode ? <Unlock /> : <Lock />}
                    </motion.div>
                  </AnimatePresence>
                </div>

                <AnimatePresence>
                  {showPopup && !isEditMode && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.25 }}
                      className="absolute top-full right-0 mt-1 px-2 py-1 bg-black/90 text-white text-xs rounded-sm shadow-md whitespace-nowrap"
                      style={{ transform: "translateX(-50%)" }}
                    >
                      Press & hold to unlock
                    </motion.div>
                  )}
                </AnimatePresence> */}

                {/* SIGN OUT */}
                <button
                  onClick={handleSignOut}
                  className="h-10 w-10 flex items-center justify-center rounded-xl bg-muted hover:bg-muted/70 transition"
                >
                  <User2 className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>
          </header>
        )}

        {/* ----- PAGE CONTENT ----- */}
        <main className="flex-1 h-[calc(100vh-4rem)] overflow-hidden">
          {loading ? null : children}
        </main>
      </div>
    </EditModeContext.Provider>
  );
}
