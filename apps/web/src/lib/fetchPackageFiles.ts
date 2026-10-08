// src/lib/fetchPackageFiles.ts
import { supabase } from "@/integrations/supabase/client"

export type FileTab = {
  id: string
  name: string
}

export type PackageFileGroup = {
  packageId: string
  packageName: string
  files: FileTab[]
}

// Returns FILES grouped by package.
// Schema notes:
// - packages.program_id = program
// - package_items.ledger_id -> files.id (FK)
export async function fetchPackageFiles(programId: number): Promise<PackageFileGroup[]> {
  try {
    // 1) Packages for this program
    const { data: packages, error: packagesErr } = await supabase
      .from("packages")
      .select("id, name")
      .eq("program_id", programId)
      .order("name", { ascending: true })

    if (packagesErr) {
      console.error("fetchPackageFiles: packages failed:", packagesErr)
      return []
    }

    const pkgs = (packages ?? []).map((p) => ({
      packageId: p.id as string,
      packageName: (p.name ?? "").trim() || "Untitled package",
    }))

    if (pkgs.length === 0) return []

    const packageIds = pkgs.map((p) => p.packageId)

    // 2) Package items (NO nested joins)
    const { data: items, error: itemsErr } = await supabase
      .from("package_items")
      .select("package_id, ledger_id, order_index")
      .in("package_id", packageIds)

    if (itemsErr) {
      console.error("fetchPackageFiles: package_items failed:", itemsErr)
      return pkgs.map((p) => ({ ...p, files: [] }))
    }

    const fileIds = Array.from(
      new Set((items ?? []).map((r) => r.ledger_id).filter(Boolean))
    ) as string[]

    if (fileIds.length === 0) {
      return pkgs.map((p) => ({ ...p, files: [] }))
    }

    // 3) Fetch file records
    const { data: files, error: filesErr } = await supabase
      .from("files")
      .select("id, name")
      .in("id", fileIds)

    if (filesErr) {
      console.error("fetchPackageFiles: files failed:", filesErr)
      return pkgs.map((p) => ({ ...p, files: [] }))
    }

    const fileNameById = new Map<string, string>()
    ;(files ?? []).forEach((f) => {
      fileNameById.set(f.id, (f.name ?? "").trim() || "Untitled table")
    })

    // 4) Group files under each package, preserve order_index
    const grouped = new Map<string, { id: string; name: string; order: number }[]>()

    ;(items ?? []).forEach((row) => {
      const pkgId = row.package_id as string
      const fileId = row.ledger_id as string // schema column name
      const order = (row.order_index ?? 0) as number
      if (!pkgId || !fileId) return

      const name = fileNameById.get(fileId) ?? "Untitled table"

      const arr = grouped.get(pkgId) ?? []
      arr.push({ id: fileId, name, order })
      grouped.set(pkgId, arr)
    })

    for (const [pkgId, arr] of grouped.entries()) {
      arr.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
      grouped.set(pkgId, arr)
    }

    // 5) Return grouped shape
    return pkgs.map((p) => ({
      packageId: p.packageId,
      packageName: p.packageName,
      files: (grouped.get(p.packageId) ?? []).map(({ id, name }) => ({ id, name })),
    }))
  } catch (err) {
    console.error("fetchPackageFiles crashed:", err)
    return []
  }
}
