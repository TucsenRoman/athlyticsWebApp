"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/overlays/dialog"
import { Button } from "@/components/ui/actions/button"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/forms/select"
import { supabase } from "@/integrations/supabase/client"

type ProgramLite = {
  id: number
  school: string | null
  sport: string | null
  level: string | null
  gender: string | null
  year: string | null
  last_used_at?: string | null
  created_at?: string | null
}

interface MoveLedgerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ledgerId: string // legacy prop name (this is now files.id)
}

export default function MoveLedger({ open, onOpenChange, ledgerId }: MoveLedgerProps) {
  const [programs, setPrograms] = useState<ProgramLite[]>([])
  const [selectedProgram, setSelectedProgram] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const canSubmit = useMemo(() => !!selectedProgram && !!ledgerId && !loading, [selectedProgram, ledgerId, loading])

  useEffect(() => {
    if (!open) return

    let mounted = true

    async function loadPrograms() {
      const { data: auth } = await supabase.auth.getUser()
      const user = auth?.user
      if (!user) return

      const { data: owned, error: ownedErr } = await supabase
        .from("programs")
        .select("id, school, sport, level, gender, year, last_used_at, created_at")
        .eq("user_id", user.id)
        .order("last_used_at", { ascending: false })

      if (ownedErr) console.error(ownedErr)

      const { data: roles, error: rolesErr } = await supabase
        .from("program_roles")
        .select("program_id")
        .eq("user_id", user.id)

      if (rolesErr) console.error(rolesErr)

      const roleIds = Array.from(new Set((roles ?? []).map((r: any) => r.program_id).filter(Boolean))) as number[]

      let viaRoles: ProgramLite[] = []
      if (roleIds.length > 0) {
        const { data: rolePrograms, error: roleProgramsErr } = await supabase
          .from("programs")
          .select("id, school, sport, level, gender, year, last_used_at, created_at")
          .in("id", roleIds)
          .order("last_used_at", { ascending: false })

        if (roleProgramsErr) console.error(roleProgramsErr)
        viaRoles = (rolePrograms ?? []) as any
      }

      const byId = new Map<number, ProgramLite>()
      ;(owned ?? []).forEach((p: any) => byId.set(p.id, p))
      ;(viaRoles ?? []).forEach((p: any) => byId.set(p.id, p))

      const merged = Array.from(byId.values()).sort((a, b) => {
        const aT = a.last_used_at ?? a.created_at ?? ""
        const bT = b.last_used_at ?? b.created_at ?? ""
        return bT.localeCompare(aT)
      })

      if (mounted) setPrograms(merged)
    }

    loadPrograms()
    return () => {
      mounted = false
    }
  }, [open])

  async function detachFromOldProgramPackages(oldProgramId: number, fileId: string) {
    const { data: oldPkgs, error: oldPkgsErr } = await supabase
      .from("packages")
      .select("id")
      .eq("program_id", oldProgramId)

    if (oldPkgsErr) return

    const oldPkgIds = (oldPkgs ?? []).map((p: any) => p.id).filter(Boolean) as string[]
    if (oldPkgIds.length === 0) return

    await supabase
      .from("package_items")
      .delete()
      .eq("ledger_id", fileId) // legacy column name in schema
      .in("package_id", oldPkgIds)
  }

  async function attachToFirstPackage(programIdNum: number, fileId: string) {
    const { data: pkgs, error } = await supabase
      .from("packages")
      .select("id")
      .eq("program_id", programIdNum)
      .order("created_at", { ascending: true })
      .limit(1)

    if (error) return
    const pkgId = pkgs?.[0]?.id
    if (!pkgId) return

    await supabase.from("package_items").insert([
      {
        package_id: pkgId,
        ledger_id: fileId, // schema column name
        order_index: 0,
      },
    ])
  }

  const handleMove = async () => {
    if (!canSubmit) return

    const targetProgramNum = Number(selectedProgram)
    if (!Number.isFinite(targetProgramNum)) return

    setLoading(true)
    try {
      // read current program_id so we can detach from old program packages
      const { data: fileRow, error: fileErr } = await supabase
        .from("files")
        .select("id, program_id")
        .eq("id", ledgerId)
        .single()

      if (fileErr) throw fileErr
      if (!fileRow?.id) throw new Error("Table not found")

      const oldProgramId = Number(fileRow.program_id)
      const hasOldProgram = Number.isFinite(oldProgramId)

      // move file
      const { error: updateErr } = await supabase
        .from("files")
        .update({ program_id: targetProgramNum })
        .eq("id", ledgerId)

      if (updateErr) throw updateErr

      // best-effort cleanup: remove it from old program packages
      if (hasOldProgram && oldProgramId !== targetProgramNum) {
        await detachFromOldProgramPackages(oldProgramId, ledgerId)
      }

      // best-effort: attach to a package in new program so it shows up
      await attachToFirstPackage(targetProgramNum, ledgerId)

      onOpenChange(false)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Move Table to Another Program</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Select onValueChange={setSelectedProgram} value={selectedProgram}>
            <SelectTrigger>
              <SelectValue placeholder="Select a program..." />
            </SelectTrigger>

            <SelectContent>
              {programs.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  {(p.school ?? "School")} — {(p.sport ?? "Sport")} ({p.level ?? "Level"},{" "}
                  {p.gender ?? "Gender"}{p.year ? `, ${p.year}` : ""})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleMove} disabled={!canSubmit}>
            {loading ? "Moving..." : "Move Table"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
