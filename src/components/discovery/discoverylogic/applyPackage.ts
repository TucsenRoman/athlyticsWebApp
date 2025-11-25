import { supabase } from "@/integrations/supabase/client";

/**
 * Apply a ledger package into a program.
 *
 * FINAL VERSION — compatible with new schema:
 * ---------------------------------------------------------
 * 1. Create a new package_install_instance row
 * 2. Load template-ledgers in package
 * 3. For each template-ledger → create a real ledger
 * 4. Load template-headers for all template-ledgers
 * 5. Create real ledger_headers for each new ledger
 * 6. Insert ledger_package_installs records with install_instance_id
 * ---------------------------------------------------------
 */
export async function applyPackageToProgram(packageId: string, programId: number) {
  // ------------------------------
  // 0. Auth
  // ------------------------------
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Not logged in");
  const coachId = auth.user.id;

  // ------------------------------
  // 1. Load package template ledgers
  // ------------------------------
  const { data: pkgLedgers, error: pkgLedgersErr } = await supabase
    .from("ledger_package_ledgers")
    .select("*")
    .eq("package_id", packageId)
    .order("ledger_name", { ascending: true });

  if (pkgLedgersErr) throw pkgLedgersErr;
  if (!pkgLedgers || pkgLedgers.length === 0)
    throw new Error("Package contains no ledgers.");

  // ------------------------------
  // 2. Create install instance for this program/package
  // ------------------------------
  const { data: installInstance, error: instErr } = await supabase
    .from("package_install_instances")
    .insert([
      {
        program_id: programId,
        package_id: packageId,
        name: null,        // name editable in UI later
        tags: null,        // tags editable later
      },
    ])
    .select()
    .single();

  if (instErr) throw instErr;
  const installInstanceId = installInstance.id;

  // ------------------------------
  // 3. Create real ledgers
  // ------------------------------
  const createdLedgerMap: Record<string, string> = {};

  for (const template of pkgLedgers) {
    const { data: ledger, error: createLedgerErr } = await supabase
      .from("ledgers")
      .insert([
        {
          coach_id: coachId,
          program_id: programId,
          name: template.ledger_name,
          icon: template.icon,
          is_system: template.is_system,
          is_protected: true,
          protection_level: template.protection_level,
          template_key: `pkg_${packageId}_${template.id}`,
          status: "active",
        },
      ])
      .select()
      .single();

    if (createLedgerErr || !ledger) throw createLedgerErr;

    createdLedgerMap[template.id] = ledger.id;
  }

  // ------------------------------
  // 4. Load all template headers
  // ------------------------------
  const { data: pkgHeaders, error: pkgHeadersErr } = await supabase
    .from("ledger_package_headers")
    .select("*")
    .in(
      "package_ledger_id",
      pkgLedgers.map((l) => l.id),
    )
    .order("order_index", { ascending: true });

  if (pkgHeadersErr) throw pkgHeadersErr;

  // ------------------------------
  // 5. Insert real ledger_headers
  // ------------------------------
  const headersPayload = pkgHeaders.map((h) => ({
    ledger_id: createdLedgerMap[h.package_ledger_id],
    name: h.column_name,
    type: h.column_type,
    options: h.options,
    order_index: h.order_index,
    route_class: h.route_class,
    locked: h.locked,
  }));

  const { error: insertHeadersErr } = await supabase
    .from("ledger_headers")
    .insert(headersPayload);

  if (insertHeadersErr) throw insertHeadersErr;

  // ------------------------------
  // 6. Insert ledger_package_installs (one per ledger)
  // ------------------------------
  const installsPayload = pkgLedgers.map((template) => ({
    program_id: programId,
    template_id: template.id,
    installed_ledger_id: createdLedgerMap[template.id],
    install_instance_id: installInstanceId,
  }));

  const { error: installsErr } = await supabase
    .from("ledger_package_installs")
    .insert(installsPayload);

  if (installsErr) throw installsErr;

  // ------------------------------
  // 7. Return instance + created ledgers
  // ------------------------------
  return {
    success: true,
    install_instance_id: installInstanceId,
    ledgers: createdLedgerMap,
  };
}
