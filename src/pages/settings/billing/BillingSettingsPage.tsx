// src/pages/settings/BillingSettingsPage.tsx
"use client";

import { ArrowLeft, Medal, Trophy, Crown, Check } from "lucide-react";

export default function BillingSettingsPage() {
  return (
    <div className="flex flex-col h-full bg-[var(--bg)]">

      {/* HEADER */}
      <header className="flex items-center gap-4 px-6 py-5 border-b border-[var(--border)]">
        <button className="p-2 rounded-md hover:bg-[var(--gray-100)]">
          <ArrowLeft className="w-5 h-5 text-[var(--text)]" />
        </button>

        <div>
          <h1 className="text-lg font-semibold text-[var(--text-dark)]">
            Plan & Billing
          </h1>
          <p className="text-sm text-[var(--text)]">
            Subscription level and billing details
          </p>
        </div>
      </header>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-10 max-w-4xl">

        {/* CURRENT PLAN */}
        <section className="space-y-3">
          <Label>Current Plan</Label>

          <div className="rounded-xl border border-[var(--border)] p-5 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Medal className="w-4 h-4 text-[var(--accent)]" />
                <span className="font-medium text-[var(--text-dark)]">
                  Rookie
                </span>
              </div>
              <p className="text-sm text-[var(--text)] max-w-md">
                Core tools for managing athletes, schedules, and daily operations.
              </p>
            </div>

            <span className="text-xs px-3 py-1 rounded-full bg-[var(--accent-bg)] text-[var(--accent)]">
              Active
            </span>
          </div>
        </section>

        {/* AVAILABLE PLANS */}
        <section className="space-y-4">
          <Label>Available Plans</Label>

          <Plan
            icon={<Trophy className="w-4 h-4 text-[var(--text)]" />}
            name="Varsity"
            price={19.99}
            description="Expanded tools for competitive programs."
            features={[
              "Advanced attendance controls",
              "Unlimited scheduling",
              "Cross-program package installs",
            ]}
          />

          <Plan
            icon={<Crown className="w-4 h-4 text-[var(--accent)]" />}
            name="Olympian"
            price={49.99}
            primary
            description="Full analytics, collaboration, and long-term insight."
            features={[
              "Multi-coach roles & permissions",
              "Full analytics & trends",
              "Season import & export",
            ]}
          />
        </section>
      </div>

      {/* FOOTER */}
      <footer className="px-6 py-4 border-t border-[var(--border)] text-sm text-[var(--text)]">
        Billing history and payment methods are managed securely.
      </footer>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function Label({ children }: { children: string }) {
  return (
    <h2 className="text-xs uppercase tracking-wide text-[var(--text)]">
      {children}
    </h2>
  );
}

function Plan({
  icon,
  name,
  price,
  description,
  features,
  primary,
}: {
  icon: React.ReactNode;
  name: string;
  price: number;
  description: string;
  features: string[];
  primary?: boolean;
}) {
  return (
    <div
      className={`
        rounded-xl border p-6 flex justify-between gap-6
        ${primary ? "border-[var(--accent)]" : "border-[var(--border)]"}
      `}
    >
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium text-[var(--text-dark)]">
            {name}
          </span>
        </div>

        <p className="text-sm text-[var(--text)] max-w-md">
          {description}
        </p>

        <ul className="space-y-1 text-sm text-[var(--text)]">
          {features.map(f => (
            <li key={f} className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[var(--text-light)]" />
              {f}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col items-end justify-between">
        <div className="text-right">
          <div className="text-2xl font-semibold text-[var(--text-dark)]">
            ${price}
          </div>
          <div className="text-xs text-[var(--text)]">per month</div>
        </div>

        <button
          className={`
            px-4 py-2 rounded-md text-sm font-medium
            ${
              primary
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--gray-200)] text-[var(--text-dark)]"
            }
          `}
        >
          Choose {name}
        </button>
      </div>
    </div>
  );
}
