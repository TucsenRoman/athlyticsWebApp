import { StickyNote, Plus, X } from "lucide-react";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface NotesCardProps {
  // You can add real props tomorrow
}

export default function NotesCardUI(_: NotesCardProps) {
  // TEMP MOCK DATA — delete tomorrow
  const mockExpanded = true;
  const mockNotes = [
    { id: "1", note: "Reminder: Update meet schedule." },
    { id: "2", note: "Athlete A needs follow-up on injury report." },
  ];

  return (
    <Card className="h-full bg-card border-border shadow-sm h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <StickyNote className="w-5 h-5 text-primary" />
            Notes
          </span>

          {/* This will be hooked up later */}
          <Button
            size="sm"
            variant="ghost"
            className="text-muted-foreground"
          >
            {mockExpanded ? "Collapse" : "Expand"}
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* NEW NOTE INPUT AREA (visible when expanded) */}
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
      </CardContent>
    </Card>
  );
}
