"use client";

import { NavLink, Outlet } from "react-router-dom";
import { Divider } from "@/components/ui";

import {
  UserRound,
  Paintbrush,
  Bell,
  ShieldCheck,
  Archive,
  FlaskConical,
  CreditCard,
  MessageSquareHeart,
  BotMessageSquare,
} from "lucide-react";

/* ========================================================================== */
/* COMPONENT                                                                  */
/* ========================================================================== */

export default function SettingsLayout() {
  return (
    <div className="flex h-full min-h-0 bg-[var(--bg)]">

      {/* SIDEBAR ---------------------------------------------------------- */}
      <aside
        className="
          w-64 shrink-0
          border-r border-[var(--border)]
          px-2 py-3
          flex flex-col gap-[2px]
        "
      >
        <header className="w-min ml-1 px-2 text-lg font-semibold text-[var(--text-dark)]"> Settings </header>
        <Divider 
          tone="medium"
        />

        <SettingsNavItem to="profile" icon={<UserRound />} label="Profile" />
        <SettingsNavItem to="appearance" icon={<Paintbrush />} label="Appearance" />
        <SettingsNavItem to="notifications" icon={<Bell />} label="Notifications" />
        <SettingsNavItem to="security" icon={<ShieldCheck />} label="Security" />
        <SettingsNavItem to="storage" icon={<Archive />} label="Storage" />
        <SettingsNavItem to="experiments" icon={<FlaskConical />} label="Experiments" />
        <SettingsNavItem to="billing" icon={<CreditCard />} label="Plan & Billing" />
        <SettingsNavItem to="support" icon={<MessageSquareHeart />} label="Support" />
        <SettingsNavItem to="aiassistant" icon={<BotMessageSquare />} label="AI Assistant" />
      </aside>

      {/* CONTENT ---------------------------------------------------------- */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-4xl px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

/* ========================================================================== */
/* SUBCOMPONENTS                                                             */
/* ========================================================================== */

function SettingsNavItem({
  to,
  icon,
  label,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <NavLink to={to} end>
      {({ isActive }) => (
        <div
          className={`
            group w-full flex items-center gap-2
            px-3 py-2 rounded-md
            cursor-pointer
            transition-colors

            ${
              isActive
                ? "bg-[var(--gray-200)] text-[var(--text-dark)] shadow-inner"
                : "text-[var(--text-dark)] hover:bg-[var(--gray-200)] hover:shadow-inner"
            }
          `}
        >
          {/* ICON */}
          <span
            className={`
              transition-colors
              ${
                isActive
                  ? "text-[var(--text-dark)]"
                  : "text-[var(--text)]"
              }
            `}
          >
            {icon}
          </span>

          {/* LABEL */}
          <span className="text-sm">{label}</span>
        </div>
      )}
    </NavLink>
  );
}
