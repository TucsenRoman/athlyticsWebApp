/* =========================================================================
   ROUTE ENGINE — ATHLYTICS (TABLES)
   ========================================================================= */

import type { Tables } from "@/types/supabase"

/**
 * ✅ New canonical types (ledger_* is deprecated)
 */
export type TableColumn = Tables<"table_columns">
export type TableRouteRecord = Tables<"table_routes">

/**
 * Route class stored on table_columns.route_class
 */
export type RouteClass = "independent" | "primary" | "secondary"

/**
 * Temporary compatibility exports (remove once you’ve updated imports everywhere)
 * NOTE: these are intentionally aliases so existing files compile while you migrate.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export type LedgerHeader = TableColumn
// eslint-disable-next-line @typescript-eslint/naming-convention
export type LedgerRouteRecord = TableRouteRecord

/* =========================================================================
   CHAIN MODELS
   ========================================================================= */

export interface Chain {
  primaryId: string
  primaryFileId: string
  secondaryIds: string[]
}

export interface ChainMap {
  [primaryId: string]: Chain
}

export interface ColumnRouteInfo {
  columnId: string
  fileId: string
  routeClass: RouteClass
  chainPrimaryId?: string
}

/* =========================================================================
   HELPERS
   ========================================================================= */

function normalizeRouteClass(val: RouteClass | null | undefined): RouteClass {
  return val === "primary" || val === "secondary" || val === "independent"
    ? val
    : "independent"
}

function getColumn(columns: TableColumn[], id: string) {
  return columns.find((c) => c.id === id) ?? null
}

/**
 * These helpers assume your new table_routes schema uses:
 *  - source_file_id
 *  - target_file_id
 *  - source_column_id
 *  - target_column_id
 * If your table uses different names, change them here (single place).
 */
function getSourceFileId(r: any): string {
  return (r?.source_file_id ?? "") as string
}
function getTargetFileId(r: any): string {
  return (r?.target_file_id ?? "") as string
}
function getSourceColumnId(r: any): string {
  return (r?.source_column_id ?? "") as string
}
function getTargetColumnId(r: any): string {
  return (r?.target_column_id ?? "") as string
}

function columnInAnyChain(
  columnId: string,
  columnInfo: Map<string, ColumnRouteInfo>
) {
  const info = columnInfo.get(columnId)
  if (!info) return false
  return info.routeClass === "primary" || info.routeClass === "secondary"
}

/* =========================================================================
   ★ AUTO-REPAIR route_class ↔ routes consistency
   ========================================================================= */

export function repairRouteClasses(
  columns: TableColumn[],
  routes: TableRouteRecord[]
): Partial<TableColumn>[] {
  const updates: Partial<TableColumn>[] = []

  const routeSources = new Set((routes ?? []).map((r: any) => getSourceColumnId(r)))
  const routeTargets = new Set((routes ?? []).map((r: any) => getTargetColumnId(r)))

  for (const c of columns ?? []) {
    const correct: RouteClass = routeSources.has(c.id)
      ? "primary"
      : routeTargets.has(c.id)
      ? "secondary"
      : "independent"

    const normalized = normalizeRouteClass((c as any).route_class)

    if (normalized !== correct) {
      updates.push({
        id: c.id,
        route_class: correct,
      } as Partial<TableColumn>)
    }
  }

  return updates
}

/* =========================================================================
   BUILD CHAIN MAP
   ========================================================================= */

export function buildChainMap(
  columns: TableColumn[] = [],
  routes: TableRouteRecord[] = []
): ChainMap {
  if (!Array.isArray(columns)) columns = []
  if (!Array.isArray(routes)) routes = []

  const map: ChainMap = {}

  for (const r of routes as any[]) {
    if (!r || !r.active) continue

    const primaryColId = getSourceColumnId(r)
    const secondaryColId = getTargetColumnId(r)

    if (!primaryColId || !secondaryColId) continue

    if (!map[primaryColId]) {
      map[primaryColId] = {
        primaryId: primaryColId,
        primaryFileId: getSourceFileId(r),
        secondaryIds: [],
      }
    }

    if (!map[primaryColId].secondaryIds.includes(secondaryColId)) {
      map[primaryColId].secondaryIds.push(secondaryColId)
    }
  }

  return map
}

/* =========================================================================
   BUILD COLUMN ROUTE INFO
   ========================================================================= */

export function buildColumnRouteInfo(
  columns: TableColumn[] = [],
  chainMap: ChainMap = {}
): Map<string, ColumnRouteInfo> {
  if (!Array.isArray(columns)) columns = []

  const out = new Map<string, ColumnRouteInfo>()

  // secondary → primary reverse lookup
  const secToPrimary = new Map<string, string>()
  for (const chain of Object.values(chainMap)) {
    for (const sec of chain.secondaryIds) {
      secToPrimary.set(sec, chain.primaryId)
    }
  }

  for (const c of columns as any[]) {
    const rc = normalizeRouteClass(c.route_class)

    const info: ColumnRouteInfo = {
      columnId: c.id,
      fileId: c.file_id,
      routeClass: rc,
    }

    if (rc === "primary") {
      info.chainPrimaryId = c.id
    } else if (rc === "secondary") {
      const p = secToPrimary.get(c.id)
      if (p) info.chainPrimaryId = p
    }

    out.set(c.id, info)
  }

  return out
}

/* =========================================================================
   ROUTE MUTATION MODELS
   ========================================================================= */

export interface RouteMutation {
  columnsToUpdate: Partial<TableColumn>[]
  routesToInsert: Partial<TableRouteRecord>[]
  routesToDeleteIds: string[]
}

export interface ValidationResult {
  ok: boolean
  reason?: string
}

/* =========================================================================
   CREATE ROUTE
   ========================================================================= */

export function validateAndBuildCreateRoute(
  columns: TableColumn[] = [],
  routes: TableRouteRecord[] = [],
  secondaryId: string,
  primaryId: string
) {
  if (!primaryId || !secondaryId) {
    return { validation: { ok: false, reason: "Missing IDs." } }
  }

  if (primaryId === secondaryId) {
    return { validation: { ok: false, reason: "Cannot self-route." } }
  }

  const sec = getColumn(columns, secondaryId) as any
  const pri = getColumn(columns, primaryId) as any

  if (!sec || !pri) {
    return { validation: { ok: false, reason: "Invalid columns." } }
  }

  const secClass = normalizeRouteClass(sec.route_class)
  const priClass = normalizeRouteClass(pri.route_class)

  if (secClass !== "independent") {
    return { validation: { ok: false, reason: "Secondary must be independent." } }
  }

  if (priClass === "secondary") {
    return { validation: { ok: false, reason: "Cannot attach to a secondary." } }
  }

  const exists = (routes as any[]).find(
    (r) =>
      r.active &&
      getSourceColumnId(r) === primaryId &&
      getTargetColumnId(r) === secondaryId
  )

  if (exists) {
    return { validation: { ok: false, reason: "Route already exists." } }
  }

  const columnsToUpdate: Partial<TableColumn>[] = []
  const routesToInsert: Partial<TableRouteRecord>[] = []

  if (priClass === "independent") {
    columnsToUpdate.push({ id: primaryId, route_class: "primary" } as any)
  }

  columnsToUpdate.push({ id: secondaryId, route_class: "secondary" } as any)

  routesToInsert.push({
    source_file_id: pri.file_id,
    source_column_id: pri.id,
    target_file_id: sec.file_id,
    target_column_id: sec.id,
    active: true,
  } as any)

  return {
    validation: { ok: true },
    mutation: {
      columnsToUpdate,
      routesToInsert,
      routesToDeleteIds: [],
    } satisfies RouteMutation,
  }
}

/* =========================================================================
   REMOVE SECONDARY
   ========================================================================= */

export function buildRemoveSecondaryMutation(
  columns: TableColumn[] = [],
  routes: TableRouteRecord[] = [],
  secondaryId: string
) {
  const sec = getColumn(columns, secondaryId) as any
  if (!sec || normalizeRouteClass(sec.route_class) !== "secondary") {
    return { validation: { ok: false, reason: "Not a secondary." } }
  }

  const chain = buildChainMap(columns, routes)
  const columnInfo = buildColumnRouteInfo(columns, chain)

  const info = columnInfo.get(secondaryId)
  if (!info?.chainPrimaryId) {
    return { validation: { ok: false, reason: "No primary in chain." } }
  }

  const primaryId = info.chainPrimaryId

  const route = (routes as any[]).find(
    (r) =>
      r.active &&
      getSourceColumnId(r) === primaryId &&
      getTargetColumnId(r) === secondaryId
  )

  if (!route) {
    return { validation: { ok: false, reason: "Route missing." } }
  }

  const c = chain[primaryId]

  const columnsToUpdate: Partial<TableColumn>[] = [
    { id: secondaryId, route_class: "independent" } as any,
  ]
  const routesToDeleteIds = [route.id]

  if (c && c.secondaryIds.length === 1) {
    columnsToUpdate.push({ id: primaryId, route_class: "independent" } as any)
  }

  return {
    validation: { ok: true },
    mutation: {
      columnsToUpdate,
      routesToInsert: [],
      routesToDeleteIds,
    } satisfies RouteMutation,
  }
}

/* =========================================================================
   REMOVE PRIMARY (destroy chain)
   ========================================================================= */

export function buildRemovePrimaryMutation(
  columns: TableColumn[] = [],
  routes: TableRouteRecord[] = [],
  primaryId: string
) {
  const pri = getColumn(columns, primaryId) as any
  if (!pri || normalizeRouteClass(pri.route_class) !== "primary") {
    return { validation: { ok: false, reason: "Not a primary." } }
  }

  const chain = buildChainMap(columns, routes)[primaryId]

  const columnsToUpdate: Partial<TableColumn>[] = [
    { id: primaryId, route_class: "independent" } as any,
  ]
  const routesToDeleteIds: string[] = []

  if (chain) {
    for (const secId of chain.secondaryIds) {
      columnsToUpdate.push({ id: secId, route_class: "independent" } as any)

      const route = (routes as any[]).find(
        (r) =>
          r.active &&
          getSourceColumnId(r) === primaryId &&
          getTargetColumnId(r) === secId
      )
      if (route) routesToDeleteIds.push(route.id)
    }
  }

  return {
    validation: { ok: true },
    mutation: {
      columnsToUpdate,
      routesToInsert: [],
      routesToDeleteIds,
    } satisfies RouteMutation,
  }
}
