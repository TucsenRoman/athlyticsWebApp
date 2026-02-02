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
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/overlays/dialog"

// Optional route dialogs (enable if you want)
// import RouteConnect from "../actions/RouteConnect"
// import RouteInfo from "../actions/RouteInfo"

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

  onOpenRouteConnect,
  onOpenRouteInfo,
}: HeaderCellProps) {
  const Icon = typeIcons?.[header?.type] || Type
  const isPinned = pinnedColumns.includes(header?.id)

  const [sortDialogOpen, setSortDialogOpen] = useState(false)

  const isPrimary = header?.route_class === "primary"
  const isSecondary = header?.route_class === "secondary"

  const routeIconColor =
    isPrimary
      ? "text-blue-500 hover:text-blue-600"
      : isSecondary
      ? "text-green-500 hover:text-green-600"
      : "text-muted-foreground hover:text-primary"

  return (
    <>
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className={`group relative flex items-center justify-between overflow-hidden rounded-t-[12px] px-2 border-r border-gray-100 ${
          pinMode ? "ring-2 ring-[hsl(var(--primary))/0.22]" : ""
        }`}
        style={{
          width: "150px",
          minWidth: "150px",
          maxWidth: "150px",
          background: isPinned ? "#fff" : "transparent",
          zIndex: isPinned ? 50 : 1,
        }}
      >
        {/* LEFT */}
        <div className="flex items-center gap-2 overflow-hidden select-none">
          <Icon className="w-4 h-4 text-muted-foreground shrink-0" />

          {(pinMode || isPinned) && (
            <button
              type="button"
              className="cursor-pointer"
              title={isPinned ? "Unpin column" : "Pin column"}
              onClick={(e) => {
                e.stopPropagation()
                onTogglePin?.(header?.id)
              }}
            >
              {isPinned ? (
                <Pin className="w-3.5 h-3.5 fill-[hsl(var(--primary))] text-[hsl(var(--primary))]" />
              ) : (
                <Pin className="w-3.5 h-3.5 text-muted-foreground" />
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
              className="h-7 text-sm px-1 border-none focus:ring-0 truncate"
              style={{ width: "120px" }}
            />
          ) : (
            <span
              className="font-semibold text-sm truncate cursor-pointer max-w-[120px]"
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
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-1 pr-[2px] relative">
          {(isPrimary || isSecondary) && (
            <LinkIcon
              size={15}
              strokeWidth={2.3}
              onClick={(e) => {
                e.stopPropagation()
                onOpenRouteInfo?.(header)
              }}
              className={`cursor-pointer opacity-90 ${routeIconColor}`}
              aria-label={isPrimary ? "Primary Route" : "Secondary Route"}
            />
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-primary"
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-56 border border-gray-200 shadow-md"
            >
              <DropdownMenuItem onClick={() => setSortDialogOpen(true)}>
                <Funnel className="w-4 h-4 mr-2" /> Sort
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Settings2 className="w-4 h-4 mr-2" /> Column type
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {Object.keys(typeIcons).map((type) => {
                    const TypeIcon = typeIcons[type]
                    return (
                      <DropdownMenuItem
                        key={type}
                        onClick={() => handleChangeType(header.id, type)}
                      >
                        <TypeIcon className="w-4 h-4 mr-2" /> {type}
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSeparator />

              {!isPrimary && !isSecondary && (
                <>
                  <DropdownMenuItem
                    onClick={() => onOpenRouteConnect?.(header)}
                    disabled={!onOpenRouteConnect}
                  >
                    <LinkIcon className="w-4 h-4 mr-2" /> Connect route
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}

              <DropdownMenuItem
                onClick={() => {
                  setEditingId(header.id)
                  setEditValue(header.name ?? "")
                }}
              >
                <Pencil className="w-4 h-4 mr-2" /> Rename
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => onTogglePin?.(header.id)}
                disabled={!onTogglePin}
              >
                {isPinned ? (
                  <PinOff className="w-4 h-4 mr-2" />
                ) : (
                  <Pin className="w-4 h-4 mr-2" />
                )}
                {isPinned ? "Unpin" : "Pin"}
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => addAt(index + 1)}>
                <Plus className="w-4 h-4 mr-2" /> Add column
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => handleDelete(header.id, header.name)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>

      {/* Sort Dialog */}
      <Dialog open={sortDialogOpen} onOpenChange={setSortDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Sort</DialogTitle>
          </DialogHeader>

          <div className="my-3 text-center">
            <h3 className="text-base font-semibold">{header?.name}</h3>
            <p className="text-xs text-muted-foreground mt-1">
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
            >
              <ArrowDownWideNarrow className="w-4 h-4 mr-1" /> Desc
            </Button>
          </div>

          <DialogFooter className="mt-4">
            <Button onClick={() => setSortDialogOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

/* TableHeaders */

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

  routes = [],
  // reloadRoutes,
}: TableHeadersProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")

  // Optional route dialogs
  const [activeColumn, setActiveColumn] = useState<any | null>(null)
  const [routeConnectOpen, setRouteConnectOpen] = useState(false)
  const [routeInfoOpen, setRouteInfoOpen] = useState(false)

  // Map file_id -> file name (if you still need it for RouteInfo/RouteConnect)
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
        // Pull current column options so we can keep/normalize them
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
      <div className="text-sm text-muted-foreground italic p-2">
        No columns yet.
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center gap-[1px] overflow-hidden">
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
