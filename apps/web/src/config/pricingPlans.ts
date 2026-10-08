/* -------------------------------------------------------------------------- */
/* PLAN IDS                                                                    */
/* -------------------------------------------------------------------------- */

export type PricingPlanId =
  | "free"
  | "pro"
  // | "enterprise";

/* -------------------------------------------------------------------------- */
/* CTA DEFINITIONS                                                             */
/* -------------------------------------------------------------------------- */

export type PlanCtaAction =
  | "signup"
  | "trial"
  | "contact";

/* -------------------------------------------------------------------------- */
/* LIMIT TYPES                                                                 */
/* -------------------------------------------------------------------------- */

export type PlanLimit = number | "unlimited";

/* -------------------------------------------------------------------------- */
/* PLAN SHAPE                                                                  */
/* -------------------------------------------------------------------------- */

export type PricingPlan = {
  id: PricingPlanId;

  /* DISPLAY */
  name: string;
  description: string;
  highlight?: boolean;

  /* PRICING */
  price: {
    monthly: string;
    yearly?: string;
    note?: string;
  };

  /* LIMITS (for feature gating later) */
  limits: {
    programs: PlanLimit;
    athletes?: PlanLimit;
    coaches?: PlanLimit;
  };

  /* FEATURES (marketing + comparison tables) */
  features: string[];

  /* CTA METADATA (no routing or logic here) */
  cta: {
    label: string;
    action: PlanCtaAction;
  };
};

/* -------------------------------------------------------------------------- */
/* PRICING PLANS                                                               */
/* -------------------------------------------------------------------------- */

export const PRICING_PLANS: Record<PricingPlanId, PricingPlan> = {
  free: {
    id: "free",
    name: "Free",
    description: "Explore Athlytics with essential tools",
    price: {
      monthly: "$0",
      note: "No credit card required",
    },
    limits: {
      programs: 1,
    },
    features: [
      "Core tracking tools",
      "Basic analytics",
      "Single program access",
      "Community support",
    ],
    cta: {
      label: "Get started",
      action: "signup",
    },
  },

  pro: {
    id: "pro",
    name: "Pro",
    description: "For serious coaches running active programs",
    highlight: true,
    price: {
      monthly: "$12",
      yearly: "$120",
      note: "Save with annual billing",
    },
    limits: {
      programs: "unlimited",
      athletes: "unlimited",
    },
    features: [
      "Unlimited programs",
      "Advanced analytics",
      "Attendance & scheduling",
      "Exports & reports",
      "Priority support",
    ],
    cta: {
      label: "Start free trial",
      action: "trial",
    },
  },

  // enterprise: {
  //   id: "enterprise",
  //   name: "Enterprise",
  //   description: "For schools and multi-team organizations",
  //   price: {
  //     monthly: "Custom",
  //     note: "Volume pricing available",
  //   },
  //   limits: {
  //     programs: "unlimited",
  //     athletes: "unlimited",
  //     coaches: "unlimited",
  //   },
  //   features: [
  //     "Everything in Coach",
  //     "Multi-role access",
  //     "Org-wide insights",
  //     "Custom onboarding",
  //     "Dedicated support",
  //   ],
  //   cta: {
  //     label: "Contact sales",
  //     action: "contact",
  //   },
  // },
};

/* -------------------------------------------------------------------------- */
/* DERIVED EXPORTS (OPTIONAL, STILL PURE)                                      */
/* -------------------------------------------------------------------------- */

export const PRICING_PLAN_LIST = Object.values(PRICING_PLANS);
