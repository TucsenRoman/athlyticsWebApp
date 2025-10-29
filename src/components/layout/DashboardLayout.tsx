import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import athlyticsLogo from "@/assets/athlytics-logo.png";
interface DashboardLayoutProps {
  children: React.ReactNode;
}
export default function DashboardLayout({
  children
}: DashboardLayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [headerVisible, setHeaderVisible] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const lastScrollY = useRef(0);
  const scrollThreshold = 10;
  useEffect(() => {
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });
    supabase.auth.getSession().then(({
      data: {
        session
      }
    }) => {
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
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (Math.abs(currentScrollY - lastScrollY.current) < scrollThreshold) {
        return;
      }
      if (currentScrollY < lastScrollY.current || currentScrollY < 100) {
        setHeaderVisible(true);
      } else {
        setHeaderVisible(false);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, {
      passive: true
    });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/auth");
  };
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>;
  }
  if (!user) {
    return null;
  }
  return <div className="min-h-screen bg-background">
      <header className={cn("fixed top-0 left-0 right-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 transition-transform duration-300", headerVisible ? "translate-y-0" : "-translate-y-full")}>
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate("/")} className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity touch-manipulation">
              <img src={athlyticsLogo} alt="Athlytics Logo" className="w-8 h-8 md:w-10 md:h-10" />
              <div className="text-left">
                <h1 className="text-lg md:text-xl font-bold">Athlytics </h1>
                <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">
                  {user.email}
                </p>
              </div>
            </button>
            <Button variant="outline" onClick={handleSignOut} size="sm" className="md:h-10 touch-manipulation">
              <LogOut className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>
      <div className="h-[60px] md:h-[76px]" />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>;
}