// src/lib/route-sync.ts
import { supabase } from "@/integrations/supabase/client";

/* -------------------------------------------------------------
 * Ledger Entry Row Shape
 * -----------------------------------------------------------*/
type LedgerEntryRow = {
  id: string;
  ledger_id: string;
  entity_key: string | null;
  values: Record<string, any> | null;
};

/* -------------------------------------------------------------
 * Ledger Route Shape
 * -----------------------------------------------------------*/
type LedgerRouteRecord = {
  id: string;
  source_ledger_id: string;
  source_column_id: string;
  target_ledger_id: string;
  target_column_id: string;
  created_at: string;
};

/* -------------------------------------------------------------
 * GLOBAL DELETE
 * Deletes an entity across ALL ledgers by entity_key
 * -----------------------------------------------------------*/
export async function deleteEntityEverywhere(entityKey: string) {
  if (!entityKey) return;

  console.log(`🗑️ [RouteSync] Deleting all rows with entity_key = ${entityKey}`);

  const { error } = await supabase
    .from("ledger_entries")
    .delete()
    .eq("entity_key", entityKey);

  if (error) console.error("❌ Failed global delete:", error);
  else console.log("✅ Global delete complete.");
}

/* -------------------------------------------------------------
 * SYNC ENGINE — with entity_key alignment + value propagation
 * -----------------------------------------------------------*/
export async function syncRoutes(ledgerId: string) {
  console.groupCollapsed(`🔄 [RouteSync] Sync start for ledger ${ledgerId}`);

  /* Load all routes where this ledger is SOURCE */
  const { data: routesData, error: routesErr } = await supabase
    .from("ledger_routes")
    .select("*")
    .eq("source_ledger_id", ledgerId);

  if (routesErr) {
    console.error("❌ Failed to load routes:", routesErr);
    console.groupEnd();
    return;
  }

  const routes = (routesData || []) as LedgerRouteRecord[];
  if (!routes.length) {
    console.log("ℹ️ No outbound routes.");
    console.groupEnd();
    return;
  }

  /* ===============================================================
   * PROCESS EACH ROUTE
   * =============================================================*/
  for (const route of routes) {
    const {
      id: routeId,
      source_ledger_id,
      source_column_id,
      target_ledger_id,
      target_column_id,
    } = route;

    console.groupCollapsed(
      `➡️ Route ${routeId}: ${source_column_id} → ${target_column_id}`
    );

    /* Load source rows */
    const { data: srcRows, error: srcErr } = await supabase
      .from("ledger_entries")
      .select("id, ledger_id, entity_key, values")
      .eq("ledger_id", source_ledger_id)
      .order("created_at", { ascending: true });

    if (srcErr) {
      console.error("❌ Source load failed:", srcErr);
      console.groupEnd();
      continue;
    }

    /* Load target rows */
    const { data: tgtRows, error: tgtErr } = await supabase
      .from("ledger_entries")
      .select("id, ledger_id, entity_key, values")
      .eq("ledger_id", target_ledger_id)
      .order("created_at", { ascending: true });

    if (tgtErr) {
      console.error("❌ Target load failed:", tgtErr);
      console.groupEnd();
      continue;
    }

    const sources = (srcRows || []) as LedgerEntryRow[];
    const targets = (tgtRows || []) as LedgerEntryRow[];

    if (!sources.length || !targets.length) {
      console.log("ℹ️ No rows in source or target.");
      console.groupEnd();
      continue;
    }

    /* ===============================================================
     * 1. ENTITY KEY ALIGNMENT — CRITICAL FOUNDATION
     * Pair rows by index and unify entity_key identities.
     * =============================================================*/
    const count = Math.min(sources.length, targets.length);

    for (let i = 0; i < count; i++) {
      const s = sources[i];
      const t = targets[i];

      const sKey = s.entity_key;
      const tKey = t.entity_key;

      // A: both missing → generate brand-new cluster identity
      if (!sKey && !tKey) {
        const newKey = `row_${crypto.randomUUID()}`;

        await supabase.from("ledger_entries").update({ entity_key: newKey }).eq("id", s.id);
        await supabase.from("ledger_entries").update({ entity_key: newKey }).eq("id", t.id);

        s.entity_key = newKey;
        t.entity_key = newKey;
        continue;
      }

      // B: target missing → adopt source
      if (sKey && !tKey) {
        await supabase.from("ledger_entries").update({ entity_key: sKey }).eq("id", t.id);
        t.entity_key = sKey;
        continue;
      }

      // C: source missing → adopt target
      if (!sKey && tKey) {
        await supabase.from("ledger_entries").update({ entity_key: tKey }).eq("id", s.id);
        s.entity_key = tKey;
        continue;
      }

      // D: mismatch → always unify to source
      if (sKey && tKey && sKey !== tKey) {
        await supabase.from("ledger_entries").update({ entity_key: sKey }).eq("id", t.id);
        t.entity_key = sKey;
      }
    }

    /* Rebuild lookup from updated keys */
    const sourceByKey = new Map<string, LedgerEntryRow>();
    for (const s of sources) {
      if (s.entity_key) sourceByKey.set(s.entity_key, s);
    }

    /* ===============================================================
     * 2. VALUE SYNC — propagate values from primary → secondary
     * =============================================================*/
    for (const target of targets) {
      const key = target.entity_key;
      if (!key) continue;

      const sourceEntry = sourceByKey.get(key);
      if (!sourceEntry) continue;

      const srcVal = sourceEntry.values?.[source_column_id];
      if (typeof srcVal === "undefined") continue;

      const tgtVal = target.values?.[target_column_id];
      if (tgtVal === srcVal) continue;

      const newValues = {
        ...(target.values || {}),
        [target_column_id]: srcVal,
      };

      const { error: updErr } = await supabase
        .from("ledger_entries")
        .update({ values: newValues })
        .eq("id", target.id);

      if (updErr) {
        console.error(`❌ Failed updating ${target.id}:`, updErr);
        continue;
      }

      console.log(`📝 Synced: ${target.id} → ${target_column_id} = ${srcVal}`);
    }

    console.groupEnd();
  }

  console.groupEnd();
}
