ALTER TABLE public.candidates
ADD COLUMN IF NOT EXISTS Introduction text,
ADD COLUMN IF NOT EXISTS projects text[],
ADD COLUMN IF NOT EXISTS initial_claimed_skills text[];