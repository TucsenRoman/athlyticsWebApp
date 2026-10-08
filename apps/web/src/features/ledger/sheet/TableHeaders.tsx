// src/features/ledger/sheet/TableHeaders.tsx
"use client"

import React, { useCallback, useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/forms/input"
import { Button } from "@/components/ui/actions/button"
import { supabase } from "@/integrations/supabase/client"

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/overlays/dropdown-menu"

import {
  ChevronDown,
  Pencil,
  Trash2,
  Settings2,
  Type,
  Hash,
  List,
  CheckSquare,
  Clock,
  Plus,
  Pin,
  PinOff,
  Funnel,
  ArrowUpNarrowWide,
  ArrowDownWideNarrow,
  Link as LinkIcon,
  Eye,
  EyeOff,
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/overlays/dialog"

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function getFileIdFromColumn(col: any): string {
  return (col?.file_id ?? "") as string
}

type SortDir = "asc" | "desc"

type HeaderCellProps = {
  header: any
  index: number

  isEditing: boolean
  editValue: string
  setEditValue: (v: string) => void
  setEditingId: (id: string | null) => void

  handleRename: (columnId: string) => void
  handleChangeType: (columnId: string, type: string) => void
  handleDelete: (columnId: string, name: string) => void
  addAt: (index: number) => void

  typeIcons: Record<string, React.ElementType>

  pinnedColumns: string[]
  onTogglePin?: (id: string) => void
  pinMode: boolean

  onSort?: (columnId: string, dir: SortDir) => void

  blurMode: boolean
  isBlurred: boolean
  onToggleBlur?: (id: string) => void

  onOpenRouteConnect?: (col: any) => void
  onOpenRouteInfo?: (col: any) => void
}

function HeaderCell({
  header,
  index,

  isEditing,
  editValue,
  setEditValue,
  setEditingId,

  handleRename,
  handleChangeType,
  handleDelete,
  addAt,

  typeIcons,
  pinnedColumns,
  onTogglePin,
  pinMode,
  onSort,

  blurMode,
  isBlurred,
  onToggleBlur,

  onOpenRouteConnect,
  onOpenRouteInfo,
}: HeaderCellProps) {
  const Icon = typeIcons?.[header?.type] || Type
  const isPinned = pinnedColumns.includes(header?.id)

  const [sortDialogOpen, setSortDialogOpen] = useState(false)

  const isPrimary = header?.route_class === "primary"
  const isSecondary = header?.route_class === "secondary"

  const routeIconClass =
    isPrimary
      ? "text-[var(--fvr-blue)] hover:text-[var(--fvr-blue-md)]"
      : isSecondary
      ? "text-[var(--fvr-green)] hover:text-[var(--fvr-green-md)]"
      : "text-[var(--text-lt)] hover:text-[var(--dom-dk)]"

  return (
    <>
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className={[
          "group relative flex justify-around items-center overflow-hidden",
          "px-2 pt-[6px] pb-[4px] h-full w-full",
          pinMode ? "ring-2 ring-[rgba(89,111,126,0.35)]" : "",
          "bg-transparent",
        ].join(" ")}
        style={{
          backgroundColor: isPinned ? "var(--gray-20)" : "transparent",
          zIndex: isPinned ? 50 : 1,
        }}
      >
        {/* LEFT */}
        <div className="flex justify-center items-center gap-2 overflow-hidden select-none min-w-0">
          <Icon
            className={[
              "absolute right-[6px] top-[4px]",
              "w-2 h-2",
              "text-[var(--text-dk)]",
              "pointer-events-none",
            ].join(" ")}
          />

          {(pinMode || isPinned) && (
            <button
              type="button"
              className="cursor-pointer shrink-0"
              title={isPinned ? "Unpin column" : "Pin column"}
              onClick={(e) => {
                e.stopPropagation()
                onTogglePin?.(header?.id)
              }}
            >
              {isPinned ? (
                <Pin className="w-3.5 h-3.5 rotate-45 fill-[var(--acc-md)] text-[var(--acc-md)]" />
              ) : (
                <Pin className="w-3.5 h-3.5 text-[var(--text-lt)]" />
              )}
            </button>
          )}

          {(blurMode || isBlurred) && (
            <button
              type="button"
              className="cursor-pointer shrink-0"
              title={isBlurred ? "Unblur column" : "Blur column"}
              onClick={(e) => {
                e.stopPropagation()
                onToggleBlur?.(header?.id)
              }}
            >
              {isBlurred ? (
                <EyeOff className="w-3.5 h-3.5 text-[var(--text-lt)]" />
              ) : (
                <Eye className="w-3.5 h-3.5 text-[var(--text-lt)]" />
              )}
            </button>
          )}

          {isEditing ? (
            <Input
              value={editValue}
              autoFocus
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => handleRename(header.id)}
              onKeyDown={(e) => e.key === "Enter" && handleRename(header.id)}
              className={[
                "h-7 text-sm px-1",
                "border-none focus:ring-0",
                "bg-transparent text-[var(--text)]",
                "truncate w-full min-w-0",
              ].join(" ")}
            />
          ) : (
            <span
              className={[
                "font-semibold text-sm truncate cursor-pointer",
                "text-[var(--text)] max-w-full",
              ].join(" ")}
              title={header?.name}
              onDoubleClick={() => {
                if (pinMode) return
                setEditingId(header.id)
                setEditValue(header.name ?? "")
              }}
            >
              {header?.name || `Column ${index + 1}`}
            </span>
          )}

          <div className="absolute right-[0px] bottom-[-2px] flex items-center h-[20px] p-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  iconSize="sm"
                  className={[
                    "h-3 w-3 p-0",
                    "text-[var(--text-dk)] hover:text-[var(--text-lt)]",
                    // "hover:bg-[rgba(255,255,255,0.06)]",
                  ].join(" ")}
                >
                  <ChevronDown />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className={[
                  "w-56 shadow-md",
                  "border border-[var(--gray-18)]",
                  "bg-[var(--gray-20)] text-[var(--text)]",
                ].join(" ")}
              >
                <DropdownMenuItem
                  onClick={() => setSortDialogOpen(true)}
                  className="hover:bg-[rgba(255,255,255,0.06)]"
                >
                  <Funnel className="w-4 h-4 mr-2" /> Sort
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-[var(--gray-18)]" />

                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="hover:bg-[rgba(255,255,255,0.06)]">
                    <Settings2 className="w-4 h-4 mr-2" /> Column type
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="border border-[var(--gray-18)] bg-[var(--gray-20)] text-[var(--text)]">
                    {Object.keys(typeIcons).map((type) => {
                      const TypeIcon = typeIcons[type]
                      return (
                        <DropdownMenuItem
                          key={type}
                          onClick={() => handleChangeType(header.id, type)}
                          className="hover:bg-[rgba(255,255,255,0.06)]"
                        >
                          <TypeIcon className="w-4 h-4 mr-2" /> {type}
                        </DropdownMenuItem>
                      )
                    })}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuSeparator className="bg-[var(--gray-18)]" />

                {/* {!isPrimary && !isSecondary && (
                  <>
                    <DropdownMenuItem
                      onClick={() => onOpenRouteConnect?.(header)}
                      disabled={!onOpenRouteConnect}
                      className="hover:bg-[rgba(255,255,255,0.06)]"
                    >
                      <LinkIcon className="w-4 h-4 mr-2" /> Connect route
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-[var(--gray-18)]" />
                  </>
                )} */}

                <DropdownMenuItem
                  onClick={() => {
                    setEditingId(header.id)
                    setEditValue(header.name ?? "")
                  }}
                  className="hover:bg-[rgba(255,255,255,0.06)]"
                >
                  <Pencil className="w-4 h-4 mr-2" /> Rename
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => onTogglePin?.(header.id)}
                  disabled={!onTogglePin}
                  className="hover:bg-[rgba(255,255,255,0.06)]"
                >
                  {isPinned ? (
                    <PinOff className="w-4 h-4 mr-2" />
                  ) : (
                    <Pin className="w-4 h-4 mr-2" />
                  )}
                  {isPinned ? "Unpin" : "Pin"}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => addAt(index + 1)}
                  className="hover:bg-[rgba(255,255,255,0.06)]"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add column
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-[var(--gray-18)]" />

                <DropdownMenuItem
                  onClick={() => handleDelete(header.id, header.name)}
                  className={[
                    "text-[var(--danger)]",
                    "hover:bg-[rgba(255,255,255,0.06)]",
                  ].join(" ")}
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-1 pr-[2px] relative shrink-0">
          {(isPrimary || isSecondary) && (
            <LinkIcon
              size={15}
              strokeWidth={2.3}
              onClick={(e) => {
                e.stopPropagation()
                onOpenRouteInfo?.(header)
              }}
              className={`cursor-pointer opacity-90 ${routeIconClass}`}
              aria-label={isPrimary ? "Primary Route" : "Secondary Route"}
            />
          )}
        </div>
      </motion.div>

      {/* Sort Dialog */}
      <Dialog open={sortDialogOpen} onOpenChange={setSortDialogOpen}>
        <DialogContent className="max-w-sm bg-[var(--gray-20)] border border-[var(--gray-18)] text-[var(--text)]">
          <DialogHeader>
            <DialogTitle className="text-[var(--text)]">Sort</DialogTitle>
          </DialogHeader>

          <div className="my-3 text-center">
            <h3 className="text-base font-semibold text-[var(--text)]">
              {header?.name}
            </h3>
            <p className="text-xs text-[var(--text-lt)] mt-1">
              Pick a direction.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                onSort?.(header.id, "asc")
                setSortDialogOpen(false)
              }}
              disabled={!onSort}
              className="border border-[var(--gray-18)] bg-[var(--gray-20)] text-[var(--text)] hover:bg-[rgba(255,255,255,0.06)]"
            >
              <ArrowUpNarrowWide className="w-4 h-4 mr-1" /> Asc
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                onSort?.(header.id, "desc")
                setSortDialogOpen(false)
              }}
              disabled={!onSort}
              className="border border-[var(--gray-18)] bg-[var(--gray-20)] text-[var(--text)] hover:bg-[rgba(255,255,255,0.06)]"
            >
              <ArrowDownWideNarrow className="w-4 h-4 mr-1" /> Desc
            </Button>
          </div>

          <DialogFooter className="mt-4">
            <Button className="bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.10)] text-[var(--text)]">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

/* -------------------------------------------------------------------------- */
/* TableHeaders                                                               */
/* -------------------------------------------------------------------------- */

type TableHeadersProps = {
  tableId?: string
  fileId?: string
  headers: any[]
  allHeaders?: any[]
  routes?: any[]
  reloadHeaders?: () => void | Promise<void>
  pinnedColumns?: string[]
  onTogglePin?: (id: string) => void
  pinMode?: boolean
  onSort?: (columnId: string, dir: "asc" | "desc") => void
  blurMode?: boolean
  blurredColumns?: string[]
  onToggleBlur?: (id: string) => void
}

export default function TableHeaders({
  fileId,
  headers = [],
  allHeaders = [],
  reloadHeaders,

  pinnedColumns = [],
  onTogglePin,
  pinMode = false,

  onSort,

  blurMode = false,
  blurredColumns = [],
  onToggleBlur,

  routes = [],
}: TableHeadersProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")

  // Optional route dialogs (stubs kept)
  const [activeColumn, setActiveColumn] = useState<any | null>(null)
  const [routeConnectOpen, setRouteConnectOpen] = useState(false)
  const [routeInfoOpen, setRouteInfoOpen] = useState(false)

  // Map file_id -> file name (only needed if you later re-enable route dialogs)
  const [fileNames, setFileNames] = useState<Record<string, string>>({})

  const typeIcons: Record<string, React.ElementType> = useMemo(
    () => ({
      text: Type,
      number: Hash,
      select: List,
      checkbox: CheckSquare,
      time: Clock,
    }),
    []
  )

  useEffect(() => {
    async function loadFileNames() {
      const source = allHeaders?.length ? allHeaders : headers
      if (!source?.length) return

      const fileIds = [
        ...new Set(source.map((h: any) => getFileIdFromColumn(h)).filter(Boolean)),
      ] as string[]

      if (!fileIds.length) return

      const { data, error } = await supabase
        .from("files")
        .select("id, name")
        .in("id", fileIds)

      if (error) {
        console.error("❌ Failed to load file names:", error)
        return
      }

      const map: Record<string, string> = {}
      for (const row of data ?? []) {
        map[row.id] = (row.name ?? "").trim() || "Untitled table"
      }
      setFileNames(map)
    }

    loadFileNames()
  }, [headers, allHeaders])

  /* Add Column at index */
  const addAt = useCallback(
    async (index: number) => {
      if (!fileId) return
      try {
        const payload = {
          file_id: fileId,
          name: `Column ${headers.length + 1}`,
          type: "text",
          order_index: index,
          options: [],
          locked: false,
        }

        const { error } = await supabase.from("table_columns").insert([payload])
        if (error) throw error

        await reloadHeaders?.()
      } catch (err) {
        console.error("❌ Add column failed:", err)
      }
    },
    [fileId, headers.length, reloadHeaders]
  )

  /* Rename Column */
  const handleRename = useCallback(
    async (columnId: string) => {
      const next = editValue.trim()
      setEditingId(null)
      if (!next) return

      try {
        const { error } = await supabase
          .from("table_columns")
          .update({ name: next })
          .eq("id", columnId)

        if (error) throw error
        await reloadHeaders?.()
      } catch (err) {
        console.error("❌ Rename failed:", err)
      }
    },
    [editValue, reloadHeaders]
  )

  /* Delete Column */
  const handleDelete = useCallback(
    async (columnId: string, name: string) => {
      if (!confirm(`Delete column "${name}"?`)) return

      try {
        const { error } = await supabase
          .from("table_columns")
          .delete()
          .eq("id", columnId)

        if (error) throw error
        await reloadHeaders?.()
      } catch (err) {
        console.error("❌ Delete column failed:", err)
      }
    },
    [reloadHeaders]
  )

  /* Change Type */
  const handleChangeType = useCallback(
    async (columnId: string, type: string) => {
      try {
        const current = headers.find((h: any) => h.id === columnId)
        const nextOptions =
          type === "select"
            ? Array.isArray(current?.options)
              ? current.options
              : []
            : current?.options ?? null

        const { error } = await supabase
          .from("table_columns")
          .update({ type, options: nextOptions })
          .eq("id", columnId)

        if (error) throw error
        await reloadHeaders?.()
      } catch (err) {
        console.error("❌ Change type failed:", err)
      }
    },
    [headers, reloadHeaders]
  )

  const handleOpenRouteConnect = useCallback((col: any) => {
    setActiveColumn(col)
    setRouteConnectOpen(true)
  }, [])

  const handleOpenRouteInfo = useCallback((col: any) => {
    setActiveColumn(col)
    setRouteInfoOpen(true)
  }, [])

  if (!headers.length) {
    return (
      <div className="text-sm text-[var(--text-lt)] italic p-2">
        No columns yet.
      </div>
    )
  }

  return (
    <>
      {/* ~What is the gap for? */}
      <div className="flex items-center gap-[1px] overflow-hidden w-full h-full">
        {headers.map((header: any, index: number) => (
          <HeaderCell
            key={header.id}
            header={header}
            index={index}
            isEditing={editingId === header.id}
            editValue={editValue}
            setEditValue={setEditValue}
            setEditingId={setEditingId}
            handleRename={handleRename}
            handleChangeType={handleChangeType}
            handleDelete={handleDelete}
            addAt={addAt}
            typeIcons={typeIcons}
            pinnedColumns={pinnedColumns}
            onTogglePin={onTogglePin}
            pinMode={pinMode}
            onSort={onSort}
            blurMode={blurMode}
            isBlurred={blurredColumns.includes(header.id)}
            onToggleBlur={onToggleBlur}
            onOpenRouteConnect={handleOpenRouteConnect}
            onOpenRouteInfo={handleOpenRouteInfo}
          />
        ))}
      </div>

      {/* Optional route dialogs — enable if/when your route components are updated */}
      {/*
      <RouteConnect
        open={routeConnectOpen}
        onClose={() => setRouteConnectOpen(false)}
        column={activeColumn}
        headers={allHeaders?.length ? allHeaders : headers}
        routes={routes}
        tableNames={fileNames}
        reloadHeaders={reloadHeaders}
        reloadRoutes={reloadRoutes || (() => {})}
      />

      <RouteInfo
        open={routeInfoOpen}
        onClose={() => setRouteInfoOpen(false)}
        column={activeColumn}
        tableNames={fileNames}
        allHeaders={allHeaders?.length ? allHeaders : headers}
        allRoutes={routes}
        reloadHeaders={reloadHeaders}
        reloadRoutes={reloadRoutes || (() => {})}
        onUpdated={() => {
          reloadHeaders?.()
          reloadRoutes?.()
        }}
      />
      */}
    </>
  )
}
