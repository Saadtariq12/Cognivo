ALTER TABLE evaluations
ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES interview_sessions(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS move_to_next_topic BOOLEAN default FALSE,
ADD COLUMN IF NOT EXISTS increase_difficulty BOOLEAN default FALSE,
ADD COLUMN IF NOT EXISTS finish_interview BOOLEAN default FALSE;
ADD COLUMN IF NOT EXISTS answer_quality TEXT,
ADD COLUMN IF NOT EXISTS current_interview_stage TEXT CHECK (current_interview_stage IN ('introduction', 'technical', 'projects', 'problem_solving', 'closing'));
COMMENT ON COLUMN evaluations.answer_quality
IS 'To demonstrate candidate''s communication';
