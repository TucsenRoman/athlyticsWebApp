import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Lock, Unlock, LogOut } from "lucide-react";
import ProgramSelector from "@/components/header/ProgramSelector";
import { useProgramContext } from "@/hooks/useProgramContext";
import { EditModeContext } from "@/contexts/EditModeContext";
import { motion, AnimatePresence } from "framer-motion";

interface DashboardLayoutProps {
  children:
    | React.ReactNode
    | ((props: { isEditMode: boolean }) => React.ReactNode);
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [showPopup, setShowPopup] = useState(false);

  const holdDuration = 500; // ms to unlock (0.5s)
  const holdTimeout = useRef<NodeJS.Timeout | null>(null);
  const holdInterval = useRef<NodeJS.Timeout | null>(null);
  const popupTimeout = useRef<NodeJS.Timeout | null>(null);

  const navigate = useNavigate();
  const { selectedProgramId, setSelectedProgramId } = useProgramContext();

  // 🧠 Hold-to-Unlock Logic
  const handleHoldStart = () => {
    // If already unlocked, a tap should just re-lock immediately (no popup)
    if (isEditMode) {
      setIsEditMode(false);
      return;
    }

    let progress = 0;
    setHoldProgress(0);

    // Start increasing hold progress
    holdInterval.current = setInterval(() => {
      progress += 100 / (holdDuration / 50);
      setHoldProgress(progress);
    }, 50);

    // Finish unlock after holdDuration
    holdTimeout.current = setTimeout(() => {
      clearInterval(holdInterval.current!);
      setHoldProgress(100);
      setIsEditMode(true);
      if (navigator.vibrate) navigator.vibrate(60);
      // mark as successful hold
      holdTimeout.current = null;
    }, holdDuration);
  };

  const handleHoldEnd = () => {
    // If we ended early (no completed hold) AND we were locked
    const wasLockedBefore = !isEditMode;
    const holdDidNotFinish = holdTimeout.current !== null;

    // Stop all timers
    if (holdTimeout.current) {
      clearTimeout(holdTimeout.current);
      holdTimeout.current = null;
    }
    if (holdInterval.current) {
      clearInterval(holdInterval.current);
      holdInterval.current = null;
    }

    // ✅ Show popup ONLY if user *tapped while locked*
    if (wasLockedBefore && holdDidNotFinish) {
      setShowPopup(true);
      if (popupTimeout.current) clearTimeout(popupTimeout.current);
      popupTimeout.current = setTimeout(() => setShowPopup(false), 2000);
    }

    setHoldProgress(0);
  };

  // Supabase Auth handling
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  // -------------------------------
  // 🌀 Loading Screen
  // -------------------------------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  // -------------------------------
  // 🧩 Layout
  // -------------------------------
  return (
    <EditModeContext.Provider value={{ isEditMode, setIsEditMode }}>
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card relative h-16">
          <div className="container mx-auto px-4 h-full flex items-center justify-between relative">
            {/* 🧭 Left Section */}
            <div className="flex items-center gap-2 z-10">
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity touch-manipulation md:hidden"
              >
                <img
                  src="/android-chrome-512x512.png"
                  alt="Athlytics Logo"
                  className="w-8 h-8 md:w-10 md:h-10"
                />
              </button>

              <ProgramSelector
                selectedProgramId={selectedProgramId}
                onProgramChange={setSelectedProgramId}
              />
            </div>

            {/* 🎯 Center Section */}
            <button
              onClick={() => navigate("/")}
              className="hidden md:flex items-center gap-2 hover:opacity-80 transition-opacity absolute left-1/2 -translate-x-1/2"
            >
              <img
                src="/android-chrome-512x512.png"
                alt="Athlytics Logo"
                className="w-8 h-8 md:w-10 md:h-10"
              />
              <h1 className="text-2xl font-bold">Athlytics</h1>
            </button>

            {/* ⚙️ Right Section */}
            <div className="flex items-center gap-2 z-10 relative">
              {/* 🔒 Hold-to-Unlock Button */}
              <div
                className="relative h-10 w-10 flex items-center justify-center rounded-xl overflow-hidden cursor-pointer select-none"
                onMouseDown={handleHoldStart}
                onMouseUp={handleHoldEnd}
                onMouseLeave={handleHoldEnd}
                onTouchStart={handleHoldStart}
                onTouchEnd={handleHoldEnd}
              >
                {/* Base background */}
                <div
                  className={`absolute inset-0 rounded-xl transition-colors duration-300 ${
                    isEditMode ? "bg-green-600" : "bg-[rgb(248,114,45)]"
                  }`}
                />

                {/* Progress overlay */}
                {!isEditMode && (
                  <motion.div
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: `conic-gradient(
                        from -90deg,
                        rgba(255,255,255,0.9) 0deg,
                        rgba(255,255,255,0) ${holdProgress * 3.6}deg
                      )`,
                    }}
                    transition={{ duration: 0.05, ease: "linear" }}
                  />
                )}

                {/* Icon transition */}
                <AnimatePresence mode="wait" initial={false}>
                  {isEditMode ? (
                    <motion.div
                      key="unlock"
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.6, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="text-white z-10"
                    >
                      <Unlock className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="lock"
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.6, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="text-white z-10"
                    >
                      <Lock className="w-5 h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 💬 Tap Popup (shifted left, square style) */}
              <AnimatePresence>
                {showPopup && !isEditMode && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.25 }}
                    className="absolute top-full right-0 mt-1 px-2 py-1 bg-black/90 text-white text-xs rounded-sm shadow-md whitespace-nowrap"
                    style={{
                      transform: "translateX(-60%)", // moves it further left
                    }}
                  >
                    Press and hold to unlock
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 🚪 Sign Out */}
              <button
                onClick={handleSignOut}
                className="h-10 w-10 flex items-center justify-center rounded-xl bg-muted hover:bg-muted/70 transition"
                title="Sign out"
              >
                <LogOut className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>
        </header>

        {/* 🧱 Page Content */}
        <main className="flex-1 w-full h-[calc(100vh-4rem)] overflow-hidden bg-background">
          {typeof children === "function" ? children({ isEditMode }) : children}
        </main>
      </div>
    </EditModeContext.Provider>
  );
}
