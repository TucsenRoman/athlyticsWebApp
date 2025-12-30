import CardFormatter from "@/components/layout/CardFormatter";
import { StickyNote, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/actions/button";
import { Textarea } from "@/components/ui/forms/textarea";

interface NotesCardProps {
  // real props tomorrow
}

export default function NotesCardUI(_: NotesCardProps) {
  // TEMP MOCK DATA — replace tomorrow
  const mockExpanded = true;
  const mockNotes = [
    { id: "1", note: "Reminder: Update meet schedule." },
    { id: "2", note: "Athlete A needs follow-up on injury report." },
  ];

  return (
    <CardFormatter
      title="Notes"
      icon={StickyNote}
      onClick={undefined} // notes card isn’t a navigation card
      actions={
        <Button
          size="sm"
          variant="ghost"
          className="text-muted-foreground"
        >
          {mockExpanded ? "Collapse" : "Expand"}
        </Button>
      }
    >
      <div className="space-y-4 w-full">

        {/* NEW NOTE INPUT AREA */}
        {mockExpanded && (
          <div className="space-y-3">
            <Textarea
              placeholder="Write a quick note..."
              className="min-h-[80px]"
            />

            <Button className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Note
            </Button>
          </div>
        )}

        {/* NOTES LIST */}
        {mockNotes.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No notes yet.
          </p>
        ) : (
          <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
            {mockNotes.map((note) => (
              <div
                key={note.id}
                className="p-3 border rounded-md bg-muted/40 flex items-start justify-between gap-2"
              >
                <p className="text-sm leading-tight whitespace-pre-wrap flex-1">
                  {note.note}
                </p>

                <button className="text-muted-foreground hover:text-destructive p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </CardFormatter>
  );
}
