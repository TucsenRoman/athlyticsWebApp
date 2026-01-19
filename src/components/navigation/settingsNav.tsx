// src/features/settings/components/SettingsNav.tsx
"use client";

import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/utils/utils";

import {
  UserRound,
  Paintbrush,
  Bell,
  ShieldCheck,
  Archive as ArchiveIcon,
  FlaskConical,
  CreditCard,
  MessageSquareHeart,
  BotMessageSquare,
  MessagesSquare,
} from "lucide-react";

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

export type SettingsNavItem = {
  id: string;
  label: string;
  route: string;
  icon: React.ReactNode;
  enabled?: boolean;
};

/* ========================================================================== */
/* DATA                                                                       */
/* ========================================================================== */

export const SETTINGS_NAV: SettingsNavItem[] = [
  {
    id: "profile",
    label: "Profile",
    route: "/settings/profile",
    icon: <UserRound className="h-5 w-5" />,
  },
  {
    id: "appearance",
    label: "Appearance",
    route: "/settings/appearance",
    icon: <Paintbrush className="h-5 w-5" />,
    enabled: false,
  },
  {
    id: "notifications",
    label: "Notifications",
    route: "/settings/notifications",
    icon: <Bell className="h-5 w-5" />,
    enabled: false,
  },
  {
    id: "security",
    label: "Security",
    route: "/settings/security",
    icon: <ShieldCheck className="h-5 w-5" />,
  },
  {
    id: "storage",
    label: "Storage",
    route: "/settings/storage",
    icon: <ArchiveIcon className="h-5 w-5" />,
    enabled: false,
  },
  {
    id: "experiments",
    label: "Experiments",
    route: "/settings/experiments",
    icon: <FlaskConical className="h-5 w-5" />,
    enabled: false,
  },
  {
    id: "billing",
    label: "Plan & Billing",
    route: "/settings/billing",
    icon: <CreditCard className="h-5 w-5" />,
    enabled: false,
  },
  {
    id: "support",
    label: "Support",
    route: "/settings/support",
    icon: <MessageSquareHeart className="h-5 w-5" />,
    enabled: false,
  },
  {
    id: "feedback",
    label: "Feedback",
    route: "/settings/feedback",
    icon: <MessagesSquare className="h-5 w-5" />,
    enabled: false,
  },
  {
    id: "ai",
    label: "AI Assistant",
    route: "/settings/aiassistant",
    icon: <BotMessageSquare className="h-5 w-5" />,
    enabled: false,
  },
];

/* COMPONENT */
export default function SettingsNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (route: string) =>
    location.pathname === route || location.pathname.startsWith(route + "/");

  const visibleItems = SETTINGS_NAV.filter((item) => item.enabled !== false);

  return (
    <div className="flex flex-col gap-2">
      {visibleItems.map((item) => {
        const active = isActive(item.route);

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => navigate(item.route)}
            className={cn(
              "w-full text-left rounded-xl px-3 py-3",
              "transition",
              "bg-white/5 hover:bg-white/8",
              active && "bg-white/10 ring-1 ring-white/10"
            )}
          >
            <div className="flex items-center gap-3">
              <span className={cn("shrink-0", active ? "text-white/90" : "text-white/55")}>
                {item.icon}
              </span>

              <div className="min-w-0">
                <div className={cn("text-sm font-medium truncate", active ? "text-white/90" : "text-white/70")}>
                  {item.label}
                </div>
                {/* removed route display */}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
