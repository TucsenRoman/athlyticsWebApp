import { supabase } from "@/integrations/supabase/client";

export async function fetchPackageLedgers(programId: number) {
  // 1. Fetch all packages for this program
  const { data: packages, error: pkgErr } = await supabase
    .from("packages")
    .select("id, name")
    .eq("program_id", programId);

  if (pkgErr) {
    console.error("Failed to load packages:", pkgErr);
    return [];
  }

  if (!packages || packages.length === 0) return [];

  const packageIds = packages.map((p) => p.id);

  // 2. Fetch all package_items linking each package -> ledger
  const { data: items, error: itemsErr } = await supabase
    .from("package_items")
    .select("package_id, ledgers(id, name)")
    .in("package_id", packageIds);

  if (itemsErr) {
    console.error("Failed to load package_items:", itemsErr);
    return [];
  }

  // 3. Build the grouped format
  const grouped: Record<string, { id: string; name: string }[]> = {};

  items?.forEach((item) => {
    const pkgId = item.package_id;
    if (!grouped[pkgId]) grouped[pkgId] = [];
    if (item.ledgers) {
      grouped[pkgId].push({
        id: item.ledgers.id,
        name: item.ledgers.name,
      });
    }
  });

  // 4. Produce final list
  const result = packages.map((pkg) => ({
    packageName: pkg.name,
    packageId: pkg.id,
    ledgers: grouped[pkg.id] || [],
  }));

  return result;
}
