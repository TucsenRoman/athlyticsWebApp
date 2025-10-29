-- Create uniforms table
CREATE TABLE public.uniforms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES profiles(id),
  top_id TEXT NOT NULL,
  bottom_id TEXT NOT NULL,
  assigned_to TEXT,
  status TEXT NOT NULL DEFAULT 'Checked Out',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.uniforms ENABLE ROW LEVEL SECURITY;

-- Create policies for coach access
CREATE POLICY "Coaches can view own uniforms" 
ON public.uniforms 
FOR SELECT 
USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can insert own uniforms" 
ON public.uniforms 
FOR INSERT 
WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Coaches can update own uniforms" 
ON public.uniforms 
FOR UPDATE 
USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can delete own uniforms" 
ON public.uniforms 
FOR DELETE 
USING (auth.uid() = coach_id);

-- Create function to clear assigned_to when status is "Returned"
CREATE OR REPLACE FUNCTION public.clear_uniform_assignment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'Returned' THEN
    NEW.assigned_to = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for clearing assignment on return
CREATE TRIGGER clear_assignment_on_return
BEFORE UPDATE ON public.uniforms
FOR EACH ROW
EXECUTE FUNCTION public.clear_uniform_assignment();

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_uniforms_updated_at
BEFORE UPDATE ON public.uniforms
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();