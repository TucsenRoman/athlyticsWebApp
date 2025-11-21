import { supabase } from "@/integrations/supabase/client";

/**
 * Installs the system default package for a new program.
 * This clones:
 *  - all ledger templates belonging to the system package
 *  - all column templates for each ledger template
 *  - (future) all route templates
 *
 * @param programId number
 * @param coachId string
 */
export async function installDefaultPackage(programId: number, coachId: string) {
  try {
    // 1. Find the default system package
    const { data: pkg, error: pkgErr } = await supabase
      .from("ledger_packages")
      .select("*")
      .eq("is_system_package", true)
      .single();

    if (pkgErr || !pkg) throw pkgErr || new Error("Missing system package");

    const packageId = pkg.id;

    // 2. Get all ledger templates inside this package
    const { data: templates, error: tmplErr } = await supabase
      .from("ledger_package_ledgers")
      .select("*")
      .eq("package_id", packageId);

    if (tmplErr || !templates) throw tmplErr || new Error("Package has no templates");

    // 3. For each template → create a real ledger
    for (const tmpl of templates) {
      const { data: ledger, error: ledgerErr } = await supabase
        .from("ledgers")
        .insert([
          {
            coach_id: coachId,
            program_id: programId,
            name: tmpl.ledger_name,
            icon: tmpl.icon,
            status: "active",
            template_key: tmpl.id, // optional but useful
            is_system: tmpl.is_system,
            protection_level: tmpl.protection_level,
          },
        ])
        .select()
        .single();

      if (ledgerErr || !ledger) throw ledgerErr;

      // 4. Clone the template’s columns (ledger_package_headers → ledger_headers)
      const { data: columns, error: colErr } = await supabase
        .from("ledger_package_headers")
        .select("*")
        .eq("package_ledger_id", tmpl.id)
        .order("order_index");

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

      // 5. Record install mapping
      const { error: instErr } = await supabase
        .from("ledger_package_installs")
        .insert([
          {
            program_id: programId,
            template_id: tmpl.id,
            installed_ledger_id: ledger.id,
          },
        ]);

      if (instErr) throw instErr;
    }

    return { success: true };
  } catch (err) {
    console.error("Default package install failed:", err);
    return { success: false, error: err };
  }
}
