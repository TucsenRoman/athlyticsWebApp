// src/pages/settings/security/SecuritySettingsPage.tsx
"use client"

import * as React from "react"
import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { KeyRound, LogOut } from "lucide-react"

/* ========================================================================== */
/* PAGE                                                                       */
/* ========================================================================== */

export default function SecuritySettingsPage() {
  const { user } = useAuth()
  const [cooldown, setCooldown] = useState<number | null>(null)
  const [sending, setSending] = useState(false)

  async function handlePasswordReset() {
    if (!user?.email || cooldown !== null || sending) return

    setSending(true)
    try {
      await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      setCooldown(60)
    } finally {
      setSending(false)
    }
  }

  useEffect(() => {
    if (cooldown === null) return
    if (cooldown === 0) {
      setCooldown(null)
      return
    }

    const id = setTimeout(() => {
      setCooldown((c) => (c !== null ? c - 1 : null))
    }, 1000)

    return () => clearTimeout(id)
  }, [cooldown])

  async function handleGlobalSignOut() {
    await supabase.auth.signOut({ scope: "global" })
  }

  const resetDescription = useMemo(() => {
    if (cooldown !== null) return `Reset email sent. You can resend in ${cooldown}s.`
    return "We’ll email you a secure link to reset your password."
  }, [cooldown])

  const resetActionLabel = useMemo(() => {
    if (cooldown !== null) return `Resend in ${cooldown}s`
    return sending ? "Sending…" : "Send reset email"
  }, [cooldown, sending])

  return (
    <div className="mx-auto max-w-3xl px-5 py-6 space-y-10">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold text-[var(--gray-4)]">Security</h1>
        <p className="text-sm text-[var(--gray-12)]">
          Manage password access and active sessions.
        </p>
      </header>

      <div className="space-y-3">
        <SectionLabel>Authentication</SectionLabel>

        <div>
          <ActionRow
            icon={<KeyRound className="h-4 w-4" />}
            label="Change password"
            description={resetDescription}
            actionLabel={resetActionLabel}
            onAction={handlePasswordReset}
            disabled={cooldown !== null || sending}
          />
        </div>
      </div>

      <div className="space-y-3">
        <SectionLabel>Sessions</SectionLabel>

        <div>
          <DangerBlock
            title="Sign out everywhere"
            description="Ends all active sessions across devices."
            actionLabel="Sign out all"
            onAction={handleGlobalSignOut}
          />
        </div>
      </div>
    </div>
  )
}

/* ========================================================================== */
/* UI PRIMITIVES                                                              */
/* ========================================================================== */

function SectionLabel({ children }: { children: string }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--gray-13)]">
      {children}
    </h2>
  )
}

function ActionRow({
  icon,
  label,
  description,
  actionLabel,
  onAction,
  disabled = false,
}: {
  icon: React.ReactNode
  label: string
  description: string
  actionLabel: string
  onAction: () => void
  disabled?: boolean
}) {
  return (
    <div
      className="
        flex items-center justify-between gap-4
        rounded-2xl
        border border-[var(--gray-18)]
        bg-gradient-to-br from-[var(--gray-18)] to-transparent
        px-4 py-3
      "
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-[var(--text-lt)]">
            {label}
          </div>
          <div className="text-sm text-[var(--text)] mt-0.5">
            {description}
          </div>
        </div>
      </div>

      <button
        onClick={onAction}
        disabled={disabled}
        className="
          shrink-0
          inline-flex items-center gap-2 justify-center
          px-4 py-2
          text-ellipsis overflow-hidden whitespace-nowrap
          rounded-xl border border-[var(--gray-17)] hover:border-transparent
          hover:bg-[var(--gray-17)]
          text-sm font-semibold text-[var(--text)] hover:text-[var(--text-lt)]
          transition-all duration-300
          disabled:opacity-50 disabled:cursor-not-allowed
        "
        title={actionLabel}
      >
        {actionLabel}
      </button>
    </div>
  )
}

function DangerBlock({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string
  description: string
  actionLabel: string
  onAction: () => void
}) {
  return (
    <div
      className="
        flex justify-between items-center
        rounded-2xl
        border border-[var(--gray-18)]
        bg-gradient-to-br from-[var(--gray-18)] to-transparent
        px-4 py-4
      "
    >
      <div className="flex flex-col">
        <div className="text-sm font-semibold text-[var(--text-lt)]">{title}</div>
        <p className="text-sm text-[var(--text)] mt-1">{description}</p>
      </div>
      

      <button
        onClick={onAction}
        className="
          inline-flex items-center gap-2
          px-4 py-2
          rounded-xl border border-[var(--warning-bg)] hover:border-transparent
          hover:bg-[var(--warning-bg)]
          text-sm font-semibold text-[var(--warning)] hover:text-[var(--warning)]
          transition-all duration-300
        "
      >
        <LogOut className="h-4 w-4" />
        {actionLabel}
      </button>
    </div>
  )
}
