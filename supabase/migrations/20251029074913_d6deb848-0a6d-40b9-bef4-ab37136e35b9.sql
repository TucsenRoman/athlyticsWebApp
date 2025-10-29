-- Create lockers table
CREATE TABLE public.lockers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  athlete_id UUID REFERENCES public.athletes(id) ON DELETE SET NULL,
  locker_number TEXT NOT NULL,
  combination TEXT,
  location TEXT,
  notes TEXT,
  status TEXT CHECK (status IN ('Assigned','Available','Out of Service')) DEFAULT 'Available',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lockers ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Coaches can manage own lockers"
ON public.lockers
FOR ALL 
USING (auth.uid() = coach_id)
WITH CHECK (auth.uid() = coach_id);

-- Add trigger for automatic updated_at timestamp
CREATE TRIGGER update_lockers_updated_at
BEFORE UPDATE ON public.lockers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();