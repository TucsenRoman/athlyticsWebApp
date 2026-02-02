"use client"

import * as React from "react"
import { cn } from "@/utils/utils"
import { Divider } from "@/components/ui"
import { Shield, UsersRound, UserRoundCog, ChevronRight } from "lucide-react"

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

function ActionRow({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
}) {
  return (
    <button
      type="button"
      className={cn(
        "w-full text-left",
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
        <div className="font-semibold text-[var(--text-lt)]">{title}</div>
        <div className="mt-0.5 text-xs text-white/40">{subtitle}</div>
      </div>

      <ChevronRight className="h-5 w-5 text-white/35" />
    </button>
  )
}

export default function RolesManager({ programId }: { programId: number }) {
  void programId

  return (
    <div className="p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-[var(--text-lt)]">Roles Manager</div>
          <div className="mt-2 text-sm text-white/45">
            Permissions, roles, and sharing controls.
          </div>
        </div>

        <Badge>Coming soon</Badge>
      </div>

      <Divider color="var(--gray-18)" inset={0} className="my-5" />

      <div className="flex flex-col gap-2">
        <ActionRow
          icon={<UsersRound className="h-5 w-5" />}
          title="Members"
          subtitle="Invite and manage access"
        />
        <ActionRow
          icon={<UserRoundCog className="h-5 w-5" />}
          title="Roles"
          subtitle="Coach, athlete, admin, custom roles"
        />
        <ActionRow
          icon={<Shield className="h-5 w-5" />}
          title="Permissions"
          subtitle="Fine-grained capabilities per role"
        />
      </div>
    </div>
  )
}
