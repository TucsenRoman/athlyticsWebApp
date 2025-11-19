import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Trophy } from "lucide-react";

export default function PerformanceSummaryCard() {
  return (
    <Card className="h-full bg-card border-border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Performance Spotlight
        </CardTitle>
      </CardHeader>

      <CardContent className="text-sm space-y-4">
        {/* Featured athlete bubble */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-muted/40"></div>
          <div>
            <div className="h-4 bg-muted/50 rounded-md w-24"></div>
            <div className="h-3 bg-muted/40 rounded-md w-16 mt-1"></div>
          </div>
        </div>

        {/* Stats placeholders */}
        <div className="h-4 bg-muted/50 rounded-md w-full"></div>
        <div className="h-4 bg-muted/50 rounded-md w-5/6"></div>
        <div className="h-4 bg-muted/50 rounded-md w-3/4"></div>
      </CardContent>
    </Card>
  );
}
