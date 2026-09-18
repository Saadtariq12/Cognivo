ALTER TABLE public.interview_answers
DROP COLUMN IF EXISTS correctness,
ADD COLUMN IF NOT EXISTS topic TEXT,
ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'easy' CHECK (difficulty IN ('easy', 'medium', 'hard'));