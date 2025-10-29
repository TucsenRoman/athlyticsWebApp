-- Add time and recurrence columns to reminders table
ALTER TABLE public.reminders
ADD COLUMN time TIME,
ADD COLUMN recurrence TEXT CHECK (recurrence IN ('None', 'Daily', 'Weekly', 'Monthly'));