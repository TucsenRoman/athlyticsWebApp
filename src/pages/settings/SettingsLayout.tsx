"use client";

import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Menu } from "lucide-react";

import { Divider } from "@/components/ui";
import { SETTINGS_NAV } from "@/components/navigation/settingsNav";

export default function SettingsLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative flex h-full min-h-0 bg-[var(--gray-8)] shadow-inner">

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* CONTENT ---------------------------------------------------------- */}
      <main className="flex-1 min-w-0 overflow-y-auto md:ml-0">
        {/* MOBILE HEADER */}
        <div className="sticky top-0 z-20 flex items-center gap-3 px-4 py-3 border-b border-[var(--border)] bg-[var(--bg)] md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="
              h-9 w-9 rounded-lg
              flex items-center justify-center
              border border-[var(--border)]
              text-[var(--text-dk)]
            "
          >
            <Menu size={18} />
          </button>
          <div className="text-lg font-semibold text-[var(--text-dk)]">
            Settings
          </div>
        </div>

        <div className="max-w-4xl px-6 md:px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

/* ========================================================================== */
/* SUBCOMPONENTS                                                             */
/* ========================================================================== */

function SettingsModeTile({
  to,
  icon,
  label,
  onSelect,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  onSelect?: () => void;
}) {
  return (
    <NavLink to={to} end onClick={onSelect}>
      {({ isActive }) => (
        <div
          className={`
            group relative
            flex items-center gap-3
            px-4 py-3 rounded-xl
            cursor-pointer
            transition-all duration-300
            ${
              isActive
                ? `
                  bg-[var(--dom-glass)]
                  text-[var(--dom-dk)]
                  shadow-md
                  border border-[var(--dom-dk)]
                `
                : `
                  bg-[var(--gray-7)]
                  text-[var(--text)]
                  border border-transparent
                  hover:border-[var(--border)]
                `
            }
          `}
        >
          {/* ICON CHIP */}
          <div
            className={`
              h-9 w-9 rounded-lg
              flex items-center justify-center
              ${
                isActive
                  ? "bg-transparent"
                  : "bg-[var(--gray-lt)] text-[var(--text)]"
              }
            `}
          >
            {icon}
          </div>

          {/* LABEL */}
          <span className="text-sm font-semibold">{label}</span>
        </div>
      )}
    </NavLink>
  );
}
