import CardFormatter from "@/components/cards/CardFormatter";
import { Trophy } from "lucide-react";

export default function PerformanceSummaryCard() {
  return (
    <CardFormatter
      title="Performance Spotlight"
      icon={Trophy}
      onClick={undefined} // add navigation later if needed
    >
      <div className="w-full space-y-4 text-sm">

        {/* Featured athlete bubble */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-muted/40" />

          <div className="flex flex-col gap-1">
            <div className="h-4 w-24 rounded-md bg-muted/50" />
            <div className="h-3 w-16 rounded-md bg-muted/40" />
          </div>
        </div>

        {/* Stat lines */}
        <div className="h-4 w-full rounded-md bg-muted/50" />
        <div className="h-4 w-5/6 rounded-md bg-muted/50" />
        <div className="h-4 w-3/4 rounded-md bg-muted/50" />
      </div>
    </CardFormatter>
  );
}
