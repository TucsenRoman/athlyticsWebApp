import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CloudSun } from "lucide-react";

export default function WeatherCard() {
  return (
    <Card className="h-full bg-card border-border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CloudSun className="w-5 h-5 text-primary" />
          Weather
        </CardTitle>
      </CardHeader>

      <CardContent className="text-muted-foreground text-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xl font-bold text-foreground">--°</p>
            <p className="text-xs">---</p>
          </div>
          <div className="w-12 h-12 bg-muted/40 rounded-full"></div>
        </div>

        <div className="h-4 bg-muted/50 rounded-md w-full"></div>
        <div className="h-4 bg-muted/50 rounded-md w-3/5"></div>
      </CardContent>
    </Card>
  );
}
