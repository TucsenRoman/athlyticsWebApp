// src/pages/settings/experiments/ExperimentsSettingsPage.tsx
"use client";

import { FlaskConical, Sparkles, Radar, BarChart3, Bot } from "lucide-react";

const MOCK = [
  {
    title: "Smart scheduling",
    description: "Suggests practice templates based on your weekly patterns.",
    status: "Enabled",
    flavor: "bg-[var(--fvr-blue-lt)]",
    icon: <Bot className="h-4 w-4" />,
  },
  {
    title: "Advanced analytics",
    description: "Extra trend surfaces and athlete insight cards.",
    status: "Disabled",
    flavor: "bg-[var(--fvr-purple-lt)]",
    icon: <BarChart3 className="h-4 w-4" />,
  },
  {
    title: "New UI polish",
    description: "Refined surfaces and micro-interactions across the app.",
    status: "Enabled",
    flavor: "bg-[var(--dom-bg)]",
    icon: <Sparkles className="h-4 w-4" />,
  },
];

export default function ExperimentsSettingsPage() {
  return (
    <div className="space-y-8">
      <Header
        title="Experiments"
        description="Early access features. Expect occasional changes."
      />

      <SectionLabel>Beta Features</SectionLabel>
      <Card>
        {MOCK.map((f) => (
          <div
            key={f.title}
            className={`rounded-lg border border-[var(--border)] ${f.flavor} p-4`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="text-[var(--text)] mt-[2px]">{f.icon}</span>
                <div>
                  <div className="text-sm font-medium text-[var(--text-dk)]">
                    {f.title}
                  </div>
                  <div className="text-sm text-[var(--text)] mt-1">
                    {f.description}
                  </div>
                </div>
              </div>

              <span
                className={`
                  text-xs px-2 py-1 rounded-full
                  ${
                    f.status === "Enabled"
                      ? "bg-[var(--success-bg)] text-[var(--success)]"
                      : "bg-[var(--gray-200)] text-[var(--text-dk)]"
                  }
                `}
              >
                {f.status}
              </span>
            </div>
          </div>
        ))}

        <Divider />

        <div className="rounded-lg bg-[var(--gray-50)] border border-[var(--border)] p-4">
          <div className="flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-[var(--text)]" />
            <span className="text-sm font-medium text-[var(--text-dk)]">
              Note
            </span>
          </div>
          <p className="text-sm text-[var(--text)] mt-1">
            Experimental features are optional and may change without notice.
          </p>
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
