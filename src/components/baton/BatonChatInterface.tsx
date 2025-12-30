"use client";

import { X, Bot, BotMessageSquare, UserRound } from "lucide-react";
import { usePushPanel } from "@/contexts/PushPanelContext";
import { cn } from "@/utils/utils";

export default function BatonChatInterface() {
  const { setOpen } = usePushPanel();

  return (
    <div className="h-full flex flex-col bg-[var(--bg)]">
      {/* CHAT BODY */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {/* SYSTEM INTRO */}
        <Message
          role="assistant"
          icon={<Bot className="h-4 w-4" />}
          accent
        >
          I’m Baton — your assistant for navigation, data entry, and quick
          answers across Athlytics.
        </Message>

        <Message role="assistant" icon={<Bot className="h-4 w-4" />}>
          You can ask things like:
          <ul className="list-disc list-inside mt-1 text-xs text-[var(--text)]">
            <li>“Add a meet on Friday”</li>
            <li>“Where do I edit attendance?”</li>
            <li>“Show me sprint PRs from last season”</li>
          </ul>
        </Message>

        {/* USER */}
        <Message role="user" icon={<UserRound className="h-4 w-4" />}>
          Where do I manage attendance?
        </Message>

        {/* ASSISTANT */}
        <Message role="assistant" icon={<Bot className="h-4 w-4" />}>
          Attendance lives in <strong>Workspace → Attendance</strong>.
          <br />
          You can mark all-present days, log absences, and add notes per athlete.
        </Message>

        {/* USER */}
        <Message role="user" icon={<UserRound className="h-4 w-4" />}>
          Can I save practice templates?
        </Message>

        {/* ASSISTANT */}
        <Message role="assistant" icon={<Bot className="h-4 w-4" />}>
          Yes — schedules and events can be saved as templates and reused across
          weeks or programs.
        </Message>

        {/* FUTURE */}
        <div className="text-xs text-center text-[var(--gray-500)] pt-2">
          Baton will learn as features expand.
        </div>
      </div>

      {/* INPUT (STATIC MOCK) */}
      <footer className="border-t border-[var(--border)] p-3 bg-[var(--gray-50)]">
        <div
          className="
            flex items-center gap-2
            border border-[var(--border)]
            rounded-lg
            bg-[var(--bg)]
            px-3 py-2
          "
        >
          <input
            type="text"
            placeholder="Ask Baton anything…"
            disabled
            className="
              flex-1
              bg-transparent
              text-sm
              text-[var(--text-dark)]
              placeholder:text-[var(--gray-500)]
              outline-none
              cursor-not-allowed
            "
          />
        </div>
      </footer>
    </div>
  );
}

/* ========================================================================== */
/* MESSAGE BUBBLE                                                             */
/* ========================================================================== */

function Message({
  role,
  icon,
  children,
  accent,
}: {
  role: "assistant" | "user";
  icon: React.ReactNode;
  children: React.ReactNode;
  accent?: boolean;
}) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex gap-2",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <div
          className="
            h-6 w-6
            rounded-full
            flex items-center justify-center
            bg-[var(--gray-200)]
            text-[var(--text)]
            flex-shrink-0
          "
        >
          {icon}
        </div>
      )}

      <div
        className={cn(
          `
          max-w-[80%]
          rounded-lg
          px-3 py-2
          text-sm
          `,
          isUser
            ? "bg-[var(--accent-bg)] text-[var(--text-dark)]"
            : accent
            ? "bg-[var(--accent-bg)] text-[var(--text-dark)]"
            : "bg-[var(--gray-lt)] text-[var(--text-dark)]"
        )}
      >
        {children}
      </div>

      {isUser && (
        <div
          className="
            h-6 w-6
            rounded-full
            flex items-center justify-center
            bg-[var(--gray-300)]
            text-[var(--text)]
            flex-shrink-0
          "
        >
          {icon}
        </div>
      )}
    </div>
  );
}
