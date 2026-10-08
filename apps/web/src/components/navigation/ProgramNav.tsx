// src/components/navigation/ProgramNav.tsx
"use client"

import * as React from "react"
import { useLocation, useNavigate } from "react-router-dom"
import {
  ChevronDown,
  LocateFixed,
  PencilRuler,
  PenLine,
  CalendarDays,
  UsersRound,
  Calendar1,
  Notebook,
  ClipboardList,
  Activity,
  FilePen,
  WandSparkles,
  Box,
  Settings,
} from "lucide-react"
import { cn } from "@/utils/utils"
import { Divider } from "../ui"
import ProgramDriveTrigger from "@/features/program/components/ProgramDriveTrigger"

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

type ProgramRailItem = {
  id: string
  label: string
  route: string
  icon: React.ReactNode
  enabled?: boolean
}

type SubLink = {
  id: string
  label: string
  route: string
  icon?: React.ReactNode
  enabled?: boolean
}

type ProgramNavView = {
  id: "radar" | "workspace"
  label: string
  route: string
  icon: React.ReactNode
  enabled?: boolean
  subLinks: SubLink[]
}

type ProgramNavProps = {
  size?: "sm" | "md"
  className?: string
}

/* NAV DATA (~Drawer's and rail's source of truth.) */
export const PROGRAM_VIEWS: ProgramNavView[] = [
  {
    id: "radar",
    label: "Radar",
    route: "/program/radar",
    icon: <LocateFixed className="h-5 w-5" />,
    enabled: true,
    subLinks: [
      {
        id: "attendance",
        label: "Attendance",
        route: "/program/attendance",
        icon: <UsersRound className="h-4 w-4" />,
        enabled: true,
      },
      {
        id: "notes",
        label: "Notes",
        route: "/program/notes",
        icon: <Notebook className="h-4 w-4" />,
        enabled: true,
      },
      {
        id: "plan",
        label: "Plan",
        route: "/program/plan",
        icon: <ClipboardList className="h-4 w-4" />,
        enabled: true,
      },
    ],
  },
  {
    id: "workspace",
    label: "Workspace",
    route: "/program/manager",
    icon: <PencilRuler className="h-5 w-5" />,
    enabled: true,
    subLinks: [
      {
        id: "manager",
        label: "Manager",
        route: "/program/manager",
        icon: <Settings className="h-4 w-4" />,
        // icon: <WandSparkles className="h-4 w-4" />,
        enabled: true,
      },
      {
        id: "editor",
        label: "Editor",
        route: "/program/editor",
        icon: <FilePen className="h-4 w-4" />,
        enabled: true,
      },
      {
        id: "analyzer",
        label: "Analyzer",
        route: "/program/analyzer",
        icon: <Activity className="h-4 w-4" />,
        enabled: false,
      },
      {
        id: "attendance",
        label: "Attendance",
        route: "/program/attendance",
        icon: <UsersRound className="h-4 w-4" />,
        enabled: false,
      },
      {
        id: "calendar",
        label: "Calendar",
        route: "/program/calendar",
        icon: <CalendarDays className="h-4 w-4" />,
        enabled: false,
      },
    ],
  },
]

/* ========================================================================== */
/* HELPERS                                                                    */
/* ========================================================================== */

function isActiveRoute(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(route + "/")
}

function isWorkspaceScopedPath(pathname: string) {
  return (
    pathname.startsWith("/program/workspace") ||
    pathname.startsWith("/program/manager") ||
    pathname.startsWith("/program/editor") ||
    pathname.startsWith("/program/analyzer") ||
    pathname.startsWith("/program/attendance") ||
    pathname.startsWith("/program/calendar")
  )
}

function getActiveViewForRail(pathname: string): ProgramNavView | null {
  const enabledViews = PROGRAM_VIEWS.filter((v) => v.enabled !== false)

  const match = enabledViews.find((v) => {
    if (v.id === "workspace") return isWorkspaceScopedPath(pathname)
    return isActiveRoute(pathname, v.route)
  })

  return match ?? null
}

/* ========================================================================== */
/* COMPONENT                                                                  */
/* ========================================================================== */

export default function ProgramNav({ size = "md", className }: ProgramNavProps) {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav className={cn("flex flex-col gap-3 w-full", className)} aria-label="Program navigation">
      <div className="flex flex-col gap-2 ml-2.5 pl-2 border-l border-[var(--gray-18)]">
        {PROGRAM_VIEWS.filter((v) => v.enabled !== false).map((view) => (
          <DominantViewGroup
            key={view.id}
            view={view}
            pathname={location.pathname}
            onNavigate={(route) => navigate(route)}
            size={size}
          />
        ))}
      </div>
    </nav>
  )
}

/* ========================================================================== */
/* DRAWER NAV UI                                                              */
/* ========================================================================== */

function DominantViewGroup({
  view,
  pathname,
  onNavigate,
  size,
}: {
  view: ProgramNavView
  pathname: string
  onNavigate: (route: string) => void
  size: "sm" | "md"
}) {
  const active =
    view.id === "workspace"
      ? isWorkspaceScopedPath(pathname)
      : isActiveRoute(pathname, view.route)

  const [open, setOpen] = React.useState<boolean>(true)

  const subPadY = size === "sm" ? "py-2.5" : "py-3"
  const subLinks = React.useMemo(
    () => view.subLinks.filter((s) => s.enabled !== false),
    [view.subLinks]
  )

  return (
    <div className={cn("w-full", "overflow-hidden")}>
      <div className="flex items-center gap-2 text-[var(--text)] transition-colors duration-300">
        <button
          type="button"
          onClick={() => onNavigate(view.route)}
          aria-current={active ? "page" : undefined}
          className={cn(
            "relative flex-1 flex items-center gap-3",
            "px-4 h-8",
            // active ? "text-[var(--text-lt)]" : "hover:bg-white/5 text-[var(--text)]"
          )}
        >
          <span className={cn("shrink-0", active ? "opacity-100" : "opacity-90")}>
            {view.icon}
          </span>
          <span className="font-semibold text-[16px] tracking-wide">{view.label}</span>
        </button>

        {subLinks.length > 0 ? (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className={cn(
              "shrink-0",
              "h-8 w-10 rounded-full",
              "text-[var(--text)] hover:text-white/75 hover:bg-white/5",
              "transition"
            )}
            aria-label={`${open ? "Collapse" : "Expand"} ${view.label}`}
            aria-expanded={open}
          >
            <ChevronDown className={cn("h-5 w-5 mx-auto transition-transform", !open && "-rotate-90")} />
          </button>
        ) : null}
      </div>

      <div className={cn("mt-2 px-4", !open && "hidden")}>
        <div className="flex flex-col gap-1">
          {subLinks.map((s) => (
            <SubLinkRow
              key={s.id}
              size={size}
              active={pathname.startsWith(s.route)}
              icon={s.icon}
              label={s.label}
              onClick={() => onNavigate(s.route)}
              padY={subPadY}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function SubLinkRow({
  icon,
  label,
  active,
  onClick,
  size,
  padY,
}: {
  icon?: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
  size: "sm" | "md"
  padY: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "w-full",
        "flex items-center gap-3",
        "rounded-2xl",
        "px-4",
        padY,
        "transition-colors",
        active ? "bg-white/8 text-[var(--text-lt)]" : "hover:bg-white/5 text-[var(--text)]"
      )}
    >
      {active &&
        <div className="absolute left-[40px] w-[3px] h-[15px] rounded-full bg-[#394650]"></div>
      }
      <span className={cn("shrink-0 text-[var(--text)]", active && "text-[var(--text-lt)]")}>
        {icon}
      </span>
      <span
        className={cn(
          "tracking-wide",
          size === "sm" ? "text-sm" : "text-sm",
          active ? "font-medium" : "font-normal"
        )}
      >
        {label}
      </span>
    </button>
  )
}

// RAIL NAVIGATION
export function RailNav({
  pathname,
  navigate,
  className,
  onOpenProgramDrive,
}: {
  pathname: string
  navigate: (to: string) => void
  className?: string
  onOpenProgramDrive?: () => void
}) {
  const enabledViews = React.useMemo(
    () => PROGRAM_VIEWS.filter((v) => v.enabled !== false),
    []
  )

  // OPEN STATE: init true for all views
  const [openById, setOpenById] = React.useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    enabledViews.forEach((v) => (init[v.id] = true))
    return init
  })

  return (
      <div className={cn("flex flex-col items-center gap-2 w-full", className)}>
        {/* <ProgramDriveTrigger variant="rail"/> */}

        {enabledViews.map((view) => {
        const viewActive =
          view.id === "workspace"
            ? isWorkspaceScopedPath(pathname)
            : isActiveRoute(pathname, view.route)

        const subLinks = view.subLinks.filter((s) => s.enabled !== false)
        const isOpen = !!openById[view.id]

        return (
          <div
            key={view.id}
            className={cn(
              "inline-flex flex-col items-stretch gap-2",
              "w-fit",
              "rounded-full",
              "border border-[var(--gray-18)]",
              "bg-white/0",
              "p-1",
              "transition-all duration-300",
              viewActive && "border border-[#394650]"
            )}
          >
            <div className="flex flex-col gap-0.5">
              {/* DOMINANT VIEW ICON */}
              <button
                type="button"
                aria-label={view.label}
                title={view.label}
                onClick={() => {
                  const currentlyOpen = !!openById[view.id]

                  // If not active: expand if needed, then navigate (no collapse here)
                  if (!viewActive) {
                    if (!currentlyOpen && subLinks.length > 0) {
                      setOpenById((prev) => ({ ...prev, [view.id]: true }))
                    }
                    navigate(view.route)
                    return
                  }

                  // Active: toggle (collapse/expand)
                  if (subLinks.length > 0) {
                    setOpenById((prev) => ({ ...prev, [view.id]: !prev[view.id] }))
                  }
                }}
                className={cn(
                  "flex items-center justify-center",
                  "h-10 w-10",
                  "rounded-full hover:bg-[var(--gray-18)]",
                  "text-[var(--text)]",
                  "transition-all duration-300",
                  // viewActive
                  //   ? "bg-transparent text-[var(--gray-9)] shadow-inner"
                  //   : "text-[var(--text)] hover:text-[var(--text-lt)]"
                )}
              >
                <span className="flex items-center justify-center">{view.icon}</span>
              </button>

              {isOpen && <Divider color="var(--gray-18)" inset={4} />}
            </div>

            {/* SUBLINK ICONS */}
            {subLinks.length > 0 && isOpen ? (
              <div className="flex flex-col items-stretch gap-1">
                {subLinks.map((s) => {
                  const active = isActiveRoute(pathname, s.route)

                  return (
                    <button
                      key={s.id}
                      type="button"
                      aria-label={s.label}
                      title={s.label}
                      onClick={() => navigate(s.route)}
                      className={cn(
                        "flex items-center justify-center",
                        "h-10 w-10 rounded-full",
                        "transition",
                        active
                          ? "text-[var(--text-lt)]"
                          : "text-[var(--text)] hover:bg-[var(--gray-18)] hover:text-[var(--text-lt)]"
                      )}
                    >
                      <span className="relative flex items-center justify-center">
                        {active && <div className="absolute top-[1px] left-[-8px] w-[3px] h-[15px] rounded-full bg-[#596f7e]"/>}
                        {s.icon ?? <span className="h-2 w-2 rounded-full bg-white/35" />}
                      </span>
                    </button>
                  )
                })}
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
