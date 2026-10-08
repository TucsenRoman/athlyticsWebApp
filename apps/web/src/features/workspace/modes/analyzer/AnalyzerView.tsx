// src/features/workspace/modes/analyzer/AnalyzerView.tsx
"use client"

import * as React from "react"
import { useMemo, useState } from "react"
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom"
import { cn } from "@/utils/utils"
import { Button, Divider } from "@/components/ui"
import { Input } from "@/components/ui/forms/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/navigation/tabs"
import {
  ArrowLeft,
  ChevronsUpDown,
  Check,
  Plus,
  Scale,
  Sigma,
  X,
  Search,
  Clock,
  AArrowDown,
  Archive,
  Trash2,
  RotateCw,
} from "lucide-react"

import EngineIndex from "@/features/workspace/modes/analyzer/engine/EngineIndex"
import EngineNew from "@/features/workspace/modes/analyzer/engine/EngineNew"

import ComparisonIndex from "@/features/workspace/modes/analyzer/comparison/ComparisonIndex"
import ComparisonNew from "@/features/workspace/modes/analyzer/comparison/ComparisonNew"

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

type AnalyzerViewProps = {
  programId: number
  demoMode: boolean
  className?: string
}

type AnalyzerSection = "engines" | "comparisons"
type FilterMode = "recent" | "alpha_desc" | "archived" | "deleted"

/* -------------------------------------------------------------------------- */
/* SMALL UI                                                                   */
/* -------------------------------------------------------------------------- */

function CardShell({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "relative",
        "rounded-2xl border border-[var(--gray-18)]",
        "bg-[var(--gray-20)] backdrop-blur-xl",
        "shadow-[0_0_0_1px_rgba(255,255,255,0.02)]",
        className
      )}
    >
      {children}
    </div>
  )
}

function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean
  title: string
  children: React.ReactNode
  onClose: () => void
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[80]">
      <button
        type="button"
        className="absolute inset-0 bg-black/55"
        onClick={onClose}
        aria-label="Close dialog"
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          className={cn(
            "w-full max-w-[520px]",
            "rounded-2xl border border-[var(--gray-18)]",
            "bg-[#141414]",
            "shadow-[0_20px_60px_rgba(0,0,0,0.55)]",
            "overflow-hidden"
          )}
        >
          <div className="px-5 py-4 flex items-center justify-between border-b border-white/10">
            <div className="text-sm font-semibold text-[var(--text-lt)]">{title}</div>
            <button
              type="button"
              onClick={onClose}
              className={cn(
                "h-9 w-9 rounded-full",
                "bg-white/4 hover:bg-white/8",
                "border border-white/10",
                "text-white/70 hover:text-white/90",
                "transition inline-flex items-center justify-center"
              )}
              aria-label="Close"
              title="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-5">{children}</div>
        </div>
      </div>
    </div>
  )
}

function SwitchTile({
  icon,
  title,
  subtitle,
  active,
  onClick,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left",
        "rounded-2xl border border-[var(--gray-18)]",
        active ? "bg-white/6" : "bg-white/0 hover:bg-white/5",
        "transition-colors",
        "px-4 py-3",
        "flex items-center gap-3"
      )}
    >
      <div
        className={cn(
          "h-10 w-10 rounded-2xl",
          "bg-white/6 border border-white/10",
          "flex items-center justify-center",
          "text-white/75"
        )}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <div className="font-semibold text-[var(--text-lt)]">{title}</div>
        <div className="mt-0.5 text-xs text-white/40">{subtitle}</div>
      </div>

      {active ? (
        <div
          className={cn(
            "h-8 w-8 rounded-full",
            "bg-white/6 border border-white/10",
            "inline-flex items-center justify-center",
            "text-white/80"
          )}
          aria-label="Selected"
          title="Selected"
        >
          <Check className="h-4 w-4" />
        </div>
      ) : (
        <div className="h-8 w-8" aria-hidden="true" />
      )}
    </button>
  )
}

function SearchPill({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (next: string) => void
  placeholder: string
}) {
  return (
    <div
      className="
        flex items-center gap-2
        px-2 w-full max-w-[240px] h-8
        rounded-full border border-[var(--gray-18)] focus-within:border-[var(--gray-17)]
        text-xs text-[var(--text-dk)] hover:text-[var(--text)] focus-within:text-[var(--text)]
        shadow-inner transition-all duration-300
      "
    >
      <Search className="h-4 w-4" />
      <Input
        tabIndex={-1}
        className="p-0 pb-[2px] border-0 bg-transparent text-sm truncate focus-visible:ring-0"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

function sectionFromPath(pathname: string): AnalyzerSection {
  if (pathname.startsWith("/program/analyzer/comparisons")) return "comparisons"
  return "engines"
}

function isBuilderPath(pathname: string) {
  return (
    pathname.startsWith("/program/analyzer/engines/new") ||
    pathname.startsWith("/program/analyzer/comparisons/new")
  )
}

function builderTitleFromPath(pathname: string) {
  if (pathname.startsWith("/program/analyzer/engines/new")) return "New Engine"
  if (pathname.startsWith("/program/analyzer/comparisons/new")) return "New Comparison"
  return "New"
}

/* -------------------------------------------------------------------------- */
/* MAIN                                                                       */
/* -------------------------------------------------------------------------- */

export default function AnalyzerView({ programId, demoMode, className }: AnalyzerViewProps) {
  const location = useLocation()
  const navigate = useNavigate()

  const section = useMemo(() => sectionFromPath(location.pathname), [location.pathname])
  const inBuilder = useMemo(() => isBuilderPath(location.pathname), [location.pathname])
  const builderTitle = useMemo(() => builderTitleFromPath(location.pathname), [location.pathname])

  const [pickerOpen, setPickerOpen] = useState(false)

  // Matches FilesManager-style chrome (state lives here so header owns the UI)
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<FilterMode>("recent")

  type SectionDef = {
    id: AnalyzerSection
    label: string
    icon: React.ElementType
    subtitle: string
    listRoute: string
    newRoute: string
    searchPlaceholder: string
  }

  const SECTIONS: SectionDef[] = [
    {
      id: "engines",
      label: "Engines",
      icon: Sigma,
      subtitle: "Reusable formulas you can apply anywhere",
      listRoute: "/program/analyzer/engines",
      newRoute: "/program/analyzer/engines/new",
      searchPlaceholder: "Search engines...",
    },
    {
      id: "comparisons",
      label: "Comparisons",
      icon: Scale,
      subtitle: "Compare datasets (meets, weeks, athletes, splits)",
      listRoute: "/program/analyzer/comparisons",
      newRoute: "/program/analyzer/comparisons/new",
      searchPlaceholder: "Search comparisons...",
    },
  ]

  const activeDef = useMemo(
    () => SECTIONS.find((s) => s.id === section) ?? SECTIONS[0],
    [section]
  )

  const toggleSection = () => {
    const next: AnalyzerSection = section === "engines" ? "comparisons" : "engines"
    const nextDef = SECTIONS.find((s) => s.id === next) ?? SECTIONS[0]
    setQuery("")
    setFilter("recent")
    navigate(nextDef.listRoute)
  }

  const goToSection = (next: AnalyzerSection) => {
    const nextDef = SECTIONS.find((s) => s.id === next) ?? SECTIONS[0]
    setQuery("")
    setFilter("recent")
    navigate(nextDef.listRoute)
  }

  const goNew = () => {
    navigate(activeDef.newRoute)
  }

  const goBackToList = () => {
    navigate(activeDef.listRoute)
  }

  type FilterTab = {
    value: FilterMode
    label: string
    icon: React.ElementType
    dividerLeft?: boolean
  }

  const FILTER_TABS: FilterTab[] = [
    { value: "recent", label: "Recent", icon: Clock },
    { value: "alpha_desc", label: "Alphabetical", icon: AArrowDown },
    { value: "archived", label: "Archived", icon: Archive, dividerLeft: true },
    { value: "deleted", label: "Deleted", icon: Trash2 },
  ]

  const tabClass =
    "inline-flex items-center gap-2 px-4 text-xs rounded-full " +
    "data-[state=active]:bg-[var(--gray-18)] data-[state=active]:text-[var(--text-lt)] " +
    "data-[state=inactive]:text-[var(--text)] data-[state=inactive]:hover:text-[var(--text-lt)] data-[state=inactive]:hover:bg-[var(--gray-17)]"

  return (
    <div className={cn("w-full flex-1 min-h-0", "text-[var(--text)]", className)}>
      <div className="px-6 py-3 flex flex-col min-h-0 h-[calc(100dvh-0px)]">
        {/* HEADER */}
        <div className="flex items-center justify-between shrink-0 pb-2">
          {!inBuilder ? (
            <>
              {/* SECTION SWITCHER (pill toggles, chevrons opens picker) */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleSection}
                  className={cn(
                    "relative",
                    "h-9 w-[215px] px-4 rounded-full",
                    "border border-[var(--gray-18)] hover:border-[var(--gray-17)]",
                    "text-[var(--text-lt)]",
                    "transition inline-flex justify-start items-center gap-2",
                    "transition-all duration-300"
                  )}
                  aria-label="Switch analyzer view"
                  title="Switch analyzer view"
                >
                  <activeDef.icon className="h-4 w-4 opacity-80" />
                  <span className="font-semibold">{activeDef.label}</span>

                  <button
                    type="button"
                    className="absolute top-[15%] right-2 p-1 rounded-full hover:bg-[var(--gray-18)] transition-all duration-300"
                    onClick={(e) => {
                      e.stopPropagation()
                      setPickerOpen(true)
                    }}
                    aria-label="Open view picker"
                    title="Open view picker"
                  >
                    <ChevronsUpDown className="h-4 w-4 opacity-70" />
                  </button>
                </button>

                <div className="hidden md:flex text-xs text-white/35 pl-1">
                  {activeDef.subtitle}
                </div>
              </div>

              {/* UTILITIES (FilesManager vibe) */}
              <div className="flex items-center gap-2">
                <SearchPill
                  value={query}
                  onChange={setQuery}
                  placeholder={activeDef.searchPlaceholder}
                />

                {/* <button
                  type="button"
                  onClick={() => {
                    // UI-only for now (wire to child later)
                    // e.g. could dispatch a refresh event or pass a callback down
                  }}
                  className="shrink-0 p-2"
                  aria-label="Refresh"
                  title="Refresh"
                >
                  <RotateCw
                    size={16}
                    className="text-[var(--text-dk)] hover:text-[var(--text)] transition-all duration-300"
                  />
                </button> */}
              </div>
            </>
          ) : (
            <>
              {/* BUILDER HEADER */}
              <Button variant="ghost" irregular="sm" onClick={goBackToList} className="rounded-2xl">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              <div className="text-[16px] font-semibold tracking-wide text-[var(--text-lt)]">
                {builderTitle}
              </div>

              <div className="w-[84px]" />
            </>
          )}
        </div>

        {/* CONTENT */}
        <CardShell className="flex-1 min-h-0 pb-14 overflow-hidden">
          {!inBuilder ? (
            <>
              {/* FILTER BAR (FilesManager-style) */}
              <div className="flex justify-between px-3 pt-2">
                <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterMode)}>
                  <TabsList
                    className="
                      relative flex gap-2
                      p-0 h-10 w-full
                      overflow-x-auto md:overflow-x-hidden scrollbar-hide
                      border-0 bg-transparent
                    "
                  >
                    {FILTER_TABS.map((t) => {
                      const Icon = t.icon
                      return (
                        <React.Fragment key={t.value}>
                          {t.dividerLeft ? (
                            <div className="mx-2 h-6 w-px bg-[var(--gray-17)] shrink-0" />
                          ) : null}

                          <TabsTrigger value={t.value} title={t.label} className={tabClass}>
                            <Icon className="h-4 w-4 opacity-80" />
                            <span>{t.label}</span>
                          </TabsTrigger>
                        </React.Fragment>
                      )
                    })}
                  </TabsList>
                </Tabs>

                <div className="shrink-0 p-2" />
              </div>

              <Divider color="var(--gray-18)" inset={5} />
            </>
          ) : null}

          <div className={cn("flex-1 min-h-0 overflow-auto", !inBuilder ? "p-4 pr-1" : "p-6 pr-1")}>
            <Routes>
              <Route index element={<Navigate to="engines" replace />} />

              {/* Engines */}
              <Route path="engines" element={<EngineIndex programId={programId} demoMode={demoMode} />} />
              <Route path="engines/new" element={<EngineNew programId={programId} demoMode={demoMode} />} />

              {/* Comparisons */}
              <Route
                path="comparisons"
                element={<ComparisonIndex programId={programId} demoMode={demoMode} />}
              />
              <Route
                path="comparisons/new"
                element={<ComparisonNew programId={programId} demoMode={demoMode} />}
              />

              <Route path="*" element={<Navigate to="engines" replace />} />
            </Routes>
          </div>

          {/* FLOATING ADD (matches FilesManager/ManagerView feel) */}
          {!inBuilder ? (
            <div className="absolute right-4 bottom-0 z-50 flex items-end gap-2 p-4">
              <Button
                type="button"
                variant="float"
                regular="lg"
                iconSize="lg"
                className="bg-[#394650] hover:bg-[#596f7e] text-[var(--gray-10)]"
                onClick={goNew}
                title={section === "engines" ? "New Engine" : "New Comparison"}
              >
                <Plus />
              </Button>
            </div>
          ) : null}
        </CardShell>
      </div>

      {/* SECTION PICKER DIALOG */}
      <Modal open={pickerOpen} title="Switch view" onClose={() => setPickerOpen(false)}>
        <div className="flex flex-col gap-2">
          {SECTIONS.map((s) => {
            const Icon = s.icon
            return (
              <SwitchTile
                key={s.id}
                icon={<Icon className="h-5 w-5" />}
                title={s.label}
                subtitle={s.subtitle}
                active={s.id === section}
                onClick={() => {
                  setPickerOpen(false)
                  goToSection(s.id)
                }}
              />
            )
          })}
        </div>
      </Modal>
    </div>
  )
}
