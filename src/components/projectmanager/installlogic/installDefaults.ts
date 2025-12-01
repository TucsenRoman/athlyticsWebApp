import { supabase } from "@/integrations/supabase/client";

/* -------------------------------------------------------------------------- */
/* HARDCODED SYSTEM DEFAULTS */
/* -------------------------------------------------------------------------- */
const SYSTEM_DEFAULTS = {
  packages: [
    "891550fd-4ab6-4103-a31e-5ba9e43acfad", // Essentials Package
  ],
  ledgers: [
    // standalone template ledger ids if needed later
  ],
} as const;

/* -------------------------------------------------------------------------- */
/* MAIN INSTALL FUNCTION */
/* -------------------------------------------------------------------------- */
export async function installDefaults(programId: number, userId: string) {
  console.log("🚀 installDefaults START", { programId, userId });

  try {
    const clonedLedgerMap: Record<string, string> = {};

    console.log("📦 SYSTEM_DEFAULTS.packages =", SYSTEM_DEFAULTS.packages);

    // -------------------------------
    // 1) Install each package
    // -------------------------------
    for (const packageId of SYSTEM_DEFAULTS.packages) {
      console.log(`➡️ Cloning package ${packageId} for program ${programId}`);
      const result = await clonePackage(packageId, programId, userId);
      console.log(`✅ Finished package ${packageId}`, result);

      Object.assign(clonedLedgerMap, result);
    }

    // ----------------------------------
    // 2) Install any standalone ledger templates
    // ----------------------------------
    console.log("📝 SYSTEM_DEFAULTS.ledgers =", SYSTEM_DEFAULTS.ledgers);

    for (const ledgerId of SYSTEM_DEFAULTS.ledgers) {
      console.log(`➡️ Cloning standalone ledger ${ledgerId}`);
      const newId = await cloneSingleLedger(ledgerId, programId, userId);
      console.log(`   ↳ cloned to new ledger id ${newId}`);
      clonedLedgerMap[ledgerId] = newId;
    }

    console.log("🎉 installDefaults COMPLETE", clonedLedgerMap);

    return {
      success: true,
      cloned_ledgers: clonedLedgerMap,
    };
  } catch (err) {
    console.error("❌ installDefaults FAILED", err);
    return { success: false, error: err };
  }
}

/* -------------------------------------------------------------------------- */
/* CLONE PACKAGE */
/* -------------------------------------------------------------------------- */
async function clonePackage(packageId: string, programId: number, userId: string) {
  console.log("📦 clonePackage START", { packageId, programId, userId });

  const cloned: Record<string, string> = {};

  // Load items  
  const { data: items, error } = await supabase
    .from("package_items")
    .select("ledger_id")
    .eq("package_id", packageId);

  console.log("📦 package_items query result:", { items, error });

  if (error) {
    console.error("❌ ERROR loading package_items", error);
    throw error;
  }

  if (!items || items.length === 0) {
    console.warn("⚠️ package contains ZERO items", packageId);
    return cloned;
  }

  // Clone each ledger
  for (const item of items) {
    console.log(`➡️ cloning ledger template ${item.ledger_id}`);
    const newId = await cloneSingleLedger(item.ledger_id, programId, userId);
    console.log(`   ↳ created ledger ${newId}`);
    cloned[item.ledger_id] = newId;
  }

  console.log("📦 clonePackage DONE", cloned);
  return cloned;
}

/* -------------------------------------------------------------------------- */
/* CLONE SINGLE LEDGER */
/* -------------------------------------------------------------------------- */
async function cloneSingleLedger(
  templateLedgerId: string,
  programId: number,
  userId: string
) {
  console.log("🧬 cloneSingleLedger START", {
    templateLedgerId,
    programId,
    userId,
  });

  // load template ledger
  const { data: tmpl, error: tmplErr } = await supabase
    .from("ledgers")
    .select("*")
    .eq("id", templateLedgerId)
    .single();

  console.log("🧬 Loaded template ledger:", { tmpl, tmplErr });

  if (tmplErr || !tmpl) {
    console.error("❌ ERROR loading template ledger", tmplErr);
    throw tmplErr ?? new Error("Template ledger missing");
  }

  // create new ledger
  const insertPayload = {
    user_id: userId,
    program_id: programId,
    name: tmpl.name,
    icon: tmpl.icon,
    status: tmpl.status ?? "active",
    description: tmpl.description,
    template_key: tmpl.id,
    is_system: false,
    is_protected: tmpl.is_protected,
    protection_level: tmpl.protection_level,
  };

  console.log("🧬 Inserting new ledger with payload:", insertPayload);

  const { data: newLedger, error: newErr } = await supabase
    .from("ledgers")
    .insert([insertPayload])
    .select()
    .single();

  console.log("🧬 New ledger insert result:", { newLedger, newErr });

  if (newErr || !newLedger) {
    console.error("❌ ERROR inserting cloned ledger", newErr);
    throw newErr ?? new Error("Cannot clone ledger");
  }

  // clone headers
  const { data: headers, error: hdrErr } = await supabase
    .from("ledger_headers")
    .select("*")
    .eq("ledger_id", templateLedgerId)
    .order("order_index", { ascending: true });

  console.log("🧬 Loaded headers:", { headers, hdrErr });

  if (hdrErr) {
    console.error("❌ ERROR loading headers", hdrErr);
    throw hdrErr;
  }

  if (headers && headers.length > 0) {
    const hdrInsert = headers.map((h) => ({
      ledger_id: newLedger.id,
      name: h.name,
      type: h.type,
      options: h.options,
      order_index: h.order_index,
      route_class: h.route_class,
      locked: h.locked,
    }));

    console.log("🧬 Inserting cloned headers:", hdrInsert);

    const { error: hdrInsErr } = await supabase
      .from("ledger_headers")
      .insert(hdrInsert);

    console.log("🧬 Header insert result:", hdrInsErr);

    if (hdrInsErr) {
      console.error("❌ ERROR inserting headers", hdrInsErr);
      throw hdrInsErr;
    }
  } else {
    console.warn("⚠️ TEMPLATE HAS NO HEADERS:", templateLedgerId);
  }

  console.log("🧬 cloneSingleLedger COMPLETE →", newLedger.id);
  return newLedger.id;
}
