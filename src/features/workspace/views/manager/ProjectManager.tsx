"use client"

import * as React from "react"
import { useMemo, useState } from "react"
import { cn } from "@/utils/utils"

import {
  X,
  ChevronsUpDown,
  Check,
  UserRoundCog,
  LayoutDashboard,
  FileCog,
  Box,
} from "lucide-react"

import FilesManager, { FilesManagerHeader } from "./FilesManager"
import Overview from "./Overview"
import ProgramManager from "./ProgramManager"
import RolesManager from "./RolesManager"
/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

interface ProjectManagerProps {
  programId: number
}

type CardId = "overview" | "files" | "program" | "roles"

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

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "h-6 px-2 rounded-full",
        "bg-white/6 border border-white/10",
        "text-xs text-white/70",
        "inline-flex items-center"
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

/* -------------------------------------------------------------------------- */
/* MAIN                                                                       */
/* -------------------------------------------------------------------------- */

export default function ProjectManager({ programId }: ProjectManagerProps) {
  void programId

  type CardDef = {
    id: CardId
    label: string
    icon: React.ElementType
    subtitle: string
  }

  const CARDS: CardDef[] = [
    // { id: "overview", label: "Overview", icon: LayoutDashboard, subtitle: "High-level program snapshot" },
    { id: "files", label: "Files Manager", icon: FileCog, subtitle: "Folders, tables, docs, and PDFs" },
    { id: "program", label: "Program Manager", icon: Box, subtitle: "Seasons, rosters, and structure" },
    // { id: "roles", label: "Roles Manager", icon: UserRoundCog, subtitle: "Permissions and access" },
  ]

  const [activeCard, setActiveCard] = useState<CardId>("files")
  const [cardPickerOpen, setCardPickerOpen] = useState(false)

  // Files search lives in the parent because the search UI is in the header.
  const [filesQuery, setFilesQuery] = useState("")

  const activeCardDef = useMemo(
    () => CARDS.find((c) => c.id === activeCard) ?? CARDS[0],
    [activeCard]
  )

  const activeIndex = useMemo(
    () => Math.max(0, CARDS.findIndex((c) => c.id === activeCard)),
    [activeCard]
  )

  const goPrevCard = () => {
    const len = CARDS.length
    const next = (activeIndex - 1 + len) % len
    setActiveCard(CARDS[next].id)
  }

  return (
    <div className={cn("w-full flex-1 min-h-0", "text-[var(--text)]")}>
      <div className="px-6 py-3 flex flex-col min-h-0 h-[calc(100dvh-0px)]">
        {/* HEADER */}
        <div className="flex items-center justify-between shrink-0 pb-2">
          {/* CARD SWITCHER */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goPrevCard}
              className={cn(
                "relative",
                "h-9 w-[215px] px-4 rounded-full",
                "border border-[var(--gray-18)] hover:border-[var(--gray-17)]",
                "text-[var(--text-lt)]",
                "transition inline-flex justify-start items-center gap-2",
                "transition-all duration-300"
              )}
              aria-label="Switch view"
              title="Switch view"
            >
              <activeCardDef.icon className="h-4 w-4 opacity-80" />
              <span className="font-semibold">{activeCardDef.label}</span>
              <button
                type="button"
                className="absolute top-[15%] right-2 p-1 rounded-full hover:bg-[var(--gray-18)] transition-all duration-300"
                onClick={(e) => {
                  e.stopPropagation()
                  setCardPickerOpen(true)
                }}
              >
                <ChevronsUpDown className="h-4 w-4 opacity-70" />
              </button>
            </button>
          </div>

          {/* UTILITIES */}
          {activeCard === "files" ? (
            <FilesManagerHeader query={filesQuery} onQueryChange={setFilesQuery} />
          ) : (
            <div className="h-8" />
          )}
        </div>

        {/* CONTENT */}
        <CardShell className="flex-1 min-h-0 pb-14 overflow-hidden">
          {activeCard === "files" ? (
            <FilesManager programId={programId} query={filesQuery} />
          ) : activeCard === "overview" ? (
            <Overview programId={programId} />
          ) : activeCard === "program" ? (
            <ProgramManager programId={programId} />
          ) : (
            <RolesManager programId={programId} />
          )}
        </CardShell>
      </div>

      {/* CARD PICKER DIALOG */}
      <Modal open={cardPickerOpen} title="Switch view" onClose={() => setCardPickerOpen(false)}>
        <div className="flex flex-col gap-2">
          {CARDS.map((c) => {
            const Icon = c.icon
            return (
              <SwitchTile
                key={c.id}
                icon={<Icon className="h-5 w-5" />}
                title={c.label}
                subtitle={c.subtitle}
                active={c.id === activeCard}
                onClick={() => {
                  setActiveCard(c.id)
                  setCardPickerOpen(false)
                }}
              />
            )
          })}
        </div>
      </Modal>
    </div>
  )
}
