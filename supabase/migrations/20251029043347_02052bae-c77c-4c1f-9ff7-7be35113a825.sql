-- Create reminders table
CREATE TABLE public.reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- Create policies for coach access
CREATE POLICY "Coaches can view own reminders"
ON public.reminders
FOR SELECT
USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can insert own reminders"
ON public.reminders
FOR INSERT
WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Coaches can update own reminders"
ON public.reminders
FOR UPDATE
USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can delete own reminders"
ON public.reminders
FOR DELETE
USING (auth.uid() = coach_id);