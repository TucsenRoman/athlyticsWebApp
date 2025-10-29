import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Repeat } from "lucide-react";
import { format, isPast, parseISO, addDays, addWeeks, addMonths } from "date-fns";

interface Reminder {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  time: string | null;
  recurrence: string | null;
  completed: boolean;
  created_at: string;
}

const RemindersList = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    due_date: format(new Date(), "yyyy-MM-dd"),
    time: "",
    recurrence: "None",
  });
  const { toast } = useToast();

  const fetchReminders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("reminders")
        .select("*")
        .eq("coach_id", user.id)
        .order("due_date", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: true });

      if (error) throw error;
      setReminders(data || []);
    } catch (error) {
      console.error("Error fetching reminders:", error);
      toast({
        title: "Error",
        description: "Failed to load reminders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (editingReminder) {
        const { error } = await supabase
          .from("reminders")
          .update({
            title: formData.title,
            description: formData.description || null,
            due_date: formData.due_date || null,
            time: formData.time || null,
            recurrence: formData.recurrence || "None",
          })
          .eq("id", editingReminder.id);

        if (error) throw error;
        toast({ title: "Success", description: "Reminder updated" });
      } else {
        const { error } = await supabase
          .from("reminders")
          .insert({
            coach_id: user.id,
            title: formData.title,
            description: formData.description || null,
            due_date: formData.due_date || null,
            time: formData.time || null,
            recurrence: formData.recurrence || "None",
          });

        if (error) throw error;
        toast({ title: "Success", description: "Reminder created" });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchReminders();
    } catch (error) {
      console.error("Error saving reminder:", error);
      toast({
        title: "Error",
        description: "Failed to save reminder",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("reminders")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Success", description: "Reminder deleted" });
      fetchReminders();
    } catch (error) {
      console.error("Error deleting reminder:", error);
      toast({
        title: "Error",
        description: "Failed to delete reminder",
        variant: "destructive",
      });
    }
  };

  const handleToggleComplete = async (reminder: Reminder) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const newCompletedStatus = !reminder.completed;

      // If marking as complete and it's recurring, create next occurrence
      if (newCompletedStatus && reminder.recurrence && reminder.recurrence !== "None" && reminder.due_date) {
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

        // Create new occurrence
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

      // Mark current reminder as complete
      const { error } = await supabase
        .from("reminders")
        .update({ completed: newCompletedStatus })
        .eq("id", reminder.id);

      if (error) throw error;
      fetchReminders();
    } catch (error) {
      console.error("Error updating reminder:", error);
      toast({
        title: "Error",
        description: "Failed to update reminder",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({ 
      title: "", 
      description: "", 
      due_date: format(new Date(), "yyyy-MM-dd"),
      time: "",
      recurrence: "None",
    });
    setEditingReminder(null);
  };

  const openEditDialog = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setFormData({
      title: reminder.title,
      description: reminder.description || "",
      due_date: reminder.due_date || format(new Date(), "yyyy-MM-dd"),
      time: reminder.time || "",
      recurrence: reminder.recurrence || "None",
    });
    setIsDialogOpen(true);
  };

  const isOverdue = (dueDate: string | null, completed: boolean) => {
    if (!dueDate || completed) return false;
    return isPast(parseISO(dueDate)) && format(parseISO(dueDate), "yyyy-MM-dd") !== format(new Date(), "yyyy-MM-dd");
  };

  if (loading) {
    return <div className="text-center py-8">Loading reminders...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Reminders</h3>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Reminder
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingReminder ? "Edit Reminder" : "Add New Reminder"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
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
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingReminder ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {reminders.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No reminders yet. Click "Add Reminder" to create one.
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Done</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reminders.map((reminder) => (
                <TableRow
                  key={reminder.id}
                  className={`${
                    reminder.completed ? "opacity-50" : ""
                  } ${
                    isOverdue(reminder.due_date, reminder.completed) ? "bg-destructive/10" : ""
                  }`}
                >
                  <TableCell>
                    <Checkbox
                      checked={reminder.completed}
                      onCheckedChange={() => handleToggleComplete(reminder)}
                    />
                  </TableCell>
                  <TableCell className={reminder.completed ? "line-through" : ""}>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {reminder.title}
                        {reminder.recurrence && reminder.recurrence !== "None" && (
                          <Repeat className="w-3 h-3 text-muted-foreground" />
                        )}
                      </div>
                      {reminder.description && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {reminder.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {reminder.due_date ? (
                      <div className="flex flex-col">
                        <span className={isOverdue(reminder.due_date, reminder.completed) ? "text-destructive font-medium" : ""}>
                          {format(parseISO(reminder.due_date), "MMM d, yyyy")}
                        </span>
                        {reminder.time && (
                          <span className="text-sm text-muted-foreground">
                            {reminder.time}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">No date</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openEditDialog(reminder)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(reminder.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default RemindersList;