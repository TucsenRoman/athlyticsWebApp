import CardFormatter from "@/components/cards/CardFormatter";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  MapPin,
  Clock,
  Users,
  ChevronRight,
} from "lucide-react";

export default function MeetDayCard() {
  return (
    <CardFormatter
      title="Meet Day"
      icon={CalendarDays}
      actions={
        <Button
          size="sm"
          variant="ghost"
          className="text-muted-foreground hover:text-foreground"
        >
          View All
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      }
      onClick={undefined} // not tappable as a whole card
    >
      <div className="w-full space-y-4">

        {/* Meet Shell */}
        <div className="p-4 rounded-lg bg-muted/40 border border-border flex flex-col gap-3">

          {/* Meet Name */}
          <div>
            <p className="text-base font-semibold">No Meet Loaded</p>
            <p className="text-xs text-muted-foreground">
              Connect meet data soon.
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3">

            {/* Location */}
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Location TBD</span>
            </div>

            {/* Time */}
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">—</span>
            </div>

            {/* Teams */}
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">—</span>
            </div>

            {/* Action */}
            <div className="col-span-2 pt-1">
              <Button variant="outline" disabled className="w-full text-sm">
                Open Meet Dashboard (Coming Soon)
              </Button>
            </div>

          </div>
        </div>
      </div>
    </CardFormatter>
  );
}
