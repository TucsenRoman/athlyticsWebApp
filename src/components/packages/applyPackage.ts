import { supabase } from "@/integrations/supabase/client";

/**
 * Apply a ledger package into a program.
 * 
 * Steps:
 * 1. Load all template-ledgers in the package
 * 2. For each, create a real ledger in the program
 * 3. Load all template-headers for each template-ledger
 * 4. Create real ledger_headers under the new ledger
 */
export async function applyPackageToProgram(packageId: string, programId: number) {
  // ------------------------------
  // 0. Ensure user is authenticated
  // ------------------------------
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Not logged in");
  const coachId = auth.user.id;

  // ------------------------------
  // 1. Load all package template ledgers
  // ------------------------------
  const { data: pkgLedgers, error: ledgersErr } = await supabase
    .from("ledger_package_ledgers")
    .select("*")
    .eq("package_id", packageId)
    .order("ledger_name", { ascending: true });

  if (ledgersErr) throw ledgersErr;
  if (!pkgLedgers || pkgLedgers.length === 0)
    throw new Error("Package contains no ledgers.");

  // Map: template_ledger_id → real_ledger_id
  const createdLedgerMap: Record<string, string> = {};

  // ------------------------------
  // 2. Create real ledgers
  // ------------------------------
  for (const template of pkgLedgers) {
    const { data: newLedger, error: createErr } = await supabase
      .from("ledgers")
      .insert([
        {
          coach_id: coachId,
          program_id: programId,
          name: template.ledger_name,
          description: null,
          icon: template.icon,
          is_system: true,
          is_protected: true,
          protection_level: template.protection_level,
          template_key: `pkg_${packageId}_${template.id}`,
          status: "active",
        },
      ])
      .select()
      .single();

    if (createErr) throw createErr;
    createdLedgerMap[template.id] = newLedger.id;
  }

  // ------------------------------
  // 3. Load all package headers for all ledgers
  // ------------------------------
  const { data: pkgHeaders, error: headersErr } = await supabase
    .from("ledger_package_headers")
    .select("*")
    .in(
      "package_ledger_id",
      pkgLedgers.map((l) => l.id)
    )
    .order("order_index", { ascending: true });

  if (headersErr) throw headersErr;

  // ------------------------------
  // 4. Insert the real headers
  // ------------------------------
  const headerInsertPayload = pkgHeaders.map((h) => ({
    ledger_id: createdLedgerMap[h.package_ledger_id], // map template → real ledger
    name: h.column_name,
    type: h.column_type,
    order_index: h.order_index,
    route_class: h.route_class,
    options: h.options,
    locked: h.locked,
  }));

  const { error: insertHeadersErr } = await supabase
    .from("ledger_headers")
    .insert(headerInsertPayload);

  if (insertHeadersErr) throw insertHeadersErr;

  // ------------------------------
  // 5. Return the created ledger IDs
  // ------------------------------
  return {
    success: true,
    ledgers: createdLedgerMap,
  };
}
