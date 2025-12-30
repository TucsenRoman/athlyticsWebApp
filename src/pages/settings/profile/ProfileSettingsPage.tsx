// src/pages/settings/profile/ProfileSettingsPage.tsx
"use client";

import { Medal, Trophy, UserRound, BadgeCheck, Pencil } from "lucide-react";

const MOCK = {
  name: "Tucsen Roman",
  handle: "@tucsenroman129",
  role: "Head Coach",
  sport: "Cross Country",
  trophies: 57,
  bio: "Building fast systems for faster athletes.",
  email: "tucsen@example.com",
  timezone: "Central Time (US)",
  language: "English (US)",
  verified: true,
};

export default function ProfileSettingsPage() {
  return (
    <div className="space-y-8">
      <Header
        title="Profile"
        description="Your identity across programs, teams, and collaboration."
      />

      {/* Public Identity */}
      <SectionLabel>Public Identity</SectionLabel>
      <Card>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-[var(--accent)] text-white flex items-center justify-center font-semibold">
              TR
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[var(--text-dark)] truncate">
                  {MOCK.name}
                </span>
                {MOCK.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full px-2 py-[2px] text-xs bg-[var(--success-bg)] text-[var(--success)]">
                    <BadgeCheck className="h-3 w-3" />
                    Verified
                  </span>
                )}
              </div>

              <div className="text-sm text-[var(--text)] truncate">
                {MOCK.handle} • {MOCK.role} • {MOCK.sport}
              </div>

              <div className="mt-1 inline-flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[var(--fvr-yellow)] text-sm font-medium">
                  <Trophy className="h-4 w-4" />
                  {MOCK.trophies}
                </span>
                <span className="text-xs text-[var(--text)]">trophies earned</span>
              </div>
            </div>
          </div>

          <button
            className="
              inline-flex items-center gap-2
              px-3 py-2 rounded-lg
              bg-[var(--gray-200)] text-[var(--text-dark)]
              hover:bg-[var(--gray-300)] transition-colors
            "
          >
            <Pencil className="h-4 w-4 text-[var(--text)]" />
            Edit
          </button>
        </div>

        <Divider />

        <div className="rounded-lg bg-[var(--gray-ltt p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            Bio
          </div>
          <p className="mt-2 text-sm text-[var(--text-dark)]">{MOCK.bio}</p>
        </div>
      </Card>

      {/* Personal Details */}
      <SectionLabel>Personal Details</SectionLabel>
      <Card>
        <Row label="Email" value={MOCK.email} icon={<UserRound className="h-4 w-4" />} />
        <Row label="Timezone" value={MOCK.timezone} icon={<Medal className="h-4 w-4" />} />
        <Row label="Language" value={MOCK.language} icon={<Medal className="h-4 w-4" />} />
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

function Row({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-[var(--gray-ltt px-4 py-3">
      <div className="flex items-center gap-3 min-w-0">
        {icon && <span className="text-[var(--text)]">{icon}</span>}
        <span className="text-sm font-medium text-[var(--text-dark)]">{label}</span>
      </div>
      <span className="text-sm text-[var(--text)] truncate">{value}</span>
    </div>
  );
}
