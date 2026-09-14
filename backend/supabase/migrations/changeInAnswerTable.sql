ALTER TABLE public.interview_answers
DROP COLUMN IF EXISTS correctness,
ADD COLUMN IF NOT EXISTS topic TEXT,
ADD COLUMN IF NOT EXISTS difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard'));
