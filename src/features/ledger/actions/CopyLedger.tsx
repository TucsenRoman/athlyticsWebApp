import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/overlays/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/forms/select"
import { Button } from "@/components/ui/actions/button"
import { supabase } from "@/integrations/supabase/client"

interface CopyFileProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fileId: string
}

export default function CopyFile({ open, onOpenChange, fileId }: CopyFileProps) {
  const [programs, setPrograms] = useState<any[]>([])
  const [targetProgramId, setTargetProgramId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchPrograms = async () => {
      const { data: auth } = await supabase.auth.getUser()
      const user = auth?.user
      if (!user) return

      const { data, error } = await supabase
        .from("programs")
        .select("id, school, sport, level, gender, year")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) console.error(error)
      else setPrograms(data || [])
    }

    if (open) fetchPrograms()
  }, [open])

  const handleDuplicate = async () => {
    if (!fileId || !targetProgramId) return
    setLoading(true)

    try {
      const { data: auth } = await supabase.auth.getUser()
      const user = auth?.user
      if (!user) throw new Error("Not logged in")

      // 1) Load source file
      const { data: sourceFile, error: fileErr } = await supabase
        .from("files")
        .select("*")
        .eq("id", fileId)
        .single()

      if (fileErr) throw fileErr
      if (!sourceFile) throw new Error("File not found")

      // 2) Create new file in target program
      const { data: newFile, error: insertErr } = await supabase
        .from("files")
        .insert([
          {
            user_id: user.id,
            program_id: targetProgramId,
            name: `${(sourceFile.name ?? "Untitled").trim()} (Copy)`,
            description: sourceFile.description ?? "",
            icon: sourceFile.icon ?? "ClipboardList",
            status: sourceFile.status ?? "active",
            type: sourceFile.type ?? "table",
            data: sourceFile.data ?? {},
            template_key: sourceFile.template_key ?? null,
            favorite: sourceFile.favorite ?? false,
          },
        ])
        .select()
        .single()

      if (insertErr) throw insertErr
      if (!newFile) throw new Error("Failed to create new file")

      // 3) Copy columns (table_columns)
      const { data: cols, error: colsErr } = await supabase
        .from("table_columns")
        .select("*")
        .eq("file_id", sourceFile.id)
        .order("order_index", { ascending: true })

      if (colsErr) throw colsErr

      if (cols?.length) {
        const payload = cols.map((c: any) => ({
          file_id: newFile.id,
          name: c.name,
          type: c.type,
          order_index: c.order_index ?? 0,
          route_class: c.route_class ?? "independent",
          options: c.options ?? {},
          locked: c.locked ?? false,
        }))

        const { error } = await supabase.from("table_columns").insert(payload)
        if (error) throw error
      }

      // 4) Copy rows (table_rows)
      const { data: rows, error: rowsErr } = await supabase
        .from("table_rows")
        .select("*")
        .eq("file_id", sourceFile.id)

      if (rowsErr) throw rowsErr

      if (rows?.length) {
        const payload = rows.map((r: any) => ({
          file_id: newFile.id,
          values: r.values ?? {},
          entity_key: r.entity_key ?? null,
        }))

        const { error } = await supabase.from("table_rows").insert(payload)
        if (error) throw error
      }

      onOpenChange(false)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card">
        <DialogHeader>
          <DialogTitle>Duplicate File to Program</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <Select
            value={targetProgramId ? String(targetProgramId) : ""}
            onValueChange={(v) => setTargetProgramId(v ? Number(v) : null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a program" />
            </SelectTrigger>

            <SelectContent>
              {programs.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  {p.school} {p.sport} {p.level} ({p.year})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>

          <Button
            onClick={handleDuplicate}
            disabled={!targetProgramId || loading}
          >
            {loading ? "Duplicating..." : "Duplicate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
