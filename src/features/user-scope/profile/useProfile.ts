import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/integrations/supabase/client"
import type { Profile } from "@/types/profile.types"

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

type UpdateProfileDraft = {
  fullName: string
  username?: string
  bio: string
  language: string
}

type UseProfileResult = {
  profile: Profile | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  setAvatar: (avatarId: string) => Promise<void>
  updateProfile: (draft: UpdateProfileDraft) => Promise<boolean>
}

/* ========================================================================== */
/* HOOK                                                                       */
/* ========================================================================== */

export function useProfile(): UseProfileResult {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /* ------------------------------------------------------------------------ */
  /* FETCH                                                                    */
  /* ------------------------------------------------------------------------ */

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    setError(null)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }

    const { data, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, username, bio, avatar_url, language")
      .eq("id", user.id)
      .single()

    if (profileError) {
      setProfile(null)
      setError(profileError.message)
      setLoading(false)
      return
    }

    setProfile({
      id: user.id,
      email: user.email ?? "",
      fullName: data.full_name ?? null,
      username: data.username ?? null,
      bio: data.bio ?? null,
      avatarUrl: data.avatar_url ?? null,
      language: data.language ?? "en",
    })

    setLoading(false)
  }, [])

  /* ------------------------------------------------------------------------ */
  /* AUTH LIFECYCLE                                                           */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setProfile(null)
        setError("Not authenticated")
        setLoading(false)
        return
      }

      fetchProfile()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchProfile])

  /* ------------------------------------------------------------------------ */
  /* REALTIME — SOFT AVATAR SYNC                                               */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!profile?.id) return

    const channel = supabase
      .channel("profile-avatar-sync")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${profile.id}`,
        },
        (payload) => {
          const nextAvatar = payload.new.avatar_url ?? null

          setProfile((prev) =>
            prev
              ? {
                  ...prev,
                  avatarUrl: nextAvatar,
                }
              : prev
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [profile?.id])

  /* ------------------------------------------------------------------------ */
  /* MUTATIONS                                                                */
  /* ------------------------------------------------------------------------ */

  const setAvatar = useCallback(
    async (avatarId: string) => {
      if (!profile) return

      const prev = profile

      // optimistic update
      setProfile({
        ...profile,
        avatarUrl: avatarId,
      })

      const { error: dbError } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarId })
        .eq("id", profile.id)

      if (dbError) {
        setProfile(prev)
        setError(dbError.message)
      }
    },
    [profile]
  )

  const updateProfile = useCallback(
    async (draft: UpdateProfileDraft) => {
      if (!profile) return

      const prev = profile

      // optimistic update
      setProfile({
        ...profile,
        fullName: draft.fullName,
        bio: draft.bio,
        language: draft.language,
        ...(draft.username !== undefined && { username: draft.username }),
      })

      const { error: dbError, status } = await supabase
        .from("profiles")
        .update({
          full_name: draft.fullName,
          bio: draft.bio,
          language: draft.language,
          ...(draft.username !== undefined && { username: draft.username }),
        })
        .eq("id", profile.id)

      if (dbError) {
        setProfile(prev)

        if (dbError.code === "23505" || status === 409) {
          setError("That username is already taken")
        } else {
          setError(dbError.message)
        }

        return false
      }

      return true
    },
    [profile]
  )

  /* ------------------------------------------------------------------------ */
  /* PUBLIC API                                                               */
  /* ------------------------------------------------------------------------ */

  return {
    profile,
    loading,
    error,
    refresh: fetchProfile,
    setAvatar,
    updateProfile,
  }
}
