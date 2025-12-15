// src/pages/settings/storage/StorageSettingsPage.tsx
"use client";

import { Archive, Database, Image, FileText } from "lucide-react";

const MOCK = {
  limitGB: 5,
  usedGB: 2.4,
  breakdown: [
    { label: "Ledgers", icon: <Database className="h-4 w-4" />, size: "1.6 GB" },
    { label: "Media", icon: <Image className="h-4 w-4" />, size: "0.8 GB" },
    { label: "Exports", icon: <FileText className="h-4 w-4" />, size: "0.0 GB" },
  ],
};

export default function StorageSettingsPage() {
  const pct = Math.min(100, Math.round((MOCK.usedGB / MOCK.limitGB) * 100));

  return (
    <div className="space-y-8">
      <Header
        title="Storage"
        description="Monitor usage across your account and installed content."
      />

      <SectionLabel>Usage</SectionLabel>
      <Card>
        <div className="rounded-lg bg-[var(--fvr-green-lt)] border border-[var(--border)] p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Archive className="h-4 w-4 text-[var(--success)]" />
              <span className="text-sm font-medium text-[var(--text-dark)]">
                Storage used
              </span>
            </div>
            <span className="text-sm text-[var(--text)]">
              {MOCK.usedGB} GB of {MOCK.limitGB} GB
            </span>
          </div>

          <div className="mt-3 h-2 rounded-full bg-[var(--gray-200)] overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--success)]"
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="mt-2 text-xs text-[var(--text)]">{pct}% used</div>
        </div>

        <Divider />

        <div className="grid grid-cols-1 gap-3">
          {MOCK.breakdown.map((b) => (
            <div
              key={b.label}
              className="flex items-center justify-between gap-4 rounded-lg bg-[var(--gray-100)] px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-[var(--text)]">{b.icon}</span>
                <span className="text-sm font-medium text-[var(--text-dark)]">
                  {b.label}
                </span>
              </div>
              <span className="text-sm text-[var(--text)]">{b.size}</span>
            </div>
          ))}
        </div>
      </Card>

      <SectionLabel>Cleanup</SectionLabel>
      <Card>
        <div className="rounded-lg bg-[var(--gray-50)] border border-[var(--border)] p-4">
          <div className="text-sm font-medium text-[var(--text-dark)]">
            Recommended cleanup
          </div>
          <p className="text-sm text-[var(--text)] mt-1">
            Remove unused media and older exports to keep storage lean.
          </p>
          <button
            className="
              mt-3 px-4 py-2 rounded-lg
              bg-[var(--accent)] text-white
              hover:opacity-90 transition-opacity
            "
          >
            Review cleanup
          </button>
        </div>
      </Card>
    </div>
  );
}

/* ============================= UI PRIMITIVES ============================= */

function Header({ title, description }: { title: string; description: string }) {
  return (
    <header>
      <h1 className="text-lg font-semibold text-[var(--text-dark)]">{title}</h1>
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
