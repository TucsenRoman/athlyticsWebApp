// supabase/functions/install_package/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// --------------------------------------------------
// CORS HEADERS (Option B)
// --------------------------------------------------
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const body = await req.json();
    const { packageId, programId, userId } = body;

    const pg = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // --------------------------------------------------
    // Start transaction
    // --------------------------------------------------
    await pg.rpc("exec_sql", { sql: "BEGIN;" });

    // --------------------------------------------------
    // 1. Load package + items
    // --------------------------------------------------
    const { data: sourcePackage, error: pkgErr } = await pg
      .from("packages")
      .select("*")
      .eq("id", packageId)
      .single();

    if (pkgErr) throw pkgErr;

    const { data: pkgItems, error: itemsErr } = await pg
      .from("package_items")
      .select("*")
      .eq("package_id", packageId)
      .order("order_index", { ascending: true });

    if (itemsErr) throw itemsErr;

    const ledgerIds = pkgItems.map((i) => i.ledger_id);

    // --------------------------------------------------
    // 2. Load ledgers + headers
    // --------------------------------------------------
    const { data: sourceLedgers, error: ledErr } = await pg
      .from("ledgers")
      .select("*")
      .in("id", ledgerIds);

    if (ledErr) throw ledErr;

    const { data: sourceHeaders, error: headErr } = await pg
      .from("ledger_headers")
      .select("*")
      .in("ledger_id", ledgerIds)
      .order("order_index", { ascending: true });

    if (headErr) throw headErr;

    // --------------------------------------------------
    // 3. Create new package
    // --------------------------------------------------
    const { data: newPackage, error: newPkgErr } = await pg
      .from("packages")
      .insert([
        {
          program_id: programId,
          name: sourcePackage.name,
          description: sourcePackage.description,
          icon: sourcePackage.icon,
        },
      ])
      .select()
      .single();

    if (newPkgErr) throw newPkgErr;

    const newPackageId = newPackage.id;

    // --------------------------------------------------
    // 4. Clone ledgers
    // --------------------------------------------------
    const oldToNewLedgerMap: Record<string, string> = {};

    for (const oldLedger of sourceLedgers) {
      const { data: newLedger, error: insertErr } = await pg
        .from("ledgers")
        .insert([
          {
            user_id: userId,
            program_id: programId,
            name: oldLedger.name,
            description: oldLedger.description,
            icon: oldLedger.icon,
            status: "active",
            data: oldLedger.data,
            is_system: false,
            is_protected: false,
            protection_level: "none",
          },
        ])
        .select()
        .single();

      if (insertErr) throw insertErr;

      oldToNewLedgerMap[oldLedger.id] = newLedger.id;
    }

    // --------------------------------------------------
    // 5. Clone headers
    // --------------------------------------------------
    const headerPayload = sourceHeaders.map((hdr) => ({
      ledger_id: oldToNewLedgerMap[hdr.ledger_id],
      name: hdr.name,
      type: hdr.type,
      order_index: hdr.order_index,
      route_class: hdr.route_class ?? "independent",
      options: hdr.options ?? {},
      locked: hdr.locked ?? false,
    }));

    const { error: hdrErr } = await pg
      .from("ledger_headers")
      .insert(headerPayload);

    if (hdrErr) throw hdrErr;

    // --------------------------------------------------
    // 6. Clone package items
    // --------------------------------------------------
    const pkgItemPayload = pkgItems.map((pi) => ({
      package_id: newPackageId,
      ledger_id: oldToNewLedgerMap[pi.ledger_id],
      order_index: pi.order_index,
    }));

    const { error: pkgItemsErr2 } = await pg
      .from("package_items")
      .insert(pkgItemPayload);

    if (pkgItemsErr2) throw pkgItemsErr2;

    // --------------------------------------------------
    // Commit
    // --------------------------------------------------
    await pg.rpc("exec_sql", { sql: "COMMIT;" });

    return new Response(
      JSON.stringify({
        success: true,
        new_package_id: newPackageId,
        old_to_new_ledgers: oldToNewLedgerMap,
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    console.error("ROLLBACK because error:", err);

    const pg = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    await pg.rpc("exec_sql", { sql: "ROLLBACK;" });

    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      { status: 500, headers: corsHeaders }
    );
  }
});
