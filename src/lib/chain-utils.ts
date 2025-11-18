/* =========================================================================
   ROUTE ENGINE — ATHLYTICS
   Clean implementation for new routing system (1 primary → N secondaries)
   ========================================================================= */

export type RouteClass = "independent" | "primary" | "secondary";

export interface LedgerHeader {
  id: string;
  ledger_id: string;
  name: string;
  type: string;
  options?: any[];
  order_index: number;
  route_class: RouteClass | null | undefined;
}

export interface LedgerRouteRecord {
  id: string;
  source_ledger_id: string;
  source_column_id: string;
  target_ledger_id: string;
  target_column_id: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

/* =========================================================================
   CHAIN MODELS
   ========================================================================= */

export interface Chain {
  primaryId: string;
  primaryLedgerId: string;
  secondaryIds: string[];
}

export interface ChainMap {
  [primaryId: string]: Chain;
}

export interface ColumnRouteInfo {
  columnId: string;
  ledgerId: string;
  routeClass: RouteClass;
  chainPrimaryId?: string;
}

/* =========================================================================
   HELPERS
   ========================================================================= */

function normalizeRouteClass(val: RouteClass | null | undefined): RouteClass {
  return val === "primary" || val === "secondary" || val === "independent"
    ? val
    : "independent";
}

function getHeader(headers: LedgerHeader[], id: string) {
  return headers.find((h) => h.id === id) ?? null;
}

function columnInAnyChain(
  columnId: string,
  columnInfo: Map<string, ColumnRouteInfo>
) {
  const info = columnInfo.get(columnId);
  if (!info) return false;
  return info.routeClass === "primary" || info.routeClass === "secondary";
}

/* =========================================================================
   ★ NEW: AUTO-REPAIR route_class ↔ routes consistency
   ========================================================================= */

export function repairRouteClasses(
  headers: LedgerHeader[],
  routes: LedgerRouteRecord[]
): Partial<LedgerHeader>[] {
  const updates: Partial<LedgerHeader>[] = [];

  const routeSources = new Set(routes.map((r) => r.source_column_id));
  const routeTargets = new Set(routes.map((r) => r.target_column_id));

  for (const h of headers) {
    const correct =
      routeSources.has(h.id) ? "primary" :
      routeTargets.has(h.id) ? "secondary" :
      "independent";

    const normalized = normalizeRouteClass(h.route_class);

    if (normalized !== correct) {
      updates.push({
        id: h.id,
        route_class: correct as RouteClass,
      });
    }
  }

  return updates;
}

/* =========================================================================
   BUILD CHAIN MAP
   ========================================================================= */

export function buildChainMap(
  headers: LedgerHeader[] = [],
  routes: LedgerRouteRecord[] = []
): ChainMap {
  if (!Array.isArray(headers)) headers = [];
  if (!Array.isArray(routes)) routes = [];

  const map: ChainMap = {};

  for (const r of routes) {
    if (!r || !r.active) continue;

    const p = r.source_column_id;
    const s = r.target_column_id;

    if (!p || !s) continue;

    if (!map[p]) {
      map[p] = {
        primaryId: p,
        primaryLedgerId: r.source_ledger_id,
        secondaryIds: [],
      };
    }

    if (!map[p].secondaryIds.includes(s)) {
      map[p].secondaryIds.push(s);
    }
  }

  return map;
}

/* =========================================================================
   BUILD COLUMN ROUTE INFO
   ========================================================================= */

export function buildColumnRouteInfo(
  headers: LedgerHeader[] = [],
  chainMap: ChainMap = {}
): Map<string, ColumnRouteInfo> {
  if (!Array.isArray(headers)) headers = [];

  const out = new Map<string, ColumnRouteInfo>();

  // secondary → primary reverse lookup
  const secToPrimary = new Map<string, string>();
  for (const chain of Object.values(chainMap)) {
    for (const sec of chain.secondaryIds) {
      secToPrimary.set(sec, chain.primaryId);
    }
  }

  for (const h of headers) {
    const rc = normalizeRouteClass(h.route_class);

    const info: ColumnRouteInfo = {
      columnId: h.id,
      ledgerId: h.ledger_id,
      routeClass: rc,
    };

    if (rc === "primary") {
      info.chainPrimaryId = h.id;
    } else if (rc === "secondary") {
      const p = secToPrimary.get(h.id);
      if (p) info.chainPrimaryId = p;
    }

    out.set(h.id, info);
  }

  return out;
}

/* =========================================================================
   ROUTE MUTATION MODELS
   ========================================================================= */

export interface RouteMutation {
  headersToUpdate: Partial<LedgerHeader>[];
  routesToInsert: Partial<LedgerRouteRecord>[];
  routesToDeleteIds: string[];
}

export interface ValidationResult {
  ok: boolean;
  reason?: string;
}

/* =========================================================================
   CREATE ROUTE
   ========================================================================= */

export function validateAndBuildCreateRoute(
  headers: LedgerHeader[] = [],
  routes: LedgerRouteRecord[] = [],
  secondaryId: string,
  primaryId: string
) {
  if (!primaryId || !secondaryId) {
    return { validation: { ok: false, reason: "Missing IDs." } };
  }

  if (primaryId === secondaryId) {
    return { validation: { ok: false, reason: "Cannot self-route." } };
  }

  const sec = getHeader(headers, secondaryId);
  const pri = getHeader(headers, primaryId);

  if (!sec || !pri) {
    return { validation: { ok: false, reason: "Invalid columns." } };
  }

  const secClass = normalizeRouteClass(sec.route_class);
  const priClass = normalizeRouteClass(pri.route_class);

  if (secClass !== "independent") {
    return {
      validation: { ok: false, reason: "Secondary must be independent." },
    };
  }

  if (priClass === "secondary") {
    return {
      validation: { ok: false, reason: "Cannot attach to a secondary." },
    };
  }

  const existing = routes.find(
    (r) =>
      r.active &&
      r.source_column_id === primaryId &&
      r.target_column_id === secondaryId
  );

  if (existing) {
    return { validation: { ok: false, reason: "Route already exists." } };
  }

  const headersToUpdate: Partial<LedgerHeader>[] = [];
  const routesToInsert: Partial<LedgerRouteRecord>[] = [];

  if (priClass === "independent") {
    headersToUpdate.push({ id: primaryId, route_class: "primary" });
  }

  headersToUpdate.push({ id: secondaryId, route_class: "secondary" });

  routesToInsert.push({
    source_ledger_id: pri.ledger_id,
    source_column_id: pri.id,
    target_ledger_id: sec.ledger_id,
    target_column_id: sec.id,
    active: true,
  });

  return {
    validation: { ok: true },
    mutation: {
      headersToUpdate,
      routesToInsert,
      routesToDeleteIds: [],
    } satisfies RouteMutation,
  };
}

/* =========================================================================
   REMOVE SECONDARY
   ========================================================================= */

export function buildRemoveSecondaryMutation(
  headers: LedgerHeader[] = [],
  routes: LedgerRouteRecord[] = [],
  secondaryId: string
) {
  const sec = getHeader(headers, secondaryId);
  if (!sec || normalizeRouteClass(sec.route_class) !== "secondary") {
    return { validation: { ok: false, reason: "Not a secondary." } };
  }

  const chain = buildChainMap(headers, routes);
  const columnInfo = buildColumnRouteInfo(headers, chain);

  const info = columnInfo.get(secondaryId);
  if (!info?.chainPrimaryId) {
    return { validation: { ok: false, reason: "No primary in chain." } };
  }

  const primaryId = info.chainPrimaryId;

  const route = routes.find(
    (r) => r.active && r.source_column_id === primaryId && r.target_column_id === secondaryId
  );

  if (!route) {
    return { validation: { ok: false, reason: "Route missing." } };
  }

  const c = chain[primaryId];
  const headersToUpdate: Partial<LedgerHeader>[] = [{ id: secondaryId, route_class: "independent" }];
  const routesToDeleteIds = [route.id];

  if (c && c.secondaryIds.length === 1) {
    headersToUpdate.push({ id: primaryId, route_class: "independent" });
  }

  return {
    validation: { ok: true },
    mutation: {
      headersToUpdate,
      routesToInsert: [],
      routesToDeleteIds,
    } satisfies RouteMutation,
  };
}

/* =========================================================================
   REMOVE PRIMARY (destroy chain)
   ========================================================================= */

export function buildRemovePrimaryMutation(
  headers: LedgerHeader[] = [],
  routes: LedgerRouteRecord[] = [],
  primaryId: string
) {
  const pri = getHeader(headers, primaryId);
  if (!pri || normalizeRouteClass(pri.route_class) !== "primary") {
    return { validation: { ok: false, reason: "Not a primary." } };
  }

  const chain = buildChainMap(headers, routes)[primaryId];

  const headersToUpdate: Partial<LedgerHeader>[] = [
    { id: primaryId, route_class: "independent" },
  ];
  const routesToDeleteIds: string[] = [];

  if (chain) {
    for (const secId of chain.secondaryIds) {
      headersToUpdate.push({ id: secId, route_class: "independent" });

      const route = routes.find(
        (r) =>
          r.active &&
          r.source_column_id === primaryId &&
          r.target_column_id === secId
      );
      if (route) routesToDeleteIds.push(route.id);
    }
  }

  return {
    validation: { ok: true },
    mutation: {
      headersToUpdate,
      routesToInsert: [],
      routesToDeleteIds,
    } satisfies RouteMutation,
  };
}
