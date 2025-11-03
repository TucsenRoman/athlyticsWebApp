import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
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
  const holdDuration = 2000; // 2 seconds
  const holdTimeout = useRef<NodeJS.Timeout | null>(null);
  const holdInterval = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  const { selectedProgramId, setSelectedProgramId } = useProgramContext();

  // --- Hold-to-unlock logic ---
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
    }, holdDuration);
  };

  const handleHoldEnd = () => {
    if (holdTimeout.current) clearTimeout(holdTimeout.current);
    if (holdInterval.current) clearInterval(holdInterval.current);
    setHoldProgress(0);
  };

  // --- Supabase Auth handling ---
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
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

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

            {/* ⚙️ Right-side Buttons */}
            <div className="flex items-center gap-2 z-10">
              {/* 🔒 Hold-to-Unlock Button */}
              <div
                className="relative h-10 w-10 flex items-center justify-center rounded-xl overflow-hidden cursor-pointer"
                onMouseDown={handleHoldStart}
                onMouseUp={handleHoldEnd}
                onMouseLeave={handleHoldEnd}
                onTouchStart={handleHoldStart}
                onTouchEnd={handleHoldEnd}
              >
                {/* --- Base background --- */}
                <div
                  className={`absolute inset-0 rounded-xl transition-colors duration-300 ${
                    isEditMode ? "bg-green-600" : "bg-red-600"
                  }`}
                />

                {/* --- Transparent sweep overlay --- */}
               {!isEditMode && (
  <motion.div
    className="absolute inset-0 rounded-xl"
    style={{
      background: `conic-gradient(
        from -90deg,
        rgba(255, 255, 255, 1) 0deg,                            /* pivot color (bright orange/red) */
        rgba(248, 45, 45, 1) ${holdProgress * 3.6 - 2}deg,    /* keep solid up to this angle */
        transparent ${holdProgress * 3.6}deg,               /* hard transition to transparent */
        transparent 360deg
      )`,
    }}
    transition={{ duration: 0.05, ease: "linear" }}
  />
)}

                {/* --- Icons --- */}
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

            </div>
          </div>
        </header>

        {/* Pass edit-mode state to pages */}
        <main className="container mx-auto px-4 py-8">
          {children &&
            (typeof children === "function"
              ? children({ isEditMode })
              : children)}
        </main>
      </div>
    </EditModeContext.Provider>
  );
}
