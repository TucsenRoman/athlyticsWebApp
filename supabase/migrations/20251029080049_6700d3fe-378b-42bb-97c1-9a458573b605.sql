-- Add unique index to ensure locker numbers are unique per coach
CREATE UNIQUE INDEX IF NOT EXISTS uq_lockers_coach_locker
  ON public.lockers(coach_id, locker_number);