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
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)

  async function handlePasswordReset() {
    if (!user?.email || cooldown !== null || sending) return

    setSending(true)
    setError(null)
    setOk(null)

    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (err) throw err

      setOk("Reset email sent.")
      setCooldown(60)
    } catch (e: any) {
      setError(e?.message ?? "Failed to send reset email.")
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
    setError(null)
    setOk(null)
    try {
      const { error: err } = await supabase.auth.signOut({ scope: "global" })
      if (err) throw err
      setOk("Signed out everywhere.")
    } catch (e: any) {
      setError(e?.message ?? "Failed to sign out everywhere.")
    }
  }

  const resetDescription = useMemo(() => {
    if (!user?.email) return "No email found for this account."
    if (cooldown !== null) return `Reset email sent. You can resend in ${cooldown}s.`
    return "We’ll email you a secure link to reset your password."
  }, [cooldown, user?.email])

  const resetActionLabel = useMemo(() => {
    if (cooldown !== null) return `Resend in ${cooldown}s`
    return sending ? "Sending…" : "Send reset email"
  }, [cooldown, sending])

  const resetDisabled = !user?.email || cooldown !== null || sending

  return (
    <div className="flex flex-col gap-6 w-full max-w-none px-5 py-6">
      {/* ================= PAGE HEADER ================= */}
      <div className="flex items-start gap-4 min-w-0">
        <div className="flex flex-col">
          <div className="text-xl font-semibold text-[var(--text-lt)]">
            Security
          </div>
          <div className="text-xs text-[var(--text-dk)]">
            Manage password access and active sessions.
          </div>
        </div>
      </div>

      {/* ================= SINGLE CARD (matches FeedbackPage) ================= */}
      <div
        className="
          flex flex-col gap-6
          p-3 w-full max-w-none h-fit
          rounded-2xl border border-[var(--gray-18)]
          bg-gradient-to-br from-[var(--gray-18)] to-transparent
        "
      >
        {/* Authentication */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="text-lg font-medium tracking-wide text-[var(--text-lt)]">
              Authentication
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--gray-18)] bg-[var(--gray-19)] px-4 py-3">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div className="text-[var(--text)] opacity-90">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <div className="text-sm font-semibold text-[var(--text-lt)]">
                    Change password
                  </div>
                </div>

                <div className="mt-1 text-sm text-[var(--text)]">
                  {resetDescription}
                </div>
              </div>

              <button
                onClick={handlePasswordReset}
                disabled={resetDisabled}
                className={`
                  shrink-0
                  inline-flex items-center gap-2 justify-center
                  px-5 py-3
                  rounded-2xl
                  border
                  text-sm font-semibold
                  transition-all duration-300
                  ${
                    resetDisabled
                      ? "border-[var(--gray-18)] bg-[var(--gray-19)] text-[var(--gray-12)] cursor-not-allowed"
                      : "border-[var(--gray-17)] hover:border-transparent hover:bg-[var(--gray-17)] text-[var(--text)] hover:text-[var(--text-lt)]"
                  }
                `}
                title={resetActionLabel}
              >
                {resetActionLabel}
              </button>
            </div>
          </div>
        </div>

        {/* Sessions */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="text-lg font-medium tracking-wide text-[var(--text-lt)]">
              Sessions
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--gray-18)] bg-[var(--gray-19)] px-4 py-3">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-[var(--text-lt)]">
                  Sign out everywhere
                </div>
                <div className="mt-1 text-sm text-[var(--text)]">
                  Ends all active sessions across devices.
                </div>
              </div>

              <button
                onClick={handleGlobalSignOut}
                className="
                  shrink-0
                  inline-flex items-center gap-2 justify-center
                  px-5 py-3
                  rounded-2xl
                  border border-[var(--warning-bg)]
                  text-sm font-semibold
                  transition-all duration-300
                  hover:border-transparent hover:bg-[var(--warning-bg)]
                  text-[var(--warning)] hover:text-[var(--warning)]
                "
                title="Sign out all"
              >
                <LogOut className="h-4 w-4 opacity-90" />
                Sign out all
              </button>
            </div>
          </div>
        </div>

        {/* Status (matches FeedbackPage style: inline line) */}
        {error ? (
          <div className="text-xs text-red-400">{error}</div>
        ) : ok ? (
          <div className="text-xs text-[var(--success)]">{ok}</div>
        ) : null}
      </div>

      {/* ================= FOOT NOTE ================= */}
      <div className="text-sm text-[var(--gray-12)]">
        If you didn’t request a reset, ignore the email and keep your account secure.
      </div>
    </div>
  )
}
