import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Send } from "lucide-react";

const MessagesCard = () => {
  return (
    <Card className="hover:shadow-md transition-all hover:scale-[1.02] duration-200 h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Messages</CardTitle>
        <MessageSquare className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <div>
          <div className="text-2xl font-bold">0</div>
          <p className="text-xs text-muted-foreground mt-1">No new messages</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-4 w-full gap-2 hover-scale"
        >
          <Send className="h-3 w-3" />
          Send Message
        </Button>
      </CardContent>
    </Card>
  );
};

export default MessagesCard;
