// src/pages/settings/security/SecuritySettingsPage.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

import { KeyRound, LogOut } from "lucide-react";

/* ========================================================================== */
/* PAGE                                                                       */
/* ========================================================================== */

export default function SecuritySettingsPage() {
  const { user } = useAuth();
  const [resetSent, setResetSent] = useState(false);
  const [cooldown, setCooldown] = useState<number | null>(null);

  async function handlePasswordReset() {
    if (!user?.email || cooldown !== null) return;

    await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setCooldown(60);
  }

  useEffect(() => {
    if (cooldown === null) return;

    if (cooldown === 0) {
      setCooldown(null);
      return;
    }

    const id = setTimeout(() => {
      setCooldown((c) => (c !== null ? c - 1 : null));
    }, 1000);

    return () => clearTimeout(id);
  }, [cooldown]);

  
  async function handleGlobalSignOut() {
    await supabase.auth.signOut({ scope: "global" });
  }

  return (
    <div className="space-y-8">
      <Header
        title="Security"
        description="Manage password access and active sessions."
      />

      <SectionLabel>Authentication</SectionLabel>
      <Card>
        <ActionRow
          icon={<KeyRound className="h-4 w-4" />}
          label="Change password"
          description={
            cooldown !== null
              ? `Reset email sent. You can resend in ${cooldown}s.`
              : "We’ll email you a secure link to reset your password."
          }
          actionLabel={cooldown !== null ? "Email sent. Check your inbox (and spam). Delivery may take several minute." : "Send reset email"}
          onAction={handlePasswordReset}
          disabled={cooldown !== null}
        />
      </Card>

      <SectionLabel>Sessions</SectionLabel>
      <Card>
        <div className="rounded-lg border border-[var(--danger)] bg-[var(--danger-bg)] p-4">
          <div className="text-sm font-medium text-[var(--danger)]">
            Sign out everywhere
          </div>
          <p className="text-sm text-[var(--text)] mt-1">
            Ends all active sessions across devices.
          </p>

          <button
            onClick={handleGlobalSignOut}
            className="
              mt-3 inline-flex items-center gap-2
              px-4 py-2 rounded-lg
              bg-[var(--danger)] text-white
              hover:opacity-90 transition-opacity
            "
          >
            <LogOut className="h-4 w-4" />
            Sign out all
          </button>
        </div>
      </Card>
    </div>
  );
}

/* ========================================================================== */
/* UI PRIMITIVES                                                              */
/* ========================================================================== */

function Header({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <header>
      <h1 className="text-lg font-semibold text-[var(--text-dark)]">
        {title}
      </h1>
      <p className="text-sm text-[var(--text)]">{description}</p>
    </header>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
      {children}
    </h2>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-5 shadow-sm">
      {children}
    </section>
  );
}

function ActionRow({
  icon,
  label,
  description,
  actionLabel,
  onAction,
  disabled = false,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-[var(--gray-ltt)] px-4 py-3">
      <div className="flex items-start gap-3">
        <span className="text-[var(--text)]">{icon}</span>
        <div>
          <div className="text-sm font-medium text-[var(--text-dark)]">
            {label}
          </div>
          <div className="text-sm text-[var(--text)]">
            {description}
          </div>
        </div>
      </div>

      <button
        onClick={onAction}
        disabled={disabled}
        className="
          shrink-0
          px-3 py-2 rounded-lg
          border border-[var(--border)]
          text-sm
          hover:bg-[var(--gray-200)]
          disabled:opacity-50
          disabled:cursor-not-allowed
        "
      >
        {actionLabel}
      </button>
    </div>
  );
}
