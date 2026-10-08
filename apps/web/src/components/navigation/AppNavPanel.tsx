// src/components/navigation/AppNavPanel.tsx
"use client"

import * as React from "react"
import { cn } from "@/utils/utils"

import {
  Box,
  Sparkles,
  UserRoundCog,
  PanelLeftClose,
  PanelLeftOpen,
  Bell,
  BotMessageSquare,
} from "lucide-react"

import { Divider } from "../ui"
import { useLocation, useNavigate } from "react-router-dom"

import SettingsNav, { SETTINGS_NAV } from "./settingsNav"
import ProgramNav, { RailNav } from "@/components/navigation/ProgramNav"
import ProgramDriveTrigger from "@/features/program/components/ProgramDriveTrigger"
import { useProgram } from "@/features/program/useProgram"

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

type TabItem = {
  key: "settings" | "program" | "discovery" | (string & {})
  label: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  active?: boolean
  disabled?: boolean
}

interface AppNavPanelProps {
  children: React.ReactNode

  title?: string
  subtitle?: string
  showCollapseChevron?: boolean

  panelUtilities?: React.ReactNode | null
  panelBody?: React.ReactNode | null

  tabs?: TabItem[]
  tabRoutes?: Partial<Record<TabItem["key"], string>>

  className?: string

  open?: boolean
  onOpenChange?: (open: boolean) => void

  drawerWidthClassName?: string
  railWidthClassName?: string
}

/* -------------------------------------------------------------------------- */
/* DEFAULTS                                                                   */
/* -------------------------------------------------------------------------- */

const DEFAULT_TABS: TabItem[] = [
  { key: "settings", label: "Settings", icon: UserRoundCog, active: false },
  { key: "program", label: "Program", icon: Box, active: true },
  // { key: "discovery", label: "Discovery", icon: Sparkles, active: false },
]

/* -------------------------------------------------------------------------- */
/* COMPONENT                                                                  */
/* -------------------------------------------------------------------------- */

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
  // PANEL WIDTHS
  const RAIL_PX = 64
  const DRAWER_PX = 300
  const HEADER_PX = 64

  const [internalOpen, setInternalOpen] = React.useState(true)

  const isControlled = typeof open === "boolean"
  const isOpen = isControlled ? open : internalOpen

  const setOpen = (next: boolean) => {
    if (!isControlled) setInternalOpen(next)
    onOpenChange?.(next)
  }

  // Desktop stays open by default; mobile starts closed (uncontrolled only).
  React.useEffect(() => {
    if (isControlled) return
    const mq = window.matchMedia("(min-width: 768px)")
    setInternalOpen(mq.matches)

    const onChange = (e: MediaQueryListEvent) => setInternalOpen(e.matches)
    if (mq.addEventListener) mq.addEventListener("change", onChange)
    else mq.addListener(onChange)

    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", onChange)
      else mq.removeListener(onChange)
    }
  }, [isControlled])

  const navigate = useNavigate()
  const location = useLocation()

  const tabRouteMap: Partial<Record<TabItem["key"], string>> = {
    settings: "/settings/profile",
    program: "/program/workspace",
    discovery: "/preview/discovery",
  }

  const isProgramScoped =
    location.pathname === "/program" || location.pathname.startsWith("/program/")
  const isSettingScoped =
    location.pathname === "/settings" || location.pathname.startsWith("/settings/")

  const isSettingsItemActive = (route: string) =>
    location.pathname === route || location.pathname.startsWith(route + "/")

  const isTabActive = (key: TabItem["key"]) => {
    if (key === "settings") return isSettingScoped
    if (key === "program") return isProgramScoped

    const path = tabRouteMap[key]
    if (!path) return false
    return location.pathname === path || location.pathname.startsWith(path + "/")
  }

  const activeTab =
    tabs.find((t) => isTabActive(t.key as TabItem["key"])) ??
    tabs.find((t) => t.active) ??
    tabs[1]

  const ActiveIcon = activeTab?.icon ?? Box

  const programApi = useProgram()

  /* ---------------------------------------------------------------------- */
  /* SHARED DRAWER CONTENT (IDENTICAL FOR DESKTOP + MOBILE)                  */
  /* ---------------------------------------------------------------------- */

  const DrawerContent = (
    <div className="flex h-full flex-col">
      {/* HEADER */}
      <div className="h-[64px] px-4">
        <div className="flex h-full items-center justify-between">
          <div className="min-w-0">
            <div className="truncate text-xl font-semibold text-[var(--text)]">
              {title}
            </div>
            <div className="truncate text-xs text-[var(--text-dk)]">
              {subtitle}
            </div>
          </div>

          <div className="flex gap-0.5">
            <button
              type="button"
              aria-label="Messages"
              onClick={null}
              className={cn(
                "relative flex h-9 w-9 items-center justify-center rounded-full",
                "text-[var(--text)] hover:bg-white/10"
              )}
            >
              <BotMessageSquare className="h-5 w-5" />
            </button>

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

      {/* BODY */}
      <div className="flex-1 min-h-0 overflow-hidden p-3">
        {isProgramScoped ? (
          <div className="relative flex flex-col gap-3 h-full min-h-0">
            <ProgramDriveTrigger
              variant="appNavPanel"
              programs={programApi.programs}
              loading={programApi.loading}
              archiveProgram={programApi.archiveProgram}
              restoreProgram={programApi.restoreProgram}
              deleteProgram={programApi.deleteProgram}
              refreshPrograms={programApi.refresh}
            />
            <div className="min-h-0 overflow-auto">
              <ProgramNav />
            </div>
          </div>
        ) : null}

        {isSettingScoped ? (
          <div className="h-full min-h-0 overflow-auto">
            <SettingsNav />
          </div>
        ) : null}
      </div>

      <Divider color="var(--gray-18)" inset={5} />

      {/* TAB ROW */}
      <div className="h-fit p-2">
        <div className="flex justify-around h-fit">
          {tabs.slice(0, 3).map((t) => {
            const Icon = t.icon
            const active = isTabActive(t.key as TabItem["key"])

            return (
              <button
                key={t.key}
                type="button"
                disabled={t.disabled}
                onClick={() => {
                  const path = tabRouteMap[t.key as TabItem["key"]]
                  if (!path) return
                  navigate(path)
                  // setOpen(false)
                }}
                className={cn(
                  "relative flex h-full flex-col items-center justify-center gap-1",
                  t.disabled && "opacity-50"
                )}
                aria-current={active ? "page" : undefined}
              >
                <div
                  className={cn(
                    "flex h-8 w-10 items-center justify-center rounded-full",
                    active ? "bg-[var(--gray-15)]" : "bg-transparent"
                  )}
                >
                  <Icon className={cn("h-4 w-4", active ? "text-white/85" : "text-white/45")} />
                </div>

                <div
                  className={cn(
                    "text-[10px] leading-none",
                    active ? "text-white/55" : "text-white/30"
                  )}
                >
                  {t.label}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )

  /* ---------------------------------------------------------------------- */
  /* MOBILE CLOSED RAIL HEADER (mini links left, open button top-right)      */
  /* ---------------------------------------------------------------------- */

  const MobileClosedRailHeader = (
    <div
      className={cn(
        "fixed left-0 right-0 top-0 z-50 md:hidden",
        "bg-[#181818] backdrop-blur-xl",
        "border-b border-[var(--gray-18)]"
      )}
    >
      <div className="h-[64px] flex items-center justify-between gap-2 px-2">
        {/* LEFT: mini nav links (same content concept as desktop rail) */}
        <div className="flex items-center gap-2 min-w-0 overflow-x-auto">
          {isSettingScoped
            ? SETTINGS_NAV.filter((i) => i.enabled !== false).map((item) => {
                const active = isSettingsItemActive(item.route)
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-label={item.label}
                    title={item.label}
                    onClick={() => navigate(item.route)}
                    className={cn(
                      "flex items-center justify-center shrink-0",
                      "h-9 w-9 rounded-full transition",
                      active
                        ? "bg-white/12 ring-1 ring-white/10"
                        : "bg-transparent hover:bg-[var(--gray-18)]"
                    )}
                  >
                    <span className={cn(active ? "text-[var(--text-lt)]" : "text-[var(--text)]")}>
                      {item.icon}
                    </span>
                  </button>
                )
              })
            : null}

          {isProgramScoped ? (
            <div className="flex items-center gap-2 min-w-0 overflow-x-auto">
              <RailNav pathname={location.pathname} navigate={(to) => navigate(to)} />
            </div>
          ) : null}
        </div>

        {/* RIGHT: open/close button */}
        <button
          type="button"
          aria-label={isOpen ? "Close panel" : "Open panel"}
          onClick={() => setOpen(!isOpen)}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full shrink-0",
            "text-[var(--text)] hover:text-[var(--text-lt)] hover:bg-white/10",
            "transition-all duration-200"
          )}
        >
          {isOpen ? <PanelLeftClose className="h-6 w-6" /> : <PanelLeftOpen className="h-6 w-6" />}
        </button>
      </div>
    </div>
  )

  /* ---------------------------------------------------------------------- */
  /* LAYOUT                                                                   */
  /* ---------------------------------------------------------------------- */

  // Desktop left padding only (mobile should not shift horizontally)
  const rootStyle = {
    ["--nav-pad" as any]: `${isOpen ? DRAWER_PX : RAIL_PX}px`,
  } as React.CSSProperties

  return (
    <div
      className={cn("relative min-h-[100dvh] w-full overflow-hidden", className)}
      style={rootStyle}
    >
      {/* MOBILE CLOSED RAIL HEADER */}
      {MobileClosedRailHeader}

      {/* PAGE CONTENT */}
      <div
        className={cn(
          "relative z-0 min-h-[100dvh] w-full",
          "transition-[padding-left] duration-200 ease-out",
          "pt-[64px] md:pt-0",
          "pl-0 md:pl-[var(--nav-pad)]"
        )}
      >
        {children}
      </div>

      {/* MOBILE OVERLAY */}
      <button
        type="button"
        aria-label="Close panel"
        onClick={() => setOpen(false)}
        className={cn(
          "fixed inset-0 z-40 md:hidden",
          "transition-opacity duration-200",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        style={{ background: "rgba(0,0,0,0.35)" }}
      />

      {/* MOBILE TOP-DOWN DRAWER (content identical to desktop) */}
      <aside
        className={cn(
          "fixed left-0 right-0 z-50 md:hidden",
          "bg-[#181818] backdrop-blur-xl",
          "border-b border-[var(--gray-18)]",
          "transition-transform duration-200 ease-out will-change-transform",
          isOpen ? "translate-y-0" : "-translate-y-[110%]"
        )}
        style={{
          top: HEADER_PX,
          height: `calc(100dvh - ${HEADER_PX}px)`,
        }}
      >
        {DrawerContent}
      </aside>

      {/* DESKTOP CLOSED RAIL (unchanged behavior) */}
      <div
        className={cn(
          "fixed left-0 top-0 z-40 hidden md:block h-[100dvh]",
          railWidthClassName,
          "transition-opacity duration-200",
          isOpen ? "pointer-events-none opacity-0" : "opacity-100"
        )}
      >
        <div
          className={cn(
            "flex h-full w-full flex-col items-center",
            "bg-[#181818]",
            "backdrop-blur-md",
            "rounded-r-sm border-r border-[var(--gray-18)]"
          )}
        >
          <div className="flex items-center justify-center py-1 h-[64px]">
            <button
              type="button"
              aria-label="Open panel"
              onClick={() => setOpen(true)}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full",
                "text-[var(--text)] hover:text-[var(--text-lt)] hover:bg-white/10",
                "transition-all duration-200"
              )}
            >
              <PanelLeftOpen className="h-6 w-6" />
            </button>
          </div>

          <Divider color="var(--gray-18)" inset={5} />

          <div className="flex-1 flex flex-col items-center justify-start gap-2 py-3">
            {isSettingScoped
              ? SETTINGS_NAV.filter((i) => i.enabled !== false).map((item) => {
                  const active = isSettingsItemActive(item.route)
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
                        active
                          ? "bg-white/12 ring-1 ring-white/10"
                          : "bg-transparent hover:bg-[var(--gray-18)]"
                      )}
                    >
                      <span className={cn(active ? "text-[var(--text-lt)]" : "text-[var(--text)]")}>
                        {item.icon}
                      </span>
                    </button>
                  )
                })
              : null}

            {isProgramScoped ? (
              <div className="flex flex-col items-center gap-2 w-full">
                <RailNav pathname={location.pathname} navigate={(to) => navigate(to)} />
              </div>
            ) : null}
          </div>

          <Divider color="var(--gray-18)" inset={5} />

          <div className="flex items-center justify-center py-1">
            <button
              type="button"
              aria-label="Open panel"
              onClick={() => setOpen(true)}
              className={cn(
                "flex h-8 w-10 items-center justify-center rounded-full",
                "text-[var(--text)] hover:text-[var(--text-lt)] hover:bg-white/15",
                "transition-all duration-200"
              )}
            >
              <ActiveIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* DESKTOP DRAWER */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-[100dvh] hidden md:block",
          drawerWidthClassName,
          "transition-transform duration-200 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "bg-[var(--gray-20)]",
          "backdrop-blur-xl",
          "rounded-r-sm border-r border-[var(--gray-18)]"
        )}
      >
        {DrawerContent}
      </aside>
    </div>
  )
}
