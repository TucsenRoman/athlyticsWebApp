import { useEffect, useState } from "react"
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
import type { TablesUpdate } from "@/types/supabase"

interface MoveFileProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fileId: string
}

export default function MoveFile({ open, onOpenChange, fileId }: MoveFileProps) {
  const [programs, setPrograms] = useState<any[]>([])
  const [selectedProgramId, setSelectedProgramId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchPrograms = async () => {
      const { data: auth } = await supabase.auth.getUser()
      const user = auth?.user
      if (!user) return

      const { data, error } = await supabase
        .from("programs")
        .select("id, sport, level, gender, school, year")
        .eq("user_id", user.id)
        .order("year", { ascending: false })

      if (error) console.error(error)
      else setPrograms(data || [])
    }

    if (open) fetchPrograms()
  }, [open])

  const handleMove = async () => {
    if (!selectedProgramId || !fileId) return

    setLoading(true)
    try {
      const updatePayload: TablesUpdate<"files"> = {
        program_id: selectedProgramId,
      }

      const { error } = await supabase
        .from("files")
        .update(updatePayload)
        .eq("id", fileId)

      if (error) throw error

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
          <DialogTitle>Move File to Another Program</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Select
            onValueChange={(v) => setSelectedProgramId(v ? Number(v) : null)}
            value={selectedProgramId ? String(selectedProgramId) : ""}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a program..." />
            </SelectTrigger>

            <SelectContent>
              {programs.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  {p.school} — {p.sport} ({p.level}, {p.gender}, {p.year})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleMove} disabled={!selectedProgramId || loading}>
            {loading ? "Moving..." : "Move File"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
