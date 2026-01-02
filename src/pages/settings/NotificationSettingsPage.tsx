// src/pages/settings/notifications/NotificationSettingsPage.tsx
"use client";

import { Bell, Mail, MessageSquare, CalendarClock } from "lucide-react";

const MOCK = {
  email: [
    { label: "Weekly summary", status: "Enabled" },
    { label: "Schedule changes", status: "Enabled" },
    { label: "New messages", status: "Disabled" },
  ],
  inApp: [
    { label: "Mentions", status: "Enabled" },
    { label: "Package installs", status: "Enabled" },
    { label: "Attendance alerts", status: "Disabled" },
  ],
};

export default function NotificationSettingsPage() {
  return (
    <div className="space-y-8">
      <Header
        title="Notifications"
        description="Choose what you want to hear about, and where."
      />

      <SectionLabel>Email</SectionLabel>
      <Card>
        {MOCK.email.map((row) => (
          <Row
            key={row.label}
            icon={<Mail className="h-4 w-4" />}
            label={row.label}
            value={row.status}
            tone={row.status === "Enabled" ? "good" : "neutral"}
          />
        ))}
        <Divider />
        <Hint>Emails are sent at most once per hour for batching.</Hint>
      </Card>

      <SectionLabel>In-App</SectionLabel>
      <Card>
        {MOCK.inApp.map((row) => (
          <Row
            key={row.label}
            icon={<Bell className="h-4 w-4" />}
            label={row.label}
            value={row.status}
            tone={row.status === "Enabled" ? "good" : "neutral"}
          />
        ))}

        <Divider />

        <div className="grid grid-cols-2 gap-3">
          <MicroCard
            icon={<MessageSquare className="h-4 w-4" />}
            title="Quiet hours"
            value="10:00 PM – 7:00 AM"
          />
          <MicroCard
            icon={<CalendarClock className="h-4 w-4" />}
            title="Reminder lead time"
            value="15 minutes"
          />
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
    <section className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-5 shadow-sm space-y-3">
      {children}
    </section>
  );
}

function Divider() {
  return <div className="border-t border-[var(--border-light)] my-1" />;
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-[var(--text)]">{children}</p>;
}

function Row({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "good" | "neutral";
}) {
  const pill =
    tone === "good"
      ? "bg-[var(--success-bg)] text-[var(--success)]"
      : "bg-[var(--gray-200)] text-[var(--text-dk)]";

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-[var(--gray-ltt)] px-4 py-3">
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-[var(--text)]">{icon}</span>
        <span className="text-sm font-medium text-[var(--text-dk)]">{label}</span>
      </div>
      <span className={`text-xs px-2 py-1 rounded-full ${pill}`}>{value}</span>
    </div>
  );
}

function MicroCard({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--gray-50)] p-4">
      <div className="flex items-center gap-2 text-[var(--text)]">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          {title}
        </span>
      </div>
      <div className="mt-2 text-sm font-medium text-[var(--text-dk)]">{value}</div>
    </div>
  );
}
