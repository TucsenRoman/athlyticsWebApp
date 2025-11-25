import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { toast } from "sonner";
import { z } from "zod";

/* -------------------------- Password Strength Schema -------------------------- */
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export default function AuthForm() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  /* -------------------------------------------------------------------------- */
  /*  DETERMINE TAB FROM ROUTE                                                  */
  /* -------------------------------------------------------------------------- */
  const routeTab = location.pathname.includes("signup") ? "signup" : "login";
  const [activeTab, setActiveTab] = useState(routeTab);

  useEffect(() => {
    if (activeTab !== routeTab) {
      navigate(`/${activeTab}`, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    if (routeTab !== activeTab) {
      setActiveTab(routeTab);
    }
  }, [routeTab]);

  /* -------------------------------------------------------------------------- */
  /*  LOGIN                                                                     */
  /* -------------------------------------------------------------------------- */
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success("Welcome back, Coach.");
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  /* -------------------------------------------------------------------------- */
  /*  SIGNUP                                                                    */
  /* -------------------------------------------------------------------------- */
  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const validation = passwordSchema.safeParse(password);
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: { full_name: fullName },
        },
      });

      if (error) throw error;

      const user = data.user;
      if (user) {
        await supabase.from("profiles").insert([
          { id: user.id, full_name: fullName },
        ]);
      }

      toast.success("Account created. Logging you in…");
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  /* -------------------------------------------------------------------------- */
  /*  BACKGROUND CONTROL                                                        */
  /* -------------------------------------------------------------------------- */
  const showBg = location.pathname !== "/";

  return (
    <div
      className={`
        relative min-h-screen flex items-center justify-center p-6
        ${showBg ? "bg-cover bg-center bg-no-repeat" : "bg-transparent"}
      `}
      style={
        showBg
          ? { backgroundImage: "url('/AthlyticsFillerBg5.png')" }
          : undefined
      }
    >
      {/* HOME BUTTON — HIDDEN ON "/" */}
      {location.pathname !== "/" && (
        <div className="absolute top-5 left-5">
          <button
            onClick={() => navigate("/")}
            className="
              px-4 py-2 rounded-lg
              bg-black/20 backdrop-blur-md
              text-white font-semibold
              hover:bg-white/20
              transition
              shadow-lg shadow-black/20
            "
          >
            Home
          </button>
        </div>
      )}

      {/* CARD */}
      <Card
        className="
          w-full max-w-md rounded-3xl overflow-hidden
          bg-white/35 dark:bg-neutral-900/40
          backdrop-blur-2xl
          shadow-xl shadow-black/30
          border border-white/40 dark:border-white/10
        "
      >
        <CardHeader className="pb-0">
          <CardTitle
            className="
              text-center text-3xl font-bold tracking-tight 
              text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.45)]
            "
          >
            Athlytics
          </CardTitle>
        </CardHeader>

        <CardContent className="mt-4">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as "login" | "signup")}
            className="w-full"
          >
            <TabsList
              className="
                grid grid-cols-2 
                bg-white/20 dark:bg-black/20 
                backdrop-blur-sm
                rounded-xl p-1
              "
            >
              <TabsTrigger value="login">Log In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            {/* LOGIN FORM */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-5 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white/95">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="coach@school.com"
                    className="rounded-xl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white/95">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="rounded-xl"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-xl text-lg font-semibold"
                >
                  {loading ? "Processing…" : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            {/* SIGNUP FORM */}
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-5 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-white/95">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Coach Name"
                    className="rounded-xl"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white/95">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="coach@school.com"
                    className="rounded-xl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white/95">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="rounded-xl"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-xl text-lg font-semibold"
                >
                  {loading ? "Processing…" : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
