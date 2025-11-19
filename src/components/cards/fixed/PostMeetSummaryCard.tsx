import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Flag } from "lucide-react";

export default function PostMeetSummaryCard() {
  return (
    <Card className="h-full bg-card border-border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flag className="w-5 h-5 text-primary" />
          Post-Meet Summary
        </CardTitle>
      </CardHeader>

      <CardContent className="text-sm space-y-4 text-muted-foreground">
        {/* Top line — meet name */}
        <div className="h-5 bg-muted/50 rounded-md w-3/4"></div>

        {/* Quick stats */}
        <div className="space-y-2">
          <div className="h-4 bg-muted/50 rounded-md w-full"></div>
          <div className="h-4 bg-muted/50 rounded-md w-4/5"></div>
        </div>

        {/* Highlight */}
        <div className="h-4 bg-muted/50 rounded-md w-2/3"></div>

        {/* Button placeholder */}
        <div className="h-9 bg-muted/40 rounded-md w-full"></div>
      </CardContent>
    </Card>
  );
}
