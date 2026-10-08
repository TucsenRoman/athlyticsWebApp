// src/pages/settings/profile/ProfileSettingsPage.tsx
"use client"

import * as React from "react"
import { useEffect, useMemo, useState } from "react"
import { Pencil, Camera, Check, X, Mail } from "lucide-react"

import { useProfileContext } from "@/features/profile/ProfileProvider"
import AvatarSelector from "@/features/profile/AvatarModal"
import { AVATAR_MAP } from "@/features/profile/avatarMap"
import { AvatarId, isAvatarId } from "@/features/profile/avatars"
import { Divider } from "@/components/ui"

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

type ProfileDraft = {
  fullName: string
  username: string
  bio: string
  email: string
  language: string
}

type IdentityFieldDef = {
  key: "fullName" | "email" | "username"
  label: string
  viewValue: (d: ProfileDraft) => React.ReactNode
  editable: boolean
  editValue?: (d: ProfileDraft) => string
  onEditChange?: (next: string, d: ProfileDraft) => ProfileDraft
  placeholder?: string
}

/* ========================================================================== */
/* PAGE                                                                       */
/* ========================================================================== */

export default function ProfileSettingsPage() {
  const { profile, loading, setAvatar, updateProfile, error } =
    useProfileContext()

  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [draft, setDraft] = useState<ProfileDraft | null>(null)
  const [avatarOpen, setAvatarOpen] = useState(false)

  const resetDraft = React.useCallback(() => {
    if (!profile) return
    setDraft({
      fullName: profile.fullName ?? "",
      username: profile.username ?? "",
      bio: profile.bio ?? "",
      email: profile.email ?? "",
      language: profile.language ?? "English (US)",
    })
  }, [profile])

  useEffect(() => {
    if (!profile) return
    resetDraft()
  }, [profile, resetDraft])

  useEffect(() => {
    if (!error || !profile || !draft) return
    setDraft((prev) =>
      prev
        ? {
            ...prev,
            username: profile.username ?? "",
          }
        : prev
    )
  }, [error, profile, draft])

  const initials = useMemo(() => {
    const name = (draft?.fullName ?? "").trim()
    return (
      name
        .split(" ")
        .filter(Boolean)
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "EU"
    )
  }, [draft?.fullName])

  const selectedAvatar: AvatarId | null = useMemo(() => {
    if (!profile) return null
    return isAvatarId(profile.avatarUrl) ? (profile.avatarUrl as AvatarId) : null
  }, [profile])

  if (loading || !profile || !draft) return null

  const onSave = async () => {
    if (!draft || saving) return
    setSaving(true)
    try {
      const ok = await updateProfile({
        fullName: draft.fullName,
        username: draft.username,
        bio: draft.bio,
        language: draft.language,
      })
      if (ok) setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  // ✅ only store these props; UI is derived during the loop
  const identityFields: IdentityFieldDef[] = [
    {
      key: "fullName",
      label: "Name",
      viewValue: (d) =>
        d.fullName || <span className="text-[var(--gray-13)]">—</span>,
      editable: true,
      editValue: (d) => d.fullName,
      onEditChange: (next, d) => ({ ...d, fullName: next }),
      placeholder: "Your name",
    },
    {
      key: "email",
      label: "Email",
      viewValue: (d) => d.email || <span className="text-[var(--gray-13)]">—</span>,
      editable: false,
    },
    {
      key: "username",
      label: "Username",
      viewValue: (d) =>
        d.username ? (
          `@${d.username}`
        ) : (
          <span className="text-[var(--gray-13)]">—</span>
        ),
      editable: true,
      editValue: (d) => (d.username ? `@${d.username}` : ""),
      onEditChange: (next, d) => ({
        ...d,
        username: next.replace(/^@/, "").toLowerCase(),
      }),
      placeholder: "@username",
    },
  ]

  return (
    <div className="mx-auto max-w-5xl px-5 py-6 space-y-10">
      {/* ================= PAGE HEADER ================= */}
      <div className="space-y-1">
        <div className="text-xl font-semibold text-[var(--gray-4)]">Profile</div>
        <div className="text-sm text-[var(--gray-12)]">
          Your public identity and preferences.
        </div>
      </div>

      {/* ================= IDENTITY ================= */}
      <div className="space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-[var(--gray-13)]">
          Identity
        </div>

        <div
          className="
            rounded-2xl
            border border-[var(--gray-18)]
            bg-gradient-to-br from-[var(--gray-18)] to-transparent
            px-6 py-6
          "
        >
          {/* TOP ROW: AVATAR + FIELDS | EDIT BUTTON */}
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-start gap-6 min-w-0 flex-1">
              {/* Avatar */}
              <div className="shrink-0">
                <button
                  onClick={() => setAvatarOpen(true)}
                  className="
                    relative
                    mt-1
                    h-16 w-16
                    rounded-2xl
                    overflow-hidden
                    border border-[var(--gray-17)]
                    bg-[var(--gray-19)]
                    group
                  "
                  aria-label="Change avatar"
                >
                  {profile.avatarUrl && AVATAR_MAP[profile.avatarUrl] ? (
                    <img
                      src={AVATAR_MAP[profile.avatarUrl]}
                      className="h-full w-full object-cover"
                      alt=""
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <div className="text-lg font-semibold text-[var(--text-lt)]">
                        {initials}
                      </div>
                    </div>
                  )}

                  <div
                    className="
                      absolute inset-0
                      bg-black/45
                      opacity-0 group-hover:opacity-100
                      flex items-center justify-center
                      text-white
                      transition
                    "
                  >
                    <Camera className="h-4 w-4" />
                  </div>
                </button>
              </div>

              {/* Fields block (derived UI in loop) */}
              <div className="flex flex-row items-start gap-16">
                {identityFields.map((f) => {
                  const isEmail = f.key === "email"
                  const isUsername = f.key === "username"

                  const colClassName = isUsername ? "min-w-[260px] flex-1" : ""

                  const viewTextClassName = isEmail
                    ? "mt-2 truncate text-sm font-semibold text-[var(--text)]"
                    : isUsername
                      ? "mt-2 truncate text-xl font-semibold text-[var(--text)]"
                      : "mt-2 truncate text-2xl font-semibold text-[var(--text-lt)]"

                  const inputClassName = isUsername
                    ? `
                      mt-2 w-full
                      bg-transparent
                      outline-none
                      border-b border-[var(--gray-17)]
                      focus:border-[var(--gray-14)]
                      placeholder:text-[var(--gray-13)]
                      text-xl font-semibold
                      text-[var(--text)]
                    `
                    : `
                      mt-2 w-full
                      bg-transparent
                      outline-none
                      border-b border-[var(--gray-17)]
                      focus:border-[var(--gray-14)]
                      placeholder:text-[var(--gray-13)]
                      text-2xl font-semibold
                      text-[var(--text-lt)]
                    `

                  return (
                    <div key={f.key} className={colClassName}>
                      {/* Label row */}
                      {isEmail ? (
                        <div className="flex items-center gap-2">
                          <div className="text-[var(--gray-12)]">
                            <Mail className="h-4 w-4" />
                          </div>
                          <div className="text-[10px] uppercase tracking-wide text-[var(--gray-13)]">
                            {f.label}
                          </div>
                        </div>
                      ) : (
                        <div className="text-[10px] uppercase tracking-wide text-[var(--gray-13)]">
                          {f.label}
                        </div>
                      )}

                      {/* Value */}
                      {editing && f.editable && f.editValue && f.onEditChange ? (
                        <input
                          value={f.editValue(draft)}
                          onChange={(e) =>
                            setDraft(f.onEditChange!(e.target.value, draft))
                          }
                          placeholder={f.placeholder}
                          className={inputClassName}
                        />
                      ) : (
                        <div className={viewTextClassName}>{f.viewValue(draft)}</div>
                      )}

                      {/* Username error stays tied to username */}
                      {f.key === "username" && error ? (
                        <div className="mt-2 text-xs text-red-500">{error}</div>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Edit / Save / Cancel (TOP RIGHT) */}
            <div className="shrink-0">
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="
                    inline-flex items-center gap-2 justify-center
                    px-3 py-1
                    rounded-full border border-[var(--gray-17)] hover:border-transparent
                    hover:bg-[var(--gray-17)]
                    text-sm font-semibold text-[var(--text)] hover:text-[var(--text-lt)]
                    transition-all duration-300
                  "
                >
                  <Pencil className="h-4 w-4 opacity-80" />
                  Edit
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      resetDraft()
                      setEditing(false)
                    }}
                    disabled={saving}
                    className="
                      inline-flex items-center gap-2 justify-center
                      px-4 py-3
                      rounded-2xl
                      border border-[var(--gray-17)] hover:border-transparent
                      hover:bg-[var(--gray-17)]
                      text-sm font-semibold
                      text-[var(--text)] hover:text-[var(--text-lt)]
                      transition-all duration-300
                      disabled:opacity-50 disabled:cursor-not-allowed
                    "
                  >
                    <X className="h-4 w-4 opacity-75" />
                    Cancel
                  </button>

                  <button
                    onClick={onSave}
                    disabled={saving}
                    className="
                      inline-flex items-center gap-2 justify-center
                      px-4 py-3
                      rounded-2xl
                      border border-[var(--gray-17)] hover:border-transparent
                      hover:bg-[var(--gray-17)]
                      text-sm font-semibold
                      text-[var(--text)] hover:text-[var(--text-lt)]
                      transition-all duration-300
                      disabled:opacity-50 disabled:cursor-not-allowed
                    "
                  >
                    <Check className="h-4 w-4 opacity-90" />
                    {saving ? "Saving…" : "Save"}
                  </button>
                </div>
              )}
            </div>
          </div>

          <Divider />

          {/* Bio */}
          <div className="mt-6">
            <div className="text-[10px] uppercase tracking-wide text-[var(--gray-13)]">
              Bio
            </div>

            {editing ? (
              <textarea
                rows={3}
                value={draft.bio}
                onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
                className="
                  mt-3 w-full
                  text-sm
                  bg-transparent
                  resize-none
                  outline-none
                  text-[var(--text-lt)]
                  placeholder:text-[var(--gray-13)]
                "
                placeholder="Tell people a little about yourself"
              />
            ) : (
              <div className="mt-3 text-sm text-[var(--text)]">
                {draft.bio || "No bio yet."}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= AVATAR MODAL ================= */}
      <AvatarSelector
        open={avatarOpen}
        selected={selectedAvatar}
        onClose={() => setAvatarOpen(false)}
        onSelect={async (id) => {
          await setAvatar(id)
          setAvatarOpen(false)
        }}
      />
    </div>
  )
}
