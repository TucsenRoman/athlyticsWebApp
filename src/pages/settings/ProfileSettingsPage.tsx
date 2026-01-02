"use client"

import { useEffect, useState } from "react"
import { Pencil, UserRound, Languages, Camera } from "lucide-react"

import { useProfileContext } from "@/features/profile/ProfileProvider"
import AvatarSelector from "@/features/profile/AvatarModal"
import { AVATAR_MAP } from "@/features/profile/avatarMap"
import {
  AvatarId,
  isAvatarId,
} from "@/features/profile/avatars"
import { Button } from "@/components/ui"

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

/* ========================================================================== */
/* PAGE                                                                       */
/* ========================================================================== */

export default function ProfileSettingsPage() {
  const { profile, loading, setAvatar, updateProfile, error } = useProfileContext()

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<ProfileDraft | null>(null)
  const [avatarOpen, setAvatarOpen] = useState(false)

  /* ------------------------- INIT FROM LIVE DATA -------------------------- */
  useEffect(() => {
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
    if (!error || !profile || !draft) return

    // Reset username to last known good value
    setDraft((prev) =>
      prev
        ? {
            ...prev,
            username: profile.username ?? "",
          }
        : prev
    )
  }, [error, profile])

  if (loading || !profile || !draft) return null

  const initials =
    draft.fullName
      ?.split(" ")
      .filter(Boolean)
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "EU"

  const selectedAvatar: AvatarId | null =
    isAvatarId(profile.avatarUrl) ? profile.avatarUrl : null

  /* ======================================================================== */
  /* RENDER                                                                   */
  /* ======================================================================== */

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* ================= HEADER ================= */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[var(--text-dk)]">
            Profile
          </h1>
          <p className="text-sm text-[var(--text)]">
            Your public identity and preferences
          </p>
        </div>

        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="
              inline-flex items-center gap-2
              px-3 py-1.5
              rounded-md
              text-sm font-medium
              text-[var(--edit)]
              bg-[var(--edit-bg)]
              hover:bg-[color-mix(in srgb,var(--edit) 15%,transparent)]
              transition
            "
          >
            <Pencil className="h-4 w-4" />
            Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setDraft({
                  fullName: profile.fullName ?? "",
                  username: profile.username ?? "",
                  bio: profile.bio ?? "",
                  email: profile.email ?? "",
                  language: profile.language ?? "English (US)",
                })
                setEditing(false)
              }}
              className="
                px-3 py-1.5
                rounded-md
                text-sm
                border border-[var(--border)]
                text-[var(--text)]
                hover:bg-[var(--gray-lt)]
                transition
              "
            >
              Cancel
            </button>
            <Button
              variant="float"
              onClick={async () => {
                if (!draft) return

                const success = await updateProfile({
                  fullName: draft.fullName,
                  username: draft.username,
                  bio: draft.bio,
                  language: draft.language,
                })

                if (success) {
                  setEditing(false)
                }
              }}
              className="w-16"
            >
              Save
            </Button>
          </div>
        )}
      </header>

      {/* ================= IDENTITY CARD ================= */}
      <section
        className={`
          rounded-xl
          border border-[var(--border)]
          bg-[var(--bg)]
          p-5
          space-y-4
          shadow-sm
          transition
          ${editing ? "ring-1 ring-[var(--edit-bg)]" : ""}
        `}
      >
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <button
            onClick={() => setAvatarOpen(true)}
            className="
              relative
              h-14 w-14
              rounded-xl
              overflow-hidden
              border border-[var(--border)]
              group
            "
          >
            {profile.avatarUrl && AVATAR_MAP[profile.avatarUrl] ? (
              <img
                src={AVATAR_MAP[profile.avatarUrl]}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-[var(--gray-lt)]">
                <span className="text-lg font-semibold text-[var(--text)]">
                  {initials}
                </span>
              </div>
            )}

            <div
              className="
                absolute inset-0
                bg-black/40
                opacity-0
                group-hover:opacity-100
                flex items-center justify-center
                text-white
                text-xs
                transition
              "
            >
              <Camera className="h-4 w-4" />
            </div>
          </button>

          {/* Name / Username */}
          <div className="flex-1 min-w-0 space-y-1">
            {editing ? (
              <input
                value={draft.fullName}
                onChange={(e) =>
                  setDraft({ ...draft, fullName: e.target.value })
                }
                className="
                  w-full
                  text-lg font-medium
                  bg-transparent
                  border-b border-[var(--border)]
                  focus:border-[var(--edit)]
                  outline-none
                "
              />
            ) : (
              <div className="text-lg font-medium text-[var(--text-dk)] truncate">
                {draft.fullName}
              </div>
            )}

            {editing ? (
              <input
                value={draft.username}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    username: e.target.value.toLowerCase(),
                  })
                }
                className="
                  w-full
                  text-sm
                  bg-transparent
                  border-b border-[var(--border)]
                  focus:border-[var(--edit)]
                  outline-none
                "
                placeholder="username"
              />
            ) : (
              <div className="text-sm text-[var(--text)] truncate">
                @{draft.username || "loading…"}
              </div>
            )}

            {error && (
              <div className="text-xs text-red-500 mt-1">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        <div
          className={`
            rounded-lg
            border border-[var(--border)]
            px-4 py-3
            space-y-1
            transition
            ${editing ? "bg-[color-mix(in srgb,var(--edit-bg) 30%,transparent)]" : "bg-[var(--gray-lt)]"}
          `}
        >
          <div className="text-[10px] uppercase tracking-wide text-[var(--text)]">
            Bio
          </div>

          {editing ? (
            <textarea
              rows={2}
              value={draft.bio}
              onChange={(e) =>
                setDraft({ ...draft, bio: e.target.value })
              }
              className="
                w-full
                text-sm
                bg-transparent
                resize-none
                outline-none
              "
              placeholder="Tell people a little about yourself"
            />
          ) : (
            <p className="text-sm text-[var(--text-dk)]">
              {draft.bio || "No bio yet."}
            </p>
          )}
        </div>
      </section>

      {/* ================= DETAILS ================= */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <DetailRow
          label="Email"
          icon={<UserRound className="h-4 w-4" />}
          value={draft.email}
        />

        <DetailRow
          label="Language"
          icon={<Languages className="h-4 w-4" />}
          value={
            editing ? (
              <select
                value={draft.language}
                onChange={(e) =>
                  setDraft({ ...draft, language: e.target.value })
                }
                className="bg-transparent text-sm outline-none"
              >
                <option>English (US)</option>
                <option>Spanish</option>
              </select>
            ) : (
              draft.language
            )
          }
        />
      </section>

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

/* ========================================================================== */
/* UI PRIMITIVES                                                              */
/* ========================================================================== */

function DetailRow({
  label,
  value,
  icon,
}: {
  label: string
  value: React.ReactNode
  icon?: React.ReactNode
}) {
  return (
    <div
      className="
        flex items-center justify-between
        rounded-lg
        border border-[var(--border)]
        bg-[var(--bg)]
        px-4 py-3
        hover:bg-[var(--gray-lt)]
        transition
      "
    >
      <div className="flex items-center gap-2">
        {icon && <span className="text-[var(--text)]">{icon}</span>}
        <span className="text-sm font-medium text-[var(--text-dk)]">
          {label}
        </span>
      </div>

      <div className="text-sm font-medium text-[var(--text)] truncate">
        {value}
      </div>
    </div>
  )
}
