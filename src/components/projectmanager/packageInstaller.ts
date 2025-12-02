import { supabase } from "@/integrations/supabase/client";

/* -------------------------------------------------------------------------- */
/* SYSTEM DEFAULT PACKAGES                                                    */
/* -------------------------------------------------------------------------- */
const SYSTEM_DEFAULT_PACKAGES = [
  "891550fd-4ab6-4103-a31e-5ba9e43acfad", // Essentials Package
] as const;

/* -------------------------------------------------------------------------- */
/* INSTALL WITH FULL DEBUG                                           */
/* -------------------------------------------------------------------------- */
export async function packageInstaller(programId: number) {
  console.log("🚀 [installDefaults] START", { programId });

  try {
    /* -------------------------------------------------- */
    /* 0. AUTH                                             */
    /* -------------------------------------------------- */
    console.log("🔐 [Auth] Checking user...");
    const { data: auth, error: authErr } = await supabase.auth.getUser();

    console.log("🔐 [Auth] Result:", { auth, authErr });

    if (authErr) throw new Error("Auth error: " + JSON.stringify(authErr));
    if (!auth?.user) throw new Error("Not logged in");

    const userId = auth.user.id;

    const installed: Record<string, any> = {};

    /* -------------------------------------------------- */
    /* LOOP DEFAULT PACKAGES                               */
    /* -------------------------------------------------- */
    for (const pkgId of SYSTEM_DEFAULT_PACKAGES) {
      console.log("📦 [Package Loop] Installing package:", pkgId);

      const result = await clonePackageIntoProgram(pkgId, programId, userId);

      console.log("📦 [Package Loop] DONE package:", pkgId, result);

      installed[pkgId] = result;
    }

    console.log("🎉 [installDefaults] COMPLETE", installed);

    return {
      success: true,
      installed,
    };
  } catch (err) {
    console.error("❌ [installDefaults] FAILED", err);
    return { success: false, error: err };
  }
}

/* -------------------------------------------------------------------------- */
/* CLONE PACKAGE — WITH AGGRESSIVE DEBUG LOGGING                              */
/* -------------------------------------------------------------------------- */
async function clonePackageIntoProgram(
  packageId: string,
  programId: number,
  userId: string
) {
  console.log("========== 📦 clonePackageIntoProgram START ==========");
  console.log("➡️ Params:", { packageId, programId, userId });

  /* -------------------------------------------------- */
  /* 1. LOAD SOURCE PACKAGE                              */
  /* -------------------------------------------------- */
  console.log("🔍 [1] Loading source package:", packageId);

  const { data: sourcePackage, error: pkgErr } = await supabase
    .from("packages")
    .select("*")
    .eq("id", packageId)
    .single();

  console.log("🔍 [1] Result:", { sourcePackage, pkgErr });

  if (pkgErr || !sourcePackage)
    throw new Error(
      "[1] FAILED loading package: " + JSON.stringify({ pkgErr, sourcePackage })
    );

  /* -------------------------------------------------- */
  /* 2. LOAD PACKAGE ITEMS                               */
  /* -------------------------------------------------- */
  console.log("🔍 [2] Loading package_items...");

  const { data: pkgItems, error: pkgItemsErr } = await supabase
    .from("package_items")
    .select("*")
    .eq("package_id", packageId)
    .order("order_index", { ascending: true });

  console.log("🔍 [2] package_items result:", { pkgItems, pkgItemsErr });

  if (pkgItemsErr)
    throw new Error("[2] FAILED loading package_items: " + JSON.stringify(pkgItemsErr));

  if (!pkgItems || pkgItems.length === 0)
    throw new Error("[2] Package contains no items");

  const ledgerIds = pkgItems.map((pi) => pi.ledger_id);

  /* -------------------------------------------------- */
  /* 3. LOAD SOURCE LEDGERS                              */
  /* -------------------------------------------------- */
  console.log("🔍 [3] Loading ledgers:", ledgerIds);

  const { data: sourceLedgers, error: ledErr } = await supabase
    .from("ledgers")
    .select("*")
    .in("id", ledgerIds);

  console.log("🔍 [3] ledgers result:", { sourceLedgers, ledErr });

  if (ledErr)
    throw new Error("[3] FAILED loading ledgers: " + JSON.stringify(ledErr));

  /* -------------------------------------------------- */
  /* 4. LOAD HEADERS                                     */
  /* -------------------------------------------------- */
  console.log("🔍 [4] Loading headers for ledgers:", ledgerIds);

  const { data: sourceHeaders, error: headerErr } = await supabase
    .from("ledger_headers")
    .select("*")
    .in("ledger_id", ledgerIds)
    .order("order_index", { ascending: true });

  console.log("🔍 [4] headers result:", { sourceHeaders, headerErr });

  if (headerErr)
    throw new Error("[4] FAILED loading headers: " + JSON.stringify(headerErr));

  /* -------------------------------------------------- */
  /* 5. CREATE NEW PACKAGE                               */
  /* -------------------------------------------------- */
  console.log("🛠 [5] Creating new package in program:", programId);

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

  console.log("🛠 [5] New package result:", { newPackage, newPkgErr });

  if (newPkgErr || !newPackage)
    throw new Error(
      "[5] FAILED creating new package: " +
        JSON.stringify({ newPkgErr, newPackage })
    );

  const newPackageId = newPackage.id;

  /* -------------------------------------------------- */
  /* 6. CLONE LEDGERS                                    */
  /* -------------------------------------------------- */
  console.log("🛠 [6] Cloning ledgers...");

  const oldToNewLedgerMap: Record<string, string> = {};

  for (const oldLedger of sourceLedgers) {
    console.log("   ↳ Cloning ledger:", oldLedger.id);

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

    console.log("   ↳ New ledger result:", { newLedger, insertErr });

    if (insertErr || !newLedger)
      throw new Error(
        "[6] FAILED cloning ledger: " +
          JSON.stringify({ insertErr, oldLedger })
      );

    oldToNewLedgerMap[oldLedger.id] = newLedger.id;
  }

  /* -------------------------------------------------- */
  /* 7. CLONE HEADERS                                    */
  /* -------------------------------------------------- */
  console.log("🛠 [7] Cloning headers... count:", sourceHeaders.length);

  const headerPayload = sourceHeaders.map((hdr) => ({
    ledger_id: oldToNewLedgerMap[hdr.ledger_id],
    name: hdr.name,
    type: hdr.type,
    order_index: hdr.order_index,
    route_class: hdr.route_class,
    options: hdr.options,
    locked: hdr.locked,
  }));

  console.log("🛠 [7] Insert payload:", headerPayload);

  const { error: hdrInsertErr } = await supabase
    .from("ledger_headers")
    .insert(headerPayload);

  console.log("🛠 [7] Insert result:", hdrInsertErr);

  if (hdrInsertErr)
    throw new Error("[7] FAILED inserting headers: " + JSON.stringify(hdrInsertErr));

  /* -------------------------------------------------- */
  /* 8. CLONE PACKAGE ITEMS                              */
  /* -------------------------------------------------- */
  console.log("🛠 [8] Cloning package_items...");

  const pkgItemsPayload = pkgItems.map((pi) => ({
    package_id: newPackageId,
    ledger_id: oldToNewLedgerMap[pi.ledger_id],
    order_index: pi.order_index,
  }));

  console.log("🛠 [8] Insert payload:", pkgItemsPayload);

  const { error: pkgItemsInsertErr } = await supabase
    .from("package_items")
    .insert(pkgItemsPayload);

  console.log("🛠 [8] Insert result:", pkgItemsInsertErr);

  if (pkgItemsInsertErr)
    throw new Error(
      "[8] FAILED inserting package_items: " +
        JSON.stringify(pkgItemsInsertErr)
    );

  /* -------------------------------------------------- */
  /* DONE                                                */
  /* -------------------------------------------------- */
  console.log("✅ clonePackageIntoProgram COMPLETE", {
    newPackageId,
    oldToNewLedgerMap,
  });

  return {
    new_package_id: newPackageId,
    old_to_new_ledgers: oldToNewLedgerMap,
  };
}
