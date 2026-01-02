import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { usePostAuthRedirect } from "./usePostAuthRedirect";

import { Button } from "@/components/ui/actions/button";
import { Input } from "@/components/ui/forms/input";
import { Label } from "@/components/ui/forms/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/layout/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/navigation/tabs";

import fillerBackground from "@/assets/backgrounds/filler-bg-2.png";
import { z } from "zod";

/* -------------------------------------------------------------------------- */
/*  TYPES                                                                     */
/* -------------------------------------------------------------------------- */

type AuthTab = "login" | "signup";

type FieldKey = "fullName" | "email" | "password";

/* -------------------------------------------------------------------------- */
/*  PASSWORD SCHEMA                                                           */
/* -------------------------------------------------------------------------- */

const passwordSchema = z
  .string()
  .min(8)
  .regex(/[A-Z]/)
  .regex(/[a-z]/)
  .regex(/[0-9]/);

/* -------------------------------------------------------------------------- */
/*  FIELD DEFINITIONS                                                         */
/* -------------------------------------------------------------------------- */

const fieldDefs: Record<FieldKey, {
  label: string;
  type: string;
  placeholder: string;
}> = {
  fullName: {
    label: "Full Name",
    type: "text",
    placeholder: "Coach Name",
  },
  email: {
    label: "Email",
    type: "email",
    placeholder: "coach@school.com",
  },
  password: {
    label: "Password",
    type: "password",
    placeholder: "••••••••",
  },
};

/* -------------------------------------------------------------------------- */
/*  TAB DEFINITIONS                                                           */
/* -------------------------------------------------------------------------- */

const tabs: {
  key: AuthTab;
  label: string;
  fields: FieldKey[];
  submitText: string;
}[] = [
  {
    key: "login",
    label: "Log In",
    fields: ["email", "password"],
    submitText: "Continue to Account",
  },
  {
    key: "signup",
    label: "Sign Up",
    fields: ["fullName", "email", "password"],
    submitText: "Create Account",
  },
];

/* -------------------------------------------------------------------------- */
/*  COMPONENT                                                                */
/* -------------------------------------------------------------------------- */

export default function AuthForm() {
  const navigate = useNavigate();
  const location = useLocation();
  // REDIRECT
  const { user, loading: authLoading } = useAuth();
  const { redirectAfterAuth } = usePostAuthRedirect();
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      redirectAfterAuth();
    }
  }, [user, authLoading]);


  // FORGOT PASSWORD (RESET)
  const [resetSent, setResetSent] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [resetError, setResetError] = useState<string | null>(null)

  async function handleForgotPassword() {
    if (!values.email) {
      setResetError("Please enter your email address first.")
      return
    }

    setResetLoading(true)
    setResetSent(false)
    setResetError(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        values.email,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      )

      if (!error) setResetSent(true)
    } finally {
      setResetLoading(false)
    }
  }

  const routeTab: AuthTab = location.pathname.includes("signup")
    ? "signup"
    : "login";

  const [activeTab, setActiveTab] = useState<AuthTab>(routeTab);
  const [loading, setLoading] = useState(false);

  const [values, setValues] = useState<Record<FieldKey, string>>({
    fullName: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    setActiveTab(routeTab);
  }, [routeTab]);

  /* -------------------------------------------------------------------------- */
  /*  HANDLERS                                                                 */
  /* -------------------------------------------------------------------------- */

  function updateField(key: FieldKey, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        setAuthError(error.message);
        return;
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    if (!passwordSchema.safeParse(values.password).success) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: { full_name: values.fullName },
        },
      });

      if (error) throw error;

      if (data.user) {
        await supabase.from("profiles").insert([
          { id: data.user.id, full_name: values.fullName },
        ]);
      }
    } finally {
      setLoading(false);
    }
  }

  /* -------------------------------------------------------------------------- */
  /*  RENDER HELPERS                                                           */
  /* -------------------------------------------------------------------------- */

  function renderField(key: FieldKey) {
    const def = fieldDefs[key];

    return (
      <div key={key} className="flex flex-col gap-1 mt-3">
        <Label htmlFor={key} className="text-white">
          {def.label}
        </Label>
        <Input
          id={key}
          type={def.type}
          placeholder={def.placeholder}
          className="rounded-xl"
          value={values[key]}
          onChange={(e) => updateField(key, e.target.value)}
          required
        />
      </div>
    );
  }

  function renderForm(tab: AuthTab) {
    const config = tabs.find((t) => t.key === tab)!;
    const onSubmit = tab === "login" ? handleLogin : handleSignup;

    return (
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        {config.fields.map(renderField)}

        {tab === "login" && authError && (
          <div className="rounded-lg bg-red-500/20 border border-red-500/40 px-3 py-2">
            <p className="text-sm text-red-100">
              {authError === "Invalid login credentials"
                ? "Incorrect email or password"
                : authError}
            </p>
          </div>
        )}
        
        {tab === "login" && (
          <div className="flex flex-col items-end gap-1 mr-1">
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={resetLoading}
              className="
                text-sm text-white/80
                hover:text-white
                underline-offset-2 hover:underline
                transition
              "
            >
              {resetSent
                ? "Reset email sent"
                : resetLoading
                ? "Sending…"
                : "Forgot password?"}
            </button>

            {resetError && (
              <span className="text-xs text-red-200">
                {resetError}
              </span>
            )}
          </div>
        )}

        <Button
          variant="outline"
          type="submit"
          disabled={loading}
          className="w-full h-11 mb-4 py-4 rounded-xl text-xl font-semibold"
        >
          {loading ? "Processing…" : config.submitText}
        </Button>
      </form>
    );
  }

  /*  BACKGROUND */
  const showBg = location.pathname !== "/";

  return (
    <div
      className={`
        relative h-screen flex items-center justify-center
        ${showBg ? "bg-cover bg-center bg-no-repeat" : "bg-transparent"}
      `}
      style={
        showBg ? { backgroundImage: `url(${fillerBackground})` } : undefined
      }
    >
      {/* CARD */}
      <Card
        className="
          flex flex-col gap-2
          mx-2 w-full max-w-md 
          rounded-3xl border-none bg-white/30 backdrop-blur-xl hover:backdrop-blur-2xl
          shadow-2xl
          transition-all duration-500 overflow-hidden
        "
      >
        <div>
          <div className="mt-4 pb-4 text-center text-3xl font-bold tracking-tight text-white">
            Athlytics
          </div>
        </div>

        <div className="mx-4">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as AuthTab)}
            className="w-full"
          >
            <TabsList className="flex justify-around gap-2 p bg-white/30 rounded-lg">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.key}
                  value={tab.key}
                  className="
                    h-8 w-full
                    rounded-lg hover:bg-white/30 data-[state=active]:bg-[var(--dom-md)]
                    !text-[var(--text-dk)] data-[state=active]:!text-white
                    transition-all
                  "
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {tabs.map((tab) => (
              <TabsContent key={tab.key} value={tab.key}>
                {renderForm(tab.key)}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </Card>
    </div>
  );
}
