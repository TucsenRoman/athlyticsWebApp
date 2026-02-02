"use client"

import { useMemo, useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/overlays/dialog"

import { Button } from "@/components/ui/actions/button"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/forms/select"

import { supabase } from "@/integrations/supabase/client"

import {
  LedgerHeader, // legacy type name (represents table_columns row shape in your UI layer)
  LedgerRouteRecord, // legacy type name (represents table_routes row shape in your UI layer)
  buildChainMap,
  buildColumnRouteInfo,
  validateAndBuildCreateRoute,
} from "@/utils/chain-utils"

import { syncRoutes } from "@/lib/route-sync"

const isIndependent = (h: LedgerHeader) => !h.route_class || h.route_class === "independent"
const isPrimary = (h: LedgerHeader) => h.route_class === "primary"

export interface RouteConnectProps {
  open: boolean
  onClose: () => void
  column: LedgerHeader | null
  headers: LedgerHeader[]
  routes: LedgerRouteRecord[]
  ledgerNames: Record<string, string> // legacy name; values should map fileId -> name
  reloadHeaders: () => Promise<void> | void
  reloadRoutes: () => Promise<void> | void
}

export default function RouteConnect({
  open,
  onClose,
  column,
  headers,
  routes,
  ledgerNames,
  reloadHeaders,
  reloadRoutes,
}: RouteConnectProps) {
  const [secondaryId, setSecondaryId] = useState<string | null>(null)
  const [primaryId, setPrimaryId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const chainMap = useMemo(() => buildChainMap(headers, routes), [headers, routes])
  const columnInfo = useMemo(() => buildColumnRouteInfo(headers, chainMap), [headers, chainMap])

  const availableSecondaries = useMemo(() => {
    return headers.filter((h) => {
      if (!isIndependent(h)) return false
      if (h.id === primaryId) return false
      return true
    })
  }, [headers, primaryId])

  const availablePrimaries = useMemo(() => {
    return headers.filter((h) => {
      if (!isIndependent(h) && !isPrimary(h)) return false
      if (h.id === secondaryId) return false
      return true
    })
  }, [headers, secondaryId])

  const notEnough = availableSecondaries.length < 2 || availablePrimaries.length < 2

  useEffect(() => {
    if (!secondaryId || !open) return
    if (!headers.some((h) => h.id === secondaryId)) setSecondaryId(null)
  }, [headers, open, secondaryId])

  useEffect(() => {
    if (!primaryId || !open) return
    if (!headers.some((h) => h.id === primaryId)) setPrimaryId(null)
  }, [headers, open, primaryId])

  async function handleCreate() {
    if (!secondaryId || !primaryId) return

    const { validation, mutation } = validateAndBuildCreateRoute(headers, routes, secondaryId, primaryId)
    if (!validation.ok || !mutation) return

    const { headersToUpdate, routesToInsert } = mutation
    setSaving(true)

    try {
      // Update column route_class values (table_columns)
      if (headersToUpdate.length) {
        const groups: Record<"independent" | "primary" | "secondary", string[]> = {
          independent: [],
          primary: [],
          secondary: [],
        }

        for (const h of headersToUpdate) {
          const cls = (h.route_class ?? "independent").trim().toLowerCase()
          if (cls === "primary") groups.primary.push(h.id!)
          else if (cls === "secondary") groups.secondary.push(h.id!)
          else groups.independent.push(h.id!)
        }

        for (const [cls, ids] of Object.entries(groups)) {
          if (ids.length > 0) {
            const { error } = await supabase
              .from("table_columns")
              .update({ route_class: cls as "independent" | "primary" | "secondary" })
              .in("id", ids)

            if (error) throw error
          }
        }
      }

      // Insert route row(s) (table_routes)
      if (routesToInsert.length) {
        const payload = routesToInsert.map((r: any) => ({
          source_file_id: r.source_ledger_id!, // legacy -> real column
          source_column_id: r.source_column_id!,
          target_file_id: r.target_ledger_id!, // legacy -> real column
          target_column_id: r.target_column_id!,
          active: true,
        }))

        const { error } = await supabase.from("table_routes").insert(payload)
        if (error) throw error
      }

      await reloadHeaders()
      await reloadRoutes()

      // Run global sync (file id)
      const primaryHeader = headers.find((h) => h.id === primaryId)
      if (primaryHeader) {
        await syncRoutes(primaryHeader.ledger_id) // ledger_id should now be file_id in your UI layer
      }

      closeDialog()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  function closeDialog() {
    setPrimaryId(null)
    setSecondaryId(null)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && closeDialog()}>
      <DialogContent className="max-w-md">
        {!column ? (
          <div className="text-sm text-muted-foreground p-4">No column selected.</div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Create Route</DialogTitle>
            </DialogHeader>

            <div className="mt-3 space-y-4">
              <div className="p-2 border text-xs rounded bg-neutral-50">
                <div>
                  <b>Total Columns:</b> {headers.length}
                </div>
                <div>
                  <b>Independent:</b> {availableSecondaries.length}
                </div>
                <div>
                  <b>Primary-capable:</b> {availablePrimaries.length}
                </div>
                <div>
                  <b>Current Column Class:</b> {column.route_class ?? "independent"}
                </div>
              </div>

              {notEnough ? (
                <div className="p-3 rounded-md border border-yellow-400 bg-yellow-50 text-yellow-800 text-sm">
                  <strong>Not enough columns.</strong>
                  <br />
                  You need at least two independent columns to create a route.
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-sm font-medium">Secondary Column</label>
                    <Select value={secondaryId ?? undefined} onValueChange={setSecondaryId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose independent column" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSecondaries.map((h) => (
                          <SelectItem key={h.id} value={h.id}>
                            {(ledgerNames[h.ledger_id] ?? "Table")} › {h.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Primary Column</label>
                    <Select value={primaryId ?? undefined} onValueChange={setPrimaryId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose primary column" />
                      </SelectTrigger>
                      <SelectContent>
                        {availablePrimaries.map((h) => (
                          <SelectItem key={h.id} value={h.id}>
                            {(ledgerNames[h.ledger_id] ?? "Table")} › {h.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>

            <DialogFooter className="mt-6">
              <Button variant="ghost" onClick={closeDialog} disabled={saving}>
                Cancel
              </Button>

              {!notEnough ? (
                <Button onClick={handleCreate} disabled={saving}>
                  {saving ? "Creating…" : "Create Route"}
                </Button>
              ) : (
                <Button variant="secondary" onClick={() => console.log("Add a column using the Columns menu.")}>
                  Add Column
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
