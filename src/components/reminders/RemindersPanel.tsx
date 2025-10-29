import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Repeat, Clock, MoreVertical, Plus } from "lucide-react";
import { format, parseISO, addDays, addWeeks, addMonths, addHours, startOfDay, endOfDay, isToday, isBefore, isWithinInterval } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import { useNavigate } from "react-router-dom";

interface Reminder {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  time: string | null;
  recurrence: string | null;
  completed: boolean;
}

const TIMEZONE = "America/Chicago";

const RemindersPanel = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickAddData, setQuickAddData] = useState({
    title: "",
    description: "",
    due_date: format(toZonedTime(new Date(), TIMEZONE), "yyyy-MM-dd"),
    time: "",
    recurrence: "None",
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchReminders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("reminders")
        .select("*")
        .eq("coach_id", user.id)
        .eq("completed", false)
        .order("due_date", { ascending: true, nullsFirst: false })
        .order("time", { ascending: true, nullsFirst: false });

      if (error) throw error;
      setReminders(data || []);
    } catch (error) {
      console.error("Error fetching reminders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();

    const channel = supabase
      .channel("reminders-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "reminders",
        },
        () => {
          fetchReminders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleQuickAdd = async () => {
    if (!quickAddData.title.trim()) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("reminders").insert({
        coach_id: user.id,
        title: quickAddData.title,
        description: quickAddData.description || null,
        due_date: quickAddData.due_date || null,
        time: quickAddData.time || null,
        recurrence: quickAddData.recurrence || "None",
        completed: false,
      });

      if (error) throw error;

      toast({ title: "Saved!" });
      setQuickAddData({
        title: "",
        description: "",
        due_date: format(toZonedTime(new Date(), TIMEZONE), "yyyy-MM-dd"),
        time: "",
        recurrence: "None",
      });
    } catch (error) {
      console.error("Error adding reminder:", error);
      toast({
        title: "Error",
        description: "Failed to add reminder",
        variant: "destructive",
      });
    }
  };

  const handleToggleComplete = async (reminder: Reminder) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // If it's recurring, create next occurrence
      if (reminder.recurrence && reminder.recurrence !== "None" && reminder.due_date) {
        const currentDueDate = parseISO(reminder.due_date);
        let nextDueDate: Date;

        switch (reminder.recurrence) {
          case "Daily":
            nextDueDate = addDays(currentDueDate, 1);
            break;
          case "Weekly":
            nextDueDate = addWeeks(currentDueDate, 1);
            break;
          case "Monthly":
            nextDueDate = addMonths(currentDueDate, 1);
            break;
          default:
            nextDueDate = currentDueDate;
        }

        await supabase.from("reminders").insert({
          coach_id: user.id,
          title: reminder.title,
          description: reminder.description,
          due_date: format(nextDueDate, "yyyy-MM-dd"),
          time: reminder.time,
          recurrence: reminder.recurrence,
          completed: false,
        });
      }

      // Mark current as complete
      const { error } = await supabase
        .from("reminders")
        .update({ completed: true })
        .eq("id", reminder.id);

      if (error) throw error;
      toast({ title: "Saved!" });
    } catch (error) {
      console.error("Error completing reminder:", error);
      toast({
        title: "Error",
        description: "Failed to complete reminder",
        variant: "destructive",
      });
    }
  };

  const handleSnooze = async (reminder: Reminder, snoozeType: "hour" | "day" | "week") => {
    try {
      let newDueDate: Date;
      const now = toZonedTime(new Date(), TIMEZONE);
      
      if (reminder.due_date) {
        const currentDate = parseISO(reminder.due_date);
        const currentTime = reminder.time ? parseISO(`${reminder.due_date}T${reminder.time}`) : currentDate;
        
        switch (snoozeType) {
          case "hour":
            newDueDate = addHours(currentTime, 1);
            break;
          case "day":
            newDueDate = addDays(currentDate, 1);
            break;
          case "week":
            newDueDate = addWeeks(currentDate, 1);
            break;
        }
      } else {
        switch (snoozeType) {
          case "hour":
            newDueDate = addHours(now, 1);
            break;
          case "day":
            newDueDate = addDays(now, 1);
            break;
          case "week":
            newDueDate = addWeeks(now, 1);
            break;
        }
      }

      const { error } = await supabase
        .from("reminders")
        .update({
          due_date: format(newDueDate, "yyyy-MM-dd"),
          time: snoozeType === "hour" && reminder.time ? format(newDueDate, "HH:mm") : reminder.time,
        })
        .eq("id", reminder.id);

      if (error) throw error;
      toast({ title: "Saved!" });
    } catch (error) {
      console.error("Error snoozing reminder:", error);
      toast({
        title: "Error",
        description: "Failed to snooze reminder",
        variant: "destructive",
      });
    }
  };

  const getTodayReminders = () => {
    const now = toZonedTime(new Date(), TIMEZONE);
    return reminders.filter((r) => {
      if (!r.due_date) return false;
      const dueDate = toZonedTime(parseISO(r.due_date), TIMEZONE);
      return isToday(dueDate);
    });
  };

  const getUpcomingReminders = () => {
    const now = toZonedTime(new Date(), TIMEZONE);
    const sevenDaysFromNow = addDays(now, 7);
    return reminders.filter((r) => {
      if (!r.due_date) return false;
      const dueDate = toZonedTime(parseISO(r.due_date), TIMEZONE);
      return !isToday(dueDate) && isWithinInterval(dueDate, { start: addDays(now, 1), end: sevenDaysFromNow });
    });
  };

  const getOverdueReminders = () => {
    const now = toZonedTime(new Date(), TIMEZONE);
    const today = startOfDay(now);
    return reminders.filter((r) => {
      if (!r.due_date) return false;
      const dueDate = toZonedTime(parseISO(r.due_date), TIMEZONE);
      return isBefore(dueDate, today);
    });
  };

  const ReminderRow = ({ reminder, isOverdue = false, isToday = false }: { reminder: Reminder; isOverdue?: boolean; isToday?: boolean }) => (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
        isOverdue ? "border-l-4 border-l-destructive" : ""
      } ${isToday ? "bg-accent/50" : ""}`}
    >
      <Checkbox checked={false} onCheckedChange={() => handleToggleComplete(reminder)} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium truncate">{reminder.title}</span>
          {reminder.recurrence && reminder.recurrence !== "None" && (
            <Badge variant="outline" className="flex items-center gap-1 text-xs">
              <Repeat className="w-3 h-3" />
              {reminder.recurrence}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
          {reminder.due_date && (
            <span className={isOverdue ? "text-destructive font-medium" : ""}>
              {format(parseISO(reminder.due_date), "MMM d")}
            </span>
          )}
          {reminder.time && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {reminder.time}
            </span>
          )}
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleSnooze(reminder, "hour")}>
            Snooze +1 hour
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSnooze(reminder, "day")}>
            Snooze +1 day
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSnooze(reminder, "week")}>
            Snooze +1 week
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  if (loading) {
    return <div className="text-center py-8">Loading reminders...</div>;
  }

  const todayReminders = getTodayReminders();
  const upcomingReminders = getUpcomingReminders();
  const overdueReminders = getOverdueReminders();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Reminders</CardTitle>
          <Button variant="link" onClick={() => navigate("/?tab=reminders")} className="text-sm">
            View all
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Add */}
        <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              placeholder="Title (required)"
              value={quickAddData.title}
              onChange={(e) => setQuickAddData({ ...quickAddData, title: e.target.value })}
            />
            <Input
              type="date"
              value={quickAddData.due_date}
              onChange={(e) => setQuickAddData({ ...quickAddData, due_date: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              type="time"
              value={quickAddData.time}
              onChange={(e) => setQuickAddData({ ...quickAddData, time: e.target.value })}
              placeholder="Time (optional)"
            />
            <Select
              value={quickAddData.recurrence}
              onValueChange={(value) => setQuickAddData({ ...quickAddData, recurrence: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Repeats" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="None">None</SelectItem>
                <SelectItem value="Daily">Daily</SelectItem>
                <SelectItem value="Weekly">Weekly</SelectItem>
                <SelectItem value="Monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleQuickAdd} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>
          <Textarea
            placeholder="Description (optional)"
            value={quickAddData.description}
            onChange={(e) => setQuickAddData({ ...quickAddData, description: e.target.value })}
            rows={2}
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="today" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="today">
              Today ({todayReminders.length})
            </TabsTrigger>
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingReminders.length})
            </TabsTrigger>
            <TabsTrigger value="overdue">
              Overdue ({overdueReminders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-2">
            {todayReminders.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No reminders for today</p>
            ) : (
              todayReminders.map((reminder) => (
                <ReminderRow key={reminder.id} reminder={reminder} isToday />
              ))
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-2">
            {upcomingReminders.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No upcoming reminders</p>
            ) : (
              upcomingReminders.map((reminder) => (
                <ReminderRow key={reminder.id} reminder={reminder} />
              ))
            )}
          </TabsContent>

          <TabsContent value="overdue" className="space-y-2">
            {overdueReminders.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No overdue reminders</p>
            ) : (
              overdueReminders.map((reminder) => (
                <ReminderRow key={reminder.id} reminder={reminder} isOverdue />
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RemindersPanel;
