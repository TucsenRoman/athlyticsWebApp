import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Plus } from "lucide-react";

const TodaysPlanCard = () => {
  return (
    <Card className="hover:shadow-md transition-all hover:scale-[1.02] duration-200 h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Today's Plan</CardTitle>
        <Calendar className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="text-sm text-muted-foreground">No events scheduled</div>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-4 w-full gap-2 hover-scale"
        >
          <Plus className="h-3 w-3" />
          Add Event
        </Button>
      </CardContent>
    </Card>
  );
};

export default TodaysPlanCard;
