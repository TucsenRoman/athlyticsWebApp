// src/components/navigation/AppNavPanel.tsx
"use client";

import * as React from "react";
import { cn } from "@/utils/utils";
import { Button } from "@/components/ui/actions/button";

import {
  Search,
  SlidersHorizontal,
  Plus,
  Trash2,
  Archive,
  Box,
  //Compass,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  UserRoundCog,
  Bell,
} from "lucide-react";
import { Divider } from "../ui";

import { useLocation, useNavigate } from "react-router-dom";
import ProgramDrivePanel from "@/features/program/components/ProgramDrivePanel";
import SettingsNav, { SETTINGS_NAV } from "./settingsNav";

/* TYPES */
type TabItem = {
  key: "profile" | "program" | "discovery" | (string & {});
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  active?: boolean;
  disabled?: boolean;
};

interface AppNavPanelProps {
  // OVERLAID PAGE CONTENT ~Why are we passing this?
  children: React.ReactNode;

  // CONTENT
  title?: string;
  subtitle?: string;
  showCollapseChevron?: boolean;

  panelUtilities?: React.ReactNode | null;
  panelBody?: React.ReactNode | null;

  tabs?: TabItem[];
  tabRoutes?: Partial<Record<TabItem["key"], string>>;

  // MISC
  className?: string;

  open?: boolean;
  onOpenChange?: (open: boolean) => void;

  drawerWidthClassName?: string;
  railWidthClassName?: string;
}

/* ========================================================================== */
/* DEFAULTS                                                                   */
/* ========================================================================== */

const DEFAULT_TABS: TabItem[] = [
  { key: "profile", label: "Profile", icon: UserRoundCog, active: false },
  { key: "program", label: "Program", icon: Box, active: true },
  { key: "discovery", label: "Discovery", icon: Sparkles, active: false },
];

/* ========================================================================== */
/* COMPONENT                                                                  */
/* ========================================================================== */

export default function AppNavPanel({
  title = "Tucsen Roman",
  subtitle = "@tucsenromanISD728",
  showCollapseChevron = true,
  children,
  tabs = DEFAULT_TABS,
  className,

  open,
  onOpenChange,
  drawerWidthClassName = "w-[300px]",
  railWidthClassName = "w-[64px]",

}: AppNavPanelProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);

  const isControlled = typeof open === "boolean";
  const isOpen = isControlled ? open : internalOpen;

  const setOpen = (next: boolean) => {
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  const navigate = useNavigate();
  const location = useLocation();

  const tabRouteMap: Partial<Record<TabItem["key"], string>> = {
    profile: "/settings/profile",
    program: "/program/workspace",
    discovery: "/preview/discovery",
  };

  const isProgramScoped = location.pathname === "/program" || location.pathname.startsWith("/program/");
  const isSettingScoped = location.pathname === "/settings" || location.pathname.startsWith("/settings/");
  const isSettingsItemActive = (route: string) =>
    location.pathname === route || location.pathname.startsWith(route + "/");

  const isTabActive = (key: TabItem["key"]) => {
  const path = tabRouteMap[key];
  if (!path) return false;
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

    const activeTab =
    tabs.find((t) => isTabActive(t.key as TabItem["key"])) ??
    tabs.find((t) => t.active) ??
    tabs[1];

  const ActiveIcon = activeTab?.icon ?? Box;

  return (
    <div className={cn("relative min-h-[100dvh] w-full overflow-hidden", className)}>
      {/* PAGE CONTENT */}
      <div className="relative z-0 min-h-[100dvh] w-full">
        {children}
      </div>

      {/* CLOSED RAIL */}
      <div
        className={cn(
          "fixed left-0 top-0 z-40 h-[100dvh]",
          railWidthClassName,
          "transition-opacity duration-200",
          isOpen ? "pointer-events-none opacity-0" : "opacity-100"
        )}
      >
        <div
          className={cn(
            "flex flex-col justify-around items-center",
            "h-full w-full",
            // dark sheet like image
            "bg-[#181818]",
            "backdrop-blur-md",
            "border-r border-white/10"
          )}
        >
          <div className="flex h-[64px] items-center justify-center">
            <button
              type="button"
              aria-label="Open panel"
              onClick={() => setOpen(true)}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full",
                "text-white/70 hover:bg-white/10"
              )}
            >
              <PanelLeftOpen className="h-6 w-6" />
            </button>
          </div>

          <Divider color="var(--gray-12)" inset={5} />

          <div className="flex-1 flex flex-col items-center justify-start gap-2 py-3">
            {isSettingScoped
              ? SETTINGS_NAV.filter((i) => i.enabled !== false).map((item) => {
                  const active = isSettingsItemActive(item.route);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      aria-label={item.label}
                      title={item.label}
                      onClick={() => navigate(item.route)}
                      className={cn(
                        "flex items-center justify-center",
                        "h-10 w-10 rounded-full",
                        "transition",
                        active ? "bg-white/12 ring-1 ring-white/10" : "bg-transparent hover:bg-white/10"
                      )}
                    >
                      <span className={cn(active ? "text-white/85" : "text-white/55")}>
                        {item.icon}
                      </span>
                    </button>
                  );
                })
              : null}
          </div>

          <Divider color="var(--gray-12)" inset={5} />

          <div className="flex items-center justify-center h-[64px]">
            <button
              type="button"
              aria-label="Open panel"
              onClick={() => setOpen(true)}
              className={cn(
                "flex h-8 w-10 items-center justify-center rounded-full",
                "bg-white/10 text-white/80 hover:bg-white/15"
              )}
            >
              <ActiveIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* OVERLAY (only when open) */}
      <button
        type="button"
        aria-label="Close panel"
        onClick={() => setOpen(false)}
        className={cn(
          "fixed inset-0 z-40",
          // "bg-black/35",
          // "backdrop-blur-[2px]",
          "transition-opacity duration-200",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />

      {/* DRAWER */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-[100dvh]",
          drawerWidthClassName,
          "transition-transform duration-200 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          // tuned “glass” look like screenshot
          "bg-[#181818]",
          "backdrop-blur-xl",
          "border-r border-white/10",
          "shadow-[0_30px_90px_rgba(0,0,0,0.45)]"
        )}
      >
        <div className="flex h-full flex-col">
          {/* HEADER */}
          <div className="h-[64px] px-4">
            <div className="flex h-full items-center justify-between">
              <div className="min-w-0">
                <div className="truncate text-xl font-semibold text-[var(--text-lt)]">
                  {title}
                </div>
                <div className="truncate text-xs text-[var(--text)]">
                  {subtitle}
                </div>
              </div>

              <div className="flex gap-0.5">
                <button
                  type="button"
                  aria-label="Notifications"
                  onClick={null}
                  className={cn(
                    "relative flex h-9 w-9 items-center justify-center rounded-full",
                    "text-[var(--text)] hover:bg-white/10"
                  )}
                >
                  <Bell className="h-5 w-5" />
                  <div className="absolute top-[6.5px] right-[9.5px] w-[8px] h-[8px] rounded-full border border-[var(--gray-19)] bg-[#596f7e] shadow-inner" />
                </button>
              
                {showCollapseChevron && (
                  <button
                    type="button"
                    aria-label="Collapse panel"
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full",
                      "text-[var(--text)] hover:bg-white/10"
                    )}
                  >
                    <PanelLeftClose className="h-6 w-6" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <Divider color="var(--gray-18)" inset={5} />

          {/* PAGE SPECIFIC CONTENT */}
          <div className="flex-1 overflow-y-auto p-3">
            {isProgramScoped ? <ProgramDrivePanel /> : null}
            {isSettingScoped ? <SettingsNav /> : null }
          </div>

          <Divider color="var(--gray-18)" inset={5} />

          {/* NAV TAB */}
          <div className="h-[64px]">
            {/* border-t border-[var(--gray-18)] bg-[var(--gray-19)] */}
            <div className="flex justify-around h-full px-2">
              {tabs.slice(0, 3).map((t) => {
                const Icon = t.icon;
                const isActive = isTabActive(t.key as TabItem["key"]);

                return (
                  <button
                    key={t.key}
                    type="button"
                    disabled={t.disabled}
                    onClick={() => {
                        const path = tabRouteMap[t.key as TabItem["key"]];
                        if (!path) return;
                        navigate(path);
                        setOpen(false); // close drawer after nav
                    }}
                    className={cn(
                        "relative flex h-full flex-col items-center justify-center gap-1",
                        t.disabled && "opacity-50"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <div
                      className={cn(
                        "flex h-8 w-10 items-center justify-center rounded-full",
                        isActive ? "bg-[#394650]" : "bg-transparent"
                      )}
                    >
                      <Icon className={cn("h-4 w-4", isActive ? "text-white/85" : "text-white/45")} />
                    </div>

                    <div className={cn("text-[10px] leading-none", isActive ? "text-white/55" : "text-white/30")}>
                      {t.label}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
