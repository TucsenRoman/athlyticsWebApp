// src/pages/settings/_components/SettingsUI.tsx
"use client";

export function SettingsHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <header className="mb-8">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-1 text-sm text-[var(--text-muted)] max-w-xl">
        {description}
      </p>
    </header>
  );
}

export function SettingsCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--bg)] shadow-sm">
      <div className="px-6 py-4 border-b border-[var(--border)]">
        <h3 className="font-medium">{title}</h3>
        {description && (
          <p className="text-sm text-[var(--text-muted)]">{description}</p>
        )}
      </div>
      <div className="px-6 py-5 space-y-4">{children}</div>
    </section>
  );
}

export function SettingsRow({
  label,
  value,
  action,
  danger,
}: {
  label: string;
  value?: string;
  action?: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <div
      className={`
        flex items-center justify-between gap-4
        rounded-lg px-4 py-3
        ${
          danger
            ? "bg-[var(--danger-bg)] text-[var(--danger)]"
            : "bg-[var(--gray-100)]"
        }
      `}
    >
      <div>
        <div className="font-medium">{label}</div>
        {value && (
          <div className="text-sm text-[var(--text-muted)]">{value}</div>
        )}
      </div>
      {action}
    </div>
  );
}
