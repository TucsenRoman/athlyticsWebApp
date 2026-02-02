import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  const pg = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  )

  try {
    const body = await req.json()
    const { packageId, programId, userId } = body

    await pg.rpc("exec_sql", { sql: "BEGIN;" })

    // 1) Load package + items
    const { data: sourcePackage, error: pkgErr } = await pg
      .from("packages")
      .select("*")
      .eq("id", packageId)
      .single()

    if (pkgErr) throw pkgErr

    const { data: pkgItems, error: itemsErr } = await pg
      .from("package_items")
      .select("*")
      .eq("package_id", packageId)
      .order("order_index", { ascending: true })

    if (itemsErr) throw itemsErr

    const sourceFileIds = (pkgItems ?? []).map((i) => i.ledger_id).filter(Boolean)

    // 2) Load files + columns
    const { data: sourceFiles, error: filesErr } = await pg
      .from("files")
      .select("*")
      .in("id", sourceFileIds)

    if (filesErr) throw filesErr

    const { data: sourceCols, error: colsErr } = await pg
      .from("table_columns")
      .select("*")
      .in("file_id", sourceFileIds)
      .order("order_index", { ascending: true })

    if (colsErr) throw colsErr

    // 3) Create new package in target program
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
      .single()

    if (newPkgErr) throw newPkgErr

    const newPackageId = newPackage.id

    // 4) Clone files
    const oldToNewFileMap: Record<string, string> = {}

    for (const oldFile of sourceFiles ?? []) {
      const { data: newFile, error: insertErr } = await pg
        .from("files")
        .insert([
          {
            user_id: userId,
            program_id: programId,
            template_key: oldFile.template_key,
            name: oldFile.name,
            description: oldFile.description,
            icon: oldFile.icon,
            status: oldFile.status ?? "active",
            favorite: false,
            type: oldFile.type ?? "table",
            data: oldFile.data ?? null,
          },
        ])
        .select()
        .single()

      if (insertErr) throw insertErr

      oldToNewFileMap[oldFile.id] = newFile.id
    }

    // 5) Clone columns
    const colPayload = (sourceCols ?? []).map((c) => ({
      file_id: oldToNewFileMap[c.file_id],
      name: c.name,
      type: c.type,
      order_index: c.order_index,
      route_class: c.route_class ?? "independent",
      options: c.options ?? {},
      locked: c.locked ?? false,
    }))

    if (colPayload.length) {
      const { error: colInsertErr } = await pg
        .from("table_columns")
        .insert(colPayload)

      if (colInsertErr) throw colInsertErr
    }

    // 6) Clone package items (still uses ledger_id column name)
    const pkgItemPayload = (pkgItems ?? []).map((pi) => ({
      package_id: newPackageId,
      ledger_id: oldToNewFileMap[pi.ledger_id],
      order_index: pi.order_index,
    }))

    if (pkgItemPayload.length) {
      const { error: pkgItemsErr2 } = await pg
        .from("package_items")
        .insert(pkgItemPayload)

      if (pkgItemsErr2) throw pkgItemsErr2
    }

    await pg.rpc("exec_sql", { sql: "COMMIT;" })

    return new Response(
      JSON.stringify({
        success: true,
        new_package_id: newPackageId,
        old_to_new_files: oldToNewFileMap,
      }),
      { status: 200, headers: corsHeaders }
    )
  } catch (err) {
    console.error("ROLLBACK because error:", err)
    await pg.rpc("exec_sql", { sql: "ROLLBACK;" })

    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      { status: 500, headers: corsHeaders }
    )
  }
})
