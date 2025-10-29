import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

const TodaysPlanCard = () => {
  return (
    <Card className="hover:shadow-md transition-shadow h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Today's Plan</CardTitle>
        <Calendar className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">No events scheduled</div>
      </CardContent>
    </Card>
  );
};

export default TodaysPlanCard;
