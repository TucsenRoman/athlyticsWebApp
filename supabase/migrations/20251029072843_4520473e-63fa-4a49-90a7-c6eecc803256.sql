-- Create attendance submissions table to track when attendance is officially submitted
CREATE TABLE IF NOT EXISTS public.attendance_submissions (
  coach_id UUID NOT NULL,
  date DATE NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (coach_id, date)
);

ALTER TABLE public.attendance_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches can view own attendance submissions" ON public.attendance_submissions
  FOR SELECT USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can insert own attendance submissions" ON public.attendance_submissions
  FOR INSERT WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Coaches can update own attendance submissions" ON public.attendance_submissions
  FOR UPDATE USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can delete own attendance submissions" ON public.attendance_submissions
  FOR DELETE USING (auth.uid() = coach_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_attendance_submissions_coach_date ON public.attendance_submissions(coach_id, date);