import { supabase } from "@/integrations/supabase/client";

/**
 * Clone an existing package into a program.
 *
 * NEW FLOW FOR NEW SCHEMA:
 * ---------------------------------------------------------
 * 1. Load source package + package_items
 * 2. Load all ledgers referenced by that package
 * 3. Load headers for all those ledgers
 * 4. Create a NEW package row for the target program
 * 5. Duplicate each ledger (new id, new program_id)
 * 6. Duplicate headers for each new ledger
 * 7. Create package_items rows linking new package → new ledgers
 * ---------------------------------------------------------
 */
export async function applyPackageToProgram(packageId: string, programId: number) {
  // -----------------------------------------------------
  // 0. Auth
  // -----------------------------------------------------
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Not logged in");
  const userId = auth.user.id;

  // -----------------------------------------------------
  // 1. Get the source package
  // -----------------------------------------------------
  const { data: sourcePackage, error: pkgErr } = await supabase
    .from("packages")
    .select("*")
    .eq("id", packageId)
    .single();

  if (pkgErr) throw pkgErr;

  // -----------------------------------------------------
  // 2. Load package_items
  // -----------------------------------------------------
  const { data: pkgItems, error: pkgItemsErr } = await supabase
    .from("package_items")
    .select("*")
    .eq("package_id", packageId)
    .order("order_index", { ascending: true });

  if (pkgItemsErr) throw pkgItemsErr;

  if (!pkgItems || pkgItems.length === 0) {
    throw new Error("Package contains no ledgers.");
  }

  const ledgerIds = pkgItems.map((pi) => pi.ledger_id);

  // -----------------------------------------------------
  // 3. Load source ledgers
  // -----------------------------------------------------
  const { data: sourceLedgers, error: ledErr } = await supabase
    .from("ledgers")
    .select("*")
    .in("id", ledgerIds);

  if (ledErr) throw ledErr;

  // -----------------------------------------------------
  // 4. Load source headers
  // -----------------------------------------------------
  const { data: sourceHeaders, error: headerErr } = await supabase
    .from("ledger_headers")
    .select("*")
    .in(
      "ledger_id",
      sourceLedgers.map((l) => l.id)
    )
    .order("order_index", { ascending: true });

  if (headerErr) throw headerErr;

  // -----------------------------------------------------
  // 5. Create a NEW package under this program
  // -----------------------------------------------------
  const { data: newPackage, error: newPkgErr } = await supabase
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

  // -----------------------------------------------------
  // 6. Duplicate all ledgers
  // -----------------------------------------------------
  const oldToNewLedgerMap: Record<string, string> = {};

  for (const oldLedger of sourceLedgers) {
    const { data: newLedger, error: insertErr } = await supabase
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

    if (insertErr || !newLedger) throw insertErr;

    oldToNewLedgerMap[oldLedger.id] = newLedger.id;
  }

  // -----------------------------------------------------
  // 7. Duplicate ledger headers
  // -----------------------------------------------------
  const headerPayload = sourceHeaders.map((hdr) => ({
    ledger_id: oldToNewLedgerMap[hdr.ledger_id],
    name: hdr.name,
    type: hdr.type,
    order_index: hdr.order_index,
    route_class: hdr.route_class,
    options: hdr.options,
    locked: hdr.locked,
  }));

  const { error: insertHeadersErr } = await supabase
    .from("ledger_headers")
    .insert(headerPayload);

  if (insertHeadersErr) throw insertHeadersErr;

  // -----------------------------------------------------
  // 8. Create package_items for new package
  // -----------------------------------------------------
  const newPkgItemsPayload = pkgItems.map((pi) => ({
    package_id: newPackageId,
    ledger_id: oldToNewLedgerMap[pi.ledger_id],
    order_index: pi.order_index,
  }));

  const { error: newPkgItemsErr } = await supabase
    .from("package_items")
    .insert(newPkgItemsPayload);

  if (newPkgItemsErr) throw newPkgItemsErr;

  // -----------------------------------------------------
  // DONE
  // -----------------------------------------------------
  return {
    success: true,
    new_package_id: newPackageId,
    ledgers: oldToNewLedgerMap,
  };
}
