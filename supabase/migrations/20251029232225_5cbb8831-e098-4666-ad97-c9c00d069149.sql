-- Create programs table for managing multiple programs per coach
CREATE TABLE public.programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL,
  name TEXT NOT NULL,
  sport TEXT NOT NULL,
  level TEXT NOT NULL,
  gender TEXT NOT NULL,
  season_start_date DATE,
  season_end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

-- Create policies for programs
CREATE POLICY "Coaches can view own programs"
  ON public.programs FOR SELECT
  USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can insert own programs"
  ON public.programs FOR INSERT
  WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Coaches can update own programs"
  ON public.programs FOR UPDATE
  USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can delete own programs"
  ON public.programs FOR DELETE
  USING (auth.uid() = coach_id);

-- Add program_id to athletes table
ALTER TABLE public.athletes ADD COLUMN program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE;

-- Add program_id to uniforms table
ALTER TABLE public.uniforms ADD COLUMN program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE;

-- Add program_id to lockers table
ALTER TABLE public.lockers ADD COLUMN program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE;

-- Add program_id to attendance table
ALTER TABLE public.attendance ADD COLUMN program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE;

-- Add program_id to attendance_submissions table
ALTER TABLE public.attendance_submissions ADD COLUMN program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE;

-- Add program_id to meets table
ALTER TABLE public.meets ADD COLUMN program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE;

-- Add program_id to results table
ALTER TABLE public.results ADD COLUMN program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE;

-- Add program_id to reminders table
ALTER TABLE public.reminders ADD COLUMN program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE;

-- Add trigger for programs updated_at
CREATE TRIGGER update_programs_updated_at
  BEFORE UPDATE ON public.programs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();