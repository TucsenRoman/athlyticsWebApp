// src/pages/settings/FeedbackPage.tsx
"use client"

import * as React from "react"
import { useMemo, useRef, useState } from "react"
import {
  Bug,
  Lightbulb,
  ThumbsUp,
  MessageSquarePlus,
  Paperclip,
  Send,
  X,
  File as FileIcon,
} from "lucide-react"

import { supabase } from "@/integrations/supabase/client"

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

type FeedbackKind = "Bug" | "Idea" | "Praise" | "Other"

type FeedbackDraft = {
  kind: FeedbackKind | null
  title: string
  message: string
}

type AttachedFile = {
  id: string
  file: File
}

/* ========================================================================== */
/* CONSTS                                                                     */
/* ========================================================================== */

const MAX_FILES = 5
const BUCKET = "feedback" as const

/* ========================================================================== */
/* PAGE                                                                       */
/* ========================================================================== */

export default function FeedbackPage() {
  const kindOptions = useMemo<
    { key: FeedbackKind; label: string; icon: React.ReactNode; hint: string }[]
  >(
    () => [
      {
        key: "Bug",
        label: "Bug",
        icon: <Bug className="h-4 w-4" />,
        hint: "What you expected vs what happened. Include steps to reproduce the bug",
      },
      {
        key: "Idea",
        label: "Idea",
        icon: <Lightbulb className="h-4 w-4" />,
        hint: "Problem, who it helps, and what “done” looks like",
      },
      {
        key: "Praise",
        label: "Praise",
        icon: <ThumbsUp className="h-4 w-4" />,
        hint: "What you like so we can keep it consistent",
      },
      {
        key: "Other",
        label: "Other",
        icon: <MessageSquarePlus className="h-4 w-4" />,
        hint: "Anything else you want us to know",
      },
    ],
    []
  )

  const [draft, setDraft] = useState<FeedbackDraft>({
    kind: null,
    title: "",
    message: "",
  })

  const canSend = Boolean(draft.message.trim())

  const tipText = useMemo(() => {
    const selected = kindOptions.find((k) => k.key === draft.kind)
    return selected
      ? `Tip: ${selected.hint}`
      : "Tip: Include expected vs actual (and steps if it’s a bug)"
  }, [draft.kind, kindOptions])

  // Attachments (local UI + upload)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [attachments, setAttachments] = useState<AttachedFile[]>([])
  const [attachError, setAttachError] = useState<string | null>(null)

  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [sentOk, setSentOk] = useState(false)

  const attachDisabled = attachments.length >= MAX_FILES

  const onPickFiles = () => {
    if (attachments.length >= MAX_FILES) {
      setAttachError(`Max ${MAX_FILES} files.`)
      return
    }
    setAttachError(null)
    fileInputRef.current?.click()
  }

  const onFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files ?? [])
    if (list.length === 0) return

    setAttachments((prev) => {
      let next: AttachedFile[] = [...prev]

      for (const f of list) {
        if (next.length >= MAX_FILES) break

        const exists = next.some(
          (a) =>
            a.file.name === f.name &&
            a.file.size === f.size &&
            a.file.lastModified === f.lastModified
        )
        if (!exists) next.push({ id: crypto.randomUUID(), file: f })
      }

      if (next.length >= MAX_FILES && next.length !== prev.length) {
        // filled up during this selection
        if (prev.length < MAX_FILES) setAttachError(null)
      }

      // if they tried to add more beyond the cap
      const wouldExceed = prev.length + list.length > MAX_FILES
      if (wouldExceed && next.length >= MAX_FILES) {
        setAttachError(`Only ${MAX_FILES} files max.`)
      } else {
        setAttachError(null)
      }

      return next
    })

    e.target.value = ""
  }

  const removeAttachment = (id: string) => {
    setAttachments((prev) => {
      const next = prev.filter((a) => a.id !== id)
      if (next.length < MAX_FILES) setAttachError(null)
      return next
    })
  }

  const prettySize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    const kb = bytes / 1024
    if (kb < 1024) return `${kb.toFixed(kb >= 10 ? 0 : 1)} KB`
    const mb = kb / 1024
    if (mb < 1024) return `${mb.toFixed(mb >= 10 ? 0 : 1)} MB`
    const gb = mb / 1024
    return `${gb.toFixed(gb >= 10 ? 0 : 1)} GB`
  }

  const resetAll = () => {
    setDraft({ kind: null, title: "", message: "" })
    setAttachments([])
    setAttachError(null)
    setSendError(null)
  }

  const onSend = async () => {
    if (sending) return
    setSending(true)
    setSentOk(false)
    setSendError(null)

    try {
      // 1) ensure authed user
      const { data: userRes, error: userErr } = await supabase.auth.getUser()
      if (userErr) throw userErr
      const user = userRes?.user
      if (!user) throw new Error("You must be signed in to send feedback.")

      // 2) insert feedback row
      const { data: fbRow, error: fbErr } = await supabase
        .from("feedback")
        .insert({
          user_id: user.id,
          kind: draft.kind,
          title: draft.title.trim() ? draft.title.trim() : null,
          message: draft.message.trim(),
        })
        .select("id")
        .single()

      if (fbErr) throw fbErr
      const feedbackId = fbRow.id as string

      // 3) upload files (if any) + insert attachment rows
      if (attachments.length > 0) {
        const rows: {
          feedback_id: string
          user_id: string
          bucket: string
          path: string
          filename: string
          size: number
          mime: string | null
        }[] = []

        for (const a of attachments) {
          const f = a.file
          const safeName = f.name.replace(/[^\w.\-() ]+/g, "_")
          const objectPath = `${user.id}/${feedbackId}/${crypto.randomUUID()}-${safeName}`

          const { error: upErr } = await supabase.storage
            .from(BUCKET)
            .upload(objectPath, f, {
              cacheControl: "3600",
              upsert: false,
              contentType: f.type || undefined,
            })

          if (upErr) throw upErr

          rows.push({
            feedback_id: feedbackId,
            user_id: user.id,
            bucket: BUCKET,
            path: objectPath,
            filename: f.name,
            size: f.size,
            mime: f.type || null,
          })
        }

        const { error: attErr } = await supabase
          .from("feedback_attachments")
          .insert(rows)

        if (attErr) throw attErr
      }

      // 4) success UX
      setSentOk(true)
      resetAll()
    } catch (err: any) {
      setSendError(err?.message ?? "Failed to send feedback.")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-none px-5 py-6">
      {/* ================= PAGE HEADER ================= */}
      <div className="flex items-start gap-4 min-w-0">
        <div className="flex flex-col">
          <div className="text-xl font-semibold text-[var(--text-lt)]">
            Feedback
          </div>
          <div className="text-xs text-[var(--text-dk)]">
            Report bugs, request features, or tell us what’s working.
          </div>
        </div>
      </div>

      {/* ================= SINGLE CARD ================= */}
      <div
        className="
          flex flex-col gap-6
          p-3 w-full max-w-none h-fit
          rounded-2xl border border-[var(--gray-18)]
          bg-gradient-to-br from-[var(--gray-18)] to-transparent
        "
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={onFilesSelected}
        />

        {/* Type */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="text-lg font-medium tracking-wide text-[var(--text-lt)]">
              Type
            </div>
            <div className="text-sm text-[var(--text)]">(opt.)</div>
          </div>

          <div className="flex flex-wrap gap-4">
            {kindOptions.map((k) => {
              const active = draft.kind === k.key

              return (
                <button
                  key={k.key}
                  onClick={() =>
                    setDraft((d) => ({
                      ...d,
                      kind: d.kind === k.key ? null : k.key,
                    }))
                  }
                  className={`
                    inline-flex items-center justify-center
                    rounded-2xl border
                    transition-all duration-300
                    ${active ? "gap-3 px-4 py-3" : "w-12 h-12 p-0"}
                    ${
                      active
                        ? "border-[var(--gray-14)] bg-[var(--gray-18)] text-[var(--text-lt)]"
                        : "border-[var(--gray-17)] bg-[var(--gray-19)] text-[var(--text)] hover:border-[var(--gray-14)]"
                    }
                  `}
                  aria-pressed={active}
                  title={!active ? k.label : undefined}
                >
                  <span className="flex items-center justify-center shrink-0 w-5 h-5 opacity-90">
                    {k.icon}
                  </span>

                  {active ? (
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-semibold whitespace-nowrap">
                        {k.label}
                      </span>
                    </div>
                  ) : null}
                </button>
              )
            })}
          </div>
        </div>

        {/* Subject */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="text-lg font-medium tracking-wide text-[var(--text-lt)]">
              Subject
            </div>
            <div className="text-sm text-[var(--text)]">(opt.)</div>
          </div>

          <div className="flex flex-col rounded-2xl border border-[var(--gray-18)] bg-[var(--gray-19)] px-6 py-3">
            <input
              value={draft.title}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              placeholder='"Pinned files disappear on refresh"'
              className="
                w-full
                bg-transparent
                border-0 outline-none
                ring-0 ring-offset-0
                focus:ring-0 focus:ring-offset-0
                focus-visible:ring-0 focus-visible:ring-offset-0
                focus:outline-none focus-visible:outline-none
                placeholder:text-[var(--text-dk)] text-[var(--text-dk)]
                hover:text-[var(--text)] focus:text-[var(--text-lt)]
                text-base font-semibold
                transition-colors duration-300
              "
            />
          </div>
        </div>

        {/* Message */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-4">
            <div className="text-lg font-medium tracking-wide text-[var(--text-lt)]">
              Details
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--gray-18)] bg-[var(--gray-19)] px-6 py-3">
            <textarea
              rows={8}
              value={draft.message}
              onChange={(e) => setDraft((d) => ({ ...d, message: e.target.value }))}
              placeholder="Explain however you see fit..."
              className="
                p-3 w-full
                bg-transparent
                resize-none
                border-0 outline-none
                ring-0 ring-offset-0
                focus:ring-0 focus:ring-offset-0
                focus-visible:ring-0 focus-visible:ring-offset-0
                focus:outline-none focus-visible:outline-none
                placeholder:text-[var(--text-dk)] text-[var(--text-dk)]
                hover:text-[var(--text)] focus:text-[var(--text-lt)]
                text-sm font-semibold
                transition-colors duration-300
                scrollbar
              "
            />

            <div className="flex items-center justify-between gap-4">
              <div className="text-xs text-[var(--gray-12)]">
                {draft.message.trim().length}/1000
              </div>
              <div className="text-xs text-[var(--gray-12)]">{tipText}</div>
            </div>
          </div>
        </div>

        {/* Attachments list */}
        {attachments.length > 0 ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs text-[var(--gray-12)]">
                Attachments ({attachments.length}/{MAX_FILES})
              </div>
              {attachError ? (
                <div className="text-xs text-[var(--warning-lt)]">{attachError}</div>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              {attachments.map((a) => (
                <div
                  key={a.id}
                  className="
                    flex items-center justify-between gap-3
                    rounded-2xl border border-[var(--gray-18)]
                    bg-[var(--gray-19)]
                    px-4 py-3
                  "
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="text-[var(--text)] shrink-0">
                      <FileIcon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-[var(--text)] truncate">
                        {a.file.name}
                      </div>
                      <div className="text-xs text-[var(--gray-12)]">
                        {prettySize(a.file.size)}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => removeAttachment(a.id)}
                    className="
                      shrink-0
                      p-2
                      rounded-2xl
                      border border-[var(--gray-18)]
                      bg-[var(--gray-19)]
                      hover:border-[var(--gray-14)]
                      hover:bg-[var(--gray-18)]
                      transition-all duration-300
                    "
                    aria-label={`Remove ${a.file.name}`}
                    title="Remove"
                  >
                    <X className="h-4 w-4 text-[var(--text)]" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : attachError ? (
          <div className="text-xs text-[var(--warning-lt)]">{attachError}</div>
        ) : null}

        {/* Status */}
        {sendError ? (
          <div className="text-xs text-red-400">{sendError}</div>
        ) : sentOk ? (
          <div className="text-xs text-[var(--success)]">Sent. Thank you!</div>
        ) : null}

        {/* Bottom actions */}
        <div className="flex items-center justify-end gap-2 pt-1">
          {/* <button
            onClick={onPickFiles}
            disabled={attachDisabled || sending}
            className={`
              p-3
              rounded-2xl
              border
              transition-all duration-300
              ${
                attachDisabled || sending
                  ? "border-[var(--gray-18)] bg-[var(--gray-19)] text-[var(--gray-12)] cursor-not-allowed"
                  : "border-[var(--gray-17)] bg-[var(--gray-19)] hover:border-[var(--gray-14)] hover:bg-[var(--gray-18)]"
              }
            `}
            aria-label="Attach file"
            title={
              sending
                ? "Sending…"
                : attachDisabled
                  ? `Max ${MAX_FILES} files`
                  : "Attach file"
            }
          >
            <Paperclip
              className={`h-4 w-4 ${
                attachDisabled || sending ? "text-[var(--gray-12)]" : "text-[var(--text)]"
              }`}
            />
          </button> */}

          <button
            onClick={onSend}
            disabled={!canSend || sending}
            className={`
              inline-flex items-center gap-2 justify-center
              px-5 py-3
              rounded-2xl
              border
              text-sm font-semibold
              transition-all duration-300
              ${
                !canSend || sending
                  ? "border-[var(--gray-18)] bg-[var(--gray-19)] text-[var(--gray-12)] cursor-not-allowed"
                  : "border-[var(--gray-17)] hover:border-transparent hover:bg-[var(--gray-17)] text-[var(--text)] hover:text-[var(--text-lt)]"
              }
            `}
            aria-disabled={!canSend || sending}
            title={!canSend ? "Add some details to enable Send" : "Send"}
          >
            <Send className="h-4 w-4 opacity-90" />
            {sending ? "Sending…" : "Send"}
          </button>
        </div>
      </div>

      {/* ================= FOOT NOTE ================= */}
      <div className="text-sm text-[var(--gray-12)]">
        We’ll route this to the right place and follow up if we need more info. Thank you!
      </div>
    </div>
  )
}
