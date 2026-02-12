// src/pages/settings/billing/BillingSettingsPage.tsx
"use client"

import * as React from "react"
import { useMemo, useState } from "react"
import {
  Medal,
  Trophy,
  Crown,
  Check,
  CreditCard,
  Shield,
  ChevronRight,
} from "lucide-react"

import {
  PRICING_PLANS,
  PRICING_PLAN_LIST,
  type PricingPlan,
} from "@/config/pricingPlans"
import { Divider } from "@/components/ui"

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

type PaymentDraft = {
  brand: string
  last4: string
  exp: string
  nameOnCard: string
}

type BillingDraft = {
  selectedPlanId: PricingPlan["id"]
  payment: PaymentDraft
}

type PlanId = PricingPlan["id"]

type FeatureType = "boolean" | "value"

type FeatureDef = {
  key: string
  label: string
  group:
    | "Plan overview"
    | "Core functionality"
    | "AI & analytics"
    | "Communications"
    | "Workflows & automation"
    | "Roles, portals & sharing"
    | "Monetization & advanced ops"
  type: FeatureType
  // For value features, you can optionally add a unit hint for UI
  unitHint?: string
}

type PlanFeatureValue =
  | { enabled: boolean } // boolean feature
  | { enabled: boolean; value?: string | number } // value feature

type PlanFeatureMatrix = Record<string, PlanFeatureValue>

type LocalPlan = {
  id: PlanId
  name: string
  description: string
  priceMonthly: string
  highlight?: boolean
  // NOTE: Capacity/caps + feature flags live here
  matrix: PlanFeatureMatrix
}

/* ========================================================================== */
/* UI-ONLY JSON: FEATURES + PLAN MATRIX                                       */
/*  - Flip booleans or edit numbers/strings here                              */
/*  - UI reads from this, not from plan.features strings                       */
/* ========================================================================== */

const FEATURE_DEFS: FeatureDef[] = [
  // ---------------- Plan overview ----------------
  { key: "overview.intendedUser", label: "Intended user", group: "Plan overview", type: "value" },
  { key: "limits.activePrograms", label: "Active programs", group: "Plan overview", type: "value" },
  { key: "limits.archivedPrograms", label: "Archived programs", group: "Plan overview", type: "value" },
  { key: "limits.storageTotal", label: "Total storage", group: "Plan overview", type: "value" },
  { key: "limits.maxFileSize", label: "Max file size", group: "Plan overview", type: "value" },
  { key: "limits.ledgers", label: "Ledgers", group: "Plan overview", type: "value" },
  { key: "limits.totalRows", label: "Total ledger rows", group: "Plan overview", type: "value" },

  // ---------------- Core functionality ----------------
  { key: "core.webApp", label: "Web app access", group: "Core functionality", type: "boolean" },
  { key: "core.manualEntry", label: "Manual data entry", group: "Core functionality", type: "boolean" },
  { key: "core.coreLedgers", label: "Core ledgers", group: "Core functionality", type: "boolean" },
  { key: "core.attendanceManual", label: "Attendance (manual)", group: "Core functionality", type: "boolean" },
  { key: "core.calendarBasic", label: "Basic calendar (events)", group: "Core functionality", type: "boolean" },
  { key: "core.savedViews", label: "Saved views & layouts", group: "Core functionality", type: "boolean" },
  { key: "core.seasonTransfer", label: "Season-to-season transfer", group: "Core functionality", type: "boolean" },
  { key: "core.csvManual", label: "CSV import/export (manual)", group: "Core functionality", type: "boolean" },

  // ---------------- AI & analytics ----------------
  { key: "ai.ledgerGuru", label: "Ledger Guru (AI insights)", group: "AI & analytics", type: "boolean" },
  { key: "ai.baton", label: "Baton chatbot", group: "AI & analytics", type: "boolean" },
  { key: "ai.performanceAnalysis", label: "Performance analysis", group: "AI & analytics", type: "boolean" },
  { key: "ai.attendancePatterns", label: "Attendance pattern detection", group: "AI & analytics", type: "boolean" },
  { key: "ai.csvToAiToLedger", label: "CSV → AI → Ledger", group: "AI & analytics", type: "boolean" },
  { key: "ai.autoSummaries", label: "Auto summaries (AoTW / AoTM / AoTG / AoTC)", group: "AI & analytics", type: "boolean" },

  // ---------------- Communications ----------------
  { key: "comm.sms", label: "SMS", group: "Communications", type: "boolean" },
  { key: "comm.email", label: "Email", group: "Communications", type: "boolean" },
  { key: "comm.push", label: "Push notifications", group: "Communications", type: "boolean" },
  { key: "comm.remindersEtas", label: "Reminders & ETAs", group: "Communications", type: "boolean" },
  { key: "comm.prePostComp", label: "Pre/Post competition messaging", group: "Communications", type: "boolean" },
  { key: "comm.autoSend", label: "Auto-send (AI / algorithm)", group: "Communications", type: "boolean" },

  // ---------------- Workflows & automation ----------------
  { key: "wf.shareableWorkflows", label: "Shareable workflows", group: "Workflows & automation", type: "boolean" },
  { key: "wf.smartReminders", label: "Smart reminders", group: "Workflows & automation", type: "boolean" },
  { key: "wf.lineupsScheduleAuto", label: "Lineups & schedule automation", group: "Workflows & automation", type: "boolean" },
  { key: "wf.autoCheckinOut", label: "Auto check-in / check-out", group: "Workflows & automation", type: "boolean" },
  { key: "wf.noProgramMiniGames", label: "No-program mini games", group: "Workflows & automation", type: "boolean" },

  // ---------------- Roles, portals & sharing ----------------
  { key: "roles.rolesSystem", label: "Roles (coach, assistant, etc.)", group: "Roles, portals & sharing", type: "boolean" },
  { key: "roles.accountClaiming", label: "Account claiming", group: "Roles, portals & sharing", type: "boolean" },
  { key: "roles.athletePortal", label: "Athlete portal", group: "Roles, portals & sharing", type: "value" },
  { key: "roles.parentPortal", label: "Parent portal", group: "Roles, portals & sharing", type: "boolean" },
  { key: "roles.sharePackagesTemplates", label: "Share packages & templates", group: "Roles, portals & sharing", type: "boolean" },
  { key: "roles.community", label: "Community participation", group: "Roles, portals & sharing", type: "boolean" },

  // ---------------- Monetization & advanced ops ----------------
  { key: "ops.monetizationTools", label: "Monetization tools", group: "Monetization & advanced ops", type: "boolean" },
  { key: "ops.adsControls", label: "Ads (optional / controlled)", group: "Monetization & advanced ops", type: "boolean" },
  { key: "ops.advancedCalendars", label: "Advanced calendars (meets, banquets, etc.)", group: "Monetization & advanced ops", type: "boolean" },
  { key: "ops.specialRosters", label: "Special rosters (state / elite)", group: "Monetization & advanced ops", type: "boolean" },
  { key: "ops.deviceDuality", label: "Device duality", group: "Monetization & advanced ops", type: "boolean" },
]

/**
 * Helper for building a plan matrix with minimal noise.
 * - For boolean features: BV(true/false)
 * - For value features: VV(value, enabled?)
 */
const BV = (enabled: boolean): PlanFeatureValue => ({ enabled })
const VV = (value: string | number, enabled = true): PlanFeatureValue => ({ enabled, value })

/**
 * THESE THREE are the plans you described:
 * - Free: 1 active program, limited storage, not all features
 * - Plus: increases storage + active programs, still not “all features”
 * - Pro: opens all features, but NOT more storage than Plus
 *
 * NOTE: ids must match your pricingPlans config ids.
 * If your config uses different ids, change these to match.
 */
const PLAN_MATRIX: LocalPlan[] = [
  {
    id: "free" as PlanId,
    name: "Free",
    description: "Explore Athlytics with one active program and core tools.",
    priceMonthly: PRICING_PLANS.free?.price?.monthly ?? "$0",
    matrix: {
      // Overview (values)
      "overview.intendedUser": VV("Try & explore"),
      "limits.activePrograms": VV(1),
      "limits.archivedPrograms": VV("Unlimited"),
      "limits.storageTotal": VV("250 MB"),
      "limits.maxFileSize": VV("10 MB"),
      "limits.ledgers": VV(10),
      "limits.totalRows": VV("2,500"),

      // Core
      "core.webApp": BV(true),
      "core.manualEntry": BV(true),
      "core.coreLedgers": BV(true),
      "core.attendanceManual": BV(true),
      "core.calendarBasic": BV(true),
      "core.savedViews": BV(false),
      "core.seasonTransfer": BV(false),
      "core.csvManual": BV(false),

      // AI
      "ai.ledgerGuru": BV(false),
      "ai.baton": BV(false),
      "ai.performanceAnalysis": BV(false),
      "ai.attendancePatterns": BV(false),
      "ai.csvToAiToLedger": BV(false),
      "ai.autoSummaries": BV(false),

      // Comms
      "comm.sms": BV(false),
      "comm.email": BV(false),
      "comm.push": BV(false),
      "comm.remindersEtas": BV(false),
      "comm.prePostComp": BV(false),
      "comm.autoSend": BV(false),

      // Workflows
      "wf.shareableWorkflows": BV(false),
      "wf.smartReminders": BV(false),
      "wf.lineupsScheduleAuto": BV(false),
      "wf.autoCheckinOut": BV(false),
      "wf.noProgramMiniGames": BV(false),

      // Roles/portals/sharing
      "roles.rolesSystem": BV(false),
      "roles.accountClaiming": BV(false),
      "roles.athletePortal": VV("Read-only (limited)"),
      "roles.parentPortal": BV(false),
      "roles.sharePackagesTemplates": BV(false),
      "roles.community": BV(false),

      // Monetization/ops
      "ops.monetizationTools": BV(false),
      "ops.adsControls": BV(false),
      "ops.advancedCalendars": BV(false),
      "ops.specialRosters": BV(false),
      "ops.deviceDuality": BV(false),
    },
  },
  {
    id: "plus" as PlanId,
    name: "Plus",
    description: "More programs and storage for independents running multiple groups.",
    // If you don’t have plus in config yet, set a stub here:
    priceMonthly: (PRICING_PLANS as any).plus?.price?.monthly ?? "$9",
    matrix: {
      // Overview (values)
      "overview.intendedUser": VV("Run more"),
      "limits.activePrograms": VV(5),
      "limits.archivedPrograms": VV("Unlimited"),
      "limits.storageTotal": VV("5 GB"),
      "limits.maxFileSize": VV("250 MB"),
      "limits.ledgers": VV(50),
      "limits.totalRows": VV("50,000"),

      // Core (capacity adds + convenience)
      "core.webApp": BV(true),
      "core.manualEntry": BV(true),
      "core.coreLedgers": BV(true),
      "core.attendanceManual": BV(true),
      "core.calendarBasic": BV(true),
      "core.savedViews": BV(true),
      "core.seasonTransfer": BV(true),
      "core.csvManual": BV(true),

      // AI (still off)
      "ai.ledgerGuru": BV(false),
      "ai.baton": BV(false),
      "ai.performanceAnalysis": BV(false),
      "ai.attendancePatterns": BV(false),
      "ai.csvToAiToLedger": BV(false),
      "ai.autoSummaries": BV(false),

      // Comms (still off)
      "comm.sms": BV(false),
      "comm.email": BV(false),
      "comm.push": BV(false),
      "comm.remindersEtas": BV(false),
      "comm.prePostComp": BV(false),
      "comm.autoSend": BV(false),

      // Workflows (still off)
      "wf.shareableWorkflows": BV(false),
      "wf.smartReminders": BV(false),
      "wf.lineupsScheduleAuto": BV(false),
      "wf.autoCheckinOut": BV(false),
      "wf.noProgramMiniGames": BV(false),

      // Roles/portals/sharing (expanded but passive)
      "roles.rolesSystem": BV(false),
      "roles.accountClaiming": BV(false),
      "roles.athletePortal": VV("Expanded (passive)"),
      "roles.parentPortal": BV(false),
      "roles.sharePackagesTemplates": BV(false),
      "roles.community": BV(false),

      // Monetization/ops (still off)
      "ops.monetizationTools": BV(false),
      "ops.adsControls": BV(false),
      "ops.advancedCalendars": BV(false),
      "ops.specialRosters": BV(false),
      "ops.deviceDuality": BV(false),
    },
  },
  {
    id: "pro" as PlanId,
    name: "Pro",
    description: "All features unlocked for serious independents — same storage as Plus.",
    priceMonthly: PRICING_PLANS.pro?.price?.monthly ?? "$19",
    highlight: true,
    matrix: {
      // Overview (same caps as Plus on purpose)
      "overview.intendedUser": VV("Full power"),
      "limits.activePrograms": VV(5),
      "limits.archivedPrograms": VV("Unlimited"),
      "limits.storageTotal": VV("5 GB"),
      "limits.maxFileSize": VV("250 MB"),
      "limits.ledgers": VV(50),
      "limits.totalRows": VV("50,000"),

      // Core
      "core.webApp": BV(true),
      "core.manualEntry": BV(true),
      "core.coreLedgers": BV(true),
      "core.attendanceManual": BV(true),
      "core.calendarBasic": BV(true),
      "core.savedViews": BV(true),
      "core.seasonTransfer": BV(true),
      "core.csvManual": BV(true),

      // AI
      "ai.ledgerGuru": BV(true),
      "ai.baton": BV(true),
      "ai.performanceAnalysis": BV(true),
      "ai.attendancePatterns": BV(true),
      "ai.csvToAiToLedger": BV(true),
      "ai.autoSummaries": BV(true),

      // Comms
      "comm.sms": BV(true),
      "comm.email": BV(true),
      "comm.push": BV(true),
      "comm.remindersEtas": BV(true),
      "comm.prePostComp": BV(true),
      "comm.autoSend": BV(true),

      // Workflows
      "wf.shareableWorkflows": BV(true),
      "wf.smartReminders": BV(true),
      "wf.lineupsScheduleAuto": BV(true),
      "wf.autoCheckinOut": BV(true),
      "wf.noProgramMiniGames": BV(true),

      // Roles/portals/sharing
      "roles.rolesSystem": BV(true),
      "roles.accountClaiming": BV(true),
      "roles.athletePortal": VV("Interactive"),
      "roles.parentPortal": BV(true),
      "roles.sharePackagesTemplates": BV(true),
      "roles.community": BV(true),

      // Monetization/ops
      "ops.monetizationTools": BV(true),
      "ops.adsControls": BV(true),
      "ops.advancedCalendars": BV(true),
      "ops.specialRosters": BV(true),
      "ops.deviceDuality": BV(true),
    },
  },
]

/* ========================================================================== */
/* PAGE                                                                       */
/* ========================================================================== */

export default function BillingSettingsPage() {
  // UI-only: treat Free as current for now
  const activePlanId: PlanId = (PRICING_PLANS.free?.id ?? "free") as PlanId
  const activePlan = PLAN_MATRIX.find((p) => p.id === activePlanId) ?? PLAN_MATRIX[0]

  const plans = useMemo(() => {
    // Keep the three plans in file order (Free, Plus, Pro)
    return PLAN_MATRIX
  }, [])

  const [draft, setDraft] = useState<BillingDraft>({
    selectedPlanId: activePlan.id,
    payment: {
      brand: "Visa",
      last4: "1234",
      exp: "10/28",
      nameOnCard: "Tucsen Roman",
    },
  })

  const selectedPlan = useMemo(() => {
    return plans.find((p) => p.id === draft.selectedPlanId) ?? activePlan
  }, [plans, draft.selectedPlanId, activePlan])

  const parseMonthly = (s: string) => {
    const m = String(s ?? "").replace(/,/g, "").match(/(\d+(\.\d+)?)/)
    return m ? Number(m[1]) : null
  }

  const actionLabel = useMemo(() => {
    if (selectedPlan.id === activePlan.id) return "Current plan"
    const a = parseMonthly(activePlan.priceMonthly)
    const b = parseMonthly(selectedPlan.priceMonthly)
    if (a != null && b != null) return b > a ? "Upgrade" : "Downgrade"
    return "Change plan"
  }, [activePlan.id, activePlan.priceMonthly, selectedPlan.id, selectedPlan.priceMonthly])

  const [compareOpen, setCompareOpen] = useState(false)

  const groups = useMemo(() => {
    const order: FeatureDef["group"][] = [
      "Plan overview",
      "Core functionality",
      "AI & analytics",
      "Communications",
      "Workflows & automation",
      "Roles, portals & sharing",
      "Monetization & advanced ops",
    ]
    const map = new Map<FeatureDef["group"], FeatureDef[]>()
    for (const g of order) map.set(g, [])
    for (const f of FEATURE_DEFS) (map.get(f.group) ?? map.set(f.group, []).get(f.group)!).push(f)

    return order
      .map((g) => ({ group: g, rows: map.get(g) ?? [] }))
      .filter((x) => x.rows.length > 0)
  }, [])

  const onSelectPlan = (id: PlanId) => {
    setDraft((d) => ({ ...d, selectedPlanId: id }))
  }

  const onChangePlan = () => {
    // wire later
  }

  const primaryPlanIcon = (p: LocalPlan) => {
    if (p.highlight) return Crown
    if (p.id === activePlan.id) return Medal
    return Trophy
  }

  const chip = (label: string) => (
    <span className="text-[10px] px-2 py-[2px] rounded-full border border-[var(--gray-17)] bg-[var(--gray-19)] text-[var(--text)]">
      {label}
    </span>
  )

  const getCell = (plan: LocalPlan, def: FeatureDef) => {
    const v = plan.matrix[def.key]
    if (!v) {
      // If you forget to define a key, show blank (keeps UI resilient)
      return { kind: def.type, enabled: false, text: "" }
    }

    if (def.type === "boolean") {
      return { kind: "boolean" as const, enabled: Boolean(v.enabled), text: "" }
    }

    // value feature
    const text =
      "value" in v && v.value != null ? String(v.value) : v.enabled ? "—" : ""
    return { kind: "value" as const, enabled: Boolean(v.enabled), text }
  }

  const selectedFeaturesShortList = useMemo(() => {
    // Use all boolean features that are enabled for the selected plan, plus value features that have values.
    const items: { label: string; type: FeatureType; valueText?: string }[] = []
    for (const def of FEATURE_DEFS) {
      const cell = getCell(selectedPlan, def)
      if (def.type === "boolean") {
        if (cell.kind === "boolean" && cell.enabled) items.push({ label: def.label, type: "boolean" })
      } else {
        if (cell.kind === "value" && cell.text) items.push({ label: def.label, type: "value", valueText: cell.text })
      }
    }

    // Keep it readable on the details panel
    return items.slice(0, 12)
  }, [selectedPlan])

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto px-5 py-6">
      {/* ================= PAGE HEADER ================= */}
      <div className="flex items-start justify-between gap-6">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="text-xl font-semibold text-[var(--text-lt)]">
            Plan & Billing
          </div>
          <div className="text-sm text-[var(--gray-12)]">
            Pick a plan, compare features, and manage payment details.
          </div>
        </div>

        <div className="shrink-0 text-xs text-[var(--gray-12)]">
          Current: <span className="text-[var(--text)]">{activePlan.name}</span>
        </div>
      </div>

      {/* ================= SINGLE CARD ================= */}
      <div
        className="
          flex flex-col gap-6
          p-3 w-full max-w-none h-fit
          rounded-2xl border border-[var(--gray-18)]
          bg-gradient-to-br from-[var(--gray-18)] to-transparent
        "
      >
        {/* ================= PLANS ================= */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="text-lg font-medium tracking-wide text-[var(--text-lt)]">
                Plans
              </div>
              <div className="text-sm text-[var(--text)]">
                {compareOpen ? "(comparison)" : "(details)"}
              </div>
            </div>

            <button
              onClick={() => setCompareOpen((v) => !v)}
              className="
                inline-flex items-center gap-2
                px-4 py-3
                rounded-2xl
                border border-[var(--gray-17)]
                bg-[var(--gray-19)]
                text-sm font-semibold
                text-[var(--text)]
                hover:border-[var(--gray-14)]
                transition-all duration-300
              "
              aria-expanded={compareOpen}
            >
              {compareOpen ? "Show details" : "Compare features"}
              <ChevronRight
                className={`w-4 h-4 opacity-80 transition-transform ${compareOpen ? "rotate-90" : ""}`}
              />
            </button>
          </div>

          {/* Split: left selector rail, right toggles between DETAILS and COMPARISON */}
          <div className="flex items-stretch gap-3">
            {/* LEFT: PLAN SELECTOR */}
            <div
              className="
                w-[34%] min-w-[240px]
                rounded-2xl
                border border-[var(--gray-18)]
                bg-[var(--gray-19)]
                p-3
                flex flex-col gap-2
              "
            >
              <div className="px-2 pt-1 pb-2">
                <div className="text-sm font-semibold text-[var(--text-lt)]">
                  Select a plan
                </div>
                <div className="text-xs text-[var(--gray-12)]">
                  Flip flags in the JSON matrix to change what each plan includes.
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {plans.map((p) => {
                  const isActive = p.id === activePlan.id
                  const isSelected = p.id === draft.selectedPlanId
                  const Icon = primaryPlanIcon(p)

                  return (
                    <button
                      key={p.id}
                      onClick={() => onSelectPlan(p.id)}
                      className={`
                        flex items-start gap-3
                        rounded-2xl
                        border
                        px-3 py-3
                        text-left
                        transition-all duration-300
                        ${isSelected ? "border-[var(--gray-14)] bg-[var(--gray-18)]" : "border-[var(--gray-18)] bg-[var(--gray-19)] hover:border-[var(--gray-14)]"}
                      `}
                      aria-pressed={isSelected}
                    >
                      <div
                        className="
                          mt-[2px]
                          w-8 h-8
                          rounded-2xl
                          border border-[var(--gray-18)]
                          bg-[var(--gray-19)]
                          flex items-center justify-center
                          shrink-0
                        "
                      >
                        <Icon className="w-4 h-4 text-[var(--text)]" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-sm font-semibold text-[var(--text-lt)] truncate">
                            {p.name}
                          </div>
                          <div className="text-sm font-semibold text-[var(--text-lt)] shrink-0">
                            {p.priceMonthly}
                            <span className="text-[10px] text-[var(--gray-12)]">/mo</span>
                          </div>
                        </div>

                        <div className="mt-1 flex items-center gap-2 flex-wrap">
                          {p.highlight ? chip("Best value") : null}
                          {isActive ? chip("Current") : null}
                          {isSelected && !isActive ? chip("Selected") : null}
                        </div>

                        <div className="mt-2 text-xs text-[var(--gray-12)] line-clamp-2">
                          {p.description}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* RIGHT: TOGGLES BETWEEN DETAILS and COMPARISON */}
            <div
              className="
                flex-1
                rounded-2xl
                border border-[var(--gray-18)]
                bg-[var(--gray-19)]
                min-w-0
                overflow-hidden
              "
            >
              {/* === DETAILS VIEW === */}
              {!compareOpen ? (
                <div className="p-5 flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-6">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {(() => {
                          const Icon = primaryPlanIcon(selectedPlan)
                          return <Icon className="w-5 h-5 text-[var(--text)]" />
                        })()}
                        <div className="text-lg font-semibold text-[var(--text-lt)] truncate">
                          {selectedPlan.name}
                        </div>
                      </div>

                      <div className="mt-2 text-sm text-[var(--gray-12)]">
                        {selectedPlan.description}
                      </div>

                      <div className="mt-3 flex items-center gap-2 flex-wrap">
                        {selectedPlan.highlight ? chip("Best value") : null}
                        {selectedPlan.id === activePlan.id ? chip("Current") : null}
                        {selectedPlan.id !== activePlan.id ? chip(`Action: ${actionLabel}`) : null}
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <div className="text-3xl font-semibold text-[var(--text-lt)]">
                        {selectedPlan.priceMonthly}
                      </div>
                      <div className="text-xs text-[var(--gray-12)]">per month</div>

                      <div className="mt-4 flex justify-end">
                        {selectedPlan.id === activePlan.id ? (
                          <button
                            className="
                              inline-flex items-center gap-2 justify-center
                              px-4 py-3
                              rounded-2xl
                              border border-[var(--gray-18)]
                              bg-[var(--gray-19)]
                              text-sm font-semibold
                              text-[var(--gray-12)]
                              cursor-not-allowed
                            "
                            disabled
                          >
                            Current
                          </button>
                        ) : (
                          <button
                            onClick={onChangePlan}
                            className="
                              inline-flex items-center gap-2 justify-center
                              px-4 py-3
                              rounded-2xl
                              border border-[var(--gray-17)]
                              bg-[var(--gray-19)]
                              text-sm font-semibold
                              text-[var(--text)]
                              hover:border-[var(--gray-14)]
                              transition-all duration-300
                            "
                          >
                            {actionLabel}
                            <ChevronRight className="w-4 h-4 opacity-80" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <Divider />

                  {/* “What you get” pulled from the matrix */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-sm font-semibold text-[var(--text-lt)]">
                        What you get
                      </div>
                      <div className="text-xs text-[var(--gray-12)]">
                        Matrix-driven (edit booleans/values in this file)
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {selectedFeaturesShortList.map((it) => (
                        <div
                          key={it.label}
                          className="
                            flex items-center justify-between gap-3
                            rounded-2xl
                            border border-[var(--gray-18)]
                            bg-[var(--gray-19)]
                            px-4 py-3
                          "
                        >
                          <div className="text-sm text-[var(--text)] min-w-0 truncate">
                            {it.label}
                          </div>

                          {it.type === "value" ? (
                            <div className="text-xs text-[var(--gray-12)] shrink-0">
                              {it.valueText}
                            </div>
                          ) : (
                            <span className="text-[var(--gray-12)] shrink-0">
                              <Check className="w-4 h-4" />
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="text-xs text-[var(--gray-12)]">
                      Use “Compare features” to see everything.
                    </div>
                  </div>
                </div>
              ) : (
                /* === COMPARISON VIEW (matrix-driven) === */
                <div className="flex flex-col h-full">
                  <div className="px-5 py-4 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-[var(--text-lt)]">
                        Feature comparison
                      </div>
                      <div className="text-xs text-[var(--gray-12)]">
                        All rows come from the JSON matrix above.
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {plans.map((p) => {
                        const Icon = primaryPlanIcon(p)
                        const isSel = p.id === draft.selectedPlanId
                        return (
                          <div
                            key={`legend-${p.id}`}
                            className={`
                              flex items-center gap-2
                              px-3 py-2
                              rounded-2xl
                              border
                              text-xs
                              ${isSel ? "border-[var(--gray-14)] bg-[var(--gray-18)] text-[var(--text)]" : "border-[var(--gray-18)] bg-[var(--gray-19)] text-[var(--gray-12)]"}
                            `}
                            title={p.name}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            <span className="max-w-[120px] truncate">{p.name}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <Divider />

                  <div className="flex-1 overflow-y-auto scrollbar px-5 py-4">
                    <div className="flex flex-col gap-4">
                      {groups.map(({ group, rows }) => (
                        <div key={group} className="flex flex-col gap-2">
                          <div className="text-xs font-semibold text-[var(--gray-12)] px-1">
                            {group.toUpperCase()}
                          </div>

                          <div className="flex flex-col gap-2">
                            {rows.map((def) => (
                              <div
                                key={def.key}
                                className="
                                  flex items-center justify-between gap-3
                                  rounded-2xl
                                  border border-[var(--gray-18)]
                                  bg-[var(--gray-19)]
                                  px-4 py-3
                                "
                              >
                                <div className="text-sm text-[var(--text)] min-w-0 truncate">
                                  {def.label}
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  {plans.map((p) => {
                                    const cell = getCell(p, def)
                                    const isSel = p.id === draft.selectedPlanId

                                    return (
                                      <div
                                        key={`${p.id}-${def.key}`}
                                        className={`
                                          min-w-[92px]
                                          h-9
                                          px-3
                                          rounded-2xl
                                          border
                                          flex items-center justify-center
                                          ${isSel ? "border-[var(--gray-17)] bg-[var(--gray-18)]" : "border-[var(--gray-18)] bg-[var(--gray-19)]"}
                                        `}
                                        title={p.name}
                                      >
                                        {def.type === "boolean" ? (
                                          cell.kind === "boolean" && cell.enabled ? (
                                            <span className="text-[var(--gray-12)]">
                                              <Check className="w-4 h-4" />
                                            </span>
                                          ) : (
                                            <span className="block w-4 h-4" />
                                          )
                                        ) : (
                                          <div className="text-xs text-[var(--gray-12)]">
                                            {cell.kind === "value" ? cell.text : ""}
                                          </div>
                                        )}
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Divider />

                  {/* Bottom action bar stays inside comparison */}
                  <div className="px-5 py-4 flex items-center justify-between gap-4">
                    <div className="text-xs text-[var(--gray-12)]">
                      Selected:{" "}
                      <span className="text-[var(--text)] font-semibold">
                        {selectedPlan.name}
                      </span>
                    </div>

                    {selectedPlan.id === activePlan.id ? (
                      <button
                        className="
                          inline-flex items-center gap-2 justify-center
                          px-4 py-3
                          rounded-2xl
                          border border-[var(--gray-18)]
                          bg-[var(--gray-19)]
                          text-sm font-semibold
                          text-[var(--gray-12)]
                          cursor-not-allowed
                        "
                        disabled
                      >
                        Current
                      </button>
                    ) : (
                      <button
                        onClick={onChangePlan}
                        className="
                          inline-flex items-center gap-2 justify-center
                          px-4 py-3
                          rounded-2xl
                          border border-[var(--gray-17)]
                          bg-[var(--gray-19)]
                          text-sm font-semibold
                          text-[var(--text)]
                          hover:border-[var(--gray-14)]
                          transition-all duration-300
                        "
                      >
                        {actionLabel}
                        <ChevronRight className="w-4 h-4 opacity-80" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <Divider />

        {/* ================= PAYMENT ================= */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="text-lg font-medium tracking-wide text-[var(--text-lt)]">
                Payment method
              </div>
              <div className="text-sm text-[var(--text)]">(manage)</div>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-[var(--gray-18)] bg-[var(--gray-19)] px-6 py-5">
            <div className="flex items-start justify-between gap-6">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[var(--text)]" />
                  <div className="text-sm font-semibold text-[var(--text-lt)]">
                    {draft.payment.brand} •••• {draft.payment.last4}
                  </div>
                </div>

                <div className="mt-2 text-sm text-[var(--text)]">
                  Expires <span className="font-semibold">{draft.payment.exp}</span>
                  {" · "}
                  <span className="text-[var(--gray-12)]">{draft.payment.nameOnCard}</span>
                </div>
              </div>

              <div className="shrink-0 flex items-start gap-2">
                <span className="mt-[2px] text-[var(--gray-12)]">
                  <Shield className="w-4 h-4" />
                </span>
                <div className="text-xs text-[var(--gray-12)] max-w-[220px] text-right">
                  Payment details are stored securely.
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                className="
                  inline-flex items-center gap-2 justify-center
                  px-4 py-3
                  rounded-2xl
                  border border-[var(--gray-17)]
                  bg-[var(--gray-19)]
                  text-sm font-semibold
                  text-[var(--text)]
                  hover:border-[var(--gray-14)]
                  transition-all duration-300
                "
              >
                Update payment method
                <ChevronRight className="w-4 h-4 opacity-80" />
              </button>
            </div>

            <div className="text-xs text-[var(--gray-12)]">
              Billing history and invoices will appear here once wired.
            </div>
          </div>
        </div>
      </div>

      {/* ================= FOOT NOTE ================= */}
      <div className="text-sm text-[var(--gray-12)]">
        Edit the plan JSON matrix at the top of this file to change what each plan includes.
      </div>
    </div>
  )
}
