"use client";

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

/* ========================================================================== */
/* PAGE                                                                       */
/* ========================================================================== */

export default function PasswordResetPage() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Success: immediately invalidate recovery session
    await supabase.auth.signOut();

    setSuccess(true);
    setLoading(false);

    // Optional redirect after a short pause
    setTimeout(() => {
      navigate("/auth");
    }, 2500);
  }

  return (
    <div className="mx-auto max-w-sm py-16">
      <h1 className="text-lg font-semibold text-[var(--text-dk)] mb-2">
        Reset your password
      </h1>

      <p className="text-sm text-[var(--text-muted)] mb-6">
        Choose a new password for your account.
      </p>

      {success ? (
        <SuccessState />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field
            label="New password"
            type="password"
            value={password}
            onChange={setPassword}
          />

          <Field
            label="Confirm password"
            type="password"
            value={confirm}
            onChange={setConfirm}
          />

          {error && (
            <div className="text-sm text-[var(--danger)]">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="
              w-full
              rounded-lg
              bg-[var(--dom-dk)]
              px-4 py-2
              text-sm font-medium text-white
              hover:opacity-90
              disabled:opacity-50
            "
          >
            {loading ? "Updating…" : "Update password"}
          </button>
        </form>
      )}
    </div>
  );
}

/* ========================================================================== */
/* SUBCOMPONENTS                                                              */
/* ========================================================================== */

function Field({
  label,
  type,
  value,
  onChange,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-[var(--text-muted)]">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="
          w-full rounded-lg
          border border-[var(--border)]
          bg-[var(--bg)]
          px-3 py-2
          text-sm
          focus:outline-none
          focus:ring-2 focus:ring-[var(--dom-dk)]
        "
      />
    </div>
  );
}

function SuccessState() {
  return (
    <div className="rounded-lg border border-[var(--success)] bg-[var(--success-bg)] p-4">
      <div className="text-sm font-medium text-[var(--success)]">
        Password updated
      </div>
      <p className="text-sm text-[var(--text)] mt-1">
        Your password has been changed successfully.  
        You’ll be redirected to sign in.
      </p>
    </div>
  );
}
