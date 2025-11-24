import { supabase } from "@/integrations/supabase/client";

/**
 * Install the system default package for a new program.
 *
 * Final schema-aware flow:
 *  1. Find the system package (ledger_packages.is_system_package = true)
 *  2. Create a package_install_instances row (one per install)
 *  3. Load all ledger_package_ledgers for that package
 *  4. For each template ledger:
 *      - create a real ledger in `ledgers`
 *      - clone its headers from `ledger_package_headers` → `ledger_headers`
 *      - create a ledger_package_installs row linking:
 *          program_id, template_id, installed_ledger_id, install_instance_id
 *
 * @param programId program to install into
 * @param coachId   user / coach id (auth user id)
 */
export async function installDefaultPackage(
  programId: number,
  coachId: string
) {
  try {
    // ------------------------------------------------------------
    // 1. Find the system package
    // ------------------------------------------------------------
    const { data: pkg, error: pkgErr } = await supabase
      .from("ledger_packages")
      .select("*")
      .eq("is_system_package", true)
      .single();

    if (pkgErr || !pkg) {
      throw pkgErr || new Error("Missing system package");
    }

    const packageId = pkg.id;

    // ------------------------------------------------------------
    // 2. Create a package_install_instance for this install
    // ------------------------------------------------------------
    const { data: instance, error: instErr1 } = await supabase
      .from("package_install_instances")
      .insert([
        {
          program_id: programId,
          package_id: packageId,
          name: pkg.name, // default instance name — editable later in UI
          tags: [],       // can be updated later
        },
      ])
      .select()
      .single();

    if (instErr1 || !instance) {
      throw instErr1 || new Error("Failed to create package install instance");
    }

    const installInstanceId: string = instance.id;

    // ------------------------------------------------------------
    // 3. Load template ledger definitions for this package
    // ------------------------------------------------------------
    const { data: templates, error: tmplErr } = await supabase
      .from("ledger_package_ledgers")
      .select("*")
      .eq("package_id", packageId)
      .order("ledger_name", { ascending: true });

    if (tmplErr) throw tmplErr;
    if (!templates || templates.length === 0) {
      throw new Error("System package has no template ledgers");
    }

    // Track template_ledger_id → real_ledger_id
    const createdLedgerMap: Record<string, string> = {};

    // ------------------------------------------------------------
    // 4. For each template ledger: create ledger + headers + install row
    // ------------------------------------------------------------
    for (const tmpl of templates) {
      // 4a. Create real ledger
      const { data: ledger, error: ledgerErr } = await supabase
        .from("ledgers")
        .insert([
          {
            coach_id: coachId,
            program_id: programId,
            name: tmpl.ledger_name,
            icon: tmpl.icon,
            status: "active",
            template_key: tmpl.id,           // keeps linkage to template
            is_system: tmpl.is_system,
            is_protected: true,
            protection_level: tmpl.protection_level,
          },
        ])
        .select()
        .single();

      if (ledgerErr || !ledger) {
        throw ledgerErr || new Error("Failed to create installed ledger");
      }

      createdLedgerMap[tmpl.id] = ledger.id;

      // 4b. Clone column headers from ledger_package_headers
      const { data: columns, error: colErr } = await supabase
        .from("ledger_package_headers")
        .select("*")
        .eq("package_ledger_id", tmpl.id)
        .order("order_index", { ascending: true });

      if (colErr) throw colErr;

      if (columns && columns.length > 0) {
        const headerInsert = columns.map((c) => ({
          ledger_id: ledger.id,
          name: c.column_name,
          type: c.column_type,
          options: c.options,
          order_index: c.order_index,
          route_class: c.route_class,
          locked: c.locked,
        }));

        const { error: insErr } = await supabase
          .from("ledger_headers")
          .insert(headerInsert);

        if (insErr) throw insErr;
      }

      // 4c. Record ledger → template → instance mapping
      const { error: instErr2 } = await supabase
        .from("ledger_package_installs")
        .insert([
          {
            program_id: programId,
            template_id: tmpl.id,
            installed_ledger_id: ledger.id,
            install_instance_id: installInstanceId,
          },
        ]);

      if (instErr2) throw instErr2;
    }

    // ------------------------------------------------------------
    // 5. Return success & metadata
    // ------------------------------------------------------------
    return {
      success: true,
      install_instance_id: installInstanceId,
      ledgers: createdLedgerMap, // template_id → installed_ledger_id
    };
  } catch (err) {
    console.error("Default package install failed:", err);
    return { success: false, error: err };
  }
}
