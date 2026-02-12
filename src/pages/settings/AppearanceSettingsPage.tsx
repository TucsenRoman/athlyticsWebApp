// src/pages/settings/appearance/AppearanceSettingsPage.tsx
"use client"

import * as React from "react"
import { useMemo, useState } from "react"
import {
  MonitorSmartphone,
  Moon,
  Sun,
  LayoutGrid,
  Snail,
  FileSpreadsheet,
  FileText,
  Presentation,
  ClipboardList,
  Columns3,
  Rows3,
  Palette,
  Type,
  Check,
  X,
  Pencil,
} from "lucide-react"

import { Divider } from "@/components/ui"

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

type ThemeChoice = "Light" | "Dark" | "System"
type DensityChoice = "Compact" | "Comfortable" | "Spacious"
type DefaultView = "Grid" | "List"
type AccentChoice = "Blue" | "Green" | "Purple" | "Coral" | "Slate"
type TypographyChoice = "Default" | "Compact" | "Readable"

type AppearanceDraft = {
  theme: ThemeChoice
  density: DensityChoice
  reducesMotion: boolean
  files: Record<FileTypeKey, FilePrefsDraft>
}

type FileTypeKey = "spreadsheets" | "forms"

type FilePrefsDraft = {
  defaultView: DefaultView
  density: DensityChoice
  accent: AccentChoice
  typography: TypographyChoice
}

type ChoiceDef<T extends string> = {
  key: T
  label: string
  icon: React.ReactNode
  description?: string
}

type LayoutFieldDef = {
  key: "density" | "reducesMotion"
  label: string
  icon: React.ReactNode
  viewValue: (d: AppearanceDraft) => React.ReactNode
  editable: boolean
  editValue?: (d: AppearanceDraft) => string
  onEditChange?: (next: string, d: AppearanceDraft) => AppearanceDraft
}

type FileTypeDef = {
  key: FileTypeKey
  label: string
  icon: React.ReactNode
  description: string
}

/* ========================================================================== */
/* MOCK DATA                                                                  */
/* ========================================================================== */

const DEFAULT_DRAFT: AppearanceDraft = {
  theme: "System",
  density: "Comfortable",
  reducesMotion: false,
  files: {
    spreadsheets: {
      defaultView: "Grid",
      density: "Comfortable",
      accent: "Blue",
      typography: "Default",
    },
    forms: {
      defaultView: "List",
      density: "Comfortable",
      accent: "Green",
      typography: "Default",
    },
  },
}

/* ========================================================================== */
/* PAGE                                                                       */
/* ========================================================================== */

export default function AppearanceSettingsPage() {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [draft, setDraft] = useState<AppearanceDraft>(DEFAULT_DRAFT)

  const resetDraft = React.useCallback(() => {
    setDraft(DEFAULT_DRAFT)
  }, [])

  const themeChoices: ChoiceDef<ThemeChoice>[] = useMemo(
    () => [
      { key: "Light", label: "Light", icon: <Sun className="h-4 w-4" /> },
      { key: "Dark", label: "Dark", icon: <Moon className="h-4 w-4" /> },
      {
        key: "System",
        label: "System",
        icon: <MonitorSmartphone className="h-4 w-4" />,
        description: "Follows your OS preference",
      },
    ],
    []
  )

  const densityChoices: ChoiceDef<DensityChoice>[] = useMemo(
    () => [
      { key: "Compact", label: "Compact", icon: <Rows3 className="h-4 w-4" /> },
      {
        key: "Comfortable",
        label: "Comfortable",
        icon: <LayoutGrid className="h-4 w-4" />,
      },
      { key: "Spacious", label: "Spacious", icon: <Columns3 className="h-4 w-4" /> },
    ],
    []
  )

  const layoutFields: LayoutFieldDef[] = useMemo(
    () => [
      {
        key: "density",
        label: "Interface density",
        icon: <LayoutGrid className="h-4 w-4" />,
        viewValue: (d) => (
          <span className="text-sm font-semibold text-[var(--text)]">{d.density}</span>
        ),
        editable: true,
        editValue: (d) => d.density,
        onEditChange: (next, d) => ({
          ...d,
          density: next as DensityChoice,
        }),
      },
      {
        key: "reducesMotion",
        label: "Reduce motion",
        icon: <Snail className="h-4 w-4" />,
        viewValue: (d) => (
          <span className="text-sm font-semibold text-[var(--text)]">
            {d.reducesMotion ? "On" : "Off"}
          </span>
        ),
        editable: true,
        editValue: (d) => (d.reducesMotion ? "On" : "Off"),
        onEditChange: (next, d) => ({
          ...d,
          reducesMotion: next === "On",
        }),
      },
    ],
    []
  )

  const fileTypes: FileTypeDef[] = useMemo(
    () => [
      {
        key: "spreadsheets",
        label: "Spreadsheets",
        icon: <FileSpreadsheet className="h-4 w-4" />,
        description: "Tables, rows, columns, and calculation-heavy views.",
      },
      {
        key: "forms",
        label: "Forms",
        icon: <ClipboardList className="h-4 w-4" />,
        description: "Structured inputs and response-friendly views.",
      },
    ],
    []
  )

  const accentChoices: AccentChoice[] = useMemo(
    () => ["Blue", "Green", "Purple", "Coral", "Slate"],
    []
  )

  const typographyChoices: TypographyChoice[] = useMemo(
    () => ["Default", "Compact", "Readable"],
    []
  )

  const viewChoices: DefaultView[] = useMemo(() => ["Grid", "List"], [])

  const onSave = async () => {
    if (saving) return
    setSaving(true)
    try {
      // wire later (prefs table / local storage / profile prefs)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-6 space-y-10">
      {/* ================= PAGE HEADER ================= */}
      <div className="space-y-1">
        <div className="text-xl font-semibold text-[var(--gray-4)]">Appearance</div>
        <div className="text-sm text-[var(--gray-12)]">
          Tune the UI for focus, comfort, and clarity.
        </div>
      </div>

      {/* ================= THEME ================= */}
      <div className="space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-[var(--gray-13)]">
          Theme
        </div>

        <div
          className="
            rounded-2xl
            border border-[var(--gray-18)]
            bg-gradient-to-br from-[var(--gray-18)] to-transparent
            px-6 py-6
            space-y-4
          "
        >
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-[var(--text-lt)]">
                Choose your baseline look
              </div>
              <div className="mt-1 text-sm text-[var(--gray-12)]">
                Theme affects surfaces and overlays. System follows your OS preference.
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                {themeChoices.map((t) => {
                  const active = draft.theme === t.key
                  return (
                    <button
                      key={t.key}
                      className={`
                        inline-flex items-center gap-2
                        px-4 py-3
                        rounded-2xl
                        border
                        transition-all duration-300
                        ${
                          active
                            ? "border-[var(--gray-14)] bg-[var(--gray-19)] text-[var(--text-lt)]"
                            : "border-[var(--gray-17)] hover:border-[var(--gray-14)] text-[var(--text)]"
                        }
                      `}
                    >
                      <span className="opacity-90">{t.icon}</span>
                      <span className="text-sm font-semibold">{t.label}</span>
                      {t.description ? (
                        <span className="text-xs text-[var(--gray-12)]">{t.description}</span>
                      ) : null}
                    </button>
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
        </div>
      </div>

      {/* ================= LAYOUT ================= */}
      <div className="space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-[var(--gray-13)]">
          Layout
        </div>

        <div
          className="
            rounded-2xl
            border border-[var(--gray-18)]
            bg-gradient-to-br from-[var(--gray-18)] to-transparent
            px-6 py-6
            space-y-6
          "
        >
          <div className="space-y-3">
            {layoutFields.map((f) => {
              const isDensity = f.key === "density"
              const isReduce = f.key === "reducesMotion"

              const current = f.editValue ? f.editValue(draft) : ""
              const canEdit = editing && f.editable && f.onEditChange

              return (
                <div
                  key={f.key}
                  className="
                    rounded-2xl
                    border border-[var(--gray-18)]
                    bg-[var(--gray-19)]
                    px-5 py-4
                  "
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="text-[var(--gray-12)]">{f.icon}</div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-[var(--text-lt)]">
                          {f.label}
                        </div>
                        <div className="text-xs text-[var(--gray-12)]">
                          {isDensity
                            ? "Controls spacing across tables, lists, and cards."
                            : isReduce
                              ? "Tones down animation and transitions."
                              : null}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {canEdit ? (
                        <div className="flex items-center gap-2">
                          {(isDensity ? densityChoices.map((c) => c.key) : ["Off", "On"]).map(
                            (opt) => {
                              const active = current === opt
                              return (
                                <button
                                  key={opt}
                                  onClick={() => setDraft(f.onEditChange!(opt, draft))}
                                  className={`
                                    inline-flex items-center gap-2
                                    px-3 py-2
                                    rounded-2xl
                                    border
                                    text-sm font-semibold
                                    transition-all duration-300
                                    ${
                                      active
                                        ? "border-[var(--gray-14)] bg-[var(--gray-18)] text-[var(--text-lt)]"
                                        : "border-[var(--gray-17)] text-[var(--text)] hover:border-[var(--gray-14)]"
                                    }
                                  `}
                                >
                                  {isDensity ? (
                                    <span className="opacity-80">
                                      {densityChoices.find((d) => d.key === opt)?.icon}
                                    </span>
                                  ) : null}
                                  {opt}
                                </button>
                              )
                            }
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-[var(--text)]">{f.viewValue(draft)}</div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <Divider />

          <div className="rounded-2xl border border-[var(--gray-18)] bg-[var(--gray-19)] px-5 py-4">
            <div className="text-sm font-semibold text-[var(--text-lt)]">Preview</div>
            <div className="mt-1 text-sm text-[var(--text)]">
              This block can render sample cards, buttons, and typography later.
            </div>
          </div>
        </div>
      </div>

      {/* ================= FILES ================= */}
      <div className="space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-[var(--gray-13)]">
          Files
        </div>

        <div
          className="
            rounded-2xl
            border border-[var(--gray-18)]
            bg-gradient-to-br from-[var(--gray-18)] to-transparent
            px-6 py-6
            space-y-6
          "
        >
          <div className="text-sm text-[var(--gray-12)]">
            Set default appearance preferences per file type. Later you can override these
            per-file inside headers.
          </div>

          <div className="space-y-4">
            {fileTypes.map((ft) => {
              const prefs = draft.files[ft.key]

              return (
                <div
                  key={ft.key}
                  className="
                    rounded-2xl
                    border border-[var(--gray-18)]
                    bg-[var(--gray-19)]
                    px-5 py-5
                    space-y-4
                  "
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="mt-1 text-[var(--gray-12)]">{ft.icon}</div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-[var(--text-lt)]">
                          {ft.label}
                        </div>
                        <div className="mt-1 text-sm text-[var(--text)]">{ft.description}</div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-wide text-[var(--gray-13)]">
                        Defaults
                      </span>
                    </div>
                  </div>

                  <Divider />

                  {/* Pref rows */}
                  <div className="space-y-3">
                    <FilePrefRow
                      icon={<Columns3 className="h-4 w-4" />}
                      label="Default view"
                      value={prefs.defaultView}
                      editing={editing}
                      options={viewChoices}
                      onSelect={(next) =>
                        setDraft((d) => ({
                          ...d,
                          files: {
                            ...d.files,
                            [ft.key]: { ...d.files[ft.key], defaultView: next as DefaultView },
                          },
                        }))
                      }
                    />

                    <FilePrefRow
                      icon={<LayoutGrid className="h-4 w-4" />}
                      label="Density"
                      value={prefs.density}
                      editing={editing}
                      options={densityChoices.map((c) => c.key)}
                      onSelect={(next) =>
                        setDraft((d) => ({
                          ...d,
                          files: {
                            ...d.files,
                            [ft.key]: { ...d.files[ft.key], density: next as DensityChoice },
                          },
                        }))
                      }
                    />

                    <FilePrefRow
                      icon={<Palette className="h-4 w-4" />}
                      label="Accent"
                      value={prefs.accent}
                      editing={editing}
                      options={accentChoices}
                      onSelect={(next) =>
                        setDraft((d) => ({
                          ...d,
                          files: {
                            ...d.files,
                            [ft.key]: { ...d.files[ft.key], accent: next as AccentChoice },
                          },
                        }))
                      }
                    />

                    <FilePrefRow
                      icon={<Type className="h-4 w-4" />}
                      label="Typography"
                      value={prefs.typography}
                      editing={editing}
                      options={typographyChoices}
                      onSelect={(next) =>
                        setDraft((d) => ({
                          ...d,
                          files: {
                            ...d.files,
                            [ft.key]: {
                              ...d.files[ft.key],
                              typography: next as TypographyChoice,
                            },
                          },
                        }))
                      }
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ========================================================================== */
/* SMALL UI                                                                    */
/* ========================================================================== */

function FilePrefRow({
  icon,
  label,
  value,
  editing,
  options,
  onSelect,
}: {
  icon: React.ReactNode
  label: string
  value: string
  editing: boolean
  options: string[]
  onSelect: (next: string) => void
}) {
  return (
    <div
      className="
        rounded-2xl
        border border-[var(--gray-18)]
        bg-[var(--gray-20)]
        px-4 py-4
      "
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="mt-0.5 text-[var(--gray-12)]">{icon}</div>
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-wide text-[var(--gray-13)]">
              {label}
            </div>
            <div className="mt-2 text-sm font-semibold text-[var(--text-lt)]">
              {editing ? "Choose" : value}
            </div>
          </div>
        </div>

        <div className="shrink-0">
          {editing ? (
            <div className="flex flex-wrap items-center justify-end gap-2">
              {options.map((opt) => {
                const active = value === opt
                return (
                  <button
                    key={opt}
                    onClick={() => onSelect(opt)}
                    className={`
                      inline-flex items-center justify-center
                      px-3 py-2
                      rounded-2xl
                      border
                      text-sm font-semibold
                      transition-all duration-300
                      ${
                        active
                          ? "border-[var(--gray-14)] bg-[var(--gray-18)] text-[var(--text-lt)]"
                          : "border-[var(--gray-17)] text-[var(--text)] hover:border-[var(--gray-14)]"
                      }
                    `}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="text-sm text-[var(--text)]">{value}</div>
          )}
        </div>
      </div>
    </div>
  )
}
