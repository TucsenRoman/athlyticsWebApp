// src/pages/settings/appearance/AppearanceSettingsPage.tsx
"use client";

import { Paintbrush, Sun, Moon, MonitorSmartphone, LayoutGrid, ChevronsLeft, Turtle, Snail } from "lucide-react";

const MOCK = {
  theme: "System",
  density: "Comfortable",
  reducesMotion: false,
};

export default function AppearanceSettingsPage() {
  return (
    <div className="space-y-8">
      <Header
        title="Appearance"
        description="Tune the UI for focus, comfort, and clarity."
      />

      <SectionLabel>Theme</SectionLabel>
      <Card>
        <div className="grid grid-cols-3 gap-3">
          <ThemeTile
            title="Light"
            active={MOCK.theme === "Light"}
            icon={<Sun className="h-4 w-4" />}
          />
          <ThemeTile
            title="Dark"
            active={MOCK.theme === "Dark"}
            icon={<Moon className="h-4 w-4" />}
          />
          <ThemeTile
            title="System"
            active={MOCK.theme === "System"}
            icon={<MonitorSmartphone className="h-4 w-4" />}
          />
        </div>

        <Divider />

        <Hint>
          Theme affects app surfaces and overlays. System follows your OS preference.
        </Hint>
      </Card>

      <SectionLabel>Layout</SectionLabel>
      <Card>
        <Row
          icon={<LayoutGrid className="h-4 w-4" />}
          label="Interface density"
          value={MOCK.density}
          badge="Recommended"
        />
        <Row
          icon={<Snail className="h-4 w-4" />}
          label="Reduce motion"
          value={MOCK.reducesMotion ? "On" : "Off"}
        />

        <Divider />

        <div className="rounded-lg bg-[var(--fvr-blue-lt)] border border-[var(--border)] p-4">
          <div className="text-sm font-medium text-[var(--text-dk)]">
            Preview
          </div>
          <p className="text-sm text-[var(--text)] mt-1">
            This area can show sample cards, buttons, and typography later.
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

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-[var(--text)]">{children}</p>;
}

function ThemeTile({
  title,
  icon,
  active,
}: {
  title: string;
  icon: React.ReactNode;
  active?: boolean;
}) {
  return (
    <button
      className={`
        rounded-xl border p-4
        flex flex-col items-start gap-2
        transition-all cursor-pointer
        ${active ? "border-[var(--dom-dk)] bg-[var(--dom-bg)] shadow-sm" : "border-[var(--border)] bg-[var(--gray-50)] hover:shadow-inner"}
      `}
    >
      <span className={active ? "text-[var(--dom-dk)]" : "text-[var(--text)]"}>
        {icon}
      </span>
      <span className="text-sm font-medium text-[var(--text-dk)]">{title}</span>
      <span className="text-xs text-[var(--text)]">
        {active ? "Selected" : "Click to select"}
      </span>
    </button>
  );
}

function Row({
  icon,
  label,
  value,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  badge?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-[var(--gray-ltt)] px-4 py-3">
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-[var(--text)]">{icon}</span>
        <span className="text-sm font-medium text-[var(--text-dk)]">{label}</span>
        {badge && (
          <span className="text-xs px-2 py-[2px] rounded-full bg-[var(--fvr-green-lt)] text-[var(--success)] border border-[var(--border)]">
            {badge}
          </span>
        )}
      </div>
      <span className="text-sm text-[var(--text)]">{value}</span>
    </div>
  );
}
