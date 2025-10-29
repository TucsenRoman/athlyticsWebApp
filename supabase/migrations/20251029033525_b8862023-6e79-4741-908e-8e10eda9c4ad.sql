-- Add athlete_id column to uniforms table
ALTER TABLE public.uniforms 
ADD COLUMN athlete_id UUID REFERENCES public.athletes(id) ON DELETE SET NULL;

-- Drop the old trigger and function
DROP TRIGGER IF EXISTS clear_assignment_on_return ON public.uniforms;
DROP FUNCTION IF EXISTS public.clear_uniform_assignment();

-- Create updated function to handle athlete assignment and returns
CREATE OR REPLACE FUNCTION public.handle_uniform_assignment()
RETURNS TRIGGER AS $$
BEGIN
  -- If status is "Returned", clear both athlete_id and assigned_to
  IF NEW.status = 'Returned' THEN
    NEW.athlete_id = NULL;
    NEW.assigned_to = NULL;
  -- If athlete_id is set and not returned, auto-fill assigned_to from athlete name
  ELSIF NEW.athlete_id IS NOT NULL THEN
    SELECT name INTO NEW.assigned_to
    FROM public.athletes
    WHERE id = NEW.athlete_id;
  -- If athlete_id is cleared, clear assigned_to
  ELSIF NEW.athlete_id IS NULL THEN
    NEW.assigned_to = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for uniform assignment handling
CREATE TRIGGER handle_uniform_assignment_trigger
BEFORE INSERT OR UPDATE ON public.uniforms
FOR EACH ROW
EXECUTE FUNCTION public.handle_uniform_assignment();