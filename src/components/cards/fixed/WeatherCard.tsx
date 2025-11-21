import CardFormatter from "@/components/cards/CardFormatter";
import { CloudSun } from "lucide-react";

export default function WeatherCard() {
  return (
    <CardFormatter
      title="Weather"
      icon={CloudSun}
      onClick={undefined} // or navigate("/weather") later if needed
    >
      {/* Skeleton-style placeholder content */}
      <div className="flex items-center justify-between w-full">
        <div className="flex flex-col">
          <p className="text-3xl font-bold text-foreground">--°</p>
          <p className="text-xs text-muted-foreground">---</p>
        </div>

        <div className="w-12 h-12 rounded-full bg-muted/40" />
      </div>

      <div className="mt-4 space-y-2 w-full">
        <div className="h-3 w-full rounded-md bg-muted/50" />
        <div className="h-3 w-3/5 rounded-md bg-muted/50" />
      </div>
    </CardFormatter>
  );
}
