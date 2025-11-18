import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";

export default function CalendarCard() {
  return (
    <Card className="bg-card border-border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-primary" />
          Upcoming Events
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 text-sm text-muted-foreground">

        {/* Event 1 */}
        <div className="space-y-1">
          <div className="h-4 bg-muted/50 rounded-md w-3/4"></div>
          <div className="h-3 bg-muted/40 rounded-md w-1/2"></div>
        </div>

        {/* Event 2 */}
        <div className="space-y-1">
          <div className="h-4 bg-muted/50 rounded-md w-5/6"></div>
          <div className="h-3 bg-muted/40 rounded-md w-2/3"></div>
        </div>

        {/* Event 3 */}
        <div className="space-y-1">
          <div className="h-4 bg-muted/50 rounded-md w-4/5"></div>
          <div className="h-3 bg-muted/40 rounded-md w-1/3"></div>
        </div>
      </CardContent>
    </Card>
  );
}
