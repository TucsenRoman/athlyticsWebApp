"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

import {
  PRICING_PLANS,
  PRICING_PLAN_LIST,
  type PricingPlan,
} from "@/config/pricingPlans";

/* -------------------------------------------------------------------------- */
/* PAGE                                                                       */
/* -------------------------------------------------------------------------- */

export default function PricingPage() {
  return (
    <main className="relative w-full">
      {/* ------------------------------------------------------------------ */}
      {/* HERO                                                               */}
      {/* ------------------------------------------------------------------ */}
      <section className="px-6 pt-24 pb-16 text-center max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Simple, coach-first pricing
        </h1>
        <p className="text-[var(--text-muted)] max-w-2xl mx-auto">
          Start free. Upgrade when your program grows.
        </p>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* TIERS                                                              */}
      {/* ------------------------------------------------------------------ */}
      <section className="px-6 pb-24">
        <div className="grid gap-8 max-w-6xl mx-auto md:grid-cols-3">
          {PRICING_PLAN_LIST.map((plan) => (
            <PricingCard key={plan.id} plan={plan} />
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* FOOTER CTA                                                         */}
      {/* ------------------------------------------------------------------ */}
      <section className="px-6 pb-24 text-center">
        <p className="text-sm text-[var(--text-muted)] mb-4">
          Not sure which plan fits?
        </p>
        <button className="inline-flex items-center gap-2 text-sm font-medium text-[var(--dom-dk)] hover:underline">
          Compare plans
        </button>
      </section>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* PRICING CARD (PRESENTATIONAL ONLY)                                         */
/* -------------------------------------------------------------------------- */

function PricingCard({ plan }: { plan: PricingPlan }) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className={`
        relative
        flex
        flex-col
        justify-between
        rounded-[var(--radius)]
        border
        bg-[var(--bg)]
        p-8
        ${
          plan.highlight
            ? "border-[var(--dom-dk)] shadow-xl"
            : "border-[var(--border)]"
        }
      `}
    >
      {/* HEADER */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-1">{plan.name}</h3>
        <p className="text-sm text-[var(--text-muted)] mb-4">
          {plan.description}
        </p>

        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold">
            {plan.price.monthly}
          </span>
          {plan.price.note && (
            <span className="text-xs text-[var(--text-muted)]">
              {plan.price.note}
            </span>
          )}
        </div>
      </div>

      {/* FEATURES */}
      <ul className="flex flex-col gap-3 mb-8">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-center gap-3 text-sm">
            <Check className="w-4 h-4 text-[var(--dom-dk)]" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        className={`
          w-full
          h-11
          rounded-md
          font-medium
          transition-all
          ${
            plan.highlight
              ? "bg-[var(--dom-dk)] text-white hover:brightness-110"
              : "border border-[var(--border)] hover:bg-[var(--dom-bg)]"
          }
        `}
      >
        {plan.cta.label}
      </button>
    </motion.div>
  );
}
