import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { LogOut, BookOpen } from "lucide-react";
import { toast } from "sonner";
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
    toast.success("Signed out successfully");
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
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-3 md:py-4">
          {/* Desktop Layout */}
          <div className="hidden md:flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 md:gap-4">
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <img
                  src={athlyticsLogo}
                  alt="Athlytics Logo"
                  className="w-10 h-10"
                />
                <h1 className="text-xl font-bold">Athlytics</h1>
              </button>
              
              <div className="h-8 w-px bg-border" />
              
              <ProgramSelector 
                selectedProgramId={selectedProgramId}
                onProgramChange={setSelectedProgramId}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => navigate("/ledger")}
                size="sm"
                className="h-10"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                <span>Ledger</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={handleSignOut}
                size="sm"
                className="h-10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>

          {/* Mobile Layout - Stacked */}
          <div className="md:hidden space-y-3">
            {/* Top Row: Logo + Action Buttons */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity touch-manipulation min-h-[48px]"
              >
                <img
                  src={athlyticsLogo}
                  alt="Athlytics Logo"
                  className="w-8 h-8"
                />
                <h1 className="text-lg font-bold">Athlytics</h1>
              </button>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => navigate("/ledger")}
                  size="sm"
                  className="min-h-[44px] min-w-[44px] touch-manipulation"
                >
                  <BookOpen className="w-5 h-5" />
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  size="sm"
                  className="min-h-[44px] min-w-[44px] touch-manipulation"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Bottom Row: Program Selector - Full Width */}
            <div className="w-full">
              <ProgramSelector 
                selectedProgramId={selectedProgramId}
                onProgramChange={setSelectedProgramId}
              />
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
