import CardFormatter from "@/features/radar/components/CardFormatter";
import { Flag } from "lucide-react";

export default function PostMeetSummaryCard() {
  return (
    <CardFormatter
      title="Post-Meet Summary"
      icon={Flag}
      onClick={undefined} // add navigation when feature is built
    >
      <div className="w-full space-y-4 text-sm text-muted-foreground">

        {/* Meet name skeleton */}
        <div className="h-5 w-3/4 rounded-md bg-muted/50" />

        {/* Quick stats */}
        <div className="space-y-2">
          <div className="h-4 w-full rounded-md bg-muted/50" />
          <div className="h-4 w-4/5 rounded-md bg-muted/50" />
        </div>

        {/* Highlight bar */}
        <div className="h-4 w-2/3 rounded-md bg-muted/50" />

        {/* Call-to-action button placeholder */}
        <div className="h-9 w-full rounded-md bg-muted/40" />
      </div>
    </CardFormatter>
  );
}
