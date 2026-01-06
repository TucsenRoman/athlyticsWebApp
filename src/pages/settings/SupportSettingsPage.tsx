// src/pages/settings/support/SupportSettingsPage.tsx
"use client";

import { MessageSquareHeart, LifeBuoy, Bug, Activity, BotMessageSquare, SquareArrowUpRight, PictureInPicture2 } from "lucide-react";

const MOCK = {
  status: "All systems operational",
  lastIncident: "No incidents in the last 30 days",
  email: "support@athlytics.app",
  response: "Typically within 24 hours",
  links: [
    { label: "Help Center", icon: <LifeBuoy className="h-4 w-4" /> },
    { label: "Report a bug", icon: <Bug className="h-4 w-4" /> },
    { label: "System status", icon: <Activity className="h-4 w-4" /> },
  ],
};

export default function SupportSettingsPage() {
  return (
    <div className="space-y-8">
      <Header
        title="Support"
        description="Help resources, contact options, and system status."
      />

      <SectionLabel>AI Assistant</SectionLabel>

      <Card>
        {/* ASSISTANT HEADER */}
        <div className="flex items-center gap-3 w-full">
          <div className="h-8 w-8 rounded-lg bg-[var(--dom-bg)] flex items-center justify-center">
            <BotMessageSquare className="h-4 w-4 text-[var(--dom-dk)]" />
          </div>

          <div>
            <div className="text-sm font-medium text-[var(--text-dk)]">
              Athlytics Assistant
            </div>
            <div className="flex justify-between w-full text-xs text-[var(--text)]">
              <span>Get quick answers and guidance</span>
              <PictureInPicture2 size={18} />
            </div>
          </div>
        </div>

        {/* CHAT WINDOW */}
        <div
          className="
            mt-4 rounded-lg
            border border-[var(--border)]
            bg-[var(--gray-50)]
            p-3
            h-48
            overflow-y-auto
            space-y-3
          "
        >
          {/* ASSISTANT MESSAGE */}
          <div className="flex items-start gap-2">
            <div className="h-6 w-6 rounded-full bg-[var(--dom-bg)] flex items-center justify-center">
              <BotMessageSquare className="h-3 w-3 text-[var(--dom-dk)]" />
            </div>

            <div className="rounded-lg bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text-dk)] border border-[var(--border)]">
              Hi! I can help you understand features, troubleshoot issues, or guide you
              to the right settings.
            </div>
          </div>

          {/* USER MESSAGE (MOCK) */}
          <div className="flex items-start gap-2 justify-end">
            <div className="rounded-lg bg-[var(--gray-200)] px-3 py-2 text-sm text-[var(--text-dk)]">
              How do I upgrade my plan?
            </div>
          </div>

          {/* ASSISTANT RESPONSE (MOCK) */}
          <div className="flex items-start gap-2">
            <div className="h-6 w-6 rounded-full bg-[var(--dom-bg)] flex items-center justify-center">
              <BotMessageSquare className="h-3 w-3 text-[var(--dom-dk)]" />
            </div>

            <div className="rounded-lg bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text-dk)] border border-[var(--border)]">
              You can upgrade anytime from the <strong className="px-2 rounded-lg bg-[var(--link-bg)] cursor-pointer">Plan & Billing</strong> page.
              Changes take effect immediately.
            </div>
          </div>
        </div>

        {/* INPUT */}
        <div className="flex items-center gap-2 pt-3">
          <input
            placeholder="Ask a question…"
            disabled
            className="
              flex-1 rounded-lg
              border border-[var(--border)]
              bg-[var(--gray-lt)]
              px-3 py-2
              text-sm text-[var(--text-dk)]
              placeholder:text-[var(--text)]
              cursor-not-allowed
            "
          />

          <button
            disabled
            className="
              px-4 py-2 rounded-lg
              text-sm font-medium
              bg-[var(--dom-bg)]
              text-[var(--dom-dk)]
              cursor-not-allowed
            "
          >
            Send
          </button>
        </div>

        {/* FOOTNOTE */}
        <p className="text-xs text-[var(--text)] pt-1">
          AI assistance is informational and may not reflect account-specific data.
        </p>
      </Card>

      <SectionLabel>Quick Links</SectionLabel>
      <Card>
        <div className="grid grid-cols-1 gap-3">
          {MOCK.links.map((l) => (
            <button
              key={l.label}
              className="
                w-full flex items-center justify-between
                rounded-lg bg-[var(--gray-lt)] px-4 py-3
                hover:bg-[var(--gray-200)] hover:shadow-inner
                transition-colors
              "
            >
              <div className="flex items-center gap-3">
                <span className="text-[var(--text)]">{l.icon}</span>
                <span className="text-sm font-medium text-[var(--text-dk)]">{l.label}</span>
              </div>
              <span className="text-xs text-[var(--text)]">Open</span>
            </button>
          ))}
        </div>
      </Card>

      <SectionLabel>Contact</SectionLabel>
      <Card>
        <Row label="Email" value={MOCK.email} />
        <Row label="Response time" value={MOCK.response} />

        <Divider />

        <div className="rounded-lg bg-[var(--dom-bg)] border border-[var(--border)] p-4">
          <div className="flex items-center gap-2">
            <MessageSquareHeart className="h-4 w-4 text-[var(--dom-dk)]" />
            <span className="text-sm font-medium text-[var(--text-dk)]">
              Priority support
            </span>
          </div>
          <p className="text-sm text-[var(--text)] mt-1">
            Upgrade your plan to unlock faster response times and advanced help.
          </p>
        </div>
      </Card>

      <SectionLabel>Status</SectionLabel>
      <Card>
        <div className="rounded-lg bg-[var(--success-bg)] border border-[var(--border)] p-4">
          <div className="text-sm font-medium text-[var(--success)]">{MOCK.status}</div>
          <div className="text-sm text-[var(--text)] mt-1">{MOCK.lastIncident}</div>
        </div>
      </Card>
    </div>
  );
}

/* ============================= UI PRIMITIVES ============================= */

function Header({ title, description }: { title: string; description: string }) {
  return (
    <header>
      <h1 className="text-lg font-semibold text-[var(--text-dk)]">{title}</h1>
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
    <section className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-5 shadow-sm space-y-4">
      {children}
    </section>
  );
}

function Divider() {
  return <div className="border-t border-[var(--border-light)]" />;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-[var(--gray-dk)] px-4 py-3">
      <span className="text-sm font-medium text-[var(--text-dk)]">{label}</span>
      <span className="text-sm text-[var(--text)]">{value}</span>
    </div>
  );
}
