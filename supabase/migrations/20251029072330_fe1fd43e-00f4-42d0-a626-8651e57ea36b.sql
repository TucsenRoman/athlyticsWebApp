-- Create meets table
CREATE TABLE IF NOT EXISTS public.meets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.meets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches can view own meets" ON public.meets 
  FOR SELECT USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can insert own meets" ON public.meets 
  FOR INSERT WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Coaches can update own meets" ON public.meets 
  FOR UPDATE USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can delete own meets" ON public.meets 
  FOR DELETE USING (auth.uid() = coach_id);

-- Create results table
CREATE TABLE IF NOT EXISTS public.results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL,
  meet_id UUID NOT NULL REFERENCES public.meets(id) ON DELETE CASCADE,
  athlete_id UUID NOT NULL REFERENCES public.athletes(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  mark TEXT NOT NULL,
  place INTEGER,
  is_pr BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches can view own results" ON public.results 
  FOR SELECT USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can insert own results" ON public.results 
  FOR INSERT WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Coaches can update own results" ON public.results 
  FOR UPDATE USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can delete own results" ON public.results 
  FOR DELETE USING (auth.uid() = coach_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_results_athlete_id ON public.results(athlete_id);
CREATE INDEX IF NOT EXISTS idx_results_meet_id ON public.results(meet_id);
CREATE INDEX IF NOT EXISTS idx_meets_date ON public.meets(date DESC);