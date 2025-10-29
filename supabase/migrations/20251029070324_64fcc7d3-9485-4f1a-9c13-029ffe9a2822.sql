-- Add team_position column to athletes table
ALTER TABLE public.athletes 
ADD COLUMN team_position text DEFAULT 'None' CHECK (team_position IN ('Captain', 'Manager', 'None'));