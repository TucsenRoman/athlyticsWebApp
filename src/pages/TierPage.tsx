// src/pages/settings/TierPage.tsx
"use client";

import { Link } from "react-router-dom";
import { Medal, Trophy, Crown, ArrowLeft, Lock } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  TIER PAGE – UI ONLY (NO LOGIC)                                            */
/* -------------------------------------------------------------------------- */

export default function TierPage() {
  return (
    <div className="flex flex-col h-full w-full">
      {/* HEADER */}
      <header className="flex items-center gap-3 p-4 border-b border-[var(--gray-200)]">
        <button className="p-2 rounded-lg hover:bg-[var(--gray-100)]">
          <ArrowLeft className="w-5 h-5 text-[var(--gray-700)]" />
        </button>
        <h1 className="text-lg font-semibold">Your Plan</h1>
      </header>

      {/* CURRENT PLAN */}
      <section className="p-4 border-b border-[var(--gray-200)]">
        <h2 className="text-sm font-medium text-[var(--gray-600)] mb-2">
          Current Tier
        </h2>

        <div className="rounded-xl border border-[var(--gray-200)] p-4 flex items-center justify-between">
          <div>
            <p className="font-semibold">Rookie</p>
            <p className="text-sm text-[var(--gray-600)]">
              Essential tools for getting started with your program.
            </p>
          </div>
          <Medal className="w-6 h-6 text-[var(--accent-500)]" />
        </div>
      </section>

      {/* AVAILABLE PLANS */}
      <section className="p-4 flex flex-col gap-4">
        <h2 className="text-sm font-medium text-[var(--gray-600)]">
          Available Upgrades
        </h2>

        {/* VARSITY */}
        <div className="rounded-xl border border-[var(--gray-200)] p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold flex items-center gap-1">
                Varsity <Trophy className="w-4 h-4 text-[var(--accent-500)]" />
              </p>
              <p className="text-sm text-[var(--gray-600)]">
                Competitive-level tools for established programs.
              </p>
            </div>

            <button className="px-3 py-1 rounded-lg bg-[var(--accent-500)] text-white text-sm">
              Select
            </button>
          </div>

          <ul className="mt-3 text-sm text-[var(--gray-700)] space-y-1">
            <li className="flex items-center gap-2">
              <Lock className="w-4 h-4" /> Advanced attendance controls
            </li>
            <li className="flex items-center gap-2">
              <Lock className="w-4 h-4" /> Cross-program package management
            </li>
            <li className="flex items-center gap-2">
              <Lock className="w-4 h-4" /> Unlimited scheduling
            </li>
          </ul>
        </div>

        {/* OLYMPIAN */}
        <div className="rounded-xl border border-[var(--gray-200)] p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold flex items-center gap-1">
                Olympian <Crown className="w-4 h-4 text-[var(--accent-500)]" />
              </p>
              <p className="text-sm text-[var(--gray-600)]">
                World-class coaching tools, insights, and collaboration.
              </p>
            </div>

            <button className="px-3 py-1 rounded-lg bg-[var(--accent-500)] text-white text-sm">
              Select
            </button>
          </div>

          <ul className="mt-3 text-sm text-[var(--gray-700)] space-y-1">
            <li className="flex items-center gap-2">
              <Lock className="w-4 h-4" /> Multi-coach roles & permissions
            </li>
            <li className="flex items-center gap-2">
              <Lock className="w-4 h-4" /> Full analytics suite
            </li>
            <li className="flex items-center gap-2">
              <Lock className="w-4 h-4" /> Season import/export
            </li>
          </ul>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="p-4 mt-auto border-t border-[var(--gray-200)] text-center text-sm text-[var(--gray-600)]">
        Manage billing and receipts in your account settings.
      </footer>
    </div>
  );
}
