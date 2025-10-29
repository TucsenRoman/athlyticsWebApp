import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Bell, Plus, Pencil, Trash2 } from "lucide-react";
import { format, parseISO, addDays, addMonths, isAfter, isBefore, startOfDay } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useUndoToast } from "@/hooks/use-undo-toast";

const TIMEZONE = "America/Chicago";

interface Reminder {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  time: string | null;
  recurrence: string | null;
  completed: boolean;
  created_at: string;
  coach_id: string;
}

const RemindersCard = () => {
  const navigate = useNavigate();
  const { showUndoToast } = useUndoToast();
  const [todayCount, setTodayCount] = useState(0);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reminderToDelete, setReminderToDelete] = useState<Reminder | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    due_date: format(toZonedTime(new Date(), TIMEZONE), "yyyy-MM-dd"),
    time: "",
    recurrence: "None",
  });

  useEffect(() => {
    fetchReminders();

    const channel = supabase
      .channel("reminders-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "reminders" }, () => {
        fetchReminders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchReminders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const now = toZonedTime(new Date(), TIMEZONE);
      const today = format(now, "yyyy-MM-dd");
      const threeDaysFromNow = format(addDays(now, 3), "yyyy-MM-dd");

      const { data, error } = await supabase
        .from("reminders")
        .select("*")
        .eq("coach_id", user.id)
        .eq("completed", false)
        .lte("due_date", threeDaysFromNow)
        .order("due_date", { ascending: true })
        .order("time", { ascending: true, nullsFirst: false });

      if (error) throw error;

      const filtered = (data || []).slice(0, 5);
      setReminders(filtered);

      // Count reminders that are due today or overdue (completed = false is already filtered)
      const todayReminders = (data || []).filter((r) => {
        if (!r.due_date) return false;
        return r.due_date <= today;
      });
      setTodayCount(todayReminders.length);
    } catch (error) {
      console.error("Error fetching reminders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (reminder: Reminder) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from("reminders")
        .update({ completed: true })
        .eq("id", reminder.id);

      let newReminderId: string | null = null;

      if (reminder.recurrence && reminder.recurrence !== "None") {
        let nextDueDate: Date;
        const currentDueDate = parseISO(reminder.due_date || format(new Date(), "yyyy-MM-dd"));

        if (reminder.recurrence === "Daily") {
          nextDueDate = addDays(currentDueDate, 1);
        } else if (reminder.recurrence === "Weekly") {
          nextDueDate = addDays(currentDueDate, 7);
        } else if (reminder.recurrence === "Monthly") {
          nextDueDate = addMonths(currentDueDate, 1);
        } else {
          nextDueDate = currentDueDate;
        }

        const { data } = await supabase.from("reminders").insert({
          title: reminder.title,
          description: reminder.description,
          due_date: format(nextDueDate, "yyyy-MM-dd"),
          time: reminder.time,
          recurrence: reminder.recurrence,
          coach_id: user.id,
          completed: false,
        }).select();
        
        if (data && data[0]) {
          newReminderId = data[0].id;
        }
      }

      fetchReminders();
      
      showUndoToast({
        message: "Reminder completed!",
        onUndo: async () => {
          await supabase
            .from("reminders")
            .update({ completed: false })
            .eq("id", reminder.id);
          
          if (newReminderId) {
            await supabase
              .from("reminders")
              .delete()
              .eq("id", newReminderId);
          }
          
          fetchReminders();
        },
      });
    } catch (error) {
      console.error("Error completing reminder:", error);
      toast.error("Failed to complete reminder");
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (editingReminder) {
        // Update existing reminder
        await supabase
          .from("reminders")
          .update({
            title: formData.title,
            description: formData.description || null,
            due_date: formData.due_date,
            time: formData.time || null,
            recurrence: formData.recurrence === "None" ? null : formData.recurrence,
          })
          .eq("id", editingReminder.id);

        toast.success("Reminder updated!");
      } else {
        // Insert new reminder
        await supabase.from("reminders").insert({
          title: formData.title,
          description: formData.description || null,
          due_date: formData.due_date,
          time: formData.time || null,
          recurrence: formData.recurrence === "None" ? null : formData.recurrence,
          coach_id: user.id,
          completed: false,
        });

        toast.success("Reminder added!");
      }

      setFormData({
        title: "",
        description: "",
        due_date: format(toZonedTime(new Date(), TIMEZONE), "yyyy-MM-dd"),
        time: "",
        recurrence: "None",
      });
      setEditingReminder(null);
      setDialogOpen(false);
      fetchReminders();
    } catch (error) {
      console.error("Error saving reminder:", error);
      toast.error("Failed to save reminder");
    }
  };

  const handleEdit = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setFormData({
      title: reminder.title,
      description: reminder.description || "",
      due_date: reminder.due_date || format(toZonedTime(new Date(), TIMEZONE), "yyyy-MM-dd"),
      time: reminder.time || "",
      recurrence: reminder.recurrence || "None",
    });
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!reminderToDelete) return;

    const deletedReminder = { ...reminderToDelete };

    try {
      await supabase
        .from("reminders")
        .delete()
        .eq("id", reminderToDelete.id);

      setReminderToDelete(null);
      setDeleteDialogOpen(false);
      fetchReminders();

      showUndoToast({
        message: "Reminder deleted!",
        onUndo: async () => {
          const { id, created_at, ...reminderData } = deletedReminder;
          await supabase.from("reminders").insert(reminderData);
          fetchReminders();
        },
      });
    } catch (error) {
      console.error("Error deleting reminder:", error);
      toast.error("Failed to delete reminder");
    }
  };

  const isOverdue = (reminder: Reminder) => {
    if (!reminder.due_date) return false;
    const now = toZonedTime(new Date(), TIMEZONE);
    const today = startOfDay(now);
    const dueDate = startOfDay(parseISO(reminder.due_date));
    return isBefore(dueDate, today);
  };

  const hasOverdueReminders = reminders.some(r => isOverdue(r));

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reminders</CardTitle>
            <div className="relative">
              <Bell className="h-4 w-4 text-primary" />
              {hasOverdueReminders && (
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-destructive rounded-full animate-pulse" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : todayCount > 0 ? `${todayCount} today` : "All clear ✅"}
            </div>
          </CardContent>
        </Card>
      </PopoverTrigger>
      <PopoverContent className="w-96" align="start">
        <div className="space-y-4">
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {reminders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No upcoming reminders</p>
            ) : (
              reminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className={`group flex items-start gap-3 p-3 rounded-md border transition-opacity ${
                    isOverdue(reminder) ? "border-l-4 border-l-destructive" : ""
                  } ${reminder.completed ? "opacity-50" : ""}`}
                >
                  <Checkbox
                    checked={reminder.completed}
                    onCheckedChange={() => handleToggleComplete(reminder)}
                    className="mt-1"
                  />
                  <div className="flex-1 space-y-1">
                    <div className="font-medium text-sm">{reminder.title}</div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {reminder.due_date && (
                        <span>{format(parseISO(reminder.due_date), "MMM d")}</span>
                      )}
                      {reminder.time && <span>{reminder.time}</span>}
                      {reminder.recurrence && reminder.recurrence !== "None" && (
                        <Badge variant="outline" className="text-xs">
                          {reminder.recurrence}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleEdit(reminder)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      onClick={() => {
                        setReminderToDelete(reminder);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="flex items-center justify-between pt-2 border-t">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingReminder ? "Edit Reminder" : "Add Reminder"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Reminder title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Optional description"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="due_date">Due Date</Label>
                      <Input
                        id="due_date"
                        type="date"
                        value={formData.due_date}
                        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="time">Time</Label>
                      <Input
                        id="time"
                        type="time"
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="recurrence">Repeats</Label>
                    <Select
                      value={formData.recurrence}
                      onValueChange={(value) => setFormData({ ...formData, recurrence: value })}
                    >
                      <SelectTrigger id="recurrence">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="None">None</SelectItem>
                        <SelectItem value="Daily">Daily</SelectItem>
                        <SelectItem value="Weekly">Weekly</SelectItem>
                        <SelectItem value="Monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleSubmit} className="w-full">
                    {editingReminder ? "Update Reminder" : "Add Reminder"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setPopoverOpen(false);
              }}
            >
              View All →
            </Button>
          </div>
        </div>
      </PopoverContent>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this reminder?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Popover>
  );
};

export default RemindersCard;
