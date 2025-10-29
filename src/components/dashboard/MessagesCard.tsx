import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

const MessagesCard = () => {
  return (
    <Card className="hover:shadow-md transition-shadow h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Messages</CardTitle>
        <MessageSquare className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">0</div>
        <p className="text-xs text-muted-foreground mt-1">No new messages</p>
      </CardContent>
    </Card>
  );
};

export default MessagesCard;
