import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, LogOut, FileSpreadsheet } from "lucide-react";
// import { toast } from "sonner";
import athlyticsLogo from "@/assets/athlytics-logo.png";
import ProgramSelector from "@/components/header/ProgramSelector";
import { useProgramContext } from "@/hooks/useProgramContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedProgramId, setSelectedProgramId } = useProgramContext();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
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
    // toast.success("Signed out successfully");
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card relative h-16">
        <div className="container mx-auto px-4 h-full flex items-center justify-between relative">
          {/* 🧭 Left Section */}
          <div className="flex items-center gap-2 z-10">
            {/* 📱 Mobile: logo stays left */}
            <button
              onClick={() => navigate("/")}
              className="
                flex items-center gap-2 
                hover:opacity-80 transition-opacity touch-manipulation
                md:hidden
              "
            >
              <img
                src={athlyticsLogo}
                alt='Athlytics Logo'
                className='w-8 h-8 md:w-10 md:h-10'
              />
            </button>

            {/* Program Selector — always visible */}
            <ProgramSelector
              selectedProgramId={selectedProgramId}
              onProgramChange={setSelectedProgramId}
            />
          </div>

          {/* 🎯 Center Section (desktop only) */}
          <button
            onClick={() => navigate("/")}
            className="
              hidden md:flex items-center gap-2 
              hover:opacity-80 transition-opacity touch-manipulation
              absolute left-1/2 -translate-x-1/2
            "
          >
            <img
              src={athlyticsLogo}
              alt='Athlytics Logo'
              className='w-8 h-8 md:w-10 md:h-10'
            />
            <h1 className='text-2xl font-bold'>Athlytics</h1>
          </button>

          {/* ⚙️ Right-side Buttons */}
          <div className="flex items-center gap-2 z-10">
            <Button
              variant="ghost"
              onClick={() =>
                navigate(location.pathname.includes("ledger") ? "/" : "/ledger")
              }
              size="sm"
              className="h-10 min-w-[44px] touch-manipulation"
            >
              {location.pathname.includes("ledger") ? (
                <>
                  <LayoutDashboard className="w-5 h-5 md:w-4 md:h-4 md:mr-2" />
                  <span className="hidden md:inline">Go To Dashboard</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-5 h-5 md:w-4 md:h-4 md:mr-2" />
                  <span className="hidden md:inline">Go To Ledgers</span>
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handleSignOut}
              size="sm"
              className="h-10 min-w-[44px] touch-manipulation"
            >
              <LogOut className="w-5 h-5 md:w-4 md:h-4 md:mr-2" />
              <span className="hidden md:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
