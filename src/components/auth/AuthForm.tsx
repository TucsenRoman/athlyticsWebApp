import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Trophy } from "lucide-react";
import { z } from "zod";

/* -------------------------- Password Strength Schema -------------------------- */
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  /* ------------------------------ Submit Handler ------------------------------ */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!isLogin) {
        const validation = passwordSchema.safeParse(password);
        if (!validation.success) {
          toast.error(validation.error.errors[0].message);
          setLoading(false);
          return;
        }
      }

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        toast.success("Welcome back, Coach.");
        navigate("/");
      } else {
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
            { id: user.id, full_name: fullName }
          ]);
        }

        toast.success("Account created. Logging you in…");
        navigate("/");
      }
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------------------------------------------------- */
  /*  UI (ATHLYTICS STYLE)                                                      */
  /* -------------------------------------------------------------------------- */

  return (
    <div
      className="
        relative min-h-screen flex items-center justify-center p-6
        bg-cover bg-center bg-no-repeat
      "
      style={{
        backgroundImage: "url('public/AthlyticsFillerBg5.png')",
      }}
    >
      <Card
        className="
          w-full max-w-md rounded-3xl overflow-hidden

          /* translucent glass */
          bg-white/35 dark:bg-neutral-900/40
          backdrop-blur-2xl

          /* separation */
          shadow-xl shadow-black/30
          shadow-inner shadow-black/10

          border border-white/40 dark:border-white/10
        "
      >
        <CardHeader className="space-y-6">
          {/* Title */}
        <CardTitle className="
          text-center text-3xl font-bold tracking-tight 
          text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.45)]
        ">
            {isLogin ? "Welcome Back" : "Create Your Account"}
          </CardTitle>

          {/* Subtitle */}
          <CardDescription className="
            text-center 
            text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]
          ">
            {isLogin ? "Sign in to your coaching dashboard" : "Start building your program"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-white/95 drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]">Full Name</Label>
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
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/95 drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]">Email</Label>
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
              <Label htmlFor="password" className="text-white/95 drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]">Password</Label>
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

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="
                w-full h-11 rounded-xl text-lg font-semibold
                bg-[hsl(var(--primary))]
                hover:bg-primary/30
                transition-all
              "
            >
              {loading ? "Processing…" : isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>

          {/* Toggle */}
          <div className="mt-4 text-center text-sm">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-neutral-800 hover:underline"
            >
              {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
