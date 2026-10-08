// src/features/workspace/views/editor/EditorFooter.tsx
"use client"

import * as React from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import {
  FilePlus2,
  MoreHorizontal,
  Package,
  Route,
  Settings,
  Trash2,
  X,
  FileText,
  Plus,
} from "lucide-react"

import ExpansiveMenu, {
  type ExpansiveMenuItem,
} from "@/components/ui/navigation/expansivemenu"
import { fetchPackageFiles } from "@/lib/fetchPackageFiles"

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

export interface FileTab {
  id: string
  name: string
}

export interface PackageFileGroup {
  packageName: string
  packageId: string
  files: FileTab[]
}

export type EditorFooterProps = {
  programId: number

  openFiles?: FileTab[]
  activeFileId?: string
  setActiveFileId: (id: string) => void

  onCreateFile?: () => void
  onSelectFile?: (id: string) => void
  onCloseTab?: (id: string) => void

  onManageRoutes?: () => void
  onSettings?: () => void
  onDeleteFile?: (id: string) => void
}

/* -------------------------------------------------------------------------- */
/* CLICK OUTSIDE                                                              */
/* -------------------------------------------------------------------------- */

function useClickOutside(
  refs: React.RefObject<HTMLElement>[],
  handler: () => void
) {
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      const target = e.target as Node
      const inside = refs.some((r) => r.current?.contains(target))
      if (!inside) handler()
    }

    window.addEventListener("mousedown", fn)
    return () => window.removeEventListener("mousedown", fn)
  }, [refs, handler])
}

/* -------------------------------------------------------------------------- */
/* COMPONENT                                                                  */
/* -------------------------------------------------------------------------- */

export default function EditorFooter({
  programId,
  openFiles,
  activeFileId,
  setActiveFileId,
  onCreateFile,
  onSelectFile,
  onCloseTab,
  onManageRoutes,
  onSettings,
  onDeleteFile,
}: EditorFooterProps) {
  const tabs = useMemo<FileTab[]>(() => openFiles ?? [], [openFiles])
  const activeId = activeFileId ?? ""
  const activeTab = tabs.find((t) => t.id === activeId) ?? null

  const [addOpen, setAddOpen] = useState(false)
  const [overflowOpen, setOverflowOpen] = useState(false)
  const [packageFiles, setPackageFiles] = useState<PackageFileGroup[]>([])

  const addRef = useRef<HTMLDivElement>(null)
  const overflowRef = useRef<HTMLDivElement>(null)

  /* LOAD PACKAGES → FILES -------------------------------------------------- */
  useEffect(() => {
    let mounted = true

    async function load() {
      const data = await fetchPackageFiles(programId)

      const adapted: PackageFileGroup[] = (data ?? []).map((pkg: any) => ({
        packageName: pkg.packageName,
        packageId: pkg.packageId,
        files: (pkg.files ?? []).map((x: any) => ({ id: x.id, name: x.name })),
      }))

      if (mounted) setPackageFiles(adapted)
    }

    if (programId) load()
    return () => {
      mounted = false
    }
  }, [programId])

  /* MENU ITEMS ------------------------------------------------------------- */
  const menuItems = useMemo<ExpansiveMenuItem[]>(() => {
    const pickFile = (id: string) => {
      setActiveFileId(id)
      onSelectFile?.(id)
    }

    const pkgItems: ExpansiveMenuItem[] = packageFiles.map((pkg) => ({
      id: `pkg-${pkg.packageId}`,
      label: pkg.packageName || "Package",
      icon: <Package className="h-4 w-4" />,
      children: (pkg.files ?? []).map((f) => ({
        id: f.id,
        label: f.name || "Untitled",
        icon: <FileText className="h-4 w-4" />,
        action: () => pickFile(f.id),
      })),
    }))

    return [
      {
        id: "new-file",
        label: "New file",
        icon: <FilePlus2 className="h-4 w-4" />,
        action: () => onCreateFile?.(),
      },
      ...pkgItems,
    ]
  }, [packageFiles, onCreateFile, onSelectFile, setActiveFileId])

  /* CLICK OUTSIDE ---------------------------------------------------------- */
  useClickOutside([addRef, overflowRef], () => {
    setAddOpen(false)
    setOverflowOpen(false)
  })

  return (
    <div
      className="
        flex items-center justify-between
        h-10
        text-[var(--text-dk)]
        select-none
      "
    >
      {/* LEFT: OPEN FILE TABS ---------------------------------------------- */}
      <div className="flex gap-4">
        <div className="flex items-center gap-2 overflow-x-auto flex-1 pr-2 max-w-[500px]">
          {tabs.map((tab) => {
            const active = tab.id === activeId

            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveFileId(tab.id)
                  onSelectFile?.(tab.id)
                }}
                className={`
                  relative shrink-0 flex justify-between items-center gap-2
                  pl-3 pr-1 py-1 h-6
                  rounded-full border border-[var(--gray-18)]
                  text-sm whitespace-nowrap transition-all duration-300
                  ${
                    active
                      ? "bg-[var(--gray-19)] text-[var(--text-lt)]"
                      : "hover:bg-[var(--gray-20)] text-[var(--text-dk)] hover:text-[var(--text)]"
                  }
                `}
              >
                <span className="-translate-y-[1px] truncate">{tab.name}</span>

                <span
                  onClick={(e) => {
                    e.stopPropagation()
                    onCloseTab?.(tab.id)
                  }}
                  className={`
                    p-1 rounded-full cursor-pointer transition-all duration-300
                    ${
                      active
                        ? "hover:bg-[var(--gray-17)]"
                        : "hover:bg-[var(--gray-18)]"
                    }
                  `}
                  role="button"
                  aria-label="Close tab"
                  title="Close"
                >
                  <X className="w-3 h-3" />
                </span>
              </button>
            )
          })}
        </div>

        {/* OPEN/ADD NEW */}
        <div className="relative shrink-0" ref={addRef}>
          <ExpansiveMenu
            items={menuItems}
            open={addOpen}
            setOpen={(v) => {
              setAddOpen(v)
              if (v) setOverflowOpen(false)
            }}
            expand="line"
            variant="panel"
            direction="right"
            radius={62}
            spacing={44}
            mainIcon={<Plus className="h-4 w-4" />}
            mainIconSize={18}
            mainSize={24}
            mainRotate={45}
            defaultState="closed"
            autoClose
          />
        </div>
      </div>

      {/* RIGHT: OVERFLOW --------------------------------------------------- */}
      <div className="relative" ref={overflowRef}>
        <button
          onClick={() => {
            setOverflowOpen((v) => !v)
            setAddOpen(false)
          }}
          className="
            h-8 w-8 inline-flex items-center justify-center
            rounded-full
            hover:bg-[var(--gray-18)]
            text-[var(--text-dk)]
          "
          aria-label="More"
          title="More"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>

        {overflowOpen && (
          <div
            className="
              absolute right-0 bottom-12 z-50
              w-52 bg-[var(--bg)]
              border border-[var(--border)]
              rounded-xl py-1
              text-[var(--text-dk)]
            "
          >
            <div
              className="
                px-3 py-1.5 text-xs font-medium
                text-[var(--text)]
                border-b border-[var(--border)]
              "
            >
              {activeTab?.name ?? "No file selected"}
            </div>

            <button
              onClick={() => {
                setOverflowOpen(false)
                onManageRoutes?.()
              }}
              className="
                w-full flex items-center gap-2 px-3 py-2
                text-[var(--text-dk)]
                hover:bg-[var(--gray-ltt)]
              "
            >
              <Route className="w-4 h-4" />
              Manage Routes
            </button>

            <button
              onClick={() => {
                setOverflowOpen(false)
                onSettings?.()
              }}
              className="
                w-full flex items-center gap-2 px-3 py-2
                text-[var(--text-dk)]
                hover:bg-[var(--gray-ltt)]
              "
            >
              <Settings className="w-4 h-4" />
              File Settings
            </button>

            <div className="my-1 border-t border-[var(--border)]" />

            <button
              onClick={() => {
                setOverflowOpen(false)
                if (activeId) onDeleteFile?.(activeId)
              }}
              className="
                w-full flex items-center gap-2 px-3 py-2
                text-[var(--danger)]
                hover:bg-[var(--danger-bg)]
              "
              disabled={!activeId}
            >
              <Trash2 className="w-4 h-4" />
              Delete Active File
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
