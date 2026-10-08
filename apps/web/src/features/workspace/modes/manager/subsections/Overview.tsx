"use client"

import * as React from "react"
import { cn } from "@/utils/utils"
import { Divider } from "@/components/ui"
import { Activity, CalendarDays, UsersRound, Flag } from "lucide-react"

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

function StatPill({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--gray-18)]",
        "bg-white/0 hover:bg-white/5 transition-colors",
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
        <div className="text-xs text-white/45">{label}</div>
        <div className="mt-0.5 font-semibold text-[var(--text-lt)]">{value}</div>
      </div>
    </div>
  )
}

export default function Overview({ programId }: { programId: number }) {
  void programId

  return (
    <div className="p-6">
      <div className="text-sm font-semibold text-[var(--text-lt)]">Overview</div>
      <div className="mt-2 text-sm text-white/45">
        High-level program snapshot and quick actions.
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Badge>Coming soon</Badge>
      </div>

      <Divider color="var(--gray-18)" inset={0} className="my-5" />

      <div className="flex flex-col gap-2">
        <StatPill
          icon={<UsersRound className="h-5 w-5" />}
          label="Roster"
          value="— athletes"
        />
        <StatPill
          icon={<CalendarDays className="h-5 w-5" />}
          label="Next event"
          value="—"
        />
        <StatPill
          icon={<Activity className="h-5 w-5" />}
          label="Last practice"
          value="—"
        />
        <StatPill
          icon={<Flag className="h-5 w-5" />}
          label="Season status"
          value="—"
        />
      </div>
    </div>
  )
}
