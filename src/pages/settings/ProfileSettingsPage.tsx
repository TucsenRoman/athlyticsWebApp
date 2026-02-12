// src/pages/settings/profile/ProfileSettingsPage.tsx
"use client"

import * as React from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { Camera, Pencil, Plus, ChevronDown } from "lucide-react"

import { useProfileContext } from "@/features/profile/ProfileProvider"
import AvatarSelector from "@/features/profile/AvatarModal"
import { AVATAR_MAP } from "@/features/profile/avatarMap"
import { AvatarId, isAvatarId } from "@/features/profile/avatars"

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
/* UI-ONLY (until you wire DB fields)                                         */
/* ========================================================================== */

const PRIVACY_OPTIONS = ["Friends Only", "Public", "Private"] as const
type PrivacyMode = (typeof PRIVACY_OPTIONS)[number]

const LANGUAGE_OPTIONS = ["English (US)", "English", "Spanish"] as const

/* ========================================================================== */
/* PAGE                                                                       */
/* ========================================================================== */

export default function ProfileSettingsPage() {
  const { profile, loading, setAvatar, updateProfile, error } =
    useProfileContext()

  const [draft, setDraft] = useState<ProfileDraft | null>(null)
  const [avatarOpen, setAvatarOpen] = useState(false)

  // Inline editing (no global Edit button)
  const [editingUsername, setEditingUsername] = useState(false)
  const [editingBio, setEditingBio] = useState(false)
  const usernameRef = useRef<HTMLInputElement | null>(null)
  const bioRef = useRef<HTMLTextAreaElement | null>(null)

  // Save states (per-field)
  const [savingUsername, setSavingUsername] = useState(false)
  const [savingBio, setSavingBio] = useState(false)
  const [savingLang, setSavingLang] = useState(false)

  // UI-only until wired
  const [privacy, setPrivacy] = useState<PrivacyMode>("Friends Only")
  const [tags, setTags] = useState<string[]>(["Cross Country", "Head Coach"])

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

  // keep username error behavior tied to server value
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
    setEditingUsername(false)
  }, [error, profile, draft])

  useEffect(() => {
    if (!editingUsername) return
    requestAnimationFrame(() => usernameRef.current?.focus())
  }, [editingUsername])

  useEffect(() => {
    if (!editingBio) return
    requestAnimationFrame(() => bioRef.current?.focus())
  }, [editingBio])

  const selectedAvatar: AvatarId | null = useMemo(() => {
    if (!profile) return null
    return isAvatarId(profile.avatarUrl) ? (profile.avatarUrl as AvatarId) : null
  }, [profile])

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

  if (loading || !profile || !draft) return null

  const usernameChip = draft.username ? `@${draft.username}` : "@username"
  const emailChip = draft.email || "email@example.com"

  const commitUsername = async () => {
    if (!draft || savingUsername) return
    setSavingUsername(true)
    try {
      const ok = await updateProfile({
        fullName: draft.fullName,
        username: draft.username,
        bio: draft.bio,
        language: draft.language,
      })
      if (ok) setEditingUsername(false)
    } finally {
      setSavingUsername(false)
    }
  }

  const commitBio = async () => {
    if (!draft || savingBio) return
    setSavingBio(true)
    try {
      const ok = await updateProfile({
        fullName: draft.fullName,
        username: draft.username,
        bio: draft.bio,
        language: draft.language,
      })
      if (ok) setEditingBio(false)
    } finally {
      setSavingBio(false)
    }
  }

  const commitLanguage = async (next: string) => {
    if (!draft || savingLang) return
    setSavingLang(true)
    try {
      setDraft((d) => (d ? { ...d, language: next } : d))
      await updateProfile({
        fullName: draft.fullName,
        username: draft.username,
        bio: draft.bio,
        language: next,
      })
    } finally {
      setSavingLang(false)
    }
  }

  return (
    <div className="w-full max-w-none px-8 py-8">
      {/* ================= PAGE HEADER ================= */}
      <div className="mb-8">
        <div className="text-2xl font-semibold text-[var(--text-lt)]">
          Profile
        </div>
        <div className="text-sm text-[var(--text-dk)]">
          Your public identity and preferences.
        </div>
      </div>

      {/* ================= TOP (AVATAR + CHIPS) ================= */}
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <button
          onClick={() => setAvatarOpen(true)}
          className="
            relative
            h-16 w-16
            rounded-2xl
            overflow-hidden
            border border-[var(--gray-18)]
            bg-[var(--gray-19)]
            group
            shrink-0
          "
          aria-label="Change avatar"
          title="Change avatar"
        >
          {profile.avatarUrl && AVATAR_MAP[profile.avatarUrl] ? (
            <img
              src={AVATAR_MAP[profile.avatarUrl]}
              className="h-full w-full object-cover"
              alt=""
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <div className="text-base font-semibold text-[var(--text-lt)]">
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

        {/* Chips (tighter) */}
        <div className="flex flex-col gap-2 min-w-0 pt-1">
          {/* Username chip */}
          <div className="group w-fit max-w-full">
            <div className={chipClass()}>
              {editingUsername ? (
                <input
                  ref={usernameRef}
                  value={draft.username ? `@${draft.username}` : ""}
                  onChange={(e) =>
                    setDraft((d) =>
                      d
                        ? {
                            ...d,
                            username: e.target.value.replace(/^@/, "").toLowerCase(),
                          }
                        : d
                    )
                  }
                  onBlur={commitUsername}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      commitUsername()
                    }
                    if (e.key === "Escape") {
                      e.preventDefault()
                      resetDraft()
                      setEditingUsername(false)
                    }
                  }}
                  placeholder="@username"
                  className={chipInputClass()}
                  aria-label="Username"
                />
              ) : (
                <button
                  type="button"
                  onDoubleClick={() => setEditingUsername(true)}
                  className="truncate text-left"
                  title={usernameChip}
                >
                  {usernameChip}
                </button>
              )}

              {!editingUsername ? (
                <button
                  type="button"
                  onClick={() => setEditingUsername(true)}
                  className="
                    ml-2
                    opacity-0 group-hover:opacity-100
                    transition
                    text-[var(--text)]
                  "
                  aria-label="Edit username"
                  title="Edit"
                >
                  <Pencil className="h-3.5 w-3.5 opacity-80" />
                </button>
              ) : savingUsername ? (
                <span className="ml-2 text-xs text-[var(--gray-12)]">Saving…</span>
              ) : null}
            </div>

            {error ? <div className="mt-2 text-xs text-red-400">{error}</div> : null}
          </div>

          {/* Email chip */}
          <div className={chipClass()} title={emailChip}>
            <span className="truncate">{emailChip}</span>
          </div>
        </div>
      </div>

      {/* ================= BIO + TAGS (SIDE-BY-SIDE) ================= */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 items-start">
        {/* Bio */}
        <div>
          <div className="text-xl font-semibold text-[var(--text-lt)]">Bio</div>

          <div
            className="
              mt-3
              rounded-2xl
              border border-[var(--gray-18)]
              bg-gradient-to-br from-[var(--gray-18)] to-[var(--gray-20)]
              px-7 py-6
              min-h-[220px]
              group
              relative
            "
            onDoubleClick={() => setEditingBio(true)}
          >
            {editingBio ? (
              <textarea
                ref={bioRef}
                rows={7}
                value={draft.bio}
                onChange={(e) =>
                  setDraft((d) => (d ? { ...d, bio: e.target.value } : d))
                }
                onBlur={commitBio}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    e.preventDefault()
                    resetDraft()
                    setEditingBio(false)
                  }
                }}
                placeholder="Tell people a little about yourself"
                className="
                  w-full
                  bg-transparent
                  resize-none
                  border-0 outline-none
                  ring-0 ring-offset-0
                  focus:ring-0 focus:ring-offset-0
                  focus-visible:ring-0 focus-visible:ring-offset-0
                  focus:outline-none focus-visible:outline-none
                  placeholder:text-[var(--text-dk)] text-[var(--text)]
                  text-base font-semibold
                  scrollbar
                "
              />
            ) : (
              <div className="text-base font-semibold text-[var(--text)] whitespace-pre-wrap">
                {draft.bio?.trim() ? draft.bio : " "}
              </div>
            )}

            {!editingBio ? (
              <button
                type="button"
                onClick={() => setEditingBio(true)}
                className="
                  absolute top-4 right-4
                  h-9 w-9
                  rounded-2xl
                  border border-[var(--gray-18)]
                  bg-gradient-to-br from-[var(--gray-18)] to-[var(--gray-20)]
                  flex items-center justify-center
                  opacity-0 group-hover:opacity-100
                  transition
                  hover:border-[var(--gray-14)]
                "
                aria-label="Edit bio"
                title="Edit"
              >
                <Pencil className="h-4 w-4 text-[var(--text)] opacity-80" />
              </button>
            ) : savingBio ? (
              <div className="absolute top-5 right-5 text-xs text-[var(--gray-12)]">
                Saving…
              </div>
            ) : null}
          </div>
        </div>

        {/* Tags */}
        <div>
          <div className="text-xl font-semibold text-[var(--text-lt)]">Tags</div>

          <div
            className="
              mt-3
              rounded-2xl
              border border-[var(--gray-18)]
              bg-gradient-to-br from-[var(--gray-18)] to-[var(--gray-20)]
              overflow-hidden
            "
          >
            <div className="flex items-stretch">
              <div className="flex-1 px-5 py-4 text-sm font-semibold text-[var(--text)]">
                {tags.length ? (
                  <div className="leading-5">
                    {tags.map((t) => (
                      <div key={t}>{t},</div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[var(--gray-12)]">No tags</div>
                )}
              </div>

              {/* Plus INSIDE the container */}
              <button
                type="button"
                onClick={() =>
                  setTags((prev) =>
                    prev.includes("New Tag") ? prev : [...prev, "New Tag"]
                  )
                }
                className="
                  w-14
                  border-l border-[var(--gray-18)]
                  bg-transparent
                  flex items-center justify-center
                  hover:bg-[var(--gray-19)]
                  transition-all duration-300
                "
                aria-label="Add tag"
                title="Add tag"
              >
                <Plus className="h-5 w-5 text-[var(--text)] opacity-90" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= PRIVACY + LANGUAGE ================= */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-12 max-w-[980px]">
        <div>
          <div className="text-xl font-semibold text-[var(--text-lt)]">
            Privacy
          </div>

          <div className="mt-3 relative max-w-[520px]">
            <select
              value={privacy}
              onChange={(e) => setPrivacy(e.target.value as PrivacyMode)}
              className={selectPillClass()}
              title="Privacy"
            >
              {PRIVACY_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>

            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--gray-12)]" />
          </div>
        </div>

        <div>
          <div className="text-xl font-semibold text-[var(--text-lt)]">
            Language
          </div>

          <div className="mt-3 relative max-w-[520px]">
            <select
              value={draft.language || "English (US)"}
              onChange={(e) => commitLanguage(e.target.value)}
              className={selectPillClass()}
              disabled={savingLang}
              title="Language"
            >
              {LANGUAGE_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>

            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--gray-12)]" />
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

/* ========================================================================== */
/* STYLES                                                                     */
/* ========================================================================== */

function chipClass() {
  return `
    inline-flex items-center
    h-9
    w-[280px] max-w-[70vw]
    px-4
    rounded-2xl
    border border-[var(--gray-18)]
    bg-gradient-to-br from-[var(--gray-18)] to-[var(--gray-20)]
    text-sm font-semibold text-[var(--text)]
    truncate
  `
}

function chipInputClass() {
  return `
    w-full
    bg-transparent
    border-0 outline-none
    ring-0 ring-offset-0
    focus:ring-0 focus:ring-offset-0
    focus-visible:ring-0 focus-visible:ring-offset-0
    focus:outline-none focus-visible:outline-none
    text-sm font-semibold
    text-[var(--text)]
    placeholder:text-[var(--text-dk)]
  `
}

function selectPillClass() {
  return `
    w-full
    h-11
    appearance-none
    rounded-2xl
    border border-[var(--gray-18)]
    bg-gradient-to-br from-[var(--gray-18)] to-[var(--gray-20)]
    px-5 pr-11
    text-sm font-semibold text-[var(--text)]
    outline-none
    ring-0
    focus:outline-none
    focus:ring-0
    focus-visible:outline-none
    focus-visible:ring-0
    focus:border-[var(--gray-14)]
    hover:border-[var(--gray-14)]
    transition-colors duration-300
  `
}
