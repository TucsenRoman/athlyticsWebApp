import CardFormatter from "@/components/cards/CardFormatter";
import { CalendarDays } from "lucide-react";

export default function CalendarCard() {
  return (
    <CardFormatter
      title="Upcoming Events"
      icon={CalendarDays}
      onClick={undefined} // add navigation later if needed
    >
      <div className="w-full space-y-4 text-sm text-muted-foreground">

        {/* Event 1 */}
        <div className="space-y-1">
          <div className="h-4 w-3/4 rounded-md bg-muted/50" />
          <div className="h-3 w-1/2 rounded-md bg-muted/40" />
        </div>

        {/* Event 2 */}
        <div className="space-y-1">
          <div className="h-4 w-5/6 rounded-md bg-muted/50" />
          <div className="h-3 w-2/3 rounded-md bg-muted/40" />
        </div>

        {/* Event 3 */}
        <div className="space-y-1">
          <div className="h-4 w-4/5 rounded-md bg-muted/50" />
          <div className="h-3 w-1/3 rounded-md bg-muted/40" />
        </div>

      </div>
    </CardFormatter>
  );
}
