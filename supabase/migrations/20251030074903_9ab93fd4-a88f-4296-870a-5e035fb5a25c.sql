-- Add school and season fields to programs table
ALTER TABLE public.programs 
ADD COLUMN IF NOT EXISTS school text NOT NULL DEFAULT 'Default School',
ADD COLUMN IF NOT EXISTS season_year text NOT NULL DEFAULT '2024-2025';

-- Create index for faster context queries
CREATE INDEX IF NOT EXISTS idx_programs_context ON public.programs(coach_id, school, sport, season_year);

-- Create ledger_headers table for custom headers per program
CREATE TABLE IF NOT EXISTS public.ledger_headers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id uuid NOT NULL,
  coach_id uuid NOT NULL,
  header_id text NOT NULL,
  label text NOT NULL,
  is_hardwired boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(program_id, header_id)
);

-- Enable RLS on ledger_headers
ALTER TABLE public.ledger_headers ENABLE ROW LEVEL SECURITY;

-- Create policies for ledger_headers
CREATE POLICY "Coaches can view own ledger headers"
  ON public.ledger_headers
  FOR SELECT
  USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can insert own ledger headers"
  ON public.ledger_headers
  FOR INSERT
  WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Coaches can update own ledger headers"
  ON public.ledger_headers
  FOR UPDATE
  USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can delete own ledger headers"
  ON public.ledger_headers
  FOR DELETE
  USING (auth.uid() = coach_id);

-- Create athlete_custom_fields table for storing custom field data per athlete
CREATE TABLE IF NOT EXISTS public.athlete_custom_fields (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  athlete_id uuid NOT NULL,
  program_id uuid NOT NULL,
  coach_id uuid NOT NULL,
  field_id text NOT NULL,
  field_value text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(athlete_id, field_id)
);

-- Enable RLS on athlete_custom_fields
ALTER TABLE public.athlete_custom_fields ENABLE ROW LEVEL SECURITY;

-- Create policies for athlete_custom_fields
CREATE POLICY "Coaches can view own athlete custom fields"
  ON public.athlete_custom_fields
  FOR SELECT
  USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can insert own athlete custom fields"
  ON public.athlete_custom_fields
  FOR INSERT
  WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Coaches can update own athlete custom fields"
  ON public.athlete_custom_fields
  FOR UPDATE
  USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can delete own athlete custom fields"
  ON public.athlete_custom_fields
  FOR DELETE
  USING (auth.uid() = coach_id);

-- Add trigger for updated_at on athlete_custom_fields
CREATE TRIGGER update_athlete_custom_fields_updated_at
  BEFORE UPDATE ON public.athlete_custom_fields
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();