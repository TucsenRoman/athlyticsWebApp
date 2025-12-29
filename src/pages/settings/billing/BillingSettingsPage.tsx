"use client";

import { ArrowLeft, Medal, Trophy, Crown, Check } from "lucide-react";

import {
  PRICING_PLANS,
  PRICING_PLAN_LIST,
  type PricingPlan,
} from "@/config/pricingPlans";

/* -------------------------------------------------------------------------- */
/* PAGE                                                                       */
/* -------------------------------------------------------------------------- */

export default function BillingSettingsPage() {
  // TEMP: assume first plan is active (UI shell only)
  const activePlan = PRICING_PLANS.free;

  return (
    <div className="flex flex-col h-full bg-[var(--bg)]">
      {/* ------------------------------------------------------------------ */}
      {/* HEADER                                                             */}
      {/* ------------------------------------------------------------------ */}
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

      {/* ------------------------------------------------------------------ */}
      {/* CONTENT                                                            */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-10 max-w-4xl">
        {/* CURRENT PLAN */}
        <section className="space-y-3">
          <Label>Current Plan</Label>
          <CurrentPlanCard plan={activePlan} />
        </section>

        {/* AVAILABLE PLANS */}
        <section className="space-y-4">
          <Label>Available Plans</Label>

          {PRICING_PLAN_LIST.filter(p => p.id !== activePlan.id).map(plan => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </section>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* FOOTER                                                             */}
      {/* ------------------------------------------------------------------ */}
      <footer className="px-6 py-4 border-t border-[var(--border)] text-sm text-[var(--text)]">
        Billing history and payment methods are managed securely.
      </footer>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* COMPONENTS                                                                 */
/* -------------------------------------------------------------------------- */

function Label({ children }: { children: string }) {
  return (
    <h2 className="text-xs uppercase tracking-wide text-[var(--text)]">
      {children}
    </h2>
  );
}

/* -------------------------------------------------------------------------- */

function CurrentPlanCard({ plan }: { plan: PricingPlan }) {
  return (
    <div className="rounded-xl border border-[var(--border)] p-5 flex items-center justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Medal className="w-4 h-4 text-[var(--accent)]" />
          <span className="font-medium text-[var(--text-dark)]">
            {plan.name}
          </span>
        </div>

        <p className="text-sm text-[var(--text)] max-w-md">
          {plan.description}
        </p>
      </div>

      <span className="text-xs px-3 py-1 rounded-full bg-[var(--accent-bg)] text-[var(--accent)]">
        Active
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function PlanCard({ plan }: { plan: PricingPlan }) {
  const Icon = plan.highlight ? Crown : Trophy;

  return (
    <div
      className={`
        rounded-xl border p-6 flex justify-between gap-6
        ${plan.highlight ? "border-[var(--accent)]" : "border-[var(--border)]"}
      `}
    >
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Icon
            className={`w-4 h-4 ${
              plan.highlight
                ? "text-[var(--accent)]"
                : "text-[var(--text)]"
            }`}
          />
          <span className="font-medium text-[var(--text-dark)]">
            {plan.name}
          </span>
        </div>

        <p className="text-sm text-[var(--text)] max-w-md">
          {plan.description}
        </p>

        <ul className="space-y-1 text-sm text-[var(--text)]">
          {plan.features.map(feature => (
            <li key={feature} className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[var(--text-light)]" />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col items-end justify-between">
        <div className="text-right">
          <div className="text-2xl font-semibold text-[var(--text-dark)]">
            {plan.price.monthly}
          </div>
          <div className="text-xs text-[var(--text)]">per month</div>
        </div>

        <button
          className={`
            px-4 py-2 rounded-md text-sm font-medium
            ${
              plan.highlight
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--gray-200)] text-[var(--text-dark)]"
            }
          `}
        >
          {plan.cta.label}
        </button>
      </div>
    </div>
  );
}
