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
    recurrence: "None"
  });
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const fetchReminders = async () => {
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) return;
      const {
        data,
        error
      } = await supabase.from("reminders").select("*").eq("coach_id", user.id).eq("completed", false).order("due_date", {
        ascending: true,
        nullsFirst: false
      }).order("time", {
        ascending: true,
        nullsFirst: false
      });
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
    const channel = supabase.channel("reminders-changes").on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "reminders"
    }, () => {
      fetchReminders();
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  const handleQuickAdd = async () => {
    if (!quickAddData.title.trim()) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive"
      });
      return;
    }
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) return;
      const {
        error
      } = await supabase.from("reminders").insert({
        coach_id: user.id,
        title: quickAddData.title,
        description: quickAddData.description || null,
        due_date: quickAddData.due_date || null,
        time: quickAddData.time || null,
        recurrence: quickAddData.recurrence || "None",
        completed: false
      });
      if (error) throw error;
      toast({
        title: "Saved!"
      });
      setQuickAddData({
        title: "",
        description: "",
        due_date: format(toZonedTime(new Date(), TIMEZONE), "yyyy-MM-dd"),
        time: "",
        recurrence: "None"
      });
    } catch (error) {
      console.error("Error adding reminder:", error);
      toast({
        title: "Error",
        description: "Failed to add reminder",
        variant: "destructive"
      });
    }
  };
  const handleToggleComplete = async (reminder: Reminder) => {
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
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
          completed: false
        });
      }

      // Mark current as complete
      const {
        error
      } = await supabase.from("reminders").update({
        completed: true
      }).eq("id", reminder.id);
      if (error) throw error;
      toast({
        title: "Saved!"
      });
    } catch (error) {
      console.error("Error completing reminder:", error);
      toast({
        title: "Error",
        description: "Failed to complete reminder",
        variant: "destructive"
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
      const {
        error
      } = await supabase.from("reminders").update({
        due_date: format(newDueDate, "yyyy-MM-dd"),
        time: snoozeType === "hour" && reminder.time ? format(newDueDate, "HH:mm") : reminder.time
      }).eq("id", reminder.id);
      if (error) throw error;
      toast({
        title: "Saved!"
      });
    } catch (error) {
      console.error("Error snoozing reminder:", error);
      toast({
        title: "Error",
        description: "Failed to snooze reminder",
        variant: "destructive"
      });
    }
  };
  const getMostRelevantReminders = () => {
    const now = toZonedTime(new Date(), TIMEZONE);
    const today = startOfDay(now);
    const threeDaysFromNow = addDays(now, 3);
    return reminders.filter(r => {
      if (!r.due_date) return false;
      const dueDate = toZonedTime(parseISO(r.due_date), TIMEZONE);
      // Include overdue, today, and upcoming within 3 days
      return isBefore(dueDate, threeDaysFromNow) || isWithinInterval(dueDate, {
        start: today,
        end: threeDaysFromNow
      });
    }).slice(0, 5);
  };
  const isReminderOverdue = (reminder: Reminder) => {
    if (!reminder.due_date) return false;
    const now = toZonedTime(new Date(), TIMEZONE);
    const today = startOfDay(now);
    const dueDate = toZonedTime(parseISO(reminder.due_date), TIMEZONE);
    return isBefore(dueDate, today);
  };
  const isReminderToday = (reminder: Reminder) => {
    if (!reminder.due_date) return false;
    const dueDate = toZonedTime(parseISO(reminder.due_date), TIMEZONE);
    return isToday(dueDate);
  };
  const ReminderCard = ({
    reminder
  }: {
    reminder: Reminder;
  }) => {
    const isOverdue = isReminderOverdue(reminder);
    const isTodayReminder = isReminderToday(reminder);
    return <div className={`group relative h-32 p-4 rounded-lg border transition-all duration-200 hover:shadow-md hover:scale-[1.02] ${reminder.completed ? "opacity-50" : ""} ${isOverdue ? "border-l-4 border-l-destructive bg-destructive/5" : ""} ${isTodayReminder ? "bg-accent/30" : "bg-card"}`}>
        <div className="flex flex-col h-full">
          {/* Top row: checkbox and badges */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <Checkbox checked={false} onCheckedChange={() => handleToggleComplete(reminder)} className="mt-0.5" />
            <div className="flex gap-1">
              {reminder.recurrence && reminder.recurrence !== "None" && <Badge variant="outline" className="h-5 px-1.5 text-xs">
                  <Repeat className="w-3 h-3" />
                </Badge>}
            </div>
          </div>

          {/* Title */}
          <h4 className="font-medium text-sm line-clamp-2 mb-2">{reminder.title}</h4>

          {/* Date and time */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-auto">
            {reminder.due_date && <span className={isOverdue ? "text-destructive font-medium" : ""}>
                {format(parseISO(reminder.due_date), "MMM d")}
              </span>}
            {reminder.time && <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {reminder.time}
              </span>}
          </div>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-background/95 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-4 flex flex-col gap-2">
          <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
            {reminder.description || "No description"}
          </p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="w-full">
                Options
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="z-50">
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
      </div>;
  };
  const relevantReminders = getMostRelevantReminders();
  if (loading) {
    return <div className="text-center py-8">Loading reminders...</div>;
  }
  return <Card>
      
      
    </Card>;
};
export default RemindersPanel;