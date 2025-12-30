"use client";

import {
  ClipboardList,
  Shield,
  Pen,
  Wand2,
  Keyboard,
  Eye,
  Lock,
  SlidersHorizontal,
  Check,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  AI ASSISTANT SETTINGS — UI ONLY                                           */
/* -------------------------------------------------------------------------- */

const NAMES = [
  { id: "baton", label: "Baton" },
  { id: "clerk", label: "Clerk"},
  { id: "marshal", label: "Marshal"},
];

export default function AssistantSettingsPage() {
  const activeName = "baton"; // MOCK

  return (
    <div className="space-y-10">
      {/* HEADER ------------------------------------------------------------ */}
      <header>
        <h1 className="text-lg font-semibold text-[var(--text-dark)]">
          Assistant
        </h1>
        <p className="text-sm text-[var(--text)]">
          Configure how your AI assistant helps with data entry, navigation, and workflows.
        </p>
      </header>

      {/* NAME -------------------------------------------------------------- */}
      <Section
        title="Assistant Name"
        description="Choose how the assistant is referenced throughout the app."
        icon={<Wand2 className="h-4 w-4" />}
      >
        <div className="flex gap-2">
          {NAMES.map((n) => {
            const active = n.id === activeName;

            return (
              <button
                key={n.id}
                className={`
                  flex items-center gap-2
                  px-4 py-2 rounded-lg text-sm font-medium
                  border transition-colors

                  ${
                    active
                      ? "border-[var(--accent)] bg-[var(--accent-bg)] text-[var(--accent)]"
                      : "border-[var(--border)] text-[var(--text-dark)] hover:bg-[var(--gray-lt)]"
                  }
                `}
              >
                {/* {n.icon} */}
                {n.label}
                {active && <Check className="h-3 w-3" />}
              </button>
            );
          })}
        </div>
      </Section>

      {/* CAPABILITIES ------------------------------------------------------ */}
      <Section
        title="Capabilities"
        description="Control what the assistant is allowed to do."
        icon={<SlidersHorizontal className="h-4 w-4" />}
      >
        <Toggle label="Assist with data entry" description="Fill attendance, rosters, and results." />
        <Toggle label="Navigate the app" description="Jump to pages, tools, and settings." />
        <Toggle label="Explain features and data" description="Answer questions about metrics, layouts, and tools." />
        <Toggle label="Suggest actions" description="Recommend next steps and improvements." />
      </Section>

      {/* COMMANDS ---------------------------------------------------------- */}
      <Section
        title="Command Style"
        description="How you prefer to interact with the assistant."
        icon={<Keyboard className="h-4 w-4" />}
      >
        <Radio label="Conversational" hint="Natural language questions and requests." active />
        <Radio label="Command-first" hint="Short, direct commands (e.g. “mark all present”)." />
        <Radio label="Silent assist" hint="Suggestions only, no proactive messages." />
      </Section>

      {/* VISIBILITY -------------------------------------------------------- */}
      <Section
        title="Visibility"
        description="Where the assistant appears in the interface."
        icon={<Eye className="h-4 w-4" />}
      >
        <Toggle label="Show assistant button" description="Floating access button in supported views." />
        <Toggle label="Inline suggestions" description="Contextual hints during data entry." />
        <Toggle label="Empty-state help" description="Guidance when pages have no data." />
      </Section>

      {/* PRIVACY ----------------------------------------------------------- */}
      <Section
        title="Privacy & Boundaries"
        description="Control what the assistant can see and reference."
        icon={<Lock className="h-4 w-4" />}
      >
        <Toggle label="Limit to current program" description="Prevent cross-program references." />
        <Toggle label="Exclude archived data" description="Ignore archived seasons and records." />
        <Toggle label="Disable analytics inference" description="Do not infer trends or performance insights." />
        <Toggle label="Ledger permissions" description="Control whether the assistant can view or assist with editing ledgers." />
      </Section>

      {/* FOOTNOTE ---------------------------------------------------------- */}
      <p className="text-xs text-[var(--text)]">
        The assistant never performs actions without confirmation.
      </p>
    </div>
  );
}

/* ========================================================================== */
/* UI PRIMITIVES                                                             */
/* ========================================================================== */

function Section({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-6 space-y-4">
      <div className="flex items-start gap-3">
        <span className="text-[var(--text)]">{icon}</span>
        <div>
          <h2 className="font-medium text-[var(--text-dark)]">{title}</h2>
          <p className="text-sm text-[var(--text)]">{description}</p>
        </div>
      </div>

      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Toggle({
  label,
  description,
}: {
  label: string;
  description: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-[var(--gray-lt)] px-4 py-3">
      <div>
        <div className="text-sm font-medium text-[var(--text-dark)]">{label}</div>
        <div className="text-xs text-[var(--text)]">{description}</div>
      </div>

      <div className="h-5 w-9 rounded-full bg-[var(--gray-300)]" />
    </div>
  );
}

function Radio({
  label,
  hint,
  active,
}: {
  label: string;
  hint: string;
  active?: boolean;
}) {
  return (
    <div
      className={`
        flex items-start gap-3 rounded-lg px-4 py-3 cursor-pointer
        transition-colors

        ${
          active
            ? "bg-[var(--accent-bg)] border border-[var(--accent)]"
            : "bg-[var(--gray-lt)] hover:bg-[var(--gray-200)]"
        }
      `}
    >
      <div
        className={`
          mt-1 h-3 w-3 rounded-full border
          ${active ? "bg-[var(--accent)] border-[var(--accent)]" : "border-[var(--gray-400)]"}
        `}
      />
      <div>
        <div className="text-sm font-medium text-[var(--text-dark)]">{label}</div>
        <div className="text-xs text-[var(--text)]">{hint}</div>
      </div>
    </div>
  );
}
