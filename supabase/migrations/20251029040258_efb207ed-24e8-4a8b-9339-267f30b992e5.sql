-- Create attendance table
CREATE TABLE public.attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  athlete_id UUID NOT NULL REFERENCES public.athletes(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Present', 'Absent', 'Excused')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(athlete_id, date)
);

-- Enable Row Level Security
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Create policies for coach access
CREATE POLICY "Coaches can view own athletes attendance"
ON public.attendance
FOR SELECT
USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can insert own athletes attendance"
ON public.attendance
FOR INSERT
WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Coaches can update own athletes attendance"
ON public.attendance
FOR UPDATE
USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can delete own athletes attendance"
ON public.attendance
FOR DELETE
USING (auth.uid() = coach_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_attendance_updated_at
BEFORE UPDATE ON public.attendance
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_attendance_date ON public.attendance(date);
CREATE INDEX idx_attendance_athlete_id ON public.attendance(athlete_id);
CREATE INDEX idx_attendance_coach_id ON public.attendance(coach_id);